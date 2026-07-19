
import { Trophy, Twitter, Instagram, Facebook, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-concourse pt-24 pb-12 border-t border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 flex-shrink-0 group mb-6 inline-flex">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #1F6E43, #3B7EC2)' }}
              >
                <Trophy size={20} className="text-[#F5F7F4]" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-black tracking-tight font-display brand-text-ops">
                  StadiumPulse
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase font-mono text-white/50">
                  FIFA WC 2026
                </span>
              </div>
            </Link>
            <p className="text-floodlight/50 max-w-sm text-sm">
              The official command center and fan companion for the greatest sporting event on earth. Feel the pulse of the tournament.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-6 text-sm">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/fan" className="text-floodlight/60 hover:text-signal-amber transition-colors text-sm">Fan Companion</Link></li>
              <li><Link to="/ops" className="text-floodlight/60 hover:text-signal-amber transition-colors text-sm">Ops Dashboard</Link></li>
              <li><a href="#" className="text-floodlight/60 hover:text-signal-amber transition-colors text-sm">Ticketing</a></li>
              <li><a href="#" className="text-floodlight/60 hover:text-signal-amber transition-colors text-sm">Match Schedule</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-6 text-sm">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-signal-amber hover:text-concourse transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-signal-amber hover:text-concourse transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-signal-amber hover:text-concourse transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-signal-amber hover:text-concourse transition-colors">
                <Youtube size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40 font-mono">
          <p>&copy; 2026 StadiumPulse. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
