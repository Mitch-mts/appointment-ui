import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Export date-fns functions for use in other components
export { isToday, isTomorrow, isYesterday };

export function formatDate(date) {
  if (!date) return 'N/A';
  
  let dateObj;
  if (typeof date === 'string') {
    dateObj = parseISO(date);
  } else {
    dateObj = date;
  }
  
  // Check if the date is valid
  if (!dateObj || isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  if (isToday(dateObj)) {
    return 'Today';
  } else if (isTomorrow(dateObj)) {
    return 'Tomorrow';
  } else if (isYesterday(dateObj)) {
    return 'Yesterday';
  } else {
    return format(dateObj, 'MMM dd, yyyy');
  }
}

export function formatTime(time) {
  return time; // Assuming time is already in HH:mm format
}

export function formatDateTime(date, time) {
  if (!date) return 'N/A';
  
  const dateObj = parseISO(date);
  
  // Check if the date is valid
  if (!dateObj || isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  const formattedDate = format(dateObj, 'MMM dd, yyyy');
  return `${formattedDate} at ${time}`;
}

export function getTimeSlots() {
  const slots = [];
  for (let hour = 8; hour <= 16; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 16) { // Don't add 30-minute slot for 4:30 PM
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return slots;
}

export function getAvailableTimeSlotsForDate(date) {
  const slots = [];
  const now = new Date();
  const targetDate = new Date(date);
  
  // If it's not today, show all time slots
  if (!isToday(targetDate)) {
    for (let hour = 8; hour <= 16; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 16) { // Don't add 30-minute slot for 4:30 PM
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  }
  
  // If it's today, only show future time slots
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  for (let hour = 8; hour <= 16; hour++) {
    // Check if this hour has passed
    if (hour < currentHour) continue;
    
    // For the current hour, check if 30-minute slot has passed
    if (hour === currentHour) {
      if (currentMinute < 30) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
      // Skip 00 minute slot if we're past the hour
      if (currentMinute < 60) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
      }
    } else {
      // Future hours - add both slots (except for 4:00 PM which only gets 4:00)
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 16) { // Don't add 30-minute slot for 4:30 PM
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
  }
  
  return slots;
}

export function isTimeSlotAvailable(time, date) {
  const now = new Date();
  const targetDate = new Date(date);
  
  // If it's not today, the time slot is available
  if (!isToday(targetDate)) {
    return true;
  }
  
  // If it's today, check if the time has passed
  const [hours, minutes] = time.split(':').map(Number);
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  if (hours < currentHour) return false;
  if (hours === currentHour && minutes <= currentMinute) return false;
  
  return true;
}

export function isDateInPast(date) {
  if (!date) return false;
  
  const dateObj = parseISO(date);
  
  // Check if the date is valid
  if (!dateObj || isNaN(dateObj.getTime())) {
    return false;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dateObj < today;
}

export function isWeekend(date) {
  if (!date) return false;
  
  const dateObj = parseISO(date);
  
  // Check if the date is valid
  if (!dateObj || isNaN(dateObj.getTime())) {
    return false;
  }
  
  const day = dateObj.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

export function getStatusColor(status) {
  if (!status) return 'warning';
  switch (status) {
    case 'PENDING':
      return 'primary';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
      return 'error';
    default:
      return 'default';
  }
}
