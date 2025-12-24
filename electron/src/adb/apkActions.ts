import { spawn } from "child_process";

function runAdb(deviceId: string, args: string[]): Promise<{ code: number }> {
  return new Promise((resolve) => {
    const fullArgs = ["-s", deviceId, ...args];
    const proc = spawn("adb", fullArgs);

    proc.on("close", (code) => {
      resolve({ code: code ?? 0 });
    });
  });
}

export async function uninstallApk(deviceId: string, packageName: string) {
  return runAdb(deviceId, ["uninstall", packageName]);
}

export async function forceStopApk(deviceId: string, packageName: string) {
  return runAdb(deviceId, ["shell", "am", "force-stop", packageName]);
}

export async function clearApkData(deviceId: string, packageName: string) {
  return runAdb(deviceId, ["shell", "pm", "clear", packageName]);
}
