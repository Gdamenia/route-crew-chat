export const STATUS_OPTIONS = [
  { value: 'available' as const, label: 'Available', color: 'hsl(var(--status-available))' },
  { value: 'driving' as const, label: 'Driving', color: 'hsl(var(--status-driving))' },
  { value: 'resting' as const, label: 'Resting', color: 'hsl(var(--status-resting))' },
  { value: 'dnd' as const, label: 'Do Not Disturb', color: 'hsl(var(--status-dnd))' },
];

export const VISIBILITY_OPTIONS = [
  { value: 'visible_nearby' as const, label: 'Visible to Nearby Drivers' },
  { value: 'visible_channels' as const, label: 'Visible in Channels Only' },
  { value: 'hidden' as const, label: 'Hidden' },
];

export const TRUCK_TYPES = [
  'Semi (18-Wheeler)',
  'Box Truck',
  'Flatbed',
  'Tanker',
  'Refrigerated',
  'Other',
];

export const LANGUAGES = [
  { code: 'en' as const, name: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'ru' as const, name: 'Russian', native: 'Русский', flag: '🇷🇺' },
  { code: 'ka' as const, name: 'Georgian', native: 'ქართული', flag: '🇬🇪' },
  { code: 'es' as const, name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'uk' as const, name: 'Ukrainian', native: 'Українська', flag: '🇺🇦' },
  { code: 'pl' as const, name: 'Polish', native: 'Polski', flag: '🇵🇱' },
  { code: 'hi' as const, name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'am' as const, name: 'Amharic', native: 'አማርኛ', flag: '🇪🇹' },
];

export const PRESENCE_UPDATE_INTERVAL_MS = 30000;
