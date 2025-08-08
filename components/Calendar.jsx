'use client';

import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { format, parseISO, isSameDay } from 'date-fns';
import { appointmentAPI } from '@/lib/api.js';
import { getTimeSlots } from '@/lib/utils.js';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  CircularProgress,
  Chip
} from '@mui/material';
import { 
  Schedule, 
  CheckCircle, 
  Cancel 
} from '@mui/icons-material';

export default function AppointmentCalendar({
  selectedDate,
  onDateSelect,
  onTimeSelect,
  selectedTime,
  showTimeSlots = false,
  disabledDates = [],
}) {
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAvailableDates = async () => {
      setLoading(true);
      try {
        const startDate = format(new Date(), 'yyyy-MM-dd');
        const endDate = format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'); // 30 days from now
        
        const response = await appointmentAPI.getAvailableDates(startDate, endDate);
        if (response.success && response.data) {
          setAvailableDates(response.data);
        } else {
          // If API fails, create mock data for testing
          const mockDates = [];
          const today = new Date();
          for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            mockDates.push({
              date: format(date, 'yyyy-MM-dd'),
              availableSlots: getTimeSlots().map(time => ({
                time,
                available: Math.random() > 0.3 // 70% chance of being available
              }))
            });
          }
          setAvailableDates(mockDates);
        }
      } catch (error) {
        console.error('Error fetching available dates:', error);
        // Create mock data if API fails
        const mockDates = [];
        const today = new Date();
        for (let i = 0; i < 30; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          mockDates.push({
            date: format(date, 'yyyy-MM-dd'),
            availableSlots: getTimeSlots().map(time => ({
              time,
              available: Math.random() > 0.3 // 70% chance of being available
            }))
          });
        }
        setAvailableDates(mockDates);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableDates();
  }, []);

  const isDateAvailable = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const availableDate = availableDates.find(d => d.date === dateStr);
    return availableDate ? availableDate.availableSlots.some(slot => slot.available) : false;
  };

  const getAvailableSlotsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const availableDate = availableDates.find(d => d.date === dateStr);
    return availableDate ? availableDate.availableSlots : [];
  };

  const tileClassName = ({ date }) => {
    const baseClasses = 'p-2 text-center';
    
    if (selectedDate && isSameDay(date, selectedDate)) {
      return `${baseClasses} bg-primary-600 text-white rounded`;
    }
    
    if (isDateAvailable(date)) {
      return `${baseClasses} bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer`;
    }
    
    if (disabledDates.some(disabledDate => isSameDay(date, disabledDate))) {
      return `${baseClasses} bg-gray-100 text-gray-400 cursor-not-allowed`;
    }
    
    return `${baseClasses} hover:bg-gray-50 cursor-pointer`;
  };

  const tileDisabled = ({ date }) => {
    return !isDateAvailable(date) || disabledDates.some(disabledDate => isSameDay(date, disabledDate));
  };

  const handleDateChange = (value) => {
    if (value instanceof Date) {
      onDateSelect(value);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Date
        </Typography>
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileClassName={tileClassName}
          tileDisabled={tileDisabled}
          minDate={new Date()}
          maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
          className="w-full border-0"
        />
      </Paper>

      {showTimeSlots && selectedDate && (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Schedule sx={{ mr: 1 }} />
            Available Times for {format(selectedDate, 'MMM dd, yyyy')}
          </Typography>
          
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading available times...
              </Typography>
            </Box>
          ) : (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
              gap: 1 
            }}>
              {getAvailableSlotsForDate(selectedDate).map((slot) => (
                <Button
                  key={slot.time}
                  onClick={() => onTimeSelect?.(slot.time)}
                  disabled={!slot.available}
                  variant={selectedTime === slot.time ? "contained" : "outlined"}
                  size="small"
                  sx={{
                    py: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.5,
                    minHeight: 48
                  }}
                >
                  {slot.available ? (
                    <CheckCircle sx={{ fontSize: 16 }} />
                  ) : (
                    <Cancel sx={{ fontSize: 16 }} />
                  )}
                  {slot.time}
                </Button>
              ))}
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}
