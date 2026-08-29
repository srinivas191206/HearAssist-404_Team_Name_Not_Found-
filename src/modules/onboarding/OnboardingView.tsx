import React, { useState, useEffect } from 'react';
import { ShieldCheck, User, UserPlus, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { EmergencyContact } from '../../types';

export const OnboardingView: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { updateUserProfile, updateContacts } = useApp();
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0); // 0 = Splash Screen

  // Step 3 Profile & Mandatory Contact Form State
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRelation, setContactRelation] = useState('Family');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (step === 0) {
      const timer = setTimeout(() => {
        setStep(1);
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleNext = () => {
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
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

  // SCREEN 1: SPLASH SCREEN (OPENING LOGO DISPLAY)
  if (step === 0) {
    return (
      <div className="onboarding-container" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2rem 1.5rem' }}>
        <div className="splash-wave-bg" />
        <div
          style={{
            width: '180px',
            height: '180px',
            borderRadius: '24px',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            boxShadow: '0 12px 36px rgba(0, 137, 123, 0.18)',
            padding: '1rem',
          }}
        >
          <img src="/logo.png" alt="HearAssist Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--teal-700)', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
          HearAssist
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          STAY AWARE • STAY SAFE • STAY CONNECTED
        </p>
      </div>
    );
  }

  // SCREEN 2: ONBOARDING INTRO 1
  if (step === 1) {
    return (
      <div className="onboarding-container">
        <div>
          <h2 className="onboarding-header-title">
            Your <span>Safety</span>.<br />
            Your <span>Communication</span>.<br />
            Your <span>Learning</span>.
          </h2>
          <p className="onboarding-subtitle">
            An assistive ecosystem for people with hearing impairment.
          </p>
        </div>

        <div className="onboarding-illustration-center">
          <div
            style={{
              width: '180px',
              height: '180px',
              borderRadius: '24px',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
              padding: '1rem',
            }}
          >
            <img src="/logo.png" alt="HearAssist Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        </div>

        <div className="onboarding-footer">
          <div className="onboarding-dots">
            <span className="dot active" />
            <span className="dot" />
            <span className="dot" />
          </div>
          <button className="btn btn-primary" onClick={handleNext} style={{ padding: '0.75rem 1.75rem', borderRadius: '12px' }}>
            NEXT
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 3: ONBOARDING INTRO 2
  if (step === 2) {
    return (
      <div className="onboarding-container">
        <div>
          <h2 className="onboarding-header-title">
            Stay <span>Aware</span>.<br />
            Stay <span>Safe</span>.
          </h2>
          <p className="onboarding-subtitle">
            Get real-time sound alerts & instant background emergency SOS dispatch.
          </p>
        </div>

        <div className="onboarding-illustration-center">
          <div className="onboarding-circle-bg">
            <ShieldCheck size={90} />
          </div>
        </div>

        <div className="onboarding-footer">
          <div className="onboarding-dots">
            <span className="dot" />
            <span className="dot active" />
            <span className="dot" />
          </div>
          <button className="btn btn-primary" onClick={handleNext} style={{ padding: '0.75rem 1.75rem', borderRadius: '12px' }}>
            SETUP PROFILE <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 4: MANDATORY USER PROFILE & EMERGENCY CONTACT SETUP FORM
  return (
    <div className="onboarding-container" style={{ overflowY: 'auto' }}>
      <div>
        <h2 className="onboarding-header-title" style={{ fontSize: '1.6rem' }}>
          Profile & <span>Emergency Contact</span>
        </h2>
        <p className="onboarding-subtitle" style={{ fontSize: '0.825rem' }}>
          Please enter your name and at least 1 primary emergency contact.
        </p>
      </div>

      <form onSubmit={handleFinishSetup} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%' }}>
        {formError && (
          <div style={{ backgroundColor: '#fff5f5', border: '1px solid #ffe3e3', color: '#c53030', padding: '0.65rem', borderRadius: '10px', fontSize: '0.8rem', textAlign: 'center' }}>
            {formError}
          </div>
        )}

        {/* User Details */}
        <div style={{ backgroundColor: '#ffffff', padding: '0.85rem', borderRadius: '14px', border: '1px solid var(--border-card)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--teal-800)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <User size={14} /> YOUR DETAILS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Your Full Name (e.g. Rahul)"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              style={{ fontSize: '0.9rem', padding: '0.65rem' }}
            />
            <input
              type="tel"
              className="form-input"
              placeholder="Your Phone Number (Optional)"
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              style={{ fontSize: '0.9rem', padding: '0.65rem' }}
            />
          </div>
        </div>

        {/* Primary Emergency Contact (Mandatory) */}
        <div style={{ backgroundColor: '#ffffff', padding: '0.85rem', borderRadius: '14px', border: '1px solid var(--border-card)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <UserPlus size={14} /> PRIMARY EMERGENCY CONTACT (REQUIRED)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Contact Name (e.g. Mom / Doctor)"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
              style={{ fontSize: '0.9rem', padding: '0.65rem' }}
            />
            <input
              type="tel"
              className="form-input"
              placeholder="Contact Phone Number (e.g. +91 98765 43210)"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              required
              style={{ fontSize: '0.9rem', padding: '0.65rem' }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Relationship (e.g. Mother / Spouse / Friend)"
              value={contactRelation}
              onChange={(e) => setContactRelation(e.target.value)}
              style={{ fontSize: '0.9rem', padding: '0.65rem' }}
            />
          </div>
        </div>

        <div className="onboarding-footer" style={{ marginTop: '0.5rem' }}>
          <div className="onboarding-dots">
            <span className="dot" />
            <span className="dot" />
            <span className="dot active" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', width: '100%', height: '46px', fontSize: '0.9rem', fontWeight: 800 }}>
            COMPLETE SETUP & START PROTECTION
          </button>
        </div>
      </form>
    </div>
  );
};
