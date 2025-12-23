export interface DeviceInfo {
  id: string;
  display: string;
}

export interface DevicePackageInfo {
  packageName: string;
  path: string;
  versionCode?: number;
}

export interface DeviceSnapshot {
  deviceId: string;
  packages: Record<string, DevicePackageInfo>;
  collectedAt: number;
}
