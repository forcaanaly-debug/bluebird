/**
 * BlueBird Japandi design tokens
 * Warm neutrals, moss green, clay accents — minimal contrast, calm rhythm.
 */

export const color = {
  bg: "#f4efe6",
  bgElevated: "#f7f2e8",
  surface: "#fbf8f1",
  surfaceCard: "#f8f4ec",
  border: "#d8ccbb",
  borderMuted: "#cabca8",
  borderHairline: "#ded3c3",

  ink: "#2f463d",
  inkSecondary: "#34493f",
  body: "#59695f",
  muted: "#6f7e73",
  subtle: "#7f887b",

  accent: "#6f8f79",
  accentDark: "#2f463d",
  onAccent: "#f8f4ec",

  clay: "#e8decd",
  warn: "#b8860b",
  error: "#9a4d4d"
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 14,
  pill: 999
} as const;

export const type = {
  /** Use platform defaults; sizes for hierarchy */
  brand: { fontSize: 28, fontWeight: "700" as const, letterSpacing: 0.3 },
  title: { fontSize: 24, fontWeight: "700" as const },
  subtitle: { fontSize: 12 },
  body: { fontSize: 13 },
  label: { fontSize: 12 },
  tab: { fontSize: 12, fontWeight: "600" as const },
  meta: { fontSize: 13 }
} as const;

export const shadow = {
  card: {
    shadowColor: "#2f463d",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2
  }
} as const;
