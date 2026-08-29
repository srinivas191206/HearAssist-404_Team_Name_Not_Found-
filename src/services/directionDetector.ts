// Direction Detector: Stereo Audio Channel & Spatial Radar Analyzer

import type { SoundDirection } from '../types';

type DirectionCallback = (direction: SoundDirection, angle: number) => void;

class DirectionDetector {
  private activeListening = false;
  private callbacks: Set<DirectionCallback> = new Set();
  private activeDirection: SoundDirection = 'front';

  public startListening(callback: DirectionCallback): void {
    this.callbacks.add(callback);
    this.activeListening = true;
  }

  public stopListening(callback?: DirectionCallback): void {
    if (callback) this.callbacks.delete(callback);
    if (this.callbacks.size === 0) this.activeListening = false;
  }

  public isListening(): boolean {
    return this.activeListening;
  }

  public simulateDirection(direction: SoundDirection): void {
    this.activeDirection = direction;
    let angle = 0;
    switch (direction) {
      case 'front': angle = 0; break;
      case 'right': angle = 90; break;
      case 'behind': angle = 180; break;
      case 'left': angle = 270; break;
      default: angle = 0;
    }
    this.callbacks.forEach((cb) => cb(direction, angle));
  }

  public getActiveDirection(): SoundDirection {
    return this.activeDirection;
  }
}

export const directionDetector = new DirectionDetector();
