import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const TARGET_DATE = new Date('2026-06-11T12:00:00Z').getTime();

export function HeroSection() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = TARGET_DATE - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Multi-layer ambient background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Dark base */}
        <div className="absolute inset-0 bg-concourse" />
        {/* Emerald radial glow — top left */}
        <div className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full blur-[160px]"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)' }} />
        {/* Amber glow — bottom right */}
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(circle, rgba(232,163,61,0.12) 0%, transparent 70%)' }} />
        {/* Center pitch glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full blur-[180px]"
          style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.07) 0%, transparent 70%)' }} />
      </div>

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 eco-grid opacity-30 pointer-events-none z-0" aria-hidden="true" />

      {/* Floating Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {[...Array(18)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 3 + 1.5}px`,
              height: `${Math.random() * 3 + 1.5}px`,
              background: i % 3 === 0 ? 'rgba(232,163,61,0.5)' : 'rgba(16,185,129,0.4)',
              filter: 'blur(0.5px)',
            }}
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 100,
              opacity: 0,
            }}
            animate={{
              y: -100,
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: Math.random() * 12 + 10,
              repeat: Infinity,
              delay: Math.random() * 12,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center">
        {/* FIFA badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="fifa-badge mb-8"
        >
          <span>⚽</span>
          Agentic AI Command Center · FIFA World Cup 2026™
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight leading-[0.9] mb-6"
        >
          <span className="text-floodlight block">STEP INTO</span>
          <span className="stadium-title block mt-1">PULSE</span>
        </motion.h1>

        {/* FIFA golden rule line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="w-48 h-0.5 mb-8"
          style={{ background: 'linear-gradient(90deg, transparent, #E8A33D, #10b981, transparent)' }}
          aria-hidden="true"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-base md:text-xl text-floodlight/60 max-w-2xl mb-12 font-medium leading-relaxed"
        >
          The ultimate immersive experience for FIFA World Cup 2026. Track live stadium metrics and navigate with ease.
        </motion.p>

        {/* Countdown Timer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.85 }}
          className="flex items-end gap-3 md:gap-6 mb-14"
        >
          {Object.entries(timeLeft).map(([unit, value], i) => (
            <div key={unit} className="flex flex-col items-center gap-2">
              {/* Flip card container */}
              <div className="relative w-16 h-20 md:w-24 md:h-28 rounded-2xl flex items-center justify-center overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)',
                }}>
                {/* Centre divider line */}
                <div className="absolute left-0 right-0 top-1/2 h-px"
                  style={{ background: 'rgba(255,255,255,0.04)' }} aria-hidden="true" />
                {/* Top gloss */}
                <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-2xl"
                  style={{ background: 'rgba(255,255,255,0.03)' }} aria-hidden="true" />
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={value}
                    initial={{ y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -16, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-3xl md:text-5xl font-black font-mono relative z-10"
                    style={{
                      color: i === 3 ? '#E8A33D' : '#10b981',
                      textShadow: `0 0 20px ${i === 3 ? 'rgba(232,163,61,0.4)' : 'rgba(16,185,129,0.4)'}`,
                    }}
                  >
                    {value.toString().padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-floodlight/40 font-mono">
                {unit}
              </span>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.05 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link
            to="/fan"
            className="btn-pulse flex items-center gap-2 group"
          >
            Launch Fan App
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </Link>

          <Link
            to="/ops"
            className="btn-ghost flex items-center gap-2 group"
          >
            <Play size={15} className="text-pitch group-hover:text-white transition-colors" aria-hidden="true" />
            Command Center
          </Link>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
          className="mt-16 flex flex-col items-center gap-2"
          aria-hidden="true"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 rounded-full bg-white/30" />
          </motion.div>
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/20">scroll</span>
        </motion.div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-concourse to-transparent z-20 pointer-events-none" aria-hidden="true" />
    </section>
  );
}
