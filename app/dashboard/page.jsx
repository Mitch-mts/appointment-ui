'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useRouter } from 'next/navigation';
import Navigation from '../../components/Navigation.jsx';
import { appointmentAPI } from '../../lib/api.js';
import { formatDate, formatTime, isToday } from '../../lib/utils.js';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Schedule as ClockIcon,
  Add as PlusIcon,
  People as UsersIcon,
  TrendingUp as TrendingUpIcon,
  Cancel as CancelIcon,
  Event as EventIcon,
  CheckCircle,
} from '@mui/icons-material';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [welcomeDialogOpen, setWelcomeDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchAppointments();
      
      // Check if this is the user's first login
      const hasSeenWelcome = localStorage.getItem(`welcome-${user.email}`);
      if (!hasSeenWelcome) {
        setWelcomeDialogOpen(true);
        // Mark that the user has seen the welcome dialog
        localStorage.setItem(`welcome-${user.email}`, 'true');
      }
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      let response;
      if (isAdmin) {
        // Admin sees all appointments
        response = await appointmentAPI.getAllAppointments();
      } else {
        // Regular users see only their own appointments
        response = await appointmentAPI.getUserAppointments(user.email);
      }
      
      if (response.success && response.data) {
        setAppointments(response.data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    try {
      const response = await appointmentAPI.cancelAppointment(id);
      if (response.success) {
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error canceling appointment:', error);
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
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  // Filter appointments for current day only
  const todayAppointments = appointments.filter(apt => {
    if (!apt.bookedDate) return false;
    
    // Debug logging
    console.log('Checking appointment:', apt.fullName, 'Date:', apt.bookedDate, 'Type:', typeof apt.bookedDate);
    
    try {
      // Handle different date formats
      let dateObj;
      if (typeof apt.bookedDate === 'string') {
        dateObj = new Date(apt.bookedDate);
      } else if (apt.bookedDate instanceof Date) {
        dateObj = apt.bookedDate;
      } else {
        console.log('Invalid date format for:', apt.fullName);
        return false;
      }
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        console.log('Invalid date object for:', apt.fullName);
        return false;
      }
      
      // Custom today comparison
      const today = new Date();
      const isTodayResult = dateObj.getDate() === today.getDate() &&
                           dateObj.getMonth() === today.getMonth() &&
                           dateObj.getFullYear() === today.getFullYear();
      
      console.log('Is today result for', apt.fullName, ':', isTodayResult);
      console.log('Appointment date:', dateObj.toDateString(), 'Today:', today.toDateString());
      
      return isTodayResult;
    } catch (error) {
      console.error('Error processing date for appointment:', apt.fullName, error);
      return false;
    }
  });

  console.log('Today appointments found:', todayAppointments.length);
  console.log('All appointments:', appointments.length);

  const upcomingAppointments = todayAppointments.filter(apt => {
    // If status is CANCELLED, don't show in upcoming
    if (apt.bookingStatus === "CANCELLED") return false;
    
    // If it's today and has a time, check if the time has passed
    if (apt.bookedDate && apt.bookedTime) {
      try {
        const now = new Date();
        const today = new Date();
        const appointmentDate = new Date(apt.bookedDate);
        
        // Check if it's today
        if (appointmentDate.getDate() === today.getDate() &&
            appointmentDate.getMonth() === today.getMonth() &&
            appointmentDate.getFullYear() === today.getFullYear()) {
          
          // Parse the time (assuming format like "14:30" or "2:30 PM")
          let timeStr = apt.bookedTime;
          let appointmentHour, appointmentMinute;
          
          if (timeStr.includes(':')) {
            const timeParts = timeStr.split(':');
            appointmentHour = parseInt(timeParts[0]);
            appointmentMinute = parseInt(timeParts[1]);
          } else if (timeStr.includes(' ')) {
            // Handle "2:30 PM" format
            const timeParts = timeStr.split(' ');
            const hourMinute = timeParts[0].split(':');
            appointmentHour = parseInt(hourMinute[0]);
            appointmentMinute = parseInt(hourMinute[1]);
            
            if (timeParts[1].toUpperCase() === 'PM' && appointmentHour !== 12) {
              appointmentHour += 12;
            } else if (timeParts[1].toUpperCase() === 'AM' && appointmentHour === 12) {
              appointmentHour = 0;
            }
          }
          
          if (appointmentHour !== undefined && appointmentMinute !== undefined) {
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            
            // If appointment time has passed, don't show in upcoming
            if (appointmentHour < currentHour || 
                (appointmentHour === currentHour && appointmentMinute <= currentMinute)) {
              return false; // Exclude from upcoming if time has passed
            }
          }
        }
      } catch (error) {
        console.error('Error processing time for appointment:', apt.fullName, error);
      }
    }
    
    // Include in upcoming if status is PENDING or null (and time hasn't passed)
    return apt.bookingStatus === "PENDING" || apt.bookingStatus === null;
  });
  
  // Filter completed appointments: today's appointments that have passed their time OR have COMPLETED status
  const completedAppointments = todayAppointments.filter(apt => {
    // If status is COMPLETED, include it
    if (apt.bookingStatus === "COMPLETED") return true;
    
    // If it's today and has a time, check if the time has passed
    if (apt.bookedDate && apt.bookedTime) {
      try {
        const now = new Date();
        const today = new Date();
        const appointmentDate = new Date(apt.bookedDate);
        
        // Check if it's today
        if (appointmentDate.getDate() === today.getDate() &&
            appointmentDate.getMonth() === today.getMonth() &&
            appointmentDate.getFullYear() === today.getFullYear()) {
          
          // Parse the time (assuming format like "14:30" or "2:30 PM")
          let timeStr = apt.bookedTime;
          let appointmentHour, appointmentMinute;
          
          if (timeStr.includes(':')) {
            const timeParts = timeStr.split(':');
            appointmentHour = parseInt(timeParts[0]);
            appointmentMinute = parseInt(timeParts[1]);
          } else if (timeStr.includes(' ')) {
            // Handle "2:30 PM" format
            const timeParts = timeStr.split(' ');
            const hourMinute = timeParts[0].split(':');
            appointmentHour = parseInt(hourMinute[0]);
            appointmentMinute = parseInt(hourMinute[1]);
            
            if (timeParts[1].toUpperCase() === 'PM' && appointmentHour !== 12) {
              appointmentHour += 12;
            } else if (timeParts[1].toUpperCase() === 'AM' && appointmentHour === 12) {
              appointmentHour = 0;
            }
          }
          
          if (appointmentHour !== undefined && appointmentMinute !== undefined) {
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            
            // Check if appointment time has passed
            if (appointmentHour < currentHour || 
                (appointmentHour === currentHour && appointmentMinute <= currentMinute)) {
              return true; // Include this as "completed" for today
            }
          }
        }
      } catch (error) {
        console.error('Error processing time for appointment:', apt.fullName, error);
      }
    }
    
    return false;
  });
  
  console.log('Upcoming appointments for today:', upcomingAppointments.length);
  console.log('Completed appointments for today:', completedAppointments.length);
  
  const cancelledAppointments = appointments.filter(
    (apt) => apt.bookingStatus === "CANCELLED"
  );
  
  const pendingStatusAppointments = appointments.filter(
    (apt) => apt.bookingStatus === null || apt.bookingStatus === "PENDING"
  );

  const allCompletedAppointments = appointments.filter(
    (apt) => apt.bookingStatus === "COMPLETED"
  );

  const getStatusColor = (status) => {
    if (!status) return 'warning';
    switch (status) {
      case "PENDING":
        return 'primary';
      case "COMPLETED":
        return 'success';
      case "CANCELLED":
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navigation />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Welcome back, {user.name}! {isAdmin ? 'You have access to all appointments.' : 'Here are your personal appointments.'}
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {isAdmin ? 'Total Appointments' : 'My Appointments'}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {appointments.length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ClockIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {isAdmin ? 'Pending' : 'My Pending'}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {pendingStatusAppointments.length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <UsersIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {isAdmin ? 'Completed' : 'My Completed'}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {allCompletedAppointments.length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CancelIcon sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {isAdmin ? 'Cancelled' : 'My Cancelled'}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {cancelledAppointments.length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ mb: 4 }}>
          <Button
            component={Link}
            href="/appointments/book"
            variant="contained"
            size="large"
            startIcon={<PlusIcon />}
            sx={{ mr: 2 }}
          >
            Book New Appointment
          </Button>
          <Button
            component={Link}
            href="/appointments"
            variant="outlined"
            size="large"
            startIcon={<EventIcon />}
          >
            View All Appointments
          </Button>
        </Box>

        {/* Today's Appointments - Side by Side */}
        <Grid container spacing={2}>
          {/* Upcoming Appointments */}
          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ height: 'fit-content', minHeight: 400 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ClockIcon sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                    Today's Upcoming
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                {upcomingAppointments.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No upcoming appointments for today. Book your first appointment!
                  </Alert>
                ) : (
                  <List sx={{ p: 0 }}>
                    {upcomingAppointments.map((appointment, index) => (
                      <Box key={appointment.id}>
                        <ListItem sx={{ 
                          p: 2, 
                          mb: 1, 
                          borderRadius: 1,
                          backgroundColor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider'
                        }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                              {appointment.fullName}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                📅 Date: {appointment.bookedDate ? formatDate(appointment.bookedDate) : 'No date'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                🕐 Time: {appointment.bookedTime ? formatTime(appointment.bookedTime) : 'No time'}
                              </Typography>
                              {appointment.notes && (
                                <Typography variant="body2" color="text.secondary">
                                  📝 Notes: {appointment.notes}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                            <Chip
                              label={appointment.bookingStatus || "PENDING"}
                              color={getStatusColor(appointment.bookingStatus)}
                              size="small"
                            />
                            <IconButton
                              onClick={() => handleCancelAppointment(appointment.id)}
                              color="error"
                              size="small"
                              sx={{ 
                                backgroundColor: 'error.light',
                                color: 'white',
                                '&:hover': { backgroundColor: 'error.main' }
                              }}
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </ListItem>
                        {index < upcomingAppointments.length - 1 && <Divider sx={{ my: 1 }} />}
                      </Box>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Passed Appointments */}
          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ height: 'fit-content', minHeight: 400 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <UsersIcon sx={{ color: 'success.main', mr: 1 }} />
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                    Today's Passed Appointments
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                {completedAppointments.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No passed appointments for today yet.
                  </Alert>
                ) : (
                  <List sx={{ p: 0 }}>
                    {completedAppointments.map((appointment, index) => (
                      <Box key={appointment.id}>
                        <ListItem sx={{ 
                          p: 2, 
                          mb: 1, 
                          borderRadius: 1,
                          backgroundColor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider'
                        }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                              {appointment.fullName}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                📅 Date: {appointment.bookedDate ? formatDate(appointment.bookedDate) : 'No date'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                🕐 Time: {appointment.bookedTime ? formatTime(appointment.bookedTime) : 'No time'}
                              </Typography>
                              {appointment.notes && (
                                <Typography variant="body2" color="text.secondary">
                                  📝 Notes: {appointment.notes}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Chip
                              label={appointment.bookingStatus || "PASSED"}
                              color={appointment.bookingStatus === "COMPLETED" ? "success" : "default"}
                              size="small"
                            />
                          </Box>
                        </ListItem>
                        {index < completedAppointments.length - 1 && <Divider sx={{ my: 1 }} />}
                      </Box>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Completed Bookings */}
          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ height: 'fit-content', minHeight: 400 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                    Today's Completed Bookings
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                {allCompletedAppointments.filter(apt => {
                  if (!apt.bookedDate) return false;
                  const today = new Date();
                  const appointmentDate = new Date(apt.bookedDate);
                  return appointmentDate.getDate() === today.getDate() &&
                         appointmentDate.getMonth() === today.getMonth() &&
                         appointmentDate.getFullYear() === today.getFullYear();
                }).length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No completed bookings for today yet.
                  </Alert>
                ) : (
                  <List sx={{ p: 0 }}>
                    {allCompletedAppointments.filter(apt => {
                      if (!apt.bookedDate) return false;
                      const today = new Date();
                      const appointmentDate = new Date(apt.bookedDate);
                      return appointmentDate.getDate() === today.getDate() &&
                             appointmentDate.getMonth() === today.getMonth() &&
                             appointmentDate.getFullYear() === today.getFullYear();
                    }).map((appointment, index, filteredArray) => (
                      <Box key={appointment.id}>
                        <ListItem sx={{ 
                          p: 2, 
                          mb: 1, 
                          borderRadius: 1,
                          backgroundColor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider'
                        }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                              {appointment.fullName}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                📅 Date: {appointment.bookedDate ? formatDate(appointment.bookedDate) : 'No date'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                🕐 Time: {appointment.bookedTime ? formatTime(appointment.bookedTime) : 'No time'}
                              </Typography>
                              {appointment.notes && (
                                <Typography variant="body2" color="text.secondary">
                                  📝 Notes: {appointment.notes}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Chip
                              label="COMPLETED"
                              color="success"
                              size="small"
                            />
                          </Box>
                        </ListItem>
                        {index < filteredArray.length - 1 && <Divider sx={{ my: 1 }} />}
                      </Box>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Welcome Dialog */}
      <Dialog
        open={welcomeDialogOpen}
        onClose={() => setWelcomeDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 450,
            maxWidth: 500,
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <span style={{ fontSize: '2.5rem' }}>🎉</span>
            <Typography variant="h5" component="span" sx={{ fontWeight: 600 }}>
              Welcome to the System!
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
          <Typography variant="h6" color="primary.main" sx={{ mb: 2 }}>
            Hello, {user?.name}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            We're excited to have you on board! You can now:
          </Typography>
          <Box sx={{ textAlign: 'left', pl: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              📅 Book new appointments
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              👀 View your appointment history
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              ⚙️ Manage your profile settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              📱 Access your dashboard anytime
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
          <Button
            onClick={() => setWelcomeDialogOpen(false)}
            variant="contained"
            size="large"
            sx={{ minWidth: 120 }}
          >
            Get Started! 🚀
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
