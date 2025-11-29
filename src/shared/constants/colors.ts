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
    surface: '#F8F9FA',
    secondary: '#F7F3FF',
    tertiary: '#F2EDFF',
    other: '#E1D9FF',
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
  momentBackground: '#FDFCFF',

  // semantic groups (nested)
  ...semanticColors,
};

// 웹 환경에서 CSS 변수를 활용하기 위한 유틸리티
export const getColor = (colorKey: string, fallback?: string): string => {
  if (typeof window !== 'undefined' && window.getComputedStyle) {
    const style = getComputedStyle(document.documentElement);
    const value = style.getPropertyValue(`--${colorKey}`);
    return value || fallback || '#000000';
  }

  // 네이티브 환경 또는 fallback
  const colorMap: Record<string, string> = {
    'brand-primary': semanticColors.brand.primary,
    'brand-on-primary': semanticColors.brand.onPrimary,
    'brand-accent': semanticColors.brand.accent,
    'brand-secondary': semanticColors.brand.secondary,
    'brand-deep': semanticColors.brand.deep,
    'surface-background': semanticColors.surface.background,
    'surface-surface': semanticColors.surface.surface,
    'surface-secondary': semanticColors.surface.secondary,
    'surface-tertiary': semanticColors.surface.tertiary,
    'surface-other': semanticColors.surface.other,
    'surface-inverse': semanticColors.surface.inverse,
    'text-primary': semanticColors.text.primary,
    'text-secondary': semanticColors.text.secondary,
    'text-muted': semanticColors.text.muted,
    'text-disabled': semanticColors.text.disabled,
    'text-inverse': semanticColors.text.inverse,
    'border-smooth': semanticColors.border.smooth,
    'border-default': semanticColors.border.default,
    'border-strong': semanticColors.border.strong,
    'primary-purple': colors.primaryPurple,
    'strong-purple': colors.strongPurple,
    'light-purple': colors.lightPurple,
    'card-purple': colors.cardPurple,
    'more-light-purple': colors.moreLightPurple,
    'dark-purple': colors.darkPurple,
    'white': colors.white,
    'black': colors.black,
    'strong': colors.strong,
    'gray': colors.gray,
  };

  return colorMap[colorKey] || fallback || '#000000';
};

// 웹 환경에서 색상 객체를 생성하는 헬퍼
export const createWebColors = () => {
  return {
    ...semanticColors,
    // CSS 변수 참조를 포함한 웹 전용 색상
    web: {
      brand: {
        primary: getColor('brand-primary', semanticColors.brand.primary),
        onPrimary: getColor('brand-on-primary', semanticColors.brand.onPrimary),
        accent: getColor('brand-accent', semanticColors.brand.accent),
        secondary: getColor('brand-secondary', semanticColors.brand.secondary),
        deep: getColor('brand-deep', semanticColors.brand.deep),
      },
      surface: {
        background: getColor('surface-background', semanticColors.surface.background),
        surface: getColor('surface-surface', semanticColors.surface.surface),
        secondary: getColor('surface-secondary', semanticColors.surface.secondary),
        tertiary: getColor('surface-tertiary', semanticColors.surface.tertiary),
        other: getColor('surface-other', semanticColors.surface.other),
        inverse: getColor('surface-inverse', semanticColors.surface.inverse),
      },
      text: {
        primary: getColor('text-primary', semanticColors.text.primary),
        secondary: getColor('text-secondary', semanticColors.text.secondary),
        muted: getColor('text-muted', semanticColors.text.muted),
        disabled: getColor('text-disabled', semanticColors.text.disabled),
        inverse: getColor('text-inverse', semanticColors.text.inverse),
      },
      border: {
        smooth: getColor('border-smooth', semanticColors.border.smooth),
        default: getColor('border-default', semanticColors.border.default),
        strong: getColor('border-strong', semanticColors.border.strong),
      },
    },
  };
};

export default colors;
