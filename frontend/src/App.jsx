import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, GuestRoute } from './components/RouteGuards';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import AuthCallback from './pages/AuthCallback';
import HomeLayout from './pages/HomeLayout';
import HomePage from './pages/HomePage';
import LearnPage from './components/HomePage/LearnPage';
import AdaptiveLearningPage from './pages/AdaptiveLearningPage';
import CommunityPage from './components/HomePage/CommunityPage';
import PostDetailPage from './pages/PostDetailPage';
import LeaderboardPage from './pages/LeaderboardPage';
import CoursePage from './pages/CoursePage';
import LessonPage from './pages/LessonPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ModuleEditorPage from './pages/ModuleEditorPage';

function ComingSoon({ label }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-[#6b6490]">
      <span className="text-5xl mb-4">🚧</span>
      <p className="text-lg font-semibold">{label} coming soon!</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<GuestRoute><AuthPage /></GuestRoute>} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route element={<ProtectedRoute><HomeLayout /></ProtectedRoute>}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/learn/:courseId" element={<AdaptiveLearningPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/community/:postId" element={<PostDetailPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/course/:courseId" element={<CoursePage />} />
            <Route path="/course/:courseId/module/:moduleId" element={<LessonPage />} />
          </Route>
          {/* Full-screen module editor — outside HomeLayout (no navbar) */}
          <Route path="/admin/module/:moduleId/edit" element={<ProtectedRoute><ModuleEditorPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
