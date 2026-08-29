import React, { useState } from 'react';
import { RotateCw, ChevronLeft, ChevronRight, Video, Layers } from 'lucide-react';
import type { Flashcard } from '../../types';
import { hapticService } from '../../services/hapticService';

interface Props {
  flashcards: Flashcard[];
  topic: string;
  onOpenResource?: (resourceId: string) => void;
  onClose: () => void;
}

export const FlashcardDeck: React.FC<Props> = ({ flashcards, topic, onOpenResource, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
        <p>No flashcards generated for this topic.</p>
        <button className="btn btn-primary" onClick={onClose}>Back to Learn</button>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / flashcards.length) * 100);

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
    hapticService.vibrate(40);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    hapticService.vibrate(30);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    hapticService.vibrate(30);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Layers size={20} className="text-teal" /> Flashcard Practice
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Topic: <strong>{topic}</strong>
          </span>
        </div>

        <button className="btn btn-secondary" onClick={onClose} style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
          Done
        </button>
      </div>

      {/* VISUAL PROGRESS BAR */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
          <span>Card <strong>{currentIndex + 1}</strong> of <strong>{flashcards.length}</strong></span>
          <span>{progressPercent}% Complete</span>
        </div>
        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--slate-200)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: 'var(--teal-600)', transition: 'width 0.3s ease' }} />
        </div>
      </div>

      {/* 3D INTERACTIVE FLASHCARD CONTAINER */}
      <div
        className="card"
        onClick={handleCardFlip}
        style={{
          minHeight: '340px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          cursor: 'pointer',
          border: isFlipped ? '2px solid var(--teal-600)' : '2px solid var(--slate-300)',
          backgroundColor: isFlipped ? 'var(--teal-50)' : '#ffffff',
          boxShadow: isFlipped ? '0 8px 24px rgba(0, 137, 123, 0.15)' : 'var(--shadow-md)',
          padding: '1.25rem',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease',
          textAlign: 'center',
          userSelect: 'none',
          borderRadius: '20px',
          transform: isFlipped ? 'scale(1.02)' : 'scale(1)',
        }}
      >
        {!isFlipped ? (
          /* FRONT SIDE (QUESTION ONLY - GIF HIDDEN UNTIL FLIPPED) */
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', minHeight: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <span className="badge badge-teal" style={{ fontSize: '0.75rem', padding: '0.35rem 0.85rem' }}>
                {currentCard.frontTopic}
              </span>
            </div>

            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', margin: '2rem 0', lineHeight: 1.4 }}>
              {currentCard.frontQuestion}
            </div>

            <div style={{ backgroundColor: 'var(--teal-50)', padding: '0.85rem', borderRadius: '14px', border: '1px solid var(--teal-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--teal-700)', fontWeight: 800, fontSize: '0.875rem' }}>
              <RotateCw size={18} /> Tap Card to Reveal Gesture GIF & Answer
            </div>
          </div>
        ) : (
          /* BACK SIDE (REVEALED ANIMATED GIF + FULLY VISIBLE GESTURE DEMO) */
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', minHeight: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <span className="badge badge-slate" style={{ backgroundColor: 'var(--teal-600)', color: '#ffffff', fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}>
                GESTURE ANSWER & ANIMATED GIF
              </span>
            </div>

            {/* FULLY VISIBLE ANIMATED GIF CONTAINER */}
            {currentCard.imageUrl ? (
              <div style={{ width: '100%', height: '180px', borderRadius: '14px', overflow: 'hidden', margin: '0.75rem 0', backgroundColor: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--teal-300)' }}>
                <img
                  src={currentCard.imageUrl}
                  alt={currentCard.backAnswer}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            ) : null}

            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--teal-900)', marginTop: '0.25rem', marginBottom: '0.25rem' }}>
              {currentCard.backAnswer}
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '0.75rem 0.85rem', border: '1px solid var(--teal-200)', textAlign: 'left', margin: '0.35rem 0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--teal-800)', marginBottom: '3px' }}>
                Step-by-Step Gesture Steps:
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                {currentCard.explanation}
              </p>
            </div>

            {/* DIRECT VIDEO DEMO LINK BUTTON */}
            {currentCard.relatedResourceId && onOpenResource && (
              <button
                className="btn btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenResource(currentCard.relatedResourceId!);
                }}
                style={{ fontSize: '0.8rem', alignSelf: 'center', padding: '0.45rem 0.95rem', borderRadius: '10px', marginTop: '0.25rem' }}
              >
                <Video size={15} /> Watch Full Sign Video Demo
              </button>
            )}

            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.4rem' }}>
              Tap card again to flip back
            </div>
          </div>
        )}
      </div>

      {/* CONTROLS (PREVIOUS / NEXT) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
        <button className="btn btn-secondary btn-full" onClick={handlePrev} style={{ fontSize: '0.9rem', height: '48px' }}>
          <ChevronLeft size={18} /> Previous Card
        </button>

        <button className="btn btn-primary btn-full" onClick={handleNext} style={{ fontSize: '0.9rem', height: '48px' }}>
          Next Card <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
