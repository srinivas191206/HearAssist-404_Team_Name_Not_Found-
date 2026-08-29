// Haptic Service: Tactile & Strong Vibration Alert Engine

class HapticService {
  private countdownTimer: ReturnType<typeof setInterval> | null = null;

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  public vibrate(pattern: number[] | number): void {
    if (!this.isSupported()) return;
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.warn('Haptic vibration error:', e);
    }
  }

  // HIGH-INTENSITY SOUND ALERT VIBRATION (FOR DEAF/HARD-OF-HEARING ATTENTION)
  public triggerHighIntensitySoundVibration(severity: 'critical' | 'high' | 'medium' | 'info' = 'high'): void {
    if (!this.isSupported()) return;
    this.stopVibration();

    let pattern: number[];
    switch (severity) {
      case 'critical':
        // Heavy 3-pulse burst: 800ms ON, 150ms OFF, 800ms ON, 150ms OFF, 1000ms ON
        pattern = [800, 150, 800, 150, 1000];
        break;
      case 'high':
        // Strong 3-pulse burst: 600ms ON, 120ms OFF, 600ms ON, 120ms OFF, 600ms ON
        pattern = [600, 120, 600, 120, 600];
        break;
      case 'medium':
        // Double pulse: 400ms ON, 100ms OFF, 400ms ON
        pattern = [400, 100, 400];
        break;
      case 'info':
      default:
        pattern = [250, 80, 250];
        break;
    }

    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.warn('Haptic error:', e);
    }
  }

  // Strong attention-grabbing countdown vibration (Escalating urgency 5s -> 1s)
  public startEmergencyCountdownHaptics(currentSeconds: number): void {
    if (!this.isSupported()) return;

    this.stopVibration();

    const pulseDuration = Math.max(150, 400 - (5 - currentSeconds) * 50);
    const pauseDuration = Math.max(100, 300 - (5 - currentSeconds) * 40);

    try {
      navigator.vibrate([pulseDuration, pauseDuration, pulseDuration]);
    } catch (e) {
      console.warn('Haptic error:', e);
    }
  }

  public notifyCancelled(): void {
    if (!this.isSupported()) return;
    this.stopVibration();
    try {
      navigator.vibrate([100, 50, 100]);
    } catch {}
  }

  public notifyDispatched(): void {
    if (!this.isSupported()) return;
    this.stopVibration();
    try {
      navigator.vibrate([600, 150, 600, 150, 800]);
    } catch {}
  }

  public stopVibration(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    if (this.isSupported()) {
      try {
        navigator.vibrate(0);
      } catch {}
    }
  }
}

export const hapticService = new HapticService();
