'use client';

import { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  parseISO,
} from 'date-fns';
import { formatTime } from '../lib/utils';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Normalize API date to a local calendar day key (yyyy-MM-dd). */
function appointmentDateKey(bookedDate) {
  if (!bookedDate) return null;
  try {
    let d;
    if (typeof bookedDate === 'string') {
      const s = bookedDate.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const [y, m, day] = s.split('-').map(Number);
        d = new Date(y, m - 1, day);
      } else {
        d = parseISO(s);
      }
    } else {
      d = new Date(bookedDate);
    }
    if (Number.isNaN(d.getTime())) return null;
    return format(d, 'yyyy-MM-dd');
  } catch {
    return null;
  }
}

function buildAppointmentsByDay(appointments) {
  const map = {};
  for (const apt of appointments) {
    const key = appointmentDateKey(apt.bookedDate);
    if (!key) continue;
    if (!map[key]) map[key] = [];
    map[key].push(apt);
  }
  for (const key of Object.keys(map)) {
    map[key].sort((a, b) => {
      const ta = (a.bookedTime || '').localeCompare(b.bookedTime || '');
      return ta;
    });
  }
  return map;
}

function AppointmentDayTooltip({ appointments }) {
  return (
    <Box
      sx={{
        py: 0.25,
        maxWidth: 280,
        // Tooltip surface uses light-on-dark; Typography defaults to text.primary and would be unreadable.
        color: 'inherit',
        '& .MuiTypography-root': { color: 'inherit' },
      }}
    >
      {appointments.map((apt) => (
        <Box
          key={apt.id}
          sx={{
            mb: 1,
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'rgba(255,255,255,0.2)',
            '&:last-child': { mb: 0, pb: 0, borderBottom: 'none' },
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {apt.fullName || 'Appointment'}
          </Typography>
          <Typography variant="caption" component="div" sx={{ opacity: 0.95, display: 'block' }}>
            {apt.bookedTime ? formatTime(apt.bookedTime) : 'Time TBD'}
            {apt.bookingStatus ? ` · ${apt.bookingStatus}` : ''}
          </Typography>
          {apt.referenceNumber && (
            <Typography variant="caption" component="div" sx={{ opacity: 0.85, display: 'block' }}>
              Ref: {apt.referenceNumber}
            </Typography>
          )}
          {apt.notes && (
            <Typography
              variant="caption"
              component="div"
              sx={{
                opacity: 0.85,
                mt: 0.25,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {apt.notes}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
}

export default function DashboardCalendar({ appointments = [], loading = false }) {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));

  const byDay = useMemo(() => buildAppointmentsByDay(appointments), [appointments]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(viewMonth);
    const monthEnd = endOfMonth(viewMonth);
    const start = startOfWeek(monthStart, { weekStartsOn: 0 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [viewMonth]);

  const monthLabel = format(viewMonth, 'MMMM yyyy');

  const goPrev = () => setViewMonth((d) => addMonths(d, -1));
  const goNext = () => setViewMonth((d) => addMonths(d, 1));
  const goToday = () => setViewMonth(startOfMonth(new Date()));

  return (
    <Card elevation={3} sx={{ mb: 4 }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              {monthLabel}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Booking calendar
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton aria-label="Previous month" onClick={goPrev} size="small">
              <ChevronLeftIcon />
            </IconButton>
            <Typography
              component="button"
              type="button"
              onClick={goToday}
              sx={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                font: 'inherit',
                color: 'primary.main',
                textDecoration: 'underline',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              Today
            </Typography>
            <IconButton aria-label="Next month" onClick={goNext} size="small">
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                gap: { xs: 0.5, sm: 1 },
              }}
            >
              {WEEKDAYS.map((wd) => (
                <Typography
                  key={wd}
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    textAlign: 'center',
                    color: 'text.secondary',
                    py: 0.5,
                  }}
                >
                  {wd}
                </Typography>
              ))}

              {calendarDays.map((day) => {
                const key = format(day, 'yyyy-MM-dd');
                const dayAppointments = byDay[key] || [];
                const inMonth = isSameMonth(day, viewMonth);
                const today = isToday(day);
                const count = dayAppointments.length;

                const cell = (
                  <Box
                    sx={{
                      minHeight: { xs: 56, sm: 72 },
                      p: { xs: 0.5, sm: 1 },
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: today ? 'primary.main' : 'divider',
                      bgcolor: inMonth ? 'background.paper' : 'action.hover',
                      color: inMonth ? 'text.primary' : 'text.disabled',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      pt: 0.75,
                      ...(count > 0 && {
                        bgcolor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(59, 130, 246, 0.12)'
                            : 'rgba(59, 130, 246, 0.08)',
                        borderColor: 'primary.light',
                      }),
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: today ? 700 : 500,
                        lineHeight: 1.2,
                      }}
                    >
                      {format(day, 'd')}
                    </Typography>
                    {count > 0 && (
                      <Box
                        sx={{
                          mt: 'auto',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.25,
                          flexWrap: 'wrap',
                          pb: 0.25,
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                          }}
                        />
                        {count > 1 && (
                          <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
                            +{count - 1}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                );

                if (count === 0) {
                  return (
                    <Box key={key}>
                      {cell}
                    </Box>
                  );
                }

                return (
                  <Tooltip
                    key={key}
                    title={<AppointmentDayTooltip appointments={dayAppointments} />}
                    enterDelay={200}
                    enterNextDelay={200}
                    placement="top"
                    slotProps={{
                      tooltip: {
                        sx: {
                          color: 'common.white',
                          '& .MuiTypography-root': { color: 'inherit' },
                        },
                      },
                      popper: {
                        sx: { zIndex: (theme) => theme.zIndex.tooltip },
                      },
                    }}
                  >
                    <Box sx={{ cursor: 'default', display: 'block', width: '100%' }}>{cell}</Box>
                  </Tooltip>
                );
              })}
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              Days with bookings are highlighted. Hover a day to see appointment details.
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
}
