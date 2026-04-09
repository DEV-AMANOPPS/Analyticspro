import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStats } from '../api/client';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import { TOPIC_COLORS, getProblemUrl } from '../utils/helpers';
import { Tags, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

function CircleProgress({ percent, color, size = 80 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#21262d" strokeWidth={8} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={8}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
    </svg>
  );
}

export default function Topics() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    getStats(user.handle)
      .then((res) => setStats(res.data.stats))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [user]);

  const topicData = useMemo(() => {
    if (!stats) return [];
    const total = stats.totalSolved || 1;
    return Object.entries(stats.topicBreakdown || {})
      .sort((a, b) => b[1] - a[1])
      .filter(([name]) => name.toLowerCase().includes(search.toLowerCase()))
      .map(([name, count], i) => ({
        name, count,
        percent: Math.round((count / total) * 100),
        color: TOPIC_COLORS[i % TOPIC_COLORS.length],
        problems: (stats.topicProblems?.[name] || []).sort((a, b) => (b.rating || 0) - (a.rating || 0)),
      }));
  }, [stats, search]);

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex">
      <Sidebar />
      <main className="flex-1 ml-72 p-8">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <Tags size={22} className="text-violet-400" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">Topic Analysis</h1>
            </div>
            <p className="text-[#8b949e] text-sm ml-12">Your performance across all Codeforces problem tags</p>
          </div>
          <div className="relative group">
            <input
              type="text"
              placeholder="Search topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-5 py-3 bg-[#161b22]/80 border border-[#30363d] rounded-xl text-white placeholder-[#484f58] text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 w-64 transition-all backdrop-blur-sm"
            />
          </div>
        </div>

        {loading && (
          <div className="animate-fade-in py-20">
            <LoadingSpinner message="Analyzing topics..." />
          </div>
        )}
        
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 animate-fade-in">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 gap-4">
            {topicData.map(({ name, count, percent, color, problems }, i) => (
              <div 
                key={name} 
                className={`glass-card glass-card-hover overflow-hidden animate-fade-in`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Topic header */}
                <div
                  className="flex items-center gap-6 p-6 cursor-pointer"
                  onClick={() => setExpanded(expanded === name ? null : name)}
                >
                  <div className="relative scale-110">
                    <CircleProgress percent={percent} color={color} />
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color }}>
                      {percent}%
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-bold text-white capitalize tracking-tight">{name}</span>
                      <span className="text-xs px-2.5 py-1 rounded-full font-bold shadow-sm" style={{ background: color + '15', color }}>
                        {count} {count === 1 ? 'Problem' : 'Problems'}
                      </span>
                    </div>
                    <div className="h-2 bg-[#21262d] rounded-full overflow-hidden w-full max-w-sm">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm shadow-[color:var(--tw-shadow-color)]"
                        style={{ width: `${Math.min(percent * 3, 100)}%`, background: color, '--tw-shadow-color': color }}
                      />
                    </div>
                  </div>
                  <div className={`p-2 rounded-lg transition-colors ${expanded === name ? 'bg-violet-500/10 text-violet-400' : 'text-[#8b949e]'}`}>
                    {expanded === name ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {/* Expanded problems table */}
                {expanded === name && (
                  <div className="border-t border-[#21262d] bg-[#0d1117]/40">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-[#8b949e] text-[10px] uppercase tracking-[0.1em] font-bold">
                            <th className="px-6 py-4 text-left">Problem Name</th>
                            <th className="px-6 py-4 text-left">Rating</th>
                            <th className="px-6 py-4 text-left">Solved Date</th>
                            <th className="px-6 py-4 text-left w-20">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#21262d]/50">
                          {problems.slice(0, 20).map((p, i) => (
                            <tr key={i} className="hover:bg-[#21262d]/30 transition-colors group">
                              <td className="px-6 py-4">
                                <span className="text-white font-semibold group-hover:text-cyan-400 transition-colors">{p.name}</span>
                              </td>
                              <td className="px-6 py-4">
                                {p.rating ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                                    <span className="font-bold text-sm" style={{ color }}>{p.rating}</span>
                                  </div>
                                ) : (
                                  <span className="text-[#484f58]">Unrated</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-[#8b949e] font-medium italic">
                                {new Date(p.solvedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="px-6 py-4">
                                <a
                                  href={getProblemUrl(p.contestId, p.index)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all duration-200 font-bold text-xs"
                                >
                                  Solve <ExternalLink size={12} />
                                </a>
                              </td>
                            </tr>
                          ))}
                          {problems.length > 20 && (
                            <tr>
                              <td colSpan={4} className="px-6 py-4 text-center">
                                <p className="text-[#8b949e] text-xs font-semibold">
                                  + {problems.length - 20} additional problems solved in this category
                                </p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
