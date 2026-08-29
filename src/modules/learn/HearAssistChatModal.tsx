import React, { useState } from 'react';
import { Send, Bot, Layers, FileCheck } from 'lucide-react';
import { hearassistAiService } from '../../services/hearassistAiService';
import type { ChatMessage } from '../../types';
import { Modal } from '../../components/common/Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contextTopic?: string;
  onGenerateFlashcards?: () => void;
  onGenerateQuiz?: () => void;
}

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
      text: `Hello! I am HearAssist Assistant 🤟. I can help explain sign language, accessibility concepts, or answer questions about **${contextTopic}**. What would you like to learn today?`,
      timestamp: Date.now(),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

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
    <Modal isOpen={isOpen} onClose={onClose} title="🤟 HearAssist AI Educational Assistant">
      <div style={{ display: 'flex', flexDirection: 'column', height: '420px', gap: '0.85rem' }}>
        {/* CONTEXT TOPIC BANNER */}
        <div style={{ backgroundColor: 'var(--teal-50)', padding: '0.5rem 0.85rem', borderRadius: '10px', fontSize: '0.775rem', color: 'var(--teal-800)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Current Context: <strong>{contextTopic}</strong></span>
          <span style={{ fontSize: '0.7rem', color: 'var(--teal-600)' }}>Educational Only</span>
        </div>

        {/* MESSAGES STREAM */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.25rem' }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: '0.5rem',
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
              }}
            >
              {msg.sender === 'assistant' && (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--teal-600)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                  <Bot size={16} />
                </div>
              )}

              <div
                style={{
                  backgroundColor: msg.sender === 'user' ? 'var(--teal-600)' : 'var(--slate-100)',
                  color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                  padding: '0.75rem 0.95rem',
                  borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  fontSize: '0.875rem',
                  lineHeight: 1.45,
                  whiteSpace: 'pre-line',
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--teal-600)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={16} />
              </div>
              <div style={{ backgroundColor: 'var(--slate-100)', padding: '0.5rem 0.85rem', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* 6. CONTEXTUAL SUGGESTED PROMPT CHIPS */}
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
          {[
            'What signs should I learn first?',
            'Explain this simply',
            'ASL vs ISL differences',
          ].map((promptText, i) => (
            <button
              key={i}
              className="btn btn-secondary"
              onClick={() => handleSendMessage(promptText)}
              style={{ fontSize: '0.725rem', padding: '0.25rem 0.65rem', borderRadius: '12px', whiteSpace: 'nowrap' }}
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* QUICK ACTION BUTTONS (GENERATE FLASHCARDS & QUIZ) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {onGenerateFlashcards && (
            <button
              className="btn btn-secondary"
              onClick={() => {
                onClose();
                onGenerateFlashcards();
              }}
              style={{ fontSize: '0.775rem', padding: '0.4rem' }}
            >
              <Layers size={14} className="text-teal" /> Generate Flashcards
            </button>
          )}

          {onGenerateQuiz && (
            <button
              className="btn btn-secondary"
              onClick={() => {
                onClose();
                onGenerateQuiz();
              }}
              style={{ fontSize: '0.775rem', padding: '0.4rem' }}
            >
              <FileCheck size={14} className="text-teal" /> Generate Quiz
            </button>
          )}
        </div>

        {/* INPUT BAR */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          style={{ display: 'flex', gap: '0.5rem' }}
        >
          <input
            type="text"
            className="form-input"
            placeholder="Ask HearAssist Assistant..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            style={{ flex: 1, fontSize: '0.875rem' }}
          />
          <button type="submit" className="btn btn-primary" disabled={!inputQuery.trim() || isTyping}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </Modal>
  );
};
