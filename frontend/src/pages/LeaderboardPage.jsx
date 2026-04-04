import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const API_URL = import.meta.env.VITE_API_URL;

function parsePoints(points) {
  return Number(points) || 0;
}

const MEDAL = ['🥇', '🥈', '🥉'];
const RANK_COLORS = [
  'border-yellow-400/40 bg-yellow-400/5',
  'border-slate-400/40 bg-slate-400/5',
  'border-orange-400/40 bg-orange-400/5',
];

export default function LeaderboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`${API_URL}/api/v1/users/leaderboard`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) throw new Error('Failed to load leaderboard');
        const json = await res.json();
        setUsers(json.data ?? []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="w-full min-h-screen px-8 py-8 overflow-auto sm:px-4 sm:py-6 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[1.8rem] font-extrabold text-[#f0eeff] m-0 flex items-center gap-3">
          Leaderboard
        </h1>
        <p className="text-[0.9rem] text-[#6b6490] m-0">Top learners ranked by total points</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-[#6b6490] text-[0.95rem]">
          Loading...
        </div>
      )}

      {error && (
        <div className="text-red-400 text-[0.9rem] py-4">{error}</div>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-2">
          {users.map((user, i) => {
            const pts = parsePoints(user.points);
            const isTop3 = i < 3;
            return (
              <div
                key={user.userId}
                className={`flex items-center gap-4 px-5 py-4 rounded-xl border transition-colors ${
                  isTop3
                    ? RANK_COLORS[i]
                    : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                }`}
              >
                {/* Rank */}
                <div className="w-8 text-center flex-shrink-0">
                  {isTop3 ? (
                    <span className="text-[1.3rem]">{MEDAL[i]}</span>
                  ) : (
                    <span className="text-[0.9rem] font-bold text-[#6b6490]">{i + 1}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-[rgba(139,92,246,0.2)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="rgba(139,92,246,0.8)">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6m0 14c-2.03 0-4.43-.82-6.14-2.88a9.95 9.95 0 0 1 12.28 0C16.43 19.18 14.03 20 12 20"/>
                    </svg>
                  )}
                </div>

                {/* Name */}
                <span className={`flex-1 font-semibold text-[0.95rem] ${isTop3 ? 'text-[#f0eeff]' : 'text-[#c0b8e8]'}`}>
                  {user.name}
                </span>

                {/* Points */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className={`font-bold text-[0.95rem] ${isTop3 ? 'text-[#8b5cf6]' : 'text-[#6b6490]'}`}>
                    {pts.toLocaleString()}
                  </span>
                  <span className="text-[0.75rem] text-[#4b5563]">pts</span>
                </div>
              </div>
            );
          })}

          {users.length === 0 && (
            <p className="text-center text-[#6b6490] py-10">No users yet. Be the first!</p>
          )}
        </div>
      )}
    </div>
  );
}
