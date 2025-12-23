export interface InstallApkRequest {
  deviceId: string;
  apkPath: string;
}

export interface UninstallApkRequest {
  deviceId: string;
  packageName: string;
}
