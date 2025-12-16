# ADB Desktop Tool


Cross‑platform desktop tool for installing, launching, exploring, and debugging Android APKs using **ADB**, built with:
- Electron (main process)
- Next.js (UI)
- TypeScript (full stack)
- TailwindCSS
- pnpm workspaces

## Workspace Layout
adb-desktop-tool/
├── shared/
├── adb/
├── electron/
└── next/

Install
pnpm install

Development
pnpm --filter next dev # start Next.js UI
pnpm --filter electron dev # start Electron in dev mode

Build
pnpm -w build

Package (installer)
pnpm run package:win

Notes

ADB is not bundled; tool can download it or use system adb.

IPC bridge is strict and secure.



---


# ✔ NEXT STEP (Your confirmation needed)
Now the **root structure + top-level files** are complete.


Next I will generate **Batch 1: `shared/` package**, containing:
- `shared/package.json`
- `shared/tsconfig.json`
- `shared/src/types.ts`


After that:
- Batch 2 → `adb/` package
- Batch 3 → `electron/`
- Batch 4 → `next/`
- Batch 5 → Final commands


---


Reply with **“Proceed with Batch 1”** to generate the shared package files.