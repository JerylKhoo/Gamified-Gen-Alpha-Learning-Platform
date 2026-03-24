import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const API_URL = import.meta.env.VITE_API_URL;

function formatId(id) {
  if (!id) return '';
  return id.replace(/[-_.]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function LessonPage() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const [mod, setMod] = useState(null);
  const [allModules, setAllModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers = { Authorization: `Bearer ${session.access_token}` };

        const [moduleRes, allModulesRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/modules/${encodeURIComponent(moduleId)}`, { headers }),
          fetch(`${API_URL}/api/v1/modules/course/${encodeURIComponent(courseId)}`, { headers }),
        ]);

        if (!moduleRes.ok) throw new Error('Failed to load lesson');

        const [moduleData, allModulesData] = await Promise.all([
          moduleRes.json(),
          allModulesRes.ok ? allModulesRes.json() : Promise.resolve([]),
        ]);

        setMod(moduleData);
        setAllModules(allModulesData.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [moduleId, courseId]);

  const currentIndex = allModules.findIndex(m => m.moduleId === moduleId);
  const nextModule = currentIndex >= 0 && currentIndex < allModules.length - 1
    ? allModules[currentIndex + 1]
    : null;

  function goToNext() {
    if (nextModule) {
      navigate(`/course/${encodeURIComponent(courseId)}/module/${encodeURIComponent(nextModule.moduleId)}`);
    } else {
      navigate(`/course/${encodeURIComponent(courseId)}`);
    }
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-[#6b6490] text-lg font-semibold animate-pulse">Loading lesson...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 text-red-400">
        <p className="text-lg font-semibold">{error}</p>
        <button onClick={() => navigate(`/course/${encodeURIComponent(courseId)}`)} className="text-sm text-[#8b5cf6] underline">
          Back to Course
        </button>
      </div>
    );
  }

  const totalModules = allModules.length;
  const lessonNumber = currentIndex >= 0 ? currentIndex + 1 : null;

  return (
    <div className="w-full min-h-screen overflow-auto">

      {/* Top nav bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-3 bg-[rgba(5,5,8,0.85)] backdrop-blur-md border-b border-[rgba(255,255,255,0.06)]">
        <button
          onClick={() => navigate(`/course/${encodeURIComponent(courseId)}`)}
          className="flex items-center gap-2 text-[#6b6490] text-sm hover:text-[#a78bfa] transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {formatId(courseId)}
        </button>

        {lessonNumber && totalModules > 0 && (
          <span className="text-[0.72rem] text-[#4b5563] font-semibold tracking-wide">
            {lessonNumber} / {totalModules}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {lessonNumber && totalModules > 0 && (
        <div className="w-full h-[2px] bg-[rgba(255,255,255,0.04)]">
          <div
            className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] transition-all duration-500"
            style={{ width: `${(lessonNumber / totalModules) * 100}%` }}
          />
        </div>
      )}

      {/* Document area */}
      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Title */}
        <h1 className="text-center text-[1.6rem] font-bold text-[#f0eeff] m-0 mb-6 leading-snug">
          {formatId(moduleId)}
        </h1>

        {/* Divider */}
        <div className="w-full h-px bg-[rgba(255,255,255,0.1)] mb-10" />

        {/* Content */}
        <div
          className="lesson-content"
          dangerouslySetInnerHTML={{ __html: mod?.content || '<p>No content available.</p>' }}
        />

        {/* Divider */}
        <div className="w-full h-px bg-[rgba(255,255,255,0.06)] mt-12 mb-8" />

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(`/course/${encodeURIComponent(courseId)}`)}
            className="text-[#6b6490] text-sm hover:text-[#9ca3af] transition-colors"
          >
            ← Back to modules
          </button>
          <button
            onClick={goToNext}
            className="px-6 py-2.5 bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white font-bold text-[0.88rem] rounded-xl border-none cursor-pointer shadow-[0_4px_14px_rgba(139,92,246,0.35)] hover:opacity-90 hover:-translate-y-px active:translate-y-0 transition-all"
          >
            {nextModule ? 'Next →' : 'Finish Course →'}
          </button>
        </div>
      </div>
    </div>
  );
}
