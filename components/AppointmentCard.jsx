'use client';

import React, { useState } from 'react';
import { formatDate, getStatusColor } from '../lib/utils';
import { Calendar, Clock, User, Trash2, Edit } from 'lucide-react';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

export default function AppointmentCard({
  appointment,
  onCancel,
  onEdit,
  onStatusChange,
  onDelete,
  showUserInfo = false,
  isAdmin = false,
}) {
  const [status, setStatus] = useState(appointment.bookingStatus || 'PENDING');
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCancel = () => {
    if (onCancel && confirm('Are you sure you want to cancel this appointment?')) {
      onCancel(appointment.id);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(appointment);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (onDelete) {
      setIsDeleting(true);
      try {
        await onDelete(appointment.id);
        setDeleteDialogOpen(false);
      } catch (error) {
        console.error('Failed to delete appointment:', error);
        alert('Failed to delete appointment. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;
    
    // Set loading state
    setIsUpdating(true);
    
    try {
      // Optimistically update the local state
      setStatus(newStatus);
      
      // Call the API to update the status
      if (onStatusChange) {
        await onStatusChange(appointment.id, newStatus);
        // Status is now confirmed by the API, no need to revert
        console.log(`Status updated successfully to ${newStatus}`);
      }
    } catch (error) {
      // If API call fails, revert to the original status
      setStatus(appointment.bookingStatus || 'PENDING');
      console.error('Failed to update appointment status:', error);
      alert('Failed to update appointment status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusOptions = () => {
    const currentStatus = appointment.bookingStatus || 'PENDING';
    
    // If already cancelled or completed, don't show options
    if (currentStatus === 'CANCELLED' || currentStatus === 'COMPLETED') {
      return [];
    }
    
    // Show relevant status options based on current status
    if (currentStatus === 'PENDING' || currentStatus === null) {
      return [
        { value: 'COMPLETED', label: 'Mark Complete', color: 'success' },
        { value: 'CANCELLED', label: 'Cancel', color: 'error' }
      ];
    }
    
    if (currentStatus === 'SCHEDULED') {
      return [
        { value: 'COMPLETED', label: 'Mark Complete', color: 'success' },
        { value: 'CANCELLED', label: 'Cancel', color: 'error' }
      ];
    }
    
    return [];
  };

  const statusOptions = getStatusOptions();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary-600" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {appointment.fullName}
              </h3>
              <span className="text-xs text-gray-500">
                {appointment.email}
              </span>
            </div>
            
            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
              <span>
                <Calendar className="inline h-4 w-4 mr-1" />
                {appointment.bookedDate ? formatDate(appointment.bookedDate) : 'No date set'}
              </span>
              <span>
                <Clock className="inline h-4 w-4 mr-1" />
                {appointment.bookedTime || 'No time set'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Status Display */}
          <Chip
            label={appointment.bookingStatus || 'PENDING'}
            color={getStatusColor(appointment.bookingStatus || 'PENDING')}
            size="small"
            variant="outlined"
          />
          
          {appointment.referenceNumber && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Ref: {appointment.referenceNumber}
            </span>
          )}
          
          {/* Status Management Dropdown */}
          {statusOptions.length > 0 && (
            <Box sx={{ minWidth: 120 }}>
              <FormControl size="small" fullWidth>
                <InputLabel id={`status-label-${appointment.id}`}>
                  {isUpdating ? 'Updating...' : 'Actions'}
                </InputLabel>
                <Select
                  labelId={`status-label-${appointment.id}`}
                  value={status}
                  label={isUpdating ? 'Updating...' : 'Actions'}
                  onChange={handleStatusChange}
                  disabled={isUpdating}
                  sx={{
                    '& .MuiSelect-select': {
                      py: 0.5,
                      px: 1,
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'divider',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-disabled': {
                      backgroundColor: 'action.disabledBackground',
                    },
                  }}
                >
                  {statusOptions.map((option) => (
                    <MenuItem 
                      key={option.value} 
                      value={option.value}
                      disabled={isUpdating}
                      sx={{
                        color: `${option.color}.main`,
                        '&:hover': {
                          backgroundColor: `${option.color}.50`,
                        },
                        '&.Mui-disabled': {
                          opacity: 0.6,
                        },
                      }}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
          
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={handleEdit}
                className="text-primary-600 hover:text-primary-700 p-1 rounded"
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            
            {onDelete && isAdmin && (
              <button
                onClick={handleDeleteClick}
                className="text-red-600 hover:text-red-700 p-1 rounded"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 400,
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <span style={{ fontSize: '2rem' }}>🗑️</span>
            <Typography variant="h6" component="span">
              Delete Appointment?
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Are you sure you want to delete this appointment for <strong>{appointment.fullName}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
          <Button
            onClick={handleDeleteCancel}
            variant="outlined"
            sx={{ minWidth: 100 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            sx={{ minWidth: 100 }}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
