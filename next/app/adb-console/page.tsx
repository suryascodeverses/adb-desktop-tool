/* /next/app/adb-console/page.tsx */
"use client";

import { AdbCommandCompletedEvent, AdbCommandOutputEvent } from "@adb/shared";
import { useEffect, useRef, useState } from "react";

export default function AdbConsolePage() {
  const [output, setOutput] = useState<string[]>([]);
  const [command, setCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.electronAPI.adb.onOutput(
      ({ stream, data }: AdbCommandOutputEvent) => {
        setOutput((prev) => [...prev, `[${stream}] ${data}`]);
      }
    );

    window.electronAPI.adb.onCompleted(
      ({ exitCode }: AdbCommandCompletedEvent) => {
        setOutput((prev) => [...prev, `\n[exit ${exitCode}]\n`]);
        setIsRunning(false);
      }
    );
  }, []);

  useEffect(() => {
    outputRef.current?.scrollTo(0, outputRef.current.scrollHeight);
  }, [output]);

  const runCommand = () => {
    if (!command.trim() || isRunning) return;

    setIsRunning(true);
    setOutput((prev) => [...prev, `$ ${command}`, ""]);
    setCommandHistory((prev) => [...prev, command]);
    setHistoryIndex(-1);

    window.electronAPI.adb.runCommand({ command });
    setCommand("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      runCommand();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex =
          historyIndex === -1
            ? commandHistory.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCommand("");
        } else {
          setHistoryIndex(newIndex);
          setCommand(commandHistory[newIndex]);
        }
      }
    }
  };

  const clearOutput = () => {
    setOutput([]);
  };

  const quickCommands = [
    { label: "List Packages", cmd: "adb shell pm list packages" },
    { label: "List Devices", cmd: "adb devices" },
    {
      label: "Get Device Info",
      cmd: "adb shell getprop ro.build.version.release",
    },
    {
      label: "Screen Record",
      cmd: "adb shell screenrecord /sdcard/screen.mp4",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">ADB Console</h1>
                <p className="text-sm text-slate-400">
                  Execute ADB commands directly
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                  isRunning
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    : "bg-slate-700 text-slate-400 border border-slate-600"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isRunning ? "bg-blue-400 animate-pulse" : "bg-slate-500"
                  }`}
                ></div>
                {isRunning ? "Running" : "Ready"}
              </div>
              <div className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-xs font-semibold text-slate-300">
                {output.length} lines
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Commands */}
      <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700">
        <div className="flex items-center gap-2 mb-2">
          <svg
            className="w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Quick Commands
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickCommands.map((qc, idx) => (
            <button
              key={idx}
              onClick={() => setCommand(qc.cmd)}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg transition-colors border border-slate-600"
            >
              {qc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Command Input */}
      <div className="px-6 py-4 bg-slate-800/30 border-b border-slate-700">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400 font-mono text-sm">
              $
            </div>
            <input
              ref={inputRef}
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="adb shell pm list packages"
              disabled={isRunning}
              className="w-full pl-8 pr-4 py-3 bg-black border border-slate-700 rounded-lg text-green-400 placeholder-slate-600 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <button
            onClick={runCommand}
            disabled={!command.trim() || isRunning}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
          >
            {isRunning ? (
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
                Running
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
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
                Execute
              </>
            )}
          </button>
          <button
            onClick={clearOutput}
            className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            title="Clear output"
          >
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
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Press{" "}
          <kbd className="px-2 py-0.5 bg-slate-700 rounded border border-slate-600 font-mono">
            ↑
          </kbd>{" "}
          /
          <kbd className="px-2 py-0.5 bg-slate-700 rounded border border-slate-600 font-mono ml-1">
            ↓
          </kbd>{" "}
          to navigate history,
          <kbd className="px-2 py-0.5 bg-slate-700 rounded border border-slate-600 font-mono ml-1">
            Enter
          </kbd>{" "}
          to execute
        </p>
      </div>

      {/* Output Terminal */}
      <div className="p-6">
        <div
          ref={outputRef}
          className="h-[calc(100vh-340px)] overflow-auto bg-black rounded-lg border border-slate-700 shadow-2xl font-mono text-sm"
        >
          {output.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="w-16 h-16 text-slate-700 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-slate-500 font-medium">No output yet</p>
                <p className="text-sm text-slate-600 mt-1">
                  Enter a command to get started
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4">
              {output.map((line, i) => (
                <div
                  key={i}
                  className={`py-0.5 hover:bg-slate-900/50 px-2 -mx-2 rounded transition-colors ${
                    line.startsWith("$")
                      ? "text-blue-400 font-semibold"
                      : line.includes("[exit")
                      ? "text-yellow-400"
                      : line.includes("[stderr]")
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  {line || "\u00A0"}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}