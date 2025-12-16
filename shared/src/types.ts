// Base types shared across Electron, Next.js, and ADB helpers


export interface DeviceInfo {
id: string; // device serial
display: string; // raw 'adb devices -l' line
}


export interface InstallResult {
success: boolean; // true if adb install prints "Success"
output: string; // entire stdout + stderr
}


export interface ManifestInfo {
packageName: string;
launchableActivity?: string;
versionName?: string;
versionCode?: string;
}


export interface FileListItem {
name: string;
isDir: boolean;
}