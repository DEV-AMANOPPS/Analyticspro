import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStats, getContests } from '../api/client';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getRankColor, TOPIC_COLORS, getProblemUrl } from '../utils/helpers';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
  LabelList, Label, AreaChart, Area
} from 'recharts';
import {
  CheckCircle2, Send, Star, Users, RefreshCw, ExternalLink,
  TrendingUp, Layers, Hash, Activity, Zap, Sparkles, Target
} from 'lucide-react';

const getDifficultyColor = (ratingStr) => {
  if (ratingStr === 'Unrated') return '#484f58';
  const r = parseInt(ratingStr);
  if (r < 1200) return '#8b949e'; // Newbie
  if (r < 1400) return '#26a641'; // Pupil
  if (r < 1600) return '#22d3ee'; // Specialist
  if (r < 1900) return '#3b82f6'; // Expert
  if (r < 2100) return '#8b5cf6'; // Candidate Master
  if (r < 2400) return '#fbbf24'; // Master/IM
  return '#ef4444'; // Grandmaster+
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [ratingHistory, setRatingHistory] = useState([]);

  const fetchStats = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const statsRes = await getStats(user.handle);
      setStats(statsRes.data.stats);

      const contestsRes = await getContests(user.handle);
      setRatingHistory(contestsRes.data.ratingHistory || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, [user]);

  const topicChartData = useMemo(() => {
    if (!stats?.topicBreakdown) return [];
    return Object.entries(stats.topicBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([name, value]) => ({ name, value }));
  }, [stats]);

  const difficultyChartData = useMemo(() => {
    if (!stats?.difficultyBreakdown) return [];
    return Object.entries(stats.difficultyBreakdown)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name: name === 'unrated' ? 'Unrated' : name, value }));
  }, [stats]);

  const heatmapMap = useMemo(() => stats?.heatmap || {}, [stats]);

  const calendarDays = useMemo(() => {
    const data = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(today.getDate() - 363);

    for (let i = 0; i < 364; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        data.push({ date: dateStr, count: heatmapMap[dateStr] || 0 });
    }
    return data;
  }, [heatmapMap]);

  if (!user) return null;

  const rankColor = getRankColor(user.rank || '');
  const acceptanceRate = stats
    ? ((stats.totalSolved / Math.max(stats.totalSubmissions, 1)) * 100).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#f0f6fc] flex font-sans">
      <Sidebar />
      <main className="flex-1 ml-72 p-12 overflow-y-auto">

        {/* Header Section */}
        <header className="flex items-center justify-between mb-12 animate-reveal">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-br from-cyan-400 to-violet-600 rounded-[2rem] blur-xl opacity-20" />
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.handle}&background=0d8abc&color=fff&size=128`}
                alt={user.handle}
                className="w-24 h-24 rounded-[2rem] object-cover ring-1 ring-white/10 shadow-2xl relative z-10"
              />
              <div className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 rounded-2xl border-4 border-[#0a0c10] shadow-xl z-20">
                <Sparkles size={16} className="text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-4xl font-black tracking-tighter text-white font-heading">{user.handle}</h1>
                {user.country && <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-widest">{user.country}</div>}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <p className="font-bold text-lg tracking-tight capitalize" style={{ color: rankColor }}>
                   {user.rank || 'Unrated'}
                </p>
                <span className="w-1 h-1 rounded-full bg-white/10" />
                <p className="text-white/40 font-bold text-sm tracking-widest uppercase">Rating: {user.rating || 'N/A'}</p>
                <span className="w-1 h-1 rounded-full bg-white/10" />
                <p className="text-white/40 font-bold text-sm tracking-widest uppercase">Max Rating: {user.maxRating || 'N/A'}</p>
                {user.friendOfCount !== undefined && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/10" />
                    <p className="text-white/40 font-bold text-sm tracking-widest uppercase hover:text-white transition-colors cursor-help" title="Friends Count"><Users size={12} className="inline mr-1 -mt-0.5" />{user.friendOfCount}</p>
                  </>
                )}
                {user.registrationTimeSeconds && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/10" />
                    <p className="text-white/40 font-bold text-sm tracking-widest uppercase">Joined: {new Date(user.registrationTimeSeconds * 1000).getFullYear()}</p>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={fetchStats}
            className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-white/5 border border-white/5 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all duration-300 group shadow-xl backdrop-blur-md"
          >
            <RefreshCw size={18} className={`${loading ? 'animate-spin' : ''} transition-transform group-hover:rotate-180`} />
            <span className="text-sm font-bold tracking-tight">Refresh Data</span>
          </button>
        </header>

        {loading && !stats && (
          <div className="animate-reveal py-32 flex flex-col items-center justify-center">
            <LoadingSpinner message="Fetching user data..." />
          </div>
        )}

        {error && (
          <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/10 text-rose-400 mb-8 animate-reveal flex items-center gap-4">
             <div className="p-2 rounded-xl bg-rose-500/10"><Hash size={20} /></div>
             <p className="font-bold tracking-tight text-sm">{error}</p>
          </div>
        )}

        {stats && (
          <div className="animate-reveal space-y-12">
            {/* Stat Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <StatCard icon={Target} label="Problems Solved" value={stats.totalSolved} color="cyan" glow />
              <StatCard icon={Activity} label="Total Submissions" value={stats.totalSubmissions} color="violet" />
              <StatCard icon={TrendingUp} label="Acceptance Rate" value={`${acceptanceRate}%`} color="green" />
              <StatCard icon={Star} label="Max Rating" value={user.maxRating || '—'} sub={user.maxRank} color="orange" />
            </div>

            {/* Analytics Row 1 */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Distribution Chart */}
              <div className="glass-card p-10 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-10">
                   <div className="flex items-center gap-4">
                     <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400"><Layers size={20} /></div>
                     <h2 className="text-xl font-bold text-white tracking-tight font-heading">Topics Solved</h2>
                   </div>
                   <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Top 12 Categories</div>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={topicChartData} layout="vertical" margin={{ left: 10, right: 40 }}>
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1}/>
                      </linearGradient>
                    </defs>
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={120} 
                      tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 8 }} />
                    <Bar dataKey="value" fill="url(#barGrad)" radius={[0, 4, 4, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Spread Chart */}
              <div className="glass-card p-10 relative group">
                <div className="flex items-center justify-between mb-10">
                   <div className="flex items-center gap-4">
                     <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-400"><Hash size={20} /></div>
                     <h2 className="text-xl font-bold text-white tracking-tight font-heading">Problem Difficulties</h2>
                   </div>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={difficultyChartData}
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={8}
                    >
                      {difficultyChartData.map((entry, i) => (
                        <Cell key={i} fill={getDifficultyColor(entry.name)} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend 
                       verticalAlign="middle" 
                       align="right" 
                       layout="vertical"
                       iconType="circle"
                       formatter={(v) => <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-2">{v}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Consistency Heatmap */}
            <div className="glass-card p-10">
               <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400"><Activity size={20} /></div>
                    <h2 className="text-xl font-bold text-white tracking-tight font-heading">Activity Heatmap</h2>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">
                    <span>Minimal</span>
                    <div className="flex gap-1.5 px-2">
                       {[0, 1, 2, 3, 4].map(v => (
                          <div key={v} className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: v === 0 ? '#1a1d24' : `rgba(34, 197, 94, ${v * 0.25})` }} />
                       ))}
                    </div>
                    <span>Extreme</span>
                  </div>
               </div>
               <div className="overflow-x-auto">
                 <div className="min-w-fit flex justify-center pb-2">
                   <div className="grid grid-rows-7 grid-flow-col gap-1.5">
                      {calendarDays.map((day) => {
                         let color = '#1a1d24';
                         if (day.count > 0 && day.count < 3) color = 'rgba(52, 211, 153, 0.2)';
                         else if (day.count >= 3 && day.count < 6) color = 'rgba(52, 211, 153, 0.5)';
                         else if (day.count >= 6 && day.count < 10) color = 'rgba(52, 211, 153, 0.8)';
                         else if (day.count >= 10) color = 'rgba(52, 211, 153, 1)';
                         
                         return (
                           <div 
                             key={day.date} 
                             className="w-3.5 h-3.5 rounded-sm transition-all hover:ring-2 hover:ring-white/40 cursor-help"
                             style={{ backgroundColor: color }}
                             title={`${day.date}: ${day.count} submissons`}
                           />
                         )
                      })}
                   </div>
                 </div>
               </div>
            </div>

            {/* Rating History */}
            {ratingHistory.length > 0 && (
              <div className="glass-card p-10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400"><TrendingUp size={20} /></div>
                  <h2 className="text-xl font-bold text-white tracking-tight font-heading">Rating History</h2>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={ratingHistory}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.2}/>
                        <stop offset="100%" stopColor="#fbbf24" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="ratingUpdateTimeSeconds" hide />
                    <YAxis 
                       domain={['dataMin - 100', 'dataMax + 100']} 
                       tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 700 }} 
                       axisLine={false} 
                       tickLine={false}
                    />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="newRating" 
                      stroke="#fbbf24" 
                      strokeWidth={4} 
                      fill="url(#areaGrad)" 
                      dot={{ r: 4, fill: '#0a0c10', stroke: '#fbbf24', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
