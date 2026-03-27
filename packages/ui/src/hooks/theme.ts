import { useTheme as useNextTheme } from "next-themes";
import type { ThemeMode } from "@workspace/contracts";

export const useTheme = () => {
  const { setTheme, theme, systemTheme } = useNextTheme();

  const resolveTheme = (theme?: string) => {
    const currentTheme = theme === "system" ? systemTheme : theme;
    return currentTheme as Omit<ThemeMode, "system">;
  };

  const currentTheme = resolveTheme(theme);

  const toggleTheme = () =>
    setTheme(currentTheme === "dark" ? "light" : "dark");

  const syncTheme = (theme: ThemeMode) => {
    const userTheme = resolveTheme(theme);
    setTheme(userTheme as string);
  };

  return { theme: currentTheme!, toggleTheme, syncTheme };
};
