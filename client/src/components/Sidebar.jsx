import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Tags, Trophy, BookOpen, LogOut, Code2, ChevronRight, Zap
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/topics', icon: Tags, label: 'Topics' },
  { to: '/problems', icon: BookOpen, label: 'Problems' },
  { to: '/contests', icon: Trophy, label: 'Contests' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-[#0a0c10] border-r border-white/5 flex flex-col z-50 font-sans shadow-2xl">
      {/* Brand Header */}
      <div className="flex items-center gap-4 px-8 py-10">
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-br from-cyan-400 to-violet-600 rounded-xl blur-lg opacity-40 group-hover:opacity-70 transition duration-500"></div>
          <div className="relative w-10 h-10 rounded-xl bg-[#12151c] border border-white/10 flex items-center justify-center shadow-2xl">
            <Code2 size={22} className="text-white" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black tracking-tighter text-white leading-none">Analytics<span className="text-cyan-400">Pro</span></span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold mt-1">v3.0 Stable</span>
        </div>
      </div>

      {/* Navigation Partition */}
      <div className="px-6 space-y-8 mt-4 overflow-y-auto flex-1">
        <div>
          <p className="px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Main Menu</p>
          <nav className="space-y-2">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `group relative flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? 'bg-white/5 text-white shadow-lg'
                      : 'text-white/40 hover:text-white/90 hover:bg-white/[0.02]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-cyan-500/10 text-cyan-400' : 'bg-white/5 text-white/30 group-hover:bg-white/10'}`}>
                        <Icon size={18} />
                      </div>
                      <span className="text-sm font-bold tracking-tight">{label}</span>
                    </div>
                    {isActive && (
                      <div className="w-1 h-5 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                    )}
                    {!isActive && (
                       <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-white/20" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>


      </div>

      {/* User Footer Account */}
      {user && (
        <div className="mx-6 mb-8 mt-auto p-4 rounded-[1.5rem] bg-[#12151c]/50 border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.handle}&background=0d8abc&color=fff`}
                alt={user.handle}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/5 shadow-xl"
              />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0a0c10] rounded-full shadow-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-black truncate tracking-tight">{user.handle}</p>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">{user.rank || 'Unrated'}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-black text-rose-400 bg-rose-400/5 border border-rose-400/10 hover:bg-rose-400/10 transition-all uppercase tracking-widest"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}
