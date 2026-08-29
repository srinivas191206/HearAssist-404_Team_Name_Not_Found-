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

  constructor() {
    this.initRecognition();
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as IWindowSpeech;
    return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
  }

  private safeRestart(): void {
    if (this.restartTimeout) clearTimeout(this.restartTimeout);
    if (this.status !== 'listening') return;

    this.restartTimeout = setTimeout(() => {
      if (this.status === 'listening' && this.recognition) {
        try {
          this.recognition.start();
        } catch (e) {
          // If already running, ignore error
        }
      }
    }, 250);
  }

  private initRecognition(): void {
    if (!this.isSupported()) return;

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
        this.safeRestart();
      } else if (this.status !== 'paused') {
        this.status = 'stopped';
        if (this.onStatusCb) this.onStatusCb('stopped');
      }
    };

    this.recognition.onerror = (event: any) => {
      if (event.error === 'aborted' || event.error === 'no-speech' || event.error === 'network') {
        if (this.status === 'listening') {
          this.safeRestart();
        }
        return;
      }

      console.warn('Speech recognition error:', event.error);
      if (this.onErrorCb) {
        this.onErrorCb(`Microphone status (${event.error})`);
      }
    };

    // PROVEN STANDARD WEB SPEECH API STT PARSER WITH SILENCE COMMIT TIMEOUT
    let silenceTimer: any = null;

    this.recognition.onresult = (event: any) => {
      if (!event.results) return;

      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = 0; i < event.results.length; ++i) {
        const item = event.results[i];
        if (!item || !item[0]) continue;
        if (item.isFinal) {
          finalTranscript += item[0].transcript + ' ';
        } else {
          interimTranscript += item[0].transcript + ' ';
        }
      }

      if (interimTranscript.trim()) {
        const partialStr = interimTranscript.trim();
        if (this.onPartialCb) this.onPartialCb(partialStr);

        // SILENCE COMMIT TIMER (1200ms of no new speech commits sentence in-place)
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
        const cleanText = finalTranscript.trim();
        const sha256Hash = computeSha256Sync(cleanText);
        this.lastFinalText = cleanText;
        if (this.onFinalCb) this.onFinalCb(cleanText, sha256Hash);
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

    if (!this.recognition) {
      if (onError) onError('Speech Recognition is not supported on this device.');
      return false;
    }

    try {
      this.status = 'listening';
      if (this.onStatusCb) this.onStatusCb('listening');
      
      try {
        this.recognition.stop();
      } catch {}

      setTimeout(() => {
        try {
          if (this.status === 'listening' && this.recognition) {
            this.recognition.start();
          }
        } catch (e: any) {
          if (e.name !== 'InvalidStateError') {
            console.warn('Speech start warning:', e);
          }
        }
      }, 150);

      return true;
    } catch (e: any) {
      console.error('Failed to start recognition', e);
      return false;
    }
  }

  public stopListening(): void {
    if (this.restartTimeout) clearTimeout(this.restartTimeout);
    if (this.recognition && this.status !== 'stopped') {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Error stopping recognition', e);
      }
    }
    this.status = 'stopped';
    if (this.onStatusCb) this.onStatusCb('stopped');
  }

  public pauseListening(): void {
    if (this.restartTimeout) clearTimeout(this.restartTimeout);
    if (this.recognition && this.status === 'listening') {
      try {
        this.recognition.stop();
      } catch {}
      this.status = 'paused';
      if (this.onStatusCb) this.onStatusCb('paused');
    }
  }

  public resumeListening(): void {
    if (this.recognition && this.status === 'paused') {
      try {
        this.status = 'listening';
        if (this.onStatusCb) this.onStatusCb('listening');
        this.recognition.start();
      } catch (e) {
        console.error('Error resuming recognition', e);
      }
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
