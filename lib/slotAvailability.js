import {
  addDays,
  format,
  parseISO,
  isAfter,
  isToday,
  startOfDay,
  getDay,
} from 'date-fns';
import { parseDayRangeAvailability, weekdayIndex } from './providerAvailability.js';
import { getTimeSlots, isTimeSlotAvailable } from './utils.js';

const JS_DAY_TO_WEEKDAY = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

function parseTimeToMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(total) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** 30-minute slots between timeStart and timeEnd (exclusive end). */
export function slotsBetween(timeStart24, timeEnd24) {
  const start = parseTimeToMinutes(timeStart24);
  const end = parseTimeToMinutes(timeEnd24);
  const slots = [];
  for (let t = start; t < end; t += 30) {
    slots.push(minutesToTime(t));
  }
  return slots;
}

function isWeekdayInRange(dayName, dayStart, dayEnd) {
  const idx = weekdayIndex(dayName);
  const a = weekdayIndex(dayStart);
  const b = weekdayIndex(dayEnd);
  if (idx === -1 || a === -1 || b === -1) return false;
  if (a <= b) return idx >= a && idx <= b;
  return idx >= a || idx <= b;
}

function slotsForDateFromProvider(date, provider) {
  const parsed = parseDayRangeAvailability(provider?.availability || '');
  if (!parsed) {
    return getTimeSlots();
  }

  const dayName = JS_DAY_TO_WEEKDAY[getDay(date)];
  if (!isWeekdayInRange(dayName, parsed.dayStart, parsed.dayEnd)) {
    return [];
  }

  return slotsBetween(parsed.timeStart, parsed.timeEnd);
}

function normalizeSlotList(times, date) {
  return times.map((time) => ({
    time,
    available: isTimeSlotAvailable(time, date),
  }));
}

/**
 * Client-side availability when the backend endpoint is missing or fails.
 * Respects provider weekly availability string when parseable.
 */
export function buildClientAvailabilityCalendar(provider, startDate, endDate) {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  const today = startOfDay(new Date());
  const result = [];

  for (let d = start; !isAfter(d, end); d = addDays(d, 1)) {
    if (isAfter(today, startOfDay(d))) continue;

    const times = slotsForDateFromProvider(d, provider);
    if (times.length === 0) continue;

    const availableSlots = normalizeSlotList(times, d).filter((s) => s.available);
    if (availableSlots.length === 0 && !isToday(d)) continue;

    result.push({
      date: format(d, 'yyyy-MM-dd'),
      availableSlots: normalizeSlotList(times, d),
    });
  }

  return result;
}

/** Prefer API slots; fill gaps from client calendar for dates API omitted. */
export function mergeAvailabilityCalendars(apiCalendar, clientCalendar) {
  const byDate = new Map();

  for (const entry of clientCalendar || []) {
    byDate.set(entry.date, entry);
  }
  for (const entry of apiCalendar || []) {
    byDate.set(entry.date, entry);
  }

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function getSlotsForDate(calendar, date) {
  const dateStr = format(date, 'yyyy-MM-dd');
  const entry = calendar.find((d) => d.date === dateStr);
  if (!entry?.availableSlots?.length) return [];

  return entry.availableSlots.filter(
    (slot) => slot.available && isTimeSlotAvailable(slot.time, date)
  );
}

export function isDateBookable(calendar, date) {
  return getSlotsForDate(calendar, date).length > 0;
}
