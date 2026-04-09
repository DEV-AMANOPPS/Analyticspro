import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getContests } from '../api/client';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const getRatingColor = (rating) => {
  if (rating >= 3000) return '#ff0000';
  if (rating >= 2600) return '#ff3333';
  if (rating >= 2400) return '#ff0000';
  if (rating >= 2300) return '#ff8c00';
  if (rating >= 2100) return '#ff8c00';
  if (rating >= 1900) return '#aa00aa';
  if (rating >= 1600) return '#0000ff';
  if (rating >= 1400) return '#03a89e';
  if (rating >= 1200) return '#008000';
  return '#808080';
};

export default function Contests() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    getContests(user.handle)
      .then((r) => setHistory(r.data.ratingHistory || []))
      .catch((e) => setError(e.response?.data?.error || 'Failed to load contest history'))
      .finally(() => setLoading(false));
  }, [user]);

  const chartData = history.map((c) => ({
    name: c.contestName?.slice(0, 25) + (c.contestName?.length > 25 ? '…' : ''),
    rating: c.newRating,
    rank: c.rank,
    date: new Date(c.ratingUpdateTimeSeconds * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }),
  }));

  const maxRating = Math.max(...history.map((c) => c.newRating), 0);
  const minRating = Math.min(...history.map((c) => c.newRating), 9999);
  const totalContests = history.length;
  const gains = history.filter((c, i) => i > 0 && c.newRating > history[i - 1].newRating).length;

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex">
      <Sidebar />
      <main className="flex-1 ml-72 p-8">
        <div className="flex items-center gap-3 mb-2 animate-fade-in">
          <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <Trophy size={22} className="text-orange-400" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Contest History</h1>
        </div>
        <p className="text-[#8b949e] text-sm mb-8 ml-12 italic animate-fade-in">Your rating changes across all contests</p>

        {loading && (
          <div className="animate-fade-in py-20">
            <LoadingSpinner message="Fetching contest data..." />
          </div>
        )}
        
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 mb-6 animate-fade-in">
            {error}
          </div>
        )}

        {!loading && !error && history.length > 0 && (
          <div className="animate-fade-in">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Contests', value: totalContests, icon: Trophy, color: 'text-orange-400', bg: 'bg-orange-400/10', stagger: 'stagger-1' },
                { label: 'Max Rating', value: maxRating, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10', stagger: 'stagger-2' },
                { label: 'Min Rating', value: minRating === 9999 ? '—' : minRating, icon: TrendingDown, color: 'text-rose-400', bg: 'bg-rose-400/10', stagger: 'stagger-3' },
                { label: 'Positive Deltas', value: gains, icon: Minus, color: 'text-cyan-400', bg: 'bg-cyan-400/10', stagger: 'stagger-4' },
              ].map(({ label, value, icon: Icon, color, bg, stagger }) => (
                <div key={label} className={`p-6 glass-card glass-card-hover animate-fade-in ${stagger}`}>
                  <div className={`inline-flex p-2.5 rounded-xl ${bg} border border-white/5 mb-4`}>
                    <Icon size={22} className={color} />
                  </div>
                  <p className="text-[#8b949e] text-[10px] font-bold uppercase tracking-widest mb-1.5">{label}</p>
                  <p className={`text-4xl font-black tracking-tight ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Rating Graph */}
            <div className="p-8 glass-card glass-card-hover mb-8 animate-fade-in stagger-2">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-white tracking-tight">Rating Graph</h2>
                <div className="flex gap-4">
                   <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-cyan-400" />
                      <span className="text-xs font-bold text-[#8b949e]">New Rating</span>
                   </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={380}>
                <LineChart data={chartData} margin={{ left: 10, right: 30, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} opacity={0.5} />
                  <XAxis dataKey="date" tick={{ fill: '#8b949e', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} interval={Math.floor(chartData.length / 10)} />
                  <YAxis domain={['auto', 'auto']} tick={{ fill: '#8b949e', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 16, color: '#fff', fontSize: 12, padding: '12px 16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)' }}
                    labelStyle={{ color: '#8b949e', marginBottom: 6, fontWeight: 700 }}
                    itemStyle={{ padding: '2px 0' }}
                    formatter={(v, _, props) => [
                      <span className="font-bold text-white">{v}</span>,
                      <span className="text-[#8b949e]">Rating Index</span>,
                      `Rank: ${props.payload.rank}`
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#06b6d4"
                    strokeWidth={4}
                    dot={{ r: 4, fill: '#0d1117', stroke: '#06b6d4', strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: '#22d3ee', stroke: '#0d1117', strokeWidth: 3 }}
                    animationDuration={2000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Contest Table */}
            <div className="glass-card animate-fade-in stagger-3 overflow-hidden shadow-2xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#21262d] text-[#8b949e] text-[10px] uppercase tracking-widest font-bold bg-[#161b22]/30">
                    <th className="px-6 py-5 text-left w-12">#</th>
                    <th className="px-6 py-5 text-left">Contest Title</th>
                    <th className="px-6 py-5 text-left">Global Rank</th>
                    <th className="px-6 py-5 text-left">Rating Delta</th>
                    <th className="px-6 py-5 text-left">Final Rating</th>
                    <th className="px-6 py-5 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#21262d]/50">
                  {[...history].reverse().map((c, i) => {
                    const change = c.newRating - c.oldRating;
                    return (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4 text-[#484f58] font-mono text-xs">{totalContests - i}</td>
                        <td className="px-6 py-4">
                           <div className="font-bold text-white group-hover:text-orange-400 transition-colors max-w-sm truncate" title={c.contestName}>
                             {c.contestName}
                           </div>
                        </td>
                        <td className="px-6 py-4 text-[#8b949e] font-bold">#{c.rank}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 font-black px-2 py-0.5 rounded text-[11px] ${change > 0 ? 'text-emerald-400 bg-emerald-400/10' : change < 0 ? 'text-rose-400 bg-rose-400/10' : 'text-[#8b949e] bg-[#21262d]'}`}>
                            {change > 0 ? '▲' : change < 0 ? '▼' : '▬'} {change > 0 ? '+' : ''}{change}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-black" style={{ color: getRatingColor(c.newRating) }}>
                          {c.newRating}
                        </td>
                        <td className="px-6 py-4 text-[#8b949e] font-medium text-right italic">
                          {new Date(c.ratingUpdateTimeSeconds * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <div className="text-center py-20 text-[#8b949e]">
            <Trophy size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg">No contest history found for this handle.</p>
          </div>
        )}
      </main>
    </div>
  );
}
