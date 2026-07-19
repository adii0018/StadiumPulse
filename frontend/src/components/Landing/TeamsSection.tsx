
import { motion } from 'framer-motion';

const TEAMS = [
  { id: 'ARG', name: 'Argentina', flag: '🇦🇷', group: 'Champions' },
  { id: 'FRA', name: 'France', flag: '🇫🇷', group: 'Contenders' },
  { id: 'BRA', name: 'Brazil', flag: '🇧🇷', group: 'Contenders' },
  { id: 'USA', name: 'USA', flag: '🇺🇸', group: 'Host Nation' },
  { id: 'MEX', name: 'Mexico', flag: '🇲🇽', group: 'Host Nation' },
  { id: 'CAN', name: 'Canada', flag: '🇨🇦', group: 'Host Nation' },
];

export function TeamsSection() {
  return (
    <section className="py-24 bg-concourse relative perspective-1000">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black font-display uppercase tracking-wider mb-4">
            The <span className="text-away-red">Contenders</span>
          </h2>
          <p className="text-floodlight/60 max-w-2xl mx-auto">
            48 nations. 104 matches. Prepare to witness history on the grandest stage.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {TEAMS.map((team, idx) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, rotateY: 90 }}
              whileInView={{ opacity: 1, rotateY: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.1, type: 'spring', damping: 12 }}
              className="group relative h-48 rounded-xl cursor-pointer"
              style={{ perspective: '1000px' }}
            >
              {/* Flip Container */}
              <div className="w-full h-full relative transition-transform duration-700 preserve-3d group-hover:rotate-y-180">
                
                {/* Front */}
                <div className="absolute inset-0 backface-hidden bg-concourse-light border border-white/5 rounded-xl flex flex-col items-center justify-center p-4 glass-card">
                  <span className="text-5xl mb-2 filter drop-shadow-lg">{team.flag}</span>
                  <span className="font-display font-black text-xl uppercase tracking-wider">{team.id}</span>
                </div>

                {/* Back */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-pitch to-concourse border border-pitch/30 rounded-xl flex flex-col items-center justify-center p-4 shadow-[0_0_20px_rgba(31,110,67,0.3)]">
                  <span className="text-xs font-bold text-signal-amber uppercase tracking-widest mb-1">
                    {team.group}
                  </span>
                  <span className="font-display font-black text-lg uppercase text-center">
                    {team.name}
                  </span>
                  <div className="mt-3 text-[10px] uppercase font-bold text-white/50 border border-white/20 px-2 py-1 rounded-full">
                    View Squad
                  </div>
                </div>

              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
