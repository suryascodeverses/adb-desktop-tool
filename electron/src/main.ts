import { app, BrowserWindow } from "electron";
import * as path from "path";
import * as electron from "electron";
import ApkParser from "app-info-parser";

import { spawn } from "child_process";
import { AdbHelper, parseManifest } from "@adb/core";
import * as fs from "fs";
import * as os from "os";
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
