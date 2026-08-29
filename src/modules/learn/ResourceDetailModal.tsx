import React from 'react';
import { FileText, ExternalLink, Bot, CheckCircle2, Video } from 'lucide-react';
import type { SignResource } from '../../types';
import { Modal } from '../../components/common/Modal';

interface Props {
  resource: SignResource | null;
  isOpen: boolean;
  onClose: () => void;
  onAskAiAboutSign?: (topic: string) => void;
}

export const ResourceDetailModal: React.FC<Props> = ({ resource, isOpen, onClose, onAskAiAboutSign }) => {
  if (!resource) return null;

  const directVideoUrl = resource.externalUrl || (resource.embedUrl ? resource.embedUrl.replace('-nocookie.com/embed/', '.com/watch?v=') : '');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={resource.title}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', touchAction: 'pan-y' }}>
        {/* VIDEO PLAYER OR THUMBNAIL BANNER */}
        {resource.embedUrl ? (
          <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: '14px', overflow: 'hidden', backgroundColor: '#0f172a', boxShadow: 'var(--shadow-sm)' }}>
            <iframe
              src={resource.embedUrl}
              title={resource.title}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', height: '180px' }}>
            <img src={resource.thumbnailUrl} alt={resource.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {resource.externalUrl ? (
                <a href={resource.externalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  <ExternalLink size={18} /> Open External Document
                </a>
              ) : (
                <div style={{ color: '#ffffff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={24} /> {resource.type.toUpperCase()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* METADATA TAGS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="badge badge-teal">
            {resource.signLanguage}
          </span>
          <span className="badge badge-slate">
            Category: {resource.category.toUpperCase()}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Source: {resource.authorOrChannel} {resource.duration && `• ${resource.duration}`}
          </span>
        </div>

        {/* DIRECT EXTERNAL WATCH LINK BUTTON */}
        {directVideoUrl && (
          <a
            href={directVideoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ fontSize: '0.825rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: '10px' }}
          >
            <Video size={16} className="text-teal" /> Watch Video Directly on YouTube <ExternalLink size={14} />
          </a>
        )}

        {/* DESCRIPTION */}
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
          {resource.description}
        </p>

        {/* STEP-BY-STEP GESTURE GUIDE */}
        {resource.gestureSteps && resource.gestureSteps.length > 0 && (
          <div style={{ backgroundColor: 'var(--teal-50)', borderRadius: '12px', padding: '0.85rem 1rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--teal-800)', marginBottom: '0.5rem' }}>
              Step-by-Step Gesture Guide:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.825rem', color: 'var(--text-primary)' }}>
              {resource.gestureSteps.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} className="text-teal" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRACTICAL TIPS */}
        {resource.tips && resource.tips.length > 0 && (
          <div style={{ backgroundColor: 'var(--slate-100)', borderRadius: '10px', padding: '0.75rem 0.85rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <strong>Learning Tip:</strong> {resource.tips[0]}
          </div>
        )}

        {/* ASK AI ABOUT THIS SIGN BUTTON */}
        <div style={{ borderTop: '1px solid var(--border-card)', paddingTop: '0.85rem', marginTop: '0.5rem' }}>
          <button
            className="btn btn-primary btn-full"
            style={{ fontSize: '0.85rem' }}
            onClick={() => {
              onClose();
              if (onAskAiAboutSign) {
                onAskAiAboutSign(resource.title);
              }
            }}
          >
            <Bot size={16} /> Ask HearAssist AI Assistant About "{resource.title}"
          </button>
        </div>
      </div>
    </Modal>
  );
};
