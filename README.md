# Pocket Desktop

Pocket Desktop is a Pocket System product that runs multiple isolated Pocket
applications inside one native process. The entire System UI uses SolidJS and
PocketJS's universal renderer. It owns windows, taskbar,
application presentation and theme selection; PocketJS owns package
resolution, AppInstance isolation, scheduling and native composition.

## Themes

Pocket Desktop ships three System UI themes: Classic 98, Windows XP and Aqua.
Each is a period desktop rebuilt from PocketJS-native drawing — no bitmaps of
the originals, no theme-specific code paths outside the theme's own
definition. **All three run on the same System manifest, AppInstances and
native compositor.**

| Classic 98 | Windows XP | Aqua |
|---|---|---|
| ![Pocket Desktop classic theme](docs/classic-theme.png) | ![Pocket Desktop XP theme](docs/xp-theme.png) | ![Pocket Desktop Aqua theme](docs/aqua-theme.png) |

- **Classic 98** — hard two-ring bevels, 18px captions, a 28px taskbar with
  the Start rail menu, the W95FA bitmap face, native 32px pixel-art desktop
  icons and Explorer's coolbar and "Folders" pane in the file manager.
- **Windows XP** — Sheru's Luna chrome: three-stop gel gradients under 1px
  highlight and seat strips, top-rounded window frames, the two-column Start
  panel (user header, pinned programs, places, Turn Off Computer), a baked
  green Start pill, softly shaded Luna-style vector icons, and the Explorer
  task pane with its "Other Places" card. Text is baked from Inter, since
  Tahoma cannot be redistributed.
- **Aqua** — Sheru's Aqua: gel traffic lights on the left of a glossy caption
  that goes matte when unfocused, the menu bar hoisted to a 22px screen bar
  (launcher logo, program name, menus, clock), a translucent Dock, desktop
  icons hanging from the right edge, blue-gradient highlights, pale-blue text
  selection, white gel push buttons, and Tiger's toolbar pills, breadcrumb,
  round search well and sidebar in the file manager. Its lights and small
  gels are baked artwork, because the renderer bands gradient fills inside
  small rounded boxes.

The shell underneath is headless: every part — caption, control cluster, menu
bar, launcher, task strip, popups, selections, dialogs, the file manager's
toolbar and places sidebar — is one semantic slot the active theme fills with
its own paint and, through its chrome metrics, its own placement (controls
left or right, menus in the window or on the screen bar, a task strip or a
Dock). The window manager hit-tests from the same metrics, so switching
themes keeps every client rectangle, caret and compositor surface exact. The
Pocket app icon is the PocketJS favicon mark, cut from Aqua silver-and-blue
or Luna silver per theme.

Choose a theme from **Start → Settings** (the logo menu on Aqua), or press
**Cmd+Shift+T** to cycle while testing.

## Architecture

```text
pocket.system.json
  ├─ roles.systemUI → dev.pocket-stack.desktop.system-ui
  ├─ installation snapshot
  └─ installed Pocket app catalog
             ↓
      ResolvedSystemPlan
             ↓
  PocketJS portable desktop host
      ├─ winit + wgpu: window, input and GPU presentation
      ├─ runtime worker: SolidJS AppInstances + AppSupervisor
      │   └─ shared Rust layout + pocket-ui-wgpu drawing and surface composition
      └─ io.offload workers: portable Rust text service
          └─ the same WASM provider serves browser and paired devices
```

The System UI is in `src/system-ui`. Demo applications are consumed from the
pinned `vendor/pocketjs` submodule and are not copied into this product.

