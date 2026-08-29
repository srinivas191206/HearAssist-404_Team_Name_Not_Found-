// Sound Classifier & Real-Time Keyword SOS Engine

import type { EnvironmentalAlert, SoundCategory, SoundPriority } from '../types';
import { hapticService } from './hapticService';

type SoundAlertCallback = (alert: EnvironmentalAlert) => void;
type EmergencyKeywordCallback = (keyword: string) => void;

interface CategoryConfig {
  category: SoundCategory;
  displayName: string;
  description: string;
  priority: SoundPriority;
  severity: 'critical' | 'high' | 'medium' | 'info';
  iconName: string;
  hapticPattern: number[];
  confidenceThreshold: number;
}

export const VALIDATED_SOUND_CONFIGS: Record<SoundCategory, CategoryConfig> = {
  siren: {
    category: 'siren',
    displayName: '🚨 SIREN DETECTED',
    description: 'High-pitched emergency siren detected',
    priority: 'high',
    severity: 'critical',
    iconName: 'AlertOctagon',
    hapticPattern: [800, 150, 800, 150, 1000],
    confidenceThreshold: 0.70,
  },
  alarm: {
    category: 'alarm',
    displayName: '⚡ SECURITY ALARM DETECTED',
    description: 'Fire or high-pitched security alarm sounding',
    priority: 'high',
    severity: 'critical',
    iconName: 'ShieldAlert',
    hapticPattern: [800, 150, 800, 150, 1000],
    confidenceThreshold: 0.70,
  },
  horn: {
    category: 'horn',
    displayName: '🚗 CAR HORN DETECTED',
    description: 'Vehicle horn or low-frequency blast',
    priority: 'medium',
    severity: 'high',
    iconName: 'Car',
    hapticPattern: [600, 120, 600, 120, 600],
    confidenceThreshold: 0.70,
  },
  doorbell: {
    category: 'doorbell',
    displayName: '🔔 CALLING BELL / DOORBELL DETECTED',
    description: 'Calling bell or door chime ringing',
    priority: 'low',
    severity: 'medium',
    iconName: 'Bell',
    hapticPattern: [400, 100, 400],
    confidenceThreshold: 0.70,
  },
  knock: {
    category: 'knock',
    displayName: '🚪 DOOR KNOCK DETECTED',
    description: 'Knocking sound nearby',
    priority: 'low',
    severity: 'medium',
    iconName: 'DoorOpen',
    hapticPattern: [350, 80, 350],
    confidenceThreshold: 0.70,
  },
  general: {
    category: 'general',
    displayName: '🔊 IMPORTANT LOUD SOUND DETECTED',
    description: 'Environmental sound spike detected',
    priority: 'low',
    severity: 'info',
    iconName: 'Volume2',
    hapticPattern: [250, 80, 250],
    confidenceThreshold: 0.70,
  },
};

const EMERGENCY_KEYWORDS = ['help', 'emergency', 'save me', 'police', 'danger', 'stop', 'fire'];

class SoundClassifier {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private isListening = false;
  private currentVolume = 0;
  private alertCallback: SoundAlertCallback | null = null;
  private keywordCallback: EmergencyKeywordCallback | null = null;
  private animationFrameId: number | null = null;
  private speechRecognition: any = null;

  private lastAlertTimeByCategory: Map<SoundCategory, number> = new Map();
  private duplicateCooldownMs = 2000; // Fast 2s cooldown between alerts
  private windowHistory: SoundCategory[] = [];

  private mediaStream: MediaStream | null = null;

  public isMonitoring(): boolean {
    return this.isListening;
  }

  public getLiveVolume(): number {
    return this.currentVolume;
  }

