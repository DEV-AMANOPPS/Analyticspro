import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStats } from '../api/client';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import { getProblemUrl } from '../utils/helpers';
import { BookOpen, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react';

const ALL_VERDICTS = ['OK', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILATION_ERROR'];

const verdictColors = {
  OK: 'text-emerald-400 bg-emerald-400/10',
  WRONG_ANSWER: 'text-red-400 bg-red-400/10',
  TIME_LIMIT_EXCEEDED: 'text-orange-400 bg-orange-400/10',
  MEMORY_LIMIT_EXCEEDED: 'text-yellow-400 bg-yellow-400/10',
  RUNTIME_ERROR: 'text-rose-400 bg-rose-400/10',
  COMPILATION_ERROR: 'text-gray-400 bg-gray-400/10',
};

export default function Problems() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState('All');
  const [minRating, setMinRating] = useState('');
  const [maxRating, setMaxRating] = useState('');
  const [sortDir, setSortDir] = useState('desc');
  const [sortBy, setSortBy] = useState('rating');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 30;

  useEffect(() => {
    if (!user) return;
    getStats(user.handle)
      .then((r) => setStats(r.data.stats))
      .catch((e) => setError(e.response?.data?.error || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [user]);

  const allProblems = useMemo(() => {
    if (!stats?.topicProblems) return [];
    const seen = new Set();
    const result = [];
    for (const [topic, problems] of Object.entries(stats.topicProblems)) {
      for (const p of problems) {
        const key = `${p.contestId}-${p.index}`;
        if (!seen.has(key)) {
          seen.add(key);
          result.push({ ...p, topic });
        }
      }
    }
    return result;
  }, [stats]);

  const allTopics = useMemo(() => ['All', ...Object.keys(stats?.topicBreakdown || {}).sort()], [stats]);

  const filtered = useMemo(() => {
    let list = [...allProblems];
    if (search) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (topicFilter !== 'All') list = list.filter((p) => p.topic === topicFilter);
    if (minRating) list = list.filter((p) => (p.rating || 0) >= Number(minRating));
    if (maxRating) list = list.filter((p) => (p.rating || 0) <= Number(maxRating));
    list.sort((a, b) => {
      const aVal = sortBy === 'rating' ? (a.rating || 0) : new Date(a.solvedAt).getTime();
      const bVal = sortBy === 'rating' ? (b.rating || 0) : new Date(b.solvedAt).getTime();
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
    });
    return list;
  }, [allProblems, search, topicFilter, minRating, maxRating, sortBy, sortDir]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    else { setSortBy(field); setSortDir('desc'); }
    setPage(1);
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return null;
    return sortDir === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />;
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex">
      <Sidebar />
      <main className="flex-1 ml-72 p-8">
        <div className="flex items-center justify-between mb-8 animate-fade-in text-white/90">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <BookOpen size={22} className="text-cyan-400" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">Challenge Archive</h1>
            </div>
            <p className="text-[#8b949e] text-sm ml-12 italic">Browse, filter and sort every problem you've conquered</p>
          </div>
          <div className="px-4 py-2 rounded-full bg-[#161b22]/50 border border-[#30363d] text-[#8b949e] text-[10px] font-bold uppercase tracking-widest">
            {filtered.length} Solutions Logged
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 p-6 glass-card animate-fade-in backdrop-blur-md">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold text-[#8b949e] uppercase ml-1">Search</label>
            <input
              type="text" placeholder="Problem name..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-white placeholder-[#484f58] text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <label className="text-[10px] font-bold text-[#8b949e] uppercase ml-1">Tag</label>
            <select
              value={topicFilter}
              onChange={(e) => { setTopicFilter(e.target.value); setPage(1); }}
              className="px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 capitalize cursor-pointer"
            >
              {allTopics.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 w-28">
            <label className="text-[10px] font-bold text-[#8b949e] uppercase ml-1">Min Rating</label>
            <input
              type="number" placeholder="0" value={minRating}
              onChange={(e) => { setMinRating(e.target.value); setPage(1); }}
              className="px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-white placeholder-[#484f58] text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5 w-28">
            <label className="text-[10px] font-bold text-[#8b949e] uppercase ml-1">Max Rating</label>
            <input
              type="number" placeholder="3500" value={maxRating}
              onChange={(e) => { setMaxRating(e.target.value); setPage(1); }}
              className="px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-white placeholder-[#484f58] text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
            />
          </div>
        </div>

        {loading && (
          <div className="animate-fade-in py-20">
            <LoadingSpinner message="Loading your conquered challenges..." />
          </div>
        )}
        
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 animate-fade-in">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="glass-card animate-fade-in overflow-hidden shadow-2xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#21262d] text-[#8b949e] text-[10px] uppercase tracking-widest font-bold bg-[#161b22]/30">
                    <th className="px-6 py-5 text-left w-12">#</th>
                    <th className="px-6 py-5 text-left">Problem</th>
                    <th
                      className="px-6 py-5 text-left cursor-pointer hover:text-white transition-colors group"
                      onClick={() => toggleSort('rating')}
                    >
                      <div className="flex items-center gap-2">
                        Rating <div className="p-1 rounded bg-[#0d1117]"><SortIcon field="rating" /></div>
                      </div>
                    </th>
                    <th className="px-6 py-5 text-left">Tags</th>
                    <th
                      className="px-6 py-5 text-left cursor-pointer hover:text-white transition-colors group"
                      onClick={() => toggleSort('date')}
                    >
                      <div className="flex items-center gap-2">
                        Solved On <div className="p-1 rounded bg-[#0d1117]"><SortIcon field="date" /></div>
                      </div>
                    </th>
                    <th className="px-6 py-5 text-right">External</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#21262d]/50">
                  {paged.map((p, i) => (
                    <tr key={i} className="hover:bg-cyan-500/[0.03] transition-colors group">
                      <td className="px-6 py-4 text-[#484f58] font-mono text-xs">{(page - 1) * PAGE_SIZE + i + 1}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">{p.name}</div>
                        <div className="text-[10px] text-[#8b949e] mt-0.5 tracking-tight">{p.contestId}{p.index}</div>
                      </td>
                      <td className="px-6 py-4">
                        {p.rating ? (
                          <div className="flex items-center gap-2">
                            <span className="font-black text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded text-[11px] shadow-sm">{p.rating}</span>
                          </div>
                        ) : <span className="text-[#484f58] italic text-xs">Unrated</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-violet-500/10 text-violet-400 capitalize border border-violet-500/10">
                          {p.topic}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#8b949e] text-xs font-medium italic">
                        {new Date(p.solvedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href={getProblemUrl(p.contestId, p.index)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center p-2 rounded-xl bg-[#161b22] border border-[#30363d] text-[#8b949e] hover:text-cyan-400 hover:border-cyan-500/40 transition-all hover:-translate-y-0.5"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </td>
                    </tr>
                  ))}
                  {paged.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-30">
                          <BookOpen size={48} />
                          <p className="text-sm font-bold tracking-tight">No challenges match your search criteria.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10 animate-fade-in">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-5 py-2.5 rounded-xl bg-[#161b22] border border-[#30363d] text-[#8b949e] hover:text-white hover:border-cyan-500/40 transition-all text-sm font-bold disabled:opacity-30 shadow-lg"
                >
                  Previous
                </button>
                <div className="h-10 px-5 flex items-center rounded-xl bg-[#161b22]/50 border border-[#21262d] text-xs font-bold text-white/70">
                  Page {page} of {totalPages}
                </div>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-5 py-2.5 rounded-xl bg-[#161b22] border border-[#30363d] text-[#8b949e] hover:text-white hover:border-cyan-500/40 transition-all text-sm font-bold disabled:opacity-30 shadow-lg"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
