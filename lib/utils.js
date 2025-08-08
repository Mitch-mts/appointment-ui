import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date) {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
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
  const dateObj = parseISO(date);
  const formattedDate = format(dateObj, 'MMM dd, yyyy');
  return `${formattedDate} at ${time}`;
}

export function getTimeSlots() {
  const slots = [];
  for (let hour = 9; hour <= 17; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
}

export function isDateInPast(date) {
  const dateObj = parseISO(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dateObj < today;
}

export function isWeekend(date) {
  const dateObj = parseISO(date);
  const day = dateObj.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

export function getStatusColor(status) {
  switch (status) {
    case 'SCHEDULED':
      return 'text-blue-600 bg-blue-100';
    case 'CANCELLED':
      return 'text-red-600 bg-red-100';
    case 'COMPLETED':
      return 'text-green-600 bg-green-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}
