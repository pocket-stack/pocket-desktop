// src/system-ui/gen-icons.ts — pixel-art icon source. ASCII grids compile to
// crispEdges SVGs in src/system-ui/icons/ (committed; re-run on art changes):
//
//   bun src/system-ui/gen-icons.ts
//
// One 16×16 grid per subject; desktop icons emit a second 32px file scaled
// 2× so both stay one art. Caption glyphs and tiny hud art carry their own
// grids at native size. The build then rasterizes each SVG at the plan's
// density like any other asset — no hand-baked PNGs.

import { mkdirSync } from "node:fs";
import { join } from "node:path";

const PAL: Record<string, string> = {
  k: "#000000",
  w: "#ffffff",
  g: "#c0c0c0",
  d: "#808080",
  e: "#dfdfdf",
  y: "#fcd116",
  Y: "#fcf080",
  b: "#000080",
  B: "#1084d0",
  r: "#ff0000",
  R: "#800000",
  t: "#008080",
  G: "#008000",
  o: "#ff8000",
  s: "#ffd800", // smiley yellow
};

interface Icon {
  file: string;
  rows: string[];
  /** Also emit `${file}` at 2× under this name (desktop icons). */
  big?: string;
  /** Smooth vector lens over otherwise pixel-aligned brand artwork. */
  circle?: { cx: number; cy: number; r: number; color: string };
}

function svgFor(
  rows: string[],
  scale: number,
  circle?: Icon["circle"],
): string {
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  for (const r of rows) {
    if (r.length !== w) throw new Error(`gen-icons: ragged grid (row "${r}" vs width ${w})`);
  }
  const byColor = new Map<string, string[]>();
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === "." || ch === " ") {
        x++;
        continue;
      }
      let run = 1;
      while (x + run < row.length && row[x + run] === ch) run++;
      const color = PAL[ch];
      if (!color) throw new Error(`gen-icons: unknown palette char '${ch}'`);
      const d = byColor.get(color) ?? [];
      d.push(`M${x * scale} ${y * scale}h${run * scale}v${scale}h${-run * scale}z`);
      byColor.set(color, d);
      x += run;
    }
  }
  const paths = [...byColor.entries()]
    .map(([color, ds]) => `<path fill="${color}" d="${ds.join("")}"/>`)
    .join("");
  const lens = circle
    ? `<circle cx="${circle.cx * scale}" cy="${circle.cy * scale}" r="${circle.r * scale}" fill="${circle.color}" shape-rendering="geometricPrecision"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w * scale}" height="${h * scale}" viewBox="0 0 ${w * scale} ${h * scale}" shape-rendering="crispEdges">${paths}${lens}</svg>\n`;
}

