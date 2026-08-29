import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Volume2, PhoneCall, Clock, Check, Plus, Activity } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { hapticService } from '../../services/hapticService';
import { soundClassifier } from '../../services/soundClassifier';
import { speechService } from '../../services/speechService';
import { Modal } from '../../components/common/Modal';

export const AwarenessView: React.FC = () => {
  const {
    isSoundMonitoringActive,
    toggleSoundMonitoring,
    alertsHistory,
    activeAlert,
    setActiveTab,
  } = useApp();

  // Feature Toggle States
  const [callsAlertsActive, setCallsAlertsActive] = useState(true);
  const [remindersActive, setRemindersActive] = useState(true);

  // Live Microphone Decibel Volume Meter & Debug Diagnostics
  const [liveVolume, setLiveVolume] = useState(0);
  const [debugMetrics, setDebugMetrics] = useState(soundClassifier.getDebugStatus());

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isSoundMonitoringActive) {
      interval = setInterval(() => {
        setLiveVolume(soundClassifier.getLiveVolume());
        setDebugMetrics(soundClassifier.getDebugStatus());
      }, 100);
    } else {
      setLiveVolume(0);
      setDebugMetrics(soundClassifier.getDebugStatus());
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSoundMonitoringActive]);

  // Home Reminders State
  const [reminders, setReminders] = useState([
    { id: 'rem-1', title: 'Laundry', time: 'Timer • 10 mins ago', status: 'done', icon: '🧺' },
    { id: 'rem-2', title: 'Cooking (Oven)', time: '25 mins remaining', status: 'active', icon: '🍳' },
    { id: 'rem-3', title: 'Water Plants', time: 'Tomorrow, 9:00 AM', status: 'pending', icon: '🪴' },
  ]);

  // Add Reminder Modal State
  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('');

  const handleToggleSoundMonitoring = async () => {
    hapticService.vibrate(30);
    await toggleSoundMonitoring();
  };

  const handleToggleReminderStatus = (id: string) => {
    hapticService.vibrate(20);
    setReminders((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'done' ? 'active' : 'done';
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newReminderTitle.trim();
    if (!title) return;

    hapticService.vibrate(30);
    const timeInput = newReminderTime.trim() || '1 min';

    let durationMs = 60000; // default 1 min
    if (timeInput.toLowerCase().includes('30 sec')) durationMs = 30000;
    else if (timeInput.toLowerCase().includes('2 min')) durationMs = 120000;
    else if (timeInput.toLowerCase().includes('5 min')) durationMs = 300000;

    const newRem = {
      id: `rem-${Date.now()}`,
      title: title,
      time: `${timeInput} (Timer active)`,
      status: 'active',
      icon: '⏰',
    };

    setReminders((prev) => [newRem, ...prev]);
    setNewReminderTitle('');
    setNewReminderTime('');
    setIsAddReminderOpen(false);

    // Active Timer Timeout Trigger
    setTimeout(() => {
      // 1. High Intensity Multi-Burst Vibration
      hapticService.vibrate([800, 150, 800, 150, 1000]);

      // 2. Announce Voice Alert via TTS
      speechService.speak(`Timer Alert: ${title}`);

      // 3. Update status in UI
      setReminders((prev) =>
        prev.map((item) => (item.id === newRem.id ? { ...item, status: 'done', time: 'Alarm Finished! ⏰' } : item))
      );
    }, durationMs);
  };

  // Get most recent detected alert or display default real-time listening banner
  const currentLatestAlert = activeAlert || alertsHistory[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
      {/* 1. HEADER WITH BACK TRACKING & LOGOO.PNG */}
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
            <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
              Awareness Hub
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1px' }}>
              Real-time environmental sound detection
            </p>
          </div>
        </div>

        {/* Top Right Bell Icon Container */}
        <div style={{ position: 'relative' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#ffffff', border: '1px solid var(--border-card)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <Bell size={20} />
          </div>
          {alertsHistory.length > 0 && (
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', border: '2px solid #ffffff', position: 'absolute', top: '-1px', right: '-1px' }} />
          )}
        </div>
      </div>

      {/* 2. REAL-TIME SYSTEM MONITORING & DECIBEL WAVEFORM METER CARD */}
      <div
        className="card"
        style={{
          padding: '1rem 1.15rem',
          borderRadius: '20px',
          backgroundColor: isSoundMonitoringActive ? '#f4fbf7' : '#ffffff',
          border: `1.5px solid ${isSoundMonitoringActive ? 'var(--teal-200)' : 'var(--border-card)'}`,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', backgroundColor: isSoundMonitoringActive ? 'var(--teal-50)' : 'var(--slate-100)', color: isSoundMonitoringActive ? 'var(--teal-600)' : 'var(--slate-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={22} className={isSoundMonitoringActive ? 'pulse-icon' : ''} />
            </div>

            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 900, color: isSoundMonitoringActive ? 'var(--teal-800)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isSoundMonitoringActive ? 'var(--teal-600)' : '#94a3b8' }} />
                {isSoundMonitoringActive ? 'MIC ACTIVE • REAL-TIME DETECT' : 'SOUND MONITORING PAUSED'}
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                {isSoundMonitoringActive ? 'Listening for sirens, doorbells, alarms, claps & shouting' : 'Tap Environmental Alerts to start mic'}
              </div>
            </div>
          </div>

          <button
            className={`btn ${isSoundMonitoringActive ? 'btn-primary' : 'btn-secondary'}`}
            onClick={handleToggleSoundMonitoring}
            style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.4rem 0.85rem', borderRadius: '12px' }}
          >
            {isSoundMonitoringActive ? 'PAUSE MIC' : 'START MIC'}
          </button>
        </div>

        {/* Live Decibel Sound Waveform Bar */}
        {isSoundMonitoringActive && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', borderTop: '1px solid var(--teal-100)', paddingTop: '0.65rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', fontWeight: 800, color: 'var(--teal-800)' }}>
              <span>🔊 Real-Time Microphone Decibel Input</span>
              <span>{liveVolume}% Volume Level</span>
            </div>
            <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--teal-100)', borderRadius: '6px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.max(4, liveVolume)}%`,
                  backgroundColor: liveVolume > 50 ? '#ef4444' : liveVolume > 25 ? '#f59e0b' : 'var(--teal-600)',
                  transition: 'width 0.15s ease',
                  borderRadius: '6px',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. LATEST REAL-TIME DETECTED ALERT HERO CARD */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          borderRadius: '20px',
          backgroundColor: currentLatestAlert ? '#fff5f5' : '#ffffff',
          border: `1.5px solid ${currentLatestAlert ? '#fca5a5' : 'var(--border-card)'}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: currentLatestAlert ? '#fee2e2' : 'var(--teal-50)', color: currentLatestAlert ? '#ef4444' : 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Bell size={26} className={currentLatestAlert ? 'pulse-icon' : ''} />
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: currentLatestAlert ? '#c53030' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {currentLatestAlert ? '🚨 REAL-TIME DETECTED EVENT' : 'REAL-TIME SOUND STATUS'}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '2px' }}>
              {currentLatestAlert ? currentLatestAlert.title : 'Microphone Ready'}
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginTop: '1px' }}>
              {currentLatestAlert ? new Date(currentLatestAlert.timestamp).toLocaleTimeString() : 'Make a sound (clap, whistle, doorbell, shout) to trigger'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '3px', lineHeight: 1.3 }}>
              {currentLatestAlert ? currentLatestAlert.description : 'Your device continuously analyzes environmental sound frequencies.'}
            </div>
          </div>
        </div>
      </div>

      {/* DEVELOPER / HACKATHON DIAGNOSTICS & TEST MODE CARD */}
      <div
        className="card"
        style={{
          padding: '0.85rem 1rem',
          borderRadius: '16px',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          border: '1px solid #334155',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#38bdf8', letterSpacing: '0.05em' }}>
            🛠️ DIAGNOSTICS & YAMNET PIPELINE
          </span>
          <span style={{ fontSize: '0.68rem', color: debugMetrics.isConfirmed ? '#4ade80' : '#cbd5e1', fontWeight: 800 }}>
            {debugMetrics.statusText}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.4rem', textAlign: 'center', fontSize: '0.725rem' }}>
          <div style={{ backgroundColor: '#1e293b', padding: '0.4rem', borderRadius: '8px' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.625rem' }}>CANDIDATE</div>
            <div style={{ fontWeight: 800, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {debugMetrics.candidateSound.replace(/DETECTED|🚨|🚗|🔔|🚪|⚡/g, '').trim() || 'NONE'}
            </div>
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '0.4rem', borderRadius: '8px' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.625rem' }}>CONFIDENCE</div>
            <div style={{ fontWeight: 800, color: debugMetrics.confidence >= 0.70 ? '#4ade80' : '#f8fafc' }}>
              {(debugMetrics.confidence * 100).toFixed(0)}%
            </div>
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '0.4rem', borderRadius: '8px' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.625rem' }}>ENERGY (RMS)</div>
            <div style={{ fontWeight: 800, color: debugMetrics.audioEnergyRMS >= 12 ? '#38bdf8' : '#f8fafc' }}>
              {debugMetrics.audioEnergyRMS}
            </div>
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '0.4rem', borderRadius: '8px' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.625rem' }}>TEMPORAL</div>
            <div style={{ fontWeight: 800, color: debugMetrics.temporalCount >= debugMetrics.requiredTemporal ? '#4ade80' : '#f8fafc' }}>
              {debugMetrics.temporalCount} / {debugMetrics.requiredTemporal}
            </div>
          </div>
        </div>

        {/* TEST SOUND SIMULATION BUTTONS */}
        <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.6rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
          <button
            onClick={() => soundClassifier.simulateAlert('horn')}
            style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.25rem 0.5rem', borderRadius: '6px', backgroundColor: '#334155', color: '#ffffff', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            🚗 Test Horn
          </button>
          <button
            onClick={() => soundClassifier.simulateAlert('siren')}
            style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.25rem 0.5rem', borderRadius: '6px', backgroundColor: '#334155', color: '#ffffff', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            🚨 Test Siren
          </button>
          <button
            onClick={() => soundClassifier.simulateAlert('doorbell')}
            style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.25rem 0.5rem', borderRadius: '6px', backgroundColor: '#334155', color: '#ffffff', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            🔔 Test Doorbell
          </button>
          <button
            onClick={() => soundClassifier.simulateAlert('knock')}
            style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.25rem 0.5rem', borderRadius: '6px', backgroundColor: '#334155', color: '#ffffff', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            🚪 Test Knock
          </button>
        </div>
      </div>

      {/* 4. 3-COLUMN FEATURE TOGGLE CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.65rem' }}>
        {/* COLUMN 1: ENVIRONMENTAL ALERTS */}
        <div
          className="card"
          onClick={handleToggleSoundMonitoring}
          style={{
            cursor: 'pointer',
            padding: '0.85rem 0.65rem',
            borderRadius: '18px',
            border: isSoundMonitoringActive ? '2px solid var(--teal-600)' : '1px solid var(--border-card)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--teal-50)', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Volume2 size={18} />
          </div>

          <div>
            <div style={{ fontSize: '0.775rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.25 }}>
              Environmental Alerts
            </div>
            <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', lineHeight: 1.2, marginTop: '3px' }}>
              Real mic sound detect
            </div>
          </div>

          <span
            className="badge"
            style={{
              backgroundColor: isSoundMonitoringActive ? 'var(--teal-50)' : 'var(--slate-100)',
              color: isSoundMonitoringActive ? 'var(--teal-700)' : 'var(--slate-600)',
              fontSize: '0.7rem',
              fontWeight: 900,
              padding: '0.25rem 0.65rem',
              borderRadius: '12px',
            }}
          >
            {isSoundMonitoringActive ? 'ACTIVE ●' : 'PAUSED ○'}
          </span>
        </div>

        {/* COLUMN 2: CALLS & NOTIFICATIONS */}
        <div
          className="card"
          onClick={() => setCallsAlertsActive(!callsAlertsActive)}
          style={{
            cursor: 'pointer',
            padding: '0.85rem 0.65rem',
            borderRadius: '18px',
            border: '1px solid var(--border-card)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#ffebee', color: '#e53935', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PhoneCall size={18} />
          </div>

          <div>
            <div style={{ fontSize: '0.775rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.25 }}>
              Calls & Alerts
            </div>
            <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', lineHeight: 1.2, marginTop: '3px' }}>
              Call vibration alerts
            </div>
          </div>

          <span
            className="badge"
            style={{
              backgroundColor: callsAlertsActive ? '#ffebee' : 'var(--slate-100)',
              color: callsAlertsActive ? '#c62828' : 'var(--slate-600)',
              fontSize: '0.7rem',
              fontWeight: 900,
              padding: '0.25rem 0.65rem',
              borderRadius: '12px',
            }}
          >
            {callsAlertsActive ? 'ON ●' : 'OFF ○'}
          </span>
        </div>

        {/* COLUMN 3: HOME REMINDERS */}
        <div
          className="card"
          onClick={() => setRemindersActive(!remindersActive)}
          style={{
            cursor: 'pointer',
            padding: '0.85rem 0.65rem',
            borderRadius: '18px',
            border: '1px solid var(--border-card)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f3e5f5', color: '#8e24aa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={18} />
          </div>

          <div>
            <div style={{ fontSize: '0.775rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.25 }}>
              Home Reminders
            </div>
            <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', lineHeight: 1.2, marginTop: '3px' }}>
              Timers & tasks
            </div>
          </div>

          <span
            className="badge"
            style={{
              backgroundColor: remindersActive ? '#f3e5f5' : 'var(--slate-100)',
              color: remindersActive ? '#7b1fa2' : 'var(--slate-600)',
              fontSize: '0.7rem',
              fontWeight: 900,
              padding: '0.25rem 0.65rem',
              borderRadius: '12px',
            }}
          >
            {remindersActive ? 'ON ●' : 'OFF ○'}
          </span>
        </div>
      </div>



      {/* 6. RECENT ACTIVITY LOG */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
            Recent Real-Time Activity Log
          </h2>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--teal-600)' }}>
            {alertsHistory.length} Events Recorded
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {alertsHistory.length > 0 ? (
            alertsHistory.slice(0, 8).map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#ffffff',
                  padding: '0.75rem 0.9rem',
                  borderRadius: '14px',
                  border: '1px solid var(--border-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: item.severity === 'critical' ? '#ffebee' : 'var(--teal-50)', color: item.severity === 'critical' ? '#e53935' : 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bell size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                      {item.description}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-card)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No environmental sounds recorded yet. Microphone is actively monitoring in real-time.
            </div>
          )}
        </div>
      </div>

      {/* 7. HOME REMINDERS LIST SECTION */}
      {remindersActive && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
              Home Reminders & Timers
            </h2>

            <button
              onClick={() => setIsAddReminderOpen(true)}
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--teal-700)',
                backgroundColor: 'var(--teal-50)',
                border: 'none',
                padding: '0.35rem 0.65rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                cursor: 'pointer',
              }}
            >
              <Plus size={14} /> Add Reminder
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {reminders.map((rem) => (
              <div
                key={rem.id}
                onClick={() => handleToggleReminderStatus(rem.id)}
                style={{
                  backgroundColor: '#ffffff',
                  padding: '0.75rem 0.9rem',
                  borderRadius: '14px',
                  border: '1px solid var(--border-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  opacity: rem.status === 'done' ? 0.65 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ fontSize: '1.25rem' }}>{rem.icon}</div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', textDecoration: rem.status === 'done' ? 'line-through' : 'none' }}>
                      {rem.title}
                    </div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                      {rem.time}
                    </div>
                  </div>
                </div>

                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: rem.status === 'done' ? 'var(--teal-600)' : 'var(--slate-100)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {rem.status === 'done' && <Check size={14} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD REMINDER MODAL */}
      <Modal isOpen={isAddReminderOpen} onClose={() => setIsAddReminderOpen(false)} title="Add Home Reminder">
        <form onSubmit={handleAddReminder} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label">Reminder Title:</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Check Washing Machine"
              value={newReminderTitle}
              onChange={(e) => setNewReminderTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label">Time / Duration:</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 15 mins timer or Today, 6:00 PM"
              value={newReminderTime}
              onChange={(e) => setNewReminderTime(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full">
            Save Reminder
          </button>
        </form>
      </Modal>
    </div>
  );
};
