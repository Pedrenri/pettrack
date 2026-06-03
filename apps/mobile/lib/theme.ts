export const colors = {
  // Brand
  emerald: {
    50:  "#ecfdf5",
    100: "#d1fae5",
    600: "#059669",
    700: "#047857",
    950: "#022c22",
  },
  // Neutrals
  white:   "#ffffff",
  gray: {
    50:  "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
  // Status
  red:    { 50: "#fef2f2", 400: "#f87171", 500: "#ef4444" },
  amber:  { 50: "#fffbeb", 400: "#fbbf24", 500: "#f59e0b" },
  yellow: { 50: "#fefce8", 400: "#facc15" },
  blue:   { 50: "#eff6ff", 600: "#2563eb" },
  purple: { 50: "#faf5ff", 600: "#9333ea" },
  teal:   { 50: "#f0fdfa", 600: "#0d9488" },
};

export const radius = {
  sm:  8,
  md:  12,
  lg:  16,  // rounded-2xl equivalent
  xl:  20,
  full: 9999,
};

export const shadow = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
};

export const text = {
  xs:   11,
  sm:   13,
  base: 15,
  lg:   17,
  xl:   20,
  "2xl": 24,
};

// Due status
export const statusColors: Record<string, { dot: string; text: string; bg: string }> = {
  overdue: { dot: colors.red[500],   text: colors.red[500],   bg: colors.red[50]   },
  today:   { dot: colors.amber[500], text: colors.amber[500], bg: colors.amber[50] },
  soon:    { dot: colors.yellow[400],text: colors.amber[500], bg: colors.yellow[50]},
  ok:      { dot: colors.emerald[600],text: colors.emerald[600], bg: colors.emerald[50] },
  done:    { dot: colors.gray[400],  text: colors.gray[400],  bg: colors.gray[100] },
};

// Schedule type badge colors
export const scheduleTypeColors: Record<string, { bg: string; text: string; border: string }> = {
  feeding:    { bg: "#fffbeb", text: "#b45309", border: "#fde68a" },
  supplement: { bg: "#faf5ff", text: "#7e22ce", border: "#e9d5ff" },
  handling:   { bg: "#f0fdfa", text: "#0f766e", border: "#99f6e4" },
  vet:        { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  medication: { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca" },
  custom:     { bg: colors.gray[100], text: colors.gray[600], border: colors.gray[200] },
};

// Log type badge colors
export const logTypeColors: Record<string, { bg: string; text: string }> = {
  feeding:  { bg: "#fffbeb", text: "#b45309" },
  weight:   { bg: "#ecfdf5", text: "#047857" },
  medical:  { bg: "#eff6ff", text: "#1d4ed8" },
  shed:     { bg: "#faf5ff", text: "#7e22ce" },
  handling: { bg: "#f0fdfa", text: "#0f766e" },
  custom:   { bg: colors.gray[100], text: colors.gray[600] },
};
