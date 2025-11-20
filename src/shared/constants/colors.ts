// Consolidated semantic palette (aggressively merged)
// Threshold used in clustering (ΔE76): ~12, see color-map.json for details.
export const semanticColors = {
  brand: {
    primary: '#7A4AE2',
    onPrimary: '#FFFFFF',
    // supporting brand tones
    accent: '#A892D7',
    secondary: '#9747FF',
    deep: '#49386E',
  },
  surface: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    // Use opacity/alpha overlays for elevation if needed
    inverse: '#000000',
  },
  text: {
    primary: '#000000',
    secondary: '#333333',
    muted: '#7C7C7C',
    disabled: '#AEAEAE',
    inverse: '#FFFFFF',
  },
  border: {
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
    scrim: '#000000', // apply with alpha externally
  },
} as const;

// Legacy + Tailwind export map
// Keep existing keys for backward-compatibility, and expose semantic groups for Tailwind (bg-brand-primary, text-text-muted, etc.)
const colors = {
  // legacy names
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
  // biome-ignore lint/complexity/useLiteralKeys: <explanation>
  ['gray-300']: '#D1D5DB',
  // biome-ignore lint/complexity/useLiteralKeys: <explanation>
  ['gray-600']: '#8B94A1',

  // semantic groups (nested)
  ...semanticColors,
};

export default colors;
