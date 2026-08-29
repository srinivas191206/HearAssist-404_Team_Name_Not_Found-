import React, { useState } from 'react';
import { UserPlus, Trash2, Phone, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { EmergencyContact } from '../../types';

export const ContactsConfig: React.FC = () => {
  const { contacts, updateContacts } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const newContact: EmergencyContact = {
      id: `contact-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      relationship: relationship.trim() || 'Family',
      isPrimary: contacts.length === 0,
    };

    updateContacts([...contacts, newContact]);
    setName('');
    setPhone('');
    setRelationship('');
  };

  const handleRemove = (id: string) => {
    const filtered = contacts.filter((c) => c.id !== id);
    if (filtered.length > 0 && !filtered.some((c) => c.isPrimary)) {
      filtered[0].isPrimary = true;
    }
    updateContacts(filtered);
  };

  const handleSetPrimary = (id: string) => {
    const updated = contacts.map((c) => ({
      ...c,
      isPrimary: c.id === id,
    }));
    updateContacts(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--teal-50)', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Phone size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
            Emergency Contacts
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Configured contacts will receive SMS alerts with live GPS location
          </span>
        </div>
      </div>

      {/* Existing Contacts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {contacts.map((c) => (
          <div
            key={c.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc',
              border: `1.5px solid ${c.isPrimary ? 'var(--teal-600)' : 'var(--border-card)'}`,
              borderRadius: '14px',
              padding: '0.85rem 1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{c.name}</span>
                {c.isPrimary && (
                  <span className="badge badge-teal" style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <ShieldCheck size={12} /> Primary SOS
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {c.phone} • <span style={{ color: 'var(--teal-700)', fontWeight: 600 }}>{c.relationship}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {!c.isPrimary && (
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.725rem' }}
                  onClick={() => handleSetPrimary(c.id)}
                >
                  Make Primary
                </button>
              )}
              <button
                onClick={() => handleRemove(c.id)}
                style={{ color: '#ef4444', padding: '6px', background: 'none', border: 'none', cursor: 'pointer' }}
                aria-label="Remove Contact"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {contacts.length === 0 && (
          <div style={{ backgroundColor: '#fff5f5', border: '1px solid #ffe3e3', borderRadius: '14px', padding: '0.85rem 1rem', color: '#c53030', fontSize: '0.85rem', textAlign: 'center' }}>
            No emergency contacts added yet. Please add at least one contact below.
          </div>
        )}
      </div>

      {/* Add New Contact Form */}
      <form onSubmit={handleAddContact} style={{ borderTop: '1px solid var(--border-card)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Add New Contact
        </div>

        <div className="form-group">
          <input
            type="text"
            className="form-input"
            placeholder="Full Name (e.g. Mom)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ fontSize: '0.95rem', borderRadius: '12px' }}
          />
        </div>

        <div className="form-group">
          <input
            type="tel"
            className="form-input"
            placeholder="Phone Number (e.g. +91 98765 43210)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            style={{ fontSize: '0.95rem', borderRadius: '12px' }}
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            className="form-input"
            placeholder="Relationship (e.g. Family / Doctor / Friend)"
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            style={{ fontSize: '0.95rem', borderRadius: '12px' }}
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '44px', marginTop: '0.25rem', fontSize: '0.9rem', fontWeight: 800 }}>
          <UserPlus size={18} /> Add Contact
        </button>
      </form>
    </div>
  );
};
