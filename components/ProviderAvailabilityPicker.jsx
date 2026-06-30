'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import {
  WEEKDAYS,
  formatDayRangeAvailability,
  normalizeDayRange,
  parseDayRangeAvailability,
  parseIsoDateAvailability,
} from '../lib/providerAvailability.js';

/** API may send availability as non-string; never call string methods blindly. */
function availabilityToString(value) {
  if (value == null || value === '') return '';
  if (typeof value === 'string') return value;
  return String(value);
}

const DEFAULT_DAYS = { dayStart: 'Monday', dayEnd: 'Wednesday' };
const DEFAULT_TIMES = { timeStart: '08:00', timeEnd: '11:00' };

function defaultAvailabilityString() {
  return formatDayRangeAvailability(
    DEFAULT_DAYS.dayStart,
    DEFAULT_DAYS.dayEnd,
    DEFAULT_TIMES.timeStart,
    DEFAULT_TIMES.timeEnd
  );
}

export default function ProviderAvailabilityPicker({
  value,
  onChange,
  disabled = false,
  idPrefix = 'availability',
}) {
  const [dayStart, setDayStart] = useState(DEFAULT_DAYS.dayStart);
  const [dayEnd, setDayEnd] = useState(DEFAULT_DAYS.dayEnd);
  const [timeStart, setTimeStart] = useState(DEFAULT_TIMES.timeStart);
  const [timeEnd, setTimeEnd] = useState(DEFAULT_TIMES.timeEnd);
  const onChangeRef = useRef(onChange);
  const syncedValueRef = useRef(null);

  onChangeRef.current = onChange;

  const emitAvailability = (dStart, dEnd, tStart, tEnd) => {
    const [d0, d1] = normalizeDayRange(dStart, dEnd);
    const next = formatDayRangeAvailability(d0, d1, tStart, tEnd);
    syncedValueRef.current = next;
    onChangeRef.current(next);
    return next;
  };

  // Sync internal controls when the parent value changes (e.g. opening edit dialog).
  useEffect(() => {
    const v = availabilityToString(value).trim();

    if (v === syncedValueRef.current) return;

    const parsed = parseDayRangeAvailability(v);
    if (parsed) {
      setDayStart(parsed.dayStart);
      setDayEnd(parsed.dayEnd);
      setTimeStart(parsed.timeStart);
      setTimeEnd(parsed.timeEnd);
      const normalized = formatDayRangeAvailability(
        parsed.dayStart,
        parsed.dayEnd,
        parsed.timeStart,
        parsed.timeEnd
      );
      syncedValueRef.current = normalized;
      if (normalized !== v) {
        onChangeRef.current(normalized);
      }
      return;
    }

    if (!v) {
      setDayStart(DEFAULT_DAYS.dayStart);
      setDayEnd(DEFAULT_DAYS.dayEnd);
      setTimeStart(DEFAULT_TIMES.timeStart);
      setTimeEnd(DEFAULT_TIMES.timeEnd);
      const next = defaultAvailabilityString();
      syncedValueRef.current = next;
      onChangeRef.current(next);
      return;
    }

    // Legacy / free-text value: keep controls at defaults; parent keeps stored string until user edits.
    setDayStart(DEFAULT_DAYS.dayStart);
    setDayEnd(DEFAULT_DAYS.dayEnd);
    setTimeStart(DEFAULT_TIMES.timeStart);
    setTimeEnd(DEFAULT_TIMES.timeEnd);
    syncedValueRef.current = v;
  }, [value]);

  const handleDayStart = (e) => {
    const nextDay = e.target.value;
    setDayStart(nextDay);
    emitAvailability(nextDay, dayEnd, timeStart, timeEnd);
  };

  const handleDayEnd = (e) => {
    const nextDay = e.target.value;
    setDayEnd(nextDay);
    emitAvailability(dayStart, nextDay, timeStart, timeEnd);
  };

  const handleTimeStart = (e) => {
    const nextTime = e.target.value;
    setTimeStart(nextTime);
    emitAvailability(dayStart, dayEnd, nextTime, timeEnd);
  };

  const handleTimeEnd = (e) => {
    const nextTime = e.target.value;
    setTimeEnd(nextTime);
    emitAvailability(dayStart, dayEnd, timeStart, nextTime);
  };

  const combined = formatDayRangeAvailability(dayStart, dayEnd, timeStart, timeEnd);
  const vTrim = availabilityToString(value).trim();
  const legacyFreeText =
    Boolean(vTrim) &&
    !parseDayRangeAvailability(vTrim) &&
    !parseIsoDateAvailability(vTrim);
  const legacyIso = Boolean(vTrim) && parseIsoDateAvailability(vTrim);

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
        Availability (day range and hours)
      </Typography>

      {legacyFreeText && (
        <Typography variant="caption" color="warning.main" display="block" sx={{ mb: 1 }}>
          Stored value doesn&apos;t match the day-range format. Adjust below to save. Current:{' '}
          <strong>{value}</strong>
        </Typography>
      )}

      {legacyIso && (
        <Typography variant="caption" color="warning.main" display="block" sx={{ mb: 1 }}>
          Stored value uses calendar dates. Pick weekdays and times below to replace it.
        </Typography>
      )}

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'flex-start',
        }}
      >
        <FormControl size="small" disabled={disabled} sx={{ minWidth: 160 }}>
          <InputLabel id={`${idPrefix}-day-from`}>First day</InputLabel>
          <Select
            labelId={`${idPrefix}-day-from`}
            label="First day"
            value={dayStart}
            onChange={handleDayStart}
          >
            {WEEKDAYS.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" disabled={disabled} sx={{ minWidth: 160 }}>
          <InputLabel id={`${idPrefix}-day-to`}>Last day</InputLabel>
          <Select
            labelId={`${idPrefix}-day-to`}
            label="Last day"
            value={dayEnd}
            onChange={handleDayEnd}
          >
            {WEEKDAYS.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          id={`${idPrefix}-time-start`}
          label="Start time"
          type="time"
          value={timeStart}
          onChange={handleTimeStart}
          disabled={disabled}
          InputLabelProps={{ shrink: true }}
          inputProps={{ step: 300 }}
          size="small"
        />
        <TextField
          id={`${idPrefix}-time-end`}
          label="End time"
          type="time"
          value={timeEnd}
          onChange={handleTimeEnd}
          disabled={disabled}
          InputLabelProps={{ shrink: true }}
          inputProps={{ step: 300 }}
          size="small"
        />
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
        Request payload <code style={{ fontSize: '0.8rem' }}>availability</code>:{' '}
        <code style={{ fontSize: '0.8rem' }}>{combined || '—'}</code>
      </Typography>
    </Box>
  );
}
