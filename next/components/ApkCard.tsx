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

type ActionStatus =
  | "IDLE"
  | "INSTALLING"
  | "UNINSTALLING"
  | "LAUNCHING"
  | "SUCCESS"
  | "ERROR";

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
  // const [status, setStatus] = useState<string>("");

  const [action, setAction] = useState<ActionStatus>("IDLE");
  const [message, setMessage] = useState<string>("");

  const pkg = apk.meta.packageName;

  /* =======================
     Actions
  ======================= */

  async function installApk() {
    if (!deviceId) {
      setMessage("No device selected");
      setAction("ERROR");
      return;
    }

    setAction("INSTALLING");
    setMessage(
      installState === "UPGRADE_AVAILABLE"
        ? "Upgrading APK..."
        : "Installing APK..."
    );

    try {
      await window.electronAPI.installApk(deviceId, apk.path);
      setAction("SUCCESS");
      setMessage("Install successful");
      onActionComplete();
      setTimeout(() => {
        setAction("IDLE");
        setMessage("");
      }, 2000);
    } catch (err: any) {
      setAction("ERROR");
      setMessage(err?.message || "Install failed");
    }
  }

  async function uninstallApk() {
    if (!deviceId || !pkg) {
      setAction("ERROR");
      setMessage("Invalid device or package");
      return;
    }

    setAction("UNINSTALLING");
    setMessage("Uninstalling APK...");

    try {
      await window.electronAPI.uninstallApk(deviceId, pkg);
      setAction("SUCCESS");
      setMessage("Uninstalled successfully");
      onActionComplete();

      setTimeout(() => {
        setAction("IDLE");
        setMessage("");
      }, 2000);
    } catch (err: any) {
      setAction("ERROR");
      setMessage(err?.message || "Uninstall failed");
    }
  }

  async function launchApk() {
    if (!deviceId || !pkg) {
      setAction("ERROR");
      setMessage("Invalid device or package");
      return;
    }

    setAction("LAUNCHING");
    setMessage("Launching app...");

    try {
      await window.electronAPI.launchApk(deviceId, pkg);
      setAction("SUCCESS");
      setMessage("App launched");

      setTimeout(() => {
        setAction("IDLE");
        setMessage("");
      }, 2000);
    } catch (err: any) {
      setAction("ERROR");
      setMessage(err?.message || "Launch failed");
    }
  }

  const busy = action !== "IDLE" && action !== "SUCCESS" && action !== "ERROR";

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
            disabled={busy}
            className="px-2 py-1 bg-green-600 text-white rounded"
          >
            {busy
              ? "Working..."
              : installState === "UPGRADE_AVAILABLE"
              ? "Upgrade"
              : "Install"}
          </button>
        )}

        {installState === "INSTALLED" && (
          <>
            <button
              onClick={launchApk}
              disabled={busy}
              className={`px-2 py-1 rounded text-white ${
                busy ? "bg-gray-400" : "bg-blue-600"
              }`}
            >
              Launch
            </button>

            <button
              onClick={uninstallApk}
              disabled={busy}
              className={`px-2 py-1 rounded text-white ${
                busy ? "bg-gray-400" : "bg-red-600"
              }`}
            >
              Uninstall
            </button>
          </>
        )}
      </div>

      {/* =======================
          Status
      ======================= */}
      {message && (
        <div
          className={`text-xs mt-2 ${
            action === "ERROR"
              ? "text-red-700"
              : action === "SUCCESS"
              ? "text-green-700"
              : "text-gray-700"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
