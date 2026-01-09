/* /next/components/ApkCard.tsx */

"use client";

import React, { useState } from "react";
import { DeviceSnapshot } from "@adb/shared";

type ActionStatus = "IDLE" | "WORKING" | "SUCCESS" | "ERROR";
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
  onActionComplete: (snapshot: DeviceSnapshot) => void;
}

export default function ApkCard({
  apk,
  deviceId,
  installState,
  onActionComplete,
}: ApkCardProps) {
  const [status, setStatus] = useState<ActionStatus>("IDLE");
  const [message, setMessage] = useState("");

  const [actionInProgress, setActionInProgress] = useState<
    null | "forceStop" | "clearData" | "uninstall"
  >(null);

  const pkg = apk.meta.packageName;
  const busy = status === "WORKING";

  async function run(action: () => Promise<{ snapshot: DeviceSnapshot }>) {
    try {
      setStatus("WORKING");
      const res = await action();
      setStatus("SUCCESS");
      onActionComplete(res.snapshot);
      setMessage("Action successful");
    } catch (e: any) {
      setStatus("ERROR");
      setMessage(e?.message || "Action failed");
    } finally {
      setTimeout(() => {
        setStatus("IDLE");
        setMessage("");
      }, 1500);
    }
  }

  if (!pkg) return null;

  return (
    <div className="border rounded p-4 bg-white shadow space-y-2 text-sm">
      <div className="font-semibold text-base">{pkg}</div>
      <div className="text-gray-700 break-all">{apk.path}</div>

      {installState === "INSTALLED" && (
        <div className="text-green-700 font-medium">Installed</div>
      )}
      {installState === "UPGRADE_AVAILABLE" && (
        <div className="text-yellow-700 font-medium">Upgrade Available</div>
      )}
      {installState === "NOT_INSTALLED" && (
        <div className="text-red-700 font-medium">Not Installed</div>
      )}

      <div className="flex gap-2 pt-2 flex-wrap">
        {installState === "INSTALLED" && (
          <>
            <button
              disabled={!!actionInProgress}
              onClick={async () => {
                setActionInProgress("forceStop");

                try {
                  const res = await window.electronAPI.apk.forceStop({
                    deviceId,
                    packageName: apk.meta.packageName,
                  });

                  onActionComplete(res.snapshot);
                } finally {
                  setActionInProgress(null);
                }
              }}
            >
              {actionInProgress === "forceStop"
                ? "Force Stopping…"
                : "Force Stop"}
            </button>

            <button
              disabled={!!actionInProgress}
              onClick={async () => {
                setActionInProgress("clearData");

                try {
                  const res = await window.electronAPI.apk.clearData({
                    deviceId,
                    packageName: apk.meta.packageName,
                  });

                  onActionComplete(res.snapshot);
                } finally {
                  setActionInProgress(null);
                }
              }}
            >
              {actionInProgress === "clearData" ? "Clearing…" : "Clear Data"}
            </button>

            <button
              disabled={!!actionInProgress}
              onClick={async () => {
                if (!confirm("Uninstall this app?")) return;

                setActionInProgress("uninstall");

                try {
                  const res = await window.electronAPI.apk.uninstall({
                    deviceId,
                    packageName: apk.meta.packageName,
                  });

                  onActionComplete(res.snapshot);
                } finally {
                  setActionInProgress(null);
                }
              }}
            >
              {actionInProgress === "uninstall" ? "Uninstalling…" : "Uninstall"}
            </button>
          </>
        )}
      </div>

      {message && (
        <div
          className={`text-xs ${
            status === "ERROR"
              ? "text-red-700"
              : status === "SUCCESS"
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
