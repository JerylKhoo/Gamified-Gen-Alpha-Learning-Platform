import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const ROLES = ['User', 'Collaborator', 'Admin'];

const ROLE_STYLE = {
  Admin:        'bg-[rgba(248,113,113,0.12)] border-[rgba(248,113,113,0.3)] text-[#f87171]',
  Collaborator: 'bg-[rgba(139,92,246,0.12)] border-[rgba(139,92,246,0.3)] text-[#a78bfa]',
  User:         'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.12)] text-[#9090b0]',
};

export default function AdminDashboardPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [filterRole, setFilterRole] = useState('All');

  useEffect(() => {
    if (isAdmin === false) {
      navigate('/home');
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const res = await fetch(`${API_URL}/api/v1/admin/users`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.status === 403) {
          navigate('/home');
          return;
        }
        if (!res.ok) throw new Error('Failed to load users');
        setUsers(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [navigate]);

  async function handleRoleChange(userId, newRole) {
    setUpdatingId(userId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(`${API_URL}/api/v1/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers(prev => prev.map(u => u.userId === userId ? updated : u));
      }
    } catch { /* silent */ } finally {
      setUpdatingId(null);
    }
  }

  const filtered = users.filter(u => {
    const matchesSearch = search === '' ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.userId?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'All' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'Admin').length,
    collaborators: users.filter(u => u.role === 'Collaborator').length,
    regular: users.filter(u => u.role === 'User').length,
  };

  return (
    <div className="w-full min-h-screen px-8 py-8 overflow-auto sm:px-4 sm:py-6 flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[1.8rem] font-extrabold text-[#f0eeff] m-0 flex items-center gap-3">
          Admin Dashboard
        </h1>
        <p className="text-[0.9rem] text-[#6b6490] m-0">Manage users, roles, and view platform stats.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-2">
        {[
          { label: 'Total Users', value: stats.total, color: 'text-[#f0eeff]', bg: 'border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.06)]' },
          { label: 'Admins', value: stats.admins, color: 'text-[#f87171]', bg: 'border-[rgba(248,113,113,0.2)] bg-[rgba(248,113,113,0.06)]' },
          { label: 'Collaborators', value: stats.collaborators, color: 'text-[#a78bfa]', bg: 'border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.06)]' },
          { label: 'Regular Users', value: stats.regular, color: 'text-[#9090b0]', bg: 'border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)]' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 flex flex-col gap-1 ${s.bg}`}>
            <span className="text-[0.75rem] font-bold text-[#7c6ea8] uppercase tracking-[0.1em]">{s.label}</span>
            <span className={`text-[1.6rem] font-extrabold ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 max-w-[400px]">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4b4870] pointer-events-none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(139,92,246,0.18)] rounded-[10px] pl-9 pr-3 py-2 text-[0.9rem] text-[#f0eeff] placeholder:text-[#4b4870] outline-none focus:border-[rgba(139,92,246,0.5)] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['All', ...ROLES].map(role => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-4 py-[0.45rem] rounded-full text-sm font-semibold border cursor-pointer transition-all ${
                filterRole === role
                  ? 'bg-[rgba(139,92,246,0.2)] border-[rgba(139,92,246,0.5)] text-[#c4b5fd]'
                  : 'bg-transparent border-[rgba(255,255,255,0.1)] text-[#6b6490] hover:border-[rgba(139,92,246,0.3)] hover:text-[#a78bfa]'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-[#6b6490]">
          <p className="text-lg font-semibold animate-pulse">Loading users...</p>
        </div>
      )}
      {error && <p className="text-red-400 text-[0.9rem]">{error}</p>}

      {/* Users table */}
      {!loading && !error && (
        <div className="rounded-xl border border-[rgba(139,92,246,0.15)] overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[rgba(139,92,246,0.08)]">
                <th className="text-left px-4 py-3 text-[0.75rem] font-bold text-[#7c6ea8] uppercase tracking-[0.1em]">User</th>
                <th className="text-left px-4 py-3 text-[0.75rem] font-bold text-[#7c6ea8] uppercase tracking-[0.1em]">Points</th>
                <th className="text-left px-4 py-3 text-[0.75rem] font-bold text-[#7c6ea8] uppercase tracking-[0.1em]">Role</th>
                <th className="text-left px-4 py-3 text-[0.75rem] font-bold text-[#7c6ea8] uppercase tracking-[0.1em]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr
                  key={user.userId}
                  className="border-t border-[rgba(139,92,246,0.08)] hover:bg-[rgba(139,92,246,0.04)] transition-colors"
                >
                  {/* User info */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.profilePic ? (
                        <img
                          src={user.profilePic}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] flex items-center justify-center text-[0.9rem] font-bold text-white select-none shadow-[0_2px_6px_rgba(0,0,0,0.4)]">
                          {user.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="text-[0.88rem] font-bold text-[#e0d9ff] truncate">{user.name || 'Unknown'}</span>
                        <span className="text-[0.7rem] text-[#4b4870] truncate">{user.userId}</span>
                      </div>
                    </div>
                  </td>

                  {/* Points */}
                  <td className="px-4 py-3">
                    <span className="text-[0.88rem] font-bold text-[#fbbf24]">
                      {user.points ?? 0}
                    </span>
                  </td>

                  {/* Current role badge */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center border rounded-md font-semibold tracking-[0.06em] uppercase text-[0.72rem] px-2 py-[0.25rem] ${ROLE_STYLE[user.role] || ROLE_STYLE.User}`}>
                      {user.role || 'User'}
                    </span>
                  </td>

                  {/* Role change dropdown */}
                  <td className="px-4 py-3">
                    <select
                      value={user.role || 'User'}
                      onChange={e => handleRoleChange(user.userId, e.target.value)}
                      disabled={updatingId === user.userId}
                      className="bg-[rgba(13,15,24,1)] border border-[rgba(139,92,246,0.18)] rounded-[8px] px-3 py-[0.4rem] text-[0.82rem] text-[#f0eeff] outline-none cursor-pointer focus:border-[rgba(139,92,246,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {ROLES.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-[#4b4870]">
              <span className="text-4xl mb-3">🔍</span>
              <p className="text-[0.9rem] font-semibold m-0">No users found</p>
            </div>
          )}
        </div>
      )}

      {/* Count label */}
      {!loading && !error && filtered.length > 0 && (
        <p className="text-[0.78rem] text-[#5a5278] font-semibold m-0">
          Showing {filtered.length} of {users.length} users
        </p>
      )}
    </div>
  );
}
