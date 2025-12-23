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
