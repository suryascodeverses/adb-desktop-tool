import { app, BrowserWindow } from "electron";
import * as path from "path";
import * as electron from "electron";
import ApkParser from "app-info-parser";
import { execFile } from "child_process";

import { spawn } from "child_process";
import { AdbHelper, parseManifest } from "@adb/core";
import type { DeviceSnapshot, DevicePackageInfo } from "@adb/shared";

let mainWindow: BrowserWindow | null = null;
const adb = new AdbHelper();
const { dialog, ipcMain } = electron;

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

  console.log("Dialog result:", result);

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
  return true;
});

ipcMain.handle("apk:uninstall", async (_, deviceId, packageName) => {
  await adb.exec(["-s", deviceId, "uninstall", packageName]);
  return true;
});

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
