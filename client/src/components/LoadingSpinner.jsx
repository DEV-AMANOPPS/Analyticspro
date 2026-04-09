export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-[#21262d]" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin" />
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-violet-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
      </div>
      <p className="text-[#8b949e] text-sm animate-pulse">{message}</p>
    </div>
  );
}
