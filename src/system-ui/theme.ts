// System UI theme boundary. Product code consumes one DesktopTheme; every
// period-specific color, metric, glyph and chrome class stays in this file.
// Changing the active theme never changes the Pocket System manifest, native
// host, AppSupervisor or child application plans.

/** Baked W95FA slots (src/system-ui/gen-assets.ts -> pak.json). */
export const FONT = 19;
export const FONT_B = 20;
export const FONT_XL = 21;

export type ThemeId = "classic" | "xp";

export interface ChromeMetrics {
  frame: number;
  titleH: number;
  titleGap: number;
  buttonW: number;
  buttonH: number;
  buttonTop: number;
  buttonRight: number;
  buttonGap: number;
  menuH: number;
  taskH: number;
  taskLeft: number;
  taskStartW: number;
  taskGap: number;
  resizeBand: number;
  resizeCorner: number;
}

export interface DesktopTheme {
  id: ThemeId;
  label: string;
  metrics: ChromeMetrics;
  desktop: string;
  windowFrame: (active: boolean) => string;
  windowBody: string;
  caption: (active: boolean) => string;
  captionTitle: (active: boolean) => string;
  captionIcon: string;
  captionControls: string;
  captionButton: (
    button: "min" | "max" | "close",
    pressed: boolean,
    active: boolean,
  ) => string;
  captionGlyphClass: (pressed: boolean) => string;
  captionGlyphSource: (
    button: "min" | "max" | "close",
    maximized: boolean,
  ) => string;
  menuBar: string;
  menuItem: (open: boolean) => string;
  menuText: (open: boolean) => string;
  taskbar: string;
  startButton: (open: boolean) => string;
  startText: string;
  taskDivider: string;
  taskList: string;
  taskButton: (active: boolean) => string;
  taskText: (active: boolean) => string;
  tray: string;
  trayText: string;
  popup: string;
  popupSeparatorDark: string;
  popupSeparatorLight: string;
  popupItem: (hover: boolean) => string;
  popupText: (state: "normal" | "hover" | "disabled") => string;
  startMenu: string;
  startRail: string;
  startItem: (hover: boolean) => string;
  desktopSelection: string;
  desktopLabel: string;
  notepadWell: string;
  selection: string;
  selectionText: string;
  mutedText: string;
  pocketLoading: string;
  minesRoot: string;
  folderWell: string;
  folderHeader: (segment: "name" | "size" | "type") => string;
  folderRow: (selected: boolean) => string;
  statusWell: string;
  dialogButton: (pressed: boolean) => string;
}

