"use client";

import React, { useEffect, useState } from "react";
import ApkCard from "../components/ApkCard";

export default function HomePage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [apkList, setApkList] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [installedPkgs, setInstalledPkgs] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedDevice) return;
    loadInstalledPkgs();
  }, [selectedDevice]);

  async function loadInstalledPkgs() {
    if (selectedDevice) {
      const pkgs = await window.electronAPI.getPackages(selectedDevice);
      setInstalledPkgs(pkgs);
    }
  }

  async function refreshDevices() {
    const list = await window.electronAPI.getDevices();
    setDevices(list);

    if (list.length > 0 && !selectedDevice) {
      setSelectedDevice(list[0].id);
    }
  }

  async function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const apks = files.filter((f) => f.name.endsWith(".apk"));
    console.log("Dropped files,  :");
    console.log("Dropped files,  :");
    console.log("Dropped files,  :");
    console.log("Dropped files,  :", files);
    console.log("Dropped ,  APK path:");
    console.log("Dropped ,  APK path:");
    console.log("Dropped ,  APK path:");
    console.log("Dropped ,  APK path:", apks);

    for (const apk of apks) {
      const meta = await window.electronAPI.parseApk(apk.path);

      setApkList((prev) => [
        ...prev,
        {
          path: apk.path,
          ...(meta || { packageName: "Unknown / Failed to parse" }),
        },
      ]);
    }
  }

  useEffect(() => {
    refreshDevices();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">ADB Desktop Tool</h1>

      {/* Devices */}
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
              <option value="">Select a device</option>
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.display}
                </option>
              ))}
            </select>
          )}
        </div>
      </section>

      {/* APK Drop Zone */}
      <section className="border-2 border-dashed border-gray-400 p-6 rounded bg-white shadow">
        <h2 className="text-xl font-semibold">APK Files</h2>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={async () => {
            const results = await window.electronAPI.selectApks();

            console.log("APK selection results:", results);

            setApkList((prev) => [
              ...prev,
              ...results.map((r) => ({
                path: r.path,
                ...(r.meta || { packageName: "Unknown / Failed to parse" }),
              })),
            ]);
          }}
        >
          Add APK
        </button>
        <div className="mt-4 space-y-3">
          {apkList.map((apk, idx) => (
            <ApkCard
              key={idx}
              meta={apk}
              deviceId={selectedDevice}
              installedPackages={installedPkgs}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