const ICONS: Icon[] = [
  {
    // My Computer: a CRT over a slim base, navy screen with a sky glint.
    file: "computer-16.svg",
    big: "computer.svg",
    rows: [
      "................",
      ".kkkkkkkkkkkkk..",
      ".kggggggggggkk..",
      ".kgkkkkkkkkgkk..",
      ".kgkbbbbbbkgkk..",
      ".kgkbBBbbbkgkk..",
      ".kgkbBbbbbkgkk..",
      ".kgkbbbbbbkgkk..",
      ".kgkkkkkkkkgkk..",
      ".kggggggggggkk..",
      ".kkkkkkkkkkkkk..",
      "......kggk......",
      "....kkggggkk....",
      "..kggggggggggk..",
      "..kggkkkkkkggk..",
      "..kkkkkkkkkkkk..",
    ],
  },
  {
    // My Documents: the two-tone yellow folder with a paper peeking out.
    file: "folder-16.svg",
    big: "documents.svg",
    rows: [
      "................",
      "................",
      ".kkkkk..........",
      "kYYYYYkkkkkkkk..",
      "kYYYYYYYYYYYYk..",
      "kYwwwwwwwwwwYk..",
      "kYwkkkwwkkwwYk..",
      "kkkkkkkkkkkkkkk.",
      "kyyyyyyyyyyyyyk.",
      "kyYYYYYYYYYYYyk.",
      "kyyyyyyyyyyyyyk.",
      "kyyyyyyyyyyyyyk.",
      "kyyyyyyyyyyyyyk.",
      "kkkkkkkkkkkkkkk.",
      "................",
      "................",
    ],
  },
  {
    // Recycle Bin: gray basket, dark lid, recycle chevrons.
    file: "recycle-16.svg",
    big: "recycle.svg",
    rows: [
      "................",
      "......kkkk......",
      "....kkggggkk....",
      "..kkggggggggkk..",
      ".kddddddddddddk.",
      ".kddddddddddddk.",
      "..kggggggggggk..",
      "..kgGGggggGGgk..",
      "..kgGgggggGggk..",
      "..kggGGgGGgggk..",
      "..kgggGGGggggk..",
      "..kggggGgggggk..",
      "..kggggggggggk..",
      "...kggggggggk...",
      "...kkkkkkkkkk...",
      "................",
    ],
  },
  {
    // Notepad: spiral pad, ruled lines.
    file: "notepad-16.svg",
    big: "notepad.svg",
    rows: [
      "................",
      "..kdkdkdkdkdk...",
      ".kwwwwwwwwwwwk..",
      ".kwwwwwwwwwwwk..",
      ".kwkkkkkkkkwwk..",
      ".kwwwwwwwwwwwk..",
      ".kwkkkkkkwwwwk..",
      ".kwwwwwwwwwwwk..",
      ".kwkkkkkkkwwwk..",
      ".kwwwwwwwwwwwk..",
      ".kwkkkkwwwwwwk..",
      ".kwwwwwwwwwwwk..",
      ".kwwwwwwwwwwwk..",
      ".kkkkkkkkkkkkk..",
      "................",
      "................",
    ],
  },
  {
    // Minesweeper: a raised cell with a mine.
    file: "mines-16.svg",
    big: "mines.svg",
    rows: [
      "wwwwwwwwwwwwwwwd",
      "wggggggggggggggd",
      "wgggggggkggggggd",
      "wgggkggkkkggkggd",
      "wggggkkkkkkkgggd",
      "wgggkkkwwkkkkggd",
      "wgggkkwwkkkkkggd",
      "wgkkkkwwkkkkkkgd",
      "wgggkkkkkkkkkggd",
      "wgggkkkkkkkkkggd",
      "wggggkkkkkkkgggd",
      "wgggkggkkkggkggd",
      "wgggggggkggggggd",
      "wggggggggggggggd",
      "wggggggggggggggd",
      "dddddddddddddddd",
    ],
  },
  {
    // Local disk.
    file: "drive-16.svg",
    rows: [
      "................",
      "................",
      "................",
      "................",
      ".kkkkkkkkkkkkkk.",
      ".kggggggggggggk.",
      ".keeeeeeeeeeegk.",
      ".kggggggggggggk.",
      ".kgggggggggkgGk.",
      ".kkkkkkkkkkkkkk.",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
    ],
  },
  {
    // CD-ROM drive: a disc.
    file: "cdrom-16.svg",
    rows: [
      "................",
      "................",
      ".....kkkkkk.....",
      "...kkeeeeeekk...",
      "..keeeeeeeeeek..",
      "..keeewwweeeek..",
      ".keeewgggweeeek.",
      ".keewggkggweeek.",
      ".keewgkwkgweeek.",
      ".keewggkggweeek.",
      ".keeewgggweeeek.",
      "..keeewwweeeek..",
      "..keeeeeeeeeek..",
      "...kkeeeeeekk...",
      ".....kkkkkk.....",
      "................",
    ],
  },
  {
    // Plain document.
    file: "file-16.svg",
    rows: [
      "................",
      "..kkkkkkkkk.....",
      "..kwwwwwwwkk....",
      "..kwwwwwwwkgk...",
      "..kwwwwwwwkkkk..",
      "..kwkkkkkwwwwk..",
      "..kwwwwwwwwwwk..",
      "..kwkkkkkkkwwk..",
      "..kwwwwwwwwwwk..",
      "..kwkkkkkkwwwk..",
      "..kwwwwwwwwwwk..",
      "..kwkkkkkkkkwk..",
      "..kwwwwwwwwwwk..",
      "..kwwwwwwwwwwk..",
      "..kkkkkkkkkkkk..",
      "................",
    ],
  },
  {
    // Shut Down: a power key on a gray keycap.
    file: "shutdown-16.svg",
    big: "shutdown.svg",
    rows: [
      "................",
      ".kkkkkkkkkkkkkk.",
      ".kwwwwwwwwwwwgk.",
      ".kwggggggggggdk.",
      ".kwgggkkkgggggk.",
      ".kwggkgkgkggggk.",
      ".kwgkggkggkgggk.",
      ".kwgkggkggkgggk.",
      ".kwgkggggggkggk.",
      ".kwgkggggggkggk.",
      ".kwggkggggkgggk.",
      ".kwgggkkkkggggk.",
      ".kwggggggggggdk.",
      ".kgddddddddddgk.",
      ".kkkkkkkkkkkkkk.",
      "................",
    ],
  },
  {
    // Settings: a gear.
    file: "settings-16.svg",
    rows: [
      "................",
      "......kk........",
      "..kk.kggk.kk....",
      "..kgkkggkkgk....",
      "...kggggggk.....",
      "..kkggkkggkk....",
      ".kgggkwwkgggk...",
      ".kgggkwwkgggk...",
      "..kkggkkggkk....",
      "...kggggggk.....",
      "..kgkkggkkgk....",
      "..kk.kggk.kk....",
      "......kk........",
      "................",
      "................",
      "................",
    ],
  },
  {
    // Find: a magnifier.
    file: "find-16.svg",
    rows: [
      "................",
      "...kkkk.........",
      "..kwwwwk........",
      ".kwggggwk.......",
      ".kwgggggk.......",
      ".kwgggggk.......",
      ".kwggggwk.......",
      "..kwwwwk........",
      "...kkkkkk.......",
      "......kkdk......",
      ".......kddk.....",
      "........kddk....",
      ".........kddk...",
      "..........kk....",
      "................",
      "................",
    ],
  },
  {
    // Help: a question mark on a page.
    file: "help-16.svg",
    rows: [
      "................",
      "....kkkkkk......",
      "...kbbbbbbk.....",
      "..kbbkkkbbbk....",
      "..kbbk.kbbbk....",
      "...kk..kbbbk....",
      "......kbbbk.....",
      ".....kbbbk......",
      ".....kbbk.......",
      ".....kbbk.......",
      "......kk........",
      ".....kbbk.......",
      ".....kbbk.......",
      "......kk........",
      "................",
      "................",
    ],
  },
  {
    // Run…: a command window.
    file: "run-16.svg",
    rows: [
      "................",
      ".kkkkkkkkkkkkk..",
      ".kbbbbbbbbbbbk..",
      ".kkkkkkkkkkkkk..",
      ".kwwwwwwwwwwwk..",
      ".kwkwwwwwwwwwk..",
      ".kwkkwwwwwwwwk..",
      ".kwkkkwwwwwwwk..",
      ".kwkkwwkkkkwwk..",
      ".kwkwwwwwwwwwk..",
      ".kwwwwwwwwwwwk..",
      ".kkkkkkkkkkkkk..",
      "................",
      "................",
      "................",
      "................",
    ],
  },
  {
    // Recycle 16 shares the desktop art; folder-16 doubles as Documents.
    // PocketJS favicon motif (site/assets/favicon.svg) with a white pocket
    // frame around a solid black interior. Pixels outside the white frame
    // stay transparent; the lens and two bars remain white. The 16px copy is
    // used by task buttons; the 32px copy is every Pocket app icon.
    file: "pocket-app-16.svg",
    big: "pocket-app.svg",
    circle: { cx: 5, cy: 7.75, r: 2.35, color: "#ffffff" },
    rows: [
      "................",
      "................",
      "................",
      "..wwwwwwwwwwww..",
      ".wkkkkkkkkkkkkw.",
      ".wkkkkkkkkkkkkw.",
      ".wkkkkkkwwwwwkw.",
      ".wkkkkkkkkkkkkw.",
      ".wkkkkkkwwwkkkw.",
      ".wkkkkkkkkkkkkw.",
      ".wkkkkkkkkkkkkw.",
      ".wkkkkkkkkkkkkw.",
      "..wwwwwwwwwwww..",
      "................",
      "................",
      "................",
    ],
  },
  {
    // Start button copy of the same product mark. Kept as its established
    // filename because chrome.tsx refers to it directly.
    file: "start-logo.svg",
    rows: [
      "................",
      "................",
      "................",
      "..kkkkkkkkkkkk..",
      ".k............k.",
      ".k............k.",
      ".k..kk..kkkkk.k.",
      ".k.kkkk.......k.",
      ".k.kkkk.kkk...k.",
      ".k..kk........k.",
      ".k............k.",
      ".k............k.",
      "..kkkkkkkkkkkk..",
      "................",
      "................",
      "................",
    ],
  },
];

