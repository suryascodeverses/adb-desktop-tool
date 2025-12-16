import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { spawn } from "child_process";
import { AdbHelper } from "@adb/core/dist/adbHelper";
import { parseManifest } from "@adb/core/dist/manifestParser";

let mainWindow: BrowserWindow | null = null;
const adb = new AdbHelper();

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
