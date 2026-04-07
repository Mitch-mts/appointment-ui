'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useRouter } from 'next/navigation';
import Navigation from '../../components/Navigation.jsx';
import DashboardCalendar from '../../components/DashboardCalendar.jsx';
import { appointmentAPI } from '../../lib/api';
import { formatDate, formatTime, isToday } from '../../lib/utils';
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
  IconButton,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
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
  const [todayTab, setTodayTab] = useState(0);

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
          bgcolor: 'background.default',
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

  const todaysCompletedBookings = allCompletedAppointments.filter((apt) => {
    if (!apt.bookedDate) return false;
    const today = new Date();
    const appointmentDate = new Date(apt.bookedDate);
    return (
      appointmentDate.getDate() === today.getDate() &&
      appointmentDate.getMonth() === today.getMonth() &&
      appointmentDate.getFullYear() === today.getFullYear()
    );
  });

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
    <div className="relative min-h-screen overflow-hidden bg-sky-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Soft illustration-style background to match landing/auth pages */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-32 h-72 w-72 rounded-full bg-blue-100 blur-3xl dark:bg-sky-900/40" />
        <div className="absolute top-32 -right-24 h-80 w-80 rounded-full bg-cyan-100 blur-3xl dark:bg-indigo-900/30" />
        <div className="absolute bottom-[-80px] left-12 h-72 w-72 rounded-full bg-indigo-100 blur-3xl dark:bg-blue-900/25" />
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
      </div>

      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: 'transparent',
          position: 'relative',
          zIndex: 10,
        }}
      >
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

        <DashboardCalendar appointments={appointments} loading={loadingAppointments} />

        {/* Today's appointments — tabbed */}
        <Card
          elevation={4}
          sx={{
            overflow: 'hidden',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'linear-gradient(165deg, rgba(30,41,59,0.55) 0%, rgba(15,23,42,0.35) 45%, rgba(15,23,42,0.2) 100%)'
                : 'linear-gradient(165deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
          }}
        >
          <Box
            sx={{
              px: { xs: 0, sm: 1 },
              pt: 1.5,
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(90deg, rgba(59,130,246,0.14) 0%, rgba(99,102,241,0.08) 50%, rgba(59,130,246,0.06) 100%)'
                  : 'linear-gradient(90deg, rgba(239,246,255,0.98) 0%, rgba(238,242,255,0.85) 50%, rgba(224,231,255,0.5) 100%)',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="overline"
              sx={{
                px: 2,
                pb: 0.75,
                display: 'block',
                letterSpacing: 2,
                fontWeight: 800,
                fontSize: '0.68rem',
                color: 'text.secondary',
              }}
            >
              Today at a glance
            </Typography>
            <Tabs
              value={todayTab}
              onChange={(_, v) => setTodayTab(v)}
              variant="fullWidth"
              aria-label="Today's appointment sections"
              sx={{
                minHeight: { xs: 56, sm: 64 },
                '& .MuiTabs-flexContainer': { gap: 0 },
                '& .MuiTab-root': {
                  minHeight: { xs: 56, sm: 64 },
                  py: 0.5,
                  px: { xs: 0.25, sm: 1 },
                  textTransform: 'none',
                  color: 'text.secondary',
                  transition: 'color 0.2s ease, background 0.2s ease',
                  borderRadius: '14px 14px 0 0',
                  '&.Mui-selected': {
                    color: 'primary.main',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(15,23,42,0.65)'
                        : 'rgba(255,255,255,0.92)',
                  },
                },
                '& .MuiTabs-indicator': {
                  height: 4,
                  borderRadius: 2,
                  background: (theme) =>
                    `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                },
              }}
            >
              <Tab
                id="today-tab-0"
                aria-controls="today-panel-0"
                label={
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: { xs: 0.75, sm: 1.25 },
                      py: 0.5,
                      maxWidth: 1,
                    }}
                  >
                    <ClockIcon
                      sx={{
                        fontSize: { xs: 22, sm: 26 },
                        color: todayTab === 0 ? 'primary.main' : 'action.active',
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ minWidth: 0, textAlign: 'left' }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 800, lineHeight: 1.15, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        Upcoming
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
                        Still ahead today
                      </Typography>
                    </Box>
                    <Chip
                      label={upcomingAppointments.length}
                      size="small"
                      color={todayTab === 0 ? 'primary' : 'default'}
                      variant={todayTab === 0 ? 'filled' : 'outlined'}
                      sx={{ height: 22, minWidth: 28, fontWeight: 800, '& .MuiChip-label': { px: 0.75 } }}
                    />
                  </Box>
                }
              />
              <Tab
                id="today-tab-1"
                aria-controls="today-panel-1"
                label={
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: { xs: 0.75, sm: 1.25 },
                      py: 0.5,
                      maxWidth: 1,
                    }}
                  >
                    <UsersIcon
                      sx={{
                        fontSize: { xs: 22, sm: 26 },
                        color: todayTab === 1 ? 'primary.main' : 'action.active',
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ minWidth: 0, textAlign: 'left' }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 800, lineHeight: 1.15, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        Passed
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
                        Time already went by
                      </Typography>
                    </Box>
                    <Chip
                      label={completedAppointments.length}
                      size="small"
                      color={todayTab === 1 ? 'primary' : 'default'}
                      variant={todayTab === 1 ? 'filled' : 'outlined'}
                      sx={{ height: 22, minWidth: 28, fontWeight: 800, '& .MuiChip-label': { px: 0.75 } }}
                    />
                  </Box>
                }
              />
              <Tab
                id="today-tab-2"
                aria-controls="today-panel-2"
                label={
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: { xs: 0.75, sm: 1.25 },
                      py: 0.5,
                      maxWidth: 1,
                    }}
                  >
                    <CheckCircle
                      sx={{
                        fontSize: { xs: 22, sm: 26 },
                        color: todayTab === 2 ? 'primary.main' : 'action.active',
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ minWidth: 0, textAlign: 'left' }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 800, lineHeight: 1.15, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        Completed
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
                        Marked complete
                      </Typography>
                    </Box>
                    <Chip
                      label={todaysCompletedBookings.length}
                      size="small"
                      color={todayTab === 2 ? 'primary' : 'default'}
                      variant={todayTab === 2 ? 'filled' : 'outlined'}
                      sx={{ height: 22, minWidth: 28, fontWeight: 800, '& .MuiChip-label': { px: 0.75 } }}
                    />
                  </Box>
                }
              />
            </Tabs>
          </Box>

          <CardContent sx={{ p: { xs: 2, sm: 3 }, minHeight: 380 }}>
            <Box
              id="today-panel-0"
              role="tabpanel"
              aria-labelledby="today-tab-0"
              hidden={todayTab !== 0}
            >
              {upcomingAppointments.length === 0 ? (
                <Alert severity="info" sx={{ mt: 0 }}>
                  No upcoming appointments for today. Book your first appointment!
                </Alert>
              ) : (
                <List sx={{ p: 0 }}>
                  {upcomingAppointments.map((appointment, index) => (
                    <Box key={appointment.id}>
                      <ListItem
                        sx={{
                          p: 2,
                          mb: 1,
                          borderRadius: 2,
                          backgroundColor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider',
                          boxShadow: (theme) =>
                            theme.palette.mode === 'dark' ? 'none' : '0 1px 2px rgba(15,23,42,0.06)',
                        }}
                      >
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
                            label={appointment.bookingStatus || 'PENDING'}
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
                              '&:hover': { backgroundColor: 'error.main' },
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
            </Box>

            <Box
              id="today-panel-1"
              role="tabpanel"
              aria-labelledby="today-tab-1"
              hidden={todayTab !== 1}
            >
              {completedAppointments.length === 0 ? (
                <Alert severity="info" sx={{ mt: 0 }}>
                  No passed appointments for today yet.
                </Alert>
              ) : (
                <List sx={{ p: 0 }}>
                  {completedAppointments.map((appointment, index) => (
                    <Box key={appointment.id}>
                      <ListItem
                        sx={{
                          p: 2,
                          mb: 1,
                          borderRadius: 2,
                          backgroundColor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider',
                          boxShadow: (theme) =>
                            theme.palette.mode === 'dark' ? 'none' : '0 1px 2px rgba(15,23,42,0.06)',
                        }}
                      >
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
                            label={appointment.bookingStatus || 'PASSED'}
                            color={appointment.bookingStatus === 'COMPLETED' ? 'success' : 'default'}
                            size="small"
                          />
                        </Box>
                      </ListItem>
                      {index < completedAppointments.length - 1 && <Divider sx={{ my: 1 }} />}
                    </Box>
                  ))}
                </List>
              )}
            </Box>

            <Box
              id="today-panel-2"
              role="tabpanel"
              aria-labelledby="today-tab-2"
              hidden={todayTab !== 2}
            >
              {todaysCompletedBookings.length === 0 ? (
                <Alert severity="info" sx={{ mt: 0 }}>
                  No completed bookings for today yet.
                </Alert>
              ) : (
                <List sx={{ p: 0 }}>
                  {todaysCompletedBookings.map((appointment, index) => (
                    <Box key={appointment.id}>
                      <ListItem
                        sx={{
                          p: 2,
                          mb: 1,
                          borderRadius: 2,
                          backgroundColor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider',
                          boxShadow: (theme) =>
                            theme.palette.mode === 'dark' ? 'none' : '0 1px 2px rgba(15,23,42,0.06)',
                        }}
                      >
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
                          <Chip label="COMPLETED" color="success" size="small" />
                        </Box>
                      </ListItem>
                      {index < todaysCompletedBookings.length - 1 && <Divider sx={{ my: 1 }} />}
                    </Box>
                  ))}
                </List>
              )}
            </Box>
          </CardContent>
        </Card>
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
    </div>
  );
}
