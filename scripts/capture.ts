import { resolve } from "node:path";
import { bootWorld } from "../vendor/pocketjs/hosts/sim/sim.ts";
import { encodePNG } from "../vendor/pocketjs/tests/png.ts";
import { ROOT } from "./system-plan.ts";

const WIDTH = 800;
const HEIGHT = 600;
const SCALE = 2;
const viewport = {
  width: WIDTH,
  height: HEIGHT,
  rasterDensity: SCALE,
  renderScale: SCALE,
};

async function settle(world: Awaited<ReturnType<typeof bootWorld>>, frames = 120) {
  for (let frame = 0; frame < frames; frame++) {
    world.frame(0);
    for (let tick = 0; tick < world.ticksPerFrame; tick++) world.tick();
    await Promise.resolve();
  }
}

// Preserve the standalone classic composition used by the baseline benchmark.
const classic = await bootWorld(
  "pocket-desktop-system-ui.vue-vapor",
  60,
  undefined,
  undefined,
  viewport,
);
await settle(classic);
const classicOutput = resolve(ROOT, "docs/classic-theme.png");
await Bun.write(
  classicOutput,
  encodePNG(classic.render(), WIDTH * SCALE, HEIGHT * SCALE),
);
console.log(`Pocket Desktop: captured ${classicOutput}`);

// Theme switching is a System UI action delivered through the same input
// path as the native host. A minimal companion gives the capture a real
// pointer/keyboard channel without adding any screenshot-only app API.
const inbox: string[] = [];
const xp = await bootWorld(
  "pocket-desktop-system-ui.vue-vapor",
  60,
  undefined,
  (ops) => {
    ops.svcOpen = (name: string) => name === "system-ui";
    ops.svcPoll = () => {
      if (inbox.length === 0) return null;
      const batch = inbox.join("\n");
      inbox.length = 0;
      return batch;
    };
    ops.svcSend = () => {};
  },
  viewport,
);
inbox.push(
  JSON.stringify({ t: "hello", w: WIDTH, h: HEIGHT, epoch: 1755650000000 }),
  JSON.stringify({ t: "key", k: "t", cmd: true, sh: true }),
);
await settle(xp);
inbox.push(JSON.stringify({ t: "key", k: "escape", cmd: true }));
await settle(xp, 2);
inbox.push(JSON.stringify({ t: "mouse", x: 100, y: 443, d: false, sh: false }));
await settle(xp, 2);
const xpOutput = resolve(ROOT, "docs/xp-theme.png");
await Bun.write(
  xpOutput,
  encodePNG(xp.render(), WIDTH * SCALE, HEIGHT * SCALE),
);
console.log(`Pocket Desktop: captured ${xpOutput}`);
