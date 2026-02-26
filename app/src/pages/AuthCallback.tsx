import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const hasNavigated = useRef(false);

  useEffect(() => {
    // Don't do anything while auth is still loading
    if (loading) return;

    // Prevent double navigation
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    if (user) {
      toast.success('Welcome to ApexQuant!');
      navigate('/dashboard', { replace: true });
    } else {
      toast.error('Authentication failed. Please try again.');
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  // Safety timeout — if stuck more than 8 seconds, redirect to login
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        console.warn('Auth callback timeout — redirecting to login');
        toast.error('Authentication timed out. Please try again.');
        navigate('/login', { replace: true });
      }
    }, 8000);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="text-slate-400">Completing authentication...</p>
      </div>
    </div>
  );
}
