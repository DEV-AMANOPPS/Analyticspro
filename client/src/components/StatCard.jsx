import React from 'react';

const StatCard = ({ icon: Icon, label, value, sub, color = 'cyan', glow = false }) => {
  const colors = {
    cyan: {
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-400',
      border: 'border-cyan-500/20',
      glow: 'shadow-cyan-500/10'
    },
    violet: {
      bg: 'bg-violet-500/10',
      text: 'text-violet-400',
      border: 'border-violet-500/20',
      glow: 'shadow-violet-500/10'
    },
    green: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      glow: 'shadow-emerald-500/10'
    },
    orange: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/20',
      glow: 'shadow-amber-500/10'
    },
    red: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/20',
      glow: 'shadow-rose-500/10'
    }
  };

  const active = colors[color] || colors.cyan;

  return (
    <div className={`glass-card p-6 border-white/5 relative overflow-hidden group hover:bg-white/[0.04] transition-all duration-500 ${glow ? 'ring-1 ring-cyan-500/20 shadow-[0_0_30px_rgba(34,211,238,0.05)]' : ''}`}>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">{label}</p>
          <div className="flex flex-col">
            <h3 className="text-3xl font-black text-white tracking-tight font-heading">{value}</h3>
            {sub && <p className="text-[10px] font-bold text-white/40 mt-1 uppercase tracking-wider">{sub}</p>}
          </div>
        </div>
        <div className={`p-3 rounded-2xl ${active.bg} ${active.border} border group-hover:scale-110 transition-transform duration-500`}>
          <Icon size={22} className={active.text} />
        </div>
      </div>
      
      {/* Decorative gradient blob */}
      <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${active.bg}`} />
    </div>
  );
};

export default StatCard;
