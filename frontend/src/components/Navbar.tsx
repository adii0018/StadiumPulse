/**
 * @fileoverview Navbar — StadiumPulse top navigation.
 * Fix #1: No longer takes language/onLanguageChange props — reads from LanguageContext.
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, Users, BarChart2, Leaf, Menu, X } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import type { SupportedLanguage } from '../types';

const LANGUAGES: { code: SupportedLanguage; label: string; flag: string }[] = [
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'es', label: 'ES', flag: '🇪🇸' },
  { code: 'hi', label: 'हि', flag: '🇮🇳' },
];

// No longer needs external props — language state is in context
export function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { to: '/fan', label: t('nav.fanCompanion'), icon: <Users size={14} aria-hidden="true" /> },
    { to: '/ops', label: t('nav.opsDashboard'), icon: <BarChart2 size={14} aria-hidden="true" /> },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/50 backdrop-blur-md border-b border-white/10' : 'bg-transparent border-b border-transparent'}`}
      aria-label="Main navigation"
    >
      {/* Brand Color Strip */}
      <div
        className="h-1 w-full"
        style={{ background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)' }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0 group" aria-label="StadiumPulse home">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105 bg-pitch/10 border border-pitch/20"
          >
            <Leaf size={16} className="text-pitch" strokeWidth={2.5} aria-hidden="true" />
          </div>
          <div className="flex flex-col leading-none">
            <span
              className="text-lg font-bold tracking-tight text-white inline-block"
            >
              StadiumPulse
            </span>
            <span
              className="text-[8px] font-bold tracking-widest uppercase font-mono hidden sm:block text-white/50"
            >
              Command Center
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150 border ${isActive ? 'bg-pitch/10 text-pitch border-pitch/20' : 'text-zinc-400 border-transparent hover:bg-white/5 hover:text-white'}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1" role="group" aria-label="Language selector">
            <Globe size={13} className="text-white/30" aria-hidden="true" />
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-all duration-150 ${language === l.code ? 'bg-pitch text-white' : 'text-white/50 hover:bg-white/10'}`}
                aria-pressed={language === l.code}
                aria-label={`Switch to ${l.label}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg transition-colors border text-white/60 border-white/15 hover:bg-white/5"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-4 pt-2 space-y-3 border-t border-white/10 bg-black/90 backdrop-blur-md" role="menu">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  role="menuitem"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all border ${isActive ? 'bg-pitch/10 text-pitch border-pitch/20' : 'text-zinc-400 border-transparent hover:bg-white/5 hover:text-white'}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
            <div className="flex items-center gap-1" role="group" aria-label="Language selector">
              <Globe size={13} className="text-white/30" aria-hidden="true" />
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { setLanguage(l.code); setMobileOpen(false); }}
                  className={`px-2.5 py-1.5 rounded-md text-[10px] font-mono font-bold transition-all ${language === l.code ? 'bg-pitch text-white' : 'text-white/50 hover:bg-white/10'}`}
                  aria-pressed={language === l.code}
                  aria-label={`Switch to ${l.label}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

/**
 * Standalone LanguageSelector — used in FanCompanion.
 * Fix #1: reads/writes from shared LanguageContext instead of local state.
 */
export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Language selector">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          onClick={() => setLanguage(l.code)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 ${language === l.code ? 'bg-pitch/10 text-pitch border-pitch/20' : 'border-white/10 text-zinc-400 bg-white/5 hover:bg-white/10'}`}
          aria-pressed={language === l.code}
          aria-label={`Switch to ${l.label}`}
        >
          <span>{l.flag}</span>
          <span className="font-mono text-[10px]">{l.label}</span>
        </button>
      ))}
    </div>
  );
}
