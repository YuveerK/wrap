import { DarkTheme, DefaultTheme } from "@react-navigation/native";

/**
 * @param {"light" | "dark"} scheme
 * @param {import("./colors").typeof lightColors} colors
 */
export function buildNavigationTheme(scheme, colors) {
  const base = scheme === "dark" ? DarkTheme : DefaultTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };
}
