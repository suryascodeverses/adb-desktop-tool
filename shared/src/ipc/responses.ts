import { DeviceSnapshot } from "../domain/device";
import { LogcatLine } from "../domain/logcat";

export interface LogcatStartedResponse {
  ok: true;
}

export interface LogcatStoppedResponse {
  ok: true;
}

export interface LogcatLineEvent {
  line: LogcatLine;
}

export interface InstallResult {
  success: boolean;
  output: string;
}

export interface LogcatExportedResponse {
  ok: true;
  filePath: string;
}

export interface AdbCommandOutputEvent {
  stream: "stdout" | "stderr";
  data: string;
}

export interface AdbCommandCompletedEvent {
  exitCode: number;
}

export interface ApkActionResponse {
  ok: boolean;
  snapshot: DeviceSnapshot;
}
