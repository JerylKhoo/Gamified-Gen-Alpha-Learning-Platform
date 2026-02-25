import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const API_URL = import.meta.env.VITE_API_URL;

function formatLessonId(lessonId) {
  return lessonId
    .replace(/[-_.]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function parseOptions(optionsJson) {
  if (!optionsJson) return [];
  try { return JSON.parse(optionsJson); }
  catch { return []; }
}

function parseJsonArray(jsonStr) {
  if (!jsonStr) return [];
  try { return JSON.parse(jsonStr); }
  catch { return []; }
}

export default function AdaptiveLearningPage() {
  const { lessonId } = useParams();
  const navigate     = useNavigate();

  const [question, setQuestion]    = useState(null);
  const [abilityScore, setAbility] = useState(0);
  const [selected, setSelected]    = useState(null);  // option string clicked
  const [correct, setCorrect]      = useState(null);  // null | true | false
  const [loading, setLoading]      = useState(true);
  const [error, setError]          = useState('');
  const [mastered, setMastered]    = useState(false);
  const [questionCount, setCount]  = useState(1);

  // ── On mount: fetch prior progress + first question ───────────────────────
  useEffect(() => {
    let cancelled = false;

    async function initPage() {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers = { Authorization: `Bearer ${session.access_token}` };

        // 1. Fetch prior progress to determine starting question number
        let priorCount = 0;
        const progressRes = await fetch(
          `${API_URL}/api/v1/progress/lesson/${lessonId}`,
          { headers }
        );
        if (progressRes.ok) {
          const progress = await progressRes.json();
          const correct  = parseJsonArray(progress.correctQuestions);
          const wrong    = parseJsonArray(progress.wrongQuestions);
          priorCount = correct.length + wrong.length;
        }
        // 404 = no prior progress → priorCount stays 0

        // 2. Fetch first adaptive question (sends existing adaptive state to service)
        const res = await fetch(`${API_URL}/api/v1/adaptive/next`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonId, questionId: null, correct: false }),
        });
        if (!res.ok) throw new Error('Failed to fetch question');
        const data = await res.json();

        if (cancelled) return;

        setAbility(data.abilityScore);

        if (!data.nextQuestion) {
          setMastered(true);
        } else {
          setQuestion(data.nextQuestion);
          setCount(priorCount + 1);  // set directly — never increments, so StrictMode double-call is safe
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    initPage();
    return () => { cancelled = true; };
  }, [lessonId]);

  // ── Advance to next question (user-triggered, not in useEffect) ───────────
  async function advanceQuestion(questionId, wasCorrect) {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/api/v1/adaptive/next`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ lessonId, questionId, correct: wasCorrect }),
      });
      if (!res.ok) throw new Error('Failed to fetch question');
      const data = await res.json();
      setAbility(data.abilityScore);
      if (!data.nextQuestion) {
        setMastered(true);
        setQuestion(null);
      } else {
        setQuestion(data.nextQuestion);
        setSelected(null);
        setCorrect(null);
        setCount(c => c + 1);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const title         = formatLessonId(lessonId);
  const options       = question ? parseOptions(question.options) : [];
  const correctOption = question ? options[parseInt(question.answer, 10)] : null;

  function handleSelect(option) {
    if (correct !== null) return;
    setSelected(option);
    setCorrect(option === correctOption);
  }

  // ── Mastery screen ─────────────────────────────────────────────────────────
  if (mastered) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center px-8 py-12 text-center">
        <div className="mb-5 text-7xl">🏆</div>
        <h1 className="text-3xl font-extrabold text-[#f0eeff] m-0 mb-2">Lesson Mastered!</h1>
        <p className="text-[#9ca3af] text-base m-0 mb-2">{title}</p>
        <p className="text-[#8b5cf6] font-bold text-xl m-0 mb-8">
          Final Score: {Math.round(abilityScore)} / 100
        </p>
        <button
          onClick={() => navigate('/home/learn')}
          className="px-8 py-3 bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white font-bold rounded-xl shadow-[0_4px_18px_rgba(139,92,246,0.4)] hover:opacity-90 hover:-translate-y-px transition-all"
        >
          ← Back to Courses
        </button>
      </div>
    );
  }

  // ── Error screen ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 text-red-400">
        <p className="text-lg font-semibold">{error}</p>
        <button onClick={() => navigate('/home/learn')} className="text-sm text-[#8b5cf6] underline">
          Back to Courses
        </button>
      </div>
    );
  }

  // ── Main quiz ──────────────────────────────────────────────────────────────
  return (
    <div className="w-full min-h-screen px-8 py-8 overflow-auto sm:px-4 sm:py-6">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/home/learn')}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[#9ca3af] hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-[1.05rem] font-extrabold text-[#f0eeff] m-0 leading-tight truncate">{title}</h1>
          <p className="text-[#6b6490] text-xs m-0">Adaptive Learning</p>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-[0.7rem] text-[#6b6490] m-0 leading-none mb-0.5">Ability</p>
          <p className="text-[1rem] font-bold text-[#8b5cf6] m-0 leading-none">{Math.round(abilityScore)}</p>
        </div>
      </div>

      {/* Ability progress bar */}
      <div className="w-full h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full mb-8">
        <div
          className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] rounded-full transition-all duration-700"
          style={{ width: `${Math.min(Math.max(abilityScore, 0), 100)}%` }}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#6b6490]">
          <p className="text-lg font-semibold animate-pulse">Loading question...</p>
        </div>
      ) : question && (
        <div className="max-w-2xl mx-auto">

          {/* Question card */}
          <div className="bg-[#0d0f18] border border-[rgba(255,255,255,0.07)] rounded-2xl p-6 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[0.65rem] text-[#4b5563] font-semibold tracking-[0.12em] uppercase">
                Question {questionCount}
              </span>
              <span className="ml-auto text-[0.65rem] text-[#4b5563] font-medium">
                Difficulty {question.score}
              </span>
            </div>
            <p className="text-[#f0eeff] text-[1rem] font-semibold leading-relaxed m-0">
              {question.question}
            </p>
          </div>

          {/* Answer options */}
          <div className="flex flex-col gap-2.5 mb-4">
            {options.map((option, i) => {
              let cls = 'border-[rgba(255,255,255,0.1)] text-[#d1d5db] hover:border-[rgba(139,92,246,0.45)] hover:text-[#f0eeff] hover:bg-[rgba(139,92,246,0.06)]';
              if (correct !== null) {
                if (option === correctOption)              cls = 'border-green-500/60 bg-green-500/10 text-green-300';
                else if (option === selected && !correct) cls = 'border-red-500/60 bg-red-500/10 text-red-300';
                else                                      cls = 'border-[rgba(255,255,255,0.05)] text-[#4b5563]';
              }
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(option)}
                  disabled={correct !== null}
                  className={`w-full text-left px-5 py-3.5 rounded-xl border bg-[#0d0f18] text-[0.9rem] font-medium cursor-pointer transition-all duration-200 disabled:cursor-default ${cls}`}
                >
                  <span className="text-[#6b7280] font-bold mr-3">{String.fromCharCode(65 + i)}.</span>
                  {option}
                </button>
              );
            })}
          </div>

          {/* Explanation panel */}
          {correct !== null && (
            <div
              className={`rounded-2xl p-5 border transition-all ${
                correct
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10  border-red-500/30'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-base">{correct ? '✅' : '❌'}</span>
                <span className={`font-bold text-[0.88rem] ${correct ? 'text-green-400' : 'text-red-400'}`}>
                  {correct ? 'Correct!' : 'Incorrect'}
                </span>
                {!correct && (
                  <span className="text-[0.8rem] text-[#9ca3af]">
                    — correct answer:{' '}
                    <span className="text-green-400 font-semibold">{correctOption}</span>
                  </span>
                )}
              </div>

              {question.explanation && (
                <p className="text-[#d1d5db] text-[0.86rem] leading-relaxed m-0 mb-3">
                  {question.explanation}
                </p>
              )}

              <button
                onClick={() => advanceQuestion(question.questionId, correct)}
                className="px-6 py-2.5 bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white font-bold text-[0.88rem] rounded-xl border-none cursor-pointer shadow-[0_4px_14px_rgba(139,92,246,0.35)] hover:opacity-90 hover:-translate-y-px active:translate-y-0 transition-all"
              >
                Next Question →
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
