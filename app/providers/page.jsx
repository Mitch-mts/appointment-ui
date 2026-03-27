'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext.jsx';

export default function ProvidersPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (!loading && user && !isAdmin) {
      router.push('/dashboard');
      return;
    }
    if (!loading && user && isAdmin) {
      router.push('/admin/providers');
    }
  }, [loading, user, isAdmin, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
    </div>
  );
}

