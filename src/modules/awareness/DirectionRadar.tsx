import React, { useState } from 'react';
import { Navigation, Compass } from 'lucide-react';
import type { SoundDirection } from '../../types';

export const DirectionRadar: React.FC = () => {
  const [direction, setDirection] = useState<SoundDirection>('front');

  const getActiveColor = (dir: SoundDirection) => {
    return direction === dir ? '#14b8a6' : 'rgba(148, 163, 184, 0.2)';
  };

  const getTextColor = (dir: SoundDirection) => {
    return direction === dir ? '#5eead4' : '#64748b';
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Compass size={18} className="text-teal" /> Directional Sound Detection (Technical Validation)
        </h3>
        <span className="badge badge-teal">Stereo Analysis</span>
      </div>

      {/* Visual Spatial Radar Ring */}
      <div
        style={{
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          border: '2px dashed var(--slate-700)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#020617',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)',
        }}
      >
        {/* Center User Node */}
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--teal-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.75rem',
            zIndex: 10,
            boxShadow: 'var(--shadow-glow-teal)',
          }}
        >
          YOU
        </div>

        {/* FRONT */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            padding: '4px 14px',
            borderRadius: '12px',
            backgroundColor: getActiveColor('front'),
            color: getTextColor('front'),
            fontWeight: 700,
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Navigation size={12} style={{ transform: 'rotate(0deg)' }} /> FRONT
        </div>

        {/* BEHIND */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            padding: '4px 14px',
            borderRadius: '12px',
            backgroundColor: getActiveColor('behind'),
            color: getTextColor('behind'),
            fontWeight: 700,
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Navigation size={12} style={{ transform: 'rotate(180deg)' }} /> BEHIND
        </div>

        {/* LEFT */}
        <div
          style={{
            position: 'absolute',
            left: '10px',
            padding: '4px 14px',
            borderRadius: '12px',
            backgroundColor: getActiveColor('left'),
            color: getTextColor('left'),
            fontWeight: 700,
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Navigation size={12} style={{ transform: 'rotate(-90deg)' }} /> LEFT
        </div>

        {/* RIGHT */}
        <div
          style={{
            position: 'absolute',
            right: '10px',
            padding: '4px 14px',
            borderRadius: '12px',
            backgroundColor: getActiveColor('right'),
            color: getTextColor('right'),
            fontWeight: 700,
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          RIGHT <Navigation size={12} style={{ transform: 'rotate(90deg)' }} />
        </div>
      </div>

      {/* Direction Simulator Buttons for Testing */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
        {(['front', 'left', 'right', 'behind'] as SoundDirection[]).map((dir) => (
          <button
            key={dir}
            className={`btn ${direction === dir ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
            onClick={() => setDirection(dir)}
          >
            Test {dir.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};
