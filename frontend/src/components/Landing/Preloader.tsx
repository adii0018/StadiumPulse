import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function Preloader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(prev + Math.floor(Math.random() * 12) + 4, 100);
      });
    }, 160);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.7, ease: 'easeInOut' } }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-concourse overflow-hidden"
      role="progressbar"
      aria-valuenow={Math.min(progress, 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Loading StadiumPulse"
    >
      {/* Ambient glow layers */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <div className="w-[600px] h-[600px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(232,163,61,0.06) 60%, transparent 100%)' }} />
      </div>

      {/* Grid lines */}
      <div className="absolute inset-0 eco-grid opacity-40 pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 flex flex-col items-center gap-10">
        {/* Bouncing Football */}
        <motion.div
          animate={{ y: [0, -36, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative"
          aria-hidden="true"
        >
          {/* Glow ring behind ball */}
          <div className="absolute inset-0 rounded-full blur-[18px]"
            style={{ background: 'rgba(16,185,129,0.4)', transform: 'scale(1.3)' }} />
          <div className="relative w-16 h-16 text-white drop-shadow-[0_0_16px_rgba(16,185,129,0.6)]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className="w-full h-full">
              <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369.5 397L287.6 364.2 256 351.6l-31.6 12.6L142.5 397c-31.5-38.8-50.5-88-50.5-141c0-14.1 1.3-27.9 3.8-41.2l76.4-39.6L214.3 95.8c13.4-3.6 27.4-5.8 41.7-5.8s28.3 2.2 41.7 5.8l42.1 79.3 76.4 39.6c2.5 13.3 3.8 27.2 3.8 41.2c0 53-19 102.2-50.5 141zM256 312l-58.4-42.4 22.3-68.6h72.2l22.3 68.6L256 312z"/>
            </svg>
          </div>
          {/* Shadow under ball */}
          <motion.div
            animate={{ scaleX: [0.6, 1, 0.6], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-10 h-2 rounded-full blur-sm"
            style={{ background: 'rgba(16,185,129,0.5)' }}
          />
        </motion.div>

        {/* Brand + Counter */}
        <div className="flex flex-col items-center gap-3">
          <div className="text-2xl font-black tracking-wider text-white font-display uppercase">
            Stadium<span className="stadium-title">Pulse</span>
          </div>
          <motion.div
            key={Math.min(progress, 100)}
            initial={{ opacity: 0.6, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl font-black font-mono tracking-wider text-white tabular-nums"
          >
            {Math.min(progress, 100)}
            <span className="text-2xl text-pitch ml-1">%</span>
          </motion.div>
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-signal-amber/80">
            Initializing Stadium Pulse
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-72 flex flex-col gap-2">
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #10b981, #E8A33D)' }}
              initial={{ width: '0%' }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ ease: 'easeOut', duration: 0.25 }}
            />
          </div>
          {/* Segment ticks */}
          <div className="flex justify-between px-0.5" aria-hidden="true">
            {[0, 25, 50, 75, 100].map((v) => (
              <div key={v} className="flex flex-col items-center gap-0.5">
                <div className="w-px h-1.5 bg-white/10" />
                <span className="text-[8px] font-mono text-white/20">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FIFA label */}
        <div className="fifa-badge" aria-hidden="true">
          <span>⚽</span>
          FIFA World Cup 2026™
        </div>
      </div>
    </motion.div>
  );
}
