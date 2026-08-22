import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import {
  DIST,
  PLAN_DIR,
  POCKETJS_ROOT,
  ROOT,
  projectRootFor,
  resolveDesktopSystem,
} from "./system-plan.ts";

async function run(command: string[]): Promise<void> {
  const child = Bun.spawn(command, {
    cwd: ROOT,
    stdout: "inherit",
    stderr: "inherit",
  });
  const code = await child.exited;
  if (code !== 0) throw new Error(`command failed (${code}): ${command.join(" ")}`);
}

export async function buildDesktopSystem(): Promise<{
  systemPlanPath: string;
  applicationCount: number;
}> {
  const system = await resolveDesktopSystem();
  mkdirSync(PLAN_DIR, { recursive: true });
  mkdirSync(DIST, { recursive: true });
  const packages = [system.systemUI, ...system.applications];
  for (const entry of packages) {
    const planPath = resolve(PLAN_DIR, `${entry.plan.app.output}.plan.json`);
    await Bun.write(planPath, JSON.stringify(entry.plan, null, 2) + "\n");
    await run([
      process.execPath,
      resolve(POCKETJS_ROOT, "tools/build.ts"),
      `--plan=${planPath}`,
      `--project-root=${projectRootFor(entry.source)}`,
      `--outdir=${DIST}`,
    ]);
  }

  const systemPlanPath = resolve(PLAN_DIR, "pocket-desktop.system.plan.json");
  await Bun.write(systemPlanPath, JSON.stringify(system, null, 2) + "\n");
  return { systemPlanPath, applicationCount: system.applications.length };
}

if (import.meta.main) {
  const receipt = await buildDesktopSystem();
  console.log(
    `Pocket Desktop: built System UI + ${receipt.applicationCount} applications`,
  );
}
