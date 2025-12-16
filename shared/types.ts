// shared/types.ts
export interface DeviceInfo {
id: string;
display: string;
}


export interface InstallResult {
success: boolean;
output: string;
}


export interface ManifestInfo {
packageName: string;
launchableActivity?: string;
versionName?: string;
versionCode?: string;
}