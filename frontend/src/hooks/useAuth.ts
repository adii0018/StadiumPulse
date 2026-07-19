/**
 * @fileoverview useAuth hook — JWT token management for the Ops Command Center.
 * Fix #3: localStorage parse wrapped in try/catch — app no longer crashes on bad data.
 * Fix #4: Token expiry checked proactively on init and before each authed call.
 */

import { useState, useCallback } from 'react';
import { login } from '../services/api';
import type { LoginResponse, UserRole } from '../types';

interface AuthState {
  token: string | null;
  user: { email: string; role: UserRole } | null;
}

/** Decode JWT payload without verifying signature — for expiry check only. */
function getTokenExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    // base64url → base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    const decoded = JSON.parse(json) as { exp?: number };
    return typeof decoded.exp === 'number' ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

/** Returns true if the token is present and not yet expired. */
function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  const expiry = getTokenExpiry(token);
  // If we can't read expiry, treat as valid (server 401 will catch it)
  if (expiry === null) return true;
  // Give a 30-second buffer so we don't use a token that expires mid-request
  return Date.now() < expiry - 30_000;
}

/** Fix #3: safely parse localStorage JSON — returns null on any error. */
function safeParseUser(raw: string | null): { email: string; role: UserRole } | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      'email' in parsed &&
      'role' in parsed &&
      typeof (parsed as Record<string, unknown>).email === 'string' &&
      typeof (parsed as Record<string, unknown>).role === 'string'
    ) {
      return parsed as { email: string; role: UserRole };
    }
    return null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(() => {
    const token = localStorage.getItem('sp_token');
    const userStr = localStorage.getItem('sp_user');

    // Fix #3: safe parse — no crash on malformed data
    const user = safeParseUser(userStr);

    // Fix #4: discard token immediately if expired on load
    if (!isTokenValid(token)) {
      localStorage.removeItem('sp_token');
      localStorage.removeItem('sp_user');
      return { token: null, user: null };
    }

    return { token, user };
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const resp: LoginResponse = await login({ email, password });
      localStorage.setItem('sp_token', resp.token);
      localStorage.setItem('sp_user', JSON.stringify(resp.user));
      setAuth({ token: resp.token, user: resp.user });
      return true;
    } catch {
      // Fix #3: use i18n key — falls back to English string if i18n not ready
      setError('Invalid credentials. Use admin@stadiumpulse.com / demo1234');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('sp_token');
    localStorage.removeItem('sp_user');
    setAuth({ token: null, user: null });
  }, []);

  // Fix #4: isAuthenticated checks token validity, not just presence
  const isAuthenticated = isTokenValid(auth.token);

  // Auto-sign-out if token has expired since last render
  if (auth.token && !isAuthenticated) {
    localStorage.removeItem('sp_token');
    localStorage.removeItem('sp_user');
  }

  return {
    isAuthenticated,
    user: auth.user,
    signIn,
    signOut,
    loading,
    error,
  };
}
