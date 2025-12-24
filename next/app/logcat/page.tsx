"use client";

import { useEffect, useState } from "react";
import { LogcatLine } from "@adb/shared";

export default function LogcatPage() {
  const [lines, setLines] = useState<LogcatLine[]>([]);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    window.electronAPI.logcat.onLine(({ line }) => {
      setLines((prev) => [...prev.slice(-500), line]);
    });
  }, []);

  return (
    <div style={{ padding: 12, fontFamily: "monospace" }}>
      {/* Controls */}
      <div style={{ marginBottom: 8 }}>
        <button onClick={() => window.electronAPI.logcat.start({})}>
          Start
        </button>

        <button
          onClick={() => {
            paused
              ? window.electronAPI.logcat.resume()
              : window.electronAPI.logcat.pause();
            setPaused(!paused);
          }}
        >
          {paused ? "Resume" : "Pause"}
        </button>

        <button onClick={() => setLines([])}>Clear</button>

        <button
          onClick={() =>
            window.electronAPI.logcat.export({ filePath: "logcat.txt" })
          }
        >
          Export
        </button>
      </div>

      {/* Logs */}
      <div
        style={{
          height: "85vh",
          overflow: "auto",
          background: "#000",
          color: "#0f0",
          padding: 8,
        }}
      >
        {lines.map((l, i) => (
          <div key={i}>{l.raw}</div>
        ))}
      </div>
    </div>
  );
}
