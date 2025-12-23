declare module "app-info-parser" {
  export interface AppInfo {
    package: string;
    versionName?: string;
    versionCode?: string | number;
    launchableActivity?: string;
    application?: {
      label?: string;
    };
  }

  export default class AppInfoParser {
    constructor(filePath: string);
    parse(): Promise<AppInfo>;
  }
}
