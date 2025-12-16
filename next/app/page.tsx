"use client";

import React, { useEffect, useState } from "react";

declare global {
  interface Window {
    electronAPI: any;
  }
}

export default function HomePage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [apkFiles, setApkFiles] = useState<string[]>([]);

  async function refreshDevices() {
    const list = await window.electronAPI.getDevices();
    setDevices(list);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const apks = files
      .filter((f) => f.name.endsWith(".apk"))
      .map((f) => f.path);
    setApkFiles((prev) => [...prev, ...apks]);
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
        <ul className="mt-3">
          {apkFiles.map((apk) => (
            <li key={apk} className="text-sm text-gray-700">
              {apk}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
