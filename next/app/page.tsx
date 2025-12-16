"use client";

import React, { useEffect, useState } from "react";
import ApkCard from "../components/ApkCard";

export default function HomePage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [apkList, setApkList] = useState<any[]>([]);

  async function refreshDevices() {
    const list = await window.electronAPI.getDevices();
    setDevices(list);
  }

  async function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const apks = files.filter((f) => f.name.endsWith(".apk"));

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
        <ul className="mt-3 list-disc ml-5">
          {devices.map((d) => (
            <li key={d.id}>{d.display}</li>
          ))}
        </ul>
      </section>

      {/* APK Drop Zone */}
      <section
        className="border-2 border-dashed border-gray-400 p-6 rounded bg-white shadow"
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <h2 className="text-xl font-semibold">Drag & Drop APK Files</h2>

        <div className="mt-4 space-y-3">
          {apkList.map((apk, idx) => (
            <ApkCard key={idx} meta={apk} />
          ))}
        </div>
      </section>
    </div>
  );
}
