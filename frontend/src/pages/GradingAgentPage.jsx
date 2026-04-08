import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const GRADING_AGENT_URL = 'http://localhost:8000';
const API_URL = import.meta.env.VITE_API_URL;

const MEDAL = ['🥇', '🥈', '🥉'];
const RANK_COLORS = [
  'border-yellow-400/40 bg-yellow-400/5',
  'border-slate-400/40 bg-slate-400/5',
  'border-orange-400/40 bg-orange-400/5',
];

export default function GradingAgentPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId] = useState(() => crypto.randomUUID());
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const [conversationStarted, setConversationStarted] = useState(false);
  const [startLoading, setStartLoading] = useState(false);

  const [timeLeft, setTimeLeft] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, active, finished
  const [scoreData, setScoreData] = useState(null);

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [boardUsers, setBoardUsers] = useState([]);
  const [boardLoading, setBoardLoading] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user);
    });
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStart = async () => {
    if (!user || startLoading) return;
    setStartLoading(true);
    setError(null);
    try {
      const res = await fetch(`${GRADING_AGENT_URL}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
      if (!res.ok) throw new Error('Failed to start session. Ensure the grading agent is running.');
      const { question } = await res.json();
      setMessages([{ role: 'assistant', content: question }]);
      setConversationStarted(true);

      try {
        const ttsRes = await fetch(`${GRADING_AGENT_URL}/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId })
        });
        if (ttsRes.ok) {
          const audioBlob = await ttsRes.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audio.play().catch(e => console.error("Audio playback blocked", e));
        }
      } catch (ttsErr) {
        console.warn('TTS for initial question failed:', ttsErr);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setStartLoading(false);
    }
  };

  useEffect(() => {
    if (!conversationStarted || scoreData !== null) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${GRADING_AGENT_URL}/status/${sessionId}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.remaining_seconds !== null) {
          setTimeLeft(data.remaining_seconds);
          if (data.remaining_seconds <= 0) {
            setStatus("finished");
          } else {
            setStatus("active");
          }
        }
        if (data.score) {
          setScoreData(data.score);
          setStatus("finished");
        }
      } catch (err) {
        // ignore silently to prevent spam
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionId, messages.length, scoreData]);

  const loadLeaderboard = async () => {
    setBoardLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch(`${API_URL}/api/v1/users/agent-leaderboard`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to load leaderboard");
      const leaderboard = await res.json();

      setBoardUsers(leaderboard);
    } catch (e) {
      console.error(e);
    } finally {
      setBoardLoading(false);
    }
  };

  useEffect(() => {
    if (showLeaderboard) {
      loadLeaderboard();
    }
  }, [showLeaderboard]);

  const handleSend = async () => {
    if (!input.trim() || !user || status === "finished") return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    setError(null);

    try {
      const chatRes = await fetch(`${GRADING_AGENT_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id || "anonymous",
          session_id: sessionId,
          message: userMsg
        })
      });

      if (!chatRes.ok) throw new Error('Chat failed. Ensure the grading agent is running.');

      const reader = chatRes.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let assistantMsg = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantMsg += chunk;
      }

      // Automatically fetch TTS when chat finishes
      const ttsRes = await fetch(`${GRADING_AGENT_URL}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      });

      if (!ttsRes.ok) {
        console.warn('TTS fetch failed');
      } else {
        const audioBlob = await ttsRes.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play().catch(e => console.error("Audio playback blocked", e));
      }

      setMessages(prev => [...prev, { role: 'assistant', content: assistantMsg }]);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (secs) => {
    if (secs === null) return "3:00";
    if (secs <= 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full min-h-screen px-8 py-8 overflow-auto sm:px-4 sm:py-6 flex flex-row gap-8">

      {/* Main Chat Column */}
      <div className="flex-1 flex flex-col gap-8 min-w-0">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h1 className="text-[1.8rem] font-extrabold text-[#f0eeff] m-0 flex items-center gap-3">
              🤖 Challenge
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLeaderboard(!showLeaderboard)}
                className={`border font-bold px-4 py-2 rounded-xl transition-colors ${showLeaderboard ? 'bg-[#8b5cf6] text-white border-[#8b5cf6]' : 'bg-[rgba(139,92,246,0.1)] border-[rgba(139,92,246,0.3)] text-[#8b5cf6] hover:bg-[rgba(139,92,246,0.2)]'}`}
              >
                🏆 Top Agents
              </button>
              {timeLeft !== null && (
                <div className={`text-xl font-bold px-4 py-2 flex items-center gap-2 rounded-xl border transition-colors ${timeLeft === 0 ? 'text-[#ef9a9a] border-[#e57373]/30 bg-[#e57373]/10' : 'text-[#8b5cf6] border-[#8b5cf6]/30 bg-[#8b5cf6]/10'}`}>
                  ⏱️ {formatTime(timeLeft)}
                </div>
              )}
            </div>
          </div>
          <p className="text-[0.9rem] text-[#6b6490] m-0">Chat naturally with the agent, earn points!</p>
        </div>

        {/* Chat window container */}
        <div className="flex-1 bg-[rgba(22,18,48,0.4)] border border-[rgba(139,92,246,0.15)] rounded-2xl flex flex-col overflow-hidden max-h-[75vh]">
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            {!conversationStarted && (
              <div className="flex flex-col items-center justify-center flex-1 gap-5 py-16">
                <div className="text-5xl">🤖</div>
                <div className="text-center">
                  <p className="text-[#f0eeff] font-bold text-xl mb-1">Ready for the challenge?</p>
                  <p className="text-[#6b6490] text-sm">You'll get a random question and 1 minute to impress the agent.</p>
                </div>
                <button
                  onClick={handleStart}
                  disabled={startLoading || !user}
                  className="bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:bg-[rgba(139,92,246,0.4)] disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-xl transition-colors text-base"
                >
                  {startLoading ? 'Starting...' : 'Start Conversation'}
                </button>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-5 py-3 rounded-2xl ${msg.role === 'user'
                  ? 'bg-[rgba(139,92,246,0.2)] border border-[rgba(139,92,246,0.3)] text-[#f0eeff] rounded-tr-sm'
                  : 'bg-[rgba(255,255,255,0.03)] border border-white/5 text-[#c0b8e8] rounded-tl-sm'
                  }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[75%] px-5 py-3 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-white/5 text-[#6b6490] rounded-tl-sm animate-pulse">
                  Typing...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {error && <div className="px-6 py-3 bg-red-900/20 border-t border-red-500/20 text-red-300 text-[0.9rem]">{error}</div>}

          {status === "finished" && !scoreData && (
            <div className="px-6 py-4 border-t border-[rgba(139,92,246,0.15)] bg-[rgba(139,92,246,0.05)] flex items-center justify-center">
              <div className="text-[#c0b8e8] animate-pulse flex items-center gap-3">
                <svg className="animate-spin h-5 w-5 text-[#8b5cf6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Analyzing your conversation and calculating score...
              </div>
            </div>
          )}

          {scoreData && (
            <div className="p-6 border-t border-[rgba(139,92,246,0.3)] bg-[rgba(13,11,30,0.8)] flex flex-col gap-3">
              <h3 className="text-[#f0eeff] text-xl font-bold m-0 flex items-center gap-2">✅ Grading Complete</h3>
              <div className="text-[2.2rem] font-black text-[#8b5cf6] m-0 leading-none">
                {(scoreData.final_score ?? scoreData.score ?? 0).toLocaleString()} <span className="text-lg text-[#6b6490] font-bold">/ 100K pts</span>
              </div>
              <p className="text-[#c0b8e8] text-[0.95rem] leading-relaxed m-0 border-t border-white/5 pt-3 whitespace-pre-wrap">
                {scoreData.feedback || scoreData.analysis}
              </p>
            </div>
          )}

          {/* Input Bar */}
          {conversationStarted && status !== "finished" && (
            <div className="p-4 border-t border-[rgba(139,92,246,0.15)] bg-[rgba(13,11,30,0.6)]">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-[#f0eeff] outline-none focus:border-[rgba(139,92,246,0.5)] transition-colors"
                  disabled={loading || status === "finished"}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim() || status === "finished"}
                  className="bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:bg-[rgba(139,92,246,0.5)] disabled:cursor-not-allowed text-white px-6 rounded-xl font-semibold transition-colors flex items-center justify-center"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Closable Leaderboard Sidebar */}
      {showLeaderboard && (
        <div className="w-[320px] max-w-full flex-shrink-0 bg-[rgba(22,18,48,0.4)] border border-[rgba(139,92,246,0.15)] rounded-2xl flex flex-col overflow-hidden max-h-[85vh] animate-in slide-in-from-right-4 fade-in duration-300">
          <div className="p-4 border-b border-[rgba(139,92,246,0.15)] bg-[rgba(13,11,30,0.6)] flex justify-between items-center">
            <h2 className="text-[#f0eeff] font-bold text-lg m-0 flex items-center gap-2">🏆 High Scores</h2>
            <button onClick={() => setShowLeaderboard(false)} className="text-[#6b6490] hover:text-[#f0eeff] text-xl transition-colors">&times;</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            {boardLoading ? (
              <div className="text-center text-[#6b6490] my-8 animate-pulse text-sm">Loading scores...</div>
            ) : (
              <>
                {boardUsers.map((bu, i) => {
                  const isTop3 = i < 3;
                  return (
                    <div
                      key={bu.userId}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl border transition-colors ${isTop3
                        ? RANK_COLORS[i]
                        : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                        }`}
                    >
                      <div className="w-6 text-center flex-shrink-0">
                        {isTop3 ? <span className="text-[1.1rem]">{MEDAL[i]}</span> : <span className="text-[0.8rem] font-bold text-[#6b6490]">{i + 1}</span>}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[rgba(139,92,246,0.2)] flex-shrink-0 overflow-hidden text-center flex items-center justify-center">
                        {bu.profilePic ? (
                          <img src={bu.profilePic} alt={bu.name} className="w-full h-full object-cover" />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="rgba(139,92,246,0.8)">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6m0 14c-2.03 0-4.43-.82-6.14-2.88a9.95 9.95 0 0 1 12.28 0C16.43 19.18 14.03 20 12 20" />
                          </svg>
                        )}
                      </div>
                      <span className={`flex-1 font-semibold text-[0.85rem] ${isTop3 ? 'text-[#f0eeff]' : 'text-[#c0b8e8]'} truncate`}>
                        {bu.name}
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className={`font-bold text-[0.85rem] ${isTop3 ? 'text-[#8b5cf6]' : 'text-[#6b6490]'}`}>
                          {Math.round(bu.agentScore).toLocaleString()}
                        </span>
                        <span className="text-[0.65rem] text-[#4b5563]">pts</span>
                      </div>
                    </div>
                  )
                })}
                {boardUsers.length === 0 && <div className="text-center text-[#6b6490] my-8 text-sm">No recorded scores yet! Play a round to get placed.</div>}
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
