'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation.jsx';
import AppointmentCalendar from '@/components/Calendar.jsx';
import { appointmentAPI } from '@/lib/api.js';
import { format } from 'date-fns';
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
  Chip,
  Divider
} from '@mui/material';
import { 
  CalendarToday, 
  Schedule, 
  Message, 
  ArrowBack,
  CheckCircle,
  Error
} from '@mui/icons-material';
import Link from 'next/link';

export default function BookAppointmentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const onSubmit = async (data) => {
    if (!selectedDate || !selectedTime) {
      setError('Please select a date and time');
      return;
    }

    // Validate required fields
    if (!data.fullName || !data.email) {
      setError('Please fill in all required fields');
      return;
    }

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const appointmentData = {
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        fullName: data.fullName,
        email: data.email,
        notes: data.notes || '',
      };

      const response = await appointmentAPI.createAppointment(appointmentData);
      if (response.success) {
        setSuccess('Appointment booked successfully! Redirecting...');
        setTimeout(() => {
          router.push('/appointments?success=true');
        }, 2000);
      } else {
        setError(response.message || 'Failed to book appointment');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.50'
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Navigation />
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Link href="/appointments" style={{ textDecoration: 'none' }}>
            <Button
              startIcon={<ArrowBack />}
              sx={{ mb: 2, color: 'primary.main' }}
            >
              Back to Appointments
            </Button>
          </Link>
          <Typography variant="h3" component="h1" gutterBottom>
            Book Appointment
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Select a date and time for your appointment
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Calendar Section */}
          <Grid item xs={12} lg={6}>
            <AppointmentCalendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onTimeSelect={handleTimeSelect}
              selectedTime={selectedTime}
              showTimeSlots={true}
            />
          </Grid>

          {/* Booking Form */}
          <Grid item xs={12} lg={6}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Appointment Details
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {success}
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Selected Date and Time Display */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 2, 
                    bgcolor: 'grey.50', 
                    borderRadius: 2,
                    mb: 2
                  }}>
                    <CalendarToday sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Selected Date
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedDate ? format(selectedDate, 'EEEE, MMMM dd, yyyy') : 'Not selected'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 2, 
                    bgcolor: 'grey.50', 
                    borderRadius: 2
                  }}>
                    <Schedule sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Selected Time
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedTime || 'Not selected'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Full Name Field */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Message sx={{ mr: 1, fontSize: 20 }} />
                    Full Name
                  </Typography>
                  <TextField
                    {...register('fullName', { required: 'Full name is required' })}
                    fullWidth
                    placeholder="Enter your full name"
                    variant="outlined"
                    error={!!errors.fullName}
                    helperText={errors.fullName?.message}
                  />
                </Box>

                {/* Email Field */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Message sx={{ mr: 1, fontSize: 20 }} />
                    Email Address
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
                    placeholder="Enter your email address"
                    variant="outlined"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                </Box>

                {/* Notes Field */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Message sx={{ mr: 1, fontSize: 20 }} />
                    Additional Notes
                  </Typography>
                  <TextField
                    {...register('notes')}
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Add any additional notes or special requirements"
                    variant="outlined"
                  />
                </Box>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={!selectedDate || !selectedTime || submitting}
                  sx={{ 
                    py: 1.5, 
                    borderRadius: 2,
                    fontSize: '1.1rem'
                  }}
                >
                  {submitting ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                      Booking Appointment...
                    </Box>
                  ) : (
                    'Book Appointment'
                  )}
                </Button>
              </form>
            </Paper>

            {/* Instructions */}
            <Paper elevation={1} sx={{ p: 3, mt: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom>
                How to Book
              </Typography>
              <Box component="ol" sx={{ pl: 0, m: 0 }}>
                {[
                  'Select an available date from the calendar',
                  'Choose an available time slot',
                  'Fill in your full name and email address',
                  'Add any optional notes or special requirements',
                  'Click "Book Appointment" to confirm'
                ].map((step, index) => (
                  <Box
                    key={index}
                    component="li"
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      mb: 2,
                      listStyle: 'none'
                    }}
                  >
                    <Chip
                      label={index + 1}
                      size="small"
                      sx={{
                        mr: 2,
                        mt: 0.5,
                        bgcolor: 'primary.main',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {step}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
