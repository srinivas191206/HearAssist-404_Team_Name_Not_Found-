import React, { useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw, Trophy, ChevronRight, FileCheck } from 'lucide-react';
import type { QuizQuestion } from '../../types';
import { hapticService } from '../../services/hapticService';

interface Props {
  questions: QuizQuestion[];
  topic: string;
  onClose: () => void;
}

export const QuizRunner: React.FC<Props> = ({ questions, topic, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
        <p>No quiz questions generated for this topic.</p>
        <button className="btn btn-primary" onClick={onClose}>Back to Learn</button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const isCorrect = selectedOption === currentQ.correctOptionIndex;
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  const handleSelectOption = (idx: number) => {
    if (isSubmitted) return;
    setSelectedOption(idx);
    hapticService.vibrate(30);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setIsSubmitted(true);
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: selectedOption }));

    if (selectedOption === currentQ.correctOptionIndex) {
      hapticService.vibrate([100, 50, 100]);
    } else {
      hapticService.vibrate(200);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
      hapticService.vibrate(30);
    } else {
      setIsCompleted(true);
      hapticService.vibrate([200, 100, 200, 100, 400]);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setUserAnswers({});
    setIsCompleted(false);
    setReviewMode(false);
    hapticService.vibrate(40);
  };

  // Calculate Final Score
  const score = Object.entries(userAnswers).reduce((acc, [qIdx, ans]) => {
    return questions[Number(qIdx)]?.correctOptionIndex === ans ? acc + 1 : acc;
  }, 0);

  /* QUIZ RESULTS REPORT */
  if (isCompleted) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '1.75rem 1.25rem', borderRadius: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
          <div style={{ width: '76px', height: '76px', borderRadius: '50%', backgroundColor: 'var(--teal-50)', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={44} />
          </div>
        </div>

        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          QUIZ COMPLETE
        </h2>

        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--teal-600)', margin: '0.5rem 0' }}>
          {score} / {questions.length}
        </div>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          {score === questions.length ? 'Perfect Score! Excellent Sign Mastery.' : 'Great effort! Review missed questions to reinforce your learning.'}
        </p>

        {/* REVIEW INCORRECT ANSWERS */}
        {reviewMode && (
          <div style={{ textAlign: 'left', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {questions.map((q, idx) => {
              const uAns = userAnswers[idx];
              const qCorrect = uAns === q.correctOptionIndex;
              return (
                <div key={q.id} style={{ backgroundColor: qCorrect ? 'var(--teal-50)' : 'var(--coral-100)', borderRadius: '12px', padding: '0.85rem', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 800, marginBottom: '4px', color: 'var(--text-primary)' }}>
                    Q{idx + 1}: {q.questionText}
                  </div>
                  <div style={{ color: qCorrect ? 'var(--teal-800)' : '#ef4444', fontWeight: 700 }}>
                    {qCorrect ? `✓ ${q.options[q.correctOptionIndex]}` : `Your Answer: ${q.options[uAns]} | Correct: ${q.options[q.correctOptionIndex]}`}
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => setReviewMode(!reviewMode)}>
            {reviewMode ? 'Hide Review' : 'Review Answers'}
          </button>
          <button className="btn btn-primary" onClick={handleRestartQuiz}>
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  /* ACTIVE QUESTION RUNNER */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileCheck size={20} className="text-teal" /> Practice Quiz
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Topic: <strong>{topic}</strong>
          </span>
        </div>

        <button className="btn btn-secondary" onClick={onClose} style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
          Quit
        </button>
      </div>

      {/* VISUAL PROGRESS BAR */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
          <span>QUESTION <strong>{currentIndex + 1}</strong> OF <strong>{questions.length}</strong></span>
          <span>{progressPercent}% Complete</span>
        </div>
        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--slate-200)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: 'var(--teal-600)', transition: 'width 0.3s ease' }} />
        </div>
      </div>

      {/* QUESTION CARD */}
      <div className="card" style={{ border: '2px solid var(--border-card)', borderRadius: '20px', padding: '1.25rem' }}>
        {/* FULLY VISIBLE ANIMATED GESTURE GIF EMBED */}
        {currentQ.imageUrl ? (
          <div style={{ width: '100%', height: '180px', borderRadius: '14px', overflow: 'hidden', marginBottom: '1rem', backgroundColor: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--teal-300)' }}>
            <img
              src={currentQ.imageUrl}
              alt={currentQ.questionText}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        ) : null}

        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem', lineHeight: 1.45 }}>
          {currentQ.questionText}
        </h3>

        {/* OPTIONS GRID */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {currentQ.options.map((opt, optIdx) => {
            const isSelected = selectedOption === optIdx;
            let bgColor = '#ffffff';
            let borderColor = 'var(--border-card)';

            if (isSubmitted) {
              if (optIdx === currentQ.correctOptionIndex) {
                bgColor = 'var(--teal-50)';
                borderColor = 'var(--teal-600)';
              } else if (isSelected && !isCorrect) {
                bgColor = 'var(--coral-100)';
                borderColor = '#ef4444';
              }
            } else if (isSelected) {
              bgColor = 'var(--teal-50)';
              borderColor = 'var(--teal-600)';
            }

            return (
              <div
                key={optIdx}
                onClick={() => handleSelectOption(optIdx)}
                style={{
                  padding: '0.95rem 1.1rem',
                  borderRadius: '14px',
                  border: `2px solid ${borderColor}`,
                  backgroundColor: bgColor,
                  cursor: isSubmitted ? 'default' : 'pointer',
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '0.95rem',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 4px 12px rgba(0, 137, 123, 0.1)' : 'none',
                }}
              >
                <span>{opt}</span>
                {isSubmitted && optIdx === currentQ.correctOptionIndex && (
                  <CheckCircle2 size={22} className="text-teal" />
                )}
                {isSubmitted && isSelected && !isCorrect && (
                  <XCircle size={22} color="#ef4444" />
                )}
              </div>
            );
          })}
        </div>

        {/* SUBMIT OR NEXT BUTTON */}
        {!isSubmitted ? (
          <button
            className="btn btn-primary btn-full"
            disabled={selectedOption === null}
            onClick={handleSubmitAnswer}
            style={{ marginTop: '1.5rem', fontSize: '1rem', height: '48px', borderRadius: '12px' }}
          >
            SUBMIT ANSWER
          </button>
        ) : (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ backgroundColor: isCorrect ? 'var(--teal-50)' : 'var(--coral-100)', borderRadius: '14px', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 900, fontSize: '1rem', color: isCorrect ? 'var(--teal-800)' : '#ef4444', marginBottom: '4px' }}>
                {isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                {isCorrect ? 'CORRECT' : 'NOT QUITE'}
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                {currentQ.explanation}
              </p>
            </div>

            <button className="btn btn-primary btn-full" onClick={handleNextQuestion} style={{ fontSize: '1rem', height: '48px', borderRadius: '12px' }}>
              {currentIndex < questions.length - 1 ? 'NEXT QUESTION' : 'SEE QUIZ RESULTS'} <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
