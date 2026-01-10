console.log("[MAIN] main.ts loaded");

import { app, BrowserWindow } from "electron";
import * as path from "path";
import * as electron from "electron";
import ApkParser from "app-info-parser";
import { execFile, spawn, ChildProcessWithoutNullStreams } from "child_process";
const { dialog, ipcMain } = electron;

import { adbHelper, parseManifest } from "@adb/core";
import type { DeviceSnapshot, DevicePackageInfo } from "@adb/shared";

/* logcat modules */

// import { ChildProcessWithoutNullStreams } from "node:child_process";
import { LogcatLevel, LogcatLine } from "@adb/shared";
import { LogcatManager } from "./logcat/logcatManager";
import { runAdbCommand } from "./adb/adbConsoleManager";
import { clearApkData, forceStopApk, uninstallApk } from "./adb/apkActions";
/* logcat modules */

let mainWindow: BrowserWindow | null = null;
let logcatProcess: ChildProcessWithoutNullStreams | null = null;

const adb = adbHelper;

const IS_DEV = !app.isPackaged;
const NEXT_PORT = 3000;
let nextProcess: any = null;

// ------------------------------
// Create Browser Window
// ------------------------------
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (IS_DEV) {
    mainWindow.loadURL(`http://localhost:${NEXT_PORT}`);
  } else {
    mainWindow.loadURL(`http://127.0.0.1:${NEXT_PORT}`);
  }

  mainWindow.on("closed", () => (mainWindow = null));
}

// ------------------------------
// Start Next.js server when built
// ------------------------------
async function startNextServer() {
  if (IS_DEV) return;

  const serverScript = path.join(
    process.resourcesPath,
    "next-server",
    "server.js"
  );

  nextProcess = spawn(process.execPath, [serverScript], {
    detached: true,
    stdio: "ignore",
  });

  nextProcess.unref();
}

app.whenReady().then(async () => {
  await startNextServer();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ------------------------------
// IPC: ADB Commands
// ------------------------------

ipcMain.handle("ping", () => {
  console.log("[MAIN] ping received");
  return "pong";
});

ipcMain.handle("adb:getDevices", async () => {
  return await adb.getDevices();
});

ipcMain.handle("adb:install", async (_e, deviceId: string, apk: string) => {
  return await adb.install(deviceId, apk);
});

ipcMain.handle("adb:launch", async (_e, deviceId: string, pkg: string) => {
  return await adb.launch(deviceId, pkg);
});

ipcMain.handle("adb:list", async (_e, deviceId: string, remotePath: string) => {
  return await adb.listPath(deviceId, remotePath);
});

ipcMain.handle("adb:pull", async (_e, d: string, r: string, l: string) => {
  return await adb.pull(d, r, l);
});

ipcMain.handle("adb:push", async (_e, d: string, l: string, r: string) => {
  return await adb.push(d, l, r);
});

// ------------------------------
// IPC: APK Manifest Parse
// ------------------------------
ipcMain.handle("apk:parse", async (_e, apkPath: string) => {
  return await parseManifest(apkPath);
});

ipcMain.handle("adb:uninstall", async (_e, deviceId: string, pkg: string) => {
  return await adb.uninstall(deviceId, pkg);
});

ipcMain.handle("adb:getPackages", async (_e, deviceId: string) => {
  return await adb.getInstalledPackages(deviceId);
});

// ipcMain.handle("apk:select", async () => {
//   console.log("Main process: apk:select called dialog", dialog);
//   const result = await dialog.showOpenDialog({
//     title: "Select APK file(s)",
//     properties: ["openFile", "multiSelections"],
//     filters: [{ name: "Android APK", extensions: ["apk"] }],
//   });

//   if (result.canceled) {
//     return [];
//   }
//   console.log("Main process: apk:select result", result);

//   const tempDir = path.join(os.tmpdir(), "adb-desktop-tool");
//   if (!fs.existsSync(tempDir)) {
//     fs.mkdirSync(tempDir, { recursive: true });
//   }
//   console.log("Main process: apk:select tempDir", tempDir);

//   const parsedResults = [];

//   for (const apkPath of result.filePaths) {
//     const safePath = path.join(tempDir, path.basename(apkPath));
//     fs.copyFileSync(apkPath, safePath);

//     console.log("Selected APK:", safePath);
//     console.log("APK size:", fs.statSync(safePath).size);

//     const meta = await parseManifest(safePath);

//     parsedResults.push({
//       path: safePath,
//       meta,
//     });
//   }
//   console.log("Main process: apk:select parsedResults", parsedResults);

//   return parsedResults;
// });

// app.whenReady().then(() => {
//   ipcMain.handle("apk:select", async () => {
//     console.log("apk:select called");

//     const result = dialog.showOpenDialogSync({
//       title: "Select APK file(s)",
//       properties: ["openFile", "multiSelections"],
//       filters: [{ name: "Android APK", extensions: ["apk"] }],
//     });

//     console.log("Dialog result:", result);

//     if (!result || result.length === 0) {
//       return [];
//     }

//     const parsedResults = [];

//     for (const apkPath of result) {
//       console.log("Parsing APK:", apkPath);

//       const meta = await parseManifest(apkPath);

//       console.log("Parsed meta:", meta);

//       parsedResults.push({
//         path: apkPath,
//         meta,
//       });
//     }

//     return parsedResults;
//   });
// });

ipcMain.handle("apk:select", async () => {
  console.log("apk:select called");

  const result = dialog.showOpenDialogSync({
    title: "Select APK file(s)",
    properties: ["openFile", "multiSelections"],
    filters: [{ name: "Android APK", extensions: ["apk"] }],
  });

  // console.log("Dialog result:", result);

  if (!result || result.length === 0) return [];

  const parsedResults: any[] = [];

  for (const apkPath of result) {
    console.log("Parsing APK:", apkPath);

    try {
      const parser = new ApkParser(apkPath);
      const info = await parser.parse();
      console.log("Parsed manifest:", info);

      parsedResults.push({
        path: apkPath,
        meta: {
          packageName: info.package,
          versionName: info.versionName,
          versionCode: info.versionCode,
          launchableActivity: info.launchableActivity || null,
        },
      });
    } catch (parseError) {
      console.error("Manifest parse failed:", parseError);
      parsedResults.push({
        path: apkPath,
        meta: null,
      });
    }
  }

  return parsedResults;
});

/*
// Helper to exec adb commands -- already in adbHelper.ts

function execAdb(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile("adb", args, { encoding: "utf8" }, (err, stdout, stderr) => {
      if (err) {
        reject(stderr || err.message);
      } else {
        resolve(stdout);
      }
    });
  });
} 

*/

type InstalledPackage = {
  packageName: string;
  path: string;
};

function parsePmList(output: string): InstalledPackage[] {
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      // package:/data/app/.../base.apk=com.example.app
      const [pkgPath, pkgName] = line.replace("package:", "").split("=");
      if (!pkgName || !pkgPath) return null;
      return {
        packageName: pkgName,
        path: pkgPath,
      };
    })
    .filter(Boolean) as InstalledPackage[];
}

