"use client";

import { AdbCommandCompletedEvent, AdbCommandOutputEvent } from "@adb/shared";
import { useEffect, useRef, useState } from "react";

export default function AdbConsolePage() {
  const [output, setOutput] = useState<string[]>([]);
  const [command, setCommand] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.electronAPI.adb.onOutput(
      ({ stream, data }: AdbCommandOutputEvent) => {
        setOutput((prev) => [...prev, `[${stream}] ${data}`]);
      }
    );

    window.electronAPI.adb.onCompleted(
      ({ exitCode }: AdbCommandCompletedEvent) => {
        setOutput((prev) => [...prev, `\n[exit ${exitCode}]\n`]);
      }
    );
  }, []);

  useEffect(() => {
    outputRef.current?.scrollTo(0, outputRef.current.scrollHeight);
  }, [output]);

  return (
    <div style={{ padding: 12, fontFamily: "monospace" }}>
      <div style={{ marginBottom: 8 }}>
        <input
          style={{ width: "80%" }}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="adb shell pm list packages"
        />
        <button
          onClick={() => {
            setOutput([]);
            window.electronAPI.adb.runCommand({
              command,
            });
          }}
        >
          Run
        </button>
      </div>

      <div
        ref={outputRef}
        style={{
          height: "85vh",
          overflow: "auto",
          background: "#000",
          color: "#0f0",
          padding: 8,
        }}
      >
        {output.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  );
}
