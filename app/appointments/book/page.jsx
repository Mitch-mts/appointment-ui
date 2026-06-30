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
  Grid, 
  TextField, 
  Button, 
  Alert, 
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { 
  CalendarToday, 
  Schedule, 
  Message, 
  ArrowBack} from '@mui/icons-material';
import Link from 'next/link';

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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  const bookingSteps = isAdmin
    ? ['Provider', 'Date & time', 'Client details', 'Confirm']
    : ['Provider', 'Date & time', 'Your details', 'Confirm'];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

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
    const preferredId = fromQuery ? String(fromQuery.id) : String(providers[0].id);

    setSelectedProviderId((current) => {
      if (!providerInitDone.current) {
        providerInitDone.current = true;
        return preferredId;
      }
      if (fromQuery && current !== preferredId) return preferredId;
      if (current && providers.some((p) => String(p.id) === current)) return current;
      return preferredId;
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
    setActiveStep(0);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handlePreviewSubmit = (data) => {
    if (!selectedDate || !selectedTime) {
      setError('Please select a date and time');
      return;
    }

    // Validate that the selected time hasn't passed
    if (!isTimeSlotAvailable(selectedTime, selectedDate)) {
      setError('The selected time has already passed. Please select a different time.');
      return;
    }

    // Validate required fields
    if (!data.fullName || !data.email) {
      setError('Please fill in all required fields');
      return;
    }

    if (!selectedProvider) {
      setError('Please select a provider');
      return;
    }

    setError('');
    setConfirmData(data);
    setConfirmOpen(true);
  };

  const handleConfirmAppointment = async () => {
    if (!confirmData) return;

    if (!selectedProvider || !selectedDate || !selectedTime) {
      setError('Please complete provider, date, and time selection.');
      setConfirmOpen(false);
      return;
    }

    setSubmitting(true);
    setError('');

    let didSucceed = false;

    try {
      const appointmentData = {
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        fullName: confirmData.fullName,
        email: confirmData.email,
        providerId: Number(selectedProviderId) || selectedProviderId,
        notes: confirmData.notes?.trim() || undefined,
      };

      const response = await appointmentAPI.createAppointment(appointmentData);

      if (response?.success) {
        didSucceed = true;
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
      setConfirmOpen(!didSucceed);
    }
  };

  if (showAuthSpinner && !hasCachedSession()) {
    return (
      <Container maxWidth="xl" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  if (!ready) return null;

  return (
    <Container maxWidth="xl" sx={{ py: 4, px: 2 }}>
        <Box sx={{ mb: 4 }}>
          <Link href="/appointments" prefetch style={{ textDecoration: 'none' }}>
            <Button
              startIcon={<ArrowBack />}
              sx={{ mb: 2, color: 'primary.main' }}
            >
              Back to Appointments
            </Button>
          </Link>
          <Typography variant="h3" component="h1" gutterBottom>
            {isAdmin ? 'Book Appointment for Client' : 'Book Your Appointment'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isAdmin
              ? 'Select a provider, then pick a date and time for the client'
              : 'Select a provider, then pick a date and time for your appointment'}
          </Typography>
        </Box>

        <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {bookingSteps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        <Grid container spacing={4}>
          {/* Calendar Section */}
          <Grid item xs={12} lg={5}>
            <AppointmentCalendar
              providerId={selectedProviderId}
              provider={selectedProvider}
              selectedDate={selectedDate}
              onDateSelect={(d) => {
                handleDateSelect(d);
                if (selectedProviderId) setActiveStep(1);
              }}
              onTimeSelect={(t) => {
                handleTimeSelect(t);
                if (selectedProviderId && selectedDate) setActiveStep(2);
              }}
              selectedTime={selectedTime}
              showTimeSlots={true}
            />
          </Grid>

          {/* Booking Form */}
          <Grid item xs={12} lg={7}>
            <Paper elevation={3} sx={{ p: 5, borderRadius: 3, height: 'fit-content' }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Appointment Details
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit(handlePreviewSubmit)}>
                {/* Provider Selection */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 2, color: 'text.primary' }}>
                    Provider
                  </Typography>

                  {providersLoading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <CircularProgress size={22} />
                      <Typography variant="body2" color="text.secondary">
                        Loading providers…
                      </Typography>
                    </Box>
                  )}

                  {!providersLoading && providers.length === 0 && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      No providers are available. Please contact an administrator.
                    </Alert>
                  )}

                  <FormControl fullWidth disabled={providersLoading || providers.length === 0}>
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

                  {selectedProvider && (
                    <Box
                      sx={{
                        mt: 3,
                        p: 3,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                        {providerDisplayName(selectedProvider)}
                      </Typography>
                      {isAdmin && (
                        <>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            <strong>Service:</strong> {selectedProvider.service}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Availability:</strong>{' '}
                            {selectedProvider.availability || '—'}
                          </Typography>
                        </>
                      )}
                    </Box>
                  )}
                </Box>

                {/* Selected Date and Time Display - Side by Side */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 2, color: 'text.primary' }}>
                    Selected Date & Time
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 2.5, 
                        bgcolor: 'primary.50', 
                        borderRadius: 2,
                        border: '2px solid',
                        borderColor: selectedDate ? 'primary.main' : 'grey.300',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'primary.100'
                        }
                      }}>
                        <CalendarToday sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Selected Date
                          </Typography>
                          <Typography variant="body1" fontWeight="600" color="primary.main">
                            {selectedDate ? format(selectedDate, 'EEEE, MMMM dd, yyyy') : 'Not selected'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 2.5, 
                        bgcolor: 'primary.50', 
                        borderRadius: 2,
                        border: '2px solid',
                        borderColor: selectedTime ? 'primary.main' : 'grey.300',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'primary.100'
                        }
                      }}>
                        <Schedule sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Selected Time
                          </Typography>
                          <Typography variant="body1" fontWeight="600" color="primary.main">
                            {selectedTime || 'Not selected'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Personal Information Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'text.primary', display: 'flex', alignItems: 'center' }}>
                    <Message sx={{ mr: 1.5, color: 'primary.main' }} />
                    {isAdmin  ? 'Appointment Details' : 'Your Information'}
                  </Typography>
                  
                  {!isAdmin && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                      Your details have been automatically filled in. You can review and proceed to book your appointment.
                    </Alert>
                  )}
                  
                  {/* User Information Summary for Non-Admin Users */}
                  {!isAdmin && user && (
                    <Box sx={{ 
                      mb: 3, 
                      p: 3, 
                      bgcolor: 'success.50', 
                      borderRadius: 2, 
                      border: '1px solid',
                      borderColor: 'success.200'
                    }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'success.main', mb: 2 }}>
                        📋 Your Information Summary
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Name:</strong> {user.name || user.fullName || user.firstName || user.displayName || user.email?.split('@')[0] || 'Not available'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Email:</strong> {user.email || 'Not available'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                  
                  <Grid container spacing={3}>
                    {/* Full Name Field */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {isAdmin ? 'Full Name *' : 'Your Full Name'}
                        </Typography>
                        <TextField
                          {...register('fullName', { required: 'Full name is required' })}
                          fullWidth
                          placeholder={isAdmin ? "Enter full name" : "Your full name"}
                          variant="outlined"
                          error={!!errors.fullName}
                          helperText={errors.fullName?.message}
                          disabled={!isAdmin}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                              },
                              '&.Mui-disabled': {
                                backgroundColor: 'action.disabledBackground',
                                color: 'text.primary',
                              },
                            },
                          }}
                        />
                      </Box>
                    </Grid>

                    {/* Email Field */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {isAdmin ? 'Email Address *' : 'Your Email Address'}
                        </Typography>
                        <TextField
                          {...register('email', { 
                            required: 'Email is required',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Invalid email address'
                            }
                          })}
                          fullWidth
                          placeholder={isAdmin ? "Enter email address" : "Your email address"}
                          variant="outlined"
                          error={!!errors.email}
                          helperText={errors.email?.message}
                          disabled={!isAdmin}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                              },
                              '&.Mui-disabled': {
                                backgroundColor: 'action.disabledBackground',
                                color: 'text.primary',
                              },
                            },
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* Additional Notes Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'text.primary', display: 'flex', alignItems: 'center' }}>
                    <Message sx={{ mr: 1.5, color: 'primary.main' }} />
                    Additional Information
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Notes & Special Requirements
                    </Typography>
                    <TextField
                      {...register('notes')}
                      multiline
                      rows={4}
                      fullWidth
                      placeholder="Add booking notes, reason for booking, special requirements, or questions for your appointment..."
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                    />
                  </Box>
                </Box>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={
                    !selectedProviderId || !selectedDate || !selectedTime || submitting || confirmOpen
                  }
                  sx={{ 
                    py: 2, 
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: 3,
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {submitting ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                      Confirming...
                    </Box>
                  ) : (
                    isAdmin ? 'Confirm Appointment for Client' : 'Confirm Appointment'
                  )}
                </Button>
              </form>

              <Dialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                PaperProps={{
                  sx: {
                    borderRadius: 3,
                    minWidth: 420,
                    maxWidth: 520,
                  },
                }}
              >
                <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
                  Review & confirm
                </DialogTitle>

                <DialogContent sx={{ pt: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
                    {selectedProvider ? providerDisplayName(selectedProvider) : '—'}
                  </Typography>

                  {isAdmin && selectedProvider && (
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Service:</strong> {selectedProvider.service}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Availability:</strong> {selectedProvider.availability || '—'}
                      </Typography>
                    </>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Date:</strong>{' '}
                    {selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '—'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Time:</strong> {selectedTime || '—'}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      <strong>Name:</strong> {confirmData?.fullName || '—'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Email:</strong> {confirmData?.email || '—'}
                    </Typography>
                  </Box>

                  {confirmData?.notes && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Notes:</strong> {confirmData.notes}
                      </Typography>
                    </Box>
                  )}

                  {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {error}
                    </Alert>
                  )}
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setConfirmOpen(false)}
                    disabled={submitting}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleConfirmAppointment}
                    disabled={submitting}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                  >
                    {submitting ? 'Confirming...' : 'Confirm appointment'}
                  </Button>
                </DialogActions>
              </Dialog>
            </Paper>


          </Grid>
        </Grid>
      </Container>
  );
}

export default function BookAppointmentPage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="xl" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      }
    >
      <BookAppointmentPageContent />
    </Suspense>
  );
}
