import React, { useState, useEffect } from 'react';
import { User, UserPlus, ArrowRight, ArrowLeft, Radio, MapPin, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { EmergencyContact } from '../../types';

export const OnboardingView: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { updateUserProfile, updateContacts } = useApp();
  const [step, setStep] = useState<0 | 1 | 2>(0); // 0 = Splash Screen, 1 = Stay Aware & Safe, 2 = Profile & Emergency Setup

  // Step 2 Profile & Mandatory Contact Form State
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRelation, setContactRelation] = useState('Family');
  const [formError, setFormError] = useState('');

  // 1. INCREASED SPLASH DURATION (3600ms = 3.6 SECONDS TOTAL LOADING TIME)
  useEffect(() => {
    if (step === 0) {
      const timer = setTimeout(() => {
        setStep(1);
      }, 3600);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleNext = () => {
    if (step === 1) setStep(2);
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 1) setStep(0);
  };

  const handleFinishSetup = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!userName.trim()) {
      setFormError('Please enter your name.');
      return;
    }
    if (!contactName.trim() || !contactPhone.trim()) {
      setFormError('Please add at least 1 emergency contact name and phone number.');
      return;
    }

    // Save User Profile
    updateUserProfile({
      name: userName.trim(),
      phone: userPhone.trim(),
    });

    // Save Mandatory Emergency Contact
    const primaryContact: EmergencyContact = {
      id: `contact-${Date.now()}`,
      name: contactName.trim(),
      phone: contactPhone.trim(),
      relationship: contactRelation.trim() || 'Family',
      isPrimary: true,
    };
    updateContacts([primaryContact]);

    onComplete();
  };

  // SCREEN 0: HACKSPRINT 2.0 / AITAM OFFICIAL SPLASH SCREEN (3.6s SMOOTH LOADING)
  if (step === 0) {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '2.5rem 1.5rem 3rem 1.5rem',
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* TOP / CENTER: AITAM HACKSPRINT 2.0 LOGO & BANNER */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            width: '100%',
            maxWidth: '380px',
          }}
        >
          <img
            src="/splash_hacksprint.png"
            alt="AITAM HackSprint 2.0 Hackathon 2026"
            style={{
              width: '100%',
              maxHeight: '65vh',
              objectFit: 'contain',
              filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.06))',
            }}
          />
        </div>

        {/* BOTTOM: SMOOTH INTERACTIVE LOADING BAR */}
        <div
          style={{
            width: '100%',
            maxWidth: '320px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.85rem',
          }}
        >
          {/* Animated Gradient Progress Capsule */}
          <div
            style={{
              width: '100%',
              height: '16px',
              borderRadius: '20px',
              backgroundColor: '#1e293b',
              padding: '3px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                height: '100%',
                borderRadius: '16px',
                background: 'linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%)',
                width: '100%',
                boxShadow: '0 0 12px rgba(245, 158, 11, 0.8)',
              }}
            />
          </div>

          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.01em' }}>
            Loading Innovation...
          </div>

          {/* Glowing Animated Loading Dots */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#1e293b' }} />
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 1: ONBOARDING PAGE 1 (STAY AWARE • STAY SAFE WITH BACKTRACKING)
  if (step === 1) {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '2.25rem 1.5rem 2rem 1.5rem',
          boxSizing: 'border-box',
        }}
      >
        <div>
          {/* TOP BACKTRACKER BUTTON & BADGE */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <button
              onClick={handleBack}
              aria-label="Back to Splash"
              style={{
                background: 'none',
                border: 'none',
                padding: '8px',
                cursor: 'pointer',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
              }}
            >
              <ArrowLeft size={20} />
            </button>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#fee2e2', color: '#ef4444', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.725rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🚨 REAL-TIME PROTECTION
            </div>
          </div>

          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1.25, color: '#0f172a', margin: 0 }}>
            Stay <span style={{ color: '#00897b' }}>Aware</span>.<br />
            Stay <span style={{ color: '#00897b' }}>Safe</span>.
          </h2>
          <p style={{ fontSize: '0.925rem', color: '#64748b', marginTop: '0.65rem', fontWeight: 500, lineHeight: 1.5 }}>
            Get instant sound alerts & continuous background emergency dispatch.
          </p>
        </div>

        {/* STRUCTURED PROTECTION HIGHLIGHTS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', margin: 'auto 0' }}>
          <div style={{ padding: '0.95rem 1.1rem', borderRadius: '18px', border: '1.5px solid #e2e8f0', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.95rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Radio size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>Environmental Sound AI</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>Detects sirens, horns, doorbells & alarms instantly</div>
            </div>
          </div>

          <div style={{ padding: '0.95rem 1.1rem', borderRadius: '18px', border: '1.5px solid #e2e8f0', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.95rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MapPin size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>Live GPS SMS Dispatch</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>Shares Google Maps live coordinates with emergency contacts</div>
            </div>
          </div>

          <div style={{ padding: '0.95rem 1.1rem', borderRadius: '18px', border: '1.5px solid #e2e8f0', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.95rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Zap size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>Multi-Burst Haptic Alerts</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>High-intensity tactile vibration patterns for deaf users</div>
            </div>
          </div>
        </div>

        {/* BOTTOM NAVIGATION BAR */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '28px', height: '8px', borderRadius: '10px', backgroundColor: '#00897b' }} />
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#cbd5e1' }} />
          </div>

          <button
            className="btn"
            onClick={handleNext}
            style={{
              backgroundColor: '#00897b',
              color: '#ffffff',
              padding: '0.85rem 1.75rem',
              borderRadius: '16px',
              fontWeight: 800,
              fontSize: '0.95rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(0, 137, 123, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            SETUP PROFILE <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 2: ONBOARDING PAGE 2 (PROFILE & EMERGENCY CONTACT SETUP WITH BACKTRACKING)
  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '2.25rem 1.5rem 1.75rem 1.5rem',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      <div>
        {/* TOP BACKTRACKER BUTTON & BADGE */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <button
            onClick={handleBack}
            aria-label="Back to Stay Aware"
            style={{
              background: 'none',
              border: 'none',
              padding: '8px',
              cursor: 'pointer',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
            }}
          >
            <ArrowLeft size={20} />
          </button>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#e6f4f1', color: '#00897b', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.725rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            👤 QUICK PROFILE SETUP
          </div>
        </div>

        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, lineHeight: 1.25, color: '#0f172a', margin: 0 }}>
          Profile & <span style={{ color: '#00897b' }}>Emergency Contact</span>
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.35rem', fontWeight: 500 }}>
          Please enter your details and primary emergency contact.
        </p>
      </div>

      <form onSubmit={handleFinishSetup} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%', margin: '0.75rem 0' }}>
        {formError && (
          <div style={{ backgroundColor: '#fff5f5', border: '1px solid #ffe3e3', color: '#c53030', padding: '0.65rem', borderRadius: '12px', fontSize: '0.825rem', textAlign: 'center', fontWeight: 700 }}>
            {formError}
          </div>
        )}

        {/* User Details Card */}
        <div style={{ backgroundColor: '#ffffff', padding: '0.95rem', borderRadius: '18px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#00897b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <User size={15} /> YOUR DETAILS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Your Full Name (e.g. Rahul)"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              style={{ fontSize: '0.9rem', padding: '0.7rem', borderRadius: '12px', border: '1.5px solid #cbd5e1' }}
            />
            <input
              type="tel"
              className="form-input"
              placeholder="Your Phone Number (Optional)"
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              style={{ fontSize: '0.9rem', padding: '0.7rem', borderRadius: '12px', border: '1.5px solid #cbd5e1' }}
            />
          </div>
        </div>

        {/* Primary Emergency Contact Card */}
        <div style={{ backgroundColor: '#ffffff', padding: '0.95rem', borderRadius: '18px', border: '1.5px solid #fee2e2', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <UserPlus size={15} /> PRIMARY EMERGENCY CONTACT (REQUIRED)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Contact Name (e.g. Mom / Doctor)"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
              style={{ fontSize: '0.9rem', padding: '0.7rem', borderRadius: '12px', border: '1.5px solid #cbd5e1' }}
            />
            <input
              type="tel"
              className="form-input"
              placeholder="Contact Phone Number (e.g. +91 98765 43210)"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              required
              style={{ fontSize: '0.9rem', padding: '0.7rem', borderRadius: '12px', border: '1.5px solid #cbd5e1' }}
            />

            {/* Quick Relationship Chips */}
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, marginBottom: '0.35rem' }}>Quick Relationship Selection:</div>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {['Family', 'Mother', 'Spouse', 'Doctor', 'Friend'].map((rel) => (
                  <button
                    key={rel}
                    type="button"
                    onClick={() => setContactRelation(rel)}
                    style={{
                      padding: '0.25rem 0.6rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      border: contactRelation === rel ? '1.5px solid #00897b' : '1px solid #e2e8f0',
                      backgroundColor: contactRelation === rel ? '#e6f4f1' : '#f8fafc',
                      color: contactRelation === rel ? '#00897b' : '#64748b',
                      cursor: 'pointer',
                    }}
                  >
                    {rel}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#cbd5e1' }} />
            <span style={{ width: '28px', height: '8px', borderRadius: '10px', backgroundColor: '#00897b' }} />
          </div>

          <button
            type="submit"
            className="btn"
            style={{
              backgroundColor: '#00897b',
              color: '#ffffff',
              padding: '0.85rem 1.4rem',
              borderRadius: '16px',
              fontWeight: 800,
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(0, 137, 123, 0.25)',
              letterSpacing: '0.01em',
            }}
          >
            START PROTECTION 🛡️
          </button>
        </div>
      </form>
    </div>
  );
};
