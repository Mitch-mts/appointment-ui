'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { addDays, format, isSameDay, isAfter, startOfDay } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV2';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
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
  Stack,
  Chip,
} from '@mui/material';
import { Schedule, CalendarMonth } from '@mui/icons-material';

/** Bookable window — shorter range keeps the wizard focused. */
const BOOKING_WINDOW_DAYS = 90;

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function AvailableDay(props) {
  const { day, outsideCurrentMonth, selected, isAvailable, ...other } = props;

  return (
    <PickersDay
      {...other}
      day={day}
      outsideCurrentMonth={outsideCurrentMonth}
      selected={selected}
      sx={(theme) => {
        if (selected) {
          return {
            bgcolor: `${theme.palette.primary.main} !important`,
            color: `${theme.palette.primary.contrastText} !important`,
            fontWeight: 700,
            '&:hover': { bgcolor: `${theme.palette.primary.dark} !important` },
          };
        }
        if (isAvailable) {
          return {
            bgcolor:
              theme.palette.mode === 'dark'
                ? 'rgba(46, 125, 50, 0.35)'
                : 'rgba(232, 245, 233, 1)',
            color:
              theme.palette.mode === 'dark'
                ? theme.palette.success.light
                : theme.palette.success.dark,
            fontWeight: 600,
            border: `1px solid ${
              theme.palette.mode === 'dark'
                ? 'rgba(102, 187, 106, 0.45)'
                : 'rgba(129, 199, 132, 0.9)'
            }`,
            '&:hover': {
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(46, 125, 50, 0.55)'
                  : 'rgba(200, 230, 201, 1)',
            },
          };
        }
        return {};
      }}
    />
  );
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
  const loadedForProviderRef = useRef(null);

  const minDate = useMemo(() => startOfToday(), []);
  const maxDate = useMemo(() => addDays(startOfToday(), BOOKING_WINDOW_DAYS), []);
  const providerScheduleKey = useMemo(
    () =>
      provider
        ? JSON.stringify({
            id: provider.id,
            schedule: provider.schedule ?? provider.workingHours ?? null,
            availability: provider.availability ?? null,
            slotDuration: provider.slotDuration ?? provider.appointmentDuration ?? null,
          })
        : '',
    [provider]
  );

  useEffect(() => {
    if (!providerId) {
      setAvailabilityCalendar([]);
      setLoading(false);
      loadedForProviderRef.current = null;
      return;
    }

    let cancelled = false;
    const startDate = format(minDate, 'yyyy-MM-dd');
    const endDate = format(maxDate, 'yyyy-MM-dd');

    // Instant schedule-based slots so the wizard never blocks on a missing API.
    const clientCalendar = buildClientAvailabilityCalendar(
      provider,
      startDate,
      endDate
    );
    setAvailabilityCalendar(clientCalendar);

    const shouldShowSpinner = loadedForProviderRef.current !== providerId;
    if (shouldShowSpinner) setLoading(true);

    (async () => {
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
        }
        // Soft-fail: keep provider schedule; never show a server-unreachable alert.
      } catch {
        // Keep clientCalendar already set above.
      } finally {
        if (!cancelled) {
          setLoading(false);
          loadedForProviderRef.current = providerId;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- provider via providerScheduleKey
  }, [providerId, providerScheduleKey, maxDate, minDate]);

  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return getSlotsForDate(availabilityCalendar, selectedDate);
  }, [availabilityCalendar, selectedDate]);

  const isDateAvailable = useCallback(
    (date) => {
      if (isAfter(startOfDay(new Date()), startOfDay(date))) return false;
      if (isAfter(startOfDay(date), startOfDay(maxDate))) return false;
      if (!providerId) return false;
      if (disabledDates.some((d) => isSameDay(date, d))) return false;
      return isDateBookable(availabilityCalendar, date);
    },
    [availabilityCalendar, disabledDates, maxDate, providerId]
  );

  const shouldDisableDate = useCallback(
    (date) => !isDateAvailable(date),
    [isDateAvailable]
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <CalendarMonth color="primary" />
            <Typography variant="h6" fontWeight={700}>
              Choose a date
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {providerId
              ? 'Green dates have open times. Your selection uses the app primary color.'
              : 'Select a provider first to see available dates.'}
          </Typography>

          {!providerId && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Pick a provider to load the calendar.
            </Alert>
          )}

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(15, 23, 42, 0.55)'
                  : theme.palette.grey[50],
              py: 1,
              position: 'relative',
              minHeight: 340,
            }}
          >
            {loading && providerId && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(255,255,255,0.35)',
                  zIndex: 1,
                  borderRadius: 2.5,
                }}
              >
                <CircularProgress size={32} />
              </Box>
            )}

            <DateCalendar
              value={selectedDate}
              onChange={(value) => {
                if (value instanceof Date) onDateSelect(value);
              }}
              minDate={minDate}
              maxDate={maxDate}
              disabled={!providerId}
              shouldDisableDate={shouldDisableDate}
              slots={{ day: AvailableDay }}
              slotProps={{
                day: (ownerState) => ({
                  isAvailable: isDateAvailable(ownerState.day),
                }),
              }}
              sx={{
                width: '100%',
                maxWidth: 360,
                '& .MuiPickersCalendarHeader-root': {
                  px: 1.5,
                  mt: 0.5,
                },
                '& .MuiPickersCalendarHeader-label': {
                  fontWeight: 700,
                },
                '& .MuiDayCalendar-weekDayLabel': {
                  fontWeight: 700,
                  color: 'text.secondary',
                },
                '& .MuiPickersDay-root': {
                  fontWeight: 600,
                },
              }}
            />
          </Box>

          {providerId && (
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 2 }}>
              <Chip
                size="small"
                label="Available"
                sx={{
                  bgcolor: (t) =>
                    t.palette.mode === 'dark' ? 'success.dark' : 'success.light',
                  color: 'success.contrastText',
                }}
              />
              <Chip size="small" color="primary" label="Selected" />
              <Chip size="small" variant="outlined" label="Unavailable" />
            </Stack>
          )}

          {selectedDate && (
            <Alert
              severity="success"
              icon={<CalendarMonth fontSize="inherit" />}
              sx={{ mt: 2 }}
            >
              Selected: <strong>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</strong>
            </Alert>
          )}
        </Paper>

        {showTimeSlots && selectedDate && providerId && (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              fontWeight={700}
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Schedule color="primary" />
              Times for {format(selectedDate, 'EEEE, MMM d')}
            </Typography>

            {slotsForSelectedDate.length === 0 ? (
              <Alert severity="info">
                No open times on this day. Try another date.
              </Alert>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
                  gap: 1.5,
                  mt: 1,
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
                        fontWeight: selected ? 700 : 600,
                        borderRadius: 2,
                      }}
                    >
                      {slot.time}
                    </Button>
                  );
                })}
              </Box>
            )}

            {selectedTime && (
              <Alert
                severity="success"
                icon={<Schedule fontSize="inherit" />}
                sx={{ mt: 2 }}
              >
                Selected time: <strong>{selectedTime}</strong>
              </Alert>
            )}
          </Paper>
        )}
      </Box>
    </LocalizationProvider>
  );
}