ipcMain.handle("device:listPackages", async (_, deviceId: string) => {
  console.log("Listing packages for device:", deviceId);

  const output = await adb.exec([
    "-s",
    deviceId,
    "shell",
    "pm",
    "list",
    "packages",
    "-f",
  ]);

  const parsed = parsePmList(output);
  console.log(`Found ${parsed.length} packages`);
  return parsed;
});

ipcMain.handle("apk:install", async (_, deviceId, apkPath) => {
  await adb.exec(["-s", deviceId, "install", "-r", apkPath]);
  return getDeviceSnapshot(deviceId);
});

// ipcMain.handle("apk:uninstall", async (_, deviceId, packageName) => {
//   await adb.exec(["-s", deviceId, "uninstall", packageName]);
//   return getDeviceSnapshot(deviceId);
// });

ipcMain.handle("apk:launch", async (_, deviceId, packageName) => {
  await adb.exec([
    "-s",
    deviceId,
    "shell",
    "monkey",
    "-p",
    packageName,
    "-c",
    "android.intent.category.LAUNCHER",
    "1",
  ]);
  return true;
});

async function getDeviceSnapshot(deviceId: string): Promise<DeviceSnapshot> {
  const output = await adb.exec([
    "-s",
    deviceId,
    "shell",
    "pm",
    "list",
    "packages",
    "-f",
  ]);

  const packages: Record<string, DevicePackageInfo> = {};

  output.split("\n").forEach((line: string) => {
    // package:/data/app/xxx/base.apk=com.example.app
    const match = line.match(/^package:(.+?)=(.+)$/);
    if (!match) return;

    const [, path, packageName] = match;
    packages[packageName] = { packageName, path };
  });

  return {
    deviceId,
    packages,
    collectedAt: Date.now(),
  };
}

ipcMain.handle("device:snapshot", (_, deviceId) => getDeviceSnapshot(deviceId));

/* ---------------- LOGCAT ---------------- */
const logcat = new LogcatManager();

let logcatWindow: BrowserWindow | null = null;

