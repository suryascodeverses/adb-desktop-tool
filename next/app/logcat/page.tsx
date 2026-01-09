/* /next/app/logcat/page.tsx */

"use client";

import { useEffect, useState, useRef } from "react";
import { LogcatLine } from "@adb/shared";

export default function LogcatPage() {
  const [lines, setLines] = useState<LogcatLine[]>([]);
  const [paused, setPaused] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.electronAPI.logcat.onLine(({ line }) => {
      setLines((prev) => [...prev.slice(-500), line]);
    });
  }, []);

  useEffect(() => {
    if (autoScroll && outputRef.current) {
      outputRef.current.scrollTo(0, outputRef.current.scrollHeight);
    }
  }, [lines, autoScroll]);

  const handleStart = async () => {
    await window.electronAPI.logcat.start({});
    setIsRunning(true);
  };

  const handleStop = async () => {
    await window.electronAPI.logcat.stop();
    setIsRunning(false);
    setPaused(false);
  };

  const handleTogglePause = async () => {
    if (paused) {
      await window.electronAPI.logcat.resume();
    } else {
      await window.electronAPI.logcat.pause();
    }
    setPaused(!paused);
  };

  const handleClear = () => {
    setLines([]);
  };

  const handleExport = async () => {
    await window.electronAPI.logcat.export({ filePath: "logcat.txt" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Logcat Monitor</h1>
                <p className="text-sm text-slate-400">
                  Android system logs in real-time
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                  isRunning
                    ? paused
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-green-500/20 text-green-300 border border-green-500/30"
                    : "bg-slate-700 text-slate-400 border border-slate-600"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isRunning
                      ? paused
                        ? "bg-amber-400"
                        : "bg-green-400 animate-pulse"
                      : "bg-slate-500"
                  }`}
                ></div>
                {isRunning ? (paused ? "Paused" : "Running") : "Stopped"}
              </div>
              <div className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-xs font-semibold text-slate-300">
                {lines.length} lines
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleStart}
            disabled={isRunning}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
            Start
          </button>

          <button
            onClick={handleTogglePause}
            disabled={!isRunning}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
          >
            {paused ? (
              <>
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                Resume
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Pause
              </>
            )}
          </button>

          <button
            onClick={handleStop}
            disabled={!isRunning}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                clipRule="evenodd"
              />
            </svg>
            Stop
          </button>

          <div className="w-px h-8 bg-slate-700"></div>

          <button
            onClick={handleClear}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
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
            Clear
          </button>

          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export
          </button>

          <div className="ml-auto flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
              />
              Auto-scroll
            </label>
          </div>
        </div>
      </div>

      {/* Logs Output */}
      <div className="p-6">
        <div
          ref={outputRef}
          className="h-[calc(100vh-200px)] overflow-auto bg-black rounded-lg border border-slate-700 shadow-2xl font-mono text-sm"
          style={{ scrollBehavior: autoScroll ? "smooth" : "auto" }}
        >
          {lines.length === 0 ? (
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-slate-500 font-medium">No logs available</p>
                <p className="text-sm text-slate-600 mt-1">
                  Press "Start" to begin monitoring
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4">
              {lines.map((l, i) => (
                <div
                  key={i}
                  className="py-0.5 text-green-400 hover:bg-slate-900/50 px-2 -mx-2 rounded transition-colors"
                >
                  {l.raw}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}