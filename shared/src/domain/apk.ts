export interface ApkMeta {
  packageName: string;
  versionName?: string;
  versionCode?: number;
  launchableActivity?: string;
}

export interface ApkEntry {
  path: string;
  meta: ApkMeta;
}
