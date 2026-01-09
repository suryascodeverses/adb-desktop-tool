/* /next/app/page.tsx */

"use client";

import React, { useEffect, useState } from "react";
import ApkCard from "../components/ApkCard";
import { DeviceSnapshot } from "@adb/shared";

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

  const [deviceSnapshot, setDeviceSnapshot] = useState<DeviceSnapshot | null>(
    null
  );

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  ADB Manager
                </h1>
                <p className="text-sm text-slate-500">
                  Android Debug Bridge Desktop Tool
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.electronAPI.window.openLogcat()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Logcat
              </button>
              <button
                onClick={() => window.electronAPI.window.openAdbConsole()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Console
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Devices Section */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <h2 className="text-lg font-semibold text-slate-900">
                  Connected Devices
                </h2>
              </div>
              <button
                onClick={refreshDevices}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          <div className="px-6 py-4">
            {devices.length === 0 ? (
              <div className="text-center py-8">
                <svg
                  className="w-12 h-12 text-slate-300 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-slate-500 font-medium">
                  No devices connected
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Connect an Android device via USB
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-700">
                  Select Device:
                </label>
                <select
                  className="flex-1 max-w-md px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={selectedDevice ?? ""}
                  onChange={(e) => setSelectedDevice(e.target.value)}
                >
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.display}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-slate-600">Connected</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* APK Section */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h2 className="text-lg font-semibold text-slate-900">
                  APK Management
                </h2>
                {apkList.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    {apkList.length}
                  </span>
                )}
              </div>
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
                onClick={addApksFromDialog}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add APK
              </button>
            </div>
          </div>

          <div className="px-6 py-4">
            {apkList.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
                <svg
                  className="w-12 h-12 text-slate-300 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-slate-500 font-medium">
                  No APK files loaded
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Click "Add APK" to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {apkList.map((apk, idx) => (
                  <ApkCard
                    key={idx}
                    apk={apk}
                    deviceId={selectedDevice}
                    installState={getInstallState(apk)}
                    onActionComplete={(snapshot) => {
                      setDeviceSnapshot(snapshot);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}