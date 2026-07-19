import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

function CountUp({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / (duration * 1000), 1);
      const easeOut = 1 - Math.pow(1 - percentage, 4);
      setCount(Math.floor(easeOut * end));

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      }
    };

    animationFrame = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, isInView]);

  return <span ref={ref}>{count}</span>;
}

const STATS = [
  { end: 48,  suffix: '',  label: 'Nations',     color: '#10b981' },
  { end: 104, suffix: '',  label: 'Matches',     color: '#E8A33D' },
  { end: 16,  suffix: '+', label: 'Host Cities', color: '#3B7EC2' },
];

export function StatsSection() {
  return (
    <section className="py-28 relative overflow-hidden" style={{ background: '#09090b' }}>
      {/* Ambient accent layers */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-0 right-0 fifa-divider" />
        <div className="absolute bottom-0 left-0 right-0 fifa-divider" />
        {/* Radial glow behind numbers */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.09) 0%, rgba(232,163,61,0.06) 50%, transparent 80%)' }} />
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.35em] text-floodlight/30 mb-2">
            By The Numbers
          </p>
          <h2 className="text-3xl md:text-4xl font-black font-display uppercase tracking-wider text-floodlight">
            The{' '}
            <span className="stadium-title">Greatest</span>{' '}
            Stage
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="flex flex-col items-center text-center group"
            >
              {/* Number */}
              <div
                className="text-7xl md:text-8xl font-black font-display mb-3 tabular-nums transition-all duration-300 group-hover:scale-105"
                style={{
                  color: stat.color,
                  textShadow: `0 0 40px ${stat.color}40`,
                  filter: `drop-shadow(0 0 10px ${stat.color}30)`,
                }}
              >
                <CountUp end={stat.end} />
                <span>{stat.suffix}</span>
              </div>

              {/* Divider line */}
              <div className="w-16 h-0.5 mb-3 rounded-full transition-all duration-300 group-hover:w-24"
                style={{ background: stat.color, opacity: 0.5 }} aria-hidden="true" />

              <div className="text-xs font-bold uppercase tracking-[0.25em] font-mono"
                style={{ color: `${stat.color}cc` }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
