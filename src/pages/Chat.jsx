import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, BookOpen, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { askQuestion } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SUGGESTIONS = [
  'Summarize the key points from my documents',
  'What are the main topics covered?',
  'Find any dates or deadlines mentioned',
  'What conclusions are drawn in the documents?',
];

function TypingDots() {
  return (
    <div className="dots">
      <div className="dot" /><div className="dot" /><div className="dot" />
    </div>
  );
}

function SourcesPanel({ sources }) {
  const [open, setOpen] = useState(false);
  if (!sources?.length) return null;
  return (
    <div className="sources">
      <div className="sources-title" style={{ cursor: 'pointer' }} onClick={() => setOpen(!open)}>
        <BookOpen size={12} />
        {sources.length} source{sources.length > 1 ? 's' : ''} used
        <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontSize: '0.7rem' }}>
          {open ? '▲ hide' : '▼ show'}
        </span>
      </div>
      {open && sources.map((s, i) => (
        <div key={i} className="source-item">
          <div className="source-header">
            <span className="source-filename">{s.filename}</span>
            <span className="source-score">score: {s.score}</span>
          </div>
          <div className="source-snippet">{s.snippet}</div>
        </div>
      ))}
    </div>
  );
}

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (question) => {
    const q = (question || input).trim();
    if (!q || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setLoading(true);
    try {
      const { data } = await askQuestion(q);
      setMessages(prev => [...prev, { role: 'ai', content: data.answer, sources: data.sources }]);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to get answer');
      setMessages(prev => [...prev, { role: 'ai', content: '⚠️ Something went wrong. Please try again.', sources: [] }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const initials = user?.username?.slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="chat-layout">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 60 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, var(--accent), #22d3a5)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Sparkles size={26} color="#fff" />
            </div>
            <div className="section-title" style={{ marginBottom: 6 }}>Ask your documents</div>
            <div className="section-sub" style={{ marginBottom: 28 }}>Questions are answered only from your private documents</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxWidth: 500, width: '100%' }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} className="btn btn-ghost"
                  style={{ justifyContent: 'flex-start', textAlign: 'left', lineHeight: 1.4, padding: '12px 14px', height: 'auto' }}
                  onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`message message-${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? initials : <Bot size={16} />}
            </div>
            <div className="message-body">
              <div className="message-role">{msg.role === 'user' ? 'You' : 'DocMind AI'}</div>
              <div className="message-content">
                {msg.role === 'ai' ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
              {msg.role === 'ai' && <SourcesPanel sources={msg.sources} />}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message message-ai">
            <div className="message-avatar"><Bot size={16} /></div>
            <div className="message-body">
              <div className="message-role">DocMind AI</div>
              <div className="message-content"><TypingDots /></div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="chat-input-bar">
        <div className="chat-input-row">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            placeholder="Ask anything about your documents… (Enter to send, Shift+Enter for newline)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            style={{ height: 'auto' }}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
            }}
            disabled={loading}
          />
          <button className="chat-send-btn" onClick={() => send()} disabled={loading || !input.trim()}>
            <Send size={16} />
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: '0.75rem', color: 'var(--text3)' }}>
          Answers are strictly based on your uploaded documents
        </div>
      </div>
    </div>
  );
}
