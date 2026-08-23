// System UI theme boundary. Product code consumes one DesktopTheme; every
// period-specific color, metric, glyph and chrome class stays in this file.
// Changing the active theme never changes the Pocket System manifest, native
// host, AppSupervisor or child application plans.

/** Baked W95FA slots (src/system-ui/gen-assets.ts -> pak.json). */
export const FONT = 19;
export const FONT_B = 20;
export const FONT_XL = 21;
export const XP_FONT = 22;
export const XP_FONT_B = 23;

export type ThemeId = "classic" | "xp";
export type StartMenuZone = "primary" | "secondary" | "footer";

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
  startMenuW: number;
  startRowH: number;
  startSepH: number;
  startHeaderH: number;
  startFooterH: number;
  folderToolbarH: number;
  folderSidebarW: number;
  resizeBand: number;
  resizeCorner: number;
}

export interface DesktopTheme {
  id: ThemeId;
  label: string;
  metrics: ChromeMetrics;
  fontSlot: (bold: boolean, xl: boolean) => number;
  iconSource: (source: string) => string;
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
  startHeader: string;
  startAvatar: string;
  startHeaderText: string;
  startPrimaryPane: string;
  startSecondaryPane: string;
  startFooter: string;
  startItem: (zone: StartMenuZone, hover: boolean) => string;
  startItemIcon: (zone: StartMenuZone) => string;
  startItemText: (
    zone: StartMenuZone,
    state: "normal" | "hover" | "disabled",
  ) => string;
  startSeparator: (zone: StartMenuZone) => string;
  desktopSelection: string;
  desktopLabel: string;
  notepadWell: string;
  selection: string;
  selectionText: string;
  mutedText: string;
  pocketLoading: string;
  minesRoot: string;
  folderExplorerChrome: boolean;
  folderToolbar: string;
  folderToolbarButton: string;
  folderToolbarLabel: string;
  folderAddressBar: string;
  folderAddressLabel: string;
  folderAddressWell: string;
  folderAddressText: string;
  folderBody: string;
  folderSidebar: string;
  folderSidebarCard: string;
  folderSidebarHeading: string;
  folderSidebarItem: string;
  folderList: string;
  folderWell: string;
  folderHeader: (segment: "name" | "modified" | "size" | "type") => string;
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
    startMenuW: 182,
    startRowH: 26,
    startSepH: 8,
    startHeaderH: 0,
    startFooterH: 0,
    folderToolbarH: 0,
    folderSidebarW: 0,
    resizeBand: 4,
    resizeCorner: 14,
  },
  fontSlot: (bold, xl) => (xl ? FONT_XL : bold ? FONT_B : FONT),
  iconSource: (source) => source,
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
  startHeader: "",
  startAvatar: "",
  startHeaderText: "text-[#ffffff]",
  startPrimaryPane: "",
  startSecondaryPane: "",
  startFooter: "",
  startItem: (_zone, hover) =>
    hover
      ? "h-[26] flex-row items-center gap-[6] pl-[6] pr-[6] bg-[#000080]"
      : "h-[26] flex-row items-center gap-[6] pl-[6] pr-[6]",
  startItemIcon: () => "w-[16] h-[16]",
  startItemText: (_zone, state) =>
    state === "disabled"
      ? "text-[#808080]"
      : state === "hover"
        ? "text-[#ffffff]"
        : "text-[#000000]",
  startSeparator: () => "h-[8] flex-col justify-center px-[2]",
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
  folderExplorerChrome: false,
  folderToolbar: "",
  folderToolbarButton: "",
  folderToolbarLabel: "text-[#000000]",
  folderAddressBar: "",
  folderAddressLabel: "text-[#000000]",
  folderAddressWell: "",
  folderAddressText: "text-[#000000]",
  folderBody: "flex-1 flex-row overflow-hidden",
  folderSidebar: "",
  folderSidebarCard: "",
  folderSidebarHeading: "",
  folderSidebarItem: "",
  folderList: "flex-1 flex-col overflow-hidden",
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