  public async start(onAlert: SoundAlertCallback, onKeywordDetected?: EmergencyKeywordCallback): Promise<boolean> {
    this.alertCallback = onAlert;
    this.keywordCallback = onKeywordDetected || null;

    if (this.isListening) return true;

    try {
      if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        return false;
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false },
      });

      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtxClass();
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 1024;
      source.connect(this.analyser);

      this.isListening = true;

      // 1. REAL-TIME SPECTRAL ENERGY BAND ANALYSIS LOOP
      const analyzeLoop = () => {
        if (!this.isListening || !this.analyser) return;

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);

        const lowBins = Math.floor(bufferLength * 0.12);
        const midBins = Math.floor(bufferLength * 0.38);
        const highBins = bufferLength - lowBins - midBins;

        let lowSum = 0;
        let midSum = 0;
        let highSum = 0;
        let sum = 0;

        for (let i = 0; i < bufferLength; i++) {
          const val = dataArray[i];
          sum += val;
          if (i < lowBins) lowSum += val;
          else if (i < lowBins + midBins) midSum += val;
          else highSum += val;
        }

        const avgVol = Math.round(sum / bufferLength);
        const lowAvg = lowSum / Math.max(1, lowBins);
        const midAvg = midSum / Math.max(1, midBins);
        const highAvg = highSum / Math.max(1, highBins);

        this.currentVolume = Math.min(100, Math.round((avgVol / 128) * 100));

        let detectedCat: SoundCategory | null = null;
        let confidence = 0.0;

        if (avgVol > 14) {
          // 1. EMERGENCY SIREN / WHISTLE / ALARM (High-pitched emergency tones)
          if (highAvg > 12 || highAvg > lowAvg * 0.85 || highSum > 80) {
            detectedCat = 'siren';
            confidence = 0.95;
          }
          // 2. CALLING BELL / DOORBELL / CHIME (1kHz - 2.5kHz tones)
          else if (midAvg > lowAvg * 1.05 || midAvg > 18) {
            detectedCat = 'doorbell';
            confidence = 0.88;
          }
          // 3. CAR HORN (Deep low-frequency blast)
          else if (lowAvg > midAvg * 1.5 && lowAvg > 35) {
            detectedCat = 'horn';
            confidence = 0.85;
          }
          // 4. GENERAL LOUD SOUND SPIKE
          else if (avgVol > 20) {
            detectedCat = 'general';
            confidence = 0.78;
          }
        }

        if (detectedCat && confidence >= 0.70) {
          this.processPredictionThroughAlertEngine(detectedCat);
        } else {
          this.windowHistory = [];
        }

        this.animationFrameId = requestAnimationFrame(analyzeLoop);
      };

      analyzeLoop();

      // 2. REAL-TIME KEYWORD-BASED SOS RECOGNITION
      this.initKeywordRecognition();

      return true;
    } catch (err) {
      console.warn('Microphone stream error in soundClassifier:', err);
      return false;
    }
  }

  private initKeywordRecognition() {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    try {
      this.speechRecognition = new SpeechRecognitionClass();
      this.speechRecognition.continuous = true;
      this.speechRecognition.interimResults = true;
      this.speechRecognition.lang = 'en-IN';

      this.speechRecognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript.toLowerCase();
          for (const kw of EMERGENCY_KEYWORDS) {
            if (transcript.includes(kw)) {
              console.warn(`🚨 EMERGENCY KEYWORD DETECTED IN REAL-TIME: "${kw}"`);
              if (this.keywordCallback) {
                this.keywordCallback(kw);
              }
              break;
            }
          }
        }
      };

      this.speechRecognition.onerror = (e: any) => {
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          console.warn('Speech keyword recognition error:', e.error);
        }
      };

      this.speechRecognition.onend = () => {
        if (this.isListening && this.speechRecognition) {
          try {
            this.speechRecognition.start();
          } catch {}
        }
      };

      this.speechRecognition.start();
    } catch (err) {
      console.warn('Keyword recognition setup failed:', err);
    }
  }

  private processPredictionThroughAlertEngine(category: SoundCategory): void {
    this.windowHistory.push(category);
    if (this.windowHistory.length > 2) this.windowHistory.shift();

    const now = Date.now();
    const lastTime = this.lastAlertTimeByCategory.get(category) || 0;
    if (now - lastTime < this.duplicateCooldownMs) return;

    this.lastAlertTimeByCategory.set(category, now);

    const config = VALIDATED_SOUND_CONFIGS[category] || VALIDATED_SOUND_CONFIGS.general;

    const soundEvent: EnvironmentalAlert = {
      id: `alert-${Date.now()}`,
      category,
      title: config.displayName,
      description: config.description,
      severity: config.severity,
      timestamp: now,
      iconName: config.iconName,
    };

    if (hapticService.isSupported()) {
      try {
        hapticService.triggerHighIntensitySoundVibration(config.severity);
      } catch {}
    }

    if (this.alertCallback) {
      this.alertCallback(soundEvent);
    }
  }

  public stop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.mediaStream) {
      try {
        this.mediaStream.getTracks().forEach((track) => track.stop());
      } catch {}
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
    if (this.speechRecognition) {
      try {
        this.speechRecognition.stop();
      } catch {}
      this.speechRecognition = null;
    }
    this.analyser = null;
    this.isListening = false;
    this.currentVolume = 0;
    this.windowHistory = [];
  }

  public simulateAlert(category: SoundCategory = 'siren'): void {
    const config = VALIDATED_SOUND_CONFIGS[category] || VALIDATED_SOUND_CONFIGS.siren;

    const soundEvent: EnvironmentalAlert = {
      id: `sim-alert-${Date.now()}`,
      category,
      title: config.displayName,
      description: config.description,
      severity: config.severity,
      timestamp: Date.now(),
      iconName: config.iconName,
    };

    if (hapticService.isSupported()) {
      try {
        hapticService.triggerHighIntensitySoundVibration(config.severity);
      } catch {}
    }

    if (this.alertCallback) {
      this.alertCallback(soundEvent);
    }
  }
}

export const soundClassifier = new SoundClassifier();
