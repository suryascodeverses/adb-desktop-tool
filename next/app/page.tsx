"use client";

import { useEffect, useState } from "react";
import { LogcatLine } from "@adb/shared";

export default function Page() {
  const [lines, setLines] = useState<LogcatLine[]>([]);

  useEffect(() => {
    window.electronAPI.logcat.start({});

    window.electronAPI.logcat.onLine(({ line }) => {
      setLines((prev) => [...prev.slice(-500), line]);
    });

    return () => {
      window.electronAPI.logcat.stop();
    };
  }, []);
  useEffect(() => {
    (window.electronAPI as unknown as any).ping().then(console.log).catch(console.error);
  }, []);

  return (
    <main style={{ padding: 12 }}>
      <h3>Logcat</h3>
      <pre style={{ fontSize: 12 }}>
        {lines.map((l, i) => (
          <div key={i}>
            [{l.level}] {l.tag ?? "—"}: {l.message}
          </div>
        ))}
      </pre>
    </main>
  );
}
