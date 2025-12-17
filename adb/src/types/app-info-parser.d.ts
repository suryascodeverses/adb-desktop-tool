declare module "app-info-parser" {
  interface AppInfo {
    package: string;
    versionName?: string;
    versionCode?: string | number;
    application?: {
      label?: string;
    };
  }

  export default class AppInfoParser {
    constructor(filePath: string);
    parse(): Promise<AppInfo>;
  }
}
