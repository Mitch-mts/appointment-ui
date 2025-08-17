'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import { useRouter } from 'next/navigation';
import Navigation from '../../../components/Navigation.jsx';
import AppointmentCalendar from '../../../components/Calendar';
import { appointmentAPI } from '../../../lib/api';
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
import React from 'react';

export default function BookAppointmentPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // Auto-complete user details for non-admin users
  React.useEffect(() => {
    if (user && !isAdmin) {
      console.log('🔍 User object for auto-completion:', user);
      console.log('🔍 Available user fields:', Object.keys(user));
      
      // Try different possible field names for the user's name
      const userName = user.name || user.fullName || user.firstName || user.displayName || user.email?.split('@')[0] || '';
      const userEmail = user.email || '';
      
      console.log('🔍 Mapped userName:', userName);
      console.log('🔍 Mapped userEmail:', userEmail);
      
      setValue('fullName', userName);
      setValue('email', userEmail);
    }
  }, [user, isAdmin, setValue]);

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

      console.log(appointmentData);

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
      
      <Container maxWidth="xl" sx={{ py: 4, px: 2 }}>
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
            {isAdmin ? 'Book Appointment for Client' : 'Book Your Appointment'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isAdmin 
              ? 'Select a date and time and enter client details to book an appointment'
              : 'Select a date and time for your appointment'
            }
          </Typography>
        </Box>

        {/* How to Book Instructions - Moved to top */}
        <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>
            {isAdmin ? 'How to Book for Client' : 'How to Book'}
          </Typography>
          <Box component="ol" sx={{ pl: 0, m: 0 }}>
            {isAdmin ? [
              'Select an available date from the calendar',
              'Choose an available time slot',
              'Enter the client\'s full name and email address',
              'Add any optional notes or special requirements',
              'Click "Book Appointment" to confirm'
            ] : [
              'Select an available date from the calendar',
              'Choose an available time slot',
              'Review your automatically filled information',
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

        <Grid container spacing={6}>
          {/* Calendar Section */}
          <Grid item xs={12} lg={5}>
            <AppointmentCalendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onTimeSelect={handleTimeSelect}
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

              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {success}
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
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
                    {isAdmin ? 'Appointment Details' : 'Your Information'}
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
                  disabled={!selectedDate || !selectedTime || submitting}
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
                      {isAdmin ? 'Booking Appointment...' : 'Booking Your Appointment...'}
                    </Box>
                  ) : (
                    isAdmin ? 'Book Appointment for Client' : 'Book Your Appointment'
                  )}
                </Button>
              </form>
            </Paper>


          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
