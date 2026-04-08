import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../context/ToastContext';

const API_URL = import.meta.env.VITE_API_URL;

function formatCourseId(courseId) {
  return courseId
    .replace(/[-_.]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

// Handles jsonb fields that may arrive as a string or already-parsed object/array
function parseJsonField(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return null; }
  }
  return val;
}

// ── Question Type Badges ────────────────────────────────────────────────────

const TYPE_BADGE = {
  'Multiple Choice': { label: 'Multiple Choice', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  'True/False':      { label: 'True / False',    color: 'text-sky-400    bg-sky-500/10    border-sky-500/20'    },
  'Fill in the Blank':{ label: 'Fill in Blank',  color: 'text-amber-400  bg-amber-500/10  border-amber-500/20'  },
  'Matching':        { label: 'Matching',         color: 'text-teal-400   bg-teal-500/10   border-teal-500/20'   },
};

// ── Multiple Choice ─────────────────────────────────────────────────────────

function MultipleChoiceCard({ options, answer, selected, onSelect, submitted }) {
  const correctSet = new Set(answer);
  return (
    <div className="flex flex-col gap-2.5">
      {options.map((option, i) => {
        let cls = 'border-[rgba(255,255,255,0.1)] text-[#d1d5db] hover:border-[rgba(139,92,246,0.45)] hover:text-[#f0eeff] hover:bg-[rgba(139,92,246,0.06)]';
        if (submitted) {
          if (correctSet.has(option))       cls = 'border-green-500/60 bg-green-500/10 text-green-300';
          else if (option === selected)     cls = 'border-red-500/60 bg-red-500/10 text-red-300';
          else                              cls = 'border-[rgba(255,255,255,0.05)] text-[#4b5563]';
        } else if (option === selected) {
          cls = 'border-[rgba(139,92,246,0.6)] bg-[rgba(139,92,246,0.1)] text-[#f0eeff]';
        }
        return (
          <button
            key={i}
            onClick={() => onSelect(option)}
            disabled={submitted}
            className={`w-full text-left px-5 py-3.5 rounded-xl border bg-[#0d0f18] text-[0.9rem] font-medium cursor-pointer transition-all duration-200 disabled:cursor-default ${cls}`}
          >
            <span className="text-[#6b7280] font-bold mr-3">{String.fromCharCode(65 + i)}.</span>
            {option}
          </button>
        );
      })}
    </div>
  );
}

// ── True / False ────────────────────────────────────────────────────────────

function TrueFalseCard({ answer, selected, onSelect, submitted }) {
  const correctAnswer = answer[0];
  return (
    <div className="flex gap-4">
      {['True', 'False'].map((opt) => {
        let cls = 'border-[rgba(255,255,255,0.1)] text-[#d1d5db] hover:border-[rgba(139,92,246,0.45)] hover:text-[#f0eeff] hover:bg-[rgba(139,92,246,0.06)]';
        if (submitted) {
          if (opt === correctAnswer)        cls = 'border-green-500/60 bg-green-500/10 text-green-300';
          else if (opt === selected)        cls = 'border-red-500/60 bg-red-500/10 text-red-300';
          else                              cls = 'border-[rgba(255,255,255,0.05)] text-[#4b5563]';
        } else if (opt === selected) {
          cls = 'border-[rgba(139,92,246,0.6)] bg-[rgba(139,92,246,0.1)] text-[#f0eeff]';
        }
        const icon = opt === 'True' ? '✓' : '✗';
        return (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            disabled={submitted}
            className={`flex-1 flex flex-col items-center justify-center py-8 gap-2 rounded-xl border bg-[#0d0f18] text-[1rem] font-bold cursor-pointer transition-all duration-200 disabled:cursor-default ${cls}`}
          >
            <span className="text-2xl">{icon}</span>
            <span>{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Fill in the Blank ───────────────────────────────────────────────────────

function FillInTheBlankCard({ answer, inputValue, onChange, onSubmit, submitted, isCorrect }) {
  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={(e) => { e.preventDefault(); if (!submitted) onSubmit(); }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => onChange(e.target.value)}
            disabled={submitted}
            placeholder="Type your answer here..."
            autoFocus
            className={`flex-1 px-5 py-3.5 rounded-xl border bg-[#0d0f18] text-[0.9rem] text-[#f0eeff] placeholder-[#4b5563] outline-none transition-all duration-200 ${
              submitted
                ? isCorrect
                  ? 'border-green-500/60 bg-green-500/10'
                  : 'border-red-500/60 bg-red-500/10'
                : 'border-[rgba(255,255,255,0.1)] focus:border-[rgba(139,92,246,0.6)] focus:bg-[rgba(139,92,246,0.04)]'
            }`}
          />
          {!submitted && (
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="px-5 py-3.5 bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white font-bold text-[0.88rem] rounded-xl border-none cursor-pointer shadow-[0_4px_14px_rgba(139,92,246,0.35)] hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          )}
        </div>
      </form>
      {submitted && !isCorrect && (
        <p className="text-[0.82rem] text-[#9ca3af]">
          Accepted:{' '}
          <span className="text-green-400 font-semibold">{answer.join(' / ')}</span>
        </p>
      )}
    </div>
  );
}

// ── Matching ────────────────────────────────────────────────────────────────

function MatchingCard({ options, answer, onComplete, submitted, submittedPairs }) {
  // options[0] = left terms, options[1] = right definitions
  const leftItems = options[0] ?? [];

  // Right side starts shuffled; user drags to reorder
  const [rightOrder, setRightOrder] = useState(() =>
    [...(options[1] ?? [])].sort(() => Math.random() - 0.5)
  );
  const [dragIndex, setDragIndex]       = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // correct mapping: { leftTerm → rightDef }
  const correctMap = {};
  (answer ?? []).forEach(pair => { correctMap[pair[0]] = pair[1]; });

  function handleDragStart(i) {
    setDragIndex(i);
  }

  function handleDragOver(e, i) {
    e.preventDefault();
    if (i !== dragIndex) setDragOverIndex(i);
  }

  function handleDrop(i) {
    if (dragIndex === null || dragIndex === i) return;
    const next = [...rightOrder];
    [next[dragIndex], next[i]] = [next[i], next[dragIndex]];
    setRightOrder(next);
    setDragIndex(null);
    setDragOverIndex(null);
  }

  function handleConfirm() {
    const pairs = {};
    leftItems.forEach((term, i) => { pairs[term] = rightOrder[i]; });
    const allCorrect = leftItems.every((term, i) => rightOrder[i] === correctMap[term]);
    onComplete(pairs, allCorrect);
  }

  return (
    <div className="flex flex-col gap-4">
      {!submitted && (
        <p className="text-[0.72rem] text-[#6b6490] text-center">
          Drag the answers on the right to match each term on the left, then confirm
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        {/* Left — fixed terms */}
        <div className="flex flex-col gap-2">
          <p className="text-[0.6rem] text-[#4b5563] font-semibold tracking-[0.12em] uppercase mb-0.5">
            Terms
          </p>
          {leftItems.map((term, i) => {
            const correct = submitted && submittedPairs[term] === correctMap[term];
            return (
              <div
                key={i}
                className={`px-3.5 py-3 rounded-xl border bg-[#0d0f18] text-[0.8rem] font-medium min-h-[44px] flex items-center transition-all duration-150 ${
                  submitted
                    ? correct ? 'border-green-500/60 bg-green-500/10 text-green-300'
                               : 'border-red-500/60 bg-red-500/10 text-red-300'
                    : 'border-[rgba(255,255,255,0.1)] text-[#d1d5db]'
                }`}
              >
                {term}
              </div>
            );
          })}
        </div>

        {/* Right — reorderable answers */}
        <div className="flex flex-col gap-2">
          <p className="text-[0.6rem] text-[#4b5563] font-semibold tracking-[0.12em] uppercase mb-0.5">
            Match
          </p>
          {submitted
            ? leftItems.map((term, i) => {
                const matched = submittedPairs[term];
                const correct = matched === correctMap[term];
                return (
                  <div
                    key={i}
                    className={`px-3.5 py-3 rounded-xl border bg-[#0d0f18] text-[0.8rem] font-medium min-h-[44px] flex flex-col justify-center transition-all duration-150 ${
                      correct ? 'border-green-500/60 bg-green-500/10 text-green-300'
                              : 'border-red-500/60 bg-red-500/10 text-red-300'
                    }`}
                  >
                    {matched}
                  </div>
                );
              })
            : rightOrder.map((item, i) => (
                <div
                  key={item}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDrop={() => handleDrop(i)}
                  onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                  className={`px-3.5 py-3 rounded-xl border bg-[#0d0f18] text-[0.8rem] font-medium min-h-[44px] flex items-center gap-2 select-none cursor-grab active:cursor-grabbing transition-all duration-150 ${
                    i === dragIndex
                      ? 'opacity-40 border-[rgba(139,92,246,0.3)] text-[#d1d5db]'
                      : i === dragOverIndex
                        ? 'border-[rgba(139,92,246,0.7)] bg-[rgba(139,92,246,0.1)] text-[#f0eeff] scale-[1.02] shadow-[0_0_12px_rgba(139,92,246,0.2)]'
                        : 'border-[rgba(255,255,255,0.1)] text-[#d1d5db] hover:border-[rgba(139,92,246,0.3)] hover:bg-[rgba(139,92,246,0.04)]'
                  }`}
                >
                  <span className="text-[#4b5563] text-[0.7rem] flex-shrink-0">⠿</span>
                  {item}
                </div>
              ))
          }
        </div>
      </div>

      {!submitted && (
        <button
          onClick={handleConfirm}
          className="w-full py-3 bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white font-bold text-[0.88rem] rounded-xl border-none cursor-pointer shadow-[0_4px_14px_rgba(139,92,246,0.35)] hover:opacity-90 transition-all"
        >
          Confirm Matches
        </button>
      )}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

function resolveBadgeIcon(icon) {
  if (!icon) return null;
  if (icon.startsWith('http')) return icon;
  return `${SUPABASE_URL}/storage/v1/object/public/badges/${icon}`;
}

export default function AdaptiveLearningPage() {
  const { courseId } = useParams();
  const navigate     = useNavigate();
  const { addToast } = useToast();
  const badgeNotified = useRef(false);

  const [question, setQuestion]    = useState(null);
  const [abilityScore, setAbility] = useState(0);
  const [loading, setLoading]      = useState(true);
  const [error, setError]          = useState('');
  const [mastered, setMastered]    = useState(false);
  const [questionCount, setCount]  = useState(1);

  // Per-type answer state
  const [selected, setSelected]           = useState(null);  // MC / TF: clicked option
  const [userInput, setUserInput]         = useState('');    // FITB: typed text
  const [matchingPairs, setMatchingPairs] = useState({});    // Matching: { term → def }
  const [correct, setCorrect]             = useState(null);  // null | true | false
  const [submitted, setSubmitted]         = useState(false);

  function resetAnswerState() {
    setSelected(null);
    setUserInput('');
    setMatchingPairs({});
    setCorrect(null);
    setSubmitted(false);
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function initPage() {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers = { Authorization: `Bearer ${session.access_token}` };

        let priorCount = 0;
        const progressRes = await fetch(`${API_URL}/api/v1/quiz-progress/me/${courseId}`, { headers });
        if (progressRes.ok) {
          const progressJson = await progressRes.json();
          const progressList = progressJson.data ?? [];
          if (progressList.length > 0) {
            const progress = progressList[0];
            const c = parseJsonField(progress.correctQuestions) ?? [];
            const w = parseJsonField(progress.wrongQuestions) ?? [];
            priorCount = c.length + w.length;
          }
        }

        const res = await fetch(`${API_URL}/api/v1/adaptive/next`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId, quizId: null, correct: false }),
        });
        if (!res.ok) throw new Error('Failed to fetch question');
        const json = await res.json();
        const data = json.data;
        if (cancelled) return;
        setAbility(data.abilityScore);
        if (!data.nextQuestion) setMastered(true);
        else { setQuestion(data.nextQuestion); setCount(priorCount + 1); }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    initPage();
    return () => { cancelled = true; };
  }, [courseId]);

  async function advanceQuestion(questionId, wasCorrect) {
    setLoading(true);
    resetAnswerState();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/api/v1/adaptive/next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ courseId, quizId: questionId, correct: wasCorrect }),
      });
      if (!res.ok) throw new Error('Failed to fetch question');
      const json = await res.json();
      const data = json.data;
      const prevScore = abilityScore;
      setAbility(data.abilityScore);

      // Badge unlock: score just crossed 80
      if (data.abilityScore >= 80 && prevScore < 80 && !badgeNotified.current) {
        badgeNotified.current = true;
        try {
          const badgeRes = await fetch(`${API_URL}/api/v1/badges/${encodeURIComponent(courseId)}`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          if (badgeRes.ok) {
            const badgeJson = await badgeRes.json();
            const badge = badgeJson.data;
            addToast({
              icon: resolveBadgeIcon(badge?.icon) || '🏅',
              title: 'Badge Unlocked!',
              description: badge?.badgeId || courseId,
              duration: 6000,
            });
            // Update localStorage so homepage doesn't re-notify
            try {
              const seen = new Set(JSON.parse(localStorage.getItem('seen_badge_ids') || '[]'));
              seen.add(courseId);
              localStorage.setItem('seen_badge_ids', JSON.stringify([...seen]));
            } catch {}
          }
        } catch {}
      }

      if (!data.nextQuestion) { setMastered(true); setQuestion(null); }
      else { setQuestion(data.nextQuestion); setCount(c => c + 1); }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const title    = formatCourseId(courseId);
  const qType    = question?.type ?? '';
  const options  = parseJsonField(question?.options);
  const answer   = parseJsonField(question?.answer) ?? [];
  const material = question?.quizMaterial ?? question?.quiz_material ?? null;
  const badge    = TYPE_BADGE[qType];

  // Handlers
  function handleMCSelect(option) {
    if (submitted) return;
    setSelected(option);
    setCorrect(answer.includes(option));
    setSubmitted(true);
  }

  function handleTFSelect(option) {
    if (submitted) return;
    setSelected(option);
    setCorrect(answer[0] === option);
    setSubmitted(true);
  }

  function handleFITBSubmit() {
    if (submitted || !userInput.trim()) return;
    const isCorrect = answer.some(a =>
      a.toLowerCase().trim() === userInput.toLowerCase().trim()
    );
    setCorrect(isCorrect);
    setSubmitted(true);
  }

  function handleMatchingComplete(pairs, allCorrect) {
    setMatchingPairs(pairs);
    setCorrect(allCorrect);
    setSubmitted(true);
  }

  // ── Mastery screen ─────────────────────────────────────────────────────────
  if (mastered) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center px-8 py-12 text-center">
        <div className="mb-5 text-7xl">🏆</div>
        <h1 className="text-3xl font-extrabold text-[#f0eeff] m-0 mb-2">Course Mastered!</h1>
        <p className="text-[#9ca3af] text-base m-0 mb-2">{title}</p>
        <p className="text-[#8b5cf6] font-bold text-xl m-0 mb-8">
          Final Score: {Math.round(abilityScore)} / 100
        </p>
        <button
          onClick={() => navigate('/learn')}
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
        <button onClick={() => navigate('/learn')} className="text-sm text-[#8b5cf6] underline">
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
          onClick={() => navigate('/learn')}
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
            {/* Meta row */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-[0.65rem] text-[#4b5563] font-semibold tracking-[0.12em] uppercase">
                Question {questionCount}
              </span>
              {badge && (
                <span className={`px-2 py-0.5 rounded-full text-[0.62rem] font-semibold border ${badge.color}`}>
                  {badge.label}
                </span>
              )}
              <span className="ml-auto text-[0.65rem] text-[#4b5563] font-medium">
                Difficulty {question.score}
              </span>
            </div>

            {/* Quiz material image */}
            {material && (
              <div className="mb-4 rounded-xl overflow-hidden border border-[rgba(255,255,255,0.07)]">
                <img
                  src={material}
                  alt="Quiz material"
                  className="w-full max-h-56 object-contain bg-[rgba(255,255,255,0.02)]"
                />
              </div>
            )}

            {/* Question text */}
            <p className="text-[#f0eeff] text-[1rem] font-semibold leading-relaxed m-0">
              {question.question}
            </p>
          </div>

          {/* Type-specific answer UI */}
          <div className="mb-4">
            {qType === 'Multiple Choice' && options && (
              <MultipleChoiceCard
                options={options}
                answer={answer}
                selected={selected}
                onSelect={handleMCSelect}
                submitted={submitted}
              />
            )}

            {qType === 'True/False' && (
              <TrueFalseCard
                answer={answer}
                selected={selected}
                onSelect={handleTFSelect}
                submitted={submitted}
              />
            )}

            {qType === 'Fill in the Blank' && (
              <FillInTheBlankCard
                answer={answer}
                inputValue={userInput}
                onChange={setUserInput}
                onSubmit={handleFITBSubmit}
                submitted={submitted}
                isCorrect={correct}
              />
            )}

            {qType === 'Matching' && options && (
              <MatchingCard
                options={options}
                answer={answer}
                onComplete={handleMatchingComplete}
                submitted={submitted}
                submittedPairs={matchingPairs}
              />
            )}
          </div>

          {/* Explanation panel (shown after any answer is submitted) */}
          {submitted && (
            <div className={`rounded-2xl p-5 border transition-all ${
              correct
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10  border-red-500/30'
            }`}>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-base">{correct ? '✅' : '❌'}</span>
                <span className={`font-bold text-[0.88rem] ${correct ? 'text-green-400' : 'text-red-400'}`}>
                  {correct ? 'Correct!' : 'Incorrect'}
                </span>
                {/* Show correct answer hint for MC / TF / FITB */}
                {!correct && qType !== 'Matching' && (
                  <span className="text-[0.8rem] text-[#9ca3af]">
                    — correct answer:{' '}
                    <span className="text-green-400 font-semibold">{answer.join(' / ')}</span>
                  </span>
                )}
              </div>

              {question.explanation && (
                <p className="text-[#d1d5db] text-[0.86rem] leading-relaxed m-0 mb-3">
                  {question.explanation}
                </p>
              )}

              {/* Correct pairings for Matching questions */}
              {!correct && qType === 'Matching' && Array.isArray(answer) && (
                <div className="mb-3">
                  <p className="text-[0.72rem] text-[#9ca3af] font-semibold mb-1.5">Correct matches:</p>
                  <div className="flex flex-col gap-1">
                    {answer.map((pair, i) => (
                      <div key={i} className="flex items-center gap-2 text-[0.78rem]">
                        <span className="text-[#d1d5db]">{pair[0]}</span>
                        <span className="text-[#4b5563]">→</span>
                        <span className="text-green-400 font-semibold">{pair[1]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => advanceQuestion(question.quizId, correct)}
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