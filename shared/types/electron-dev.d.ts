type Device = {
  id: string;
  display: string;
};

type InstalledPackage = {
  packageName: string;
  path: string;
};

type ApkEntry = {
  path: string;
  meta: {
    packageName: string;
    versionName?: string;
    versionCode?: number;
  };
};

export type InstallState =
  | "NOT_INSTALLED"
  | "INSTALLED"
  | "UPGRADE_AVAILABLE";