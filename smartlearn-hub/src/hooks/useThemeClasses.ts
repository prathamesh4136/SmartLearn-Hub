// hooks/useThemeClasses.ts
import { useTheme } from "../context/ThemeContext";

export function useThemeClasses() {
  const { theme } = useTheme();

  const bgColor =
    theme === "dark"
      ? "bg-gray-900"
      : theme === "blue"
      ? "bg-blue-50"
      : theme === "purple"
      ? "bg-purple-50"
      : "bg-white";

  const textColor =
    theme === "dark"
      ? "text-black-300"
      : theme === "blue"
      ? "text-blue-900"
      : theme === "purple"
      ? "text-purple-900"
      : "text-gray-800";

  const buttonGreen =
    theme === "dark"
      ? "bg-green-700 hover:bg-green-600"
      : theme === "blue"
      ? "bg-blue-600 hover:bg-blue-700"
      : theme === "purple"
      ? "bg-purple-600 hover:bg-purple-700"
      : "bg-green-600 hover:bg-green-700";

  const borderColor =
    theme === "dark"
      ? "border-gray-600"
      : theme === "blue"
      ? "border-blue-200"
      : theme === "purple"
      ? "border-purple-200"
      : "border-gray-300";

  const optionHoverBg =
    theme === "dark"
      ? "hover:bg-gray-700"
      : "hover:bg-gray-100";

  const highlightCorrect = "bg-green-100 dark:bg-green-900/30 border-green-500";
  const highlightWrong = "bg-red-100 dark:bg-red-900/30 border-red-500";

  return {
    bgColor,
    textColor,
    buttonGreen,
    borderColor,
    optionHoverBg,
    highlightCorrect,
    highlightWrong,
  };
}
