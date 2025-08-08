'use client';

import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { format, parseISO, isSameDay } from 'date-fns';
import { appointmentAPI } from '@/lib/api.js';
import { getTimeSlots } from '@/lib/utils.js';
import { Clock, Check, X } from 'lucide-react';

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
        }
      } catch (error) {
        console.error('Error fetching available dates:', error);
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
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Select Date</h3>
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileClassName={tileClassName}
          tileDisabled={tileDisabled}
          minDate={new Date()}
          maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
          className="w-full border-0"
        />
      </div>

      {showTimeSlots && selectedDate && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Available Times for {format(selectedDate, 'MMM dd, yyyy')}
          </h3>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading available times...</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {getAvailableSlotsForDate(selectedDate).map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => onTimeSelect?.(slot.time)}
                  disabled={!slot.available}
                  className={`
                    p-3 rounded-lg border text-sm font-medium transition-colors
                    ${slot.available
                      ? selectedTime === slot.time
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-primary-500'
                      : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    }
                  `}
                >
                  <div className="flex items-center justify-center space-x-1">
                    {slot.available ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    <span>{slot.time}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
