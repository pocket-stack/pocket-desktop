// System UI theme boundary. Product code consumes one DesktopTheme; every
// period-specific color, metric, glyph and chrome class stays in this file.
// Changing the active theme never changes the Pocket System manifest, native
// host, AppSupervisor or child application plans.

/** Baked font slots (src/system-ui/gen-assets.ts -> pak.json). 19-21 are the
 *  W95FA bitmap face, 22-23 the antialiased Luna face. */
export const FONT = 19;
export const FONT_B = 20;
export const FONT_XL = 21;
export const FONT_XP = 22;
export const FONT_XP_B = 23;

/** Text roles a theme maps onto its baked slots. Luna has no third size —
 *  spec.ts caps the atlas at 24 slots — so `xl` lands on its bold face. */
export type FontRole = "ui" | "bold" | "xl";

export type ThemeId = "classic" | "xp";

/** Paint-only strips a surface stacks beneath its content: absolutely
 *  positioned children the chrome renders BEFORE the content, so they paint
 *  under it. Classic chrome is flat fills plus bevel rings and needs none;
 *  Luna's gel surfaces are a base gradient plus a rounded top cap, a 1px
 *  highlight band and 1px edge lines, which is what these carry. */
export type ChromeLayers = readonly string[];

const NO_LAYERS: ChromeLayers = [];

export interface ChromeMetrics {
  frame: number;
  /** Top of the caption inside the window box. Classic insets the caption by
   *  the whole frame; Luna runs it edge to edge under the 1px outer border. */
  captionTop: number;
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
  /** Start panel. `startHeaderH > 0` selects the XP two-column panel (user
   *  header, programs column, places column, a blue strip along the bottom);
   *  otherwise the Classic single column beside a vertical rail. */
  startX: number;
  startW: number;
  startRowH: number;
  startSepH: number;
  startHeaderH: number;
  startFooterH: number;
  startRailW: number;
  startLeftW: number;
  resizeBand: number;
  resizeCorner: number;
}

