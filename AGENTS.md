# Repository Instructions

- Use Conventional Commits for commits and pull-request titles.
- Import runtime APIs from `@pocketjs/framework/*`; keep PocketJS internals behind scripts or the pinned `vendor/pocketjs` boundary.
- `Pocket Desktop` is the product and `System UI` is its shell role. Do not use a theme name as the product, package, artifact, protocol, or source-directory name.
- Theme-specific colors, fonts, icons and chrome belong under the System UI theme boundary. The current theme is `classic`; future themes must not require changes to System manifests or native hosts.
- Contributions require acceptance of `CLA.md`. Do not bypass the CLA workflow for human contributors.
- Code is offered under GPL-3.0-only or a separate commercial license. Keep third-party assets under their own notices in `THIRD_PARTY.md`.
