'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

interface GoogleSignInButtonProps {
  mode?: 'login' | 'signup';
}

export default function GoogleSignInButton({ mode = 'login' }: GoogleSignInButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [clientId, setClientId] = useState('');
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    // Fetch Google Client ID from server
    fetch('/api/auth/google/config')
      .then(r => r.json())
      .then(data => {
        if (data.clientId) {
          setClientId(data.clientId);
          setConfigured(true);
        } else {
          setConfigured(false);
        }
      })
      .catch(() => setConfigured(false));

    // Load Google Identity Services script with ready detection
    if (typeof window !== 'undefined' && !document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => setScriptReady(true);
      script.onerror = () => setConfigured(false);
      document.body.appendChild(script);
    } else {
      // Script tag already exists — check if already loaded
      const check = () => {
        if ((window as any)?.google?.accounts) {
          setScriptReady(true);
        } else {
          setTimeout(check, 200);
        }
      };
      check();
    }
  }, []);

  const handleGoogleSignIn = () => {
    setLoading(true);
    setError('');

    const { google } = window as any;
    if (!google?.accounts) {
      // Script not ready yet — wait briefly then retry
      setTimeout(() => {
        const { google: g } = window as any;
        if (g?.accounts) {
          setLoading(false);
          handleGoogleSignIn();
          return;
        }
        setError('Google sign-in is taking longer than usual. Tap again or try refreshing the page.');
        setLoading(false);
      }, 2000);
      return;
    }

    google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: any) => {
        if (!response?.credential) {
          setError('Google sign-in cancelled');
          setLoading(false);
          return;
        }

        try {
          const res = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: response.credential }),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || 'Google sign-in failed');
          }

          useAuthStore.setState({
            user: data.session.user,
            profile: data.session.profile,
            company: data.session.company,
            isAuthenticated: true,
            isLoading: false,
            token: data.token,
          });

          router.push('/dashboard');
        } catch (err: any) {
          setError(err.message || 'Google sign-in failed');
        } finally {
          setLoading(false);
        }
      },
    });

    google.accounts.id.prompt(); // Show One Tap popup
  };

  if (configured === false) return null; // Don't show button if not configured
  if (configured === null || !clientId) return null; // Still loading

  return (
    <div>
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading || !scriptReady}
        className="w-full h-11 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {loading ? 'Signing in...' : mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
      </button>
      {error && (
        <p className="text-xs text-red-500 mt-2 text-center">{error}</p>
      )}
    </div>
  );
}
