import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Layers, FileCheck, X, Sparkles } from 'lucide-react';
import { hearassistAiService } from '../../services/hearassistAiService';
import type { ChatMessage } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contextTopic?: string;
  onGenerateFlashcards?: () => void;
  onGenerateQuiz?: () => void;
}

// Clean markdown text parser (strips ** and converts into structured HTML elements)
const formatMarkdownText = (text: string): React.ReactNode[] => {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    // Process **bold** tags
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const renderedParts = parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={pIdx} style={{ fontWeight: 800, color: '#0f172a' }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });

    const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
    const isNumbered = /^\d+\.\s/.test(line.trim());

    if (isBullet || isNumbered) {
      return (
        <div
          key={lineIdx}
          style={{
            display: 'flex',
            gap: '0.4rem',
            alignItems: 'flex-start',
            marginTop: '0.35rem',
            marginBottom: '0.35rem',
            paddingLeft: '0.25rem',
          }}
        >
          <span style={{ color: '#00897b', fontWeight: 800 }}>•</span>
          <span style={{ flex: 1 }}>{renderedParts}</span>
        </div>
      );
    }

    return (
      <div key={lineIdx} style={{ marginBottom: line.trim() === '' ? '0.4rem' : '0.25rem' }}>
        {renderedParts}
      </div>
    );
  });
};

export const HearAssistChatModal: React.FC<Props> = ({
  isOpen,
  onClose,
  contextTopic = 'Emergency & Accessibility Signs',
  onGenerateFlashcards,
  onGenerateQuiz,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: `Hello! I am HearAssist AI Assistant 🤟. I can help explain sign language, accessibility concepts, or answer questions about **${contextTopic}**. What would you like to learn today?`,
      timestamp: Date.now(),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    const replyText = await hearassistAiService.sendChatMessage(text, contextTopic);

    const assistantMsg: ChatMessage = {
      id: `assistant-${Date.now()}`,
      sender: 'assistant',
      text: replyText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setIsTyping(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '82vh',
          maxHeight: '620px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* 1. PROFESSIONAL CHATBOT HEADER */}
        <div
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: '#00897b',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 10px rgba(0, 137, 123, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                color: '#00897b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                position: 'relative',
              }}
            >
              <Bot size={22} />
              <span
                style={{
                  position: 'absolute',
                  bottom: '1px',
                  right: '1px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  border: '2px solid #ffffff',
                }}
              />
            </div>

            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 900, margin: 0, lineHeight: 1.2 }}>
                HearAssist AI Tutor
              </h3>
              <div style={{ fontSize: '0.725rem', opacity: 0.9, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sparkles size={12} /> <span>Online • Educational AI</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Chat"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. CONTEXT BADGE */}
        <div
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#e6f4f1',
            borderBottom: '1px solid #ccece6',
            fontSize: '0.75rem',
            color: '#00695c',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>Topic Context: <strong>{contextTopic}</strong></span>
          <span style={{ fontSize: '0.7rem', backgroundColor: '#ffffff', padding: '0.15rem 0.5rem', borderRadius: '10px', color: '#00897b' }}>
            Interactive AI
          </span>
        </div>

        {/* 3. MESSAGES SCROLL AREA */}
        <div
          ref={chatContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            backgroundColor: '#f8fafc',
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: '0.6rem',
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '88%',
              }}
            >
              {msg.sender === 'assistant' && (
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: '#00897b',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  <Bot size={16} />
                </div>
              )}

              <div
                style={{
                  backgroundColor: msg.sender === 'user' ? '#00897b' : '#ffffff',
                  color: msg.sender === 'user' ? '#ffffff' : '#1e293b',
                  padding: '0.85rem 1.05rem',
                  borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  boxShadow: msg.sender === 'user' ? '0 4px 14px rgba(0, 137, 123, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                  border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                }}
              >
                {msg.sender === 'user' ? msg.text : formatMarkdownText(msg.text)}
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ display: 'flex', gap: '0.6rem', alignSelf: 'flex-start' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: '#00897b',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Bot size={16} />
              </div>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '0.65rem 1rem',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.8rem',
                  color: '#64748b',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Sparkles size={14} className="animate-spin text-teal" /> HearAssist AI is typing...
              </div>
            </div>
          )}
        </div>

        {/* 4. CHIP PROMPTS & QUICK ACTIONS */}
        <div style={{ padding: '0.65rem 0.85rem', backgroundColor: '#ffffff', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {/* Quick Prompts */}
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.15rem' }}>
            {[
              'What signs should I learn first?',
              'How to sign HELP?',
              'ASL vs ISL differences',
            ].map((promptText, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(promptText)}
                style={{
                  fontSize: '0.725rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '14px',
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #e2e8f0',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                }}
              >
                {promptText}
              </button>
            ))}
          </div>

          {/* Flashcard & Quiz Shortcuts */}
          {(onGenerateFlashcards || onGenerateQuiz) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
              {onGenerateFlashcards && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onGenerateFlashcards();
                  }}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.45rem',
                    borderRadius: '12px',
                    border: '1.5px solid #00897b',
                    backgroundColor: '#e6f4f1',
                    color: '#00897b',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer',
                  }}
                >
                  <Layers size={14} /> Flashcards
                </button>
              )}

              {onGenerateQuiz && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onGenerateQuiz();
                  }}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.45rem',
                    borderRadius: '12px',
                    border: '1.5px solid #00897b',
                    backgroundColor: '#e6f4f1',
                    color: '#00897b',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer',
                  }}
                >
                  <FileCheck size={14} /> Practice Quiz
                </button>
              )}
            </div>
          )}
        </div>

        {/* 5. INPUT BAR */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          style={{
            padding: '0.75rem 0.85rem',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            className="form-input"
            placeholder="Ask HearAssist Assistant..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            style={{
              flex: 1,
              fontSize: '0.875rem',
              padding: '0.75rem 1rem',
              borderRadius: '24px',
              border: '1.5px solid #cbd5e1',
              backgroundColor: '#f8fafc',
            }}
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isTyping}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: !inputQuery.trim() || isTyping ? '#cbd5e1' : '#00897b',
              color: '#ffffff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: !inputQuery.trim() || isTyping ? 'not-allowed' : 'pointer',
              boxShadow: !inputQuery.trim() || isTyping ? 'none' : '0 4px 12px rgba(0, 137, 123, 0.3)',
              flexShrink: 0,
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
