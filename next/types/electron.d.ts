declare global {
  interface File {
    path: string;
  }

  interface Window {
    electronAPI: {
      getDevices: () => Promise<any[]>;
      parseApk: (path: string) => Promise<any>;
      install: (d: string, a: string) => Promise<any>;
      launch: (d: string, p: string) => Promise<any>;
    };
  }
}

export {};
