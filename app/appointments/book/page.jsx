'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRequireAuth } from '../../../hooks/useRequireAuth.js';
import { hasCachedSession } from '../../../lib/sessionUser.js';
import AppointmentCalendar from '../../../components/Calendar';
import { appointmentAPI } from '../../../lib/api';
import {
  providerAPI,
  providerDisplayName,
  getProviderFromList,
} from '../../../lib/providers.js';
import { format } from 'date-fns';
import { isTimeSlotAvailable } from '../../../lib/utils';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stepper,
  Step,
  StepLabel,
  Stack,
  Chip,
} from '@mui/material';
import {
  CalendarToday,
  Schedule,
  Message,
  ArrowBack,
  ArrowForward,
  CheckCircle,
} from '@mui/icons-material';
import Link from 'next/link';

const STEP_PROVIDER = 0;
const STEP_SCHEDULE = 1;
const STEP_DETAILS = 2;
const STEP_CONFIRM = 3;

function BookAppointmentPageContent() {
  const { user, isAdmin } = useAuth();
  const { showAuthSpinner, ready } = useRequireAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const providerInitDone = useRef(false);

  const [providers, setProviders] = useState([]);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(STEP_PROVIDER);

  const bookingSteps = isAdmin
    ? ['Provider', 'Date & time', 'Client details', 'Confirm']
    : ['Provider', 'Date & time', 'Your details', 'Confirm'];

  const {
    register,
    trigger,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: { fullName: '', email: '', notes: '' },
  });

  useEffect(() => {
    if (user && !isAdmin) {
      const userName =
        user.fullName ||
        user.name ||
        user.firstName ||
        user.displayName ||
        user.email?.split('@')[0] ||
        '';
      setValue('fullName', userName);
      setValue('email', user.email || '');
    }
  }, [user, isAdmin, setValue]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setProvidersLoading(true);
      try {
        const res = await providerAPI.listProviders();
        if (!cancelled && res?.success && Array.isArray(res.data)) {
          setProviders(res.data);
        } else if (!cancelled) {
          setProviders([]);
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
  }, []);

  useEffect(() => {
    if (providers.length === 0) return;

    const queryProviderId = searchParams.get('providerId');
    const fromQuery = providers.find((p) => String(p.id) === String(queryProviderId));

    setSelectedProviderId((current) => {
      if (!providerInitDone.current) {
        providerInitDone.current = true;
        if (fromQuery) return String(fromQuery.id);
        return current || '';
      }
      if (fromQuery && current !== String(fromQuery.id)) return String(fromQuery.id);
      if (current && providers.some((p) => String(p.id) === current)) return current;
      return current || '';
    });
  }, [providers, searchParams]);

  const selectedProvider = useMemo(
    () => getProviderFromList(providers, selectedProviderId),
    [providers, selectedProviderId]
  );

  const handleProviderChange = (id) => {
    const next = String(id);
    if (next === selectedProviderId) return;
    setSelectedProviderId(next);
    setSelectedDate(null);
    setSelectedTime('');
    setError('');
  };

  const goBack = () => {
    setError('');
    setActiveStep((step) => Math.max(STEP_PROVIDER, step - 1));
  };

  const goNext = async () => {
    setError('');

    if (activeStep === STEP_PROVIDER) {
      if (!selectedProviderId || !selectedProvider) {
        setError('Please select a provider to continue.');
        return;
      }
      setActiveStep(STEP_SCHEDULE);
      return;
    }

    if (activeStep === STEP_SCHEDULE) {
      if (!selectedDate || !selectedTime) {
        setError('Please select both a date and a time to continue.');
        return;
      }
      if (!isTimeSlotAvailable(selectedTime, selectedDate)) {
        setError('The selected time has already passed. Please choose another time.');
        return;
      }
      setActiveStep(STEP_DETAILS);
      return;
    }

    if (activeStep === STEP_DETAILS) {
      const valid = await trigger(['fullName', 'email']);
      if (!valid) {
        setError('Please fill in all required fields.');
        return;
      }
      setActiveStep(STEP_CONFIRM);
    }
  };

  const handleConfirmAppointment = async () => {
    const details = getValues();

    if (!selectedProvider || !selectedDate || !selectedTime) {
      setError('Please complete provider, date, and time selection.');
      setActiveStep(STEP_PROVIDER);
      return;
    }

    if (!details.fullName || !details.email) {
      setError('Please fill in all required fields.');
      setActiveStep(STEP_DETAILS);
      return;
    }

    if (!isTimeSlotAvailable(selectedTime, selectedDate)) {
      setError('The selected time has already passed. Please choose another time.');
      setActiveStep(STEP_SCHEDULE);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const appointmentData = {
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        fullName: details.fullName,
        email: details.email,
        providerId: Number(selectedProviderId) || selectedProviderId,
        notes: details.notes?.trim() || undefined,
      };

      const response = await appointmentAPI.createAppointment(appointmentData);

      if (response?.success) {
        const created = response.data || {};
        const referenceNumber =
          created.referenceNumber ||
          created.reference ||
          response.referenceNumber ||
          '';

        router.push(
          `/appointments/confirmation?referenceNumber=${encodeURIComponent(
            referenceNumber || ''
          )}&providerId=${encodeURIComponent(selectedProviderId)}&appointmentId=${encodeURIComponent(
            created.id || ''
          )}&date=${encodeURIComponent(
            format(selectedDate, 'yyyy-MM-dd')
          )}&time=${encodeURIComponent(selectedTime)}`
        );
        return;
      }

      setError(response?.message || 'Failed to book appointment');
    } catch (err) {
      console.error('Booking error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (showAuthSpinner && !hasCachedSession()) {
    return (
      <Container maxWidth="md" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  if (!ready) return null;

  const details = getValues();
  const canContinueFromStep =
    activeStep === STEP_PROVIDER
      ? Boolean(selectedProviderId)
      : activeStep === STEP_SCHEDULE
        ? Boolean(selectedDate && selectedTime)
        : true;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 4 }, px: 2, pb: 8 }}>
      <Box sx={{ mb: 3 }}>
        <Link href="/appointments" prefetch style={{ textDecoration: 'none' }}>
          <Button startIcon={<ArrowBack />} sx={{ mb: 1.5, color: 'primary.main' }}>
            Back to Appointments
          </Button>
        </Link>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          {isAdmin ? 'Book Appointment for Client' : 'Book Your Appointment'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Complete each step to finish your booking.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {bookingSteps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {(selectedProvider || selectedDate || selectedTime) && activeStep > STEP_PROVIDER && (
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
          {selectedProvider && (
            <Chip
              size="small"
              label={providerDisplayName(selectedProvider)}
              onClick={() => setActiveStep(STEP_PROVIDER)}
              variant="outlined"
            />
          )}
          {selectedDate && (
            <Chip
              size="small"
              icon={<CalendarToday sx={{ fontSize: 16 }} />}
              label={format(selectedDate, 'MMM d, yyyy')}
              onClick={() => setActiveStep(STEP_SCHEDULE)}
              variant="outlined"
            />
          )}
          {selectedTime && (
            <Chip
              size="small"
              icon={<Schedule sx={{ fontSize: 16 }} />}
              label={selectedTime}
              onClick={() => setActiveStep(STEP_SCHEDULE)}
              variant="outlined"
            />
          )}
        </Stack>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={2}
        sx={{
          p: { xs: 2.5, sm: 4 },
          borderRadius: 3,
          minHeight: { xs: 360, sm: 420 },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Step 1: Provider */}
        {activeStep === STEP_PROVIDER && (
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Choose a provider
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select who you want to book with.
            </Typography>

            {providersLoading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 4 }}>
                <CircularProgress size={24} />
                <Typography variant="body2" color="text.secondary">
                  Loading providers…
                </Typography>
              </Box>
            )}

            {!providersLoading && providers.length === 0 && (
              <Alert severity="warning">
                No providers are available. Please contact an administrator.
              </Alert>
            )}

            {!providersLoading && providers.length > 0 && (
              <FormControl fullWidth>
                <InputLabel id="provider-select-label">Choose provider</InputLabel>
                <Select
                  labelId="provider-select-label"
                  value={selectedProviderId}
                  label="Choose provider"
                  onChange={(e) => handleProviderChange(e.target.value)}
                >
                  {providers.map((p) => (
                    <MenuItem key={p.id} value={String(p.id)}>
                      {providerDisplayName(p)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {selectedProvider && (
              <Box
                sx={{
                  mt: 3,
                  p: 3,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'action.hover',
                }}
              >
                <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                  {providerDisplayName(selectedProvider)}
                </Typography>
                {selectedProvider.service && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    <strong>Service:</strong> {selectedProvider.service}
                  </Typography>
                )}
                {selectedProvider.availability && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Availability:</strong> {selectedProvider.availability}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )}

        {/* Step 2: Date & time */}
        {activeStep === STEP_SCHEDULE && (
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Pick a date & time
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Available times are shown for {providerDisplayName(selectedProvider) || 'your provider'}.
            </Typography>

            <AppointmentCalendar
              providerId={selectedProviderId}
              provider={selectedProvider}
              selectedDate={selectedDate}
              onDateSelect={(d) => {
                setSelectedDate(d);
                setSelectedTime('');
                setError('');
              }}
              onTimeSelect={(t) => {
                setSelectedTime(t);
                setError('');
              }}
              selectedTime={selectedTime}
              showTimeSlots
            />
          </Box>
        )}

        {/* Step 3: Details */}
        {activeStep === STEP_DETAILS && (
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {isAdmin ? 'Client details' : 'Your details'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {isAdmin
                ? 'Enter the client information for this appointment.'
                : 'Confirm your information and add any notes.'}
            </Typography>

            {!isAdmin && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Your account details are filled in automatically. You can still add notes below.
              </Alert>
            )}

            <Stack spacing={2.5}>
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  {isAdmin ? 'Full name *' : 'Your full name'}
                </Typography>
                <TextField
                  {...register('fullName', { required: 'Full name is required' })}
                  fullWidth
                  placeholder={isAdmin ? 'Enter full name' : 'Your full name'}
                  error={!!errors.fullName}
                  helperText={errors.fullName?.message}
                  disabled={!isAdmin}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  {isAdmin ? 'Email address *' : 'Your email address'}
                </Typography>
                <TextField
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  fullWidth
                  placeholder={isAdmin ? 'Enter email address' : 'Your email address'}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={!isAdmin}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Message fontSize="small" color="primary" />
                  Notes (optional)
                </Typography>
                <TextField
                  {...register('notes')}
                  multiline
                  rows={4}
                  fullWidth
                  placeholder="Reason for visit, special requirements, or questions…"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>
            </Stack>
          </Box>
        )}

        {/* Step 4: Confirm */}
        {activeStep === STEP_CONFIRM && (
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Review & confirm
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Check everything looks right, then confirm your booking.
            </Typography>

            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'action.hover',
              }}
            >
              <Stack spacing={1.5}>
                <Typography variant="subtitle1" fontWeight={800}>
                  {selectedProvider ? providerDisplayName(selectedProvider) : '—'}
                </Typography>
                {isAdmin && selectedProvider?.service && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Service:</strong> {selectedProvider.service}
                  </Typography>
                )}
                <Divider />
                <Typography variant="body2" color="text.secondary">
                  <strong>Date:</strong>{' '}
                  {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Time:</strong> {selectedTime || '—'}
                </Typography>
                <Divider />
                <Typography variant="body2" color="text.secondary">
                  <strong>Name:</strong> {details.fullName || '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Email:</strong> {details.email || '—'}
                </Typography>
                {details.notes?.trim() && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Notes:</strong> {details.notes}
                  </Typography>
                )}
              </Stack>
            </Box>
          </Box>
        )}

        {/* Wizard navigation */}
        <Divider sx={{ my: 3 }} />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={goBack}
            disabled={activeStep === STEP_PROVIDER || submitting}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, minWidth: 120 }}
          >
            Back
          </Button>

          {activeStep < STEP_CONFIRM ? (
            <Button
              variant="contained"
              endIcon={<ArrowForward />}
              onClick={goNext}
              disabled={!canContinueFromStep || submitting}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, minWidth: 140 }}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <CheckCircle />}
              onClick={handleConfirmAppointment}
              disabled={submitting}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, minWidth: 180 }}
            >
              {submitting ? 'Confirming…' : 'Confirm appointment'}
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default function BookAppointmentPage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="md" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      }
    >
      <BookAppointmentPageContent />
    </Suspense>
  );
}
