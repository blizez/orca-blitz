export interface ColorTheme {
  id: string;
  name: string;
  className: string;
  preview: { bg: string; fg: string; primary: string };
  light: Record<string, string>;
  dark: Record<string, string>;
}

export const colorThemes: ColorTheme[] = [
  {
    id: "default",
    name: "Default",
    className: "",
    preview: { bg: "#ffffff", fg: "#0a0a0a", primary: "#171717" },
    light: {},
    dark: {},
  },
  {
    id: "deep-purple",
    name: "Deep Purple",
    className: "theme-deep-purple",
    preview: { bg: "#f8fafc", fg: "#030711", primary: "#6b26d9" },
    light: {},
    dark: {},
  },
  {
    id: "examdedo",
    name: "Examdedo",
    className: "theme-examdedo",
    preview: { bg: "#f9f7f1", fg: "#4e3f31", primary: "#b77c41" },
    light: {},
    dark: {},
  },
  {
    id: "jamaica",
    name: "Jamaica",
    className: "theme-jamaica",
    preview: { bg: "#fbfbf8", fg: "#05140d", primary: "#16a249" },
    light: {},
    dark: {},
  },
  {
    id: "my-theme",
    name: "MY THEME",
    className: "theme-my-theme",
    preview: { bg: "#f9f9f9", fg: "#202020", primary: "#644a40" },
    light: {},
    dark: {},
  },
  {
    id: "qrafthive",
    name: "Qrafthive",
    className: "theme-qrafthive",
    preview: { bg: "#ffffff", fg: "#111827", primary: "#d87943" },
    light: {},
    dark: {},
  },
  {
    id: "teal-hue",
    name: "Teal Hue",
    className: "theme-teal-hue",
    preview: { bg: "#f8fcfb", fg: "#173636", primary: "#00b398" },
    light: {},
    dark: {},
  },
  {
    id: "terminal-muted",
    name: "Terminal Muted",
    className: "theme-terminal-muted",
    preview: { bg: "#f0f4f2", fg: "#1f2e24", primary: "#367d50" },
    light: {},
    dark: {},
  },
  {
    id: "witch-rave",
    name: "Witch Rave",
    className: "theme-witch-rave",
    preview: { bg: "#f9fafc", fg: "#1a1c2e", primary: "#0aa347" },
    light: {},
    dark: {},
  },
  {
    id: "zen-inspired",
    name: "Zen Inspired",
    className: "theme-zen-inspired",
    preview: { bg: "#e9e4d8", fg: "#1e1e1e", primary: "#2e2e2e" },
    light: {},
    dark: {},
  },
];
