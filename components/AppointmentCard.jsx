'use client';

import { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CalendarMonth,
  Schedule,
  Person,
  MoreVert,
  EditCalendar,
  Cancel,
  Delete,
  Tag,
} from '@mui/icons-material';
import { formatDate, getStatusColor, getStatusLabel } from '../lib/utils';
import {
  getAppointmentProviderLabel,
  getUserNotes,
  canReschedule,
  canCancel,
} from '../lib/appointmentHelpers';

export default function AppointmentCard({
  appointment,
  onCancel,
  onReschedule,
  onStatusChange,
  onDelete,
  showUserInfo = false,
  isAdmin = false,
  providersById = {},
}) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const status = appointment.bookingStatus || 'PENDING';
  const providerLabel = getAppointmentProviderLabel(appointment, providersById);
  const userNotes = getUserNotes(appointment);
  const showReschedule = canReschedule(appointment) && onReschedule;
  const showCancel = canCancel(appointment) && onCancel;

  const handleMenuClose = () => setMenuAnchor(null);

  const handleMarkComplete = async () => {
    handleMenuClose();
    if (!onStatusChange) return;
    setBusy(true);
    try {
      await onStatusChange(appointment.id, 'COMPLETED');
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    handleMenuClose();
    if (!onCancel || !confirm('Cancel this appointment?')) return;
    setBusy(true);
    try {
      await onCancel(appointment.id);
    } finally {
      setBusy(false);
    }
  };

  const handleReschedule = () => {
    handleMenuClose();
    onReschedule?.(appointment);
  };

  const handleDeleteConfirm = async () => {
    if (!onDelete) return;
    setBusy(true);
    try {
      await onDelete(appointment.id);
      setDeleteOpen(false);
    } finally {
      setBusy(false);
    }
  };

  const hasActions =
    showReschedule || showCancel || onStatusChange || (onDelete && isAdmin);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: 2 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'flex-start' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
            <Chip
              label={getStatusLabel(status)}
              color={getStatusColor(status)}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            {appointment.referenceNumber && (
              <Chip
                icon={<Tag sx={{ fontSize: 14 }} />}
                label={`Ref ${appointment.referenceNumber}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>

          <Typography variant="h6" fontWeight={700} noWrap>
            {showUserInfo ? appointment.fullName : 'Your appointment'}
          </Typography>

          {showUserInfo && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {appointment.email}
            </Typography>
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <CalendarMonth fontSize="small" color="primary" />
              <Typography variant="body2">
                {appointment.bookedDate
                  ? formatDate(appointment.bookedDate)
                  : 'Date not set'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Schedule fontSize="small" color="primary" />
              <Typography variant="body2">
                {appointment.bookedTime || 'Time not set'}
              </Typography>
            </Box>
            {providerLabel && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Person fontSize="small" color="primary" />
                <Typography variant="body2">{providerLabel}</Typography>
              </Box>
            )}
          </Box>

          {userNotes && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1.5, fontStyle: 'italic' }}
            >
              {userNotes}
            </Typography>
          )}
        </Box>

        {hasActions && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            {showReschedule && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<EditCalendar />}
                onClick={() => onReschedule(appointment)}
                disabled={busy}
              >
                Reschedule
              </Button>
            )}
            <IconButton
              aria-label="More actions"
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              disabled={busy}
            >
              <MoreVert />
            </IconButton>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={handleMenuClose}
            >
              {showReschedule && (
                <MenuItem onClick={handleReschedule}>
                  <EditCalendar fontSize="small" sx={{ mr: 1 }} />
                  Reschedule
                </MenuItem>
              )}
              {onStatusChange && status !== 'COMPLETED' && status !== 'CANCELLED' && (
                <MenuItem onClick={handleMarkComplete}>Mark complete</MenuItem>
              )}
              {showCancel && (
                <MenuItem onClick={handleCancel} sx={{ color: 'error.main' }}>
                  <Cancel fontSize="small" sx={{ mr: 1 }} />
                  Cancel appointment
                </MenuItem>
              )}
              {onDelete && isAdmin && (
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    setDeleteOpen(true);
                  }}
                  sx={{ color: 'error.main' }}
                >
                  <Delete fontSize="small" sx={{ mr: 1 }} />
                  Delete
                </MenuItem>
              )}
            </Menu>
          </Box>
        )}
      </Box>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete appointment?</DialogTitle>
        <DialogContent>
          <Typography>
            Permanently delete the appointment for{' '}
            <strong>{appointment.fullName}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Keep</Button>
          <Button color="error" variant="contained" onClick={handleDeleteConfirm} disabled={busy}>
            {busy ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
