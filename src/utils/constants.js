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
  PENDING:   {
    bg:     'rgba(201,168,76,0.12)',
    text:   '#C9A84C',
    border: 'rgba(201,168,76,0.3)',
  },
  APPROVED:  {
    bg:     'rgba(168,136,72,0.1)',
    text:   '#E8C96A',
    border: 'rgba(201,168,76,0.35)',
  },
  CONFIRMED: {
    bg:     'rgba(34,120,80,0.12)',
    text:   '#6ee7b7',
    border: 'rgba(34,120,80,0.3)',
  },
  REJECTED:  {
    bg:     'rgba(180,60,40,0.1)',
    text:   '#f87171',
    border: 'rgba(180,60,40,0.28)',
  },
  CANCELLED: {
    bg:     'rgba(80,70,50,0.15)',
    text:   '#a89060',
    border: 'rgba(120,100,60,0.25)',
  },
  COMPLETED: {
    bg:     'rgba(34,120,80,0.12)',
    text:   '#6ee7b7',
    border: 'rgba(34,120,80,0.3)',
  },
};

export const THEME = {
  colors: {
    gold:         '#C9A84C',
    goldLight:    '#E8C96A',
    goldDim:      'rgba(201,168,76,0.2)',
    goldDimmer:   'rgba(201,168,76,0.12)',
    goldText:     '#C9A84C',
    bg:           '#0A0804',
    surface:      '#141008',
    surface2:     '#1C1609',
    surface3:     '#241C0C',
    textPrimary:  '#F5E4B8',
    textSecond:   '#C9A84C',
    textMuted:    'rgba(168,136,72,0.7)',
    border:       'rgba(201,168,76,0.18)',
    borderBright: 'rgba(201,168,76,0.35)',
  },
  card: {
    background:   'rgba(28, 22, 9, 0.6)',
    border:       '1px solid rgba(201,168,76,0.18)',
    borderRadius: 16,
    padding:      20,
  },
  input: {
    background: 'rgba(20, 16, 8, 0.8)',
    border:     '1px solid rgba(201,168,76,0.22)',
    color:      '#E8D5A0',
    borderRadius: 12,
    padding:    '10px 16px',
    fontSize:   14,
  },
  font: {
    heading: "'Playfair Display', 'Orbitron', serif",
    body:    "'DM Sans', 'Space Grotesk', sans-serif",
    mono:    "monospace",
  },
};