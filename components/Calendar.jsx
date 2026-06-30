'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Calendar from 'react-calendar';
import { format, isSameDay, isToday, isAfter, startOfDay } from 'date-fns';
import { appointmentAPI } from '../lib/api';
import { isTimeSlotAvailable } from '../lib/utils';
import {
  buildClientAvailabilityCalendar,
  mergeAvailabilityCalendars,
  getSlotsForDate,
  isDateBookable,
} from '../lib/slotAvailability';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Schedule } from '@mui/icons-material';
import 'react-calendar/dist/Calendar.css';

function getEndOfCurrentYear() {
  const y = new Date().getFullYear();
  return new Date(y, 11, 31);
}

export default function AppointmentCalendar({
  selectedDate,
  onDateSelect,
  onTimeSelect,
  selectedTime,
  showTimeSlots = false,
  providerId = null,
  provider = null,
  disabledDates = [],
}) {
  const [availabilityCalendar, setAvailabilityCalendar] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const loadedForProviderRef = useRef(null);

  const maxDate = getEndOfCurrentYear();

  useEffect(() => {
    if (!providerId) {
      setAvailabilityCalendar([]);
      setLoadError('');
      setLoading(false);
      loadedForProviderRef.current = null;
      return;
    }

    let cancelled = false;
    const showLoadingSpinner = loadedForProviderRef.current !== providerId;

    const fetchAvailability = async () => {
      if (showLoadingSpinner) setLoading(true);
      setLoadError('');
      const startDate = format(new Date(), 'yyyy-MM-dd');
      const endDate = format(maxDate, 'yyyy-MM-dd');

      const clientCalendar = buildClientAvailabilityCalendar(
        provider,
        startDate,
        endDate
      );

      try {
        const response = await appointmentAPI.getAvailableDates(
          startDate,
          endDate,
          providerId
        );

        if (cancelled) return;

        if (response?.success && Array.isArray(response.data)) {
          setAvailabilityCalendar(
            mergeAvailabilityCalendars(response.data, clientCalendar)
          );
        } else {
          setAvailabilityCalendar(clientCalendar);
          setLoadError(
            'Showing times from provider schedule. Live availability will apply when the server is updated.'
          );
        }
        if (!cancelled) loadedForProviderRef.current = providerId;
      } catch {
        if (!cancelled) {
          setAvailabilityCalendar(clientCalendar);
          setLoadError(
            'Could not reach the server. Times are based on the provider schedule only.'
          );
          loadedForProviderRef.current = providerId;
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAvailability();

    return () => {
      cancelled = true;
    };
  }, [providerId, provider, maxDate]);

  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return getSlotsForDate(availabilityCalendar, selectedDate);
  }, [availabilityCalendar, selectedDate]);

  const isDateAvailable = (date) => {
    if (isAfter(startOfDay(new Date()), startOfDay(date))) return false;
    if (date.getFullYear() > new Date().getFullYear()) return false;
    if (!providerId) return false;
    return isDateBookable(availabilityCalendar, date);
  };

  const tileClassName = ({ date }) => {
    const base = 'p-2 text-center rounded-md text-sm';

    if (selectedDate && isSameDay(date, selectedDate)) {
      return `${base} !bg-sky-600 !text-white`;
    }

    if (!providerId) {
      return `${base} opacity-40 cursor-not-allowed`;
    }

    if (isDateAvailable(date)) {
      return `${base} bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-200 cursor-pointer`;
    }

    if (disabledDates.some((d) => isSameDay(date, d))) {
      return `${base} bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800`;
    }

    if (isAfter(startOfDay(new Date()), startOfDay(date))) {
      return `${base} bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800`;
    }

    return `${base} text-slate-400 cursor-not-allowed`;
  };

  const tileDisabled = ({ date }) =>
    !providerId ||
    !isDateAvailable(date) ||
    disabledDates.some((d) => isSameDay(date, d)) ||
    isAfter(startOfDay(new Date()), startOfDay(date));

  const handleDateChange = (value) => {
    if (value instanceof Date) onDateSelect(value);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={700}>
          Choose a date
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {providerId
            ? 'Green dates have open times for your selected provider.'
            : 'Select a provider first to see available dates.'}
        </Typography>

        {!providerId && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Pick a provider in the form to load the calendar.
          </Alert>
        )}

        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileClassName={tileClassName}
          tileDisabled={tileDisabled}
          minDate={new Date()}
          maxDate={maxDate}
          className="w-full border-0"
          showNavigation
          showNeighboringMonth={false}
          locale="en-US"
        />

        {loadError && providerId && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {loadError}
          </Alert>
        )}
      </Paper>

      {showTimeSlots && selectedDate && providerId && (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
          <Typography
            variant="h6"
            gutterBottom
            fontWeight={700}
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <Schedule color="primary" />
            Times for {format(selectedDate, 'EEEE, MMM d')}
          </Typography>

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={36} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading available times…
              </Typography>
            </Box>
          ) : slotsForSelectedDate.length === 0 ? (
            <Alert severity="info">
              No open times on this day. Try another date.
            </Alert>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: 1.5,
              }}
            >
              {slotsForSelectedDate.map((slot) => {
                const selected = selectedTime === slot.time;
                const past = !isTimeSlotAvailable(slot.time, selectedDate);
                return (
                  <Button
                    key={slot.time}
                    onClick={() => onTimeSelect?.(slot.time)}
                    disabled={past || !slot.available}
                    variant={selected ? 'contained' : 'outlined'}
                    size="medium"
                    sx={{
                      py: 1.25,
                      fontWeight: selected ? 700 : 500,
                      borderRadius: 2,
                    }}
                  >
                    {slot.time}
                  </Button>
                );
              })}
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}
