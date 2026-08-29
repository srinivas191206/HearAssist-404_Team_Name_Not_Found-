import React, { useEffect } from 'react';
import { AlertOctagon, Bell, Car, DoorOpen, ShieldAlert, Volume2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { hapticService } from '../../services/hapticService';

export const AlertBanner: React.FC = () => {
  const { activeAlert, dismissActiveAlert } = useApp();

  useEffect(() => {
    if (activeAlert) {
      // Trigger Heavy Vibration on Sound Alert Detection
      hapticService.triggerHighIntensitySoundVibration(activeAlert.severity);

      // Auto-dismiss alert banner after 6 seconds
      const timer = setTimeout(() => {
        dismissActiveAlert();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [activeAlert, dismissActiveAlert]);

  if (!activeAlert) return null;

  const isCritical = activeAlert.severity === 'critical';
  const isHigh = activeAlert.severity === 'high';

  const renderIcon = () => {
    switch (activeAlert.category) {
      case 'siren':
        return <AlertOctagon size={32} />;
      case 'alarm':
        return <ShieldAlert size={32} />;
      case 'horn':
        return <Car size={32} />;
      case 'doorbell':
        return <Bell size={32} />;
      case 'knock':
        return <DoorOpen size={32} />;
      default:
        return <Volume2 size={32} />;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '0.75rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 1.5rem)',
        maxWidth: '440px',
        backgroundColor: isCritical ? '#dc2626' : isHigh ? '#d97706' : 'var(--teal-700)',
        color: '#ffffff',
        borderRadius: '20px',
        padding: '1.1rem 1.25rem',
        boxShadow: isCritical ? '0 12px 40px rgba(220, 38, 38, 0.6)' : '0 10px 30px rgba(13, 148, 136, 0.4)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        animation: 'slide-down 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {renderIcon()}
        </div>

        <div>
          <div style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '0.03em', textTransform: 'uppercase', lineHeight: 1.2 }}>
            {activeAlert.title}
          </div>
          <div style={{ fontSize: '0.825rem', color: 'rgba(255, 255, 255, 0.95)', marginTop: '3px', fontWeight: 600 }}>
            {activeAlert.description}
          </div>
        </div>
      </div>

      <button
        onClick={dismissActiveAlert}
        style={{
          background: 'none',
          border: 'none',
          color: '#ffffff',
          cursor: 'pointer',
          padding: '0.4rem',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          flexShrink: 0,
        }}
        aria-label="Dismiss alert"
      >
        <X size={22} />
      </button>
    </div>
  );
};
