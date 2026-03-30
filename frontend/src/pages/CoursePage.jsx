import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';

const API_URL = import.meta.env.VITE_API_URL;

function formatId(id) {
  if (!id) return '';
  return id.replace(/[-_.]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const inputCls = "w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(139,92,246,0.18)] rounded-[10px] px-3 py-2 text-[0.9rem] text-[#f0eeff] placeholder:text-[#4b4870] outline-none focus:border-[rgba(139,92,246,0.5)] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] transition-all";

// ── Create Module Modal ────────────────────────────────────────────────────────
function CreateModuleModal({ courseId, nextOrder, onClose, onCreated }) {
  const [moduleId, setModuleId] = useState('');
  const [content, setContent]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!moduleId.trim()) { setErr('Module ID is required.'); return; }
    setSubmitting(true); setErr('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/api/v1/modules`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId: moduleId.trim(), courseId, content: content.trim() || null, order: nextOrder }),
      });
      if (!res.ok) throw new Error((await res.text()) || 'Failed to create module');
      onCreated(await res.json());
      onClose();
    } catch (e) { setErr(e.message); } finally { setSubmitting(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[440px] bg-[#0d0f18] border border-[rgba(139,92,246,0.25)] rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.8)]" onClick={e => e.stopPropagation()} style={{ animation: 'modalIn 0.18s cubic-bezier(0.2,0,0.2,1)' }}>
        <div className="px-6 pt-6 pb-2 flex items-center justify-between">
          <h2 className="text-[1.1rem] font-extrabold text-[#f0eeff] m-0">Add Module</h2>
          <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-full bg-[rgba(255,255,255,0.06)] text-[#9090b0] border border-[rgba(255,255,255,0.08)] cursor-pointer hover:text-[#f0eeff] transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.75rem] font-bold text-[#7c6ea8] uppercase tracking-[0.08em]">Module ID <span className="text-[#f87171]">*</span></label>
            <input type="text" placeholder="e.g. intro-to-slang" value={moduleId} onChange={e => setModuleId(e.target.value)} className={inputCls} autoFocus />
            <p className="text-[0.72rem] text-[#4b4870] m-0">Used as the module name. Use hyphens for spaces.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.75rem] font-bold text-[#7c6ea8] uppercase tracking-[0.08em]">Content</label>
            <textarea placeholder="Module content..." value={content} onChange={e => setContent(e.target.value)} rows={4} className={`${inputCls} resize-none`} />
          </div>
          {err && <p className="text-[#f87171] text-[0.82rem] m-0">{err}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-[0.88rem] font-bold border border-[rgba(255,255,255,0.1)] bg-transparent text-[#9090b0] cursor-pointer hover:bg-[rgba(255,255,255,0.05)] transition-all">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl text-[0.88rem] font-bold bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white border-none cursor-pointer shadow-[0_4px_18px_rgba(139,92,246,0.35)] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? 'Creating...' : 'Create Module'}
            </button>
          </div>
        </form>
        <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.94) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
      </div>
    </div>
  );
}

// ── Edit Module Modal ──────────────────────────────────────────────────────────
function EditModuleModal({ module, onClose, onUpdated, onDeleted }) {
  const [content, setContent]     = useState(module.content || '');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSave(e) {
    e.preventDefault();
    setSubmitting(true); setErr('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/api/v1/modules/${encodeURIComponent(module.moduleId)}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() || null }),
      });
      if (!res.ok) throw new Error((await res.text()) || 'Failed to update module');
      onUpdated(await res.json());
      onClose();
    } catch (e) { setErr(e.message); } finally { setSubmitting(false); }
  }

  async function handleDelete() {
    setDeleting(true); setErr('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/api/v1/modules/${encodeURIComponent(module.moduleId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error((await res.text()) || 'Failed to delete module');
      onDeleted(module.moduleId);
      onClose();
    } catch (e) { setErr(e.message); setDeleting(false); setConfirmDelete(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[440px] bg-[#0d0f18] border border-[rgba(139,92,246,0.25)] rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.8)]" onClick={e => e.stopPropagation()} style={{ animation: 'modalIn 0.18s cubic-bezier(0.2,0,0.2,1)' }}>
        <div className="px-6 pt-6 pb-2 flex items-center justify-between">
          <div>
            <h2 className="text-[1.1rem] font-extrabold text-[#f0eeff] m-0">Edit Module</h2>
            <p className="text-[0.75rem] text-[#4b4870] m-0 mt-0.5">{formatId(module.moduleId)}</p>
          </div>
          <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-full bg-[rgba(255,255,255,0.06)] text-[#9090b0] border border-[rgba(255,255,255,0.08)] cursor-pointer hover:text-[#f0eeff] transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <form onSubmit={handleSave} className="px-6 pb-6 pt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.75rem] font-bold text-[#7c6ea8] uppercase tracking-[0.08em]">Content</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={5} className={`${inputCls} resize-none`} />
          </div>
          {err && <p className="text-[#f87171] text-[0.82rem] m-0">{err}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-[0.88rem] font-bold border border-[rgba(255,255,255,0.1)] bg-transparent text-[#9090b0] cursor-pointer hover:bg-[rgba(255,255,255,0.05)] transition-all">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl text-[0.88rem] font-bold bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white border-none cursor-pointer shadow-[0_4px_18px_rgba(139,92,246,0.35)] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          <div className="border-t border-[rgba(248,113,113,0.15)] pt-4">
            {!confirmDelete ? (
              <button type="button" onClick={() => setConfirmDelete(true)} className="w-full py-2.5 rounded-xl text-[0.88rem] font-bold border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] text-[#f87171] cursor-pointer hover:bg-[rgba(248,113,113,0.18)] transition-all">
                Delete Module
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-[0.82rem] text-[#f87171] m-0 text-center font-semibold">Permanently delete this module?</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setConfirmDelete(false)} className="flex-1 py-2 rounded-xl text-[0.85rem] font-bold border border-[rgba(255,255,255,0.1)] bg-transparent text-[#9090b0] cursor-pointer hover:bg-[rgba(255,255,255,0.05)] transition-all">Cancel</button>
                  <button type="button" onClick={handleDelete} disabled={deleting} className="flex-1 py-2 rounded-xl text-[0.85rem] font-bold border border-[rgba(248,113,113,0.4)] bg-[rgba(248,113,113,0.15)] text-[#f87171] cursor-pointer hover:bg-[rgba(248,113,113,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {deleting ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
        <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.94) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
      </div>
    </div>
  );
}

// ── Main CoursePage ────────────────────────────────────────────────────────────
export default function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [course, setCourse]     = useState(null);
  const [modules, setModules]   = useState([]);
  const [completed, setCompleted] = useState(new Set());
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Admin modal state
  const [showCreate, setShowCreate]   = useState(false);
  const [editingModule, setEditingModule] = useState(null);

  // Drag state
  const [saving, setSaving]       = useState(false);
  const [draggingId, setDraggingId] = useState(null);
  const listRef                   = useRef(null);
  const itemRefs                  = useRef([]);
  const dragState                 = useRef(null); // live drag data, no re-renders

  useEffect(() => {
    async function fetchCourseAndModules() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers = { Authorization: `Bearer ${session.access_token}` };
        const [courseRes, modulesRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/courses/${encodeURIComponent(courseId)}`, { headers }),
          fetch(`${API_URL}/api/v1/modules/course/${encodeURIComponent(courseId)}`, { headers }),
        ]);
        if (!courseRes.ok) throw new Error(`Failed to load course (${courseRes.status})`);
        if (!modulesRes.ok) throw new Error(`Failed to load modules (${modulesRes.status})`);
        setCourse(await courseRes.json());
        const data = await modulesRes.json();
        setModules(data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    }
    fetchCourseAndModules();
  }, [courseId]);

  useEffect(() => {
    async function fetchProgress() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`${API_URL}/api/v1/course-progress/me/${encodeURIComponent(courseId)}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCompleted(new Set(data.map(p => p.moduleId)));
        }
      } catch { /* non-critical */ }
    }
    fetchProgress();
  }, [courseId]);

  // ── GSAP pointer drag ────────────────────────────────────────────────────────
  const persistOrder = useCallback(async (orderedModules) => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${API_URL}/api/v1/modules/reorder`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleIds: orderedModules.map(m => m.moduleId) }),
      });
    } catch { /* non-critical */ }
    finally { setSaving(false); }
  }, []);

  const onPointerDown = useCallback((e, idx) => {
    // Only drag handle (the grip icon) triggers drag
    if (!e.currentTarget.dataset.handle) return;
    e.preventDefault();

    const el = itemRefs.current[idx];
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const GAP = 12; // gap-3 = 12px
    const itemH = rect.height + GAP;

    // Snapshot all item rects before we start moving anything
    const rects = itemRefs.current.map(r => r?.getBoundingClientRect());

    dragState.current = {
      fromIdx: idx,
      currentIdx: idx,
      startY: e.clientY,
      startTop: rect.top,
      itemH,
    };

    // Lift the dragged element above others
    gsap.set(el, {
      position: 'relative',
      zIndex: 50,
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      scale: 1.02,
    });

    setDraggingId(idx);

    function onMove(ev) {
      const dy = ev.clientY - dragState.current.startY;
      gsap.set(el, { y: dy });

      // Determine new logical index
      const midY = dragState.current.startTop + dy + rect.height / 2;
      let newIdx = Math.round((midY - rects[0].top) / itemH);
      newIdx = Math.max(0, Math.min(itemRefs.current.length - 1, newIdx));

      if (newIdx === dragState.current.currentIdx) return;
      dragState.current.currentIdx = newIdx;

      // Animate other items to make room
      itemRefs.current.forEach((ref, i) => {
        if (i === idx || !ref) return;
        const from = dragState.current.fromIdx;
        let shift = 0;
        if (from < newIdx && i > from && i <= newIdx) shift = -itemH;
        else if (from > newIdx && i >= newIdx && i < from) shift = itemH;
        gsap.to(ref, { y: shift, duration: 0.2, ease: 'power2.out' });
      });
    }

    function onUp() {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);

      const finalIdx = dragState.current.currentIdx;
      const fromIdx  = dragState.current.fromIdx;

      // Reset all GSAP transforms
      itemRefs.current.forEach(ref => {
        if (ref) gsap.set(ref, { y: 0, zIndex: '', boxShadow: '', scale: 1, position: '' });
      });

      setDraggingId(null);
      dragState.current = null;

      if (fromIdx === finalIdx) return;

      // Reorder state array and persist
      setModules(prev => {
        const next = [...prev];
        const [moved] = next.splice(fromIdx, 1);
        next.splice(finalIdx, 0, moved);
        persistOrder(next);
        return next;
      });
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [persistOrder]);

  const title = formatId(courseId);
  const completedCount = modules.filter(m => completed.has(m.moduleId)).length;
  const allDone = modules.length > 0 && completedCount === modules.length;

  return (
    <div className="w-full min-h-screen overflow-auto">

      {showCreate && (
        <CreateModuleModal
          courseId={courseId}
          nextOrder={modules.length + 1}
          onClose={() => setShowCreate(false)}
          onCreated={mod => setModules(prev => [...prev, mod])}
        />
      )}

      {editingModule && (
        <EditModuleModal
          module={editingModule}
          onClose={() => setEditingModule(null)}
          onUpdated={updated => setModules(prev => prev.map(m => m.moduleId === updated.moduleId ? updated : m))}
          onDeleted={moduleId => setModules(prev => prev.filter(m => m.moduleId !== moduleId))}
        />
      )}

      {/* Back nav */}
      <div className="px-8 pt-6 pb-0">
        <button onClick={() => navigate('/learn')} className="flex items-center gap-2 text-[#6b6490] text-sm hover:text-[#a78bfa] transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          All Courses
        </button>
      </div>

      {loading && <div className="flex items-center justify-center py-40"><p className="text-[#6b6490] text-lg font-semibold animate-pulse">Loading...</p></div>}
      {error && <div className="flex items-center justify-center py-40 text-red-400"><p className="text-lg font-semibold">{error}</p></div>}

      {!loading && !error && (
        <>
          <div className="text-center px-6 pt-10 pb-10">
            <span className="text-[0.72rem] text-[#4b5563] font-semibold tracking-[0.18em] uppercase">Course</span>
            <h1 className="text-[2.6rem] font-bold text-[#f0eeff] m-0 mt-3 leading-tight">{title}</h1>
            {course?.description && (
              <p className="text-[#6b6490] text-[1rem] mt-3 m-0 leading-relaxed max-w-xl mx-auto">{course.description}</p>
            )}
            {modules.length > 0 && (
              <p className="text-[#6b6490] text-sm mt-3 m-0">{completedCount} / {modules.length} completed</p>
            )}
          </div>

          <div className="w-full h-px bg-[rgba(255,255,255,0.1)]" />

          <div className="max-w-2xl mx-auto px-6 py-10">

            {/* Module header row */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-[0.72rem] text-[#4b5563] font-semibold tracking-widest uppercase m-0">
                {modules.length} Module{modules.length !== 1 ? 's' : ''}
                {isAdmin && saving && <span className="ml-2 text-[#8b5cf6] normal-case tracking-normal">Saving order...</span>}
              </p>
              {isAdmin && (
                <button
                  onClick={() => setShowCreate(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.82rem] font-bold bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white border-none cursor-pointer shadow-[0_2px_10px_rgba(139,92,246,0.3)] hover:opacity-90 transition-all"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                  Add Module
                </button>
              )}
            </div>

            {isAdmin && modules.length > 1 && (
              <p className="text-[0.72rem] text-[#4b4870] mb-3 m-0 flex items-center gap-1.5">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9l4-4 4 4M9 5v14M19 15l-4 4-4-4M15 19V5"/></svg>
                Drag modules to reorder
              </p>
            )}

            {modules.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-[#4b4870]">
                <span className="text-5xl mb-4">📭</span>
                <p className="text-lg font-semibold">{isAdmin ? 'No modules yet. Add one above.' : 'No modules available yet.'}</p>
              </div>
            ) : (
              <>
                <div ref={listRef} className="flex flex-col gap-3">
                  {modules.map((mod, idx) => {
                    const isDone = completed.has(mod.moduleId);
                    const isDragging = draggingId === idx;
                    return (
                      <div
                        key={mod.moduleId}
                        ref={el => itemRefs.current[idx] = el}
                        className={`group relative flex items-center gap-4 w-full text-left px-5 py-4 bg-[#0d0f18] border rounded-xl transition-[border-color,background-color] duration-200 ${
                          isDragging
                            ? 'border-[rgba(139,92,246,0.6)] bg-[rgba(139,92,246,0.08)]'
                            : 'border-[rgba(255,255,255,0.07)] hover:border-[rgba(139,92,246,0.45)] hover:bg-[rgba(139,92,246,0.06)]'
                        } ${!isAdmin ? 'cursor-pointer' : ''}`}
                        onClick={!isAdmin ? () => navigate(`/course/${encodeURIComponent(courseId)}/module/${encodeURIComponent(mod.moduleId)}`) : undefined}
                      >
                        {/* Drag handle (admin only) */}
                        {isAdmin && (
                          <span
                            data-handle="true"
                            onPointerDown={e => onPointerDown(e, idx)}
                            className="flex-shrink-0 text-[#3a3560] group-hover:text-[#6b5fa8] transition-colors cursor-grab active:cursor-grabbing touch-none select-none"
                            title="Drag to reorder"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm8-16a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>
                          </span>
                        )}

                        {/* Order number */}
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-[0.72rem] text-[#4b5563] font-bold group-hover:text-[#8b5cf6] transition-colors">
                          {idx + 1}
                        </span>

                        {/* Title — clickable for non-admin, plain text for admin */}
                        {isAdmin ? (
                          <p className="flex-1 min-w-0 text-[0.95rem] font-semibold m-0 text-[#c4b5fd]">
                            {formatId(mod.moduleId)}
                          </p>
                        ) : (
                          <p className={`flex-1 min-w-0 text-[0.95rem] font-semibold m-0 transition-colors ${isDone ? 'text-[#6b6490]' : 'text-[#c4b5fd] group-hover:text-white'}`}>
                            {formatId(mod.moduleId)}
                          </p>
                        )}

                        {/* Admin actions */}
                        {isAdmin ? (
                          <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => navigate(`/course/${encodeURIComponent(courseId)}/module/${encodeURIComponent(mod.moduleId)}`)}
                              className="flex items-center justify-center w-7 h-7 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#6b6490] cursor-pointer hover:bg-[rgba(139,92,246,0.15)] hover:text-[#a78bfa] hover:border-[rgba(139,92,246,0.3)] transition-all"
                              title="View module"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </button>
                            <button
                              onClick={() => setEditingModule(mod)}
                              className="flex items-center justify-center w-7 h-7 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#6b6490] cursor-pointer hover:bg-[rgba(139,92,246,0.15)] hover:text-[#a78bfa] hover:border-[rgba(139,92,246,0.3)] transition-all"
                              title="Edit module"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                          </div>
                        ) : (
                          isDone ? (
                            <div className="flex-shrink-0 flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-green-500/20 border-2 border-green-500/60 flex items-center justify-center">
                                <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><path d="M2 6l3 3 5-5"/></svg>
                              </div>
                              <span className="text-[0.7rem] text-green-400 font-semibold">Done</span>
                            </div>
                          ) : (
                            <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-[rgba(255,255,255,0.12)] group-hover:border-[rgba(139,92,246,0.5)] transition-colors" />
                          )
                        )}
                      </div>
                    );
                  })}
                </div>

                {!isAdmin && (
                  <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.06)]">
                    {!allDone && (
                      <p className="text-[0.78rem] text-[#4b5563] text-center mb-3">Complete all modules to unlock the quiz</p>
                    )}
                    <button
                      disabled={!allDone}
                      onClick={() => navigate(`/learn/${encodeURIComponent(courseId)}`)}
                      className="w-full py-3 font-bold text-[0.95rem] rounded-xl border-none transition-all disabled:bg-[rgba(255,255,255,0.05)] disabled:text-[#4b5563] disabled:cursor-not-allowed enabled:bg-gradient-to-br enabled:from-[#8b5cf6] enabled:to-[#6d28d9] enabled:text-white enabled:cursor-pointer enabled:shadow-[0_4px_18px_rgba(139,92,246,0.4)] enabled:hover:opacity-90 enabled:hover:-translate-y-px"
                    >
                      {allDone ? 'Start Quiz →' : `Start Quiz (${completedCount}/${modules.length} modules done)`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
