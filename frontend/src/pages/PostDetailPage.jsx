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

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [upvoted, setUpvoted] = useState(false);
  const [upvoting, setUpvoting] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const headers = { Authorization: `Bearer ${session.access_token}` };

        const [postRes, upvotesRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/posts/${postId}`, { headers }),
          fetch(`${API_URL}/api/v1/posts/upvotes/me`, { headers }),
        ]);

        if (!postRes.ok) throw new Error('Post not found');
        const postData = await postRes.json();
        setPost(postData);

        if (upvotesRes.ok) {
          const ids = await upvotesRes.json();
          setUpvoted(ids.includes(postId));
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

    // Optimistic
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
        // Revert
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

          {/* Upvote bar */}
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
          </div>
        </div>
      </div>
    </div>
  );
}
