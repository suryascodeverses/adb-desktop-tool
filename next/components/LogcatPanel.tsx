"use client";

import { useEffect, useState } from "react";
import { LogcatLine } from "@adb/shared";

export function LogcatPanel() {
  const [lines, setLines] = useState<LogcatLine[]>([]);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    window.electronAPI.logcat.start({});
    window.electronAPI.logcat.onLine(({ line }) => {
      setLines((p) => [...p.slice(-300), line]);
    });
  }, []);

  return (
    <section>
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

      <button
        onClick={() =>
          window.electronAPI.logcat.export({
            filePath: "logcat.txt",
          })
        }
      >
        Export
      </button>

      <pre>
        {lines.map((l, i) => (
          <div key={i}>{l.raw}</div>
        ))}
      </pre>
    </section>
  );
}
