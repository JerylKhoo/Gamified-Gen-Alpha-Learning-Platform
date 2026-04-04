import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

const DEFAULT_VISUAL = {
  emoji: '📚',
  bg: 'from-[#0a1a2e] via-[#0f3460] to-[#1e40af]',
  pattern: 'radial-gradient(circle at 50% 50%, rgba(139,92,246,0.3) 0%, transparent 60%)',
};

// Derives a consistent visual from the courseId string
const VISUALS = [
  { emoji: '🔥', bg: 'from-[#0c1a2e] via-[#1e3a5f] to-[#1e40af]',   pattern: 'radial-gradient(circle at 30% 70%, rgba(59,130,246,0.35) 0%, transparent 55%)' },
  { emoji: '😭', bg: 'from-[#1e1b4b] via-[#312e81] to-[#4c1d95]',   pattern: 'radial-gradient(circle at 70% 30%, rgba(139,92,246,0.3) 0%, transparent 60%)' },
  { emoji: '🌐', bg: 'from-[#0f1a2a] via-[#1e3a5f] to-[#0e7490]',   pattern: 'radial-gradient(circle at 35% 65%, rgba(34,211,238,0.25) 0%, transparent 55%)' },
  { emoji: '✨', bg: 'from-[#1a1200] via-[#78350f] to-[#d97706]',   pattern: 'radial-gradient(circle at 60% 50%, rgba(251,191,36,0.3) 0%, transparent 50%)' },
  { emoji: '📱', bg: 'from-[#1a0a0a] via-[#7f1d1d] to-[#dc2626]',   pattern: 'radial-gradient(circle at 70% 20%, rgba(239,68,68,0.3) 0%, transparent 55%)' },
  { emoji: '🤖', bg: 'from-[#1a0a1a] via-[#4a044e] to-[#a21caf]',   pattern: 'radial-gradient(circle at 40% 30%, rgba(217,70,239,0.3) 0%, transparent 55%)' },
];

function getVisuals(courseId) {
  if (!courseId) return DEFAULT_VISUAL;
  const hash = [...courseId].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return VISUALS[hash % VISUALS.length];
}

function formatCourseId(courseId) {
  return courseId
    .replace(/[-_.]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function CourseCard({ course, onClick, started, onEdit }) {
  const { emoji, bg, pattern } = getVisuals(course.courseId);
  const title = formatCourseId(course.courseId);
  const [imgOk, setImgOk] = useState(!!course.image);

  return (
    <div
      onClick={onClick}
      className="group relative bg-[#0d0f18] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-[rgba(139,92,246,0.45)] hover:shadow-[0_0_28px_rgba(139,92,246,0.18)] hover:-translate-y-1 flex flex-col"
    >
      {onEdit && (
        <button
          onClick={e => { e.stopPropagation(); onEdit(); }}
          className="absolute top-3 right-3 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white/70 border border-white/10 cursor-pointer transition-all hover:bg-[rgba(139,92,246,0.6)] hover:text-white hover:border-[rgba(139,92,246,0.5)] opacity-0 group-hover:opacity-100"
          title="Edit course"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      )}

      <div className={`relative bg-gradient-to-br ${bg} flex-shrink-0 overflow-hidden h-[260px]`}>
        {imgOk ? (
          <>
            <img src={course.image} alt={title} onError={() => setImgOk(false)} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0d0f18] to-transparent pointer-events-none" />
          </>
        ) : (
          <div className="relative h-[160px]">
            <div className="absolute inset-0" style={{ background: pattern }} />
            <div className="absolute inset-0 opacity-[0.06]"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 20px,rgba(255,255,255,0.5) 20px,rgba(255,255,255,0.5) 21px),repeating-linear-gradient(90deg,transparent,transparent 20px,rgba(255,255,255,0.5) 20px,rgba(255,255,255,0.5) 21px)' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[3.5rem] drop-shadow-lg select-none">{emoji}</span>
            </div>
          </div>
        )}
      </div>

      <div className={`relative p-4 flex flex-col gap-2 flex-1 ${course.image ? '-mt-7 bg-[#0d0f18] z-10' : ''}`}>
        {started && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)] text-[#a78bfa] text-[0.62rem] font-bold tracking-wide uppercase rounded-md px-2 py-[0.2rem]">
            In Progress
          </div>
        )}
        <span className="text-[0.68rem] text-[#4b5563] font-semibold tracking-[0.12em] uppercase">COURSE</span>
        <h3 className="text-[#f0eeff] font-bold text-[0.97rem] leading-snug m-0 group-hover:text-white transition-colors">{title}</h3>
        {course.description && (
          <p className="text-[#6b7280] text-[0.82rem] leading-relaxed m-0 line-clamp-2 flex-1">{course.description}</p>
        )}
      </div>
    </div>
  );
}

