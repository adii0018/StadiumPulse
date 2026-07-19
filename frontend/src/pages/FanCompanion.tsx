/**
 * @fileoverview FanCompanion — mobile-friendly, calm and welcoming fan portal.
 * Fix #1: Language state removed — now reads from shared LanguageContext.
 * Fix #2: handleNavigate error shown to user instead of silently swallowed.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Mic,
  MicOff,
  MapPin,
  Navigation2,
  Accessibility,
  Wifi,
  WifiOff,
  MessageSquare,
  Trophy,
  Ticket,
  Clock,
  Bath,
  Ear,
  HeartPulse,
  BrainCircuit,
  Zap,
  Phone,
  LocateFixed,
  Utensils,
  DoorOpen,
  AlertCircle,
} from 'lucide-react';
import { ChatMessage } from '../components/ChatMessage';
import { LanguageSelector } from '../components/Navbar';
import { PictogramChip } from '../components/PictogramChip';
import { RouteCard } from '../components/RouteCard';
import { useSpeech } from '../hooks/useSpeech';
import { useLanguage } from '../context/LanguageContext';
import { fanChat, fanNavigate } from '../services/api';
import type { ChatMessage as ChatMessageType, SupportedLanguage, FanNavigateResponse } from '../types';

type Tab = 'chat' | 'navigate' | 'accessibility';

const WELCOME_MESSAGES: Record<SupportedLanguage, string> = {
  en: "Welcome to StadiumPulse! I'm your AI guide for FIFA World Cup 2026. Ask me about gates, transit, facilities, accessibility, or anything else about the stadium.",
  es: "¡Bienvenido a StadiumPulse! Soy tu guía de IA para el Mundial FIFA 2026. Pregúntame sobre puertas, tránsito, instalaciones o accesibilidad.",
  hi: "StadiumPulse में आपका स्वागत है! मैं FIFA विश्व कप 2026 के लिए आपका AI गाइड हूं। गेट, ट्रांजिट, सुविधाओं के बारे में कुछ भी पूछें।",
};

const ACCESSIBILITY_ITEMS = [
  { title: 'Wheelchair Routes',    desc: 'All gates have ramps. Gates 1,2,4,6,8,9 have elevator access.', icon: Accessibility },
  { title: 'Accessible Restrooms', desc: 'Available at every gate level. Look for the blue symbol.',        icon: Bath       },
  { title: 'Hearing Assistance',   desc: 'Hearing loops at Gates 2,6,9. Sign language at Gate 6.',         icon: Ear        },
  { title: 'Medical Assistance',   desc: 'Medical Center Delta at Gate 6. All posts fully accessible.',    icon: HeartPulse },
  { title: 'Quiet Spaces',         desc: 'Sensory-friendly quiet room — Level 1, near Gate 1.',            icon: BrainCircuit },
  { title: 'Priority Lane',        desc: 'Show accessibility badge at Gates 2, 4, 9 for priority entry.',  icon: Zap        },
];

export default function FanCompanion() {
  const { t } = useTranslation();
  // Fix #1: language from context — in sync with Navbar, persisted across refreshes
  const { language } = useLanguage();
  const [activeTab, setActiveTab]       = useState<Tab>('chat');
  const [messages, setMessages]         = useState<ChatMessageType[]>([]);
  const [input, setInput]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [isOnline, setIsOnline]         = useState(navigator.onLine);
  const [navFrom, setNavFrom]           = useState('');
  const [navTo, setNavTo]               = useState('');
  const [navResult, setNavResult]       = useState<FanNavigateResponse | null>(null);
  const [navLoading, setNavLoading]     = useState(false);
  // Fix #2: navigation error state — no longer silently swallowed
  const [navError, setNavError]         = useState<string | null>(null);
  const messagesEndRef                  = useRef<HTMLDivElement>(null);
  const inputRef                        = useRef<HTMLInputElement>(null);
  const { isListening, startListening, stopListening, speak, isSupported } = useSpeech();

  useEffect(() => {
    setMessages([{ id: 'welcome', role: 'assistant', content: WELCOME_MESSAGES[language], timestamp: Date.now(), language }]);
  }, [language]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    const up = () => setIsOnline(true);
    const dn = () => setIsOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', dn);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', dn); };
  }, []);

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    const userMsg: ChatMessageType = { id: `u-${Date.now()}`, role: 'user', content: msg, timestamp: Date.now(), language };
    setMessages((p) => [...p, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fanChat({ message: msg, language });
      setMessages((p) => [...p, { id: `a-${Date.now()}`, role: 'assistant', content: res.reply, timestamp: res.timestamp, language }]);
    } catch {
      setMessages((p) => [...p, { id: `e-${Date.now()}`, role: 'assistant', content: t('fan.errorMsg'), timestamp: Date.now(), language }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, language, t]);

  const handleVoiceInput = () => {
    if (isListening) stopListening();
    else startListening(language, (text) => { void sendMessage(text); });
  };

  const handleNavigate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!navFrom || !navTo) return;
    setNavLoading(true);
    setNavResult(null);
    // Fix #2: error no longer silently swallowed — shown to user
    setNavError(null);
    try {
      setNavResult(await fanNavigate({ from: navFrom, to: navTo, language }));
    } catch {
      setNavError('Could not find a route. Please check your locations and try again.');
    } finally {
      setNavLoading(false);
    }
  };

  const handlePictogramClick = (category: string) => {
    if (category === 'restrooms') {
      setInput('Where is the nearest accessible restroom?');
      setActiveTab('chat');
      void sendMessage('Where is the nearest accessible restroom?');
    } else if (category === 'accessibility') {
      setActiveTab('accessibility');
    } else if (category === 'food') {
      setInput('Where can I buy food and drinks?');
      setActiveTab('chat');
      void sendMessage('Where can I buy food and drinks?');
    } else if (category === 'gates') {
      setInput('Which gate should I use for section 201?');
      setActiveTab('chat');
      void sendMessage('Which gate should I use for section 201?');
    }
  };

  const TABS = [
    { id: 'chat' as Tab,          label: 'Chat',              icon: <MessageSquare size={14} aria-hidden="true" /> },
    { id: 'navigate' as Tab,      label: t('fan.navigate'),   icon: <Navigation2   size={14} aria-hidden="true" /> },
    { id: 'accessibility' as Tab, label: t('fan.accessibility'), icon: <Accessibility size={14} aria-hidden="true" /> },
  ];

  return (
    <main className="min-h-screen bg-concourse text-floodlight pt-14 pb-12" aria-label="Fan Companion">
      {/* ── Hero Header ── */}
      <div className="pt-6 pb-4 px-4 sm:px-6 max-w-4xl mx-auto">
        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
          <div>
            {/* FIFA label */}
            <div className="fifa-badge mb-2">
              <Trophy size={10} aria-hidden="true" />
              FIFA World Cup 2026™
            </div>
            <h1 className="stadium-title text-3xl sm:text-4xl leading-none mb-1">{t('fan.title')}</h1>
            <p className="text-[10px] tracking-widest uppercase font-bold text-[#E8A33D]/70 font-mono">
              {t('fan.subtitle')}
            </p>
          </div>
          <div className="flex-shrink-0">
            <LanguageSelector />
          </div>
        </div>

        {/* ── Ticket Widget ── */}
        <div className="relative overflow-hidden rounded-2xl mb-6 bg-white/5 border border-white/10 shadow-md">
          {/* top brand strip */}
          <div className="h-1.5 w-full bg-[#1F6E43]" aria-hidden="true" />

          <div className="p-4 sm:p-5">
            {/* Live badge */}
            <div className="flex items-center gap-2 mb-3 text-[#E8A33D] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#1F6E43] animate-pulse flex-shrink-0" aria-hidden="true" />
              <span className="text-[10px] font-black uppercase tracking-wider">FIFA World Cup 2026 — Group Stage · Match 12</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-stretch gap-4">
              {/* Left — match info */}
              <div className="flex-1 min-w-0">
                {/* Teams */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-center flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-[#1F6E43]/10 flex items-center justify-center text-sm font-black text-[#E8A33D] border border-white/10">US</div>
                    <p className="text-[10px] font-black text-floodlight/70 mt-1">USA</p>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="font-display text-2xl tracking-widest text-[#E8A33D] font-black">
                      VS
                    </div>
                  </div>
                  <div className="text-center flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-[#1F6E43]/10 flex items-center justify-center text-sm font-black text-[#E8A33D] border border-white/10">EN</div>
                    <p className="text-[10px] font-black text-floodlight/70 mt-1">ENG</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-floodlight/60 mb-3 font-semibold">
                  <LocateFixed size={11} className="text-[#E8A33D]" aria-hidden="true" />
                  Lumen Field, Seattle · 19:00 PT
                </div>

                {/* Meta row */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { label: 'Date',   value: 'Jul 22, 2026' },
                    { label: 'Gates',  value: 'G1 & G3' },
                    { label: 'Block',  value: 'N · Row 12' },
                  ].map((m) => (
                    <div key={m.label} className="p-1.5 rounded-lg border border-white/8" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <span className="block text-[8px] uppercase tracking-wider mb-0.5 text-[#E8A33D]/60 font-bold">{m.label}</span>
                      <span className="font-bold text-floodlight">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px bg-pitch/10" aria-hidden="true" />

              {/* Right — countdown + barcode */}
              <div className="sm:w-36 flex sm:flex-col items-center sm:items-end justify-between sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider mb-0.5 text-[#E8A33D]/70 font-bold">
                    <Clock size={9} aria-hidden="true" />
                    Kickoff In
                  </div>
                  <span className="text-lg font-mono font-bold text-[#E8A33D]">
                    3d 01h 05m
                  </span>
                </div>
                <div>
                  {/* Ticket icon */}
                  <div className="flex items-center gap-1.5 mb-1 text-[#E8A33D]/60" style={{ justifyContent: 'flex-end' }}>
                    <Ticket size={11} aria-hidden="true" />
                    <span className="text-[8px] font-mono tracking-widest font-bold">WC2026-N12G3</span>
                  </div>
                  {/* Barcode bars */}
                  <div className="h-8 w-32 rounded flex items-center justify-between px-2 overflow-hidden border border-white/10" style={{ background: 'rgba(255,255,255,0.04)' }} aria-hidden="true">
                    {[2,4,1,3,2,5,1,2,3,1,4,2,3,1].map((w, i) => (
                      <div key={i} className="h-full rounded-sm" style={{ width:`${w}px`, background: i%3===0?'#1F6E43':'rgba(18, 24, 27, 0.4)' }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Online / Offline status */}
        {!isOnline ? (
          <div className="p-3 rounded-xl flex items-center gap-2 text-sm bg-away-red/10 border border-away-red/30 mb-4" role="alert">
            <WifiOff size={14} className="text-away-red flex-shrink-0" aria-hidden="true" />
            <span className="font-bold text-xs text-away-red">{t('fan.offline')} —</span>
            <span className="text-floodlight/70 text-xs">{t('fan.offlineMsg')}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#E8A33D]/70 mb-4">
            <Wifi size={11} className="text-[#E8A33D]" aria-hidden="true" />
            STADIUMPULSE AI ONLINE
          </div>
        )}
      </div>

      {/* ── Pictogram Shortcuts Row ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1.5 custom-scroll" role="group" aria-label="Wayfinding shortcuts">
          <PictogramChip label="Restrooms" icon={<Bath size={14} />} onClick={() => handlePictogramClick('restrooms')} />
          <PictogramChip label="Accessible" icon={<Accessibility size={14} />} onClick={() => handlePictogramClick('accessibility')} />
          <PictogramChip label="Food/Drinks" icon={<Utensils size={14} />} onClick={() => handlePictogramClick('food')} />
          <PictogramChip label="Gates" icon={<DoorOpen size={14} />} onClick={() => handlePictogramClick('gates')} />
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex gap-1 mb-4 p-1 rounded-xl w-full sm:w-fit overflow-x-auto bg-white/5 border border-white/10"
          role="tablist" aria-label="Fan companion features">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              role="tab" id={`tab-${tab.id}`} aria-selected={activeTab===tab.id} aria-controls={`panel-${tab.id}`}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap flex-1 sm:flex-none justify-center ${activeTab===tab.id ? 'tab-active' : 'tab-inactive'}`}
            >
              {tab.icon}<span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Chat Panel ── */}
        <div id="panel-chat" role="tabpanel" aria-labelledby="tab-chat" hidden={activeTab!=='chat'}>
          <div className="glass-card overflow-hidden">
            <div className="h-80 sm:h-96 overflow-y-auto p-4 space-y-4 custom-scroll"
              role="log" aria-label="Chat messages" aria-live="polite" aria-atomic="false"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} onSpeak={(text) => speak(text, language)} />
                ))}
              </AnimatePresence>
              {loading && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex gap-3 items-center" aria-live="polite">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                    <Trophy size={14} className="text-white" aria-hidden="true" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm border border-white/10"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="flex gap-1.5" aria-label="Thinking">
                      {[0,1,2].map((i) => (
                        <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                          style={{ backgroundColor: '#10b981', animationDelay:`${i*0.15}s` }} aria-hidden="true" />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-white/10 p-3 sm:p-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <form onSubmit={(e) => { e.preventDefault(); void sendMessage(); }}
                className="flex items-center gap-2" aria-label="Send message form">
                {isSupported && (
                  <button type="button" onClick={handleVoiceInput}
                    className="p-3 rounded-xl flex-shrink-0 transition-all border"
                    style={isListening
                      ? { backgroundColor: '#C23B3B15', borderColor: '#C23B3B30' }
                      : { borderColor: 'rgba(31, 110, 67, 0.15)', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                    aria-label={isListening ? t('fan.voiceStop') : t('fan.voiceStart')}
                    aria-pressed={isListening}>
                    {isListening
                      ? <MicOff size={15} className="text-away-red" aria-hidden="true" />
                      : <Mic size={15} className="text-[#E8A33D]" aria-hidden="true" />}
                  </button>
                )}
                <input ref={inputRef} type="text"
                  value={isListening ? t('fan.listening') : input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('fan.placeholder')}
                  disabled={loading || isListening || !isOnline}
                  className="flex-1 min-w-0 px-4 py-2.5 sm:py-3 rounded-xl text-xs text-floodlight placeholder-floodlight/30 bg-white/5 border border-white/10 focus:outline-none focus:border-white/50 transition-colors disabled:opacity-50"
                  aria-label={t('fan.typeMessage')}
                  maxLength={500}
                  onKeyDown={(e) => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void sendMessage();} }}
                />
                <button type="submit"
                  disabled={!input.trim()||loading||!isOnline}
                  className="btn-pulse flex-shrink-0 px-4 py-2.5 sm:py-3 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                  aria-label={t('fan.send')}>
                  <Send size={15} aria-hidden="true" />
                </button>
              </form>
              {!isOnline && <p className="text-[10px] mt-1.5 text-away-red font-bold font-mono">{t('fan.offline')}</p>}
            </div>
          </div>
        </div>

        {/* ── Navigate Panel ── */}
        <div id="panel-navigate" role="tabpanel" aria-labelledby="tab-navigate" hidden={activeTab!=='navigate'}>
          <div className="glass-card p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <Navigation2 size={16} className="text-[#E8A33D]" aria-hidden="true" />
              <h2 className="font-semibold text-floodlight text-sm sm:text-base">Step-by-step Navigation</h2>
            </div>
            <form onSubmit={(e) => void handleNavigate(e)} className="space-y-4" aria-label="Navigation form">
              <div>
                <label htmlFor="nav-from" className="block text-xs font-bold text-[#E8A33D] mb-1.5">{t('fan.from')}</label>
                <input id="nav-from" type="text" value={navFrom} onChange={(e) => setNavFrom(e.target.value)}
                  placeholder="Gate 1, North Stand, Parking..."
                  className="w-full px-4 py-2.5 sm:py-3 rounded-xl text-xs text-floodlight bg-white/5 border border-white/10 focus:outline-none focus:border-white/50 transition-colors"
                  required aria-required="true" />
              </div>
              <div>
                <label htmlFor="nav-to" className="block text-xs font-bold text-[#E8A33D] mb-1.5">{t('fan.to')}</label>
                <input id="nav-to" type="text" value={navTo} onChange={(e) => setNavTo(e.target.value)}
                  placeholder="Section 201, Medical Post, Gate 8..."
                  className="w-full px-4 py-2.5 sm:py-3 rounded-xl text-xs text-floodlight bg-white/5 border border-white/10 focus:outline-none focus:border-white/50 transition-colors"
                  required aria-required="true" />
              </div>
              <button type="submit" disabled={navLoading||!navFrom||!navTo}
                className="btn-pulse w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                aria-busy={navLoading}>
                <MapPin size={14} aria-hidden="true" />
                {navLoading ? 'Finding route...' : t('fan.findRoute')}
              </button>
            </form>

            {navResult && (
              <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="mt-6">
                <RouteCard navigation={navResult.navigation} from={navFrom} to={navTo} />
              </motion.div>
            )}

            {/* Fix #2: navigation error feedback */}
            {navError && (
              <div
                className="mt-4 p-3 rounded-xl flex items-start gap-2 text-xs"
                style={{ backgroundColor: 'rgba(194,59,59,0.08)', border: '1px solid rgba(194,59,59,0.25)' }}
                role="alert"
              >
                <AlertCircle size={14} className="text-away-red flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-away-red font-semibold">{navError}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Accessibility Panel ── */}
        <div id="panel-accessibility" role="tabpanel" aria-labelledby="tab-accessibility" hidden={activeTab!=='accessibility'}>
          <div className="glass-card p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <Accessibility size={16} className="text-[#E8A33D]" aria-hidden="true" />
              <h2 className="font-semibold text-floodlight text-sm sm:text-base">Accessibility Services</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="list" aria-label="Accessibility resources">
              {ACCESSIBILITY_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition-all duration-150" role="listitem">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-pitch/10 border border-white/20">
                      <Icon size={16} className="text-[#E8A33D]" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-floodlight">{item.title}</h3>
                      <p className="text-floodlight/60 text-xs mt-1 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-3 rounded-xl flex items-center justify-center gap-2 text-xs text-floodlight/50 border border-white/10"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              <Phone size={11} className="text-[#E8A33D]" aria-hidden="true" />
              Accessibility Hotline: <strong className="text-[#E8A33D] ml-1">+1-555-ACCESS</strong>
              <span className="mx-1">·</span>
              Available 24/7
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
