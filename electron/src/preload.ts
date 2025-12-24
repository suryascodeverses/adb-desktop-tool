import { contextBridge, ipcRenderer } from "electron";
import {
  StartLogcatRequest,
  StopLogcatRequest,
  LogcatLineEvent,
} from "@adb/shared";

contextBridge.exposeInMainWorld("electronAPI", {
  getDevices: () => ipcRenderer.invoke("adb:getDevices"),
  install: (d: string, a: string) => ipcRenderer.invoke("adb:install", d, a),
  launch: (d: string, p: string) => ipcRenderer.invoke("adb:launch", d, p),
  listPath: (d: string, r: string) => ipcRenderer.invoke("adb:list", d, r),
  pull: (d: string, r: string, l: string) =>
    ipcRenderer.invoke("adb:pull", d, r, l),
  push: (d: string, l: string, r: string) =>
    ipcRenderer.invoke("adb:push", d, l, r),
  parseApk: (apk: string) => ipcRenderer.invoke("apk:parse", apk),
  uninstall: (d: string, p: string) =>
    ipcRenderer.invoke("adb:uninstall", d, p),
  getPackages: (d: string) => ipcRenderer.invoke("adb:getPackages", d),
  selectApks: () => {
    console.log("preload.selectApks called");
    return ipcRenderer.invoke("apk:select");
  },
  listInstalledPackages: (deviceId: string) =>
    ipcRenderer.invoke("device:listPackages", deviceId),

  installApk: (deviceId: string, apkPath: string) =>
    ipcRenderer.invoke("apk:install", deviceId, apkPath),

  uninstallApk: (deviceId: string, packageName: string) =>
    ipcRenderer.invoke("apk:uninstall", deviceId, packageName),

  launchApk: (deviceId: string, packageName: string) =>
    ipcRenderer.invoke("apk:launch", deviceId, packageName),
  getSnapshot: (deviceId: string) =>
    ipcRenderer.invoke("device:snapshot", deviceId),
  logcat: {
    start: (req: StartLogcatRequest) => ipcRenderer.invoke("logcat:start", req),
    stop: (req?: StopLogcatRequest) => ipcRenderer.invoke("logcat:stop", req),
    onLine: (cb: (evt: LogcatLineEvent) => void) =>
      ipcRenderer.on("logcat:line", (_e, payload) => cb(payload)),
    pause: () => ipcRenderer.invoke("logcat:pause"),
    resume: () => ipcRenderer.invoke("logcat:resume"),
    filter: (r: StartLogcatRequest) => ipcRenderer.invoke("logcat:filter", r),
    export: (r: StartLogcatRequest) => ipcRenderer.invoke("logcat:export", r),
  },
  ping: () => ipcRenderer.invoke("ping"),
  window: {
    openLogcat: () => ipcRenderer.invoke("logcat:openWindow"),
  },
});
