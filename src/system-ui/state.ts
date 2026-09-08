// src/system-ui/state.ts — compositor state: window controls, popups, desktop
// icons. Hot geometry lives in per-window refs so a drag re-evaluates one
// window's style binding, not the world; the window LIST only changes on
// open/close (a reorder would rebuild the layout tree — z rides zIndex).

import { ref, shallowRef, type Ref, type ShallowRef } from "vue";
import type { CaptionButton, Geo } from "./wm.ts";
import type { FolderTool, IconName } from "./theme.ts";
import type { Doc, History } from "./notepad.ts";
import type { Mines } from "./mines.ts";
import type { PocketAppSpec } from "./pocket-apps.ts";

export type WinKind =
  "notepad" | "mines" | "folder" | "pocket" | "about" | "shutdown";

export interface MenuDef {
  label: string;
  /** Hit width in px (measured at open — mirrors the render's px-[6] pads). */
  width: number;
  /** Built at open — disabled states follow live state (selection, …). */
  items: () => PopupItem[];
}

export interface PopupItem {
  label: string;
  /** Semantic icon; the active theme resolves the artwork at paint time. */
  icon?: IconName;
  shortcut?: string;
  disabled?: boolean;
  /** Toggle state — renders a checkmark in the icon slot. */
  checked?: boolean;
  sep?: boolean;
  sub?: PopupItem[];
  act?: () => void;
  /** Start-panel placement (the XP two-column layout reads these; the
   *  Classic single-column panel ignores them). `right` moves the row into
   *  the places column, `bottom` pins it under the programs column, `foot`
   *  puts it in the blue strip along the bottom of the panel. */
  col?: "right";
  bottom?: boolean;
  foot?: boolean;
}

export interface Popup {
  x: number;
  y: number;
  w: number;
  items: PopupItem[];
}

export interface WinCtl {
  id: number;
  kind: WinKind;
  /** Reactive: a folder window renames itself as it navigates. */
  title: Ref<string>;
  /** Semantic icon; the active theme resolves the artwork at paint time. */
  icon: Ref<IconName>;
  buttons: readonly CaptionButton[];
  resizable: boolean;
  minW: number;
  minH: number;
  menus: MenuDef[] | null;
  geo: ShallowRef<Geo>;
  z: Ref<number>;
  minimized: Ref<boolean>;
  maximized: Ref<boolean>;
  /** Geometry to restore on un-maximize. */
  restoreGeo: Geo | null;
  pressedBtn: Ref<CaptionButton | null>;
  /** Pointer over the caption's control cluster (Aqua reveals glyphs). */
  captionHover: Ref<boolean>;
  /** Open menu-bar index, -1 closed. */
  openMenu: Ref<number>;
  /** Program-specific state bag (PadData, MinesData, …). */
  data: unknown;
}

// Program state bags. Vue refs instead of accessor/setter pairs — templates
// read `.value` explicitly (refs nested in objects never auto-unwrap).

export interface PadData {
  kind: "notepad";
  doc: ShallowRef<Doc>;
  scroll: Ref<number>;
  preedit: Ref<{ s: string; c: number } | null>;
  /** Word wrap (Edit menu toggle): reflow to the window width. */
  wrap: Ref<boolean>;
  /** Undo/redo snapshots (notepad.ts History). Plain field: nothing renders
   *  from it — the Edit/context menus read it when they build their items. */
  hist: History;
}

export interface MinesData {
  kind: "mines";
  /** Mutated in place by mines.ts rules — re-assign + triggerRef to paint. */
  board: ShallowRef<Mines>;
  /** Cell index held by the primary button, -1 none. */
  held: Ref<number>;
  smileyHeld: Ref<boolean>;
  /** Seconds shown by the timer (app.vue advances it while playing). */
  elapsed: Ref<number>;
}

export interface FolderRow {
  icon: IconName;
  name: string;
  size: string;
  type: string;
  open?: () => void;
}

/** The places every file-manager window lists in its sidebar and navigates
 *  among in place (the same window renames and refills itself). */
export type PlaceId = "computer" | "drivec" | "documents" | "recycle";

export interface Place {
  id: PlaceId;
  label: string;
  icon: IconName;
}

export const PLACES: readonly Place[] = [
  { id: "computer", label: "My Computer", icon: "computer" },
  { id: "drivec", label: "(C:)", icon: "drive" },
  { id: "documents", label: "My Documents", icon: "documents" },
  { id: "recycle", label: "Recycle Bin", icon: "recycle" },
];

export interface FolderData {
  kind: "folder";
  place: Ref<PlaceId>;
  rows: ShallowRef<FolderRow[]>;
  selected: Ref<number>;
  /** Navigation history: visited places and the cursor into them. */
  hist: ShallowRef<{ items: PlaceId[]; at: number }>;
  /** Toolbar button held by the primary button, null none. */
  toolHeld: Ref<FolderTool | null>;
}

export interface PocketData {
  kind: "pocket";
  app: PocketAppSpec;
}

export interface AboutData {
  kind: "about";
  armed: Ref<string | null>;
}

export interface ShutdownData {
  kind: "shutdown";
  choice: Ref<number>;
  armed: Ref<string | null>;
}

export interface TaskEntry {
  id: number;
  title: string;
  icon: IconName;
}

export interface DeskIcon {
  icon: IconName;
  label: string;
  open: () => void;
}

let nextId = 1;

export function createWin(spec: {
  kind: WinKind;
  title: string;
  icon: IconName;
  geo: Geo;
  buttons?: readonly CaptionButton[];
  resizable?: boolean;
  minW?: number;
  minH?: number;
  menus?: MenuDef[] | null;
  data?: unknown;
}): WinCtl {
  return {
    id: nextId++,
    kind: spec.kind,
    title: ref(spec.title),
    icon: ref<IconName>(spec.icon),
    buttons: spec.buttons ?? ["min", "max", "close"],
    resizable: spec.resizable ?? true,
    minW: spec.minW ?? 200,
    minH: spec.minH ?? 120,
    menus: spec.menus ?? null,
    geo: shallowRef<Geo>(spec.geo),
    z: ref(0),
    minimized: ref(false),
    maximized: ref(false),
    restoreGeo: null,
    pressedBtn: ref<CaptionButton | null>(null),
    captionHover: ref(false),
    openMenu: ref(-1),
    data: spec.data,
  };
}
