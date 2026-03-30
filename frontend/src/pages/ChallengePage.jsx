import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

const API_URL = import.meta.env.VITE_API_URL;

function parsePoints(points) {
  return Number(points) || 0;
}

const MEDAL = ['\u{1F947}', '\u{1F948}', '\u{1F949}'];
const RANK_COLORS = [
  'border-yellow-400/40 bg-yellow-400/5',
  'border-slate-400/40 bg-slate-400/5',
  'border-orange-400/40 bg-orange-400/5',
];

function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`${API_URL}/api/v1/users/leaderboard`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) throw new Error('Failed to load leaderboard');
        setUsers(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center gap-2 mb-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
        <h2 className="text-[1.2rem] font-bold text-[#f0eeff] m-0">Leaderboard</h2>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 text-[#6b6490] text-[0.9rem]">Loading...</div>
      )}

      {error && <div className="text-red-400 text-[0.85rem] py-2">{error}</div>}

      {!loading && !error && (
        <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 pr-1">
          {users.map((user, i) => {
            const pts = parsePoints(user.points);
            const isTop3 = i < 3;
            return (
              <div
                key={user.userId}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                  isTop3
                    ? RANK_COLORS[i]
                    : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                }`}
              >
                <div className="w-6 text-center flex-shrink-0">
                  {isTop3 ? (
                    <span className="text-[1.1rem]">{MEDAL[i]}</span>
                  ) : (
                    <span className="text-[0.8rem] font-bold text-[#6b6490]">{i + 1}</span>
                  )}
                </div>
                <div className="w-8 h-8 rounded-full bg-[rgba(139,92,246,0.2)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="rgba(139,92,246,0.8)">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6m0 14c-2.03 0-4.43-.82-6.14-2.88a9.95 9.95 0 0 1 12.28 0C16.43 19.18 14.03 20 12 20"/>
                    </svg>
                  )}
                </div>
                <span className={`flex-1 font-semibold text-[0.85rem] truncate ${isTop3 ? 'text-[#f0eeff]' : 'text-[#c0b8e8]'}`}>
                  {user.name}
                </span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className={`font-bold text-[0.85rem] ${isTop3 ? 'text-[#8b5cf6]' : 'text-[#6b6490]'}`}>
                    {pts.toLocaleString()}
                  </span>
                  <span className="text-[0.7rem] text-[#4b5563]">pts</span>
                </div>
              </div>
            );
          })}
          {users.length === 0 && (
            <p className="text-center text-[#6b6490] py-8 text-[0.85rem]">No users yet. Be the first!</p>
          )}
        </div>
      )}
    </div>
  );
}

function AIChatbot() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hey! I'm your AI challenge buddy. Ask me a question about what you're learning and I'll quiz you!" },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/api/v1/ai/challenge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error('Failed to get response');
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply || data.message || 'Hmm, I didn\'t get that. Try again!' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Oops, something went wrong. Try again!' }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
        </svg>
        <h2 className="text-[1.2rem] font-bold text-[#f0eeff] m-0">AI Challenge</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 mb-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[85%] px-4 py-3 rounded-2xl text-[0.9rem] leading-relaxed ${
              msg.role === 'user'
                ? 'self-end bg-[#8b5cf6] text-white rounded-br-md'
                : 'self-start bg-[rgba(139,92,246,0.12)] text-[#e0d8f8] border border-[rgba(139,92,246,0.2)] rounded-bl-md'
            }`}
          >
            {msg.text}
          </div>
        ))}
        {sending && (
          <div className="self-start px-4 py-3 rounded-2xl rounded-bl-md bg-[rgba(139,92,246,0.12)] border border-[rgba(139,92,246,0.2)] text-[#6b6490] text-[0.9rem]">
            <span className="animate-pulse">Thinking...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask me a challenge question..."
          className="flex-1 px-4 py-3 rounded-xl bg-[rgba(139,92,246,0.08)] border border-[rgba(139,92,246,0.2)] text-[#f0eeff] text-[0.9rem] outline-none placeholder:text-[#4b4570] focus:border-[#8b5cf6] transition-colors"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="px-4 py-3 rounded-xl bg-[#8b5cf6] text-white font-semibold text-[0.9rem] border-none cursor-pointer transition-all hover:bg-[#7c3aed] disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>
          </svg>
        </button>
      </form>
    </div>
  );
}

export default function ChallengePage() {
  return (
    <div className="w-full h-screen flex flex-col lg:flex-row">
      {/* Left - AI Challenge */}
      <div className="flex-1 flex flex-col p-8 sm:p-5 min-h-[50vh] lg:min-h-0 lg:h-screen overflow-hidden">
        <AIChatbot />
      </div>

      {/* Divider */}
      <div className="hidden lg:block w-px bg-[rgba(139,92,246,0.2)] flex-shrink-0" />
      <div className="lg:hidden h-px bg-[rgba(139,92,246,0.2)] flex-shrink-0" />

      {/* Right - Leaderboard */}
      <div className="flex-1 flex flex-col p-8 sm:p-5 min-h-[50vh] lg:min-h-0 lg:h-screen overflow-hidden">
        <Leaderboard />
      </div>
    </div>
  );
}