export interface DesktopTheme {
  id: ThemeId;
  label: string;
  metrics: ChromeMetrics;
  fontSlot: (role: FontRole) => number;
  desktop: string;
  desktopLayers: ChromeLayers;
  /** Maximized windows drop Luna's rounded top corners: the caption runs
   *  into the screen corner with nothing behind it to show through. */
  windowFrame: (active: boolean, maximized: boolean) => string;
  windowLayers: (active: boolean) => ChromeLayers;
  /** Wrapper between the chrome and the client area (Luna's 1px light ring). */
  windowInner: string;
  windowBody: string;
  caption: (active: boolean) => string;
  captionLayers: (active: boolean, maximized: boolean) => ChromeLayers;
  captionTitle: (active: boolean) => string;
  captionIcon: string;
  captionControls: string;
  captionButton: (
    button: "min" | "max" | "close",
    pressed: boolean,
    active: boolean,
  ) => string;
  captionButtonLayers: (
    button: "min" | "max" | "close",
    pressed: boolean,
    active: boolean,
  ) => ChromeLayers;
  captionGlyphClass: (pressed: boolean) => string;
  captionGlyphSource: (
    button: "min" | "max" | "close",
    maximized: boolean,
  ) => string;
  menuBar: string;
  menuItem: (open: boolean) => string;
  menuText: (open: boolean) => string;
  taskbar: string;
  taskbarLayers: ChromeLayers;
  startButton: (open: boolean) => string;
  startLayers: (open: boolean) => ChromeLayers;
  startText: string;
  taskDivider: string;
  taskList: string;
  taskButton: (active: boolean) => string;
  taskText: (active: boolean) => string;
  tray: string;
  trayLayers: ChromeLayers;
  trayText: string;
  popup: string;
  popupSeparatorDark: string;
  popupSeparatorLight: string;
  popupItem: (hover: boolean) => string;
  popupText: (state: "normal" | "hover" | "disabled") => string;
  startMenu: string;
  startMenuLayers: ChromeLayers;
  startRail: string;
  startItem: (hover: boolean) => string;
  /** XP two-column panel (unused while `metrics.startHeaderH` is 0). */
  startHeader: string;
  startHeaderLayers: ChromeLayers;
  startHeaderIcon: string;
  startHeaderName: string;
  startColumn: (side: "left" | "right") => string;
  /** 1px rule between the two columns (absolute, inside the right one). */
  startColumnDivider: string;
  startSeparator: string;
  startFooter: string;
  startFooterLayers: ChromeLayers;
  startFooterItem: (hover: boolean) => string;
  startFooterText: string;
  /** Start-button mark; "" leaves the button its label alone (Luna). */
  startLogo: string;
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
  fontSlot: (role) =>
    role === "xl" ? FONT_XL : role === "bold" ? FONT_B : FONT,
  metrics: {
    frame: 3,
    captionTop: 3,
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
    startX: 2,
    startW: 182,
    startRowH: 26,
    startSepH: 8,
    startHeaderH: 0,
    startFooterH: 0,
    startRailW: 24,
    startLeftW: 0,
    resizeBand: 4,
    resizeCorner: 14,
  },
  desktop: "absolute inset-0 bg-[#008080] overflow-hidden",
  desktopLayers: NO_LAYERS,
  windowFrame: () =>
    "absolute flex-col bg-[#c0c0c0] p-[3] bevel-[#dfdfdf,#000000,#ffffff,#808080]",
  windowLayers: () => NO_LAYERS,
  windowInner: "flex-1 flex-col",
  windowBody: "flex-1 flex-col overflow-hidden bg-[#c0c0c0]",
  caption: (active) =>
    active
      ? "flex-row items-center h-[18] pl-[3] pr-[2] bg-gradient-to-r from-[#000080] to-[#1084d0] mb-[1]"
      : "flex-row items-center h-[18] pl-[3] pr-[2] bg-gradient-to-r from-[#808080] to-[#b5b5b5] mb-[1]",
  captionLayers: () => NO_LAYERS,
  captionTitle: (active) =>
    active ? "text-[#ffffff]" : "text-[#c0c0c0]",
  captionIcon: "w-[16] h-[16] mr-[3]",
  captionControls: "flex-row items-center",
  captionButton: (_button, pressed) =>
    pressed
      ? "w-[16] h-[14] flex-col justify-center items-center bg-[#c0c0c0] bevel-[#000000,#ffffff,#808080,#dfdfdf]"
      : "w-[16] h-[14] flex-col justify-center items-center bg-[#c0c0c0] bevel-[#ffffff,#000000,#dfdfdf,#808080]",
  captionButtonLayers: () => NO_LAYERS,
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
  taskbarLayers: NO_LAYERS,
  startButton: (open) =>
    open
      ? "h-[22] w-[54] flex-row justify-center items-center gap-[3] bg-[#c0c0c0] bevel-[#000000,#ffffff,#808080,#dfdfdf]"
      : "h-[22] w-[54] flex-row justify-center items-center gap-[3] bg-[#c0c0c0] bevel-[#ffffff,#000000,#dfdfdf,#808080]",
  startLayers: () => NO_LAYERS,
  startText: "text-[#000000]",
  taskDivider: "w-[1] h-[22] bevel-[#808080,#ffffff]",
  taskList: "flex-1 flex-row items-center gap-[3] overflow-hidden",
  taskButton: (active) =>
    active
      ? "h-[22] flex-row items-center gap-[4] px-[4] bg-[#dfdfdf] bevel-[#808080,#ffffff]"
      : "h-[22] flex-row items-center gap-[4] px-[4] bg-[#c0c0c0] bevel-[#ffffff,#000000,#dfdfdf,#808080]",
  taskText: () => "text-[#000000]",
  tray: "h-[22] flex-row items-center px-[8] bevel-[#808080,#ffffff]",
  trayLayers: NO_LAYERS,
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
  startMenuLayers: NO_LAYERS,
  startRail: "w-[24] h-full bg-gradient-to-t from-[#000080] to-[#1084d0]",
  startItem: (hover) =>
    hover
      ? "h-[26] flex-row items-center gap-[6] pl-[6] pr-[6] bg-[#000080]"
      : "h-[26] flex-row items-center gap-[6] pl-[6] pr-[6]",
  startHeader: "",
  startHeaderLayers: NO_LAYERS,
  startHeaderIcon: "",
  startHeaderName: "",
  startColumn: () => "",
  startColumnDivider: "",
  startSeparator: "",
  startFooter: "",
  startFooterLayers: NO_LAYERS,
  startFooterItem: () => "",
  startFooterText: "",
  startLogo: "icons/start-logo.svg",
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

// Luna is a gel style: every raised surface is one rounded shape carrying a
// three-stop base gradient, plus stacked 1px strips for the edges the three
// stops cannot reach (the bright 2px crown, the dark seat line). Colors below
// are sampled from a 96dpi Windows XP capture, so the row offsets in the
// comments are that capture's pixel rows.
//
// Two shapes make a corner-selective rounding the single `radius` prop cannot:
// a rounded cap layer paints the top corners and a square layer painted over
// it from the cap's radius downwards restores the square bottom (Luna windows
// round the top corners only). The Start button inverts it — the rounded body
// overhangs the taskbar's left edge and its container clips the overhang, so
// the button meets the screen edge square and curves on the right.
export const XP_THEME: DesktopTheme = {
  id: "xp",
  label: "Windows XP",
  fontSlot: (role) => (role === "ui" ? FONT_XP : FONT_XP_B),
  metrics: {
    // frame = 1px outer border + 2px blue band + 1px light client ring.
    frame: 4,
    captionTop: 1,
    titleH: 28,
    titleGap: 1,
    buttonW: 21,
    buttonH: 21,
    buttonTop: 4,
    buttonRight: 1,
    buttonGap: 2,
    menuH: 21,
    taskH: 30,
    taskLeft: 0,
    taskStartW: 84,
    taskGap: 3,
    startX: 0,
    startW: 304,
    startRowH: 28,
    startSepH: 9,
    startHeaderH: 48,
    startFooterH: 36,
    startRailW: 0,
    startLeftW: 172,
    resizeBand: 4,
    resizeCorner: 16,
  },
  // Sky gradient plus one grass band that fades in over it: three stops in a
  // single node can only cross blue to green through mud.
  desktop:
    "absolute inset-0 bg-gradient-to-b from-[#1a5fbb] via-[#3f92dd] to-[#9ccff1] overflow-hidden",
  desktopLayers: [
    "absolute left-0 right-0 bottom-0 h-[240] bg-gradient-to-b from-[#7cb04c00] via-[#5d9a36] to-[#3a7020]",
  ],
  windowFrame: (active, maximized) => {
    if (maximized)
      return active
        ? "absolute flex-col border-[#0831d9] bg-[#2758c9]"
        : "absolute flex-col border-[#6673bd] bg-[#7b88cf]";
    return active
      ? "absolute flex-col rounded-[6] border-[#0831d9] bg-[#2758c9] shadow-md"
      : "absolute flex-col rounded-[6] border-[#6673bd] bg-[#7b88cf] shadow-md";
  },
  // Square-bottom patch: covers the frame's rounded bottom corners from below
  // the top radius down. Its own top border line hides under the caption.
  windowLayers: (active) =>
    active
      ? ["absolute left-0 right-0 top-[8] bottom-0 bg-[#2758c9] border-[#0831d9]"]
      : ["absolute left-0 right-0 top-[8] bottom-0 bg-[#7b88cf] border-[#6673bd]"],
  windowInner: "flex-1 flex-col mx-[3] mb-[3] p-[1] bg-[#dee8fe]",
  windowBody: "flex-1 flex-col overflow-hidden bg-[#ece9d8]",
  caption: () =>
    "flex-row items-center h-[28] mt-[1] mx-[1] pl-[3] pr-[4]",
  captionLayers: (active, maximized) =>
    active
      ? [
          // rows 0-9, top corners rounded; rows 5-9 hidden by the body layer
          maximized
            ? "absolute left-0 right-0 top-0 h-[10] bg-gradient-to-b from-[#55a0ff] via-[#0060f0] to-[#0054e3]"
            : "absolute left-0 right-0 top-0 h-[10] rounded-[5] bg-gradient-to-b from-[#55a0ff] via-[#0060f0] to-[#0054e3]",
          // rows 5-25: the dark plateau lifting back to the bright seat
          "absolute left-0 right-0 top-[5] bottom-[2] bg-gradient-to-b from-[#0060f0] via-[#0056e8] to-[#0369fe]",
          "absolute left-0 right-0 bottom-[1] h-[1] bg-[#004fe0]",
          "absolute left-0 right-0 bottom-0 h-[1] bg-[#0d42a8]",
        ]
      : [
          maximized
            ? "absolute left-0 right-0 top-0 h-[10] bg-gradient-to-b from-[#9ab8f5] via-[#7f9de1] to-[#7a97dd]"
            : "absolute left-0 right-0 top-0 h-[10] rounded-[5] bg-gradient-to-b from-[#9ab8f5] via-[#7f9de1] to-[#7a97dd]",
          "absolute left-0 right-0 top-[5] bottom-[2] bg-gradient-to-b from-[#7f9de1] via-[#7c99e0] to-[#82a9ea]",
          "absolute left-0 right-0 bottom-[1] h-[1] bg-[#7590d5]",
          "absolute left-0 right-0 bottom-0 h-[1] bg-[#6f8ace]",
        ],
  captionTitle: (active) =>
    active ? "text-[#ffffff]" : "text-[#dae5f8]",
  captionIcon: "w-[16] h-[16] mr-[5]",
  captionControls: "h-[28] flex-row items-start pt-[4] gap-[2]",
  // The cell is the white ring plus the dark inner rim; the face layer below
  // paints the gel gradient inside both.
  captionButton: (button, _pressed, active) => {
    if (!active)
      return "w-[21] h-[21] flex-col justify-center items-center rounded-[3] border-[#dbe6f8] bg-[#8e9fd0]";
    if (button === "close")
      return "w-[21] h-[21] flex-col justify-center items-center rounded-[3] border-[#ffffff] bg-[#ae6350]";
    return "w-[21] h-[21] flex-col justify-center items-center rounded-[3] border-[#e8f1ff] bg-[#4a6ec2]";
  },
  captionButtonLayers: (button, pressed, active) => {
    if (!active)
      return [
        "absolute inset-[2] rounded-[1] bg-gradient-to-b from-[#c2d0f0] via-[#a2b5e4] to-[#8397d2]",
      ];
    if (button === "close")
      return pressed
        ? ["absolute inset-[2] rounded-[1] bg-gradient-to-b from-[#a33513] via-[#d1552e] to-[#f2a993]"]
        : ["absolute inset-[2] rounded-[1] bg-gradient-to-b from-[#f7a794] via-[#ec7a5b] to-[#c8401a]"];
    return pressed
      ? ["absolute inset-[2] rounded-[1] bg-gradient-to-b from-[#1b4bc0] via-[#3f72dd] to-[#8fb2fb]"]
      : ["absolute inset-[2] rounded-[1] bg-gradient-to-b from-[#8dabfb] via-[#4d84f4] to-[#1f56db]"];
  },
  captionGlyphClass: () => "w-[16] h-[16]",
  captionGlyphSource: (button, maximized) => {
    if (maximized) return "icons/xp-cap-restore.svg";
    if (button === "min") return "icons/xp-cap-min.svg";
    if (button === "close") return "icons/xp-cap-close.svg";
    return "icons/xp-cap-max.svg";
  },
  menuBar: "flex-row items-center h-[21] bg-[#ece9d8]",
  menuItem: (open) =>
    open
      ? "h-[21] px-[6] flex-col justify-center bg-[#316ac5]"
      : "h-[21] px-[6] flex-col justify-center",
  menuText: (open) => (open ? "text-[#ffffff]" : "text-[#000000]"),
  taskbar:
    "absolute left-0 right-0 bottom-0 h-[30] flex-row items-center gap-[3] bg-gradient-to-b from-[#2059d4] via-[#245cdc] to-[#2864e6]",
  taskbarLayers: [
    "absolute left-0 right-0 top-0 h-[1] bg-[#0e3f9e]",
    "absolute left-0 right-0 top-[1] h-[4] bg-gradient-to-b from-[#4a92f4] via-[#4188ed] to-[#2260d8]",
    "absolute left-0 right-0 bottom-[1] h-[1] bg-[#1e50be]",
    "absolute left-0 right-0 bottom-0 h-[1] bg-[#1243ac]",
  ],
  // overflow-hidden clips the body's left overhang, so the button is square
  // against the screen edge and rounded on the taskbar side.
  startButton: () =>
    "h-[30] w-[84] overflow-hidden flex-row justify-center items-center gap-[4]",
  startLayers: (open) =>
    open
      ? [
          "absolute left-[-12] right-0 top-0 bottom-0 rounded-[11] border-[#2c6b2a] bg-gradient-to-b from-[#357f33] via-[#3f9a41] to-[#4aa64c]",
          "absolute left-[-12] right-0 top-[1] h-[22] rounded-[11] bg-gradient-to-b from-[#0000003d] via-[#00000000] to-[#00000000]",
        ]
      : [
          "absolute left-[-12] right-0 top-0 bottom-0 rounded-[11] border-[#3b8038] bg-gradient-to-b from-[#3f9140] via-[#46ab49] to-[#3c8a3d]",
          "absolute left-[-12] right-0 top-[1] h-[22] rounded-[11] bg-gradient-to-b from-[#ffffff46] via-[#ffffff00] to-[#ffffff00]",
        ],
  startText: "text-[#ffffff]",
  // No Quick Launch bar: the gap alone separates Start from the task list.
  // Kept 1px wide so taskEntryAt's first-button x stays the painted one.
  taskDivider: "w-[1] h-0",
  taskList: "flex-1 flex-row items-center gap-[3] overflow-hidden",
  taskButton: (active) =>
    active
      ? "h-[25] mt-[1] flex-row items-center gap-[5] px-[6] rounded-[3] border-[#0b3691] bg-gradient-to-b from-[#16489f] via-[#1b50b8] to-[#2154bc]"
      : "h-[25] mt-[1] flex-row items-center gap-[5] px-[6] rounded-[3] border-[#2a6ad0] bg-gradient-to-b from-[#4b93f6] via-[#3b81f2] to-[#2e6fdf]",
  taskText: () => "text-[#ffffff]",
  tray: "h-[29] mt-[1] flex-row items-center pl-[10] pr-[9]",
  trayLayers: [
    "absolute inset-0 bg-gradient-to-b from-[#1495e5] via-[#1187e4] to-[#0f8fea]",
    "absolute left-0 right-0 top-0 h-[3] bg-gradient-to-b from-[#28a4f8] via-[#26adf8] to-[#1596e6]",
    "absolute left-0 top-0 bottom-0 w-[1] bg-[#00337e]",
    "absolute left-[1] top-0 bottom-0 w-[1] bg-[#2fbdee]",
    "absolute left-0 right-0 bottom-0 h-[1] bg-[#0062c5]",
  ],
  trayText: "text-[#ffffff]",
  popup: "absolute flex-col bg-[#ffffff] p-[2] border-[#aca899] shadow-md",
  popupSeparatorDark: "h-[1] bg-[#c5c2b4]",
  popupSeparatorLight: "h-[1] bg-[#ffffff]",
  popupItem: (hover) =>
    hover
      ? "h-[19] flex-row items-center gap-[5] pl-[4] pr-[8] bg-[#316ac5]"
      : "h-[19] flex-row items-center gap-[5] pl-[4] pr-[8]",
  popupText: (state) =>
    state === "disabled"
      ? "text-[#aca899]"
      : state === "hover"
        ? "text-[#ffffff]"
        : "text-[#000000]",
  // The panel is a window in miniature: rounded top corners over a square
  // patch, a gel header, and a gel strip along the bottom.
  startMenu:
    "absolute flex-col rounded-[8] border-[#1c4d9c] bg-[#ffffff] p-[1] shadow-md",
  startMenuLayers: [
    "absolute left-0 right-0 top-[10] bottom-0 bg-[#ffffff] border-[#1c4d9c]",
  ],
  startRail: "",
  startItem: (hover) =>
    hover
      ? "h-[28] flex-row items-center gap-[7] pl-[8] pr-[8] bg-[#2f71cd]"
      : "h-[28] flex-row items-center gap-[7] pl-[8] pr-[8]",
  startHeader: "h-[48] flex-row items-center gap-[8] pl-[7] pr-[8]",
  startHeaderLayers: [
    "absolute left-0 right-0 top-0 h-[12] rounded-[7] bg-gradient-to-b from-[#74acf8] via-[#0d60ca] to-[#0b5eca]",
    "absolute left-0 right-0 top-[6] bottom-[1] bg-gradient-to-b from-[#0d60ca] via-[#2274d9] to-[#3e8eeb]",
    "absolute left-0 right-0 bottom-0 h-[1] bg-[#1e5fb0]",
  ],
  startHeaderIcon: "w-[32] h-[32] rounded-[3]",
  startHeaderName: "text-[#ffffff]",
  startColumn: (side) =>
    side === "left"
      ? "w-[172] flex-col bg-[#ffffff]"
      : "flex-1 flex-col bg-[#d2e5fa]",
  startColumnDivider: "absolute left-0 top-0 bottom-0 w-[1] bg-[#b5d0ef]",
  startSeparator: "h-[9] flex-col justify-center px-[10]",
  startFooter: "h-[36] flex-row justify-end items-center",
  startFooterLayers: [
    "absolute left-0 right-0 top-0 bottom-0 bg-gradient-to-b from-[#4189e5] via-[#2474e1] to-[#0f5cb9]",
    "absolute left-0 right-0 top-0 h-[1] bg-[#2a68ad]",
  ],
  startFooterItem: (hover) =>
    hover
      ? "w-[152] h-[36] flex-row items-center justify-center gap-[7] bg-[#ffffff2e]"
      : "w-[152] h-[36] flex-row items-center justify-center gap-[7]",
  startFooterText: "text-[#ffffff]",
  startLogo: "",
  desktopSelection: "bg-[#316ac5] px-[3]",
  desktopLabel: "text-[#ffffff]",
  notepadWell: "flex-1 flex-col bg-[#ffffff] overflow-hidden",
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
      return "w-[64] flex-row items-center justify-end px-[6] bg-gradient-to-b from-[#ffffff] via-[#f6f4ec] to-[#e4e1d3] border-[#d5d2c4]";
    if (segment === "type")
      return "w-[104] flex-row items-center px-[6] bg-gradient-to-b from-[#ffffff] via-[#f6f4ec] to-[#e4e1d3] border-[#d5d2c4]";
    return "flex-1 flex-row items-center px-[6] bg-gradient-to-b from-[#ffffff] via-[#f6f4ec] to-[#e4e1d3] border-[#d5d2c4]";
  },
  folderRow: (selected) =>
    selected
      ? "h-[17] flex-row items-center px-[2] bg-[#316ac5] shrink-0"
      : "h-[17] flex-row items-center px-[2] shrink-0",
  statusWell:
    "flex-1 h-[18] flex-row items-center px-[6] bg-[#ece9d8] border-[#aca899]",
  dialogButton: (pressed) =>
    pressed
      ? "w-[75] h-[23] flex-col justify-center items-center rounded-[3] border-[#003c74] bg-gradient-to-b from-[#c8c4b8] via-[#dedad0] to-[#f0eee8]"
      : "w-[75] h-[23] flex-col justify-center items-center rounded-[3] border-[#003c74] bg-gradient-to-b from-[#ffffff] via-[#f5f3ed] to-[#dcd6c8]",
};

export const THEMES: readonly DesktopTheme[] = [CLASSIC_THEME, XP_THEME];

export function themeById(id: ThemeId): DesktopTheme {
  return id === "xp" ? XP_THEME : CLASSIC_THEME;
}
