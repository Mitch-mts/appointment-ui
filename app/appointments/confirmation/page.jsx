'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { parseISO, format } from 'date-fns';
import { Button, CircularProgress } from '@mui/material';
import Navigation from '../../../components/Navigation.jsx';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import {
  providerAPI,
  providerDisplayName,
} from '../../../lib/providers.js';

export default function AppointmentConfirmationPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const referenceNumber = searchParams.get('referenceNumber');
  const providerId = searchParams.get('providerId');
  const bookedDate = searchParams.get('date');
  const bookedTime = searchParams.get('time');

  const [provider, setProvider] = useState(null);
  const [providerLoading, setProviderLoading] = useState(Boolean(providerId));

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!providerId) {
      setProvider(null);
      setProviderLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setProviderLoading(true);
      try {
        const res = await providerAPI.getProviderById(providerId);
        if (!cancelled && res?.success && res.data) {
          setProvider(res.data);
        } else if (!cancelled) {
          setProvider(null);
        }
      } catch {
        if (!cancelled) setProvider(null);
      } finally {
        if (!cancelled) setProviderLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [providerId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
      </div>
    );
  }

  if (!user) return null;

  let formattedDate = bookedDate || '';
  if (bookedDate) {
    try {
      formattedDate = format(parseISO(bookedDate), 'EEEE, MMMM dd, yyyy');
    } catch {
      // Keep raw value if parsing fails
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-sky-50 text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-32 h-72 w-72 rounded-full bg-blue-100 blur-3xl" />
        <div className="absolute top-32 -right-24 h-80 w-80 rounded-full bg-cyan-100 blur-3xl" />
        <div className="absolute bottom-[-80px] left-12 h-72 w-72 rounded-full bg-indigo-100 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50" />
      </div>

      <Navigation />

      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/80 backdrop-blur border border-slate-200 rounded-3xl p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Appointment confirmed</h1>
          <p className="mt-2 text-slate-600">
            You’re all set. Below is your booking summary.
          </p>

          <div className="mt-7 space-y-4">
            <div>
              <div className="text-sm text-slate-500">Reference</div>
              <div className="text-lg font-semibold text-slate-900">
                {referenceNumber || '—'}
              </div>
            </div>

            <div>
              <div className="text-sm text-slate-500">Provider</div>
              {providerLoading ? (
                <div className="flex items-center gap-2 mt-1">
                  <CircularProgress size={20} />
                  <span className="text-slate-600">Loading…</span>
                </div>
              ) : (
                <>
                  <div className="text-lg font-semibold text-slate-900">
                    {provider ? providerDisplayName(provider) : '—'}
                  </div>
                  {isAdmin && provider?.service && (
                    <div className="text-sm text-slate-600 mt-1">
                      <span className="font-medium text-slate-700">Service:</span>{' '}
                      {provider.service}
                    </div>
                  )}
                  {isAdmin && provider?.availability && (
                    <div className="text-sm text-slate-600 mt-1">
                      <span className="font-medium text-slate-700">Availability:</span>{' '}
                      {provider.availability}
                    </div>
                  )}
                </>
              )}
            </div>

            <div>
              <div className="text-sm text-slate-500">When</div>
              <div className="text-lg font-semibold text-slate-900">
                {formattedDate || '—'} {bookedTime ? `at ${bookedTime}` : ''}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button
              variant="contained"
              size="large"
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
              onClick={() => router.push('/appointments')}
            >
              View my appointments
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
              onClick={() => router.push('/providers')}
            >
              Book another appointment
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
