import { resolve } from "node:path";
import { bootWorld } from "../vendor/pocketjs/hosts/sim/sim.ts";
import { encodePNG } from "../vendor/pocketjs/tests/png.ts";
import { ROOT } from "./system-plan.ts";

const WIDTH = 800;
const HEIGHT = 600;
const SCALE = 2;
const world = await bootWorld(
  "pocket-desktop-system-ui.vue-vapor",
  60,
  undefined,
  undefined,
  {
    width: WIDTH,
    height: HEIGHT,
    rasterDensity: SCALE,
    renderScale: SCALE,
  },
);

for (let frame = 0; frame < 120; frame++) {
  world.frame(0);
  for (let tick = 0; tick < world.ticksPerFrame; tick++) world.tick();
}

const output = resolve(ROOT, "docs/classic-theme.png");
await Bun.write(output, encodePNG(world.render(), WIDTH * SCALE, HEIGHT * SCALE));
console.log(`Pocket Desktop: captured ${output}`);
