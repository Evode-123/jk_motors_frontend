export const API_BASE_URL    = process.env.REACT_APP_API_BASE_URL    || 'http://localhost:8080/api';
export const STATIC_BASE_URL = process.env.REACT_APP_STATIC_BASE_URL || 'http://localhost:8080';
export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

export const USER_ROLES = { ADMIN: 'ADMIN', CLIENT: 'CLIENT' };

export const STORAGE_KEYS = {
  ACCESS_TOKEN:  'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER:          'user',
};

export const PASSWORD_MIN_LENGTH = 8;

export const ORDER_STATUS = {
  PENDING:   'PENDING',
  APPROVED:  'APPROVED',
  CONFIRMED: 'CONFIRMED',
  REJECTED:  'REJECTED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
};

export const SERVICE_TYPE = {
  SERVICE_ONLY: 'SERVICE_ONLY',
  WITH_INSTALL: 'WITH_INSTALL',
};

export const FUEL_TYPE = {
  PETROL:   'PETROL',
  DIESEL:   'DIESEL',
  HYBRID:   'HYBRID',
  ELECTRIC: 'ELECTRIC',
};

export const STATUS_LABELS = {
  PENDING:   'Pending Review',
  APPROVED:  'Awaiting Your Confirmation',
  CONFIRMED: 'Confirmed — Service Scheduled',
  REJECTED:  'Rejected',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
};

export const STATUS_COLORS = {
  PENDING:   { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  APPROVED:  { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  CONFIRMED: { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
  REJECTED:  { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
  CANCELLED: { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' },
  COMPLETED: { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
};