'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation.jsx';
import { appointmentAPI } from '@/lib/api.js';
import { formatDate, formatTime } from '@/lib/utils.js';
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
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Schedule as ClockIcon,
  Add as PlusIcon,
  People as UsersIcon,
  TrendingUp as TrendingUpIcon,
  Cancel as CancelIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentAPI.getAppointments();
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

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === 'SCHEDULED' && new Date(apt.date) >= new Date()
  );
  const pastAppointments = appointments.filter(
    (apt) => apt.status === 'COMPLETED' || new Date(apt.date) < new Date()
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
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
            Welcome back, {user.name}!
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Total Appointments
                    </Typography>
                    <Typography variant="h4" component="div">
                      {appointments.length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ClockIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Upcoming
                    </Typography>
                    <Typography variant="h4" component="div">
                      {upcomingAppointments.length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <UsersIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Completed
                    </Typography>
                    <Typography variant="h4" component="div">
                      {pastAppointments.length}
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

        {/* Upcoming Appointments */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upcoming Appointments
                </Typography>
                {upcomingAppointments.length === 0 ? (
                  <Alert severity="info">
                    No upcoming appointments. Book your first appointment!
                  </Alert>
                ) : (
                  <List>
                    {upcomingAppointments.slice(0, 5).map((appointment) => (
                      <ListItem key={appointment.id} divider>
                        <ListItemText
                          primary={formatDate(appointment.date)}
                          secondary={`${formatTime(appointment.time)} - ${appointment.notes || 'No notes'}`}
                        />
                        <ListItemSecondaryAction>
                          <Chip
                            label={appointment.status}
                            color={getStatusColor(appointment.status)}
                            size="small"
                          />
                          <IconButton
                            edge="end"
                            onClick={() => handleCancelAppointment(appointment.id)}
                            color="error"
                            size="small"
                          >
                            <CancelIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Appointments
                </Typography>
                {pastAppointments.length === 0 ? (
                  <Alert severity="info">
                    No past appointments yet.
                  </Alert>
                ) : (
                  <List>
                    {pastAppointments.slice(0, 5).map((appointment) => (
                      <ListItem key={appointment.id} divider>
                        <ListItemText
                          primary={formatDate(appointment.date)}
                          secondary={`${formatTime(appointment.time)} - ${appointment.notes || 'No notes'}`}
                        />
                        <ListItemSecondaryAction>
                          <Chip
                            label={appointment.status}
                            color={getStatusColor(appointment.status)}
                            size="small"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
