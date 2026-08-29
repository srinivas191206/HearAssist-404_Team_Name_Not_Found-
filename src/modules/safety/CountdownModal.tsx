import React from 'react';
import { AlertTriangle, X, CheckCircle2, RefreshCw, UserPlus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CountdownModal: React.FC = () => {
  const {
    sosState,
    sosCountdownSeconds,
    sosTriggerType,
    cancelSosCountdown,
    resetSosState,
    retrySosDispatch,
    contacts,
    locationData,
    lastRelayoStatus,
    setActiveTab,
  } = useApp();

  if (sosState === 'normal') return null;

  const isCountingDown = sosState === 'countdown' || sosState === 'possible_emergency';
  const isSending = sosState === 'sending';
  const isSent = sosState === 'sent';
  const isCancelled = sosState === 'cancelled';
  const isFailed = sosState === 'failed';
  const isNoContacts = sosState === 'no_contacts';

  // Calculate SVG circular progress ring stroke offset
  const maxSeconds = 9;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.max(0, Math.min(1, sosCountdownSeconds / maxSeconds));
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div
      className="modal-overlay"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(12px)',
        zIndex: 99999,
      }}
    >
      <div
        className="modal-container"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '32px',
          padding: '2.25rem 1.6rem',
          maxWidth: '380px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.85rem',
        }}
      >
        {/* STATE 1: COUNTDOWN / POSSIBLE EMERGENCY (EXACT MATCH FOR REFERENCE IMAGE 1) */}
        {isCountingDown && (
          <>
            {/* Double Concentric Circle Blue Icon Header */}
            <div
              style={{
                width: '86px',
                height: '86px',
                borderRadius: '50%',
                backgroundColor: '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
              }}
            >
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 18px rgba(37, 99, 235, 0.4)',
                }}
              >
                <AlertTriangle size={36} />
              </div>
            </div>

            {/* Title & Subtitle */}
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1.25 }}>
                Emergency triggered
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '6px', margin: 0 }}>
                {sosTriggerType === 'automatic'
                  ? 'Impact / fall keyword detected. Emergency alert in'
                  : 'Emergency alert will be sent in'}
              </p>
            </div>

            {/* Circular Progress Ring with Digit */}
            <div style={{ position: 'relative', width: '130px', height: '130px', margin: '0.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Ring */}
                <circle
                  cx="65"
                  cy="65"
                  r={radius}
                  stroke="#e2e8f0"
                  strokeWidth="10"
                  fill="transparent"
                />
                {/* Blue Progress Ring */}
                <circle
                  cx="65"
                  cy="65"
                  r={radius}
                  stroke="#2563eb"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.8s linear' }}
                />
              </svg>

              <span style={{ position: 'absolute', fontSize: '3.2rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                {sosCountdownSeconds}
              </span>
            </div>

            {/* Cancel Button */}
            <button
              onClick={cancelSosCountdown}
              style={{
                width: '100%',
                height: '52px',
                borderRadius: '30px',
                backgroundColor: '#ffffff',
                border: '1.5px solid #cbd5e1',
                color: '#0f172a',
                fontSize: '1rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.2s ease',
              }}
            >
              <X size={20} /> I'm Safe - Cancel
            </button>

            {/* Footer Disclaimer */}
            <p style={{ fontSize: '0.775rem', color: '#64748b', margin: 0, lineHeight: 1.35, padding: '0 0.5rem' }}>
              If you don't cancel, an emergency alert with your location will be sent to your contacts.
            </p>
          </>
        )}

        {/* STATE 2: CANCELLED */}
        {isCancelled && (
          <>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={40} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              ✓ SOS Cancelled
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
              The emergency alert was stopped. No message was sent to your contacts.
            </p>
            <button className="btn btn-primary" style={{ width: '100%', height: '46px', borderRadius: '14px', marginTop: '0.5rem' }} onClick={resetSosState}>
              I'm Safe (Return to App)
            </button>
          </>
        )}

        {/* STATE 3: SENDING */}
        {isSending && (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
              <RefreshCw size={44} className="pulse-icon text-teal" />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              Sending Emergency SOS...
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
              Dispatched via background SIM SMS to your saved emergency contacts.
            </p>
          </>
        )}

        {/* STATE 4: SENT */}
        {isSent && (
          <>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#e6f4ea', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={40} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--teal-700)', margin: 0 }}>
              ✓ SOS Alert Sent!
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
              Emergency SMS sent directly from your SIM to {contacts.length} contact{contacts.length > 1 ? 's' : ''}.
            </p>

            <div style={{ backgroundColor: '#f8fafc', borderRadius: '14px', padding: '0.75rem 0.9rem', width: '100%', textAlign: 'left', fontSize: '0.8rem', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 800, color: '#0f172a' }}>
                Status: {lastRelayoStatus}
              </div>
              {locationData?.mapsUrl && (
                <a href={locationData.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-700)', textDecoration: 'underline', fontWeight: 700, marginTop: '4px', display: 'block' }}>
                  📍 View Location Link →
                </a>
              )}
            </div>

            <button className="btn btn-primary" style={{ width: '100%', height: '46px', borderRadius: '14px', marginTop: '0.5rem' }} onClick={resetSosState}>
              Back to Home
            </button>
          </>
        )}

        {/* STATE 5: FAILED */}
        {isFailed && (
          <>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#ffebee', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={40} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ef4444', margin: 0 }}>
              SOS Could Not Be Sent
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
              {lastRelayoStatus || 'Check device network or SIM connection.'}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', width: '100%', marginTop: '0.5rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1, height: '44px', borderRadius: '12px' }} onClick={resetSosState}>
                Close
              </button>
              <button className="btn btn-primary" style={{ flex: 1, height: '44px', borderRadius: '12px' }} onClick={retrySosDispatch}>
                Retry SOS
              </button>
            </div>
          </>
        )}

        {/* STATE 6: NO CONTACTS */}
        {isNoContacts && (
          <>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#fff3e0', color: '#f57c00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={40} />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              No Emergency Contact Found
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
              Please add at least 1 emergency contact in Settings.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', width: '100%', marginTop: '0.5rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1, height: '44px', borderRadius: '12px' }} onClick={resetSosState}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1, height: '44px', borderRadius: '12px' }}
                onClick={() => {
                  resetSosState();
                  setActiveTab('safety');
                }}
              >
                Add Contact
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
