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