// System artwork changes with the visual system while Pocket application
// artwork keeps its package identity. Paths not listed here intentionally
// pass through unchanged (Pocket app icons, Minesweeper board art, and other
// application-owned images).
const XP_ICON_SOURCES: Readonly<Record<string, string>> = {
  "icons/start-logo.svg": "icons/xp-start-logo.svg",
  "icons/computer.svg": "icons/xp-computer.svg",
  "icons/computer-16.svg": "icons/xp-computer-16.svg",
  "icons/documents.svg": "icons/xp-documents.svg",
  "icons/folder-16.svg": "icons/xp-folder-16.svg",
  "icons/drive-16.svg": "icons/xp-drive-16.svg",
  "icons/cdrom-16.svg": "icons/xp-cdrom-16.svg",
  "icons/file-16.svg": "icons/xp-file-16.svg",
  "icons/recycle.svg": "icons/xp-recycle.svg",
  "icons/recycle-16.svg": "icons/xp-recycle-16.svg",
  "icons/notepad.svg": "icons/xp-notepad.svg",
  "icons/notepad-16.svg": "icons/xp-notepad-16.svg",
  "icons/mines.svg": "icons/xp-mines.svg",
  "icons/mines-16.svg": "icons/xp-mines-16.svg",
  "icons/settings-16.svg": "icons/xp-settings-16.svg",
  "icons/find-16.svg": "icons/xp-find-16.svg",
  "icons/help-16.svg": "icons/xp-help-16.svg",
  "icons/run-16.svg": "icons/xp-run-16.svg",
  "icons/shutdown.svg": "icons/xp-shutdown.svg",
  "icons/shutdown-16.svg": "icons/xp-shutdown-16.svg",
};

