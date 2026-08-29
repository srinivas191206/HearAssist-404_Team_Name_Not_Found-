import React, { useState } from 'react';
import { BookOpen, Lightbulb, PlayCircle } from 'lucide-react';
import type { SignResource } from '../../types';
import { Modal } from '../../components/common/Modal';

export const CategoryCard: React.FC<{ resource: SignResource }> = ({ resource }) => {
  const [isOpen, setIsOpen] = useState(false);

  const categoryColors: Record<string, string> = {
    basics: '#5eead4',
    everyday: '#38bdf8',
    emergency: '#f87171',
    medical: '#fbbf24',
    social: '#a78bfa',
  };

  const badgeColor = categoryColors[resource.category] || '#5eead4';

  return (
    <>
      <div
        className="card card-interactive"
        onClick={() => setIsOpen(true)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.75rem',
          borderLeft: `4px solid ${badgeColor}`,
          padding: '1.1rem',
          margin: 0,
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: badgeColor,
                letterSpacing: '0.05em',
              }}
            >
              {resource.category}
            </span>
            <PlayCircle size={16} style={{ color: badgeColor }} />
          </div>

          <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 800, marginBottom: '0.25rem' }}>
            {resource.title}
          </h3>

          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {resource.description}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-card)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
            Sign: <strong>{resource.signNotation || resource.title}</strong>
          </span>
          <span style={{ fontSize: '0.75rem', color: badgeColor, fontWeight: 700 }}>Learn →</span>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={`Sign Guide: ${resource.title}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              backgroundColor: '#020617',
              borderRadius: '16px',
              padding: '1.5rem',
              textAlign: 'center',
              border: `2px solid ${badgeColor}`,
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem' }}>
              {resource.title}
            </div>
            <div style={{ fontSize: '1rem', color: badgeColor, fontWeight: 700, textTransform: 'uppercase' }}>
              Gesture Notation: {resource.signNotation || 'Standard Gesture'}
            </div>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <BookOpen size={18} className="text-teal" /> Instructions
            </h4>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.5 }}>
              {resource.description}
            </p>
          </div>

          {resource.tips && resource.tips.length > 0 && (
            <div style={{ backgroundColor: 'var(--slate-800)', borderRadius: '12px', padding: '1rem' }}>
              <h4 style={{ color: '#fbbf24', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Lightbulb size={16} /> Memory & Gesture Tips
              </h4>
              <ul style={{ paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                {resource.tips.map((tip: string, idx: number) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          <button className="btn btn-primary btn-full" onClick={() => setIsOpen(false)}>
            Got It (Close Guide)
          </button>
        </div>
      </Modal>
    </>
  );
};
