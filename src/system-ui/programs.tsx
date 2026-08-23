// src/system-ui/programs.tsx — the window contents: Notepad (with selection),
// Minesweeper, the Explorer-style folder view, About and Shut Down dialogs.
// Vue Vapor JSX, presentational like chrome.tsx; each program also exports
// the content-local hit helpers app.tsx routes clicks through, so render
// geometry and hit geometry sit in one file. Content coordinates are
// (cx, cy) from wm.ts hitRegion — origin at the frame's inner top-left,
// below caption (and menu bar if present).

import { computed } from "vue";
import {
  CompositorSurface,
  Image,
  View,
} from "@pocketjs/framework/components";
import { getOps } from "@pocketjs/framework/host";
import { UiText } from "./chrome.tsx";
import { FONT, type DesktopTheme } from "./theme.ts";
import {
  caretXY,
  segSelSpan,
  segsFromBreaks,
  wrapLine,
  type VSeg,
} from "./notepad.ts";
import { MINES_W, type Cell } from "./mines.ts";
import type {
  AboutData,
  FolderData,
  MinesData,
  PadData,
  PocketData,
  ShutdownData,
  WinCtl,
} from "./state.ts";

export function measure(s: string, fontSlot = FONT): number {
  const ops = getOps();
  return ops.measureText ? ops.measureText(s, fontSlot) : s.length * 7;
}

// ---------------------------------------------------------------------------
// Notepad
// ---------------------------------------------------------------------------

export const PAD_LINE_H = 16;
export const PAD_PAD = 3; // inset of the text from the white well

// Wrap math runs on every render, keystroke and pointer move, so word/prefix
// widths ride a bounded cache (advances are additive — a cached width is
// exact forever; the atlas never changes at runtime).
const widthCache = new Map<string, number>();

/** Cached per-slot width — the `width` function every wrap helper takes. */
export function padWidth(s: string, fontSlot = FONT): number {
  if (s === "") return 0;
  const key = `${fontSlot}\u0000${s}`;
  let w = widthCache.get(key);
  if (w === undefined) {
    if (widthCache.size > 4096) widthCache.clear();
    w = measure(s, fontSlot);
    widthCache.set(key, w);
  }
  return w;
}

/** Wrap width for a notepad window: the content well minus the 3px text
 *  insets (mirrors NotepadView's left-[3] + right margin). Infinity when
 *  Word Wrap is off — every line becomes one visual segment. */
export function padWrapW(w: WinCtl, frame: number): number {
  const d = w.data as PadData;
  return d.wrap.value
    ? Math.max(40, w.geo.value.w - frame * 2 - PAD_PAD * 2)
    : Infinity;
}

/** One line's visual segments: the host wrapText op when present (spec op
 *  43 — the platform half: core greedy over the slot's measure provider,
 *  gpui's LineWrapper for native-text apps), else the same greedy rules in
 *  JS over measureText. A parity test pins the two equal on baked hosts. */
function wrapLineHost(
  line: string,
  maxW: number,
  fontSlot = FONT,
): { from: number; to: number }[] {
  const ops = getOps();
  if (Number.isFinite(maxW) && ops.wrapText) {
    return segsFromBreaks(line.length, ops.wrapText(line, fontSlot, maxW));
  }
  return wrapLine(line, maxW, (text) => padWidth(text, fontSlot));
}

/** The whole document as visual segments through the host/fallback path. */
export function wrapDocHost(
  lines: string[],
  maxW: number,
  fontSlot = FONT,
): VSeg[] {
  const out: VSeg[] = [];
  for (let row = 0; row < lines.length; row++) {
    for (const s of wrapLineHost(lines[row], maxW, fontSlot))
      out.push({ row, from: s.from, to: s.to });
  }
  return out;
}

/** The window's visual segments — the ONE layout both the render below and
 *  app.tsx hit-testing/caret movement read. */
export function padSegs(w: WinCtl, frame: number, fontSlot = FONT): VSeg[] {
  const d = w.data as PadData;
  return wrapDocHost(d.doc.value.lines, padWrapW(w, frame), fontSlot);
}