The experimental framework implementation is pinned directly in
`vendor/pocketjs` from [PocketJS PR #399](https://github.com/pocket-stack/pocketjs/pull/399),
which adds GPU composition on top of [PR #390](https://github.com/pocket-stack/pocketjs/pull/390). A fresh `setup` uses
that exact published commit; no checkout-local patches are applied.
The desktop host no longer links gpui, CoreText or Fontconfig. Native window
APIs handle the window, input and clipboard. The existing `pocket-ui-wgpu`
backend draws through Metal on macOS, retaining child textures and handing GPU
frames to the window thread. WASM keeps the Rust software rasterizer.

Notepad sends revisioned incremental edits through `io.offload`; Rust performs wrapping
on a worker and returns bounded pages. Rendering and hit testing share an
accepted source/geometry snapshot. Long documents render only visible rows.
The OpenType service uses COSMIC Text/Harfrust/Swash with explicitly supplied
font bytes, including on WASM. No system font discovery occurs.

See [the text capability and companion contract](docs/PORTABLE-TEXT.md) for
pairing, budgets, current limits and validation.

## Build

Requirements: Bun and Rust. macOS native builds also need Xcode command-line
tools. Linux native builds need the X11/Wayland development libraries and a Vulkan-capable driver listed by the CI workflow. Checks and browser builds
require the `wasm32-unknown-unknown` Rust target.

```sh
bun run setup
rustup target add wasm32-unknown-unknown
bun run check
bun run test:rust
bun run build
bun run macos
```

On Linux, build and launch the same resolved Pocket System through the generic
portable Rust AppSupervisor host:

```sh
bun run linux
bun run package:linux
```

`package:linux` creates a relocatable `PocketDesktop` product directory and a
`pocket-desktop-linux-<arch>.tar.gz` distribution. After installing the Linux
libraries listed above, extract it and run:

```sh
./PocketDesktop/bin/pocket-desktop
```

The relocatable launcher sets the artifact root and passes the complete
`ResolvedSystemPlan` to the native host.

Build or serve the browser preview with:

```sh
bun run build:web
bun run web
bun run test:web
```

The browser host uses a separate WASM text worker per package. It runs every installed package in an independent iframe
JavaScript Realm with its own wasm UI instance. The parent AppSupervisor
schedules focused/visible AppInstances and composites child rasters at the
shell's `CompositorSurface` painter positions. `test:web` drives a real
headless Chrome double-click journey and requires the Hero child raster to
replace its shell fallback before saving `dist/web-smoke.png`.

Build and verify the product site, including the complete preview at `/play/`,
with:

```sh
bun run build:site
bun run test:site
```

The production site is deployed as Cloudflare Workers Static Assets at
`desktop.pocketlab.build`. The checked-in Wrangler configuration owns its
custom-domain route; `bun run deploy:site` builds before publishing.

Regenerate the checked-in theme screenshots from the deterministic PocketJS
simulator with `bun run capture`.

## Native drag benchmark

After `bun run build`, run `bun run benchmark:drag` in an unlocked desktop
session. It replays Aqua window movement at the default 800×600 size and writes
native logs, artifact hashes and stage distributions under `.pocket/bench/drag`.
The measurements bracket CPU tick, GPU command submission and presentation
submission; they do not measure GPU completion or mouse-to-panel latency.
Optional `--max-work-ms=16.7 --max-render-ms=3 --max-present-ms=3` checks apply
p95 CPU budgets for the acceptance machine. A run with fewer than 320 of the
340 measured drag frames fails, including when external input interrupts it.

## Historical classic baseline benchmark

The checked-in August baseline measures the previous gpui host and is not a
performance claim for the portable renderer. To record a new comparable run,
build the macOS release host, keep the desktop session unlocked and run:

```sh
bun run build
bun run benchmark:classic
```

The benchmark records the native executable and complete installed System
artifact sizes, ten process-cold/cache-warm launches from spawn to the first
painted frame, and settled idle process-tree RSS plus macOS physical footprint.
It writes the raw samples, machine identity, source revisions and a Markdown
summary to `docs/bench/classic-<date>.{json,md}`. Use `--quick` for a three-run
smoke check; quick results cannot replace the checked-in baseline.

Pass native-host script flags after `--`, for example:

```sh
bun run macos -- --quit-after 120
```

## Licensing

Pocket Desktop code and original assets are available under either:

1. **GNU GPL version 3 only** (`GPL-3.0-only`), whose complete terms are in
   `LICENSE`; or
2. **a separate commercial license** from the copyright holder, Yifeng
   "Evan" Wang, for distribution on different terms.

Choosing the commercial option requires a separately executed agreement; the
notice in `COMMERCIAL-LICENSE.md` is not itself a commercial license grant.
Third-party materials retain their own licenses as listed in `THIRD_PARTY.md`.

Contributions require the contributor license agreement in `CLA.md`. It lets
contributors retain copyright while granting the project the rights needed to
continue GPL distribution and commercial dual licensing.
