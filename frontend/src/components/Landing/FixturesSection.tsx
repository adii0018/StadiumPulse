
import { motion } from 'framer-motion';
import { Calendar, MapPin, Zap } from 'lucide-react';

const FIXTURES = [
  {
    id: 1,
    date: 'Jun 11, 2026',
    time: '12:00 PM EST',
    stadium: 'Estadio Azteca, Mexico City',
    team1: 'MEX',
    flag1: '🇲🇽',
    team2: 'TBD',
    flag2: '🏳',
    group: 'Group A',
    status: 'Opening Match',
    hot: true,
  },
  {
    id: 2,
    date: 'Jun 12, 2026',
    time: '3:00 PM EST',
    stadium: 'SoFi Stadium, Los Angeles',
    team1: 'USA',
    flag1: '🇺🇸',
    team2: 'TBD',
    flag2: '🏳',
    group: 'Group B',
    status: 'Scheduled',
    hot: false,
  },
  {
    id: 3,
    date: 'Jun 12, 2026',
    time: '6:00 PM EST',
    stadium: 'BMO Field, Toronto',
    team1: 'CAN',
    flag1: '🇨🇦',
    team2: 'TBD',
    flag2: '🏳',
    group: 'Group C',
    status: 'Scheduled',
    hot: false,
  },
];

export function FixturesSection() {
  return (
    <section className="py-24 bg-concourse relative overflow-hidden">
      {/* Faint top divider */}
      <div className="absolute top-0 left-0 right-0 fifa-divider" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-signal-amber/70 mb-3">
            FIFA World Cup 2026™
          </p>
          <h2 className="text-4xl md:text-5xl font-black font-display uppercase tracking-wider mb-4">
            Opening{' '}
            <span className="section-title-line" style={{ color: '#E8A33D' }}>
              Fixtures
            </span>
          </h2>
          <p className="text-floodlight/50 max-w-xl mx-auto text-sm">
            The journey to glory begins. Secure your spot or follow the live updates from the pulse of the stadium.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FIXTURES.map((match, idx) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass-card p-6 group cursor-pointer relative overflow-hidden"
            >
              {/* Hot badge */}
              {match.hot && (
                <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                  style={{ background: 'rgba(194,59,59,0.15)', border: '1px solid rgba(194,59,59,0.3)', color: '#C23B3B' }}>
                  <Zap size={9} aria-hidden="true" />
                  Hot
                </div>
              )}

              {/* Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-pitch/10 via-transparent to-signal-amber/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" aria-hidden="true" />

              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(90deg, #10b981, #E8A33D)' }} aria-hidden="true" />

              <div className="relative z-10 flex flex-col h-full">
                {/* Group badge */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                    style={{ background: 'rgba(232,163,61,0.1)', border: '1px solid rgba(232,163,61,0.2)', color: '#E8A33D' }}>
                    {match.group}
                  </span>
                  <span className="text-[9px] font-mono text-floodlight/30 uppercase tracking-wider">
                    {match.status}
                  </span>
                </div>

                {/* Teams */}
                <div className="flex justify-between items-center mb-8 gap-4">
                  <div className="text-center flex-1">
                    <div className="text-3xl mb-1" aria-hidden="true">{match.flag1}</div>
                    <div className="text-2xl font-black font-display tracking-wide text-floodlight">{match.team1}</div>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-center gap-1">
                    <div className="text-sm font-black text-floodlight/20 tracking-widest italic">VS</div>
                    <div className="w-8 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} aria-hidden="true" />
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-3xl mb-1" aria-hidden="true">{match.flag2}</div>
                    <div className="text-2xl font-black font-display tracking-wide text-floodlight/40">{match.team2}</div>
                  </div>
                </div>

                <div className="mt-auto space-y-2.5 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-2 text-xs text-floodlight/60">
                    <Calendar size={12} className="text-pitch flex-shrink-0" aria-hidden="true" />
                    <span>{match.date} · {match.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-floodlight/60">
                    <MapPin size={12} className="text-signal-amber flex-shrink-0" aria-hidden="true" />
                    <span className="leading-tight">{match.stadium}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="btn-ghost btn-sm">View Full Schedule →</button>
        </div>
      </div>
    </section>
  );
}
