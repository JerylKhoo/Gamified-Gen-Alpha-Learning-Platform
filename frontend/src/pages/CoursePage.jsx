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
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers = { Authorization: `Bearer ${session.access_token}` };

        const res = await fetch(`${API_URL}/api/v1/courses-with-modules/${encodeURIComponent(courseId)}`, { headers });
        if (!res.ok) throw new Error(`Failed to load course (${res.status})`);

        const data = await res.json();
        setCourse(data);
        setModules((data.modules ?? []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [courseId]);

  function openModule(moduleId) {
    window.open(`/course/${encodeURIComponent(courseId)}/module/${encodeURIComponent(moduleId)}`, '_blank');
  }

  const title = formatId(courseId);

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
          {/* Centered title block — full width */}
          <div className="text-center px-6 pt-10 pb-10">
            <span className="text-[0.72rem] text-[#4b5563] font-semibold tracking-[0.18em] uppercase">Course</span>
            <h1 className="text-[2.6rem] font-bold text-[#f0eeff] m-0 mt-3 leading-tight">{title}</h1>
            {course?.description && (
              <p className="text-[#6b6490] text-[1rem] mt-3 m-0 leading-relaxed max-w-xl mx-auto">{course.description}</p>
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
            <div className="flex flex-col">
              {modules.map((mod, idx) => (
                <button
                  key={mod.moduleId}
                  onClick={() => openModule(mod.moduleId)}
                  className={`group flex items-center gap-4 w-full text-left py-4 cursor-pointer transition-all duration-200 hover:pl-2 ${idx !== modules.length - 1 ? 'border-b border-[rgba(255,255,255,0.06)]' : ''}`}
                >
                  <span className="flex-shrink-0 text-[0.75rem] text-[#4b5563] font-semibold w-5 text-right group-hover:text-[#8b5cf6] transition-colors">
                    {idx + 1}.
                  </span>
                  <p className="flex-1 min-w-0 text-[#c4b5fd] text-[0.95rem] m-0 underline underline-offset-2 decoration-[rgba(139,92,246,0.3)] group-hover:text-white group-hover:decoration-[rgba(139,92,246,0.7)] transition-colors">
                    {formatId(mod.moduleId)}
                  </p>
                  <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-[rgba(255,255,255,0.12)] flex items-center justify-center group-hover:border-[rgba(139,92,246,0.5)] transition-colors">
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-transparent group-hover:text-[rgba(139,92,246,0.5)] transition-colors">
                      <path d="M2 6l3 3 5-5"/>
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        </>
      )}
    </div>
  );
}
