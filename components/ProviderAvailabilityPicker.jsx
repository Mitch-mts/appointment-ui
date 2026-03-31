'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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

export default function ProviderAvailabilityPicker({
  value,
  onChange,
  disabled = false,
  idPrefix = 'availability',
}) {
  const [dayStart, setDayStart] = useState('Monday');
  const [dayEnd, setDayEnd] = useState('Wednesday');
  const [timeStart, setTimeStart] = useState('08:00');
  const [timeEnd, setTimeEnd] = useState('11:00');
  const touchedRef = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const combined = useMemo(() => {
    if (!timeStart || !timeEnd) return '';
    const [d0, d1] = normalizeDayRange(dayStart, dayEnd);
    return formatDayRangeAvailability(d0, d1, timeStart, timeEnd);
  }, [dayStart, dayEnd, timeStart, timeEnd]);

  useEffect(() => {
    const v = (value ?? '').trim();
    const parsed = parseDayRangeAvailability(v);
    if (parsed) {
      setDayStart(parsed.dayStart);
      setDayEnd(parsed.dayEnd);
      setTimeStart(parsed.timeStart);
      setTimeEnd(parsed.timeEnd);
      touchedRef.current = false;
      return;
    }
    setDayStart('Monday');
    setDayEnd('Wednesday');
    setTimeStart('08:00');
    setTimeEnd('11:00');
    touchedRef.current = false;
    if (!v) {
      const next = formatDayRangeAvailability(
        'Monday',
        'Wednesday',
        '08:00',
        '11:00'
      );
      queueMicrotask(() => onChangeRef.current(next));
    }
  }, [value]);

  useEffect(() => {
    if (!combined) return;
    const v = (value ?? '').trim();
    if (!v) return;
    if (combined === v) return;
    const isDay = parseDayRangeAvailability(v);
    if (!isDay && !touchedRef.current) return;
    if (parseIsoDateAvailability(v) && !touchedRef.current) return;
    onChangeRef.current(combined);
  }, [combined, value]);

  const markTouched = () => {
    touchedRef.current = true;
  };

  const handleDayStart = (e) => {
    markTouched();
    setDayStart(e.target.value);
  };

  const handleDayEnd = (e) => {
    markTouched();
    setDayEnd(e.target.value);
  };

  const handleTimeStart = (e) => {
    markTouched();
    setTimeStart(e.target.value);
  };

  const handleTimeEnd = (e) => {
    markTouched();
    setTimeEnd(e.target.value);
  };

  const vTrim = (value ?? '').trim();
  const legacyFreeText =
    Boolean(vTrim) &&
    !parseDayRangeAvailability(value) &&
    !parseIsoDateAvailability(value);
  const legacyIso = Boolean(vTrim) && parseIsoDateAvailability(value);

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
