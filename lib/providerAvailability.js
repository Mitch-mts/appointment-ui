/** Monday-first (matches typical scheduling copy). */
export const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export function weekdayIndex(name) {
  const i = WEEKDAYS.findIndex((d) => d.toLowerCase() === String(name).toLowerCase());
  return i;
}

export function normalizeDayRange(dayStart, dayEnd) {
  const a = weekdayIndex(dayStart);
  const b = weekdayIndex(dayEnd);
  if (a === -1 || b === -1) return [dayStart, dayEnd];
  if (a <= b) return [WEEKDAYS[a], WEEKDAYS[b]];
  return [WEEKDAYS[b], WEEKDAYS[a]];
}

/** "08:00" | "00:30" | "12:15" -> "8am" | "12:30am" | "12:15pm" */
export function formatTime24To12(hhmm) {
  if (!hhmm || !/^\d{2}:\d{2}$/.test(hhmm)) return '';
  const [hs, ms] = hhmm.split(':');
  const hour24 = ((Number(hs) % 24) + 24) % 24;
  const m = Number(ms);
  const ampm = hour24 < 12 ? 'am' : 'pm';
  let h12 = hour24 % 12;
  if (h12 === 0) h12 = 12;
  if (m === 0) return `${h12}${ampm}`;
  return `${h12}:${String(m).padStart(2, '0')}${ampm}`;
}

/** Build API string: "Monday - Wednesday, 8am-11am" */
export function formatDayRangeAvailability(dayStart, dayEnd, timeStart24, timeEnd24) {
  const [d0, d1] = normalizeDayRange(dayStart, dayEnd);
  const t1 = formatTime24To12(timeStart24);
  const t2 = formatTime24To12(timeEnd24);
  return `${d0} - ${d1}, ${t1}-${t2}`;
}

const DAY_PATTERN =
  '(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)';

const DAY_RANGE_RE = new RegExp(
  `^${DAY_PATTERN}\\s*-\\s*${DAY_PATTERN},\\s*(.+)$`,
  'i'
);

/** Parse "8am-11am" | "8:30am-11:30pm" -> { timeStart, timeEnd } as HH:mm */
export function parseTime12hRange(timePart) {
  const s = timePart.trim();
  const re =
    /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*-\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i;
  const m = s.match(re);
  if (!m) return null;

  const to24 = (hour12, minute, ap) => {
    let h = Number(hour12);
    const min = minute != null && minute !== '' ? Number(minute) : 0;
    const apm = ap.toLowerCase();
    if (apm === 'am') {
      if (h === 12) h = 0;
    } else if (h !== 12) {
      h += 12;
    }
    return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  };

  return {
    timeStart: to24(m[1], m[2], m[3]),
    timeEnd: to24(m[4], m[5], m[6]),
  };
}

export function parseDayRangeAvailability(str) {
  if (!str || typeof str !== 'string') return null;
  const trimmed = str.trim();
  const m = trimmed.match(DAY_RANGE_RE);
  if (!m) return null;
  const dayStart = WEEKDAYS[weekdayIndex(m[1])];
  const dayEnd = WEEKDAYS[weekdayIndex(m[2])];
  if (!dayStart || !dayEnd) return null;
  const times = parseTime12hRange(m[3]);
  if (!times) return null;
  const [d0, d1] = normalizeDayRange(dayStart, dayEnd);
  return {
    dayStart: d0,
    dayEnd: d1,
    timeStart: times.timeStart,
    timeEnd: times.timeEnd,
  };
}

/** Legacy: calendar dates (older UI). */
const ISO_PAYLOAD_RE =
  /^(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2}),\s*(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/;

export function parseIsoDateAvailability(str) {
  if (!str || typeof str !== 'string') return null;
  const m = str.trim().match(ISO_PAYLOAD_RE);
  if (!m) return null;
  return { raw: str };
}
