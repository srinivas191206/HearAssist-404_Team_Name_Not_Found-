import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mic, MicOff, RotateCcw, Trash2, Volume2, Activity, ArrowDown } from 'lucide-react';
import { speechService } from '../../services/speechService';
import { hapticService } from '../../services/hapticService';
import { useApp } from '../../context/AppContext';
import type { TranscriptEntry } from '../../types';

export const ICantHearYouView: React.FC = () => {
  const { preferences, permissions, updatePermissions, setActiveTab } = useApp();

  const [commsStatus, setCommsStatus] = useState<'listening' | 'processing' | 'paused' | 'stopped'>('stopped');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // REAL LIVE TRANSCRIPT ENTRIES (NO FAKE / HARDCODED TRANSCRIPTS)
  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>([]);

  // Live Interim Partial Speech Stream
  const [partialText, setPartialText] = useState<string>('');

  // Type & Speak Bottom Input State
  const [typedResponse, setTypedResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);

  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const getCurrentTimeString = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // 1. AUTOMATIC CONTINUOUS STT START ON MOUNT
  useEffect(() => {
    if (permissions.microphone === 'granted' || permissions.microphone === 'prompt') {
      handleStartListening();
    }

    // CLEANUP ON UNMOUNT: Release microphone cleanly when leaving Comm.
    return () => {
      speechService.stopListening();
    };
  }, []);

  // SMART AUTO SCROLL TO BOTTOM OF CHAT (RESPECTS MANUAL USER SCROLLING)
  useEffect(() => {
    if (!userHasScrolledUp && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [transcriptEntries, partialText, userHasScrolledUp]);

  const handleChatScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 80;
      setUserHasScrolledUp(!isNearBottom);
    }
  };

  const handleScrollToBottom = () => {
    setUserHasScrolledUp(false);
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // START / RE-START CONTINUOUS SPEECH RECOGNITION (STT STREAM)
  const handleStartListening = () => {
    setErrorMsg(null);
    hapticService.vibrate(30);

    const success = speechService.startListening(
      (partial: string) => {
        setPartialText(partial);
      },
      (final: string) => {
        const cleanText = final.trim();
        if (!cleanText) return;

        // Incremental Sub-phrase Merging & Deduplication
        setTranscriptEntries((prev) => {
          if (prev.length === 0) {
            const newEntry: TranscriptEntry = {
              id: `entry-${Date.now()}`,
              speaker: 'other',
              text: cleanText,
              timestamp: getCurrentTimeString(),
              isFinal: true,
            };
            return [newEntry];
          }

          const lastEntry = prev[prev.length - 1];
          const lastText = lastEntry.text.toLowerCase().trim();
          const currentText = cleanText.toLowerCase().trim();

          if (lastText === currentText) {
            return prev;
          }

          // If current phrase expands on previous sub-phrase (e.g., "so" -> "so nice" -> "so nice to hear"), update existing card!
          if (lastEntry.speaker === 'other' && (currentText.startsWith(lastText) || lastText.startsWith(currentText))) {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...lastEntry,
              text: cleanText,
              timestamp: getCurrentTimeString(),
            };
            return updated;
          }

          const newEntry: TranscriptEntry = {
            id: `entry-${Date.now()}`,
            speaker: 'other',
            text: cleanText,
            timestamp: getCurrentTimeString(),
            isFinal: true,
          };
          return [...prev, newEntry];
        });

        setPartialText('');
        hapticService.vibrate([30, 30]);
      },
      (err: string) => {
        setErrorMsg(err);
        setCommsStatus('stopped');
      },
      (status: 'listening' | 'processing' | 'paused' | 'stopped') => {
        setCommsStatus(status);
        if (status === 'listening') {
          updatePermissions({ microphone: 'granted' });
        }
      }
    );

    if (!success && permissions.microphone === 'denied') {
      setErrorMsg('Microphone permission required. Tap Allow to grant mic access.');
    }
  };

  // INTENTIONAL PAUSE / RESUME TOGGLE (PAUSE IS DISTINCT FROM NATURAL SILENCE)
  const handleToggleListening = () => {
    if (commsStatus === 'listening') {
      speechService.pauseListening();
      setCommsStatus('paused');
      hapticService.vibrate(20);
    } else {
      handleStartListening();
    }
  };

  // CLEAR TRANSCRIPT (DOES NOT STOP CONTINUOUS MICROPHONE)
  const handleClearTranscript = () => {
    hapticService.vibrate(20);
    setTranscriptEntries([]);
    setPartialText('');
  };

  // REPEAT LAST FINALIZED SENTENCE VIA TTS
  const handleRepeatLast = () => {
    const lastEntry = [...transcriptEntries].reverse().find((e) => e.isFinal && e.text.trim());
    const textToSpeak = lastEntry ? lastEntry.text : speechService.getLastSpokenText();

    if (!textToSpeak) return;

    hapticService.vibrate(40);
    setIsSpeaking(true);

    // Pause STT during TTS playback to avoid audio feedback
    speechService.stopListening();

    speechService.speak(textToSpeak, preferences.autoTTSVolume, () => {
      setIsSpeaking(false);
      // Auto-resume continuous listening after TTS completes
      handleStartListening();
    });
  };

  // TYPE & SPEAK ACTION (Speaks typed or chip text aloud via TTS)
  const handleSendTypedSpeech = (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const text = (overrideText || typedResponse).trim();
    if (!text) return;

    hapticService.vibrate(40);
    setIsSpeaking(true);

    const newEntry: TranscriptEntry = {
      id: `entry-${Date.now()}`,
      speaker: 'you',
      text: text,
      timestamp: getCurrentTimeString(),
      isFinal: true,
    };

    setTranscriptEntries((prev) => [...prev, newEntry]);
    setTypedResponse('');

    // Stop STT temporarily so Android TTS audio plays cleanly through speaker
    speechService.stopListening();

    // Speak typed text aloud via Text-to-Speech
    speechService.speak(text, preferences.autoTTSVolume, () => {
      setIsSpeaking(false);
      // Auto-resume continuous listening for hearing person's response!
      handleStartListening();
    });
  };

  // QUICK RESPONSE CHIP SELECTION
  const handleQuickChipSelect = (chipText: string) => {
    handleSendTypedSpeech(undefined, chipText);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', height: '100%', position: 'relative' }}>
      {/* 1. HEADER WITH TRUTHFUL CONTINUOUS LISTENING STATUS BADGE */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
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
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={18} />
          </button>

          <img src="/logo.png" alt="HearAssist Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain', flexShrink: 0 }} />

          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap' }}>
              Communicate
            </h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0, whiteSpace: 'nowrap' }}>
              Live speech to text
            </p>
          </div>
        </div>

        {/* TRUTHFUL LIVE STATUS CONTROL BADGE */}
        <button
          onClick={handleToggleListening}
          style={{
            backgroundColor: commsStatus === 'listening' ? '#e6f4ea' : commsStatus === 'paused' ? '#f8fafc' : '#fef2f2',
            color: commsStatus === 'listening' ? 'var(--teal-700)' : commsStatus === 'paused' ? '#64748b' : '#dc2626',
            border: `1.5px solid ${commsStatus === 'listening' ? 'var(--teal-600)' : commsStatus === 'paused' ? '#cbd5e1' : '#fca5a5'}`,
            padding: '0.35rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.725rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {commsStatus === 'listening' ? (
            <>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--teal-600)', animation: 'pulse 1s infinite' }} />
              <span>● LISTENING</span>
            </>
          ) : commsStatus === 'paused' ? (
            <>
              <MicOff size={13} />
              <span>PAUSED • START MIC</span>
            </>
          ) : (
            <>
              <MicOff size={13} />
              <span>⚠ MIC UNAVAILABLE</span>
            </>
          )}
        </button>
      </div>

      {/* ERROR / PERMISSION BANNER */}
      {errorMsg && (
        <div style={{ backgroundColor: '#fff5f5', border: '1px solid #ffe3e3', color: '#c53030', padding: '0.65rem 0.85rem', borderRadius: '12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{errorMsg}</span>
          <button onClick={handleStartListening} style={{ backgroundColor: '#c53030', color: '#fff', border: 'none', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.725rem', fontWeight: 800, cursor: 'pointer' }}>
            Allow Microphone
          </button>
        </div>
      )}

      {/* 2. REAL-TIME CONTINUOUS SPEECH STATUS CARD */}
      <div
        className="card"
        style={{
          padding: '0.75rem 1rem',
          borderRadius: '16px',
          backgroundColor: commsStatus === 'listening' ? '#f4fbf7' : '#ffffff',
          border: `1.5px solid ${commsStatus === 'listening' ? 'var(--teal-200)' : 'var(--border-card)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: commsStatus === 'listening' ? 'var(--teal-50)' : 'var(--slate-100)', color: commsStatus === 'listening' ? 'var(--teal-600)' : 'var(--slate-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mic size={20} className={commsStatus === 'listening' ? 'pulse-icon' : ''} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 900, color: commsStatus === 'listening' ? 'var(--teal-800)' : 'var(--text-primary)' }}>
              {commsStatus === 'listening' ? 'Continuous Live Speech Active' : 'Microphone Paused'}
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              {commsStatus === 'listening' ? 'Listening continuously. Spoken sentences commit automatically.' : 'Tap START MIC to resume listening.'}
            </div>
          </div>
        </div>

        {commsStatus === 'listening' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <div style={{ width: '3px', height: '14px', backgroundColor: 'var(--teal-600)', borderRadius: '2px', animation: 'pulse 0.8s infinite' }} />
            <div style={{ width: '3px', height: '20px', backgroundColor: 'var(--teal-600)', borderRadius: '2px', animation: 'pulse 1.2s infinite' }} />
            <div style={{ width: '3px', height: '10px', backgroundColor: 'var(--teal-600)', borderRadius: '2px', animation: 'pulse 0.6s infinite' }} />
          </div>
        )}
      </div>

      {/* 3. CONTINUOUS LIVE CONVERSATION FEED */}
      <div
        className="card"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '20px',
          padding: '1rem',
          backgroundColor: '#ffffff',
          minHeight: '260px',
          maxHeight: '380px',
          position: 'relative',
        }}
      >
        {/* Chat Header Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            💬 LIVE CONVERSATION FEED
          </span>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleRepeatLast} disabled={transcriptEntries.length === 0} style={{ background: 'none', border: 'none', color: transcriptEntries.length > 0 ? 'var(--teal-700)' : '#94a3b8', fontSize: '0.75rem', fontWeight: 700, cursor: transcriptEntries.length > 0 ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <RotateCcw size={13} /> Repeat
            </button>
            <button onClick={handleClearTranscript} disabled={transcriptEntries.length === 0 && !partialText} style={{ background: 'none', border: 'none', color: transcriptEntries.length > 0 || partialText ? '#ef4444' : '#94a3b8', fontSize: '0.75rem', fontWeight: 700, cursor: transcriptEntries.length > 0 || partialText ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Trash2 size={13} /> Clear
            </button>
          </div>
        </div>

        {/* Chat Messages Feed Container */}
        <div
          ref={chatContainerRef}
          onScroll={handleChatScroll}
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            paddingRight: '4px',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {transcriptEntries.length === 0 && !partialText ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 1rem' }}>
              <Mic size={32} style={{ opacity: 0.3, marginBottom: '0.5rem', color: 'var(--teal-600)' }} />
              <p style={{ fontWeight: 800, fontSize: '0.9rem', margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>Live Conversation Active</p>
              <p style={{ fontSize: '0.75rem', margin: 0, maxWidth: '240px' }}>Speak near the phone. Spoken sentences will appear here continuously as people talk.</p>
            </div>
          ) : (
            transcriptEntries.map((entry) => {
              const isYou = entry.speaker === 'you';
              return (
                <div
                  key={entry.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isYou ? 'flex-end' : 'flex-start',
                  }}
                >
                  <span style={{ fontSize: '0.675rem', fontWeight: 800, color: isYou ? 'var(--teal-700)' : 'var(--slate-500)', marginBottom: '3px' }}>
                    {isYou ? '🔊 YOU (SPOKEN ALOUD)' : '💬 OTHER PERSON'} • {entry.timestamp}
                  </span>

                  <div
                    style={{
                      maxWidth: '85%',
                      backgroundColor: isYou ? '#e0f2fe' : '#e8f5e9',
                      color: isYou ? '#0369a1' : '#1b5e20',
                      padding: '0.75rem 0.95rem',
                      borderRadius: isYou ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                      fontSize: '0.925rem',
                      fontWeight: 700,
                      lineHeight: 1.4,
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                    }}
                  >
                    {entry.text}
                  </div>
                </div>
              );
            })
          )}

          {/* Active Live Partial Speech Stream Bubble */}
          {partialText && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.675rem', fontWeight: 800, color: 'var(--teal-600)', marginBottom: '3px' }}>
                💬 OTHER PERSON (SPEAKING...)
              </span>
              <div style={{ maxWidth: '85%', backgroundColor: '#f1f8e9', color: '#2e7d32', padding: '0.75rem 0.95rem', borderRadius: '18px 18px 18px 2px', fontSize: '0.9rem', fontStyle: 'italic', border: '1px solid var(--teal-300)' }}>
                {partialText}...
              </div>
            </div>
          )}

          <div ref={transcriptEndRef} />
        </div>

        {/* FLOATING "JUMP TO LATEST" BUTTON FOR MANUAL SCROLL */}
        {userHasScrolledUp && (
          <button
            onClick={handleScrollToBottom}
            style={{
              position: 'absolute',
              bottom: '1rem',
              right: '1rem',
              backgroundColor: 'var(--teal-600)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '20px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.725rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
              cursor: 'pointer',
              zIndex: 10,
            }}
          >
            <ArrowDown size={13} /> Latest
          </button>
        )}
      </div>

      {/* 4. QUICK RESPONSE CHIPS (TAP TO SPEAK ALOUD) */}
      <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '2px', WebkitOverflowScrolling: 'touch' }}>
        <button onClick={() => handleQuickChipSelect('Yes, I am coming!')} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', borderRadius: '20px', whiteSpace: 'nowrap', fontWeight: 700 }}>
          Yes, I am coming!
        </button>
        <button onClick={() => handleQuickChipSelect('No, thank you.')} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', borderRadius: '20px', whiteSpace: 'nowrap', fontWeight: 700 }}>
          No, thank you.
        </button>
        <button onClick={() => handleQuickChipSelect('Could you please repeat that?')} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', borderRadius: '20px', whiteSpace: 'nowrap', fontWeight: 700 }}>
          Can you repeat that?
        </button>
        <button onClick={() => handleQuickChipSelect('Give me 5 minutes.')} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', borderRadius: '20px', whiteSpace: 'nowrap', fontWeight: 700 }}>
          Give me 5 mins.
        </button>
      </div>

      {/* 5. INTEGRATED TYPE & SPEAK INPUT BAR (WITH VOLUME/SPEAKER BUTTON ON THE RIGHT) */}
      <form
        onSubmit={(e) => handleSendTypedSpeech(e)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: '#ffffff',
          padding: '0.5rem 0.65rem',
          borderRadius: '24px',
          border: '1.5px solid var(--teal-600)',
          boxShadow: '0 4px 14px rgba(13, 148, 136, 0.15)',
        }}
      >
        <input
          type="text"
          placeholder="Type your response to speak aloud..."
          value={typedResponse}
          onChange={(e) => setTypedResponse(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '0.9rem',
            padding: '0.4rem 0.5rem',
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
            fontWeight: 600,
          }}
        />

        {/* 🔊 RIGHT VOLUME / SPEAK ALOUD BUTTON */}
        <button
          type="submit"
          disabled={!typedResponse.trim() || isSpeaking}
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: typedResponse.trim() ? 'var(--teal-600)' : 'var(--slate-200)',
            color: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: typedResponse.trim() ? 'pointer' : 'default',
            flexShrink: 0,
            transition: 'all 0.2s ease',
            boxShadow: typedResponse.trim() ? '0 4px 12px rgba(13, 148, 136, 0.3)' : 'none',
          }}
          aria-label="Speak response aloud"
        >
          {isSpeaking ? <Activity size={18} className="pulse-icon" /> : <Volume2 size={20} />}
        </button>
      </form>
    </div>
  );
};