function EditCourseModal({ course, onClose, onUpdated, onDeleted }) {
  const [description, setDescription] = useState(course.description || '');
  const [imageFile, setImageFile]     = useState(null);
  const [imagePreview, setImagePreview] = useState(course.image || null);
  const [dragging, setDragging]       = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [err, setErr]                 = useState('');

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function pickFile(file) {
    if (!file || !file.type.startsWith('image/')) { setErr('Please select a valid image file.'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErr('');
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) pickFile(file);
  }

  // Extract the storage path from a full Supabase public URL
  function extractStoragePath(url) {
    if (!url) return null;
    const marker = '/object/public/course/';
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    const withQuery = url.slice(idx + marker.length);
    // Strip query string, then decode %20 etc. so Supabase remove() matches correctly
    return decodeURIComponent(withQuery.split('?')[0]);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSubmitting(true);
    setErr('');
    try {
      const { data: { session } } = await supabase.auth.getSession();

      let imageUrl = course.image ?? null;

      if (imageFile) {
        // Delete old image from bucket if it came from storage
        const oldPath = extractStoragePath(course.image);
        if (oldPath) {
          const { error: removeErr } = await supabase.storage.from('course').remove([oldPath]);
          if (removeErr) throw new Error('Failed to delete old image: ' + removeErr.message);
        }

        // Upload new image
        const ext = imageFile.name.split('.').pop();
        const path = `${course.courseId}-${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from('course').upload(path, imageFile, { upsert: true });
        if (uploadErr) throw new Error('Image upload failed: ' + uploadErr.message);
        const { data: { publicUrl } } = supabase.storage.from('course').getPublicUrl(path);
        imageUrl = publicUrl;
      }

      const res = await fetch(`${API_URL}/api/v1/courses/${encodeURIComponent(course.courseId)}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: description.trim() || null, image: imageUrl }),
      });
      if (!res.ok) throw new Error((await res.text()) || 'Failed to update course');
      const json = await res.json();
      onUpdated(json.data);
      onClose();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setErr('');
    try {
      const { data: { session } } = await supabase.auth.getSession();

      // Delete image from bucket
      const oldPath = extractStoragePath(course.image);
      if (oldPath) await supabase.storage.from('course').remove([oldPath]);

      const res = await fetch(`${API_URL}/api/v1/courses/${encodeURIComponent(course.courseId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error((await res.text()) || 'Failed to delete course');
      onDeleted(course.courseId);
      onClose();
    } catch (e) {
      setErr(e.message);
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  const inputCls = "w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(139,92,246,0.18)] rounded-[10px] px-3 py-2 text-[0.9rem] text-[#f0eeff] placeholder:text-[#4b4870] outline-none focus:border-[rgba(139,92,246,0.5)] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-[440px] bg-[#0d0f18] border border-[rgba(139,92,246,0.25)] rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.8)]"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'modalIn 0.18s cubic-bezier(0.2,0,0.2,1)' }}
      >
        <div className="px-6 pt-6 pb-2 flex items-center justify-between">
          <div>
            <h2 className="text-[1.1rem] font-extrabold text-[#f0eeff] m-0">Edit Course</h2>
            <p className="text-[0.75rem] text-[#4b4870] m-0 mt-0.5">{formatCourseId(course.courseId)}</p>
          </div>
          <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-full bg-[rgba(255,255,255,0.06)] text-[#9090b0] border border-[rgba(255,255,255,0.08)] cursor-pointer hover:text-[#f0eeff] hover:bg-[rgba(255,255,255,0.1)] transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="px-6 pb-6 pt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.75rem] font-bold text-[#7c6ea8] uppercase tracking-[0.08em]">Description</label>
            <textarea
              placeholder="What will students learn?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.75rem] font-bold text-[#7c6ea8] uppercase tracking-[0.08em]">Course Image</label>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => document.getElementById('edit-course-img-input').click()}
              className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all overflow-hidden ${
                dragging
                  ? 'border-[#8b5cf6] bg-[rgba(139,92,246,0.1)]'
                  : 'border-[rgba(139,92,246,0.25)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(139,92,246,0.45)] hover:bg-[rgba(139,92,246,0.05)]'
              } ${imagePreview ? 'h-[140px]' : 'h-[100px]'}`}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-[0.8rem] font-semibold text-white">Click to change</span>
                  </div>
                </>
              ) : (
                <>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b6490" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <p className="text-[0.8rem] text-[#6b6490] m-0 font-medium">Drag & drop or <span className="text-[#a78bfa]">browse</span></p>
                  <p className="text-[0.7rem] text-[#4b4870] m-0 mt-0.5">PNG, JPG, WEBP</p>
                </>
              )}
            </div>
            <input
              id="edit-course-img-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) pickFile(f); }}
            />
          </div>

          {err && <p className="text-[#f87171] text-[0.82rem] m-0">{err}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-[0.88rem] font-bold border border-[rgba(255,255,255,0.1)] bg-transparent text-[#9090b0] cursor-pointer hover:bg-[rgba(255,255,255,0.05)] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl text-[0.88rem] font-bold bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white border-none cursor-pointer shadow-[0_4px_18px_rgba(139,92,246,0.35)] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="border-t border-[rgba(248,113,113,0.15)] pt-4">
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="w-full py-2.5 rounded-xl text-[0.88rem] font-bold border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] text-[#f87171] cursor-pointer hover:bg-[rgba(248,113,113,0.18)] transition-all"
              >
                Delete Course
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-[0.82rem] text-[#f87171] m-0 text-center font-semibold">
                  This will permanently delete the course and all its data. Are you sure?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-2 rounded-xl text-[0.85rem] font-bold border border-[rgba(255,255,255,0.1)] bg-transparent text-[#9090b0] cursor-pointer hover:bg-[rgba(255,255,255,0.05)] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 py-2 rounded-xl text-[0.85rem] font-bold border border-[rgba(248,113,113,0.4)] bg-[rgba(248,113,113,0.15)] text-[#f87171] cursor-pointer hover:bg-[rgba(248,113,113,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>

        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.94) translateY(8px); }
            to   { opacity: 1; transform: scale(1)    translateY(0);   }
          }
        `}</style>
      </div>
    </div>
  );
}

function CourseModal({ course, onClose }) {
  const { emoji, bg, pattern } = getVisuals(course.courseId);
  const title = formatCourseId(course.courseId);
  const [imgOk, setImgOk] = useState(!!course.image);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[420px] bg-[#0d0f18] border border-[rgba(139,92,246,0.25)] rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.8)]"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'modalIn 0.18s cubic-bezier(0.2,0,0.2,1)' }}
      >
        <div className={`relative h-[180px] bg-gradient-to-br ${bg} overflow-hidden`}>
          {imgOk ? (
            <img src={course.image} alt={title} onError={() => setImgOk(false)} className="absolute inset-0 w-full h-full object-contain" />
          ) : (
            <>
              <div className="absolute inset-0" style={{ background: pattern }} />
              <div className="absolute inset-0 opacity-[0.06]"
                style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 20px,rgba(255,255,255,0.5) 20px,rgba(255,255,255,0.5) 21px),repeating-linear-gradient(90deg,transparent,transparent 20px,rgba(255,255,255,0.5) 20px,rgba(255,255,255,0.5) 21px)' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[4.5rem] drop-shadow-lg select-none">{emoji}</span>
              </div>
            </>
          )}
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 left-3 flex items-center justify-center w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white/70 border border-white/10 cursor-pointer transition-all hover:bg-black/60 hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>

        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[0.68rem] text-[#4b5563] font-semibold tracking-[0.12em] uppercase">Course</span>
            <h2 className="text-[1.25rem] font-extrabold text-[#f0eeff] m-0 leading-snug">{title}</h2>
          </div>

          {course.description && (
            <p className="text-[#9ca3af] text-[0.88rem] leading-relaxed m-0">{course.description}</p>
          )}

          <button
            onClick={() => { window.open(`/course/${encodeURIComponent(course.courseId)}`, '_blank'); onClose(); }}
            className="w-full py-3 bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white font-bold text-[0.95rem] rounded-xl border-none cursor-pointer shadow-[0_4px_18px_rgba(139,92,246,0.4)] transition-all hover:opacity-90 hover:shadow-[0_6px_24px_rgba(139,92,246,0.55)] hover:-translate-y-px active:translate-y-0"
          >
            Start Course →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}</style>
    </div>
  );
}

function CreateCourseModal({ onClose, onCreated }) {
  const [courseId, setCourseId]       = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile]     = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragging, setDragging]       = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [err, setErr]                 = useState('');

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function pickFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      setErr('Please select a valid image file.');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErr('');
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) pickFile(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!courseId.trim()) { setErr('Course ID is required.'); return; }
    setSubmitting(true);
    setErr('');
    try {
      const { data: { session } } = await supabase.auth.getSession();

      let imageUrl = null;
      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const path = `${courseId.trim()}-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('course')
          .upload(path, imageFile, { upsert: true });
        if (uploadError) throw new Error('Image upload failed: ' + uploadError.message);
        const { data: { publicUrl } } = supabase.storage.from('course').getPublicUrl(path);
        imageUrl = publicUrl;
      }

      const res = await fetch(`${API_URL}/api/v1/courses`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: courseId.trim(),
          description: description.trim() || null,
          image: imageUrl,
        }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to create course');
      }
      const json = await res.json();
      const created = json.data;
      onCreated(created);
      onClose();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = "w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(139,92,246,0.18)] rounded-[10px] px-3 py-2 text-[0.9rem] text-[#f0eeff] placeholder:text-[#4b4870] outline-none focus:border-[rgba(139,92,246,0.5)] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-[440px] bg-[#0d0f18] border border-[rgba(139,92,246,0.25)] rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.8)]"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'modalIn 0.18s cubic-bezier(0.2,0,0.2,1)' }}
      >
        <div className="px-6 pt-6 pb-2 flex items-center justify-between">
          <h2 className="text-[1.1rem] font-extrabold text-[#f0eeff] m-0">Create Course</h2>
          <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-full bg-[rgba(255,255,255,0.06)] text-[#9090b0] border border-[rgba(255,255,255,0.08)] cursor-pointer hover:text-[#f0eeff] hover:bg-[rgba(255,255,255,0.1)] transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.75rem] font-bold text-[#7c6ea8] uppercase tracking-[0.08em]">Course ID <span className="text-[#f87171]">*</span></label>
            <input
              type="text"
              placeholder="e.g. gen-alpha-slang"
              value={courseId}
              onChange={e => setCourseId(e.target.value)}
              className={inputCls}
              autoFocus
            />
            <p className="text-[0.72rem] text-[#4b4870] m-0">Used as the course name. Use hyphens for spaces.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.75rem] font-bold text-[#7c6ea8] uppercase tracking-[0.08em]">Description</label>
            <textarea
              placeholder="What will students learn?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.75rem] font-bold text-[#7c6ea8] uppercase tracking-[0.08em]">Course Image</label>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => document.getElementById('course-img-input').click()}
              className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all overflow-hidden ${
                dragging
                  ? 'border-[#8b5cf6] bg-[rgba(139,92,246,0.1)]'
                  : 'border-[rgba(139,92,246,0.25)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(139,92,246,0.45)] hover:bg-[rgba(139,92,246,0.05)]'
              } ${imagePreview ? 'h-[140px]' : 'h-[100px]'}`}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-[0.8rem] font-semibold text-white">Click to change</span>
                  </div>
                </>
              ) : (
                <>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b6490" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <p className="text-[0.8rem] text-[#6b6490] m-0 font-medium">Drag & drop or <span className="text-[#a78bfa]">browse</span></p>
                  <p className="text-[0.7rem] text-[#4b4870] m-0 mt-0.5">PNG, JPG, WEBP</p>
                </>
              )}
            </div>
            <input
              id="course-img-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) pickFile(f); }}
            />
          </div>

          {err && <p className="text-[#f87171] text-[0.82rem] m-0">{err}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-[0.88rem] font-bold border border-[rgba(255,255,255,0.1)] bg-transparent text-[#9090b0] cursor-pointer hover:bg-[rgba(255,255,255,0.05)] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl text-[0.88rem] font-bold bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white border-none cursor-pointer shadow-[0_4px_18px_rgba(139,92,246,0.35)] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>

        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.94) translateY(8px); }
            to   { opacity: 1; transform: scale(1)    translateY(0);   }
          }
        `}</style>
      </div>
    </div>
  );
}