// Classic raised chrome is a two-ring outset bevel. Pressing inverts it;
// content wells are sunken. These are full literals because the PocketJS
// compiler resolves the complete class table at build time.
export const CLASSIC_THEME: DesktopTheme = {
  id: "classic",
  label: "Classic 98",
  metrics: {
    frame: 3,
    titleH: 18,
    titleGap: 1,
    buttonW: 16,
    buttonH: 14,
    buttonTop: 2,
    buttonRight: 2,
    buttonGap: 0,
    menuH: 18,
    taskH: 28,
    taskLeft: 2,
    taskStartW: 54,
    taskGap: 3,
    resizeBand: 4,
    resizeCorner: 14,
  },
  desktop: "absolute inset-0 bg-[#008080] overflow-hidden",
  windowFrame: () =>
    "absolute flex-col bg-[#c0c0c0] p-[3] bevel-[#dfdfdf,#000000,#ffffff,#808080]",
  windowBody: "flex-1 flex-col overflow-hidden bg-[#c0c0c0]",
  caption: (active) =>
    active
      ? "flex-row items-center h-[18] pl-[3] pr-[2] bg-gradient-to-r from-[#000080] to-[#1084d0] mb-[1]"
      : "flex-row items-center h-[18] pl-[3] pr-[2] bg-gradient-to-r from-[#808080] to-[#b5b5b5] mb-[1]",
  captionTitle: (active) =>
    active ? "text-[#ffffff]" : "text-[#c0c0c0]",
  captionIcon: "w-[16] h-[16] mr-[3]",
  captionControls: "flex-row items-center",
  captionButton: (_button, pressed) =>
    pressed
      ? "w-[16] h-[14] flex-col justify-center items-center bg-[#c0c0c0] bevel-[#000000,#ffffff,#808080,#dfdfdf]"
      : "w-[16] h-[14] flex-col justify-center items-center bg-[#c0c0c0] bevel-[#ffffff,#000000,#dfdfdf,#808080]",
  captionGlyphClass: (pressed) =>
    pressed ? "w-[8] h-[8] ml-[1] mt-[1]" : "w-[8] h-[8]",
  captionGlyphSource: (button, maximized) => {
    if (maximized) return "icons/cap-restore.svg";
    if (button === "min") return "icons/cap-min.svg";
    if (button === "close") return "icons/cap-close.svg";
    return "icons/cap-max.svg";
  },
  menuBar: "flex-row items-center h-[18] bg-[#c0c0c0]",
  menuItem: (open) =>
    open
      ? "h-[17] px-[6] flex-col justify-center bg-[#000080]"
      : "h-[17] px-[6] flex-col justify-center",
  menuText: (open) => (open ? "text-[#ffffff]" : "text-[#000000]"),
  taskbar:
    "absolute left-0 right-0 bottom-0 h-[28] flex-row items-center bg-[#c0c0c0] bevel-[#ffffff,#808080] pl-[2] pr-[2] gap-[3]",
  startButton: (open) =>
    open
      ? "h-[22] w-[54] flex-row justify-center items-center gap-[3] bg-[#c0c0c0] bevel-[#000000,#ffffff,#808080,#dfdfdf]"
      : "h-[22] w-[54] flex-row justify-center items-center gap-[3] bg-[#c0c0c0] bevel-[#ffffff,#000000,#dfdfdf,#808080]",
  startText: "text-[#000000]",
  taskDivider: "w-[1] h-[22] bevel-[#808080,#ffffff]",
  taskList: "flex-1 flex-row items-center gap-[3] overflow-hidden",
  taskButton: (active) =>
    active
      ? "h-[22] flex-row items-center gap-[4] px-[4] bg-[#dfdfdf] bevel-[#808080,#ffffff]"
      : "h-[22] flex-row items-center gap-[4] px-[4] bg-[#c0c0c0] bevel-[#ffffff,#000000,#dfdfdf,#808080]",
  taskText: () => "text-[#000000]",
  tray: "h-[22] flex-row items-center px-[8] bevel-[#808080,#ffffff]",
  trayText: "text-[#000000]",
  popup:
    "absolute flex-col bg-[#c0c0c0] p-[1] bevel-[#dfdfdf,#000000,#ffffff,#808080]",
  popupSeparatorDark: "h-[1] bg-[#808080]",
  popupSeparatorLight: "h-[1] bg-[#ffffff]",
  popupItem: (hover) =>
    hover
      ? "h-[18] flex-row items-center gap-[5] pl-[4] pr-[8] bg-[#000080]"
      : "h-[18] flex-row items-center gap-[5] pl-[4] pr-[8]",
  popupText: (state) =>
    state === "disabled"
      ? "text-[#808080]"
      : state === "hover"
        ? "text-[#ffffff]"
        : "text-[#000000]",
  startMenu:
    "absolute flex-row bg-[#c0c0c0] p-[1] bevel-[#dfdfdf,#000000,#ffffff,#808080]",
  startRail: "w-[24] h-full bg-gradient-to-t from-[#000080] to-[#1084d0]",
  startItem: (hover) =>
    hover
      ? "h-[26] flex-row items-center gap-[6] pl-[6] pr-[6] bg-[#000080]"
      : "h-[26] flex-row items-center gap-[6] pl-[6] pr-[6]",
  desktopSelection: "bg-[#000080] px-[2]",
  desktopLabel: "text-[#ffffff]",
  notepadWell:
    "flex-1 flex-col bg-[#ffffff] bevel-[#808080,#ffffff,#000000,#dfdfdf] overflow-hidden",
  selection: "bg-[#000080] flex-row",
  selectionText: "text-[#ffffff]",
  mutedText: "text-[#808080]",
  pocketLoading:
    "absolute inset-0 flex-col items-center justify-center bg-[#c0c0c0] px-[20]",
  minesRoot: "flex-1 flex-col p-[5] bg-[#c0c0c0]",
  folderWell:
    "flex-1 flex-col bg-[#ffffff] bevel-[#808080,#ffffff,#000000,#dfdfdf] p-[1] overflow-hidden",
  folderHeader: (segment) => {
    if (segment === "size")
      return "w-[64] flex-row items-center justify-end px-[6] bg-[#c0c0c0] bevel-[#ffffff,#000000,#dfdfdf,#808080]";
    if (segment === "type")
      return "w-[104] flex-row items-center px-[6] bg-[#c0c0c0] bevel-[#ffffff,#000000,#dfdfdf,#808080]";
    return "flex-1 flex-row items-center px-[6] bg-[#c0c0c0] bevel-[#ffffff,#000000,#dfdfdf,#808080]";
  },
  folderRow: (selected) =>
    selected
      ? "h-[17] flex-row items-center px-[2] bg-[#000080] shrink-0"
      : "h-[17] flex-row items-center px-[2] shrink-0",
  statusWell:
    "flex-1 h-[18] flex-row items-center px-[6] bevel-[#808080,#ffffff]",
  dialogButton: (pressed) =>
    pressed
      ? "w-[75] h-[23] flex-col justify-center items-center bg-[#c0c0c0] bevel-[#000000,#ffffff,#808080,#dfdfdf]"
      : "w-[75] h-[23] flex-col justify-center items-center bg-[#c0c0c0] bevel-[#ffffff,#000000,#dfdfdf,#808080]",
};

