'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { parseISO, format } from 'date-fns';
import { Button, CircularProgress } from '@mui/material';
import { useRequireAuth } from '../../../hooks/useRequireAuth.js';
import PageSpinner from '../../../components/PageSpinner.jsx';
import {
  providerAPI,
  providerDisplayName,
} from '../../../lib/providers.js';

function AppointmentConfirmationContent() {
  const { isAdmin, showAuthSpinner, ready } = useRequireAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const referenceNumber = searchParams.get('referenceNumber');
  const providerId = searchParams.get('providerId');
  const bookedDate = searchParams.get('date');
  const bookedTime = searchParams.get('time');

  const [provider, setProvider] = useState(null);
  const [providerLoading, setProviderLoading] = useState(Boolean(providerId));

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

  if (showAuthSpinner) return <PageSpinner />;
  if (!ready) return null;

  let formattedDate = bookedDate || '';
  if (bookedDate) {
    try {
      formattedDate = format(parseISO(bookedDate), 'EEEE, MMMM dd, yyyy');
    } catch {
      // Keep raw value if parsing fails
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Appointment confirmed</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            You’re all set. Below is your booking summary.
          </p>

          <div className="mt-7 space-y-4">
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Reference</div>
              <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {referenceNumber || '—'}
              </div>
            </div>

            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Provider</div>
              {providerLoading ? (
                <div className="mt-1 flex items-center gap-2">
                  <CircularProgress size={20} />
                  <span className="text-slate-600 dark:text-slate-300">Loading…</span>
                </div>
              ) : (
                <>
                  <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {provider ? providerDisplayName(provider) : '—'}
                  </div>
                  {isAdmin && provider?.service && (
                    <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Service:</span>{' '}
                      {provider.service}
                    </div>
                  )}
                  {isAdmin && provider?.availability && (
                    <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Availability:</span>{' '}
                      {provider.availability}
                    </div>
                  )}
                </>
              )}
            </div>

            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400">When</div>
              <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
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
              onClick={() => router.push('/appointments/book')}
            >
              Book another appointment
            </Button>
          </div>
        </div>
    </main>
  );
}

export default function AppointmentConfirmationPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <AppointmentConfirmationContent />
    </Suspense>
  );
}