// Native-size art (caption glyphs, hud bits) — no 2× variant. Pak textures
// must be pow2, so every canvas is 8×8 or 16×16 with the art inside.
const NATIVE: Icon[] = [
  {
    file: "cap-min.svg",
    rows: ["........", "........", "........", "........", "........", ".kkkkkk.", ".kkkkkk.", "........"],
  },
  {
    file: "cap-max.svg",
    rows: ["kkkkkkkk", "kkkkkkkk", "k......k", "k......k", "k......k", "k......k", "k......k", "kkkkkkkk"],
  },
  {
    file: "cap-restore.svg",
    rows: [
      "...kkkkk",
      "...kkkkk",
      "...k...k",
      "kkkkk..k",
      "kkkkkkkk",
      "k...k...",
      "k...k...",
      "kkkkk...",
    ],
  },
  {
    file: "cap-close.svg",
    rows: ["........", "kk....kk", ".kk..kk.", "..kkkk..", "...kk...", "..kkkk..", ".kk..kk.", "kk....kk"],
  },
  {
    // Luna caption glyphs are the same compact geometry in white. They keep
    // their own files so switching themes never needs image tint semantics.
    file: "xp-cap-min.svg",
    rows: ["........", "........", "........", "........", "........", ".wwwwww.", ".wwwwww.", "........"],
  },
  {
    file: "xp-cap-max.svg",
    rows: ["wwwwwwww", "wwwwwwww", "w......w", "w......w", "w......w", "w......w", "w......w", "wwwwwwww"],
  },
  {
    file: "xp-cap-restore.svg",
    rows: [
      "...wwwww",
      "...wwwww",
      "...w...w",
      "wwwww..w",
      "wwwwwwww",
      "w...w...",
      "w...w...",
      "wwwww...",
    ],
  },
  {
    file: "xp-cap-close.svg",
    rows: ["........", "ww....ww", ".ww..ww.", "..wwww..", "...ww...", "..wwww..", ".ww..ww.", "ww....ww"],
  },
  {
    file: "menu-arrow.svg",
    rows: ["........", "..k.....", "..kk....", "..kkk...", "..kkkk..", "..kkk...", "..kk....", "..k....."],
  },
  { file: "grip.svg", rows: grip16() },
  {
    // Menu checkmark (checked toggle items, e.g. Edit > Word Wrap).
    file: "check-16.svg",
    rows: [
      "................",
      "................",
      "................",
      "..........kk....",
      ".........kkk....",
      "........kkk.....",
      "..kk...kkk......",
      "..kkk.kkk.......",
      "...kkkkk........",
      "....kkk.........",
      ".....k..........",
      "................",
      "................",
      "................",
      "................",
      "................",
    ],
  },
  {
    file: "mine.svg",
    rows: [
      "...k....",
      "..kkk.k.",
      ".kkkkkk.",
      "kkwkkkkk",
      ".kkkkkk.",
      "..kkk.k.",
      "...k....",
      "........",
    ],
  },
  {
    file: "flag.svg",
    rows: [
      "..rr....",
      "rrrr....",
      "..rr....",
      "...k....",
      "...k....",
      "..kk....",
      ".kkkkk..",
      "kkkkkkk.",
    ],
  },
  { file: "smile.svg", rows: face("smile") },
  { file: "smile-ooh.svg", rows: face("ooh") },
  { file: "smile-dead.svg", rows: face("dead") },
  { file: "smile-cool.svg", rows: face("cool") },
];

