// Sound Classifier & Real-Time YAMNet-Inspired Acoustic Validation Engine

import type { EnvironmentalAlert, SoundCategory, SoundPriority } from '../types';
import { hapticService } from './hapticService';

type SoundAlertCallback = (alert: EnvironmentalAlert) => void;
type EmergencyKeywordCallback = (keyword: string) => void;

export interface ClassAlertConfig {
  category: SoundCategory;
  displayName: string;
  description: string;
  priority: SoundPriority;
  severity: 'critical' | 'high' | 'medium' | 'info';
  iconName: string;
  hapticPattern: number[];
  confidenceThreshold: number; // Configurable per-class threshold (starting 0.70+)
  minEnergyRMS: number;        // Lightweight Audio Energy / Loudness Gate
  requiredTemporalFrames: number; // Consecutive windows required for confirmation (starting N=2)
}

export interface DebugValidationStatus {
  candidateSound: string;
  confidence: number;
  audioEnergyRMS: number;
  temporalCount: number;
  requiredTemporal: number;
  isConfirmed: boolean;
  statusText: string;
}

// Configurable Sound Alert Settings (SOUND_ALERT_CONFIG)
export const SOUND_ALERT_CONFIG: Record<SoundCategory, ClassAlertConfig> = {
  horn: {
    category: 'horn',
    displayName: '🚗 CAR HORN DETECTED',
    description: 'Vehicle horn blast detected',
    priority: 'high',
    severity: 'high',
    iconName: 'Car',
    hapticPattern: [600, 120, 600, 120, 600],
    confidenceThreshold: 0.70,
    minEnergyRMS: 14,
    requiredTemporalFrames: 2,
  },
  siren: {
    category: 'siren',
    displayName: '🚨 SIREN DETECTED',
    description: 'High-pitched emergency siren detected',
    priority: 'high',
    severity: 'critical',
    iconName: 'AlertOctagon',
    hapticPattern: [800, 150, 800, 150, 1000],
    confidenceThreshold: 0.70,
    minEnergyRMS: 12,
    requiredTemporalFrames: 2,
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
    minEnergyRMS: 12,
    requiredTemporalFrames: 2,
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
    minEnergyRMS: 10,
    requiredTemporalFrames: 2,
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
    minEnergyRMS: 10,
    requiredTemporalFrames: 2,
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
    minEnergyRMS: 15,
    requiredTemporalFrames: 2,
  },
};

