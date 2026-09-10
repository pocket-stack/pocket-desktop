# Portable renderer integration — 2026-09-10

[PocketJS #390](https://github.com/pocket-stack/pocketjs/pull/390), merged as
`b5e2a27447022c52e5065aabe2be728f464e5b86`, combines the portable text migration and #399's GPU renderer
with current main. The integration preserves shared companion sessions,
worker generation fencing, the simulation crate and the water-transport fix.
It uses the existing `pocket-ui-wgpu` and `pocket3d::gpu` APIs.

## Desktop

The integrated release host passed real AppKit window resize events at
800×600, 1120×700, 400×300 and back to 800×600 on the M3 Max's internal display.
The System UI adjusted icon placement and clipping; all three themes rendered
after cycling with a 31,499-character Notepad document. The same document's
drag replay presented 111/111 measured frames, with p95 CPU worker work of
5.37 ms, render submission of 0.36 ms and presentation submission of 0.13 ms.
Hero opened, closed and reopened with its child surface rendered.

The final default-size drag benchmark presented 340 measured frames and
passed the configured p95 CPU budgets: work 16.7 ms, render submission 3 ms,
presentation submission 3 ms. These measurements exclude GPU completion,
physical input delivery and panel scanout.

ScreenCaptureKit screenshots verified the final frame after each resize and
theme change. The legacy `screencapture -l` path returned stale window snapshots
in this run; those snapshots are excluded from the visual verdict.
The [long-text screenshot](desktop-gpu-long-text.png) records the final Aqua frame.
Cross-monitor DPI remains pending a second display; the 1×/2× Metal fixtures
cover raster density, but do not constitute a cross-monitor test.

## Handhelds

The physical 3DS accepted package `db9616b513dbdbf0`, matching the local package
footer. Authenticated runtime probes and PICA screenshots verified both
screens, contact selection, A/Z index jumps and clipped virtual-list scrolling.
A controlled live-runtime texture probe displayed exact red and green pixels,
then removed the image after freeing the texture. All sampled graphics counters
reported zero dropped vertices. The roughly ten-second idle sampling window
advanced at 59.83 runtime frames/s; this is not an input-latency measurement.

The [selected contact](3ds-gpu-selected.png) and
[replacement texture](3ds-gpu-texture.png) are GPU readbacks from the physical
device. Interaction in the automated journey came from DevTools touch replay.

The integrated Vita Hero VPK and an opt-in `bench` build were uploaded and
read back byte-for-byte. Physical runtime screenshots and timing collection
remain pending. The benchmark keeps live controls and stores GXM framebuffer
bytes after GPU completion; production builds perform no benchmark file IO.

## Validation and receipts

The framework full suite passed all 12 stages. TypeScript, shared renderer
Metal readbacks, all six desktop host tests, and Rust simulation tests passed.
The Worker/TCP reconnect regression retains the ready message and starts a
fresh worker for the next connection. Launcher catalog tests use independent
PSP/Vita capability admission, including the PSP-only paired text demo.
Pocket Desktop passed `bun run check`, `bun run test:rust`, `bun run build`
and the headless Chrome `bun run test:web` System/AppInstance smoke.

[Structured results](portable-integration-2026-09-10.json) retain the measured
distributions and device identities. Local raw traces and scripts are under
`.pocket/bench/native-edges-sck/`, `.pocket/bench/final-drag/` and
`.pocket/handheld-acceptance/`. The earlier controlled GPU/software comparison
is in [the Aqua drag report](aqua-gpu-2026-09-10.md).