// Luna reduces Sheru's longer period gradients to three color stops. The
// engine core lowers each stop pair to the established DrawList operations,
// so native and WASM compositors receive the same rectangles and triangles.
export const XP_THEME: DesktopTheme = {
  id: "xp",
  label: "Windows XP",
  metrics: {
    frame: 4,
    titleH: 27,
    titleGap: 0,
    buttonW: 21,
    buttonH: 21,
    buttonTop: 3,
    buttonRight: 3,
    buttonGap: 2,
    menuH: 22,
    taskH: 30,
    taskLeft: 0,
    taskStartW: 84,
    taskGap: 3,
    resizeBand: 4,
    resizeCorner: 16,
  },
  desktop:
    "absolute inset-0 bg-gradient-to-b from-[#5db7f2] via-[#2878ce] to-[#3f8b39] overflow-hidden",
  windowFrame: (active) =>
    active
      ? "absolute flex-col bg-[#0855dd] p-[4] rounded-lg border-[#0831d9]"
      : "absolute flex-col bg-[#7f9ee2] p-[4] rounded-lg border-[#6f8fd6]",
  windowBody: "flex-1 flex-col overflow-hidden bg-[#ece9d8]",
  caption: (active) =>
    active
      ? "flex-row items-center h-[27] pl-[4] pr-[3] rounded-md bg-gradient-to-b from-[#0997ff] via-[#0053ee] to-[#003dd7]"
      : "flex-row items-center h-[27] pl-[4] pr-[3] rounded-md bg-gradient-to-b from-[#97b4e9] via-[#7b99e1] to-[#7a93df]",
  captionTitle: (active) =>
    active ? "text-[#ffffff]" : "text-[#d8e4f8]",
  captionIcon: "w-[16] h-[16] mr-[5]",
  captionControls: "flex-row items-center gap-[2]",
  captionButton: (button, pressed, active) => {
    if (!active)
      return "w-[21] h-[21] flex-col justify-center items-center rounded-sm border-[#d8e4f8] bg-gradient-to-b from-[#aebfe7] via-[#829bd9] to-[#7088c8]";
    if (button === "close")
      return pressed
        ? "w-[21] h-[21] flex-col justify-center items-center rounded-sm border-[#ffffff] bg-gradient-to-b from-[#b02822] via-[#c93a35] to-[#f0a08e]"
        : "w-[21] h-[21] flex-col justify-center items-center rounded-sm border-[#ffffff] bg-gradient-to-b from-[#f0a08e] via-[#e35451] to-[#b02822]";
    return pressed
      ? "w-[21] h-[21] flex-col justify-center items-center rounded-sm border-[#ffffff] bg-gradient-to-b from-[#2152c5] via-[#3f72dd] to-[#8db5f0]"
      : "w-[21] h-[21] flex-col justify-center items-center rounded-sm border-[#ffffff] bg-gradient-to-b from-[#8db5f0] via-[#3f72dd] to-[#2152c5]";
  },
  captionGlyphClass: (pressed) =>
    pressed ? "w-[8] h-[8] ml-[1] mt-[1]" : "w-[8] h-[8]",
  captionGlyphSource: (button, maximized) => {
    if (maximized) return "icons/xp-cap-restore.svg";
    if (button === "min") return "icons/xp-cap-min.svg";
    if (button === "close") return "icons/xp-cap-close.svg";
    return "icons/xp-cap-max.svg";
  },
  menuBar:
    "flex-row items-center h-[22] bg-gradient-to-b from-[#fcfcf9] via-[#f3f1e4] to-[#ece9d8] border-[#d8d2bd]",
  menuItem: (open) =>
    open
      ? "h-[21] px-[7] flex-col justify-center bg-[#316ac5]"
      : "h-[21] px-[7] flex-col justify-center",
  menuText: (open) => (open ? "text-[#ffffff]" : "text-[#000000]"),
  taskbar:
    "absolute left-0 right-0 bottom-0 h-[30] flex-row items-center bg-gradient-to-b from-[#1f80ff] via-[#0865dc] to-[#0340a6] pr-[3] gap-[3]",
  startButton: (open) =>
    open
      ? "h-[30] w-[84] flex-row justify-center items-center gap-[4] rounded-lg bg-gradient-to-b from-[#1c6423] via-[#388e36] to-[#57b94a] border-[#7ed36b]"
      : "h-[30] w-[84] flex-row justify-center items-center gap-[4] rounded-lg bg-gradient-to-b from-[#73cf61] via-[#43a044] to-[#216b28] border-[#9be58a]",
  startText: "text-[#ffffff]",
  taskDivider: "w-[1] h-[24] bg-[#79a8f3]",
  taskList: "flex-1 flex-row items-center gap-[3] overflow-hidden",
  taskButton: (active) =>
    active
      ? "h-[24] flex-row items-center gap-[4] px-[6] rounded-sm bg-gradient-to-b from-[#58a5f4] via-[#2c7ada] to-[#1451a6] border-[#8fc4ff]"
      : "h-[24] flex-row items-center gap-[4] px-[6] rounded-sm bg-gradient-to-b from-[#3d8ee8] via-[#1769c5] to-[#0d4fa5] border-[#6fa9eb]",
  taskText: () => "text-[#ffffff]",
  tray:
    "h-[28] flex-row items-center px-[9] rounded-sm bg-gradient-to-b from-[#3ba8f6] via-[#1687dd] to-[#0b67bd] border-[#65bff7]",
  trayText: "text-[#ffffff]",
  popup: "absolute flex-col bg-[#ffffff] p-[2] border-[#316ac5]",
  popupSeparatorDark: "h-[1] bg-[#aca899]",
  popupSeparatorLight: "h-[1] bg-[#ffffff]",
  popupItem: (hover) =>
    hover
      ? "h-[18] flex-row items-center gap-[5] pl-[4] pr-[8] bg-[#316ac5]"
      : "h-[18] flex-row items-center gap-[5] pl-[4] pr-[8] bg-[#ffffff]",
  popupText: (state) =>
    state === "disabled"
      ? "text-[#aca899]"
      : state === "hover"
        ? "text-[#ffffff]"
        : "text-[#000000]",
  startMenu: "absolute flex-row bg-[#ffffff] p-[2] border-[#0054e3]",
  startRail:
    "w-[28] h-full bg-gradient-to-t from-[#1c6423] via-[#388e36] to-[#57b94a]",
  startItem: (hover) =>
    hover
      ? "h-[26] flex-row items-center gap-[6] pl-[6] pr-[6] bg-[#316ac5]"
      : "h-[26] flex-row items-center gap-[6] pl-[6] pr-[6] bg-[#ffffff]",
  desktopSelection: "bg-[#316ac5] px-[3] rounded-sm",
  desktopLabel: "text-[#ffffff]",
  notepadWell:
    "flex-1 flex-col bg-[#ffffff] border-[#7f9db9] overflow-hidden",
  selection: "bg-[#316ac5] flex-row",
  selectionText: "text-[#ffffff]",
  mutedText: "text-[#6f6e64]",
  pocketLoading:
    "absolute inset-0 flex-col items-center justify-center bg-[#ece9d8] px-[20]",
  minesRoot: "flex-1 flex-col p-[5] bg-[#ece9d8]",
  folderWell:
    "flex-1 flex-col bg-[#ffffff] border-[#7f9db9] p-[1] overflow-hidden",
  folderHeader: (segment) => {
    if (segment === "size")
      return "w-[64] flex-row items-center justify-end px-[6] bg-gradient-to-b from-[#fcfcf9] via-[#f3f1e4] to-[#ece9d8] border-[#d8d7bf]";
    if (segment === "type")
      return "w-[104] flex-row items-center px-[6] bg-gradient-to-b from-[#fcfcf9] via-[#f3f1e4] to-[#ece9d8] border-[#d8d7bf]";
    return "flex-1 flex-row items-center px-[6] bg-gradient-to-b from-[#fcfcf9] via-[#f3f1e4] to-[#ece9d8] border-[#d8d7bf]";
  },
  folderRow: (selected) =>
    selected
      ? "h-[17] flex-row items-center px-[2] bg-[#316ac5] shrink-0"
      : "h-[17] flex-row items-center px-[2] shrink-0",
  statusWell:
    "flex-1 h-[18] flex-row items-center px-[6] bg-[#ece9d8] border-[#aca899]",
  dialogButton: (pressed) =>
    pressed
      ? "w-[75] h-[23] flex-col justify-center items-center rounded-sm border-[#003c74] bg-gradient-to-b from-[#cdcac3] via-[#e3e0d8] to-[#f1efe9]"
      : "w-[75] h-[23] flex-col justify-center items-center rounded-sm border-[#003c74] bg-gradient-to-b from-[#ffffff] via-[#f4f3ee] to-[#d8d0c4]",
};

export const THEMES: readonly DesktopTheme[] = [CLASSIC_THEME, XP_THEME];

export function themeById(id: ThemeId): DesktopTheme {
  return id === "xp" ? XP_THEME : CLASSIC_THEME;
}
