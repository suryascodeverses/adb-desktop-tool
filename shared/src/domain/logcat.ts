import { LogcatLevel } from "../enums/logcat";

export interface LogcatLine {
  timestamp?: string;
  pid?: number;
  tid?: number;
  level: LogcatLevel;
  tag?: string;
  message: string;
  raw: string;
}