ipcMain.handle("logcat:openWindow", () => {
  if (logcatWindow && !logcatWindow.isDestroyed()) {
    logcatWindow.focus();
    return;
  }

  logcatWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    title: "Logcat",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (IS_DEV) {
    // Next.js dev server
    logcatWindow.loadURL("http://localhost:3000/logcat");
  } else {
    // Next export output
    logcatWindow.loadFile(
      path.join(__dirname, "../renderer/logcat/index.html")
    );
  }

  logcatWindow.on("closed", () => {
    logcatWindow = null;
  });
});

// ipcMain.handle("logcat:start", async (_evt, { deviceId }) => {
//   console.log("[MAIN] logcat:start handler called");

//   if (logcatProcess) return { ok: true };

//   const args = [];
//   if (deviceId) args.push("-s", deviceId);
//   args.push("logcat", "-v", "threadtime");

//   logcatProcess = spawn("adb", args);

//   logcatProcess.stdout.on("data", (buf) => {
//     const lines = buf.toString().split("\n").filter(Boolean);

//     for (const raw of lines) {
//       const parsed = parseLogcatLine(raw);
//       if (!parsed) continue;

//       mainWindow?.webContents.send("logcat:line", { line: parsed });
//     }
//   });

//   logcatProcess.on("exit", () => {
//     logcatProcess = null;
//   });

//   return { ok: true };
// });

ipcMain.handle("logcat:start", (_e, req) => {
  logcat.start(req.deviceId, (line) => {
    logcatWindow?.webContents.send("logcat:line", { line });
  });
  return { ok: true };
});

ipcMain.handle("logcat:resume", () => {
  logcat.resume();
  return { ok: true };
});

ipcMain.handle("logcat:pause", () => {
  logcat.pause();
  return { ok: true };
});

ipcMain.handle("logcat:filter", (_e, req) => {
  logcat.updateFilter(req.levels, req.tags);
  return { ok: true };
});

ipcMain.handle("logcat:export", (_e, req) => {
  logcat.exportTo(req.filePath);
  return { ok: true, filePath: req.filePath };
});

ipcMain.handle("logcat:stop", async () => {
  logcat.stop();
  return { ok: true };
});

/* ----------- Parser (minimal, safe) ----------- */

function parseLogcatLine(raw: string): LogcatLine | null {
  // Example:
  // 06-09 14:32:10.123  1234  1234 D TagName: message
  const match = raw.match(
    /^(\d\d-\d\d\s\d\d:\d\d:\d\d\.\d+)\s+(\d+)\s+(\d+)\s+([VDIWEF])\s+([^:]+):\s+(.*)$/
  );

  if (!match) {
    return {
      level: LogcatLevel.DEBUG,
      message: raw,
      raw,
    };
  }

  const [, timestamp, pid, tid, level, tag, message] = match;

  return {
    timestamp,
    pid: Number(pid),
    tid: Number(tid),
    level: level as LogcatLevel,
    tag,
    message,
    raw,
  };
}

/* adb console window */

ipcMain.handle("adb:runCommand", (event, req) => {
  const sender = event.sender;

  runAdbCommand(
    req.deviceId,
    req.command,
    (stream, data) => {
      sender.send("adb:commandOutput", {
        stream,
        data,
      });
    },
    (exitCode) => {
      sender.send("adb:commandCompleted", {
        exitCode,
      });
    }
  );

  return { ok: true };
});

let adbConsoleWindow: BrowserWindow | null = null;

ipcMain.handle("adb:openConsoleWindow", () => {
  if (adbConsoleWindow && !adbConsoleWindow.isDestroyed()) {
    adbConsoleWindow.focus();
    return;
  }

  adbConsoleWindow = new BrowserWindow({
    width: 900,
    height: 600,
    title: "ADB Console",
    webPreferences: {
      preload: __dirname + "/preload.js",
    },
  });

  if (IS_DEV) {
    // Next.js dev server
    adbConsoleWindow.loadURL("http://localhost:3000/adb-console");
  } else {
    // Next export output
    adbConsoleWindow.loadFile(
      path.join(__dirname, "../renderer/adb-console/index.html")
    );
  }

  adbConsoleWindow.on("closed", () => {
    adbConsoleWindow = null;
  });
});

ipcMain.handle("apk:uninstall", async (_e, req) => {
  await uninstallApk(req.deviceId, req.packageName);

  const snapshot = await getDeviceSnapshot(req.deviceId);
  return { ok: true, snapshot };
});

ipcMain.handle("apk:forceStop", async (_e, req) => {
  await forceStopApk(req.deviceId, req.packageName);

  const snapshot = await getDeviceSnapshot(req.deviceId);
  return { ok: true, snapshot };
});

ipcMain.handle("apk:clearData", async (_e, req) => {
  await clearApkData(req.deviceId, req.packageName);

  const snapshot = await getDeviceSnapshot(req.deviceId);
  return { ok: true, snapshot };
});