export default function LearnPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [courses, setCourses]           = useState([]);
  const [startedCourses, setStarted]    = useState(new Set());
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [showCreate, setShowCreate]     = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    async function fetchData(attempt = 1) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers = { Authorization: `Bearer ${session.access_token}` };

        const [coursesRes, progressRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/courses`,             { headers }),
          fetch(`${API_URL}/api/v1/course-progress/me`,  { headers }),
        ]);

        if (!coursesRes.ok) {
          if (coursesRes.status === 500 && attempt < 3) {
            setTimeout(() => fetchData(attempt + 1), 1000 * attempt);
            return;
          }
          throw new Error('Failed to load courses');
        }
        const coursesJson = await coursesRes.json();
        setCourses(coursesJson.data ?? []);

        if (progressRes.ok) {
          const progressJson = await progressRes.json();
          const progressData = progressJson.data ?? [];
          setStarted(new Set(progressData.map(p => p.courseId)));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="w-full min-h-screen px-8 py-8 overflow-auto sm:px-4 sm:py-6">

      {showCreate && (
        <CreateCourseModal
          onClose={() => setShowCreate(false)}
          onCreated={course => setCourses(prev => [...prev, course])}
        />
      )}

      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onUpdated={updated => setCourses(prev => prev.map(c => c.courseId === updated.courseId ? updated : c))}
          onDeleted={courseId => setCourses(prev => prev.filter(c => c.courseId !== courseId))}
        />
      )}

      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[1.8rem] font-extrabold text-[#f0eeff] m-0 mb-1">All Courses</h1>
          <p className="text-[#6b6490] text-sm m-0">Explore Gen Alpha slang, meme culture, and internet lingo.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[0.88rem] font-bold bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white border-none cursor-pointer shadow-[0_4px_18px_rgba(139,92,246,0.35)] hover:opacity-90 hover:-translate-y-px transition-all flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            New Course
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-[#6b6490]">
          <p className="text-lg font-semibold animate-pulse">Loading courses...</p>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-20 text-red-400">
          <p className="text-lg font-semibold">{error}</p>
        </div>
      )}

      {!loading && !error && (
        courses.length > 0 ? (
          <div className="grid grid-cols-3 gap-5 xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1">
            {courses.map(course => (
              <CourseCard
                key={course.courseId}
                course={course}
                started={startedCourses.has(course.courseId)}
                onClick={() => navigate(`/course/${encodeURIComponent(course.courseId)}`)}
                onEdit={isAdmin ? () => setEditingCourse(course) : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-[#4b4870]">
            <span className="text-5xl mb-4">🔍</span>
            <p className="text-lg font-semibold">No courses available yet.</p>
          </div>
        )
      )}

    </div>
  );
}
