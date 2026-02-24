import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import HomeLayout from './pages/HomeLayout';
import HomePage from './pages/HomePage';
import LearnPage from './components/HomePage/LearnPage';
import CommunityPage from './components/HomePage/CommunityPage';

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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/home" element={<HomeLayout />}>
          <Route index element={<HomePage />} />
          <Route path="learn" element={<LearnPage />} />
          <Route path="community" element={<CommunityPage />} />
          <Route path="dashboard" element={<ComingSoon label="Dashboard" />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
