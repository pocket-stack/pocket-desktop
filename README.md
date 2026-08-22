# Pocket Desktop

Pocket Desktop is a Pocket System product that runs multiple isolated Pocket
applications inside one native process. Its System UI owns windows, taskbar,
application presentation and theme selection; PocketJS owns package
resolution, AppInstance isolation, scheduling and native composition.

The current `classic` theme is inspired by late-1990s desktop interfaces. The
product, package ids, artifacts and protocols are theme-neutral so additional
themes can replace its chrome without changing the Pocket System contract.

![Pocket Desktop classic theme](docs/classic-theme.png)

## Architecture

```text
pocket.system.json
  ├─ roles.systemUI → dev.pocket-stack.desktop.system-ui
  ├─ installation snapshot
  └─ installed Pocket app catalog
             ↓
      ResolvedSystemPlan
             ↓
  PocketJS generic macOS host
      ├─ System UI AppInstance
      ├─ AppSupervisor
      └─ native compositor surfaces
```

The System UI is in `src/system-ui`. Demo applications are consumed from the
pinned `vendor/pocketjs` submodule and are not copied into this product.

## Build

Requirements: macOS, Bun, Rust and Xcode command-line tools.

```sh
bun run setup
bun run check
bun run build
bun run macos
```

Regenerate the checked-in classic-theme screenshot from the deterministic
PocketJS simulator with `bun run capture`.

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
