import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import fs from "fs";
import { LogcatLine } from "@adb/shared";
import path from "path";

export class LogcatManager {
  private proc: ChildProcessWithoutNullStreams | null = null;
  private paused = false;
  private buffer: LogcatLine[] = [];
  private maxBuffer = 2000;
  private levels?: Set<string>;
  private tags?: Set<string>;

  start(deviceId?: string, onLine?: (l: LogcatLine) => void) {
    if (this.proc) return;

    const args = [];
    if (deviceId) args.push("-s", deviceId);
    args.push("logcat", "-v", "threadtime");

    this.proc = spawn("adb", args);

    this.proc.stdout.on("data", (buf) => {
      if (this.paused) return;

      buf
        .toString()
        .split("\n")
        .forEach((raw: string) => {
          if (!raw) return;

          const line: LogcatLine = {
            raw,
            level: raw.match(/\s([VDIWEF])\s/)?.[1] as any,
            message: raw,
          };

          if (this.levels && !this.levels.has(line.level)) return;
          if (this.tags && !this.tags.has(line.tag ?? "")) return;

          this.buffer.push(line);
          if (this.buffer.length > this.maxBuffer) {
            this.buffer.shift();
          }

          onLine?.(line);
        });
    });
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  updateFilter(levels?: string[], tags?: string[]) {
    this.levels = levels ? new Set(levels) : undefined;
    this.tags = tags ? new Set(tags) : undefined;
  }

  exportTo(filePath: string) {
    const logcatDir = path.join(process.cwd(), "logcat");
    if (!fs.existsSync(logcatDir)) {
      fs.mkdirSync(logcatDir, { recursive: true });
    }
    const fileName = path.basename(filePath);
    const fullPath = path.join(logcatDir, fileName);
    fs.writeFileSync(
      fullPath,
      this.buffer.map((l) => l.raw).join("\n"),
      "utf8"
    );
  }

  stop() {
    this.proc?.kill();
    this.proc = null;
  }
}
