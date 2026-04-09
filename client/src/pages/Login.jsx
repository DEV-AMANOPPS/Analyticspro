import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api/client';
import { Code2, ArrowRight, ShieldCheck, Zap, Globe, Sparkles } from 'lucide-react';

export default function Login() {
  const [handle, setHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!handle.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await loginUser(handle.trim());
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please check your handle.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Visuals */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/10 rounded-full blur-[160px] animate-float-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-violet-600/10 rounded-full blur-[160px] animate-float-slow delay-2000" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
      </div>

      <div className="w-full max-w-[480px] relative z-20 animate-reveal">
        {/* Header/Logo */}
        <div className="flex flex-col items-center mb-12">
          <div className="relative group cursor-default">
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative w-20 h-20 bg-[#12151c] border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
              <Code2 size={40} className="text-cyan-400" />
            </div>
            <div className="absolute -top-2 -right-2 p-2 bg-violet-600 rounded-full shadow-lg animate-bounce">
              <Sparkles size={16} className="text-white" />
            </div>
          </div>
          
          <h1 className="mt-8 text-5xl font-black tracking-tight text-white mb-2">
            Analytics<span className="text-cyan-400">Pro</span>
          </h1>
          <p className="text-white/40 font-medium tracking-wide flex items-center gap-2">
            Competitive Programming Analytics <span className="w-1 h-1 rounded-full bg-white/20" /> Codeforces Edition
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-card p-10 relative group overflow-hidden border-white/5">
          {/* Accent Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-violet-500 to-cyan-500 animate-gradient-x" />
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between ml-1">
                <label htmlFor="handle" className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] pointer-events-none">
                  User Handle
                </label>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">API Live</span>
                </div>
              </div>
              
              <div className="relative group/input">
                <input
                  id="handle"
                  type="text"
                  placeholder="e.g. tourist"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full px-6 py-5 bg-[#0a0c10]/40 border border-white/5 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 transition-all text-lg font-medium"
                  required
                />
                <ShieldCheck size={22} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within/input:text-cyan-400/40 transition-colors" />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-rose-400 text-sm font-semibold animate-reveal text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden p-[1px] rounded-2xl transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 shadow-2xl shadow-cyan-500/10"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-violet-600 opacity-100 group-hover:opacity-80 transition-opacity" />
              <div className="relative px-8 py-5 bg-white text-[#0a0c10] rounded-2xl font-black tracking-tight flex items-center justify-center gap-3">
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-3 border-[#0a0c10]/20 border-t-[#0a0c10] rounded-full animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <>
                    <span>View Analytics</span>
                    <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Micro Features */}
          <div className="mt-12 grid grid-cols-2 gap-6 pt-8 border-t border-white/5">
            <div className="flex items-center gap-3 group/feat">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 group-hover/feat:bg-cyan-500/20 transition-colors">
                <Zap size={18} className="text-cyan-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Speed</p>
                <p className="text-xs font-bold text-white/80">Real-time Data</p>
              </div>
            </div>
            <div className="flex items-center gap-3 group/feat">
              <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 group-hover/feat:bg-violet-500/20 transition-colors">
                <Globe size={18} className="text-violet-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Scope</p>
                <p className="text-xs font-bold text-white/80">Global Insights</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-10 text-center text-white/20 text-xs font-bold uppercase tracking-[0.3em]">
          Analytics Dashboard v3.0
        </p>
      </div>

      <style>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }
        .animate-gradient-x {
          background-size: 200% 100%;
          animation: gradient-x 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
