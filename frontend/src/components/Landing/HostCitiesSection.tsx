
import { motion } from 'framer-motion';

const CITIES = [
  { name: 'New York/NJ', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800&auto=format&fit=crop' },
  { name: 'Mexico City', image: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=800&auto=format&fit=crop' },
  { name: 'Toronto', image: 'https://images.unsplash.com/photo-1507992781348-310259076fe0?q=80&w=800&auto=format&fit=crop' },
  { name: 'Los Angeles', image: 'https://images.unsplash.com/photo-1580659324420-c081829037c7?q=80&w=800&auto=format&fit=crop' },
];

export function HostCitiesSection() {
  return (
    <section className="py-24 bg-concourse-light relative overflow-hidden">
      <div className="absolute inset-0 bg-fifa-gradient opacity-5" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex items-end justify-between"
        >
          <div>
            <h2 className="text-4xl md:text-5xl font-black font-display uppercase tracking-wider mb-2">
              Host <span className="text-pitch-light">Cities</span>
            </h2>
            <p className="text-floodlight/60">16 cities across 3 nations. One unified passion.</p>
          </div>
          <div className="hidden md:block">
            <button className="text-xs font-bold uppercase tracking-widest text-signal-amber hover:text-white transition-colors">
              Explore All Venues &rarr;
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[400px]">
          {CITIES.map((city, idx) => (
            <motion.div
              key={city.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative rounded-2xl overflow-hidden cursor-pointer h-full"
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${city.image})` }}
              />
              
              {/* Overlays */}
              <div className="absolute inset-0 bg-concourse/70 group-hover:bg-concourse/20 transition-colors duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-concourse via-transparent to-transparent opacity-90" />

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <h3 className="text-2xl font-black font-display uppercase tracking-wider translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  {city.name}
                </h3>
                <div className="h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 group-hover:mt-2 transition-all duration-300 overflow-hidden">
                  <span className="text-xs font-bold text-signal-amber uppercase tracking-widest">
                    View Stadium &rarr;
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
