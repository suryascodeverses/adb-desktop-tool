/* /next/types/electron.d.ts */

declare global {
  interface File {
    path: string;
  }

  interface Window {
    electronAPI: {
      getDevices: () => Promise<
        {
          id: string;
          display: string;
        }[]
      >;
      parseApk: (path: string) => Promise<{
        packageName: string;
        versionName?: string;
        versionCode?: number;
      } | null>;
      install: (d: string, a: string) => Promise<any>;
      uninstall: (d: string, a: string) => Promise<any>;
      launch: (d: string, p: string) => Promise<any>;
      getPackages: (d: string) => Promise<any>;
      selectApks: () => Promise<
        {
          path: string;
          meta: {
            packageName: string;
            versionName?: string;
            versionCode?: number;
          } | null;
        }[]
      >;
      listInstalledPackages: (deviceId: string) => Promise<
        {
          packageName: string;
          path: string;
        }[]
      >;
      installApk: (deviceId: string, apkPath: string) => Promise<void>;
      uninstallApk: (deviceId: string, packageName: string) => Promise<void>;
      launchApk: (deviceId: string, packageName: string) => Promise<void>;
      logcat: {
        start: (req?: any) => Promise<any>;
        stop: () => Promise<any>;
        onLine: (cb: (evt: LogcatLineEvent) => void) => void;
        pause: () => Promise<any>;
        resume: () => Promise<any>;
        filter: (r: any) => Promise<any>;
        export: (r: any) => Promise<any>;
      };
      adb: {
        runCommand: (req: AdbCommandRequest) => Promise<{ ok: true }>;

        onOutput: (cb: (evt: AdbCommandOutputEvent) => void) => void;

        onCompleted: (cb: (evt: AdbCommandCompletedEvent) => void) => void;
      };

      apk: {
        uninstall: (req: ApkUninstallRequest) => Promise<ApkActionResponse>;

        forceStop: (req: ApkForceStopRequest) => Promise<ApkActionResponse>;

        clearData: (req: ApkClearDataRequest) => Promise<ApkActionResponse>;
      };

      window: {
        openLogcat: () => Promise<void>;
        openAdbConsole: () => Promise<void>;
      };
    };
  }
}

export {};