import React from 'react';
import { Bell, ChevronRight, Volume2, MessageSquare, BookOpen, Calendar, PhoneCall, Car, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { hapticService } from '../../services/hapticService';

export const DashboardView: React.FC = () => {
  const { setActiveTab, alertsHistory, userProfile } = useApp();

  // Calculate real awareness metrics from alertsHistory or defaults
  const doorbellCount = alertsHistory.filter((a) => a.category === 'doorbell').length || 1;
  const hornCount = alertsHistory.filter((a) => a.category === 'horn').length || 1;

  // Handle Quick Action Card Clicks with Haptic Feedback
  const handleQuickAction = (targetTab: 'safety' | 'awareness' | 'communication' | 'learn' | 'settings') => {
    hapticService.vibrate(30);
    setActiveTab(targetTab);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', width: '100%', overflowX: 'hidden' }}>
      {/* 1. HEADER WITH LOGOO.PNG AT TOP LEFT */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <img
            src="/logo.png"
            alt="HearAssist Logo"
            style={{ height: '42px', width: 'auto', objectFit: 'contain', borderRadius: '8px' }}
          />
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
              {userProfile.name && userProfile.name !== 'User' ? `Hello, ${userProfile.name}! 👋` : 'Welcome back! 👋'}
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1px' }}>
              Stay aware, stay safe, stay connected.
            </p>
          </div>
        </div>

        {/* Notification Bell Icon */}
        <div
          onClick={() => handleQuickAction('awareness')}
          style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#ffffff', border: '1px solid var(--border-card)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <Bell size={20} />
          </div>
          {alertsHistory.length > 0 && (
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', border: '2px solid #ffffff', position: 'absolute', top: '-1px', right: '-1px' }} />
          )}
        </div>
      </div>

      {/* 2. QUICK ACTIONS (2x2 GRID AT TOP) */}
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
          Quick Actions
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
          {/* CARD 1: EMERGENCY SOS (RED TINT) */}
          <div
            className="card"
            onClick={() => handleQuickAction('safety')}
            style={{
              cursor: 'pointer',
              padding: '0.95rem 0.75rem',
              borderRadius: '18px',
              backgroundColor: '#fff5f5',
              border: '1px solid #ffe3e3',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '0.4rem',
              minWidth: 0,
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#ef4444', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)' }}>
              SOS
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 900, color: '#991b1b', lineHeight: 1.2 }}>
                Emergency SOS
              </div>
              <div style={{ fontSize: '0.7rem', color: '#b91c1c', marginTop: '2px', lineHeight: 1.2 }}>
                Get immediate help
              </div>
            </div>
          </div>

          {/* CARD 2: SOUND AWARENESS (TEAL TINT) */}
          <div
            className="card"
            onClick={() => handleQuickAction('awareness')}
            style={{
              cursor: 'pointer',
              padding: '0.95rem 0.75rem',
              borderRadius: '18px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #dcfce7',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '0.4rem',
              minWidth: 0,
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#e6f4ea', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Volume2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 900, color: 'var(--teal-900)', lineHeight: 1.2 }}>
                Sound Awareness
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--teal-700)', marginTop: '2px', lineHeight: 1.2 }}>
                Detect important sounds
              </div>
            </div>
          </div>

          {/* CARD 3: I CAN'T HEAR YOU (BLUE TINT) */}
          <div
            className="card"
            onClick={() => handleQuickAction('communication')}
            style={{
              cursor: 'pointer',
              padding: '0.95rem 0.75rem',
              borderRadius: '18px',
              backgroundColor: '#f0f9ff',
              border: '1px solid #e0f2fe',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '0.4rem',
              minWidth: 0,
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#ffffff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 900, color: '#0369a1', lineHeight: 1.2 }}>
                I Can't Hear You
              </div>
              <div style={{ fontSize: '0.7rem', color: '#0284c7', marginTop: '2px', lineHeight: 1.2 }}>
                Live speech to text
              </div>
            </div>
          </div>

          {/* CARD 4: LEARN & PRACTICE (PURPLE TINT) */}
          <div
            className="card"
            onClick={() => handleQuickAction('learn')}
            style={{
              cursor: 'pointer',
              padding: '0.95rem 0.75rem',
              borderRadius: '18px',
              backgroundColor: '#faf5ff',
              border: '1px solid #f3e8ff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '0.4rem',
              minWidth: 0,
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#ffffff', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 900, color: '#581c87', lineHeight: 1.2 }}>
                Learn & Practice
              </div>
              <div style={{ fontSize: '0.7rem', color: '#7e22ce', marginTop: '2px', lineHeight: 1.2 }}>
                Signs, resources & quiz
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. AWARENESS AT A GLANCE (4 METRICS IN RESPONSIVE HORIZONTAL SCROLL OR GRID) */}
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
          Awareness at a Glance
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.45rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
          {[
            { label: 'Missed Calls Today', count: 2, icon: PhoneCall, bg: '#e8f5e9', color: '#2e7d32' },
            { label: 'Important Messages', count: 3, icon: MessageSquare, bg: '#e3f2fd', color: '#1565c0' },
            { label: 'Doorbell Detected', count: doorbellCount, icon: Bell, bg: '#f3e5f5', color: '#7b1fa2' },
            { label: 'Vehicle Horns', count: hornCount, icon: Car, bg: '#fff3e0', color: '#e65100' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="card"
              onClick={() => handleQuickAction('awareness')}
              style={{
                cursor: 'pointer',
                padding: '0.75rem 0.4rem',
                borderRadius: '16px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '78px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-card)',
              }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.35rem' }}>
                <item.icon size={16} />
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                {item.count}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.2, marginTop: '2px' }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. HOME REMINDERS CARD */}
      <div
        className="card"
        onClick={() => handleQuickAction('awareness')}
        style={{
          cursor: 'pointer',
          padding: '0.85rem 1rem',
          borderRadius: '18px',
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', backgroundColor: '#fff3e0', color: '#e65100', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Calendar size={20} />
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              Home Reminders
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Check door lock at 10:00 PM • Medicine at 9:00 PM
            </div>
          </div>
        </div>

        <ChevronRight size={18} style={{ color: 'var(--slate-400)', flexShrink: 0 }} />
      </div>

      {/* 6. RECENT ACTIVITY LIST */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            Recent Activity
          </span>
          <span
            onClick={() => handleQuickAction('awareness')}
            style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--teal-700)', cursor: 'pointer' }}
          >
            See all
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {alertsHistory.length === 0 ? (
            <div className="card" style={{ padding: '0.85rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              No recent sound alerts recorded.
            </div>
          ) : (
            alertsHistory.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className="card"
                onClick={() => handleQuickAction('awareness')}
                style={{
                  cursor: 'pointer',
                  padding: '0.75rem 0.9rem',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--teal-50)', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900 }}>
                    {alert.title.substring(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {alert.title}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <span className="badge badge-teal" style={{ fontSize: '0.65rem' }}>
                  {alert.severity.toUpperCase()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 7. CONTINUE LEARNING BANNER */}
      <div
        className="card"
        onClick={() => handleQuickAction('learn')}
        style={{
          cursor: 'pointer',
          padding: '0.95rem 1rem',
          borderRadius: '18px',
          backgroundColor: '#f4fbf7',
          border: '1px solid var(--teal-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', backgroundColor: 'var(--teal-50)', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BookOpen size={20} />
          </div>

          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--teal-900)' }}>
              Continue Learning
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--teal-700)', marginTop: '1px' }}>
              Emergency Signs • 7/10 Completed
            </div>
          </div>
        </div>

        <button className="btn btn-primary" style={{ fontSize: '0.725rem', padding: '0.35rem 0.65rem', borderRadius: '10px' }}>
          Resume <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};
