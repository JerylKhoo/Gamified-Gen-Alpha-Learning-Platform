import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const ROLES = ['User', 'Collaborator', 'Admin'];
const ROWS_PER_PAGE = 10;

const ROLE_STYLE = {
  Admin:        'bg-[rgba(248,113,113,0.12)] border-[rgba(248,113,113,0.3)] text-[#f87171]',
  Collaborator: 'bg-[rgba(139,92,246,0.12)] border-[rgba(139,92,246,0.3)] text-[#a78bfa]',
  User:         'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.12)] text-[#9090b0]',
};

export default function AdminDashboardPage() {
  const { isAdmin, session: authSession } = useAuth();
  const navigate = useNavigate();

  // Tab state
  const [activeTab, setActiveTab] = useState('users');

  // Users state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [filterRole, setFilterRole] = useState('All');
  const [page, setPage] = useState(1);

  // Moderation state
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState('');
  const [actioningId, setActioningId] = useState(null);

  useEffect(() => {
    if (isAdmin === false) {
      navigate('/home');
    }
  }, [isAdmin, navigate]);

  // Fetch users
  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const res = await fetch(`${API_URL}/api/v1/admin/users`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.status === 403) { navigate('/home'); return; }
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

  // Fetch reported posts
  useEffect(() => {
    async function fetchReports() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const res = await fetch(`${API_URL}/api/v1/admin/reports`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) throw new Error('Failed to load reports');
        setReports(await res.json());
      } catch (e) {
        setReportsError(e.message);
      } finally {
        setReportsLoading(false);
      }
    }
    fetchReports();
  }, []);

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

  async function handleApprove(postId) {
    setActioningId(postId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(`${API_URL}/api/v1/admin/reports/${postId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        setReports(prev => prev.filter(r => r.postId !== postId));
      }
    } catch { /* silent */ } finally {
      setActioningId(null);
    }
  }

  async function handleDeletePost(postId) {
    setActioningId(postId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(`${API_URL}/api/v1/admin/reports/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        setReports(prev => prev.filter(r => r.postId !== postId));
      }
    } catch { /* silent */ } finally {
      setActioningId(null);
    }
  }

  // Filtered and paginated users
  const filtered = users.filter(u => {
    const matchesSearch = search === '' ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.userId?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'All' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

  // Reset page when search/filter changes
  useEffect(() => { setPage(1); }, [search, filterRole]);

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'Admin').length,
    collaborators: users.filter(u => u.role === 'Collaborator').length,
    regular: users.filter(u => u.role === 'User').length,
  };

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  return (
    <div className="w-full min-h-screen px-8 py-8 overflow-auto sm:px-4 sm:py-6 flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[1.8rem] font-extrabold text-[#f0eeff] m-0 flex items-center gap-3">
          Admin Dashboard
        </h1>
        <p className="text-[0.9rem] text-[#6b6490] m-0">Manage users, roles, and moderate reported content.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[rgba(139,92,246,0.15)] pb-0">
        {[
          { key: 'users', label: 'User Management', count: users.length },
          { key: 'moderation', label: 'Moderation Queue', count: reports.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 text-[0.88rem] font-bold border-b-2 cursor-pointer transition-all bg-transparent ${
              activeTab === tab.key
                ? 'border-[#8b5cf6] text-[#c4b5fd]'
                : 'border-transparent text-[#5a5278] hover:text-[#a78bfa]'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-2 text-[0.72rem] px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key
                  ? 'bg-[rgba(139,92,246,0.2)] text-[#c4b5fd]'
                  : 'bg-[rgba(255,255,255,0.06)] text-[#5a5278]'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ============ USERS TAB ============ */}
      {activeTab === 'users' && (
        <>
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
                placeholder="Search by name, email, or ID..."
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
                    <th className="text-left px-4 py-3 text-[0.75rem] font-bold text-[#7c6ea8] uppercase tracking-[0.1em]">Email</th>
                    <th className="text-left px-4 py-3 text-[0.75rem] font-bold text-[#7c6ea8] uppercase tracking-[0.1em]">Joined</th>
                    <th className="text-left px-4 py-3 text-[0.75rem] font-bold text-[#7c6ea8] uppercase tracking-[0.1em]">XP</th>
                    <th className="text-left px-4 py-3 text-[0.75rem] font-bold text-[#7c6ea8] uppercase tracking-[0.1em]">Reports</th>
                    <th className="text-left px-4 py-3 text-[0.75rem] font-bold text-[#7c6ea8] uppercase tracking-[0.1em]">Role</th>
                    <th className="text-left px-4 py-3 text-[0.75rem] font-bold text-[#7c6ea8] uppercase tracking-[0.1em]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(user => (
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
                          <span className="text-[0.88rem] font-bold text-[#e0d9ff] truncate max-w-[160px]">{user.name || 'Unknown'}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3">
                        <span className="text-[0.82rem] text-[#8a82a6] truncate block max-w-[200px]">{user.email || '—'}</span>
                      </td>

                      {/* Join date */}
                      <td className="px-4 py-3">
                        <span className="text-[0.82rem] text-[#8a82a6]">{formatDate(user.createdAt)}</span>
                      </td>

                      {/* XP */}
                      <td className="px-4 py-3">
                        <span className="text-[0.88rem] font-bold text-[#fbbf24]">
                          {user.points ?? 0}
                        </span>
                      </td>

                      {/* Report count */}
                      <td className="px-4 py-3">
                        <span className={`text-[0.88rem] font-bold ${user.reportCount > 0 ? 'text-[#f87171]' : 'text-[#5a5278]'}`}>
                          {user.reportCount ?? 0}
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
                        {user.role === 'Admin' && user.userId !== authSession?.user?.id ? (
                          <span className="text-[0.78rem] text-[#4b4870] italic">Protected</span>
                        ) : (
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
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-[#4b4870]">
                  <p className="text-[0.9rem] font-semibold m-0">No users found</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-[0.78rem] text-[#5a5278] font-semibold m-0">
                Showing {(safePage - 1) * ROWS_PER_PAGE + 1}–{Math.min(safePage * ROWS_PER_PAGE, filtered.length)} of {filtered.length} users
              </p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="px-3 py-1.5 rounded-lg text-[0.82rem] font-semibold border border-[rgba(139,92,246,0.18)] bg-transparent text-[#a78bfa] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[rgba(139,92,246,0.1)] transition-all"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-[0.82rem] font-bold border cursor-pointer transition-all ${
                      p === safePage
                        ? 'bg-[rgba(139,92,246,0.25)] border-[rgba(139,92,246,0.5)] text-[#c4b5fd]'
                        : 'bg-transparent border-[rgba(139,92,246,0.12)] text-[#5a5278] hover:text-[#a78bfa]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className="px-3 py-1.5 rounded-lg text-[0.82rem] font-semibold border border-[rgba(139,92,246,0.18)] bg-transparent text-[#a78bfa] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[rgba(139,92,246,0.1)] transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {!loading && !error && totalPages <= 1 && filtered.length > 0 && (
            <p className="text-[0.78rem] text-[#5a5278] font-semibold m-0">
              Showing {filtered.length} of {users.length} users
            </p>
          )}
        </>
      )}

      {/* ============ MODERATION TAB ============ */}
      {activeTab === 'moderation' && (
        <>
          {reportsLoading && (
            <div className="flex items-center justify-center py-20 text-[#6b6490]">
              <p className="text-lg font-semibold animate-pulse">Loading reported posts...</p>
            </div>
          )}
          {reportsError && <p className="text-red-400 text-[0.9rem]">{reportsError}</p>}

          {!reportsLoading && !reportsError && reports.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-[#4b4870]">
              <span className="text-5xl mb-4">&#10003;</span>
              <p className="text-[1rem] font-bold m-0 text-[#6b6490]">No reported posts</p>
              <p className="text-[0.85rem] text-[#4b4870] m-0 mt-1">All clear! Nothing needs moderation.</p>
            </div>
          )}

          {!reportsLoading && !reportsError && reports.length > 0 && (
            <div className="flex flex-col gap-4">
              {reports.map(post => (
                <div
                  key={post.postId}
                  className="rounded-xl border border-[rgba(248,113,113,0.2)] bg-[rgba(248,113,113,0.03)] p-5 flex flex-col gap-4"
                >
                  {/* Post header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {post.authorProfilePic ? (
                        <img src={post.authorProfilePic} alt={post.authorName} className="w-10 h-10 rounded-full object-cover shadow-[0_2px_6px_rgba(0,0,0,0.4)]" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] flex items-center justify-center text-[1rem] font-bold text-white select-none">
                          {post.authorName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="text-[0.95rem] font-bold text-[#e0d9ff] truncate">{post.title}</span>
                        <span className="text-[0.78rem] text-[#6b6490]">by {post.authorName || 'Unknown'}</span>
                      </div>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 rounded-full bg-[rgba(248,113,113,0.15)] border border-[rgba(248,113,113,0.3)] text-[#f87171] text-[0.75rem] font-bold">
                      {post.reportCount} {post.reportCount === 1 ? 'report' : 'reports'}
                    </span>
                  </div>

                  {/* Post content */}
                  {post.description && (
                    <p className="text-[0.85rem] text-[#9a93b8] m-0 leading-relaxed line-clamp-3">{post.description}</p>
                  )}
                  {post.picture && (
                    <img src={post.picture} alt="Post" className="max-h-48 rounded-lg object-cover border border-[rgba(255,255,255,0.08)]" />
                  )}

                  {/* Reports list */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[0.75rem] font-bold text-[#7c6ea8] uppercase tracking-[0.1em]">Reports</span>
                    {post.reports?.map((r, idx) => (
                      <div key={r.reportId || idx} className="flex items-start gap-3 bg-[rgba(255,255,255,0.03)] rounded-lg p-3 border border-[rgba(255,255,255,0.06)]">
                        <div className="w-7 h-7 rounded-full bg-[rgba(248,113,113,0.15)] flex items-center justify-center text-[0.7rem] font-bold text-[#f87171] shrink-0">
                          {r.reporterName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[0.82rem] font-semibold text-[#c4b5fd]">{r.reporterName || 'Unknown'}</span>
                            <span className="text-[0.72rem] px-1.5 py-0.5 rounded bg-[rgba(248,113,113,0.12)] text-[#f87171] font-semibold">{r.reason}</span>
                          </div>
                          {r.description && <p className="text-[0.8rem] text-[#7c6ea8] m-0">{r.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => handleApprove(post.postId)}
                      disabled={actioningId === post.postId}
                      className="px-4 py-2 rounded-lg text-[0.85rem] font-bold border border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.1)] text-[#4ade80] cursor-pointer hover:bg-[rgba(34,197,94,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Approve (Clear Reports)
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.postId)}
                      disabled={actioningId === post.postId}
                      className="px-4 py-2 rounded-lg text-[0.85rem] font-bold border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.1)] text-[#f87171] cursor-pointer hover:bg-[rgba(248,113,113,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete Post
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
