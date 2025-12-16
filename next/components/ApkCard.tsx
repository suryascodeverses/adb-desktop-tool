"use client";

import React from "react";

export interface ApkMeta {
  path: string;
  packageName: string;
  versionName?: string;
  versionCode?: string;
  launchableActivity?: string;
}

export default function ApkCard({ meta }: { meta: ApkMeta }) {
  return (
    <div className="border rounded p-4 bg-white shadow space-y-1 text-sm">
      <div className="font-semibold text-base">{meta.packageName}</div>
      <div className="text-gray-700">Path: {meta.path}</div>

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
    </div>
  );
}
