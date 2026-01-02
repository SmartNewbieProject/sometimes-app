export const semanticColors = {
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
    tertiary: '#666666',
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