interface VectorIcon {
  file: string;
  body: string;
  big?: string;
}

function vectorSvg(icon: VectorIcon, size: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 16 16">${icon.body}</svg>\n`;
}

// Original Luna-inspired system artwork. These vectors deliberately avoid
// Microsoft assets: gradients, silhouettes and glyphs are authored here and
// rasterized by the normal PocketJS package pipeline at target density.
const XP_VECTORS: VectorIcon[] = [
  {
    file: "xp-start-logo.svg",
    body:
      '<rect x="1" y="2.5" width="14" height="11" rx="1.5" fill="#132e18"/><rect x="2" y="3.5" width="12" height="9" rx="1" fill="#ffffff"/><rect x="3" y="4.5" width="10" height="7" fill="#183920"/><circle cx="5.5" cy="7" r="1.8" fill="#ffffff"/><rect x="8.5" y="5.7" width="3.5" height="1.2" fill="#ffffff"/><rect x="8.5" y="8.4" width="2.4" height="1.2" fill="#ffffff"/>',
  },
  {
    file: "xp-computer-16.svg",
    big: "xp-computer.svg",
    body:
      '<rect x="1.3" y="1.2" width="13.4" height="9.3" rx="1.3" fill="#d9e1e9" stroke="#42526a"/><rect x="2.7" y="2.5" width="10.6" height="6.5" rx=".5" fill="#2f78ca" stroke="#173468"/><path d="M5.7 10.5h4.6l.6 2H5.1z" fill="#8391a1" stroke="#42526a"/><rect x="3.7" y="12.3" width="8.6" height="1.7" rx=".6" fill="#edf2f6" stroke="#42526a"/><path d="M3.4 3.2h6.5" stroke="#bcecff" stroke-width=".7" opacity=".8"/>',
  },
  {
    file: "xp-folder-16.svg",
    big: "xp-documents.svg",
    body:
      '<path d="M1.2 4.2c0-1 .7-1.7 1.7-1.7h3.4l1.5 1.6h5.3c1 0 1.7.7 1.7 1.7v6.7c0 .8-.6 1.4-1.4 1.4H2.6c-.8 0-1.4-.6-1.4-1.4z" fill="#d99026" stroke="#8c5c17"/><path d="M1.6 6.2c.1-.8.7-1.3 1.5-1.3h10.6c.8 0 1.3.7 1.1 1.5l-1.2 6.2c-.1.7-.7 1.2-1.4 1.2H2.6c-.8 0-1.4-.7-1.3-1.5z" fill="#f7c44c" stroke="#b97818"/><path d="M2.4 6.1h10.8" stroke="#fff8cf" stroke-width=".8" opacity=".8"/>',
  },
  {
    file: "xp-drive-16.svg",
    body:
      '<path d="M2 5.1h12l1 3.2v4.5H1V8.3z" fill="#c6d0da" stroke="#465467"/><path d="M2 5.1l2-3h8l2 3" fill="#eaf0f5" stroke="#465467"/><rect x="2.4" y="9.1" width="11.2" height="2.3" rx=".5" fill="#f5f8fa" stroke="#718096"/><circle cx="11.8" cy="10.2" r=".65" fill="#39a454"/>',
  },
  {
    file: "xp-cdrom-16.svg",
    body:
      '<path d="M2 5.1h12l1 3.2v4.5H1V8.3z" fill="#d5dde6" stroke="#465467"/><circle cx="8" cy="5.5" r="4" fill="#b8e9ee" stroke="#66778a"/><circle cx="8" cy="5.5" r="1" fill="#ffffff" stroke="#66778a"/><path d="M5 3.4l5.8 4" stroke="#e4cfff" stroke-width=".8"/><rect x="2.4" y="9.2" width="11.2" height="2.2" rx=".5" fill="#eef2f6" stroke="#718096"/>',
  },
  {
    file: "xp-file-16.svg",
    body:
      '<path d="M3 1.2h6l4 4v9.6H3z" fill="#f5f8fc" stroke="#71839e"/><path d="M9 1.2v4h4" fill="#c8d7ec" stroke="#71839e"/><path d="M5 8h6M5 10h6M5 12h4" stroke="#789ac8" stroke-width=".8"/>',
  },
  {
    file: "xp-recycle-16.svg",
    big: "xp-recycle.svg",
    body:
      '<path d="M3 4h10l-1 10H4z" fill="#bce3ed" stroke="#3d718b"/><path d="M4.2 5h7.6" stroke="#f5ffff" stroke-width=".8"/><path d="M2.3 3.8h11.4M5.5 2.1h5" stroke="#315b73" stroke-width="1.2"/><path d="M6 7.1l1.1-1.3 1 1.5M10.6 8.2l.7 1.6-1.8.1M7.9 11.8l-1.8-.2.7-1.6" fill="none" stroke="#239248" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  {
    file: "xp-notepad-16.svg",
    big: "xp-notepad.svg",
    body:
      '<rect x="2.5" y="1.5" width="11" height="13" rx=".7" fill="#f5f9fd" stroke="#536c8f"/><rect x="3" y="2" width="10" height="2.5" fill="#397ac9"/><path d="M4.5 6.5h7M4.5 8.5h7M4.5 10.5h5.5M4.5 12.5h6.2" stroke="#6886aa" stroke-width=".7"/>',
  },
  {
    file: "xp-mines-16.svg",
    big: "xp-mines.svg",
    body:
      '<rect x="1.5" y="1.5" width="13" height="13" rx="2" fill="#d8e2ec" stroke="#52677e"/><circle cx="8" cy="8" r="4" fill="#303943"/><path d="M8 2.8v2M8 11.2v2M2.8 8h2M11.2 8h2M4.3 4.3l1.4 1.4M10.3 10.3l1.4 1.4M11.7 4.3l-1.4 1.4M5.7 10.3l-1.4 1.4" stroke="#202a34" stroke-width="1.1" stroke-linecap="round"/><circle cx="6.8" cy="6.8" r=".8" fill="#dce8f4"/>',
  },
  {
    file: "xp-settings-16.svg",
    body:
      '<path d="M6.7 1.2h2.6l.5 1.7 1.5.6 1.6-.8 1.4 1.9-1.2 1.3.2 1.7 1.5 1v2.3l-1.7.6-.7 1.4.6 1.7-2.1 1.1-1.2-1.3-1.7.1-1 1.4-2.2-.8-.1-1.8-1.3-1-1.7.3-.5-2.4 1.6-.8.4-1.7L1.8 6l1.3-2 1.7.7 1.4-.8z" fill="#7d92a8" stroke="#3f5267"/><circle cx="8" cy="8" r="2.4" fill="#f6f8fa" stroke="#3f5267"/>',
  },
  {
    file: "xp-find-16.svg",
    body:
      '<circle cx="6.2" cy="6.2" r="4.6" fill="#b8ddf5" stroke="#365b82" stroke-width="1.2"/><path d="M9.2 9.2l1.7-.9 4 4-2.6 2.6-4-4z" fill="#60462e"/><path d="M3.6 4.3h4.5v1H3.6z" fill="#ffffff"/>',
  },
  {
    file: "xp-help-16.svg",
    body:
      '<circle cx="8" cy="8" r="6.5" fill="#287bd3" stroke="#153f85"/><path d="M4.5 3.4h6v1H4.5z" fill="#78bbff"/><path d="M5.3 5.8c.2-2 1.4-3 3.3-3 2 0 3.3 1.1 3.3 2.8 0 1.6-.8 2.3-2.2 3.2-.8.5-1.1 1-1.1 2H6.9c0-1.7.5-2.5 1.7-3.3 1-.7 1.5-1.1 1.5-1.9 0-.8-.6-1.3-1.6-1.3-.9 0-1.5.6-1.6 1.6z" fill="#ffffff"/><circle cx="7.8" cy="12.6" r="1" fill="#ffffff"/>',
  },
  {
    file: "xp-run-16.svg",
    body:
      '<rect x="1.3" y="2" width="13.4" height="11.8" rx="1" fill="#f7f8fa" stroke="#53687f"/><rect x="1.8" y="2.5" width="12.4" height="2.6" fill="#2f73c7"/><path d="M3.2 6.7l3 2-3 2z" fill="#253747"/><rect x="6.2" y="9.8" width="5" height="1.2" fill="#253747"/>',
  },
  {
    file: "xp-shutdown-16.svg",
    big: "xp-shutdown.svg",
    body:
      '<rect x="1.2" y="1.2" width="13.6" height="13.6" rx="3" fill="#df4a3b" stroke="#8e2019"/><path d="M2.8 3.1h8.5" stroke="#ff9d7f" stroke-width="1" opacity=".8"/><path d="M8 3v5M4.9 5.2a4.2 4.2 0 1 0 6.2 0" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round"/>',
  },
  {
    file: "xp-back-16.svg",
    body: '<circle cx="8" cy="8" r="6.6" fill="#74b54b" stroke="#356e26"/><path d="M7.2 3.8L2.9 8l4.3 4.2V9.6h5.9V6.4H7.2z" fill="#ffffff"/><path d="M5.6 4.3L3.7 6.2" stroke="#c9efb2" stroke-width=".8"/>',
  },
  {
    file: "xp-forward-16.svg",
    body: '<circle cx="8" cy="8" r="6.6" fill="#94b8dc" stroke="#526f91"/><path d="M8.8 3.8L13.1 8l-4.3 4.2V9.6H2.9V6.4h5.9z" fill="#ffffff"/>',
  },
  {
    file: "xp-up-16.svg",
    body: '<path d="M8 1.5l6.2 6.2-1.9 1.9-3-3v7H6.7v-7l-3 3-1.9-1.9z" fill="#70a845" stroke="#366722" stroke-linejoin="round"/><path d="M8 3.1v8.5" stroke="#bde49e" stroke-width=".8"/>',
  },
  {
    file: "xp-view-16.svg",
    body: '<rect x="1.5" y="2" width="13" height="12" rx="1" fill="#ffffff" stroke="#53687f"/><rect x="2.5" y="2.8" width="3" height="2.2" fill="#3d83d2"/><rect x="6.2" y="2.8" width="7.3" height="2.2" fill="#d6e7f8"/><rect x="2.5" y="6" width="3" height="2.2" fill="#82b252"/><rect x="6.2" y="6.5" width="6" height="1" fill="#5f7590"/><rect x="2.5" y="9.3" width="3" height="2.2" fill="#e6b445"/><rect x="6.2" y="9.8" width="6" height="1" fill="#5f7590"/>',
  },
  {
    file: "xp-link-12.svg",
    body: '<circle cx="8" cy="8" r="5.8" fill="#ffffff" stroke="#4b78b5"/><path d="M7 4.4L12 8l-5 3.6V9.4H3.5V6.6H7z" fill="#2d66b3"/>',
  },
  {
    file: "xp-logoff-16.svg",
    body: '<rect x="2" y="1.5" width="8" height="13" rx=".8" fill="#f1a43b" stroke="#9d5f13"/><rect x="3.3" y="2.8" width="5.3" height="10.4" fill="#ffe6a6"/><circle cx="7.3" cy="8" r=".7" fill="#9d5f13"/><path d="M9 4.2L14 8l-5 3.8V9.4H5.8V6.6H9z" fill="#3f9b3c" stroke="#226620" stroke-width=".5"/>',
  },
];

