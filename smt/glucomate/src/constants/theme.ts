// GlucoMate Design System

export const COLORS = {
  // Modern Primary Brand Colors - Deep Blue Gradient
  primary: "#2563eb", // Modern blue
  primaryLight: "#3b82f6", // Lighter blue
  primaryDark: "#1d4ed8", // Darker blue
  primaryBg: "#eff6ff", // Very light blue background

  // Modern Status Colors
  success: "#059669", // Modern emerald
  successBg: "#d1fae5",
  warning: "#d97706", // Modern amber
  warningBg: "#fef3c7",
  error: "#dc2626", // Modern red
  errorBg: "#fee2e2",
  info: "#0284c7", // Modern sky
  infoBg: "#e0f2fe",

  // Modern Glucose Level Colors
  glucoseNormal: "#059669", // Modern emerald
  glucoseLow: "#dc2626", // Modern red
  glucoseHigh: "#d97706", // Modern amber

  // Modern Neutral Colors
  white: "#ffffff",
  black: "#000000",
  background: "#fafbfc", // Very light gray
  backgroundDark: "#f1f5f9", // Light gray

  // Modern Text Colors - High contrast
  textPrimary: "#0f172a", // Slate 900
  textSecondary: "#64748b", // Slate 500
  textTertiary: "#94a3b8", // Slate 400
  textDisabled: "#cbd5e1", // Slate 300

  // Modern Border Colors
  border: "#e2e8f0", // Slate 200
  borderLight: "#f1f5f9", // Slate 100
  borderDark: "#cbd5e1", // Slate 300

  // Modern Reading Type Colors
  typeFasting: "#7c3aed", // Modern violet
  typePostMeal: "#ea580c", // Modern orange
  typeRandom: "#2563eb", // Modern blue

  // Modern Accent Colors
  accent: "#8b5cf6", // Purple accent
  accentBg: "#f3e8ff",
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 18,
  lg: 20,
  xl: 24,
  xxl: 28,
  xxxl: 32,
  huge: 36,
  display: 48,
};

export const FONT_WEIGHTS = {
  light: "300" as const,
  normal: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  extrabold: "800" as const,
};

export const SHADOWS = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  xl: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  primary: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  success: {
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  error: {
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
};

export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 400,
  slower: 500,
};