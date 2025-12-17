"use client";

import React, { useState } from "react";

export interface ApkMeta {
  path: string;
  packageName: string;
  versionName?: string;
  versionCode?: string;
  launchableActivity?: string;
}

export default function ApkCard({
  meta,
  deviceId,
  installedPackages,
}: {
  meta: ApkMeta;
  deviceId: string | null;
  installedPackages?: string[];
}) {
  const isInstalled =
    meta.packageName && installedPackages?.includes(meta.packageName);

  const [status, setStatus] = useState<string>("");

  async function installApk() {
    if (!deviceId) return setStatus("No device selected");

    // Warnings
    if (isInstalled) {
      setStatus("Warning: App already installed — reinstalling...");
    }

    setStatus("Installing...");

    const res = await window.electronAPI.install(deviceId, meta.path);

    if (res.success) {
      setStatus("Installed successfully!");
    } else {
      setStatus("Install failed: " + res.output);
    }
  }

  async function uninstallApk() {
    if (!deviceId) return setStatus("No device selected");

    if (!isInstalled) {
      setStatus("App is not installed");
      return;
    }

    setStatus("Uninstalling...");

    const res = await window.electronAPI.uninstall(deviceId, meta.packageName);

    setStatus(res.success ? "Uninstalled!" : "Uninstall failed");
  }

  async function launchApk() {
    if (!deviceId) return setStatus("No device selected");

    if (!isInstalled) {
      setStatus("App is not installed");
      return;
    }

    setStatus("Launching...");

    const res = await window.electronAPI.launch(deviceId, meta.packageName);

    setStatus(res.success ? "Launched!" : "Launch failed");
  }

  return (
    <div className="border rounded p-4 bg-white shadow space-y-2 text-sm">
      <div className="font-semibold text-base">{meta.packageName}</div>
      <div className="text-gray-700 break-all">Path: {meta.path}</div>

      {meta.versionName && (
        <div className="text-gray-700">Version: {meta.versionName}</div>
      )}

      {meta.versionCode && (
        <div className="text-gray-700">Version Code: {meta.versionCode}</div>
      )}

      {meta.launchableActivity && (
        <div className="text-gray-700">
          Launch Activity: {meta.launchableActivity}
        </div>
      )}
      {isInstalled ? (
        <div className="text-green-700 font-medium">Installed</div>
      ) : (
        <div className="text-red-700 font-medium">Not Installed</div>
      )}
      {/* ACTION BUTTONS */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={installApk}
          className="px-2 py-1 bg-green-600 text-white rounded"
        >
          Install
        </button>

        <button
          onClick={uninstallApk}
          className="px-2 py-1 bg-red-600 text-white rounded"
        >
          Uninstall
        </button>

        <button
          onClick={launchApk}
          className="px-2 py-1 bg-blue-600 text-white rounded"
        >
          Launch
        </button>
      </div>

      {status && <div className="text-gray-800 text-xs mt-2">{status}</div>}
    </div>
  );
}
