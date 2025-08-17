'use client';

import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { format, parseISO, isSameDay, isToday, isAfter, startOfDay } from 'date-fns';
import { appointmentAPI } from '../lib/api';
import { getTimeSlots, getAvailableTimeSlotsForDate, isTimeSlotAvailable } from '../lib/utils';
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

  // Helper function to get the end of current year
  const getEndOfCurrentYear = () => {
    const currentYear = new Date().getFullYear();
    return new Date(currentYear, 11, 31); // December 31st of current year
  };

  useEffect(() => {
    const fetchAvailableDates = async () => {
      setLoading(true);
      try {
        const startDate = format(new Date(), 'yyyy-MM-dd');
        const endDate = format(getEndOfCurrentYear(), 'yyyy-MM-dd'); // End of current year
        
        const response = await appointmentAPI.getAvailableDates(startDate, endDate);
        if (response.success && response.data) {
          setAvailableDates(response.data);
        } else {
          // If API fails, create mock data for testing
          const mockDates = [];
          const today = new Date();
          const endOfYear = getEndOfCurrentYear();
          
          for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            // Only add dates that are today or in the future, but within current year
            if ((isAfter(startOfDay(date), startOfDay(today)) || isToday(date)) && date <= endOfYear) {
              mockDates.push({
                date: format(date, 'yyyy-MM-dd'),
                availableSlots: getAvailableTimeSlotsForDate(date).map(time => ({
                  time,
                  available: Math.random() > 0.3 // 70% chance of being available
                }))
              });
            }
          }
          setAvailableDates(mockDates);
        }
      } catch (error) {
        console.error('Error fetching available dates:', error);
        // Create mock data if API fails
        const mockDates = [];
        const today = new Date();
        const endOfYear = getEndOfCurrentYear();
        
        for (let i = 0; i < 365; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          
          // Only add dates that are today or in the future, but within current year
          if ((isAfter(startOfDay(date), startOfDay(today)) || isToday(date)) && date <= endOfYear) {
            mockDates.push({
              date: format(date, 'yyyy-MM-dd'),
              availableSlots: getAvailableTimeSlotsForDate(date).map(time => ({
                time,
                available: Math.random() > 0.3 // 70% chance of being available
              }))
            });
          }
        }
        setAvailableDates(mockDates);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableDates();
  }, []);

  const isDateAvailable = (date) => {
    // Don't allow past dates
    if (isAfter(startOfDay(new Date()), startOfDay(date))) {
      return false;
    }
    
    // Don't allow dates beyond current year
    const currentYear = new Date().getFullYear();
    if (date.getFullYear() > currentYear) {
      return false;
    }
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const availableDate = availableDates.find(d => d.date === dateStr);
    
    // For dates within the next 30 days, require API data
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    if (date <= thirtyDaysFromNow) {
      if (!availableDate) return false;
      
      // For today, check if there are any available time slots that haven't passed
      if (isToday(date)) {
        return availableDate.availableSlots.some(slot => 
          slot.available && isTimeSlotAvailable(slot.time, date)
        );
      }
      
      // For near future dates, check if there are any available slots
      return availableDate.availableSlots.some(slot => slot.available);
    }
    
    // For dates beyond 30 days but within current year, assume they're available
    return true;
  };

  const getAvailableSlotsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const availableDate = availableDates.find(d => d.date === dateStr);
    
    // For dates beyond 30 days but within current year, return all time slots
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    if (date > thirtyDaysFromNow && date.getFullYear() === new Date().getFullYear()) {
      return getTimeSlots(); // Return all available time slots from utils
    }
    
    if (!availableDate) return [];
    
    // Filter out time slots that have passed for today
    return availableDate.availableSlots.filter(slot => 
      slot.available && isTimeSlotAvailable(slot.time, date)
    );
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
    
    // Past dates should be disabled
    if (isAfter(startOfDay(new Date()), startOfDay(date))) {
      return `${baseClasses} bg-gray-100 text-gray-400 cursor-not-allowed`;
    }
    
    return `${baseClasses} hover:bg-gray-50 cursor-pointer`;
  };

  const tileDisabled = ({ date }) => {
    return !isDateAvailable(date) || 
           disabledDates.some(disabledDate => isSameDay(date, disabledDate)) ||
           isAfter(startOfDay(new Date()), startOfDay(date));
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
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          You can book appointments for the current year only
        </Typography>
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileClassName={tileClassName}
          tileDisabled={tileDisabled}
          minDate={new Date()}
          maxDate={getEndOfCurrentYear()}
          className="w-full border-0"
          showNavigation={true}
          showNeighboringMonth={true}
          locale="en-US"
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
