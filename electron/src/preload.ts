import { contextBridge, ipcRenderer } from "electron";

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
});
