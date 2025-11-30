// Semantic color palette
export const semanticColors = {
  brand: {
    primary: '#7A4AE2',
    onPrimary: '#FFFFFF',
    accent: '#A892D7',
    secondary: '#9747FF',
    deep: '#49386E',
  },
  surface: {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    secondary: '#F7F3FF',
    tertiary: '#F2EDFF',
    other: '#E1D9FF',
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

// Legacy colors mapped to semantic colors for backward compatibility
const colors = {
  // Legacy names mapped to semantic colors
  primaryPurple: semanticColors.brand.primary,
  strongPurple: semanticColors.brand.deep,
  lightPurple: semanticColors.surface.other,
  cardPurple: semanticColors.surface.secondary,
  moreLightPurple: semanticColors.surface.tertiary,
  darkPurple: semanticColors.brand.secondary,
  white: semanticColors.surface.background,
  black: semanticColors.surface.inverse,
  strong: semanticColors.text.secondary,
  gray: semanticColors.text.disabled,
  gray300: '#D1D5DB',
  gray600: '#8B94A1',
  momentBackground: '#FDFCFF',

  // Include semantic colors for direct access
  ...semanticColors,
};

export default colors;
