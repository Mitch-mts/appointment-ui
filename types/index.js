// Constants for appointment status
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'SCHEDULED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED'
};

// Constants for user roles
export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN'
};

// Helper function to validate appointment status
export const isValidAppointmentStatus = (status) => {
  return Object.values(APPOINTMENT_STATUS).includes(status);
};

// Helper function to validate user role
export const isValidUserRole = (role) => {
  return Object.values(USER_ROLES).includes(role);
};

// Helper function to create API response
export const createApiResponse = (success, data = null, message = '', error = '') => {
  return {
    success,
    data,
    message,
    error
  };
};