/** Status-bar size grip: diagonal white/gray ridge pairs in the lower-right
 *  triangle of a 16×16 canvas. */
function grip16(): string[] {
  const N = 16;
  const grid: string[][] = Array.from({ length: N }, () => Array(N).fill("."));
  for (const k of [17, 21, 25, 29]) {
    for (let x = 0; x < N; x++) {
      const yw = k - x;
      if (yw >= 4 && yw < N && x >= 4) grid[yw][x] = "w";
      const yd = k + 1 - x;
      if (yd >= 4 && yd < N && x >= 4) grid[yd][x] = "d";
    }
  }
  return grid.map((r) => r.join(""));
}

/** Smiley faces built procedurally: a yellow disc with a black ring, then
 *  per-state eyes and mouth pixels — hand grids kept coming out ragged. */
function face(kind: "smile" | "ooh" | "dead" | "cool"): string[] {
  const N = 16;
  const grid: string[][] = Array.from({ length: N }, () => Array(N).fill("."));
  const c = (N - 1) / 2;
  const inside = (x: number, y: number) => (x - c) ** 2 + (y - c) ** 2 <= 7.2 ** 2;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) if (inside(x, y)) grid[y][x] = "s";
  }
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (grid[y][x] !== "s") continue;
      const edge =
        !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1);
      if (edge) grid[y][x] = "k";
    }
  }
  const px = (x: number, y: number) => {
    grid[y][x] = "k";
  };
  if (kind === "dead") {
    for (const ex of [4, 9]) {
      px(ex, 4);
      px(ex + 2, 4);
      px(ex + 1, 5);
      px(ex, 6);
      px(ex + 2, 6);
    }
    // Frown.
    for (let x = 6; x <= 9; x++) px(x, 10);
    px(5, 11);
    px(10, 11);
  } else if (kind === "cool") {
    // Sunglasses: one bar with two lenses.
    for (let x = 2; x <= 13; x++) px(x, 5);
    for (const lx of [3, 9]) {
      for (let x = lx; x <= lx + 3; x++) {
        px(x, 6);
        px(x, 7);
      }
    }
    for (let x = 6; x <= 9; x++) px(x, 12);
    px(5, 11);
    px(10, 11);
  } else {
    // Eyes.
    for (const ex of [5, 10]) {
      px(ex, 5);
      px(ex, 6);
    }
    if (kind === "smile") {
      for (let x = 6; x <= 9; x++) px(x, 12);
      px(5, 11);
      px(10, 11);
      px(4, 10);
      px(11, 10);
    } else {
      // "ooh": a small round mouth.
      for (const [x, y] of [
        [7, 9],
        [8, 9],
        [6, 10],
        [9, 10],
        [6, 11],
        [9, 11],
        [7, 12],
        [8, 12],
      ]) {
        px(x, y);
      }
    }
  }
  return grid.map((r) => r.join(""));
}

const outDir = join(import.meta.dir, "icons");
mkdirSync(outDir, { recursive: true });
let count = 0;
for (const icon of ICONS) {
  await Bun.write(join(outDir, icon.file), svgFor(icon.rows, 1, icon.circle));
  count++;
  if (icon.big) {
    await Bun.write(join(outDir, icon.big), svgFor(icon.rows, 2, icon.circle));
    count++;
  }
}
for (const icon of NATIVE) {
  await Bun.write(join(outDir, icon.file), svgFor(icon.rows, 1, icon.circle));
  count++;
}
for (const icon of XP_VECTORS) {
  await Bun.write(join(outDir, icon.file), vectorSvg(icon, 16));
  count++;
  if (icon.big) {
    await Bun.write(join(outDir, icon.big), vectorSvg(icon, 32));
    count++;
  }
}
console.log(`gen-icons: wrote ${count} SVGs to src/system-ui/icons/`);
