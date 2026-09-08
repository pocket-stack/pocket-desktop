// src/system-ui/wm.ts — pure window-manager math: chrome hit regions, resize
// arithmetic, movement clamps. No Solid, no framework imports — unit-tested
// directly (tests/system-ui.test.ts). The compositor (app.tsx) owns the state;
// this module owns the geometry rules.
//
// Chrome anatomy comes from the active System UI theme. The same metrics feed
// paint and hit testing so a dynamic theme change cannot leave stale click,
// drag, resize or compositor-surface geometry behind.

import {
  CLASSIC_THEME,
  type ChromeMetrics,
} from "./theme.ts";

const DEFAULT_METRICS = CLASSIC_THEME.metrics;

export interface Geo {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const DESK_ICON_X = 8;
export const DESK_ICON_Y = 8;
export const DESK_ICON_W = 74;
export const DESK_ICON_H = 48;
export const DESK_ICON_X_STRIDE = 82;
export const DESK_ICON_Y_STRIDE = 58;

/** Column-major desktop icon grid. More icons add columns while every cell
 *  above the taskbar keeps the same theme-independent 74x48 hit target. */
export function desktopIconRows(
  viewportH: number,
  metrics: ChromeMetrics = DEFAULT_METRICS,
): number {
  return Math.max(
    1,
    Math.floor(
      (viewportH - metrics.taskH - DESK_ICON_Y * 2) / DESK_ICON_Y_STRIDE,
    ),
  );
}

export function desktopIconPosition(
  index: number,
  rows: number,
): { x: number; y: number } {
  return {
    x: DESK_ICON_X + Math.floor(index / Math.max(1, rows)) * DESK_ICON_X_STRIDE,
    y: DESK_ICON_Y + (index % Math.max(1, rows)) * DESK_ICON_Y_STRIDE,
  };
}

export function desktopIconAt(
  x: number,
  y: number,
  count: number,
  rows: number,
): number {
  for (let i = 0; i < count; i++) {
    const p = desktopIconPosition(i, rows);
    if (x >= p.x && x < p.x + DESK_ICON_W && y >= p.y && y < p.y + DESK_ICON_H)
      return i;
  }
  return -1;
}

export type CaptionButton = "min" | "max" | "close";
export type Dir = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export type Region =
  | { kind: "caption" }
  | { kind: "button"; button: CaptionButton }
  | { kind: "menu"; index: number }
  | { kind: "content"; cx: number; cy: number }
  | { kind: "resize"; dir: Dir };

export interface ChromeOpts {
  /** Caption controls present, left to right (close is always last). */
  buttons: readonly CaptionButton[];
  resizable: boolean;
  maximized: boolean;
  /** Menu-bar item widths in px (empty = no menu bar). */
  menuWidths: readonly number[];
}

/** Left x of each caption button, right-aligned with the theme-selected gap. */
export function captionButtonXs(
  w: number,
  buttons: readonly CaptionButton[],
  metrics: ChromeMetrics = DEFAULT_METRICS,
): number[] {
  const xs: number[] = [];
  let right = w - metrics.frame - metrics.buttonRight;
  for (let i = buttons.length - 1; i >= 0; i--) {
    xs.unshift(right - metrics.buttonW);
    right -= metrics.buttonW + metrics.buttonGap;
  }
  return xs;
}

/** Content-area top inside the window (frame + caption + menu bar). */
export function contentTop(
  opts: Pick<ChromeOpts, "menuWidths">,
  metrics: ChromeMetrics = DEFAULT_METRICS,
): number {
  return (
    metrics.captionTop +
    metrics.titleH +
    metrics.titleGap +
    (opts.menuWidths.length > 0 ? metrics.menuH : 0)
  );
}

/** Change only chrome around an existing client rectangle. Child application
 *  surfaces depend on this invariant because their resolved logical viewport
 *  is the client size, independent of the System UI theme. */
export function reframeGeo(
  geo: Geo,
  opts: Pick<ChromeOpts, "menuWidths">,
  previous: ChromeMetrics,
  next: ChromeMetrics,
): Geo {
  const clientW = geo.w - previous.frame * 2;
  const clientH = geo.h - previous.frame - contentTop(opts, previous);
  return {
    ...geo,
    w: clientW + next.frame * 2,
    h: clientH + next.frame + contentTop(opts, next),
  };
}

/** Hit-test a point in window-local coordinates against the chrome. */
export function hitRegion(
  geo: Geo,
  opts: ChromeOpts,
  px: number,
  py: number,
  metrics: ChromeMetrics = DEFAULT_METRICS,
): Region | null {
  const x = px - geo.x;
  const y = py - geo.y;
  if (x < 0 || y < 0 || x >= geo.w || y >= geo.h) return null;

  // Resize bands claim the outer edge before anything else.
  if (opts.resizable && !opts.maximized) {
    const corner = metrics.resizeCorner;
    const n = y < metrics.resizeBand;
    const s = y >= geo.h - metrics.resizeBand;
    const w = x < metrics.resizeBand;
    const e = x >= geo.w - metrics.resizeBand;
    if (n || s || w || e) {
      const nearL = x < corner;
      const nearR = x >= geo.w - corner;
      const nearT = y < corner;
      const nearB = y >= geo.h - corner;
      let dir: Dir;
      if ((n && nearL) || (w && nearT)) dir = "nw";
      else if ((n && nearR) || (e && nearT)) dir = "ne";
      else if ((s && nearL) || (w && nearB)) dir = "sw";
      else if ((s && nearR) || (e && nearB)) dir = "se";
      else if (n) dir = "n";
      else if (s) dir = "s";
      else if (w) dir = "w";
      else dir = "e";
      return { kind: "resize", dir };
    }
  }

  // Caption strip.
  if (y >= metrics.captionTop && y < metrics.captionTop + metrics.titleH) {
    const xs = captionButtonXs(geo.w, opts.buttons, metrics);
    const btnTop = metrics.captionTop + metrics.buttonTop;
    if (y >= btnTop && y < btnTop + metrics.buttonH) {
      for (let i = 0; i < xs.length; i++) {
        if (x >= xs[i] && x < xs[i] + metrics.buttonW) {
          return { kind: "button", button: opts.buttons[i] };
        }
      }
    }
    if (x >= metrics.frame && x < geo.w - metrics.frame)
      return { kind: "caption" };
  }

  // Menu bar.
  const menuTop = metrics.captionTop + metrics.titleH + metrics.titleGap;
  if (
    opts.menuWidths.length > 0 &&
    y >= menuTop &&
    y < menuTop + metrics.menuH
  ) {
    let mx = metrics.frame;
    for (let i = 0; i < opts.menuWidths.length; i++) {
      if (x >= mx && x < mx + opts.menuWidths[i])
        return { kind: "menu", index: i };
      mx += opts.menuWidths[i];
    }
  }

  const top = contentTop(opts, metrics);
  if (
    x >= metrics.frame &&
    x < geo.w - metrics.frame &&
    y >= top &&
    y < geo.h - metrics.frame
  ) {
    return { kind: "content", cx: x - metrics.frame, cy: y - top };
  }
  return { kind: "caption" }; // exposed frame padding drags with the caption
}

/** Apply a resize drag: dir edge follows the pointer, mins hold, the
 *  anchored edge never moves. */
export function resizeGeo(
  orig: Geo,
  dir: Dir,
  dx: number,
  dy: number,
  minW: number,
  minH: number,
): Geo {
  let { x, y, w, h } = orig;
  if (dir.includes("e")) w = Math.max(minW, orig.w + dx);
  if (dir.includes("s")) h = Math.max(minH, orig.h + dy);
  if (dir.includes("w")) {
    w = Math.max(minW, orig.w - dx);
    x = orig.x + orig.w - w;
  }
  if (dir.includes("n")) {
    h = Math.max(minH, orig.h - dy);
    y = orig.y + orig.h - h;
  }
  return { x, y, w, h };
}

/** Clamp a moved window so its caption stays reachable: some strip of the
 *  title bar remains on screen and above the taskbar. */
export function clampMove(
  geo: Geo,
  vpW: number,
  vpH: number,
  metrics: ChromeMetrics = DEFAULT_METRICS,
): Geo {
  const grip = 48; // px of caption that must stay visible
  const x = Math.min(Math.max(geo.x, grip - geo.w), vpW - grip);
  const y = Math.min(
    Math.max(geo.y, 0),
    vpH - metrics.taskH - metrics.titleH,
  );
  return { ...geo, x, y };
}

/** Maximized geometry: the desktop minus the taskbar. */
export function maximizedGeo(
  vpW: number,
  vpH: number,
  metrics: ChromeMetrics = DEFAULT_METRICS,
): Geo {
  return { x: 0, y: 0, w: vpW, h: vpH - metrics.taskH };
}

/** Cascade position for the i-th opened window. */
export function cascadePos(
  i: number,
  vpW: number,
  vpH: number,
  w: number,
  h: number,
  metrics: ChromeMetrics = DEFAULT_METRICS,
): Geo {
  const step = 24;
  const cols = Math.max(
    1,
    Math.floor((vpH - metrics.taskH - h - 8) / step) + 1,
  );
  const k = i % Math.max(1, cols);
  const x = Math.min(64 + i * step, Math.max(8, vpW - w - 8));
  const y = 28 + k * step;
  return { x, y, w, h };
}

/** The resize cursor for a band direction ({t:"cursor"} intent keys). */
export function cursorForDir(dir: Dir): "ew" | "ns" | "nwse" | "nesw" {
  switch (dir) {
    case "e":
    case "w":
      return "ew";
    case "n":
    case "s":
      return "ns";
    case "nw":
    case "se":
      return "nwse";
    case "ne":
    case "sw":
      return "nesw";
  }
}

// ---------------------------------------------------------------------------
// Start panel
// ---------------------------------------------------------------------------

/** One hit/paint rectangle in the Start panel, in desktop coordinates. */
export interface StartRow {
  /** Index into the item list the layout was built from. */
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface StartLayout {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Column split (0 when the theme paints one column beside a rail). */
  leftW: number;
  headerH: number;
  footerH: number;
  bodyY: number;
  bodyH: number;
  rows: StartRow[];
}

interface StartItem {
  sep?: boolean;
  col?: "right";
  bottom?: boolean;
  foot?: boolean;
}

/** Panel geometry for a Start item list. One function serves both panels:
 *  Classic stacks every item in one column beside its rail, XP splits them
 *  into a programs column and a places column, pins `bottom` items under the
 *  programs column and lays `foot` items along the bottom strip. Paint
 *  (chrome.tsx) and hit testing (app.tsx) both read these rectangles, so a
 *  theme switch can never leave one of them behind. */
export function startLayout(
  items: readonly StartItem[],
  vpH: number,
  metrics: ChromeMetrics = DEFAULT_METRICS,
): StartLayout {
  const { startRowH: row, startSepH: sep, startLeftW: leftW } = metrics;
  const twoColumn = metrics.startHeaderH > 0;
  const pad = 1;
  const rightW = metrics.startW - leftW - pad * 2;

  const height = (which: (it: StartItem) => boolean) =>
    items.filter(which).reduce((a, it) => a + (it.sep ? sep : row), 0);

  let bodyH: number;
  if (twoColumn) {
    const left = height((it) => !it.foot && it.col !== "right" && !it.bottom);
    const bottom = height((it) => !it.foot && !!it.bottom);
    const right = height((it) => !it.foot && it.col === "right");
    // Pinned rows (their own separator included) sit at the column's foot.
    bodyH = Math.max(left + bottom, right);
  } else {
    bodyH = height((it) => true);
  }

  const h = metrics.startHeaderH + bodyH + metrics.startFooterH + pad * 2;
  const x = metrics.startX;
  const y = vpH - metrics.taskH - h;
  const bodyY = y + pad + metrics.startHeaderH;

  const rows: StartRow[] = [];
  if (twoColumn) {
    let ly = bodyY;
    let ry = bodyY;
    const bottomH = height((it) => !it.foot && !!it.bottom);
    const bottomY = bodyY + bodyH - bottomH;
    let by = bottomY;
    let fx = x + metrics.startW - pad;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const h = it.sep ? sep : row;
      if (it.foot) {
        const w = Math.round(metrics.startW / 2);
        fx -= w;
        rows.push({
          index: i,
          x: fx,
          y: y + pad + metrics.startHeaderH + bodyH,
          w,
          h: metrics.startFooterH,
        });
        continue;
      }
      if (it.bottom) {
        if (!it.sep) rows.push({ index: i, x: x + pad, y: by, w: leftW, h });
        by += h;
        continue;
      }
      if (it.col === "right") {
        if (!it.sep)
          rows.push({ index: i, x: x + pad + leftW, y: ry, w: rightW, h });
        ry += h;
        continue;
      }
      if (!it.sep) rows.push({ index: i, x: x + pad, y: ly, w: leftW, h });
      ly += h;
    }
  } else {
    let oy = y + pad;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const h = it.sep ? sep : row;
      if (!it.sep)
        rows.push({
          index: i,
          x: x + pad + metrics.startRailW,
          y: oy,
          w: metrics.startW - pad * 2 - metrics.startRailW,
          h,
        });
      oy += h;
    }
  }

  return {
    x,
    y,
    w: metrics.startW,
    h,
    leftW: twoColumn ? leftW : 0,
    headerH: metrics.startHeaderH,
    footerH: metrics.startFooterH,
    bodyY,
    bodyH,
    rows,
  };
}

/** The item index under a point, or -1. */
export function startRowAt(layout: StartLayout, x: number, y: number): number {
  for (const r of layout.rows) {
    if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) return r.index;
  }
  return -1;
}
