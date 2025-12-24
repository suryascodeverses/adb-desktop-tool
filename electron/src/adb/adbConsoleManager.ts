import { spawn } from "child_process";

export function runAdbCommand(
  deviceId: string | undefined,
  command: string,
  onOutput: (stream: "stdout" | "stderr", data: string) => void,
  onExit: (code: number) => void
) {
  const args: string[] = [];

  if (deviceId) {
    args.push("-s", deviceId);
  }

  // split command safely
  args.push(...command.split(" "));

  const proc = spawn("adb", args);

  proc.stdout.on("data", (buf) => {
    onOutput("stdout", buf.toString());
  });

  proc.stderr.on("data", (buf) => {
    onOutput("stderr", buf.toString());
  });

  proc.on("close", (code) => {
    onExit(code ?? 0);
  });
}
