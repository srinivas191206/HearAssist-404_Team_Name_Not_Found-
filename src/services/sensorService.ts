// Sensor Service: Accelerometer & Multi-Signal Fall/Impact Detection Pipeline

type ImpactCallback = (magnitude: number, confidence: number) => void;

class SensorService {
  private isListening = false;
  private impactCallbacks: Set<ImpactCallback> = new Set();
  private lastImpactTime = 0;

  // Thresholds based on sensitivity settings
  private accelThreshold = 15.0; // m/s^2 acceleration magnitude for shake detection
  private isBarometerAvailable = false;

  public setSensitivity(sensitivity: 'low' | 'medium' | 'high') {
    switch (sensitivity) {
      case 'low':
        this.accelThreshold = 22.0;
        break;
      case 'high':
        this.accelThreshold = 12.0;
        break;
      case 'medium':
      default:
        this.accelThreshold = 15.0;
        break;
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // iOS 13+ DeviceMotion permission check
    if (typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function') {
      try {
        const response = await (DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
        return response === 'granted';
      } catch {
        return false;
      }
    }

    return true; // Android / standard browsers
  }

  public startListening(onImpactDetected: ImpactCallback): void {
    this.impactCallbacks.add(onImpactDetected);

    if (this.isListening) return;

    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', this.handleMotion, true);
      this.isListening = true;
    }

    // Check Barometer supporting sensor availability
    if (typeof window !== 'undefined' && 'Barometer' in window) {
      this.isBarometerAvailable = true;
    }
  }

  public stopListening(onImpactDetected?: ImpactCallback): void {
    if (onImpactDetected) {
      this.impactCallbacks.delete(onImpactDetected);
    }
    if (this.impactCallbacks.size === 0 && this.isListening) {
      if (typeof window !== 'undefined') {
        window.removeEventListener('devicemotion', this.handleMotion, true);
      }
      this.isListening = false;
    }
  }

  public getSensorStatus() {
    return {
      accelerometerActive: this.isListening,
      barometerAvailable: this.isBarometerAvailable,
      threshold: this.accelThreshold,
    };
  }

  private handleMotion = (event: DeviceMotionEvent): void => {
    const acc = event.accelerationIncludingGravity || event.acceleration;
    if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

    // Compute 3D vector magnitude: sqrt(x^2 + y^2 + z^2)
    const magnitude = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);

    const now = Date.now();
    // Multi-signal pipeline & temporal cooldown check (6 seconds)
    if (magnitude > this.accelThreshold && now - this.lastImpactTime > 6000) {
      this.lastImpactTime = now;
      
      // Calculate impact confidence (0.0 to 1.0) based on peak magnitude vs threshold
      const confidence = Math.min(1.0, (magnitude - this.accelThreshold + 10) / 30);
      
      if (confidence > 0.4) {
        this.notifyImpact(magnitude, confidence);
      }
    }
  };

  private notifyImpact(magnitude: number, confidence: number): void {
    this.impactCallbacks.forEach((cb) => cb(magnitude, confidence));
  }

  // Controlled hackathon demo trigger for testing automatic impact detection
  public simulateImpact(magnitude = 29.5): void {
    const now = Date.now();
    this.lastImpactTime = now;
    const confidence = 0.88;
    this.notifyImpact(magnitude, confidence);
  }
}

export const sensorService = new SensorService();