// Luna uses three color stops for its surface gradients. The
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
    startMenuW: 338,
    startRowH: 32,
    startSepH: 9,
    startHeaderH: 52,
    startFooterH: 42,
    folderToolbarH: 60,
    folderSidebarW: 168,
    resizeBand: 4,
    resizeCorner: 16,
  },
  fontSlot: (bold) => (bold ? XP_FONT_B : XP_FONT),
  iconSource: (source) => XP_ICON_SOURCES[source] ?? source,
  desktop:
    "absolute inset-0 bg-gradient-to-b from-[#62b7ee] via-[#2e91d2] to-[#1f78bd] overflow-hidden",
  windowFrame: (active) =>
    active
      ? "absolute flex-col bg-gradient-to-b from-[#0a6bf4] via-[#0855dd] to-[#003cc5] p-[4] rounded-lg border-[#0831d9]"
      : "absolute flex-col bg-gradient-to-b from-[#9bb8ed] via-[#7f9ee2] to-[#6d87d0] p-[4] rounded-lg border-[#6f8fd6]",
  windowBody: "flex-1 flex-col overflow-hidden bg-[#ece9d8]",
  caption: (active) =>
    active
      ? "flex-row items-center h-[27] pl-[5] pr-[3] rounded-md bg-gradient-to-b from-[#31a8ff] via-[#0564f0] to-[#003dd7]"
      : "flex-row items-center h-[27] pl-[5] pr-[3] rounded-md bg-gradient-to-b from-[#abc3ed] via-[#829fe1] to-[#718dd8]",
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
  startMenu:
    "absolute flex-col overflow-hidden bg-[#ffffff] rounded-md border-[#0831d9]",
  startRail: "",
  startHeader:
    "absolute left-0 right-0 top-0 h-[52] flex-row items-center gap-[8] px-[8] bg-gradient-to-b from-[#1e8cff] via-[#0866db] to-[#0649b6]",
  startAvatar:
    "w-[38] h-[38] flex-col items-center justify-center rounded-sm bg-gradient-to-b from-[#ffffff] via-[#d9e8fa] to-[#9ab9df] border-[#ffffff]",
  startHeaderText: "text-[#ffffff]",
  startPrimaryPane: "absolute bg-[#ffffff]",
  startSecondaryPane: "absolute bg-[#d3e5fa] border-[#9dbce7]",
  startFooter:
    "absolute left-0 right-0 bottom-0 h-[42] bg-gradient-to-b from-[#2d8bef] via-[#1267c8] to-[#074b9f]",
  startItem: (zone, hover) => {
    if (zone === "footer")
      return hover
        ? "absolute h-[32] flex-row items-center justify-center gap-[6] px-[7] rounded-sm bg-[#3d96ee]"
        : "absolute h-[32] flex-row items-center justify-center gap-[6] px-[7]";
    if (zone === "secondary")
      return hover
        ? "absolute h-[32] flex-row items-center gap-[7] px-[8] bg-[#316ac5]"
        : "absolute h-[32] flex-row items-center gap-[7] px-[8] bg-[#d3e5fa]";
    return hover
      ? "absolute h-[32] flex-row items-center gap-[8] px-[8] bg-[#316ac5]"
      : "absolute h-[32] flex-row items-center gap-[8] px-[8] bg-[#ffffff]";
  },
  startItemIcon: (zone) =>
    zone === "primary" ? "w-[24] h-[24]" : "w-[18] h-[18]",
  startItemText: (zone, state) => {
    if (state === "disabled")
      return zone === "footer" ? "text-[#b9d4f4]" : "text-[#8c8b83]";
    if (state === "hover" || zone === "footer") return "text-[#ffffff]";
    return zone === "secondary" ? "text-[#0a246a]" : "text-[#000000]";
  },
  startSeparator: (zone) =>
    zone === "primary"
      ? "absolute h-[9] flex-col justify-center px-[8] bg-[#ffffff]"
      : "absolute h-[9] flex-col justify-center px-[8] bg-[#d3e5fa]",
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
  folderExplorerChrome: true,
  folderToolbar:
    "h-[34] flex-row items-center gap-[3] px-[5] bg-gradient-to-b from-[#ffffff] via-[#f5f3e8] to-[#e7e4d5] border-[#d6d2bf] shrink-0",
  folderToolbarButton:
    "h-[28] flex-row items-center gap-[4] px-[6] rounded-sm border-[#d8d2bd] bg-gradient-to-b from-[#ffffff] via-[#f4f2e8] to-[#e4dfcf]",
  folderToolbarLabel: "text-[#1f1f1f]",
  folderAddressBar:
    "h-[26] flex-row items-center gap-[6] px-[5] bg-[#ece9d8] border-[#d6d2bf] shrink-0",
  folderAddressLabel: "text-[#444444]",
  folderAddressWell:
    "flex-1 h-[20] flex-row items-center gap-[4] px-[4] bg-[#ffffff] border-[#7f9db9]",
  folderAddressText: "text-[#222222]",
  folderBody: "flex-1 flex-row overflow-hidden bg-[#ffffff]",
  folderSidebar:
    "w-[168] flex-col gap-[8] p-[8] bg-gradient-to-b from-[#7ba2e7] via-[#708bdc] to-[#6375d6] shrink-0 overflow-hidden",
  folderSidebarCard:
    "flex-col pb-[5] rounded-md overflow-hidden bg-[#d6e7fb] border-[#89a7d8]",
  folderSidebarHeading:
    "h-[24] flex-row items-center px-[8] bg-gradient-to-b from-[#ffffff] via-[#f4f7ff] to-[#c7d9f3]",
  folderSidebarItem: "h-[19] flex-row items-center gap-[5] px-[9]",
  folderList: "flex-1 flex-col overflow-hidden bg-[#ffffff] border-[#7f9db9]",
  folderWell:
    "flex-1 flex-col bg-[#ffffff] overflow-hidden",
  folderHeader: (segment) => {
    if (segment === "modified")
      return "w-[126] flex-row items-center px-[6] bg-gradient-to-b from-[#ffffff] via-[#f3f1e4] to-[#e2dfcf] border-[#c7c4b6]";
    if (segment === "size")
      return "w-[58] flex-row items-center justify-end px-[6] bg-gradient-to-b from-[#ffffff] via-[#f3f1e4] to-[#e2dfcf] border-[#c7c4b6]";
    if (segment === "type")
      return "w-[94] flex-row items-center px-[6] bg-gradient-to-b from-[#ffffff] via-[#f3f1e4] to-[#e2dfcf] border-[#c7c4b6]";
    return "flex-1 flex-row items-center px-[6] bg-gradient-to-b from-[#ffffff] via-[#f3f1e4] to-[#e2dfcf] border-[#c7c4b6]";
  },
  folderRow: (selected) =>
    selected
      ? "h-[20] flex-row items-center px-[3] bg-[#316ac5] shrink-0"
      : "h-[20] flex-row items-center px-[3] shrink-0",
  statusWell:
    "flex-1 h-[20] flex-row items-center px-[6] bg-[#ece9d8] border-[#aca899]",
  dialogButton: (pressed) =>
    pressed
      ? "w-[75] h-[23] flex-col justify-center items-center rounded-sm border-[#003c74] bg-gradient-to-b from-[#cdcac3] via-[#e3e0d8] to-[#f1efe9]"
      : "w-[75] h-[23] flex-col justify-center items-center rounded-sm border-[#003c74] bg-gradient-to-b from-[#ffffff] via-[#f4f3ee] to-[#d8d0c4]",
};

export const THEMES: readonly DesktopTheme[] = [CLASSIC_THEME, XP_THEME];

export function themeById(id: ThemeId): DesktopTheme {
  return id === "xp" ? XP_THEME : CLASSIC_THEME;
}
