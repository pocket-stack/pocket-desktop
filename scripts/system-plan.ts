import { resolve } from "node:path";
import {
  validateAndResolveSystemPlan,
  validatePocketSystem,
  type ResolvedSystemPlan,
} from "@pocketjs/framework/manifest";

export const ROOT = resolve(import.meta.dir, "..");
export const POCKETJS_ROOT = resolve(ROOT, "vendor/pocketjs");
export const DIST = resolve(ROOT, "dist");
export const PLAN_DIR = resolve(ROOT, ".pocket/macos-app");

export async function resolveDesktopSystem(): Promise<ResolvedSystemPlan> {
  const systemPath = resolve(ROOT, "pocket.system.json");
  const input = await Bun.file(systemPath).json();
  const validated = validatePocketSystem(input);
  if (!validated.ok) {
    throw new Error(
      `Pocket Desktop System is invalid: ${validated.diagnostics
        .map((item) => `${item.path || "/"}: ${item.message}`)
        .join("; ")}`,
    );
  }

  const installed = new Set(validated.value.installation.installedPackages);
  const packages = await Promise.all(
    validated.value.applications.catalog
      .filter((entry) => installed.has(entry.package))
      .map(async (entry) => ({
        source: entry.manifest,
        manifest: await Bun.file(resolve(ROOT, entry.manifest)).json(),
      })),
  );
  const resolved = validateAndResolveSystemPlan(input, {
    target: "macos-app",
    packages,
  });
  if (!resolved.ok) {
    throw new Error(
      `Pocket Desktop does not resolve against macos-app: ${resolved.diagnostics
        .map((item) => `${item.path || "/"}: ${item.message}`)
        .join("; ")}`,
    );
  }
  return resolved.plan;
}

export function projectRootFor(source: string): string {
  return source.startsWith("vendor/pocketjs/") ? POCKETJS_ROOT : ROOT;
}
