export const getRankColor = (rank) => {
  if (!rank) return '#808080';
  const r = rank.toLowerCase();
  if (r.includes('legendary')) return '#ff0000';
  if (r.includes('international grandmaster')) return '#ff3333';
  if (r.includes('grandmaster')) return '#ff0000';
  if (r.includes('international master')) return '#ff8c00';
  if (r.includes('master')) return '#ff8c00';
  if (r.includes('candidate master')) return '#aa00aa';
  if (r.includes('expert')) return '#0000ff';
  if (r.includes('specialist')) return '#03a89e';
  if (r.includes('pupil')) return '#008000';
  if (r.includes('newbie')) return '#808080';
  return '#808080';
};

export const getRatingBg = (rating) => {
  if (!rating) return 'bg-gray-600';
  if (rating >= 3000) return 'bg-red-700';
  if (rating >= 2600) return 'bg-red-500';
  if (rating >= 2400) return 'bg-red-400';
  if (rating >= 2300) return 'bg-orange-500';
  if (rating >= 2100) return 'bg-orange-400';
  if (rating >= 1900) return 'bg-purple-500';
  if (rating >= 1600) return 'bg-blue-500';
  if (rating >= 1400) return 'bg-cyan-500';
  if (rating >= 1200) return 'bg-green-500';
  if (rating >= 900) return 'bg-green-400';
  return 'bg-gray-500';
};

export const TOPIC_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
  '#3b82f6', '#ef4444', '#14b8a6', '#f97316', '#a855f7',
  '#06b6d4', '#84cc16', '#fb923c', '#e879f9', '#38bdf8',
];

export const formatDate = (isoString) => {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const getProblemUrl = (contestId, index) =>
  `https://codeforces.com/problemset/problem/${contestId}/${index}`;
