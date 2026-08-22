import { renameSync } from "node:fs";
import { resolve } from "node:path";
import { POCKETJS_ROOT, ROOT } from "./system-plan.ts";

// The PocketJS sim resolves bundles beside its WASM host. Keep this low-level
// test artifact in the vendored dist directory; product builds still go to
// Pocket Desktop's own dist/ through build-system.ts.
const SIM_DIST = resolve(POCKETJS_ROOT, "dist");

const child = Bun.spawn(
  [
    process.execPath,
    resolve(POCKETJS_ROOT, "tools/build.ts"),
    resolve(ROOT, "src/system-ui/main.tsx"),
    "--framework=vue-vapor",
    `--outdir=${SIM_DIST}`,
  ],
  { cwd: ROOT, stdout: "inherit", stderr: "inherit" },
);
const code = await child.exited;
if (code !== 0) process.exit(code);
for (const extension of ["js", "pak"]) {
  renameSync(
    resolve(SIM_DIST, `main.vue-vapor.${extension}`),
    resolve(SIM_DIST, `pocket-desktop-system-ui.vue-vapor.${extension}`),
  );
}