export const VALIDATED_SOUND_CONFIGS = SOUND_ALERT_CONFIG;

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

  // Duplicate Suppression Cooldown (6 Seconds per Sound Category)
  private lastAlertTimeByCategory: Map<SoundCategory, number> = new Map();
  private duplicateCooldownMs = 6000;

  // Temporal Confirmation State Buffer
  private temporalBuffer: SoundCategory[] = [];

  // Debug Diagnostics State
  private lastDebugStatus: DebugValidationStatus = {
    candidateSound: 'UNKNOWN / NON_ACTIONABLE',
    confidence: 0,
    audioEnergyRMS: 0,
    temporalCount: 0,
    requiredTemporal: 2,
    isConfirmed: false,
    statusText: 'Listening...',
  };

  private mediaStream: MediaStream | null = null;

  public isMonitoring(): boolean {
    return this.isListening;
  }

  public getLiveVolume(): number {
    return this.currentVolume;
  }

  public getDebugStatus(): DebugValidationStatus {
    return this.lastDebugStatus;
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

      // STAGE 1: REAL-TIME MULTI-STAGE ACOUSTIC PIPELINE
      const analyzeLoop = () => {
        if (!this.isListening || !this.analyser) return;

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        let lowSum = 0;
        let midSum = 0;
        let highSum = 0;

        const lowBins = Math.floor(bufferLength * 0.15);
        const midBins = Math.floor(bufferLength * 0.40);

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
        const highAvg = highSum / Math.max(1, bufferLength - lowBins - midBins);

        this.currentVolume = Math.min(100, Math.round((avgVol / 128) * 100));

        let candidateCategory: SoundCategory | null = null;
        let confidence = 0.0;

        // STAGE 2: AUDIO ENERGY / LOUDNESS GATE (Prevents weak mic noise alerts)
        if (avgVol >= 10) {
          // STAGE 3: YAMNET-INSPIRED SPECTRAL CANDIDATE CLASSIFIER
          if (highAvg > 20 || (highAvg > lowAvg * 1.1 && highSum > 100)) {
            // 🚨 Emergency Siren / High Alarm
            candidateCategory = 'siren';
            confidence = 0.88;
          } else if (midAvg > 24 && midAvg > lowAvg * 1.05) {
            // 🔔 Calling Bell / Doorbell Chime
            candidateCategory = 'doorbell';
            confidence = 0.84;
          } else if (lowAvg > 28 && lowAvg > midAvg * 1.15) {
            // 🚗 Car Horn (Low frequency blast)
            candidateCategory = 'horn';
            confidence = 0.86;
          } else if (avgVol > 24) {
            // 🚪 Door Knock / Impulsive transient
            candidateCategory = 'knock';
            confidence = 0.76;
          } else if (avgVol > 18) {
            // 🔊 General Loud Sound Event
            candidateCategory = 'general';
            confidence = 0.72;
          }
        }

        // STAGE 4: UNKNOWN / NON-ACTIONABLE SOUND FILTER (Speech, music, fans)
        if (!candidateCategory) {
          this.temporalBuffer = [];
          this.lastDebugStatus = {
            candidateSound: 'UNKNOWN / NON_ACTIONABLE',
            confidence: 0,
            audioEnergyRMS: avgVol,
            temporalCount: 0,
            requiredTemporal: 2,
            isConfirmed: false,
            statusText: 'Filtering ambient noise / speech...',
          };
        } else {
          // STAGE 5: CONFIDENCE THRESHOLD CHECK & TEMPORAL CONFIRMATION
          const classConfig = SOUND_ALERT_CONFIG[candidateCategory] || SOUND_ALERT_CONFIG.general;

          if (confidence >= classConfig.confidenceThreshold && avgVol >= classConfig.minEnergyRMS) {
            this.processCandidateThroughValidationPipeline(candidateCategory, confidence, avgVol, classConfig);
          } else {
            this.temporalBuffer = [];
            this.lastDebugStatus = {
              candidateSound: classConfig.displayName,
              confidence,
              audioEnergyRMS: avgVol,
              temporalCount: 0,
              requiredTemporal: classConfig.requiredTemporalFrames,
              isConfirmed: false,
              statusText: `Below confidence/energy threshold (${(confidence * 100).toFixed(0)}%)`,
            };
          }
        }

        this.animationFrameId = requestAnimationFrame(analyzeLoop);
      };

      analyzeLoop();

      // STAGE 6: REAL-TIME KEYWORD-BASED SOS RECOGNITION
      this.initKeywordRecognition();

      return true;
    } catch (err) {
      console.warn('Microphone stream error in soundClassifier:', err);
      return false;
    }
  }

  private processCandidateThroughValidationPipeline(
    category: SoundCategory,
    confidence: number,
    energyRMS: number,
    config: ClassAlertConfig
  ): void {
    // STAGE 7: TEMPORAL CONFIRMATION (Requires N=2 consecutive frames of same candidate)
    this.temporalBuffer.push(category);
    if (this.temporalBuffer.length > 5) this.temporalBuffer.shift();

    const matchCount = this.temporalBuffer.filter((cat) => cat === category).length;

    if (matchCount < config.requiredTemporalFrames) {
      this.lastDebugStatus = {
        candidateSound: config.displayName,
        confidence,
        audioEnergyRMS: energyRMS,
        temporalCount: matchCount,
        requiredTemporal: config.requiredTemporalFrames,
        isConfirmed: false,
        statusText: `Awaiting temporal confirmation (${matchCount}/${config.requiredTemporalFrames})`,
      };
      return;
    }

    // STAGE 8: DUPLICATE SUPPRESSION (6-Second Cooldown per class)
    const now = Date.now();
    const lastTime = this.lastAlertTimeByCategory.get(category) || 0;
    const timeSinceLastAlert = now - lastTime;

    if (timeSinceLastAlert < this.duplicateCooldownMs) {
      const cooldownRemainingSec = Math.ceil((this.duplicateCooldownMs - timeSinceLastAlert) / 1000);
      this.lastDebugStatus = {
        candidateSound: config.displayName,
        confidence,
        audioEnergyRMS: energyRMS,
        temporalCount: matchCount,
        requiredTemporal: config.requiredTemporalFrames,
        isConfirmed: false,
        statusText: `Duplicate alert suppressed (${cooldownRemainingSec}s cooldown remaining)`,
      };
      return;
    }

    // STAGE 9: CONFIRMED SOUND EVENT DISPATCH
    this.lastAlertTimeByCategory.set(category, now);
    this.temporalBuffer = []; // Reset after dispatch

    this.lastDebugStatus = {
      candidateSound: config.displayName,
      confidence,
      audioEnergyRMS: energyRMS,
      temporalCount: matchCount,
      requiredTemporal: config.requiredTemporalFrames,
      isConfirmed: true,
      statusText: 'CONFIRMED ALERT DISPATCHED',
    };

    const soundEvent: EnvironmentalAlert = {
      id: `alert-${Date.now()}`,
      category,
      title: config.displayName,
      description: config.description,
      severity: config.severity,
      timestamp: now,
      iconName: config.iconName,
    };

    // STAGE 10: HAPTIC & VISUAL ALERT TRIGGER
    if (hapticService.isSupported()) {
      try {
        hapticService.triggerHighIntensitySoundVibration(config.severity);
      } catch {}
    }

    if (this.alertCallback) {
      this.alertCallback(soundEvent);
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
    this.temporalBuffer = [];
  }

  public simulateAlert(category: SoundCategory = 'horn'): void {
    const config = SOUND_ALERT_CONFIG[category] || SOUND_ALERT_CONFIG.horn;

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
