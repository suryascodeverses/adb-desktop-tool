export interface InstallApkRequest {
  deviceId: string;
  apkPath: string;
}

export interface UninstallApkRequest {
  deviceId: string;
  packageName: string;
}

export interface StartLogcatRequest {
  deviceId?: string;
}

export interface StopLogcatRequest {}

export interface StartLogcatRequest {
  deviceId?: string;
}

export interface PauseLogcatRequest {}
export interface ResumeLogcatRequest {}

export interface UpdateLogcatFilterRequest {
  levels?: string[]; // ['D', 'I', 'E']
  tags?: string[]; // ['ActivityManager']
}

export interface ExportLogcatRequest {
  filePath: string;
}

export interface AdbCommandRequest {
  deviceId?: string;
  command: string; // e.g. "shell pm list packages"
}

export interface ApkActionRequest {
  deviceId: string;
  packageName: string;
}

export interface ApkUninstallRequest extends ApkActionRequest {}

export interface ApkForceStopRequest extends ApkActionRequest {}

export interface ApkClearDataRequest extends ApkActionRequest {}
