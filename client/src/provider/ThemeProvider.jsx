import { useEffect } from "react";
import useAuth from "../hooks/useAuth";

// Brand defaults — mirrored from server/utils/subscriberPricing.js DEFAULT_THEME
const DEFAULT_PRIMARY = { hex: "#FA6023", rgb: "250 96 35" };
const DEFAULT_SECONDARY = { hex: "#E61C55", rgb: "230 28 85" };

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

// "#123456" → "18 52 86". The vars MUST stay space-separated R G B triplets —
// tailwind.config.js consumes them via rgb(var(--theme-*) / …).
const hexToRgbTriplet = (hex) => {
  const h = hex.replace("#", "");
  return `${parseInt(h.slice(0, 2), 16)} ${parseInt(h.slice(2, 4), 16)} ${parseInt(
    h.slice(4, 6),
    16
  )}`;
};

// Valid hex color or null — per-field sanitization so a malformed color
// anywhere (bad doc, hand-edited DB) degrades to the brand default instead
// of producing NaN CSS.
const validHex = (hex) =>
  typeof hex === "string" && HEX_RE.test(hex) ? hex : null;

// Simple perceived-luminance pick for daisyui content colors (text on top of
// a themed background). Threshold tuned so brand orange keeps white text.
const contrastText = (hex) => {
  const [r, g, b] = hexToRgbTriplet(hex).split(" ").map(Number);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#1f2937" : "#ffffff";
};

// Applies the winning-tier theme to the whole site. theme = subscriptionTheme
// object ({typeName, primaryColor, secondaryColor}) or null → brand defaults.
// daisyui fallback vars (--fallback-*) take raw hex and are consumed directly
// by daisyui internals (--p/--s themselves are oklch-wrapped — hex there is
// invalid CSS, so they are never touched).
const applyTheme = (theme) => {
  const primary = theme ? validHex(theme.primaryColor) : null;
  const secondary = theme ? validHex(theme.secondaryColor) : null;
  const root = document.documentElement;
  root.style.setProperty(
    "--theme-primary",
    primary ? hexToRgbTriplet(primary) : DEFAULT_PRIMARY.rgb
  );
  root.style.setProperty(
    "--theme-secondary",
    secondary ? hexToRgbTriplet(secondary) : DEFAULT_SECONDARY.rgb
  );
  root.style.setProperty("--fallback-p", primary || DEFAULT_PRIMARY.hex);
  root.style.setProperty(
    "--fallback-pc",
    primary ? contrastText(primary) : "#ffffff"
  );
  root.style.setProperty("--fallback-s", secondary || DEFAULT_SECONDARY.hex);
  root.style.setProperty(
    "--fallback-sc",
    secondary ? contrastText(secondary) : "#ffffff"
  );
};

const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  useEffect(() => {
    applyTheme(user?.subscriptionTheme || null);
  }, [user?.subscriptionTheme]);
  return children;
};

export default ThemeProvider;
