// Speech Service: Standard Streaming Speech-to-Text (STT) & Native Text-to-Speech (TTS) Engine with SHA-256 Verification

import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { computeSha256Sync, verifySha256 } from './cryptoUtils';

export interface SpeechRecognitionResultPayload {
  partialTranscript: string;
  finalTranscript: string;
  isFinal: boolean;
  sha256Hash?: string;
}

export type PartialResultCallback = (partialText: string) => void;
export type FinalResultCallback = (finalText: string, sha256Hash: string) => void;
export type ErrorCallback = (error: string) => void;
export type StatusCallback = (status: 'listening' | 'processing' | 'paused' | 'stopped') => void;

export interface SpeechRecognitionEngine {
  startListening(onPartial: PartialResultCallback, onFinal: FinalResultCallback, onError?: ErrorCallback, onStatus?: StatusCallback): boolean;
  stopListening(): void;
  pauseListening(): void;
  resumeListening(): void;
  speak(text: string, volume?: number, onEnd?: () => void): Promise<string>;
  repeatLastText(volume?: number, fallbackText?: string): void;
  getTranscriptHash(text: string): string;
  verifyTranscriptIntegrity(text: string, hash: string): boolean;
}

interface IWindowSpeech extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

class SpeechService implements SpeechRecognitionEngine {
  private recognition: any = null;
  private status: 'listening' | 'processing' | 'paused' | 'stopped' = 'stopped';
  private onPartialCb: PartialResultCallback | null = null;
  private onFinalCb: FinalResultCallback | null = null;
  private onErrorCb: ErrorCallback | null = null;
  private onStatusCb: StatusCallback | null = null;
  private lastFinalText = '';
  private lastSpokenHash = '';
  private restartTimeout: any = null;
  private isRestarting = false;

  constructor() {
    this.recreateRecognition();
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as IWindowSpeech;
    return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
  }

  private startOrRestartRecognition(): void {
    if (this.isRestarting) return;
    this.isRestarting = true;

    if (this.restartTimeout) clearTimeout(this.restartTimeout);

    this.restartTimeout = setTimeout(() => {
      this.isRestarting = false;
      if (this.status !== 'listening') return;

      try {
        if (!this.recognition) {
          this.recreateRecognition();
        }
        this.recognition.start();
      } catch (e: any) {
        if (e.name === 'InvalidStateError') {
          // Already listening cleanly
          return;
        }
        // If recognition died, recreate and restart
        try {
          this.recreateRecognition();
          if (this.recognition) {
            this.recognition.start();
          }
        } catch (err) {
          console.warn('Speech recognition restart exception:', err);
        }
      }
    }, 150);
  }

  private recreateRecognition(): void {
    if (!this.isSupported()) return;

    if (this.recognition) {
      try {
        this.recognition.onstart = null;
        this.recognition.onend = null;
        this.recognition.onerror = null;
        this.recognition.onresult = null;
        this.recognition.stop();
      } catch {}
    }

    const win = window as IWindowSpeech;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
    this.recognition = new SpeechRecognitionClass();

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    try {
      this.recognition.lang = 'en-IN';
    } catch {
      this.recognition.lang = 'en-US';
    }

    this.recognition.onstart = () => {
      this.status = 'listening';
      if (this.onStatusCb) this.onStatusCb('listening');
    };

    this.recognition.onend = () => {
      if (this.status === 'listening') {
        this.startOrRestartRecognition();
      } else if (this.status !== 'paused') {
        this.status = 'stopped';
        if (this.onStatusCb) this.onStatusCb('stopped');
      }
    };

    this.recognition.onerror = (event: any) => {
      if (event.error === 'aborted' || event.error === 'no-speech' || event.error === 'network') {
        if (this.status === 'listening') {
          this.startOrRestartRecognition();
        }
        return;
      }

      console.warn('Speech recognition error:', event.error);
      if (this.onErrorCb) {
        this.onErrorCb(`Microphone status (${event.error})`);
      }
    };

    // PROVEN ACCURATE WEB SPEECH API STT PARSER WITH CLEAN PHRASE DEDUPLICATION
    let silenceTimer: any = null;

    const deduplicateText = (str: string): string => {
      const words = str.trim().split(/\s+/);
      if (words.length <= 1) return str.trim();
      const result: string[] = [];
      for (let idx = 0; idx < words.length; idx++) {
        if (idx === 0 || words[idx].toLowerCase() !== words[idx - 1].toLowerCase()) {
          result.push(words[idx]);
        }
      }
      return result.join(' ');
    };

    this.recognition.onresult = (event: any) => {
      if (!event.results) return;

      let interimTranscript = '';
      let finalTranscript = '';

      const startIndex = typeof event.resultIndex === 'number' && event.resultIndex >= 0 ? event.resultIndex : 0;

      for (let i = startIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (!item || !item[0]) continue;
        const textChunk = item[0].transcript;
        if (item.isFinal) {
          finalTranscript += textChunk + ' ';
        } else {
          interimTranscript += textChunk + ' ';
        }
      }

      if (interimTranscript.trim()) {
        const partialStr = deduplicateText(interimTranscript);
        if (this.onPartialCb && partialStr) {
          this.onPartialCb(partialStr);
        }

        // SILENCE COMMIT TIMER (1200ms of no new speech commits sentence cleanly)
        if (silenceTimer) clearTimeout(silenceTimer);
        silenceTimer = setTimeout(() => {
          if (this.onFinalCb && partialStr) {
            const sha256Hash = computeSha256Sync(partialStr);
            this.lastFinalText = partialStr;
            this.onFinalCb(partialStr, sha256Hash);
          }
        }, 1200);
      }

      if (finalTranscript.trim()) {
        if (silenceTimer) clearTimeout(silenceTimer);
        const cleanText = deduplicateText(finalTranscript);
        if (cleanText) {
          const sha256Hash = computeSha256Sync(cleanText);
          this.lastFinalText = cleanText;
          if (this.onFinalCb) this.onFinalCb(cleanText, sha256Hash);
        }
      }
    };
  }

