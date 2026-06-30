import { APPOINTMENT_STATUS } from '../types/index.js';
import { providerDisplayName } from './providers.js';

/** Read provider id from appointment (API field or legacy notes). */
export function getAppointmentProviderId(appointment) {
  if (!appointment) return null;
  if (appointment.providerId != null && appointment.providerId !== '') {
    return String(appointment.providerId);
  }
  if (appointment.provider?.id != null) {
    return String(appointment.provider.id);
  }
  return null;
}

/** User-facing provider label on an appointment. */
export function getAppointmentProviderLabel(appointment, providersById = {}) {
  if (!appointment) return null;
  if (appointment.providerName) return appointment.providerName;
  if (appointment.provider?.fullName) {
    return providerDisplayName(appointment.provider);
  }
  const id = getAppointmentProviderId(appointment);
  if (id && providersById[id]) {
    return providerDisplayName(providersById[id]);
  }
  const notes = appointment.notes || '';
  const legacy = notes.match(/^Provider:\s*(.+?)(?:\n|$)/m);
  if (legacy) return legacy[1].trim();
  return null;
}

/** Strip auto-generated provider lines from notes for display. */
export function getUserNotes(appointment) {
  if (!appointment?.notes) return '';
  return appointment.notes
    .replace(/^Provider:.*$/m, '')
    .replace(/^Service:.*$/m, '')
    .replace(/^Availability:.*$/m, '')
    .replace(/^Additional notes:\s*/i, '')
    .trim();
}

export function isActiveAppointment(appointment) {
  const status = appointment?.bookingStatus;
  return (
    !status ||
    status === APPOINTMENT_STATUS.PENDING ||
    status === APPOINTMENT_STATUS.SCHEDULED
  );
}

export function canReschedule(appointment) {
  return isActiveAppointment(appointment);
}

export function canCancel(appointment) {
  return isActiveAppointment(appointment);
}

export function buildProvidersMap(providers) {
  const map = {};
  if (!Array.isArray(providers)) return map;
  for (const p of providers) {
    if (p?.id != null) map[String(p.id)] = p;
  }
  return map;
}
