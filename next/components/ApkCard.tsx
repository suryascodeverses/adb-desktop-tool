"use client";

import React, { useState } from "react";

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

export interface ApkMeta {
  path: string;
  meta: {
    packageName: string;
    versionName?: string;
    versionCode?: number;
  };
}

interface ApkCardProps {
  apk: ApkMeta;
  deviceId: string | null;
  installState: InstallState;
  onActionComplete: () => void;
}

/* =======================
   Component
======================= */

export default function ApkCard({
  apk,
  deviceId,
  installState,
  onActionComplete,
}: ApkCardProps) {
  const [status, setStatus] = useState<string>("");

  const pkg = apk.meta.packageName;

  /* =======================
     Actions
  ======================= */

  async function installApk() {
    if (!deviceId) {
      setStatus("No device selected");
      return;
    }

    setStatus(
      installState === "UPGRADE_AVAILABLE" ? "Upgrading..." : "Installing..."
    );

    try {
      await window.electronAPI.installApk(deviceId, apk.path);
      setStatus("Install successful");
      onActionComplete();
    } catch (err: any) {
      setStatus("Install failed");
    }
  }

  async function uninstallApk() {
    if (!deviceId) {
      setStatus("No device selected");
      return;
    }

    if (!pkg) {
      setStatus("Invalid package name");
      return;
    }

    setStatus("Uninstalling...");

    try {
      await window.electronAPI.uninstallApk(deviceId, pkg);
      setStatus("Uninstalled");
      onActionComplete();
    } catch (err: any) {
      setStatus("Uninstall failed");
    }
  }

  async function launchApk() {
    if (!deviceId) {
      setStatus("No device selected");
      return;
    }

    if (!pkg) {
      setStatus("Invalid package name");
      return;
    }

    setStatus("Launching...");

    try {
      await window.electronAPI.launchApk(deviceId, pkg);
      setStatus("Launched");
    } catch (err: any) {
      setStatus("Launch failed");
    }
  }

  /* =======================
     Render
  ======================= */

  return (
    <div className="border rounded p-4 bg-white shadow space-y-2 text-sm">
      <div className="font-semibold text-base">{pkg}</div>

      <div className="text-gray-700 break-all">
        <span className="font-medium">APK Path:</span> {apk.path}
      </div>

      {apk.meta.versionName && (
        <div className="text-gray-700">Version: {apk.meta.versionName}</div>
      )}

      {apk.meta.versionCode !== undefined && (
        <div className="text-gray-700">
          Version Code: {apk.meta.versionCode}
        </div>
      )}

      {/* =======================
          Install State
      ======================= */}
      {installState === "INSTALLED" && (
        <div className="text-green-700 font-medium">Installed</div>
      )}

      {installState === "UPGRADE_AVAILABLE" && (
        <div className="text-yellow-700 font-medium">Upgrade Available</div>
      )}

      {installState === "NOT_INSTALLED" && (
        <div className="text-red-700 font-medium">Not Installed</div>
      )}

      {/* =======================
          Action Buttons
      ======================= */}
      <div className="flex gap-2 pt-2">
        {(installState === "NOT_INSTALLED" ||
          installState === "UPGRADE_AVAILABLE") && (
          <button
            onClick={installApk}
            className="px-2 py-1 bg-green-600 text-white rounded"
          >
            {installState === "UPGRADE_AVAILABLE" ? "Upgrade" : "Install"}
          </button>
        )}

        {installState === "INSTALLED" && (
          <>
            <button
              onClick={launchApk}
              className="px-2 py-1 bg-blue-600 text-white rounded"
            >
              Launch
            </button>

            <button
              onClick={uninstallApk}
              className="px-2 py-1 bg-red-600 text-white rounded"
            >
              Uninstall
            </button>
          </>
        )}
      </div>

      {/* =======================
          Status
      ======================= */}
      {status && <div className="text-gray-800 text-xs mt-2">{status}</div>}
    </div>
  );
}
