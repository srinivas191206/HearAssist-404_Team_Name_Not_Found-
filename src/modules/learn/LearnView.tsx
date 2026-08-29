import React, { useState } from 'react';
import { ArrowLeft, Search, BookOpen, Video, Heart, ShieldAlert, Stethoscope, ChevronRight, XCircle, Sparkles, Layers, Bot, Zap, Bell, Home, Sun, Shield, Flame, AlertTriangle, Check, X, Trophy } from 'lucide-react';
import { learnSearchService, type GroupedSearchResults } from '../../services/learnSearchService';
import { hearassistAiService } from '../../services/hearassistAiService';
import { useApp } from '../../context/AppContext';
import type { SignResource, Flashcard, QuizQuestion } from '../../types';
import { ResourceDetailModal } from './ResourceDetailModal';
import { HearAssistChatModal } from './HearAssistChatModal';
import { FlashcardDeck } from './FlashcardDeck';
import { QuizRunner } from './QuizRunner';

export const LearnView: React.FC = () => {
  const { setActiveTab } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedResource, setSelectedResource] = useState<SignResource | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Phase 6B AI Assistant & Interactive Learning State
  const [activeMode, setActiveMode] = useState<'resources' | 'flashcards' | 'quiz'>('resources');
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<Flashcard[]>([]);
  const [generatedQuiz, setGeneratedQuiz] = useState<QuizQuestion[]>([]);

  const searchResults: GroupedSearchResults = learnSearchService.search(searchQuery);
  const searchHistory = learnSearchService.getSearchHistory();

  const currentTopicContext = searchQuery ? searchQuery : 'Emergency Signs';

  const handleSelectResource = (res: SignResource) => {
    setSelectedResource(res);
    setIsDetailModalOpen(true);
  };

  const handleQuickSignClick = (signName: string) => {
    setSearchQuery(signName);
    setActiveMode('resources');
  };

  const handleCategoryClick = (catId: string) => {
    setActiveCategory(catId);
    if (catId === 'all') {
      setSearchQuery('');
    } else {
      setSearchQuery(catId);
    }
    setActiveMode('resources');
  };

  // Phase 6B Flashcard Generator Trigger
  const handleGenerateFlashcards = async () => {
    const cards = await hearassistAiService.generateFlashcards(currentTopicContext);
    setGeneratedFlashcards(cards);
    setActiveMode('flashcards');
  };

  // Phase 6B Quiz Generator Trigger
  const handleGenerateQuiz = async () => {
    const qz = await hearassistAiService.generateQuiz(currentTopicContext);
    setGeneratedQuiz(qz);
    setActiveMode('quiz');
  };

  const handleSeeSignOfTheDay = () => {
    const helpRes = learnSearchService.getResourceById('res-1');
    if (helpRes) {
      handleSelectResource(helpRes);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', paddingBottom: '140px', boxSizing: 'border-box' }}>
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
            <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '0.05em' }}>
              Learn
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1px' }}>
              Learn signs, find answers & practice.
            </p>
          </div>
        </div>

        {/* Top Right Notification Bell */}
        <div style={{ position: 'relative' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#ffffff', border: '1px solid var(--border-card)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <Bell size={20} />
          </div>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', border: '2px solid #ffffff', position: 'absolute', top: '-1px', right: '-1px' }} />
        </div>
      </div>

      {/* MODE 2: FLASHCARD DECK VIEW */}
      {activeMode === 'flashcards' && (
        <FlashcardDeck
          flashcards={generatedFlashcards}
          topic={currentTopicContext}
          onOpenResource={(resId) => {
            const res = learnSearchService.getResourceById(resId);
            if (res) handleSelectResource(res);
          }}
          onClose={() => setActiveMode('resources')}
        />
      )}

      {/* MODE 3: QUIZ RUNNER VIEW */}
      {activeMode === 'quiz' && (
        <QuizRunner
          questions={generatedQuiz}
          topic={currentTopicContext}
          onClose={() => setActiveMode('resources')}
        />
      )}

      {/* MODE 1: MAIN EDUCATIONAL DISCOVERY DASHBOARD */}
      {activeMode === 'resources' && (
        <>
          {/* 2. FULL-WIDTH SLEEK SEARCH BAR */}
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              className="form-input"
              placeholder="What do you want to learn?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '2.75rem',
                paddingRight: searchQuery ? '2.5rem' : '1rem',
                fontSize: '0.925rem',
                height: '52px',
                borderRadius: '16px',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
                border: '1px solid var(--border-card)',
                fontWeight: 600,
              }}
            />
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
              >
                <XCircle size={18} />
              </button>
            )}
          </div>

          {/* SEARCH HISTORY CHIPS (WHEN SEARCH ACTIVE) */}
          {!searchQuery && searchHistory.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.15rem' }}>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Recent Searches:</span>
              {searchHistory.map((q, idx) => (
                <button
                  key={idx}
                  className="btn btn-secondary"
                  onClick={() => setSearchQuery(q)}
                  style={{ fontSize: '0.725rem', padding: '0.15rem 0.55rem', borderRadius: '10px', whiteSpace: 'nowrap' }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* SEARCH RESULTS SECTION */}
          {searchQuery ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Found <strong>{searchResults.totalCount}</strong> relevant resources for "<strong>{searchQuery}</strong>"
                </div>

                <button
                  className="btn btn-outline-teal"
                  onClick={() => setIsAiChatOpen(true)}
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                >
                  <Sparkles size={14} /> Ask AI About "{searchQuery}"
                </button>
              </div>

              {searchResults.totalCount === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <XCircle size={40} className="text-muted" style={{ marginBottom: '0.5rem' }} />
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    No direct resources found
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Try searching for related keywords or ask HearAssist AI Assistant:
                  </p>
                  <button className="btn btn-primary" onClick={() => setIsAiChatOpen(true)}>
                    <Bot size={16} /> Ask HearAssist Assistant
                  </button>
                </div>
              ) : (
                <>
                  {/* SIGN DEMONSTRATIONS */}
                  {searchResults.signVideos.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--teal-800)', marginBottom: '0.65rem' }}>
                        SIGN LANGUAGE DEMONSTRATIONS ({searchResults.signVideos.length})
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {searchResults.signVideos.map((res) => (
                          <div
                            key={res.id}
                            className="card"
                            onClick={() => handleSelectResource(res)}
                            style={{ cursor: 'pointer', display: 'flex', gap: '0.85rem', padding: '0.85rem' }}
                          >
                            <img
                              src={res.thumbnailUrl}
                              alt={res.title}
                              style={{ width: '90px', height: '70px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, backgroundColor: 'var(--slate-100)' }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
                              <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                                  {res.title}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                  {res.authorOrChannel} {res.duration && `• ${res.duration}`}
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '4px' }}>
                                <span className="badge badge-teal" style={{ fontSize: '0.65rem' }}>{res.signLanguage}</span>
                                <span className="badge badge-slate" style={{ fontSize: '0.65rem' }}>{res.category}</span>
                              </div>
                            </div>
                            <ChevronRight size={18} style={{ alignSelf: 'center', color: 'var(--slate-400)' }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <>
              {/* 3. QUICK SIGNS SECTION */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    QUICK SIGNS
                  </span>

                  <span style={{ fontSize: '0.775rem', fontWeight: 800, color: 'var(--teal-700)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    View all <ChevronRight size={14} />
                  </span>
                </div>

                {/* QUICK SIGNS HORIZONTAL SCROLL CHIPS */}
                <div style={{ display: 'flex', gap: '0.55rem', overflowX: 'auto', paddingBottom: '0.35rem', scrollbarWidth: 'none' }}>
                  {[
                    { name: 'HELP', icon: Zap, color: '#ef4444', bg: '#ffebee' },
                    { name: 'EMERGENCY', icon: ShieldAlert, color: '#ef4444', bg: '#ffebee' },
                    { name: 'POLICE', icon: Shield, color: '#1a73e8', bg: '#e8f0fe' },
                    { name: 'HOSPITAL', icon: Stethoscope, color: '#2e7d32', bg: '#e8f5e9' },
                    { name: 'FIRE', icon: Flame, color: '#f57c00', bg: '#fff3e0' },
                    { name: 'DANGER', icon: AlertTriangle, color: '#ef4444', bg: '#ffebee' },
                    { name: 'YES', icon: Check, color: '#2e7d32', bg: '#e8f5e9' },
                    { name: 'NO', icon: X, color: '#e53935', bg: '#ffebee' },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="card"
                      onClick={() => handleQuickSignClick(item.name.toLowerCase())}
                      style={{
                        cursor: 'pointer',
                        padding: '0.6rem 0.85rem',
                        borderRadius: '16px',
                        border: '1px solid var(--border-card)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        backgroundColor: '#ffffff',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <item.icon size={13} />
                      </div>
                      <span style={{ fontSize: '0.775rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. CONTINUE LEARNING PROGRESS CARD */}
              <div
                className="card"
                style={{
                  padding: '1.1rem 1.15rem',
                  borderRadius: '18px',
                  backgroundColor: '#f4fbf7',
                  border: '1px solid var(--teal-200)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1 }}>
                  {/* Signing Hands Icon Circle */}
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'var(--teal-50)', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BookOpen size={24} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                      Continue Learning
                    </div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                      Emergency Signs
                    </div>

                    {/* Progress Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.5rem' }}>
                      <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--slate-200)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: '70%', height: '100%', backgroundColor: 'var(--teal-600)', borderRadius: '3px' }} />
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        7 / 10 Completed
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={handleGenerateFlashcards}
                  style={{
                    fontSize: '0.775rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '12px',
                    marginLeft: '0.75rem',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  Continue <ChevronRight size={14} />
                </button>
              </div>

              {/* 5. BROWSE CATEGORIES SECTION */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                  BROWSE CATEGORIES
                </div>

                {/* 2-COLUMN CATEGORY GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {[
                    { id: 'basics', title: 'Sign Basics', sub: 'Alphabet, numbers & basic signs', icon: BookOpen, color: '#2e7d32', bg: '#e8f5e9' },
                    { id: 'everyday', title: 'Everyday Conversation', sub: 'Greetings, questions & daily talks', icon: Video, color: '#1976d2', bg: '#e3f2fd' },
                    { id: 'emergency', title: 'Emergency Signs', sub: 'Help, danger, police, fire & more', icon: ShieldAlert, color: '#e53935', bg: '#ffebee' },
                    { id: 'medical', title: 'Medical Communication', sub: 'Doctor, pain, symptoms & hospital signs', icon: Stethoscope, color: '#8e24aa', bg: '#f3e5f5' },
                    { id: 'daily', title: 'Daily Life', sub: 'Home, food, shopping, travel & more', icon: Home, color: '#f57c00', bg: '#fff3e0' },
                    { id: 'social', title: 'Social & Emotions', sub: 'Relationships, feelings & expressions', icon: Heart, color: '#d81b60', bg: '#fce4ec' },
                  ].map((cat) => (
                    <div
                      key={cat.id}
                      className="card"
                      onClick={() => handleCategoryClick(cat.id)}
                      style={{
                        cursor: 'pointer',
                        padding: '0.9rem',
                        borderRadius: '18px',
                        border: '1px solid var(--border-card)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        backgroundColor: activeCategory === cat.id ? 'var(--teal-50)' : '#ffffff',
                      }}
                    >
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: cat.bg, color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <cat.icon size={20} />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.25 }}>
                          {cat.title}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.25, marginTop: '2px' }}>
                          {cat.sub}
                        </div>
                      </div>

                      <ChevronRight size={16} style={{ color: 'var(--slate-400)', flexShrink: 0 }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. PRACTICE & IMPROVE SECTION (FLASHCARDS & QUIZ) */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                  PRACTICE & IMPROVE
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {/* FLASHCARDS CARD */}
                  <div
                    className="card"
                    onClick={handleGenerateFlashcards}
                    style={{
                      cursor: 'pointer',
                      padding: '0.95rem 0.85rem',
                      borderRadius: '18px',
                      backgroundColor: '#e8f5e9',
                      border: '1px solid var(--teal-200)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                    }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'var(--teal-600)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Layers size={20} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 900, color: 'var(--teal-900)' }}>
                        Flashcards
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--teal-700)', marginTop: '2px', lineHeight: 1.2 }}>
                        Memorize signs effectively
                      </div>
                    </div>

                    <ChevronRight size={16} style={{ color: 'var(--teal-700)', flexShrink: 0 }} />
                  </div>

                  {/* QUIZ CARD */}
                  <div
                    className="card"
                    onClick={handleGenerateQuiz}
                    style={{
                      cursor: 'pointer',
                      padding: '0.95rem 0.85rem',
                      borderRadius: '18px',
                      backgroundColor: '#f3e5f5',
                      border: '1px solid #e1bee7',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                    }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#8e24aa', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Trophy size={20} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 900, color: '#4a148c' }}>
                        Quiz
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#6a1b9a', marginTop: '2px', lineHeight: 1.2 }}>
                        Test your knowledge & track progress
                      </div>
                    </div>

                    <ChevronRight size={16} style={{ color: '#8e24aa', flexShrink: 0 }} />
                  </div>
                </div>
              </div>

              {/* 7. SIGN OF THE DAY BANNER */}
              <div
                className="card"
                style={{
                  padding: '0.95rem 1.15rem',
                  borderRadius: '18px',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Sun size={20} />
                  </div>

                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 900, color: '#92400e' }}>
                      Sign of the Day
                    </div>
                    <div style={{ fontSize: '0.675rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '1px' }}>
                      LEARN SOMETHING NEW EVERY DAY
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-secondary"
                  onClick={handleSeeSignOfTheDay}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '0.45rem 0.75rem',
                    borderRadius: '12px',
                    backgroundColor: '#ffffff',
                    color: '#92400e',
                    border: '1px solid #fde68a',
                  }}
                >
                  See Today's Sign
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* FLOATING HEARASSIST AI ASSISTANT LOGO BUTTON (BOTTOM RIGHT WIDGET ANCHORED TO PHONE FRAME) */}
      <div
        className="ask-ai-floating-btn"
        onClick={() => setIsAiChatOpen(true)}
      >
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#ffffff', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bot size={18} />
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: 900, letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
          Ask AI
        </span>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
      </div>

      {/* RESOURCE DETAIL MODAL */}
      <ResourceDetailModal
        resource={selectedResource}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onAskAiAboutSign={(topicTitle) => {
          setSearchQuery(topicTitle);
          setIsAiChatOpen(true);
        }}
      />

      {/* HEARASSIST AI CHAT MODAL */}
      <HearAssistChatModal
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        contextTopic={currentTopicContext}
        onGenerateFlashcards={handleGenerateFlashcards}
        onGenerateQuiz={handleGenerateQuiz}
      />
    </div>
  );
};
