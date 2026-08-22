import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase/client';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('Verifying your invitation credentials...');

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        // Exchange code/session from Supabase callback URL
        const { data, error: sessionErr } = await supabase.auth.getSession();

        if (sessionErr) {
          throw sessionErr;
        }

        if (data.session) {
          setMessage('Session established! Redirecting to password creation...');
          // User is authenticated via invite link. Route to /activate to set their password
          setTimeout(() => {
            navigate('/activate', { replace: true });
          }, 800);
          return;
        }

        // Listen for auth state change if session not immediately ready
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || session) {
            setMessage('Account verified! Redirecting to set your password...');
            authListener.subscription.unsubscribe();
            navigate('/activate', { replace: true });
          }
        });

        // Timeout fallback if no session detected in 5 seconds
        setTimeout(() => {
          if (!data.session) {
            navigate('/login', { replace: true });
          }
        }, 5000);
      } catch (err: any) {
        setError(err.message || 'Failed to authenticate invitation link. Please request a new invite.');
      }
    }

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center text-white shadow-2xl space-y-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-400/30 text-blue-400">
          {error ? (
            <AlertCircle className="w-7 h-7 text-rose-400" />
          ) : message.includes('Redirecting') ? (
            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
          ) : (
            <Loader2 className="w-7 h-7 animate-spin text-blue-400" />
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold">{error ? 'Verification Error' : 'Welcome to OnboardOS'}</h2>
          <p className="text-xs text-slate-300">{error || message}</p>
        </div>

        {error && (
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
          >
            Go to Login
          </button>
        )}
      </div>
    </div>
  );
}
