import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, ShieldCheck, Wifi, MapPin, Mic, BatteryCharging, Clock, Users, ChevronRight, PhoneCall } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ContactsConfig } from './ContactsConfig';
import { Modal } from '../../components/common/Modal';

export const SafetyView: React.FC = () => {
  const { triggerSosCountdown, contacts, sosHistory, setActiveTab } = useApp();

  const [isSystemArmed, setIsSystemArmed] = useState(true);
  const [activeModal, setActiveModal] = useState<'contacts' | 'history' | null>(null);

  // LIVE REAL PHYSICAL PHONE BATTERY DETECTION
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);

        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
        battery.addEventListener('chargingchange', () => {
          setIsCharging(battery.charging);
        });
      }).catch(() => {
        setBatteryLevel(null);
      });
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
      {/* 1. TOP HEADER WITH BACK TRACKING & LOGOO.PNG */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            aria-label="Go back to Dashboard"
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <ArrowLeft size={20} />
          </button>

          <img src="/logo.png" alt="HearAssist Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />

          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2, letterSpacing: '0.05em' }}>
              Safety Net
            </h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Safety First, Always.
            </span>
          </div>
        </div>

        <span className="badge badge-teal" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: '20px' }}>
          {isSystemArmed ? 'STANDBY ●' : 'DISARMED ●'}
        </span>
      </div>

      {/* 2. SYSTEM STATUS CARD */}
      <div className="card" style={{ padding: '1rem 1.15rem', borderRadius: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--teal-600)', boxShadow: '0 0 10px var(--teal-600)' }} />
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                SYSTEM STATUS
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--teal-800)', marginTop: '1px' }}>
                SOS READY
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                All systems operational.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--teal-600)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wifi size={16} />
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={16} />
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mic size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. CENTRAL RED SOS BUTTON HERO WITH INTERACTIVE ROTATING & PULSING RADAR RINGS */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem 0',
          position: 'relative',
        }}
      >
        {/* Interactive Rotating Outer Loading Orbit Ring */}
        <div
          style={{
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            border: '3px dashed rgba(239, 68, 68, 0.4)',
            position: 'absolute',
            animation: 'spin 10s linear infinite',
            boxShadow: '0 0 25px rgba(239, 68, 68, 0.15)',
          }}
        />

        {/* Pulse Radar Ring 1 */}
        <div
          style={{
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            border: '2px solid rgba(239, 68, 68, 0.35)',
            position: 'absolute',
            animation: 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
          }}
        />

        {/* Pulse Radar Ring 2 */}
        <div
          style={{
            width: '165px',
            height: '165px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1.5px solid rgba(239, 68, 68, 0.25)',
            position: 'absolute',
            animation: 'pulse 1.8s ease-in-out infinite',
          }}
        />

        {/* GLOWING RED SOS BUTTON */}
        <button
          onClick={() => triggerSosCountdown('manual')}
          aria-label="Tap to trigger emergency SOS"
          style={{
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            backgroundColor: '#dc2626',
            background: 'radial-gradient(circle at 35% 35%, #ef4444, #b91c1c)',
            border: '4px solid #ffffff',
            boxShadow: '0 12px 36px rgba(220, 38, 38, 0.45), inset 0 4px 10px rgba(255, 255, 255, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 2,
            transition: 'transform 0.15s ease',
          }}
        >
          <Shield size={38} color="#ffffff" style={{ marginBottom: '2px' }} />
          <span style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: 900, letterSpacing: '0.05em' }}>
            SOS
          </span>
        </button>

        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '1rem' }}>
          TAP TO TRIGGER SOS
        </div>

        {/* ARM / DISARM SYSTEM TOGGLE BUTTON */}
        <button
          className="btn btn-secondary"
          onClick={() => setIsSystemArmed(!isSystemArmed)}
          style={{
            marginTop: '0.85rem',
            padding: '0.5rem 1.5rem',
            borderRadius: '24px',
            fontSize: '0.875rem',
            fontWeight: 800,
            border: '1.5px solid var(--slate-300)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <ShieldCheck size={18} className="text-teal" /> {isSystemArmed ? 'ARM SYSTEM' : 'DISARM SYSTEM'}
        </button>
      </div>

      {/* 4. LIVE REAL PHYSICAL PHONE BATTERY STATUS CARD (RENDERED ONLY WHEN SUPPORTED) */}
      {batteryLevel !== null && (
        <div className="card" style={{ padding: '0.85rem 1rem', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'var(--teal-50)', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BatteryCharging size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                PHONE STATUS
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '1px' }}>
                Battery: <strong style={{ color: 'var(--teal-700)' }}>{batteryLevel}% {isCharging ? '• Charging' : '• Discharging'}</strong>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Network: <strong>Good</strong> • Location: <strong>On</strong>
              </div>
            </div>
          </div>
          <ChevronRight size={18} style={{ color: 'var(--slate-400)' }} />
        </div>
      )}

      {/* 5. 2-COLUMN ASYMMETRIC CARDS (SOS HISTORY & EMERGENCY CONTACTS) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
        {/* SOS HISTORY CARD (ATTACHED TOP-RIGHT CORNER) */}
        <div
          className="card"
          onClick={() => setActiveModal('history')}
          style={{
            cursor: 'pointer',
            padding: '0.95rem 0.85rem',
            borderRadius: '20px 4px 20px 20px', // Asymmetric: 1 corner attached/sharp!
            border: '1px solid var(--border-card)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.65rem',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#ffebee', color: '#e53935', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </div>
            <ChevronRight size={16} style={{ color: 'var(--slate-400)' }} />
          </div>

          <div>
            <div style={{ fontSize: '0.825rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              SOS HISTORY
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.3, marginTop: '2px' }}>
              View all past SOS events and actions
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#e53935' }}>
            {sosHistory.length} Event{sosHistory.length === 1 ? '' : 's'}
          </div>
        </div>

        {/* EMERGENCY CONTACTS CARD (ATTACHED TOP-LEFT CORNER) */}
        <div
          className="card"
          onClick={() => setActiveModal('contacts')}
          style={{
            cursor: 'pointer',
            padding: '0.95rem 0.85rem',
            borderRadius: '4px 20px 20px 20px', // Asymmetric: opposite corner attached/sharp!
            border: '1px solid var(--border-card)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.65rem',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#f3e5f5', color: '#8e24aa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} />
            </div>
            <ChevronRight size={16} style={{ color: 'var(--slate-400)' }} />
          </div>

          <div>
            <div style={{ fontSize: '0.825rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              EMERGENCY CONTACTS
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.3, marginTop: '2px' }}>
              Manage your critical emergency contacts
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#8e24aa' }}>
            {contacts.length} Contact{contacts.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {/* 6. OFFICIAL HELPLINES SECTION */}
      <div className="card" style={{ padding: '1rem', borderRadius: '18px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
          OFFICIAL HELPLINES
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {[
            { label: 'SOS Emergency', number: '112', badgeBg: '#ffebee', color: '#e53935' },
            { label: 'Police', number: '100', badgeBg: '#e8f0fe', color: '#1a73e8' },
            { label: 'Fire Department', number: '101', badgeBg: '#fff3e0', color: '#f57c00' },
            { label: 'Ambulance', number: '108', badgeBg: '#e8f5e9', color: '#2e7d32' },
          ].map((line, idx) => (
            <a
              key={idx}
              href={`tel:${line.number}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--slate-100)',
                padding: '0.65rem 0.85rem',
                borderRadius: '12px',
                textDecoration: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span className="badge" style={{ backgroundColor: line.badgeBg, color: line.color, fontWeight: 900, fontSize: '0.7rem' }}>
                  {line.label.substring(0, 3).toUpperCase()}
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {line.label}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 900, color: line.color }}>
                  {line.number}
                </span>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'var(--teal-50)', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PhoneCall size={14} />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* EMERGENCY CONTACTS MODAL */}
      <Modal isOpen={activeModal === 'contacts'} onClose={() => setActiveModal(null)} title="Manage Emergency Contacts">
        <ContactsConfig />
      </Modal>

      {/* SOS HISTORY MODAL */}
      <Modal isOpen={activeModal === 'history'} onClose={() => setActiveModal(null)} title="Emergency SOS History Log">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {sosHistory.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No emergency events recorded yet.
            </p>
          ) : (
            sosHistory.map((evt) => (
              <div
                key={evt.id}
                style={{
                  backgroundColor: evt.status === 'sent' ? 'var(--teal-50)' : 'var(--slate-100)',
                  borderLeft: `4px solid ${evt.status === 'sent' ? 'var(--teal-600)' : '#ef4444'}`,
                  borderRadius: '10px',
                  padding: '0.75rem',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                  <span>{evt.type === 'automatic' ? '⚠️ Fall Sensor Impact SOS' : '🚨 Manual SOS Trigger'}</span>
                  <span className={`badge ${evt.status === 'sent' ? 'badge-teal' : 'badge-slate'}`}>
                    {evt.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                  {new Date(evt.timestamp).toLocaleString()} • {evt.contactsNotifiedCount} contacts notified
                </div>
                {evt.locationString && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--teal-700)', marginTop: '2px' }}>
                    📍 {evt.locationString}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};
