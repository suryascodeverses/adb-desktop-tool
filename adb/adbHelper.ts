import { spawn, execSync } from "child_process";
import { EventEmitter } from "events";
import type { InstallResult, DeviceInfo } from "@adb/shared/dist/index";

/**
 * AdbHelper — Node.js wrapper around ADB
 * Used by Electron Main Process
 */

export class AdbHelper extends EventEmitter {
  private adbPath: string;

  constructor(adbPath: string = "adb") {
    super();
    this.adbPath = adbPath;
  }

  /** Change adb executable path */
  setAdbPath(path: string) {
    this.adbPath = path;
  }

  /** Run simple adb command synchronously */
  private runSync(args: string[]): { stdout: string; stderr: string } {
    try {
      const stdout = execSync(`${this.adbPath} ${args.join(" ")}`, {
        encoding: "utf8",
      });
      return { stdout, stderr: "" };
    } catch (err: any) {
      return {
        stdout: err.stdout?.toString?.() ?? "",
        stderr: err.stderr?.toString?.() ?? String(err),
      };
    }
  }

  /** Fetch attached devices list */
  async getDevices(): Promise<DeviceInfo[]> {
    const out = this.runSync(["devices", "-l"]).stdout;
    const lines = out.split(/\r?\n/).map((l) => l.trim());

    const devices: DeviceInfo[] = [];

    for (const line of lines) {
      if (line.startsWith("List of devices")) continue;
      if (!line) continue;

      const parts = line.split(/\s+/);
      if (parts.length >= 2 && parts[1] !== "offline") {
        devices.push({ id: parts[0], display: line });
      }
    }

    return devices;
  }

  /** Install APK */
  install(deviceId: string, apkPath: string): Promise<InstallResult> {
    return new Promise((resolve) => {
      const args = ["-s", deviceId, "install", "-r", apkPath];
      const child = spawn(this.adbPath, args);

      let output = "";

      child.stdout.on("data", (d) => (output += d.toString()));
      child.stderr.on("data", (d) => (output += d.toString()));

      child.on("close", () => {
        resolve({ success: output.includes("Success"), output });
      });
    });
  }

  /** Launch Application */
  launch(deviceId: string, packageName: string) {
    return new Promise<InstallResult>((resolve) => {
      const args = [
        "-s",
        deviceId,
        "shell",
        "monkey",
        "-p",
        packageName,
        "-c",
        "android.intent.category.LAUNCHER",
        "1",
      ];

      const child = spawn(this.adbPath, args);
      let output = "";

      child.stdout.on("data", (d) => (output += d.toString()));
      child.stderr.on("data", (d) => (output += d.toString()));

      child.on("close", () => resolve({ success: true, output }));
    });
  }

  /** Stream Logcat */
  streamLogcat(deviceId: string, callback: (line: string) => void) {
    const args = ["-s", deviceId, "logcat", "-v", "time"];
    const child = spawn(this.adbPath, args);

    child.stdout.on("data", (d) => {
      const text = d.toString();
      text.split(/\r?\n/).forEach((line) => line && callback(line));
    });

    child.stderr.on("data", (d) => callback(d.toString()));

    return () => {
      try {
        child.kill();
      } catch {}
    };
  }

  /** List remote folder */
  async listPath(deviceId: string, remotePath: string): Promise<string[]> {
    try {
      const out = execSync(
        `${this.adbPath} -s ${deviceId} shell ls -1 "${remotePath}"`,
        { encoding: "utf8" }
      );
      return out.split(/\r?\n/).filter(Boolean);
    } catch {
      return [];
    }
  }

  /** Pull remote → local */
  pull(deviceId: string, remote: string, local: string) {
    return new Promise<InstallResult>((resolve) => {
      const child = spawn(this.adbPath, [
        "-s",
        deviceId,
        "pull",
        remote,
        local,
      ]);
      let out = "";

      child.stdout.on("data", (d) => (out += d.toString()));
      child.stderr.on("data", (d) => (out += d.toString()));

      child.on("close", () => resolve({ success: true, output: out }));
    });
  }

  /** Push local → remote */
  push(deviceId: string, local: string, remote: string) {
    return new Promise<InstallResult>((resolve) => {
      const child = spawn(this.adbPath, [
        "-s",
        deviceId,
        "push",
        local,
        remote,
      ]);
      let out = "";

      child.stdout.on("data", (d) => (out += d.toString()));
      child.stderr.on("data", (d) => (out += d.toString()));

      child.on("close", () => resolve({ success: true, output: out }));
    });
  }
}
