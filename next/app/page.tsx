"use client";

import React, { useEffect, useState } from "react";
import ApkCard from "../components/ApkCard";
/* =======================
   Types
======================= */

type Device = {
  id: string;
  display: string;
};

type InstalledPackage = {
  packageName: string;
  path: string;
  versionName?: string;
  versionCode?: number;
};

type ApkEntry = {
  path: string;
  meta: {
    packageName: string;
    versionName?: string;
    versionCode?: number;
  };
};

export type InstallState = "NOT_INSTALLED" | "INSTALLED" | "UPGRADE_AVAILABLE";

/* =======================
   Page Component
======================= */

export default function HomePage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const [apkList, setApkList] = useState<ApkEntry[]>([]);
  const [installedPackages, setInstalledPackages] = useState<
    InstalledPackage[]
  >([]);

  /* =======================
     Device Handling
  ======================= */

  async function refreshDevices() {
    const list = await window.electronAPI.getDevices();
    setDevices(list);

    if (list.length > 0 && !selectedDevice) {
      setSelectedDevice(list[0].id);
    }
  }

  useEffect(() => {
    refreshDevices();
  }, []);

  /* =======================
     Installed Packages Sync
  ======================= */

  async function refreshInstalledPackages(deviceId: string) {
    const pkgs = await window.electronAPI.listInstalledPackages(deviceId);
    setInstalledPackages(pkgs);
  }

  useEffect(() => {
    if (!selectedDevice) return;
    refreshInstalledPackages(selectedDevice);
  }, [selectedDevice]);

  /* =======================
     APK Handling
  ======================= */

  async function addApksFromDialog() {
    const results = await window.electronAPI.selectApks();

    setApkList((prev) => [
      ...prev,
      ...results.map((r: any) => ({
        path: r.path,
        meta: r.meta || { packageName: "Unknown / Failed to parse" },
      })),
    ]);
  }

  /* =======================
     Install State Logic
  ======================= */

  function getInstallState(apk: ApkEntry): InstallState {
    const pkg = apk.meta?.packageName;
    if (!pkg) return "NOT_INSTALLED";

    const installed = installedPackages.find((p) => p.packageName === pkg);

    if (!installed) return "NOT_INSTALLED";

    // Version comparison (optional but correct)
    if (
      apk.meta.versionCode !== undefined &&
      installed.versionCode !== undefined &&
      installed.versionCode < apk.meta.versionCode
    ) {
      return "UPGRADE_AVAILABLE";
    }

    return "INSTALLED";
  }

  /* =======================
     Render
  ======================= */

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">ADB Desktop Tool</h1>

      {/* =======================
          Devices Section
      ======================= */}
      <section className="bg-white shadow p-4 rounded">
        <h2 className="text-xl font-semibold">Connected Devices</h2>

        <button
          onClick={refreshDevices}
          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
        >
          Refresh
        </button>

        <div className="mt-3">
          {devices.length === 0 ? (
            <p>No devices connected</p>
          ) : (
            <select
              className="border rounded px-2 py-1"
              value={selectedDevice ?? ""}
              onChange={(e) => setSelectedDevice(e.target.value)}
            >
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.display}
                </option>
              ))}
            </select>
          )}
        </div>
      </section>

      {/* =======================
          APK Section
      ======================= */}
      <section className="border-2 border-dashed border-gray-400 p-6 rounded bg-white shadow">
        <h2 className="text-xl font-semibold">APK Files</h2>

        <button
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={addApksFromDialog}
        >
          Add APK
        </button>

        <div className="mt-4 space-y-3">
          {apkList.map((apk, idx) => (
            <ApkCard
              key={idx}
              apk={apk}
              deviceId={selectedDevice}
              installState={getInstallState(apk)}
              onActionComplete={() => {
                if (selectedDevice) {
                  refreshInstalledPackages(selectedDevice);
                }
              }}
            />
          ))}
        </div>
      </section>
      <button onClick={() => window.electronAPI.window.openLogcat()}>
        Open Logcat
      </button>
    </div>
  );
}
