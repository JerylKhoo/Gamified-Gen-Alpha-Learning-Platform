import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const API_URL = import.meta.env.VITE_API_URL;

const CATEGORY_STYLE = {
  'Memes':         'bg-[rgba(139,92,246,0.12)] border-[rgba(139,92,246,0.25)] text-[#a78bfa]',
  'Slang Help':    'bg-[rgba(59,130,246,0.12)]  border-[rgba(59,130,246,0.25)]  text-[#60a5fa]',
  'Tips & Tricks': 'bg-[rgba(74,222,128,0.08)]  border-[rgba(74,222,128,0.2)]   text-[#4ade80]',
  'Showcase':      'bg-[rgba(251,191,36,0.1)]   border-[rgba(251,191,36,0.25)]  text-[#fbbf24]',
  'Off-Topic':     'bg-[rgba(248,113,113,0.1)]  border-[rgba(248,113,113,0.2)]  text-[#f87171]',
};

const REPORT_REASONS = [
  'Spam or misleading',
  'Harassment or bullying',
  'Hate speech',
  'Inappropriate content',
  'Misinformation',
  'Impersonation',
  'Other',
];

const IconHeartOutline = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const IconHeartFilled = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const IconFlag = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
    <line x1="4" y1="22" x2="4" y2="15"/>
  </svg>
);

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [upvoted, setUpvoted] = useState(false);
  const [upvoting, setUpvoting] = useState(false);

  // Report state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reported, setReported]   = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason]     = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportError, setReportError] = useState('');

  useEffect(() => {
    async function fetchPost() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const headers = { Authorization: `Bearer ${session.access_token}` };

        const [postRes, upvotesRes, reportsRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/posts/${postId}`, { headers }),
          fetch(`${API_URL}/api/v1/posts/upvotes/me`, { headers }),
          fetch(`${API_URL}/api/v1/posts/reports/me`, { headers }),
        ]);

        if (!postRes.ok) throw new Error('Post not found');
        setPost(await postRes.json());

        if (upvotesRes.ok) {
          const ids = await upvotesRes.json();
          setUpvoted(ids.includes(postId));
        }
        if (reportsRes.ok) {
          const ids = await reportsRes.json();
          setReported(ids.includes(postId));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [postId]);

  async function handleUpvote() {
    if (upvoting) return;
    const wasUpvoted = upvoted;
    const delta = wasUpvoted ? -1 : 1;
    setUpvoting(true);
    setUpvoted(!wasUpvoted);
    setPost(prev => prev ? { ...prev, upvote: Math.max(0, (prev.upvote || 0) + delta) } : prev);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(`${API_URL}/api/v1/posts/${postId}/upvote`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const updated = await res.json();
        setPost(prev => prev ? { ...prev, upvote: updated.upvote } : prev);
      } else {
        setUpvoted(wasUpvoted);
        setPost(prev => prev ? { ...prev, upvote: Math.max(0, (prev.upvote || 0) - delta) } : prev);
      }
    } catch {
      setUpvoted(wasUpvoted);
      setPost(prev => prev ? { ...prev, upvote: Math.max(0, (prev.upvote || 0) - delta) } : prev);
    } finally {
      setUpvoting(false);
    }
  }

  async function handleReport() {
    if (!reportReason) {
      setReportError('Please select a reason.');
      return;
    }
    setReporting(true);
    setReportError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(`${API_URL}/api/v1/posts/${postId}/report`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: reportReason, description: reportDescription }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPost(prev => prev ? { ...prev, reportCount: updated.reportCount } : prev);
        setReported(true);
        setShowReportModal(false);
        setReportReason('');
        setReportDescription('');
      } else if (res.status === 409) {
        setReported(true);
        setShowReportModal(false);
      } else {
        setReportError('Failed to submit report. Please try again.');
      }
    } catch {
      setReportError('Network error. Please try again.');
    } finally {
      setReporting(false);
    }
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-lg text-[#6b6490] font-semibold animate-pulse">Loading post...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-red-400 font-semibold">{error || 'Post not found'}</p>
        <button
          onClick={() => navigate('/community')}
          className="text-sm text-[#8b5cf6] underline cursor-pointer bg-transparent border-none"
        >
          Back to Community
        </button>
      </div>
    );
  }

  const categoryCls = CATEGORY_STYLE[post.category]
    ?? 'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#9090b0]';

  const inputCls =
    'w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(139,92,246,0.18)] rounded-[10px] ' +
    'px-3 py-2 text-[0.9rem] text-[#f0eeff] placeholder:text-[#4b4870] outline-none ' +
    'focus:border-[rgba(139,92,246,0.5)] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] transition-all';

  return (
    <div className="w-full min-h-screen px-8 py-8 overflow-auto sm:px-4 sm:py-6">

      {/* Back button */}
      <button
        onClick={() => navigate('/community')}
        className="flex items-center gap-2 text-[#9ca3af] hover:text-white transition-colors mb-6 bg-transparent border-none cursor-pointer p-0 text-[0.88rem]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Community
      </button>

      {/* Post card */}
      <div className="max-w-2xl mx-auto bg-[#0d0f18] border border-[rgba(255,255,255,0.07)] rounded-2xl overflow-hidden">

        {/* Post image */}
        {post.picture && (
          <div className="w-full max-h-[400px] overflow-hidden">
            <img src={post.picture} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div className="p-6 sm:p-4 flex flex-col gap-4">

          {/* Author row */}
          <div className="flex items-center gap-3">
            {post.authorProfilePic ? (
              <img
                src={post.authorProfilePic}
                alt={post.authorName}
                className="w-11 h-11 rounded-full object-cover shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] flex items-center justify-center text-[1.2rem] font-bold text-white select-none shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                {post.authorName?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-[0.92rem] font-bold text-[#e0d9ff]">{post.authorName || 'Member'}</span>
              <span className="text-[0.75rem] text-[#5a5278]">Community Member</span>
            </div>
          </div>

          {/* Category pill */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center border rounded-md font-semibold tracking-[0.06em] uppercase text-[0.72rem] px-2 py-[0.25rem] ${categoryCls}`}>
              {post.category || 'Off-Topic'}
            </span>
            {(post.upvote || 0) >= 10 && (
              <span className="inline-flex items-center gap-[0.22rem] text-[0.68rem] font-bold text-[#fb923c] bg-[rgba(251,146,60,0.1)] border border-[rgba(251,146,60,0.2)] rounded-md px-[0.45rem] py-[0.15rem]">
                🔥 Hot
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-[1.4rem] font-extrabold text-[#f0eeff] m-0 leading-snug sm:text-[1.15rem]">
            {post.title || '(Untitled)'}
          </h1>

          {/* Body */}
          {post.description && (
            <p className="text-[#c4c0d8] text-[0.95rem] leading-[1.75] m-0 whitespace-pre-wrap">
              {post.description}
            </p>
          )}

          {/* Divider */}
          <div className="h-px bg-[rgba(139,92,246,0.12)]" />

          {/* Upvote bar + Report */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleUpvote}
              disabled={upvoting}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[0.88rem] font-bold cursor-pointer transition-all duration-200 ${
                upvoted
                  ? 'bg-[rgba(248,113,113,0.1)] border-[rgba(248,113,113,0.3)] text-[#f87171]'
                  : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-[#9090b0] hover:border-[rgba(248,113,113,0.3)] hover:text-[#f87171]'
              } ${upvoting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {upvoted ? <IconHeartFilled /> : <IconHeartOutline />}
              {post.upvote || 0}
            </button>
            <span className="text-[0.78rem] text-[#5a5278]">
              {(post.upvote || 0) === 1 ? '1 like' : `${post.upvote || 0} likes`}
            </span>

            {/* Report button */}
            <button
              onClick={() => !reported && setShowReportModal(true)}
              disabled={reported}
              className={`ml-auto flex items-center gap-[0.35rem] px-3 py-[0.4rem] rounded-lg border text-[0.8rem] font-semibold cursor-pointer transition-all duration-200 ${
                reported
                  ? 'bg-[rgba(248,113,113,0.08)] border-[rgba(248,113,113,0.2)] text-[#f87171] cursor-not-allowed'
                  : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-[#5a5278] hover:border-[rgba(248,113,113,0.3)] hover:text-[#f87171]'
              }`}
            >
              <IconFlag />
              {reported ? 'Reported' : 'Report'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Report Modal ── */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowReportModal(false)}
        >
          <div
            className="w-full max-w-[460px] bg-[#0d0f18] border border-[rgba(248,113,113,0.25)] rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.8)]"
            onClick={e => e.stopPropagation()}
            style={{ animation: 'modalIn 0.18s cubic-bezier(0.2,0,0.2,1)' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-[rgba(248,113,113,0.12)]">
              <div className="w-9 h-9 rounded-full bg-[rgba(248,113,113,0.12)] flex items-center justify-center text-[#f87171]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                  <line x1="4" y1="22" x2="4" y2="15"/>
                </svg>
              </div>
              <h3 className="text-[1.05rem] font-extrabold text-[#f0eeff] m-0">Report Post</h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="ml-auto flex items-center justify-center w-8 h-8 rounded-full bg-transparent text-[#9090b0] border border-[rgba(255,255,255,0.08)] cursor-pointer transition-all hover:bg-[rgba(139,92,246,0.1)] hover:text-[#f0eeff]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-4">
              <p className="text-[0.85rem] text-[#9090b0] m-0 leading-relaxed">
                Select the reason for reporting this post. Your report will be reviewed by moderators.
              </p>

              {/* Reason selection */}
              <div className="flex flex-col gap-[0.4rem]">
                <label className="text-[0.75rem] font-bold text-[#7c6ea8] uppercase tracking-[0.1em]">
                  Violation Type
                </label>
                <div className="flex flex-col gap-[0.35rem]">
                  {REPORT_REASONS.map(reason => (
                    <button
                      key={reason}
                      onClick={() => { setReportReason(reason); setReportError(''); }}
                      className={`w-full text-left px-3 py-[0.55rem] rounded-[10px] border text-[0.88rem] font-medium cursor-pointer transition-all duration-150 ${
                        reportReason === reason
                          ? 'bg-[rgba(248,113,113,0.1)] border-[rgba(248,113,113,0.35)] text-[#f87171]'
                          : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.07)] text-[#c4c0d8] hover:border-[rgba(248,113,113,0.2)] hover:text-[#e0d9ff]'
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-[0.4rem]">
                <label className="text-[0.75rem] font-bold text-[#7c6ea8] uppercase tracking-[0.1em]">
                  Additional Details <span className="font-normal text-[#5a5278]">(optional)</span>
                </label>
                <textarea
                  className={inputCls + ' resize-none h-[80px] leading-relaxed'}
                  placeholder="Provide more context about the violation..."
                  value={reportDescription}
                  onChange={e => setReportDescription(e.target.value)}
                  maxLength={500}
                />
              </div>

              {reportError && (
                <p className="text-red-400 text-[0.82rem] m-0">{reportError}</p>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-1">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 bg-transparent border border-[rgba(139,92,246,0.2)] text-[#9090b0] rounded-[10px] text-[0.88rem] font-semibold cursor-pointer transition-all hover:border-[rgba(139,92,246,0.4)] hover:text-[#f0eeff]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReport}
                  disabled={reporting}
                  className="px-5 py-2 bg-[rgba(248,113,113,0.15)] border border-[rgba(248,113,113,0.35)] text-[#f87171] rounded-[10px] text-[0.88rem] font-extrabold cursor-pointer transition-all hover:bg-[rgba(248,113,113,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reporting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes modalIn {
              from { opacity: 0; transform: scale(0.94) translateY(8px); }
              to   { opacity: 1; transform: scale(1)    translateY(0);   }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
