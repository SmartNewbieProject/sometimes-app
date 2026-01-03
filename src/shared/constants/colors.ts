// Legacy + Tailwind export map
// Keep existing keys for backward-compatibility
// semanticColors is inlined here to avoid circular reference issues at module load time

// Semantic color tokens - inlined to prevent circular reference
const semanticColorsInline = {
  brand: {
    primary: '#7A4AE2',
    onPrimary: '#FFFFFF',
    accent: '#A892D7',
    secondary: '#9747FF',
    deep: '#49386E',
    primaryLight: '#E2D5FF',
  },
  surface: {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    secondary: '#F7F3FF',
    tertiary: '#F2EDFF',
    other: '#E1D9FF',
    inverse: '#000000',
    disabled: '#E5E7EB',
    matchWaiting: '#D9D9D9',
  },
  text: {
    primary: '#000000',
    secondary: '#333333',
    muted: '#7C7C7C',
    disabled: '#AEAEAE',
    inverse: '#FFFFFF',
    mutedAccessible: '#666666',
  },
  border: {
    smooth: '#e4e2e2ff',
    default: '#AEAEAE',
    strong: '#333333',
  },
  state: {
    error: '#FF0000',
    warning: '#FFB02E',
    success: '#80FF80',
    info: '#0000FF',
    attention: '#F70A8D',
  },
  overlay: {
    scrim: '#000000',
  },
} as const;

// Define base legacy colors separately for proper type inference
const legacyColors = {
  primaryPurple: '#7A4AE2',
  strongPurple: '#49386E',
  lightPurple: '#E2D5FF',
  cardPurple: '#F7F3FF',
  moreLightPurple: '#F6F2FF',
  darkPurple: '#7C3AED',
  white: '#FFFFFF',
  black: '#000000',
  strong: '#2F2F2F',
  gray: '#9CA3AF',
  'gray-300': '#D1D5DB',
  'gray-600': '#8B94A1',
  gray100: '#F3F4F6',
  gray500: '#6B7280',
  gray600: '#4B5563',
  red500: '#EF4444',
  momentBackground: '#FDFCFF',
  lightGray: '#D1D5DB',
  green: '#22C55E',
  orange: '#F97316',
  red: '#EF4444',
} as const;

const colors = {
  ...legacyColors,
  ...semanticColorsInline,
} as const;

export default colors;
export { semanticColorsInline as semanticColors };
