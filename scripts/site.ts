import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { ROOT } from "./system-plan.ts";

async function run(command: string[]): Promise<void> {
  const child = Bun.spawn(command, { cwd: ROOT, stdout: "inherit", stderr: "inherit" });
  const code = await child.exited;
  if (code !== 0) throw new Error("command failed (" + code + "): " + command.join(" "));
}

const preview = resolve(ROOT, "dist/web");
const output = resolve(ROOT, "dist/site");
if (!process.argv.includes("--reuse-preview")) {
  await run([process.execPath, resolve(ROOT, "scripts/web.ts"), "--build-only"]);
}
if (!existsSync(resolve(preview, "index.html"))) {
  throw new Error("WASM preview is missing; run without --reuse-preview or build:web first");
}

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
cpSync(resolve(ROOT, "site"), output, { recursive: true });
cpSync(preview, resolve(output, "play"), { recursive: true });
mkdirSync(resolve(output, "assets"), { recursive: true });
cpSync(resolve(ROOT, "src/system-ui/icons/pocket-app.svg"), resolve(output, "favicon.svg"));
cpSync(resolve(ROOT, "docs/classic-theme.png"), resolve(output, "assets/classic-theme.png"));
cpSync(resolve(ROOT, "docs/xp-theme.png"), resolve(output, "assets/xp-theme.png"));
cpSync(resolve(ROOT, "docs/aqua-theme.png"), resolve(output, "assets/aqua-theme.png"));

console.log("Pocket Desktop site: landing, docs, and live preview in " + output);
