declare global {
  interface File {
    path: string;
  }

  interface Window {
    electronAPI: {
      getDevices: () => Promise<any[]>;
      parseApk: (path: string) => Promise<any>;
      install: (d: string, a: string) => Promise<any>;
      uninstall: (d: string, a: string) => Promise<any>;
      launch: (d: string, p: string) => Promise<any>;
      getPackages: (d: string) => Promise<any>;
      selectApks: () => Promise<{ path: string; meta: any | null }[]>;
    };
  }
}

export {};
