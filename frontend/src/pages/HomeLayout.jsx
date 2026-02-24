import { Outlet } from 'react-router-dom';
import Sidebar from '../components/HomePage/Sidebar';

export default function HomeLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_20%_20%,#110d2e_0%,#050508_70%)] flex flex-row items-stretch">
      <Sidebar />
      <div className="flex-1 overflow-auto min-h-0">
        <Outlet />
      </div>
    </div>
  );
}
