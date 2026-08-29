import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, Shield, Vibrate, Volume2, Bell, Eye, Lock, Info, Mic } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/common/Modal';
import { ContactsConfig } from '../safety/ContactsConfig';

export const SettingsView: React.FC = () => {
  const { setActiveTab, preferences, updatePreferences, updatePermissions } = useApp();

  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleRequestMic = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      updatePermissions({ microphone: 'granted' });
      setActiveModal(null);
    } catch {
      updatePermissions({ microphone: 'denied' });
      setActiveModal(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* SCREEN 10: SETTINGS HEADER WITH BACK TRACKING & LOGOO.PNG */}
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
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Settings
          </h1>
        </div>
      </div>

      {/* SCREEN 10: SETTINGS LIST ROWS (NO TAB REDIRECTIONS) */}
      <div className="settings-list">
        {/* Row 1: Emergency Contacts */}
        <div className="settings-row" onClick={() => setActiveModal('contacts')}>
          <div className="settings-row-left">
            <Shield size={20} className="settings-row-icon" />
            <span className="settings-row-label">Emergency Contacts</span>
          </div>
          <ChevronRight size={18} style={{ color: 'var(--slate-400)' }} />
        </div>

        {/* Row 2: Vibration & Haptics */}
        <div className="settings-row" onClick={() => setActiveModal('vibration')}>
          <div className="settings-row-left">
            <Vibrate size={20} className="settings-row-icon" />
            <span className="settings-row-label">Vibration & Haptics</span>
          </div>
          <ChevronRight size={18} style={{ color: 'var(--slate-400)' }} />
        </div>

        {/* Row 3: Sound Alert Preferences */}
        <div className="settings-row" onClick={() => setActiveModal('sound-prefs')}>
          <div className="settings-row-left">
            <Volume2 size={20} className="settings-row-icon" />
            <span className="settings-row-label">Sound Alert Preferences</span>
          </div>
          <ChevronRight size={18} style={{ color: 'var(--slate-400)' }} />
        </div>

        {/* Row 4: Notification Preferences */}
        <div className="settings-row" onClick={() => setActiveModal('notifications')}>
          <div className="settings-row-left">
            <Bell size={20} className="settings-row-icon" />
            <span className="settings-row-label">Notification Preferences</span>
          </div>
          <ChevronRight size={18} style={{ color: 'var(--slate-400)' }} />
        </div>

        {/* Row 5: Accessibility */}
        <div className="settings-row" onClick={() => setActiveModal('accessibility')}>
          <div className="settings-row-left">
            <Eye size={20} className="settings-row-icon" />
            <span className="settings-row-label">Accessibility</span>
          </div>
          <ChevronRight size={18} style={{ color: 'var(--slate-400)' }} />
        </div>

        {/* Row 6: Permissions */}
        <div className="settings-row" onClick={() => setActiveModal('mic-permission')}>
          <div className="settings-row-left">
            <Lock size={20} className="settings-row-icon" />
            <span className="settings-row-label">Permissions</span>
          </div>
          <ChevronRight size={18} style={{ color: 'var(--slate-400)' }} />
        </div>

        {/* Row 7: About HearAssist */}
        <div className="settings-row" onClick={() => setActiveModal('about')}>
          <div className="settings-row-left">
            <Info size={20} className="settings-row-icon" />
            <span className="settings-row-label">About HearAssist</span>
          </div>
          <ChevronRight size={18} style={{ color: 'var(--slate-400)' }} />
        </div>
      </div>

      {/* Emergency Contacts Settings Modal */}
      <Modal isOpen={activeModal === 'contacts'} onClose={() => setActiveModal(null)} title="Manage Emergency Contacts">
        <ContactsConfig />
      </Modal>

      {/* Sound Alert Preferences Settings Modal */}
      <Modal isOpen={activeModal === 'sound-prefs'} onClose={() => setActiveModal(null)} title="Sound Alert Preferences">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Fall Sensor Sensitivity:</label>
            <select
              className="form-input"
              value={preferences.fallDetectionSensitivity}
              onChange={(e) => updatePreferences({ ...preferences, fallDetectionSensitivity: e.target.value as any })}
            >
              <option value="low">Low Sensitivity</option>
              <option value="medium">Medium (Recommended)</option>
              <option value="high">High Sensitivity</option>
            </select>
          </div>
          <button className="btn btn-primary btn-full" onClick={() => setActiveModal(null)}>
            Save & Close
          </button>
        </div>
      </Modal>

      {/* Notification Preferences Sub-Modal */}
      <Modal isOpen={activeModal === 'notifications'} onClose={() => setActiveModal(null)} title="Notification Preferences">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Continuous Audio Monitoring</span>
            <input
              type="checkbox"
              checked={preferences.listenContinuously}
              onChange={(e) => updatePreferences({ ...preferences, listenContinuously: e.target.checked })}
              style={{ width: '22px', height: '22px', accentColor: 'var(--teal-600)' }}
            />
          </div>
          <button className="btn btn-primary btn-full" onClick={() => setActiveModal(null)}>
            Save & Close
          </button>
        </div>
      </Modal>

      {/* PERMISSION EXPLANATION MODAL */}
      <Modal isOpen={activeModal === 'mic-permission'} onClose={() => setActiveModal(null)} showCloseButton={false}>
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                backgroundColor: 'var(--teal-50)',
                color: 'var(--teal-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(0, 137, 123, 0.15)',
              }}
            >
              <Mic size={40} />
            </div>
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Microphone Permission
          </h3>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
            We need microphone access to convert speech to text and help you communicate easily.
          </p>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
            Your conversations are not stored or shared.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <button className="btn btn-outline-teal" onClick={() => setActiveModal(null)}>
              NOT NOW
            </button>
            <button className="btn btn-primary" onClick={handleRequestMic}>
              ALLOW
            </button>
          </div>
        </div>
      </Modal>

      {/* Accessibility Settings Sub-Modal */}
      <Modal isOpen={activeModal === 'accessibility'} onClose={() => setActiveModal(null)} title="Accessibility Settings">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Live Text Scale:</label>
            <select
              className="form-input"
              value={preferences.textScale}
              onChange={(e) => updatePreferences({ ...preferences, textScale: e.target.value as any })}
            >
              <option value="normal">Normal Text</option>
              <option value="large">Large Text</option>
              <option value="xlarge">Extra Large Text</option>
            </select>
          </div>

          <button className="btn btn-primary btn-full" onClick={() => setActiveModal(null)}>
            Save & Close
          </button>
        </div>
      </Modal>

      {/* Vibration Sub-Modal */}
      <Modal isOpen={activeModal === 'vibration'} onClose={() => setActiveModal(null)} title="Vibration & Haptics">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Enable Haptic Vibration</span>
          <input
            type="checkbox"
            checked={preferences.vibrationEnabled}
            onChange={(e) => updatePreferences({ ...preferences, vibrationEnabled: e.target.checked })}
            style={{ width: '22px', height: '22px', accentColor: 'var(--teal-600)' }}
          />
        </div>
      </Modal>

      {/* About Sub-Modal */}
      <Modal isOpen={activeModal === 'about'} onClose={() => setActiveModal(null)} title="About HearAssist">
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <h4 style={{ fontSize: '1.2rem', color: 'var(--teal-600)', marginBottom: '0.25rem' }}>HearAssist v1.0</h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Empowering Communication, Ensuring Safety.
          </p>
        </div>
      </Modal>
    </div>
  );
};
