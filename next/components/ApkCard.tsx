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

  const getStatusColor = () => {
    switch (installState) {
      case "INSTALLED":
        return "bg-green-50 border-green-200 text-green-700";
      case "UPGRADE_AVAILABLE":
        return "bg-amber-50 border-amber-200 text-amber-700";
      case "NOT_INSTALLED":
        return "bg-slate-50 border-slate-200 text-slate-700";
    }
  };

  const getStatusIcon = () => {
    switch (installState) {
      case "INSTALLED":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "UPGRADE_AVAILABLE":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "NOT_INSTALLED":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const getStatusText = () => {
    switch (installState) {
      case "INSTALLED":
        return "Installed";
      case "UPGRADE_AVAILABLE":
        return "Update Available";
      case "NOT_INSTALLED":
        return "Not Installed";
    }
  };

  return (
    <div className="border border-slate-200 rounded-lg bg-white hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0"
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
              <h3 className="font-semibold text-slate-900 truncate">{pkg}</h3>
            </div>
            {apk.meta.versionName && (
              <p className="text-sm text-slate-500 ml-7">
                Version {apk.meta.versionName}
                {apk.meta.versionCode && ` (${apk.meta.versionCode})`}
              </p>
            )}
          </div>
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor()}`}
          >
            {getStatusIcon()}
            {getStatusText()}
          </div>
        </div>

        {/* Path */}
        <div className="mb-3 px-3 py-2 bg-slate-50 rounded border border-slate-200">
          <p className="text-xs text-slate-600 font-mono break-all">
            {apk.path}
          </p>
        </div>

        {/* Actions */}
        {installState === "INSTALLED" && (
          <div className="flex gap-2 flex-wrap">
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
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed text-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {actionInProgress === "forceStop" ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
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
                  Stopping...
                </>
              ) : (
                <>
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
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                    />
                  </svg>
                  Force Stop
                </>
              )}
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
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed text-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {actionInProgress === "clearData" ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
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
                  Clearing...
                </>
              ) : (
                <>
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Clear Data
                </>
              )}
            </button>

            <button
              disabled={!!actionInProgress}
              onClick={async () => {
                if (!confirm("Are you sure you want to uninstall this app?"))
                  return;
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
              className="px-4 py-2 bg-red-50 hover:bg-red-100 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed text-red-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {actionInProgress === "uninstall" ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
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
                  Uninstalling...
                </>
              ) : (
                <>
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Uninstall
                </>
              )}
            </button>
          </div>
        )}

        {/* Status Message */}
        {message && (
          <div
            className={`mt-3 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
              status === "ERROR"
                ? "bg-red-50 text-red-700 border border-red-200"
                : status === "SUCCESS"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-slate-50 text-slate-700 border border-slate-200"
            }`}
          >
            {status === "SUCCESS" && (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {status === "ERROR" && (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {message}
          </div>
        )}
      </div>
    </div>
  );
}