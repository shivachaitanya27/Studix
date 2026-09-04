import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { supabase } from '../../services/supabaseClient.js';
import { syncOAuthSession } from '../../redux/authSlice.js';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        if (!supabase) {
          throw new Error('Supabase client is not configured.');
        }

        // Get session from Supabase URL fragment
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          // If not in session, wait briefly for authStateChange
          const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, newSession) => {
              if (newSession) {
                authListener?.subscription?.unsubscribe();
                await completeSync(newSession);
              }
            }
          );

          setTimeout(() => {
            if (!session) {
              setErrorMsg('No Google authentication session detected. Please sign in again.');
            }
          }, 3500);
          return;
        }

        await completeSync(session);
      } catch (err) {
        console.error('OAuth callback processing failed:', err);
        setErrorMsg(err.message || 'Failed to complete Google Sign-In.');
      }
    };

    const completeSync = async (session) => {
      try {
        const resultAction = await dispatch(syncOAuthSession({ supabaseSession: session }));
        if (syncOAuthSession.fulfilled.match(resultAction)) {
          const user = resultAction.payload.user;
          if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
            navigate('/admin', { replace: true });
          } else if (!user.college_id || !user.department_id) {
            navigate('/onboarding', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }

        } else {
          setErrorMsg(resultAction.payload || 'OAuth synchronization failed.');
        }
      } catch (e) {
        setErrorMsg(e.message || 'Authentication synchronization error.');
      }
    };

    handleOAuthCallback();
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full p-8 bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-700/60 shadow-2xl text-center">
        {!errorMsg ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center animate-pulse">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Finalizing Google Authentication
            </h2>
            <p className="text-sm text-slate-400">
              Synchronizing your student profile with the university repository...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Authentication Error</h2>
            <p className="text-sm text-red-300">{errorMsg}</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