export function NotepadView(props: {
  data: PadData;
  wrapW: number;
  active: boolean;
  theme: DesktopTheme;
}) {
  const d = props.data;
  const fontSlot = () => props.theme.fontSlot(false, false);
  const width = (text: string) => padWidth(text, fontSlot());
  const segsAll = () => wrapDocHost(d.doc.value.lines, props.wrapW, fontSlot());
  const caretPos = () =>
    caretXY(segsAll(), d.doc.value.lines, d.doc.value.caret, width);
  const caretX = () => {
    const pre = d.preedit.value;
    return caretPos().x + (pre ? width(pre.s.slice(0, pre.c)) : 0);
  };
  /** Visual-segment text split at the selection edges. */
  const parts = (seg: VSeg): { t: string; sel: boolean }[] => {
    const line = d.doc.value.lines[seg.row];
    const span = segSelSpan(d.doc.value, seg);
    if (!span) return [{ t: line.slice(seg.from, seg.to), sel: false }];
    return [
      { t: line.slice(seg.from, span.from), sel: false },
      { t: line.slice(span.from, span.to), sel: true },
      { t: line.slice(span.to, seg.to), sel: false },
    ];
  };
  return (
    <View class={props.theme.notepadWell}>
      <View class="flex-1 relative overflow-hidden">
        <View
          class="absolute left-[3] top-[3] right-0 flex-col"
          style={{ translateY: -d.scroll.value }}
        >
          {segsAll().map((seg, vi) => (
            <View class="h-[16] flex-row items-center">
              {vi === caretPos().vrow && d.preedit.value
                ? [
                    <UiText
                      t={d.doc.value.lines[seg.row].slice(
                        seg.from,
                        d.doc.value.caret.col,
                      )}
                      theme={props.theme}
                    />,
                    <View class="flex-col">
                      <UiText t={d.preedit.value.s} theme={props.theme} />
                      <View class="h-[1] bg-[#000000]" />
                    </View>,
                    <UiText
                      t={d.doc.value.lines[seg.row].slice(
                        d.doc.value.caret.col,
                        seg.to,
                      )}
                      theme={props.theme}
                    />,
                  ]
                : parts(seg).map((p) =>
                    p.sel ? (
                      <View class={props.theme.selection}>
                        <UiText
                          cls={props.theme.selectionText}
                          t={p.t}
                          theme={props.theme}
                        />
                      </View>
                    ) : (
                      <UiText t={p.t} theme={props.theme} />
                    ),
                  )}
            </View>
          ))}
        </View>
        {props.active ? (
          <View
            class="absolute w-[1] h-[14] bg-[#000000] animate-caret"
            style={{
              insetL: 0,
              insetT: 0,
              translateX: 3 + caretX(),
              translateY: 3 + caretPos().vrow * PAD_LINE_H - d.scroll.value + 1,
            }}
          />
        ) : null}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Pocket app surface — an explicit native-compositor instruction at this exact
// point in shell paint order. The fallback remains visible without a runtime
// AppSupervisor or while the isolated package has no DrawList to paint.
// ---------------------------------------------------------------------------

export function PocketAppView(props: {
  data: PocketData;
  active: boolean;
  theme: DesktopTheme;
}) {
  return (
    <View class="flex-1 relative overflow-hidden bg-[#000000]">
      <View class={props.theme.pocketLoading}>
        <Image class="w-[32] h-[32] mb-[8]" src="icons/pocket-app.svg" />
        <UiText t={`Starting ${props.data.app.title}...`} theme={props.theme} />
        <UiText
          cls={props.theme.mutedText}
          t="Arrow keys + Z/X/A/S + Q/W"
          theme={props.theme}
        />
      </View>
      <CompositorSurface
        class="absolute inset-0"
        package={props.data.app.package}
        focused={props.active}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Minesweeper — fixed-size window; all metrics in content-local px.
// ---------------------------------------------------------------------------

export const MINES_GEO = { w: 166, h: 227 } as const;
const M_PAD = 5; // content padding
const M_HEADER_H = 36;
const M_FIELD_TOP = M_PAD + M_HEADER_H + 6; // header + gap
const M_CELL = 16;
const M_CELLS_X = M_PAD + 3; // field bevel-w-[3] ring
const M_CELLS_Y = M_FIELD_TOP + 3;

export type MinesHit = { type: "cell"; i: number } | { type: "smiley" } | null;

export function minesHit(cx: number, cy: number): MinesHit {
  const sx = 160 / 2 - 13;
  if (cx >= sx && cx < sx + 26 && cy >= M_PAD + 5 && cy < M_PAD + 5 + 26) {
    return { type: "smiley" };
  }
  const x = Math.floor((cx - M_CELLS_X) / M_CELL);
  const y = Math.floor((cy - M_CELLS_Y) / M_CELL);
  if (x >= 0 && x < 9 && y >= 0 && y < 9)
    return { type: "cell", i: y * MINES_W + x };
  return null;
}

const NUM_COLORS = [
  "", // 0 unused
  "text-[#0000ff]",
  "text-[#008000]",
  "text-[#ff0000]",
  "text-[#000080]",
  "text-[#800000]",
  "text-[#008080]",
  "text-[#000000]",
  "text-[#808080]",
];

const SEGS: Record<string, number> = {
  "0": 0b0111111,
  "1": 0b0000110,
  "2": 0b1011011,
  "3": 0b1001111,
  "4": 0b1100110,
  "5": 0b1101101,
  "6": 0b1111101,
  "7": 0b0000111,
  "8": 0b1111111,
  "9": 0b1101111,
  "-": 0b1000000,
  " ": 0,
};

/** One 7-seg digit, 13×23, red on black.
 *     a
 *   f   b        segments: bit 0..6 = a b c d e f g
 *     g
 *   e   c
 *     d
 */
function Digit(props: { ch: string }) {
  const on = (bit: number) => (((SEGS[props.ch] ?? 0) >> bit) & 1) === 1;
  return (
    <View class="w-[13] h-[23] bg-[#000000] relative">
      <View
        class={
          on(0)
            ? "absolute left-[2] top-[1] w-[9] h-[2] bg-[#ff0000]"
            : "absolute left-[2] top-[1] w-[9] h-[2] bg-[#3a0000]"
        }
      />
      <View
        class={
          on(1)
            ? "absolute left-[10] top-[2] w-[2] h-[9] bg-[#ff0000]"
            : "absolute left-[10] top-[2] w-[2] h-[9] bg-[#3a0000]"
        }
      />
      <View
        class={
          on(2)
            ? "absolute left-[10] top-[12] w-[2] h-[9] bg-[#ff0000]"
            : "absolute left-[10] top-[12] w-[2] h-[9] bg-[#3a0000]"
        }
      />
      <View
        class={
          on(3)
            ? "absolute left-[2] top-[20] w-[9] h-[2] bg-[#ff0000]"
            : "absolute left-[2] top-[20] w-[9] h-[2] bg-[#3a0000]"
        }
      />
      <View
        class={
          on(4)
            ? "absolute left-[1] top-[12] w-[2] h-[9] bg-[#ff0000]"
            : "absolute left-[1] top-[12] w-[2] h-[9] bg-[#3a0000]"
        }
      />
      <View
        class={
          on(5)
            ? "absolute left-[1] top-[2] w-[2] h-[9] bg-[#ff0000]"
            : "absolute left-[1] top-[2] w-[2] h-[9] bg-[#3a0000]"
        }
      />
      <View
        class={
          on(6)
            ? "absolute left-[2] top-[10] w-[9] h-[3] bg-[#ff0000]"
            : "absolute left-[2] top-[10] w-[9] h-[3] bg-[#3a0000]"
        }
      />
    </View>
  );
}

/** Three-digit 7-seg counter (mine count / timer), clamped to -99..999. */
function Counter(props: { value: number }) {
  const text = computed(() => {
    const v = Math.max(-99, Math.min(999, Math.round(props.value)));
    return v < 0
      ? "-" + String(-v).padStart(2, "0")
      : String(v).padStart(3, "0");
  });
  return (
    <View class="flex-row bevel-[#808080,#ffffff] p-[1] gap-0">
      <Digit ch={text.value[0]} />
      <Digit ch={text.value[1]} />
      <Digit ch={text.value[2]} />
    </View>
  );
}

/** One field cell: raised while hidden, flat when revealed (red on the bust
 *  mine), flag/mine art, colored adjacency digit. */
function MinesCell(props: {
  data: MinesData;
  i: number;
  theme: DesktopTheme;
}) {
  const c = (): Cell => props.data.board.value.cells[props.i];
  const heldDown = () =>
    props.data.held.value === props.i && c().state === "hidden";
  // The hidden/revealed swap must sit in a JSX child position — a bare
  // ternary returned from the component body evaluates once at setup.
  return (
    <View class="w-[16] h-[16] relative">
      {c().state !== "revealed" ? (
        <View
          class={
            heldDown()
              ? "absolute inset-0 bg-[#c0c0c0] bevel-[#808080,#c0c0c0] flex-col justify-center items-center"
              : "absolute inset-0 bg-[#c0c0c0] bevel-[#ffffff,#808080] bevel-w-[2] flex-col justify-center items-center"
          }
        >
          {c().state === "flag" ? (
            <Image class="w-[8] h-[8]" src="icons/flag.svg" />
          ) : null}
        </View>
      ) : (
        <View
          class={
            props.data.board.value.bust === props.i
              ? "absolute inset-0 bg-[#ff0000] bevel-[#808080,#ff0000] flex-col justify-center items-center"
              : "absolute inset-0 bg-[#c0c0c0] bevel-[#808080,#c0c0c0] flex-col justify-center items-center"
          }
        >
          {c().mine ? (
            <Image class="w-[8] h-[8]" src="icons/mine.svg" />
          ) : c().adj > 0 ? (
            <UiText
              bold
              cls={NUM_COLORS[c().adj] || "text-[#000000]"}
              t={String(c().adj)}
              theme={props.theme}
            />
          ) : null}
        </View>
      )}
    </View>
  );
}

const ROWS9 = Array.from({ length: MINES_W }, (_, i) => i);

/** Minesweeper content: sunken header (mine counter, smiley, timer) over the
 *  9×9 field. The grid rides static index arrays — the board ref retriggers
 *  cell reads, rows never move. */
export function MinesView(props: {
  data: MinesData;
  theme: DesktopTheme;
}) {
  const d = props.data;
  const smiley = () => {
    if (d.smileyHeld.value) return "icons/smile.svg";
    const m = d.board.value;
    if (m.phase === "lost") return "icons/smile-dead.svg";
    if (m.phase === "won") return "icons/smile-cool.svg";
    if (d.held.value >= 0) return "icons/smile-ooh.svg";
    return "icons/smile.svg";
  };
  return (
    <View class={props.theme.minesRoot}>
      <View class="h-[36] flex-row items-center justify-between px-[5] bevel-[#808080,#ffffff] bevel-w-[2]">
        <Counter value={10 - d.board.value.flags} />
        <View
          class={
            d.smileyHeld.value
              ? "w-[26] h-[26] flex-col justify-center items-center bg-[#c0c0c0] bevel-[#808080,#ffffff]"
              : "w-[26] h-[26] flex-col justify-center items-center bg-[#c0c0c0] bevel-[#ffffff,#808080] bevel-w-[2]"
          }
        >
          <Image class="w-[16] h-[16]" src={smiley()} />
        </View>
        <Counter value={d.elapsed.value} />
      </View>
      <View class="h-[6]" />
      <View class="flex-col bevel-[#808080,#ffffff] bevel-w-[3] p-[3]">
        {ROWS9.map((ry) => (
          <View class="flex-row">
            {ROWS9.map((rx) => (
              <MinesCell data={d} i={ry * MINES_W + rx} theme={props.theme} />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Folder (Explorer details view)
// ---------------------------------------------------------------------------

export const FOLDER_HEADER_H = 17;
export const FOLDER_ROW_H = 17;
export const FOLDER_STATUS_H = 20;
export const XP_FOLDER_HEADER_H = 20;
export const XP_FOLDER_ROW_H = 20;

/** Row index for a content-local click inside the list, -1 none. */
export function folderRowAt(
  cx: number,
  cy: number,
  rowCount: number,
  theme: DesktopTheme,
): number {
  if (theme.folderExplorerChrome && cx < theme.metrics.folderSidebarW) return -1;
  const top = theme.folderExplorerChrome ? theme.metrics.folderToolbarH : 1;
  const headerH = theme.folderExplorerChrome
    ? XP_FOLDER_HEADER_H
    : FOLDER_HEADER_H;
  const rowH = theme.folderExplorerChrome ? XP_FOLDER_ROW_H : FOLDER_ROW_H;
  const i = Math.floor((cy - top - headerH) / rowH);
  return i >= 0 && i < rowCount ? i : -1;
}

export function FolderView(props: {
  data: FolderData;
  resizable: boolean;
  theme: DesktopTheme;
}) {
  const d = props.data;
  if (props.theme.folderExplorerChrome) {
    return (
      <View class="flex-1 flex-col">
        <View class={props.theme.folderToolbar}>
          <View class={props.theme.folderToolbarButton}>
            <Image class="w-[18] h-[18]" src="icons/xp-back-16.svg" />
            <UiText
              cls={props.theme.folderToolbarLabel}
              t="Back"
              theme={props.theme}
            />
          </View>
          <View class={props.theme.folderToolbarButton}>
            <Image class="w-[18] h-[18]" src="icons/xp-forward-16.svg" />
          </View>
          <View class={props.theme.folderToolbarButton}>
            <Image class="w-[18] h-[18]" src="icons/xp-up-16.svg" />
          </View>
          <View class="w-[1] h-[22] bg-[#c7c4b6] mx-[3]" />
          <View class={props.theme.folderToolbarButton}>
            <Image
              class="w-[18] h-[18]"
              src={props.theme.iconSource("icons/find-16.svg")}
            />
            <UiText
              cls={props.theme.folderToolbarLabel}
              t="Search"
              theme={props.theme}
            />
          </View>
          <View class={props.theme.folderToolbarButton}>
            <Image
              class="w-[18] h-[18]"
              src={props.theme.iconSource("icons/folder-16.svg")}
            />
            <UiText
              cls={props.theme.folderToolbarLabel}
              t="Folders"
              theme={props.theme}
            />
          </View>
          <View class="flex-1" />
          <View class={props.theme.folderToolbarButton}>
            <Image class="w-[18] h-[18]" src="icons/xp-view-16.svg" />
          </View>
        </View>
        <View class={props.theme.folderAddressBar}>
          <UiText
            cls={props.theme.folderAddressLabel}
            t="Address"
            theme={props.theme}
          />
          <View class={props.theme.folderAddressWell}>
            <Image
              class="w-[16] h-[16]"
              src={props.theme.iconSource("icons/folder-16.svg")}
            />
            <UiText
              cls={props.theme.folderAddressText}
              t={d.location}
              theme={props.theme}
            />
          </View>
        </View>
        <View class={props.theme.folderBody}>
          <View class={props.theme.folderSidebar}>
            <View class={props.theme.folderSidebarCard}>
              <View class={props.theme.folderSidebarHeading}>
                <UiText
                  bold
                  cls="text-[#215dc6]"
                  t="File and Folder Tasks"
                  theme={props.theme}
                />
              </View>
              {[
                "Make a new folder",
                "Publish this folder",
                "Share this folder",
              ].map((label) => (
                <View class={props.theme.folderSidebarItem}>
                  <Image class="w-[12] h-[12]" src="icons/xp-link-12.svg" />
                  <UiText cls="text-[#215dc6]" t={label} theme={props.theme} />
                </View>
              ))}
            </View>
            <View class={props.theme.folderSidebarCard}>
              <View class={props.theme.folderSidebarHeading}>
                <UiText
                  bold
                  cls="text-[#215dc6]"
                  t="Other Places"
                  theme={props.theme}
                />
              </View>
              {[
                ["My Documents", "icons/folder-16.svg"],
                ["My Computer", "icons/computer-16.svg"],
                ["Control Panel", "icons/settings-16.svg"],
              ].map(([label, icon]) => (
                <View class={props.theme.folderSidebarItem}>
                  <Image
                    class="w-[14] h-[14]"
                    src={props.theme.iconSource(icon)}
                  />
                  <UiText cls="text-[#215dc6]" t={label} theme={props.theme} />
                </View>
              ))}
            </View>
            <View class={props.theme.folderSidebarCard}>
              <View class={props.theme.folderSidebarHeading}>
                <UiText
                  bold
                  cls="text-[#215dc6]"
                  t="Details"
                  theme={props.theme}
                />
              </View>
              <View class="px-[9] py-[4]">
                <UiText bold t={d.location} theme={props.theme} />
              </View>
            </View>
          </View>
          <View class={props.theme.folderList}>
            <View class="h-[20] flex-row shrink-0">
              <View class={props.theme.folderHeader("name")}>
                <UiText bold t="Name" theme={props.theme} />
              </View>
              <View class={props.theme.folderHeader("modified")}>
                <UiText t="Date Modified" theme={props.theme} />
              </View>
              <View class={props.theme.folderHeader("size")}>
                <UiText t="Size" theme={props.theme} />
              </View>
              <View class={props.theme.folderHeader("type")}>
                <UiText t="Kind" theme={props.theme} />
              </View>
            </View>
            {d.rows.map((row, i) => (
              <View class={props.theme.folderRow(d.selected.value === i)}>
                <Image
                  class="w-[16] h-[16] mr-[4]"
                  src={props.theme.iconSource(row.icon)}
                />
                <View class="flex-1 flex-row overflow-hidden">
                  <UiText
                    cls={
                      d.selected.value === i
                        ? props.theme.selectionText
                        : "text-[#000000]"
                    }
                    t={row.name}
                    theme={props.theme}
                  />
                </View>
                <View class="w-[122] flex-row overflow-hidden">
                  <UiText
                    cls={
                      d.selected.value === i
                        ? props.theme.selectionText
                        : "text-[#333333]"
                    }
                    t={row.modified ?? "--"}
                    theme={props.theme}
                  />
                </View>
                <View class="w-[54] flex-row justify-end pr-[5]">
                  <UiText
                    cls={
                      d.selected.value === i
                        ? props.theme.selectionText
                        : "text-[#333333]"
                    }
                    t={row.size || "--"}
                    theme={props.theme}
                  />
                </View>
                <View class="w-[90] flex-row pl-[5] overflow-hidden">
                  <UiText
                    cls={
                      d.selected.value === i
                        ? props.theme.selectionText
                        : "text-[#333333]"
                    }
                    t={row.type}
                    theme={props.theme}
                  />
                </View>
              </View>
            ))}
            {d.rows.length === 0 ? (
              <View class="flex-1 flex-col justify-center items-center">
                <UiText cls={props.theme.mutedText} t="(empty)" theme={props.theme} />
              </View>
            ) : null}
          </View>
        </View>
        <View class="h-[22] flex-row items-end gap-[2] pt-[2]">
          <View class={props.theme.statusWell}>
            <UiText t={`${d.rows.length} object(s)`} theme={props.theme} />
          </View>
          {props.resizable ? (
            <Image
              class="w-[16] h-[16]"
              src={props.theme.iconSource("icons/grip.svg")}
            />
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View class="flex-1 flex-col">
      <View class={props.theme.folderWell}>
        <View class="h-[17] flex-row shrink-0">
          <View class={props.theme.folderHeader("name")}>
            <UiText t="Name" theme={props.theme} />
          </View>
          <View class={props.theme.folderHeader("size")}>
            <UiText t="Size" theme={props.theme} />
          </View>
          <View class={props.theme.folderHeader("type")}>
            <UiText t="Type" theme={props.theme} />
          </View>
        </View>
        {d.rows.map((row, i) => (
          <View
            class={props.theme.folderRow(d.selected.value === i)}
          >
            <Image
              class="w-[16] h-[16] mr-[4]"
              src={props.theme.iconSource(row.icon)}
            />
            <View class="flex-1 flex-row overflow-hidden">
              <UiText
                cls={
                  d.selected.value === i
                    ? props.theme.selectionText
                    : "text-[#000000]"
                }
                t={row.name}
                theme={props.theme}
              />
            </View>
            <View class="w-[60] flex-row justify-end">
              <UiText
                cls={
                  d.selected.value === i
                    ? props.theme.selectionText
                    : "text-[#000000]"
                }
                t={row.size}
                theme={props.theme}
              />
            </View>
            <View class="w-[100] flex-row pl-[6]">
              <UiText
                cls={
                  d.selected.value === i
                    ? props.theme.selectionText
                    : "text-[#000000]"
                }
                t={row.type}
                theme={props.theme}
              />
            </View>
          </View>
        ))}
        {d.rows.length === 0 ? (
          <View class="flex-1 flex-col justify-center items-center">
            <UiText cls={props.theme.mutedText} t="(empty)" theme={props.theme} />
          </View>
        ) : null}
      </View>
      <View class="h-[20] flex-row items-end gap-[2] pt-[2]">
        <View class={props.theme.statusWell}>
          <UiText t={`${d.rows.length} object(s)`} theme={props.theme} />
        </View>
        {props.resizable ? (
          <Image
            class="w-[16] h-[16]"
            src={props.theme.iconSource("icons/grip.svg")}
          />
        ) : null}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// About + Shut Down dialogs
// ---------------------------------------------------------------------------

export const ABOUT_GEO = { w: 340, h: 216 } as const;
export const SHUTDOWN_GEO = { w: 300, h: 176 } as const;

/** Dialog push button; armed = pressed face + 1px content nudge. */
function DialogButton(props: {
  label: string;
  armed: boolean;
  theme: DesktopTheme;
}) {
  return (
    <View class={props.theme.dialogButton(props.armed)}>
      <View class={props.armed ? "ml-[1] mt-[1]" : ""}>
        <UiText t={props.label} theme={props.theme} />
      </View>
    </View>
  );
}

/** Content-local button hits for the About dialog. */
export function aboutHit(
  contentW: number,
  contentH: number,
  cx: number,
  cy: number,
): "ok" | null {
  const x = contentW - 10 - 75;
  const y = contentH - 10 - 23;
  return cx >= x && cx < x + 75 && cy >= y && cy < y + 23 ? "ok" : null;
}

export function AboutView(props: {
  data: AboutData;
  theme: DesktopTheme;
}) {
  return (
    <View class="flex-1 flex-col p-[10] gap-[8]">
      <View class="flex-row items-center gap-[10]">
        <Image
          class="w-[32] h-[32]"
          src={props.theme.iconSource("icons/computer.svg")}
        />
        <UiText xl t="Pocket Desktop" theme={props.theme} />
      </View>
      <View class="h-[2] flex-col">
        <View class="h-[1] bg-[#808080]" />
        <View class="h-[1] bg-[#ffffff]" />
      </View>
      <UiText t="A desktop compositor demo on the gpui backend." theme={props.theme} />
      <UiText t="Vue Vapor JSX over the same DrawList the" theme={props.theme} />
      <UiText t="consoles boot; windows, menus and shortcuts" theme={props.theme} />
      <UiText t="live in the guest." theme={props.theme} />
      <UiText
        cls={props.theme.mutedText}
        t="github.com/pocket-stack/pocket-desktop"
        theme={props.theme}
      />
      <View class="flex-1" />
      <View class="flex-row justify-end">
        <DialogButton
          label="OK"
          armed={props.data.armed.value === "ok"}
          theme={props.theme}
        />
      </View>
    </View>
  );
}

export type ShutdownHit = "ok" | "cancel" | "radio0" | "radio1" | null;

export function shutdownHit(
  contentW: number,
  contentH: number,
  cx: number,
  cy: number,
): ShutdownHit {
  const by = contentH - 10 - 23;
  const cancelX = contentW - 10 - 75;
  const okX = cancelX - 6 - 75;
  if (cy >= by && cy < by + 23) {
    if (cx >= okX && cx < okX + 75) return "ok";
    if (cx >= cancelX && cx < cancelX + 75) return "cancel";
  }
  for (const i of [0, 1]) {
    const ry = 46 + i * 20;
    if (cx >= 56 && cx < 220 && cy >= ry && cy < ry + 18)
      return i === 0 ? "radio0" : "radio1";
  }
  return null;
}

export function ShutdownView(props: {
  data: ShutdownData;
  theme: DesktopTheme;
}) {
  const radio = (i: number, label: string) => (
    <View class="h-[20] flex-row items-center gap-[6]">
      <View class="w-[12] h-[12] rounded-full bg-[#808080] flex-col justify-center items-center">
        <View class="w-[10] h-[10] rounded-full bg-[#ffffff] flex-col justify-center items-center">
          {props.data.choice.value === i ? (
            <View class="w-[4] h-[4] rounded-full bg-[#000000]" />
          ) : null}
        </View>
      </View>
      <UiText t={label} theme={props.theme} />
    </View>
  );
  return (
    <View class="flex-1 flex-col p-[10]">
      <View class="flex-row items-start gap-[10]">
        <Image
          class="w-[32] h-[32]"
          src={props.theme.iconSource("icons/shutdown.svg")}
        />
        <View class="flex-col gap-[2]">
          <UiText
            t="What do you want the computer to do?"
            theme={props.theme}
          />
        </View>
      </View>
      <View class="h-[10]" />
      <View class="flex-col pl-[46]">
        {radio(0, "Shut down")}
        {radio(1, "Restart")}
      </View>
      <View class="flex-1" />
      <View class="flex-row justify-end gap-[6]">
        <DialogButton
          label="OK"
          armed={props.data.armed.value === "ok"}
          theme={props.theme}
        />
        <DialogButton
          label="Cancel"
          armed={props.data.armed.value === "cancel"}
          theme={props.theme}
        />
      </View>
    </View>
  );
}
