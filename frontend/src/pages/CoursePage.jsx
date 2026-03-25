import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const API_URL = import.meta.env.VITE_API_URL;

function formatId(id) {
  if (!id) return '';
  return id.replace(/[-_.]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse]     = useState(null);
  const [modules, setModules]   = useState([]);
  const [completed, setCompleted] = useState(new Set()); // Set of completed moduleIds
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Fetch course info + modules once on mount
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
        const modulesData = await modulesRes.json();
        setModules(modulesData.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCourseAndModules();
  }, [courseId]);

  // Fetch progress separately — and re-fetch whenever this tab becomes visible again
  // so returning from a module tab reflects the latest completion status
  useEffect(() => {
    async function fetchProgress() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers = { Authorization: `Bearer ${session.access_token}` };
        const res = await fetch(`${API_URL}/api/v1/course-progress/me/${encodeURIComponent(courseId)}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setCompleted(new Set(data.map(p => p.moduleId)));
        }
      } catch { /* non-critical — silently ignore */ }
    }

    fetchProgress();

    function onVisible() {
      if (document.visibilityState === 'visible') fetchProgress();
    }
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [courseId]);

  function openModule(moduleId) {
    window.open(`/course/${encodeURIComponent(courseId)}/module/${encodeURIComponent(moduleId)}`, '_blank');
  }

  const title = formatId(courseId);
  const completedCount = modules.filter(m => completed.has(m.moduleId)).length;
  const allDone = modules.length > 0 && completedCount === modules.length;

  return (
    <div className="w-full min-h-screen overflow-auto">

      {/* Back nav */}
      <div className="px-8 pt-6 pb-0">
        <button
          onClick={() => navigate('/learn')}
          className="flex items-center gap-2 text-[#6b6490] text-sm hover:text-[#a78bfa] transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          All Courses
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-40">
          <p className="text-[#6b6490] text-lg font-semibold animate-pulse">Loading...</p>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-40 text-red-400">
          <p className="text-lg font-semibold">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Centered title block */}
          <div className="text-center px-6 pt-10 pb-10">
            <span className="text-[0.72rem] text-[#4b5563] font-semibold tracking-[0.18em] uppercase">Course</span>
            <h1 className="text-[2.6rem] font-bold text-[#f0eeff] m-0 mt-3 leading-tight">{title}</h1>
            {course?.description && (
              <p className="text-[#6b6490] text-[1rem] mt-3 m-0 leading-relaxed max-w-xl mx-auto">{course.description}</p>
            )}
            {modules.length > 0 && (
              <p className="text-[#6b6490] text-sm mt-3 m-0">
                {completedCount} / {modules.length} completed
              </p>
            )}
          </div>

          {/* Full-width divider */}
          <div className="w-full h-px bg-[rgba(255,255,255,0.1)]" />

          <div className="max-w-2xl mx-auto px-6 py-10">

            {/* Module count label */}
            <p className="text-[0.72rem] text-[#4b5563] font-semibold tracking-widest uppercase mb-4">
              {modules.length} Module{modules.length !== 1 ? 's' : ''}
            </p>

            {modules.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-[#4b4870]">
                <span className="text-5xl mb-4">📭</span>
                <p className="text-lg font-semibold">No modules available yet.</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3">
                  {modules.map((mod, idx) => {
                    const isDone = completed.has(mod.moduleId);
                    return (
                      <button
                        key={mod.moduleId}
                        onClick={() => openModule(mod.moduleId)}
                        className="group flex items-center gap-4 w-full text-left px-5 py-4 bg-[#0d0f18] border border-[rgba(255,255,255,0.07)] rounded-xl cursor-pointer transition-all duration-200 hover:border-[rgba(139,92,246,0.45)] hover:bg-[rgba(139,92,246,0.06)]"
                      >
                        {/* Order number */}
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-[0.72rem] text-[#4b5563] font-bold group-hover:text-[#8b5cf6] transition-colors">
                          {idx + 1}
                        </span>

                        {/* Title */}
                        <p className={`flex-1 min-w-0 text-[0.95rem] font-semibold m-0 transition-colors ${isDone ? 'text-[#6b6490]' : 'text-[#c4b5fd] group-hover:text-white'}`}>
                          {formatId(mod.moduleId)}
                        </p>

                        {/* Completion status */}
                        {isDone ? (
                          <div className="flex-shrink-0 flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 border-2 border-green-500/60 flex items-center justify-center">
                              <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                                <path d="M2 6l3 3 5-5"/>
                              </svg>
                            </div>
                            <span className="text-[0.7rem] text-green-400 font-semibold">Done</span>
                          </div>
                        ) : (
                          <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-[rgba(255,255,255,0.12)] group-hover:border-[rgba(139,92,246,0.5)] transition-colors" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Start Quiz */}
                <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.06)]">
                  {!allDone && (
                    <p className="text-[0.78rem] text-[#4b5563] text-center mb-3">
                      Complete all modules to unlock the quiz
                    </p>
                  )}
                  <button
                    disabled={!allDone}
                    onClick={() => navigate(`/learn/${encodeURIComponent(courseId)}`)}
                    className="w-full py-3 font-bold text-[0.95rem] rounded-xl border-none transition-all
                      disabled:bg-[rgba(255,255,255,0.05)] disabled:text-[#4b5563] disabled:cursor-not-allowed
                      enabled:bg-gradient-to-br enabled:from-[#8b5cf6] enabled:to-[#6d28d9] enabled:text-white enabled:cursor-pointer enabled:shadow-[0_4px_18px_rgba(139,92,246,0.4)] enabled:hover:opacity-90 enabled:hover:-translate-y-px"
                  >
                    {allDone ? 'Start Quiz →' : `Start Quiz (${completedCount}/${modules.length} modules done)`}
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
