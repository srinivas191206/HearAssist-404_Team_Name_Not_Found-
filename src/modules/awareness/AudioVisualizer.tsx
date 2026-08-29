import React, { useEffect, useRef, useState } from 'react';
import { soundClassifier } from '../../services/soundClassifier';

export const AudioVisualizer: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [decibels, setDecibels] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    soundClassifier.start((_alert) => {
      setDecibels(65);
    });

    return () => {
      // Clean up callback if needed
    };
  }, [isActive]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
        <span style={{ color: '#94a3b8', fontWeight: 600 }}>Live Audio Spectrum</span>
        <span style={{ color: decibels > 70 ? '#ef4444' : '#5eead4', fontWeight: 700 }}>
          {decibels} dB {decibels > 70 ? '(Loud Noise)' : '(Ambient)'}
        </span>
      </div>

      <div
        style={{
          width: '100%',
          height: '84px',
          backgroundColor: '#020617',
          borderRadius: '12px',
          border: '1px solid var(--border-card)',
          overflow: 'hidden',
          padding: '6px',
        }}
      >
        <canvas ref={canvasRef} width={500} height={72} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
};
