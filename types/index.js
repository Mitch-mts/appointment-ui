// Unified appointment status (align with Java backend)
export const APPOINTMENT_STATUS = {
  PENDING: 'PENDING',
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const APPOINTMENT_STATUS_LABELS = {
  PENDING: 'Pending',
  SCHEDULED: 'Scheduled',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
};

export const isValidAppointmentStatus = (status) =>
  Object.values(APPOINTMENT_STATUS).includes(status);

export const isValidUserRole = (role) => Object.values(USER_ROLES).includes(role);

export const createApiResponse = (success, data = null, message = '', error = '') => ({
  success,
  data,
  message,
  error,
});
