/**
 * @fileoverview LoginModal — staff credentials form for Ops Command Center access.
 * Uses brand design tokens for visual consistency and high accessibility.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, KeyRound, Trophy, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LoginModalProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export function LoginModal({ onLogin, loading, error }: LoginModalProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('admin@stadiumpulse.com');
  const [password, setPassword] = useState('demo1234');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(email, password);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8" aria-label="Login page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        <div className="glass-card p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-7">
            {/* Trophy + Shield stacked icon */}
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(31, 110, 67, 0.2), rgba(59, 126, 194, 0.15))',
                  border: '1px solid rgba(59, 126, 194, 0.25)',
                }}
              >
                <Shield size={30} className="text-[#3B7EC2]" aria-hidden="true" />
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #1F6E43, #3B7EC2)',
                  boxShadow: '0 2px 8px rgba(31, 110, 67, 0.3)',
                }}
              >
                <Trophy size={14} className="text-[#F5F7F4]" aria-hidden="true" />
              </div>
            </div>
            <h1 className="font-display font-black text-xl text-white mb-1 tracking-tight">{t('ops.login')}</h1>
            <p className="text-white/40 text-xs tracking-wider uppercase font-mono">FIFA World Cup 2026 · Stadium Ops</p>
          </div>

          {/* Demo credentials */}
          <div
            className="mb-5 p-3 rounded-xl text-xs flex items-center gap-2.5"
            style={{
              backgroundColor: 'rgba(59, 126, 194, 0.08)',
              border: '1px solid rgba(59, 126, 194, 0.2)',
            }}
          >
            <KeyRound size={13} className="text-[#3B7EC2] flex-shrink-0" aria-hidden="true" />
            <div>
              <span className="font-bold text-[#3B7EC2]">Demo: </span>
              <span className="text-white/60">admin@stadiumpulse.com / demo1234</span>
            </div>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} noValidate>
            <div className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-[10px] uppercase font-bold tracking-wider text-white/50 mb-1.5 font-mono">
                  {t('ops.email')}
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-xs text-white bg-white/5 border border-white/10 focus:outline-none transition-colors"
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#3B7EC2')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                  placeholder="staff@stadiumpulse.com"
                  required
                  autoComplete="email"
                  aria-required="true"
                  aria-describedby={error ? 'login-error' : undefined}
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-[10px] uppercase font-bold tracking-wider text-white/50 mb-1.5 font-mono">
                  {t('ops.password')}
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 pr-11 rounded-xl text-xs text-white bg-white/5 border border-white/10 focus:outline-none transition-colors"
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#3B7EC2')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                    required
                    autoComplete="current-password"
                    aria-required="true"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div
                id="login-error"
                role="alert"
                className="mt-4 p-3 rounded-lg text-xs flex items-center gap-2"
                style={{
                  backgroundColor: 'rgba(194, 59, 59, 0.08)',
                  border: '1px solid rgba(194, 59, 59, 0.2)',
                }}
              >
                <AlertCircle size={13} className="text-away-red flex-shrink-0" aria-hidden="true" />
                <span className="text-away-red font-medium">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-pulse w-full mt-5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed font-bold"
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <div className="sp-spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#fff' }} aria-hidden="true" />
                  <span>Signing in...</span>
                </>
              ) : (
                t('ops.loginBtn')
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
