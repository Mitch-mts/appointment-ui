'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const LANDING_PREFETCH_ROUTES = ['/login', '/register', '/demo', '/dashboard'];

export default function LandingRoutePrefetch() {
  const router = useRouter();

  useEffect(() => {
    LANDING_PREFETCH_ROUTES.forEach((href) => router.prefetch(href));
  }, [router]);

  return null;
}