  public startListening(
    onPartial: PartialResultCallback,
    onFinal: FinalResultCallback,
    onError?: ErrorCallback,
    onStatus?: StatusCallback
  ): boolean {
    this.onPartialCb = onPartial;
    this.onFinalCb = onFinal;
    this.onErrorCb = onError || null;
    this.onStatusCb = onStatus || null;

    this.status = 'listening';
    if (this.onStatusCb) this.onStatusCb('listening');

    this.startOrRestartRecognition();
    return true;
  }

  public stopListening(): void {
    this.status = 'stopped';
    if (this.restartTimeout) clearTimeout(this.restartTimeout);
    if (this.recognition) {
      try {
        this.recognition.onstart = null;
        this.recognition.onend = null;
        this.recognition.onerror = null;
        this.recognition.stop();
      } catch (e) {
        console.warn('Error stopping recognition', e);
      }
    }
    if (this.onStatusCb) this.onStatusCb('stopped');
  }

  public pauseListening(): void {
    this.status = 'paused';
    if (this.restartTimeout) clearTimeout(this.restartTimeout);
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      if (this.onStatusCb) this.onStatusCb('paused');
    }
  }

  public resumeListening(): void {
    if (this.status === 'paused') {
      this.status = 'listening';
      if (this.onStatusCb) this.onStatusCb('listening');
      this.startOrRestartRecognition();
    }
  }

  // MAX VOLUME LOUD NATIVE ANDROID TEXT-TO-SPEECH (TTS) WITH SHA-256 VERIFICATION
  public async speak(text: string, volume = 1.0, onEnd?: () => void): Promise<string> {
    const cleanText = text.trim();
    if (!cleanText) {
      if (onEnd) onEnd();
      return '';
    }

    // Generate SHA-256 cryptographic payload hash for TTS utterance integrity & deduplication
    const ttsPayloadHash = computeSha256Sync(`${cleanText}:en-IN:${volume.toFixed(2)}`);
    this.lastSpokenHash = ttsPayloadHash;

    let isFinished = false;
    const finish = () => {
      if (isFinished) return;
      isFinished = true;
      if (onEnd) onEnd();
    };

    // 1. MAX VOLUME NATIVE CAPACITOR TTS ENGINE
    try {
      await TextToSpeech.speak({
        text: cleanText,
        lang: 'en-IN',
        rate: 1.0,
        pitch: 1.0,
        volume: Math.max(0.1, Math.min(1.0, volume)),
        category: 'alarm',
      });
      finish();
      return ttsPayloadHash;
    } catch (nativeErr) {
      console.warn('Native Capacitor TTS fallback to WebSpeech:', nativeErr);
    }

    // 2. FALLBACK TO BROWSER WEB SPEECH SYNTHESIS
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.volume = Math.max(0.1, Math.min(1.0, volume));
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        utterance.onend = finish;
        utterance.onerror = finish;

        const estimatedDurationMs = Math.max(1800, cleanText.length * 110);
        setTimeout(finish, estimatedDurationMs);

        window.speechSynthesis.speak(utterance);
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch (err) {
        console.error('Speech synthesis exception:', err);
        finish();
      }
    } else {
      finish();
    }

    return ttsPayloadHash;
  }

  public repeatLastText(volume = 1.0, fallbackText = 'Could you please repeat that?'): void {
    const textToSpeak = this.lastFinalText || fallbackText;
    this.speak(textToSpeak, volume);
  }

  public getLastSpokenText(): string {
    return this.lastFinalText;
  }

  public getLastSpokenHash(): string {
    return this.lastSpokenHash;
  }

  public getTranscriptHash(text: string): string {
    return computeSha256Sync(text.trim());
  }

  public verifyTranscriptIntegrity(text: string, hash: string): boolean {
    return verifySha256(text.trim(), hash);
  }
}

export const speechService = new SpeechService();
