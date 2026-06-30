'use client';

import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Box,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AppointmentCalendar from './Calendar';
import { appointmentAPI } from '../lib/api';
import { providerAPI, providerDisplayName, getProviderFromList } from '../lib/providers';
import { getAppointmentProviderId } from '../lib/appointmentHelpers';

export default function RescheduleDialog({
  open,
  onClose,
  appointment,
  onSuccess,
}) {
  const [providers, setProviders] = useState([]);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [providerId, setProviderId] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setProvidersLoading(true);
      try {
        const res = await providerAPI.listProviders();
        if (!cancelled && res?.success && Array.isArray(res.data)) {
          setProviders(res.data);
        }
      } catch {
        if (!cancelled) setProviders([]);
      } finally {
        if (!cancelled) setProvidersLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !appointment) return;

    const existingProviderId = getAppointmentProviderId(appointment);
    setProviderId(existingProviderId || '');

    try {
      const d = appointment.bookedDate
        ? parseISO(appointment.bookedDate)
        : null;
      setSelectedDate(d);
    } catch {
      setSelectedDate(null);
    }
    setSelectedTime(appointment.bookedTime || '');
    setError('');
  }, [open, appointment]);

  const selectedProvider = getProviderFromList(providers, providerId);

  const handleProviderChange = (id) => {
    setProviderId(id);
    setSelectedDate(null);
    setSelectedTime('');
  };

  const handleSubmit = async () => {
    if (!appointment?.id) return;
    if (!providerId || !selectedDate || !selectedTime) {
      setError('Please select a provider, date, and time.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await appointmentAPI.rescheduleAppointment(appointment.id, {
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        providerId: Number(providerId) || providerId,
      });

      if (response?.success) {
        onSuccess?.();
        onClose();
        return;
      }
      setError(response?.message || 'Could not reschedule. Please try again.');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Reschedule appointment</DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Current:{' '}
          <strong>
            {appointment?.bookedDate} at {appointment?.bookedTime}
          </strong>
        </Typography>

        {providersLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="reschedule-provider-label">Provider</InputLabel>
              <Select
                labelId="reschedule-provider-label"
                value={providerId}
                label="Provider"
                onChange={(e) => handleProviderChange(e.target.value)}
              >
                {providers.map((p) => (
                  <MenuItem key={p.id} value={String(p.id)}>
                    {providerDisplayName(p)} — {p.service}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <AppointmentCalendar
              providerId={providerId}
              provider={selectedProvider}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              onTimeSelect={setSelectedTime}
              selectedTime={selectedTime}
              showTimeSlots
            />
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || providersLoading}
        >
          {submitting ? 'Saving…' : 'Confirm new time'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
