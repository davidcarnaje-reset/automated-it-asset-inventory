"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Computer, normalizeComputer, getMockComputers } from "@/app/lib/api";

interface DeviceDetailClientProps {
  id: string;
}

export default function DeviceDetailClient({ id }: DeviceDetailClientProps) {
  const [computer, setComputer] = useState<Computer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadDetail() {
      const endpoints = [
        `http://localhost:5067/api/computers/${id}`,
        `http://localhost:5067/api/inventory/${id}`,
      ];

      for (const url of endpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);

          const res = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            if (data && active) {
              setComputer(normalizeComputer(data));
              setIsLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn(`Failed to connect to ${url}:`, e);
        }
      }

      // Set computer to null if details fetch fails
      if (active) {
        setComputer(null);
        setIsLoading(false);
      }
    }

    loadDetail();
    return () => {
      active = false;
    };
  }, [id]);

  // Helper to check if a computer is online (last seen within 5 minutes)
  const checkIsOnline = (lastSeenStr: string) => {
    try {
      const lastSeen = new Date(lastSeenStr);
      const diffMs = new Date().getTime() - lastSeen.getTime();
      return diffMs / (1000 * 60) < 5 && diffMs >= 0;
    } catch {
      return false;
    }
  };

  // Premium loading state (skeleton pulsing layout)
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Back link skeleton */}
        <div className="h-4 w-28 bg-slate-900/40 rounded-lg"></div>
        {/* Header card skeleton */}
        <div className="h-36 bg-slate-900/20 rounded-2xl border border-slate-900/80"></div>
        {/* Specs and Peripherals grid skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-96 bg-slate-900/20 rounded-2xl border border-slate-900/80"></div>
          <div className="h-96 bg-slate-900/20 rounded-2xl border border-slate-900/80"></div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!computer) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:-translate-x-1 transition-transform"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Directory
        </Link>

        <div className="rounded-2xl border border-slate-900 bg-slate-950 p-12 text-center text-slate-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto text-slate-700 mb-4"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h3 className="text-lg font-bold text-white mb-1">Device Not Found</h3>
          <p className="text-sm text-slate-500">The device ID "{id}" was not registered in the database inventory.</p>
        </div>
      </div>
    );
  }

  const online = checkIsOnline(computer.lastSeen);

  return (
    <div className="space-y-6">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:-translate-x-1 transition-transform"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Directory
        </Link>
      </div>

      {/* Main Asset Header Card */}
      <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 md:p-8 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {computer.hostname}
                </h2>
                {online ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-400 border border-slate-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-600"></span>
                    Offline
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-400">
                Primary Operator: <span className="font-semibold text-slate-200">{computer.activeUser}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-3 md:flex md:items-center md:gap-8 border-t border-slate-900 pt-4 md:border-none md:pt-0">
            <div className="space-y-1">
              <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-500">IP Address</span>
              <span className="font-mono text-sm text-slate-200">{computer.ipAddress}</span>
            </div>
            <div className="space-y-1">
              <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-500">MAC Address</span>
              <span className="font-mono text-sm text-slate-200">{computer.macAddress}</span>
            </div>
            <div className="space-y-1">
              <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-500">Serial Number</span>
              <span className="font-mono text-sm text-slate-200">{computer.serialNumber}</span>
            </div>
            <div className="space-y-1 col-span-2 md:col-span-1">
              <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-500">OS Build</span>
              <span className="text-sm text-slate-200">{computer.osVersion}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specification Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Core Hardware Specs Card */}
        <div className="rounded-2xl border border-slate-900 bg-slate-950 p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <rect x="9" y="9" width="6" height="6" />
                <line x1="9" y1="1" x2="9" y2="4" />
                <line x1="15" y1="1" x2="15" y2="4" />
                <line x1="9" y1="20" x2="9" y2="23" />
                <line x1="15" y1="20" x2="15" y2="23" />
                <line x1="20" y1="9" x2="23" y2="9" />
                <line x1="20" y1="15" x2="23" y2="15" />
                <line x1="1" y1="9" x2="4" y2="9" />
                <line x1="1" y1="15" x2="4" y2="15" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white">Core Hardware Specs</h3>
          </div>

          <div className="space-y-4">
            {/* CPU Spec Block */}
            <div className="flex gap-4 p-4.5 rounded-xl bg-slate-900/30 border border-slate-900 hover:border-slate-800 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M7 21h10" />
                  <path d="M12 3v18" />
                  <path d="M3 12h18" />
                </svg>
              </div>
              <div className="space-y-1">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Processor (CPU)</span>
                <span className="block text-sm font-semibold text-white leading-relaxed">{computer.hardwareSpecs.cpu}</span>
              </div>
            </div>

            {/* RAM Spec Block */}
            <div className="flex gap-4 p-4.5 rounded-xl bg-slate-900/30 border border-slate-900 hover:border-slate-800 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="6" y1="5" x2="6" y2="9" />
                  <line x1="10" y1="5" x2="10" y2="9" />
                  <line x1="14" y1="5" x2="14" y2="9" />
                  <line x1="18" y1="5" x2="18" y2="9" />
                </svg>
              </div>
              <div className="space-y-1">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">System Memory (RAM)</span>
                <span className="block text-sm font-semibold text-white leading-relaxed">{computer.hardwareSpecs.ram}</span>
              </div>
            </div>

            {/* Storage Spec Block */}
            <div className="flex gap-4 p-4.5 rounded-xl bg-slate-900/30 border border-slate-900 hover:border-slate-800 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10 text-pink-400 shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="2" />
                  <ellipse cx="12" cy="7" rx="3" ry="2" />
                  <ellipse cx="12" cy="14" rx="3" ry="2" />
                  <line x1="7" y1="7" x2="9" y2="7" />
                  <line x1="7" y1="14" x2="9" y2="14" />
                </svg>
              </div>
              <div className="space-y-1">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Disk Storage</span>
                <span className="block text-sm font-semibold text-white leading-relaxed">{computer.hardwareSpecs.storage}</span>
              </div>
            </div>

            {/* GPU Spec Block (Optional) */}
            {computer.hardwareSpecs.gpu && (
              <div className="flex gap-4 p-4.5 rounded-xl bg-slate-900/30 border border-slate-900 hover:border-slate-800 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 10h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8Z" />
                    <rect x="2" y="4" width="20" height="6" rx="1" />
                    <line x1="6" y1="14" x2="6.01" y2="14" />
                    <line x1="10" y1="14" x2="10.01" y2="14" />
                    <line x1="14" y1="14" x2="14.01" y2="14" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Graphics Card (GPU)</span>
                  <span className="block text-sm font-semibold text-white leading-relaxed">{computer.hardwareSpecs.gpu}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Connected Peripherals Card */}
        <div className="rounded-2xl border border-slate-900 bg-slate-950 p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="M4 12H2" />
                <path d="M22 12h-2" />
                <path d="m19.07 4.93-1.41 1.41" />
                <path d="m7.76 16.24-1.41 1.41" />
                <path d="m5.18 4.93 1.41 1.41" />
                <path d="m16.24 16.24 1.41 1.41" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white">Connected Peripherals</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Monitor Peripheral */}
            <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-900 space-y-2.5">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-500"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monitors</h4>
              </div>
              <ul className="space-y-1.5">
                {computer.peripherals.monitors.length === 0 ? (
                  <li className="text-xs text-slate-600 italic">None detected</li>
                ) : (
                  computer.peripherals.monitors.map((mon, index) => (
                    <li key={index} className="text-sm text-slate-200 font-semibold leading-relaxed border-l-2 border-indigo-500/40 pl-2">
                      {mon}
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* Keyboard Peripheral */}
            <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-900 space-y-2.5">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-500"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
                  <line x1="6" y1="8" x2="6.01" y2="8" />
                  <line x1="10" y1="8" x2="10.01" y2="8" />
                  <line x1="14" y1="8" x2="14.01" y2="8" />
                  <line x1="18" y1="8" x2="18.01" y2="8" />
                  <line x1="6" y1="12" x2="6.01" y2="12" />
                  <line x1="10" y1="12" x2="10.01" y2="12" />
                  <line x1="14" y1="12" x2="14.01" y2="12" />
                  <line x1="18" y1="12" x2="18.01" y2="12" />
                  <line x1="7" y1="16" x2="17" y2="16" />
                </svg>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Keyboards</h4>
              </div>
              <ul className="space-y-1.5">
                {computer.peripherals.keyboards.length === 0 ? (
                  <li className="text-xs text-slate-600 italic">None detected</li>
                ) : (
                  computer.peripherals.keyboards.map((kb, index) => (
                    <li key={index} className="text-sm text-slate-200 font-semibold leading-relaxed border-l-2 border-indigo-500/40 pl-2">
                      {kb}
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* Mouse Peripheral */}
            <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-900 space-y-2.5">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-500"
                >
                  <rect x="5" y="2" width="14" height="20" rx="7" />
                  <line x1="12" y1="2" x2="12" y2="10" />
                  <line x1="5" y1="10" x2="19" y2="10" />
                </svg>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mice</h4>
              </div>
              <ul className="space-y-1.5">
                {computer.peripherals.mice.length === 0 ? (
                  <li className="text-xs text-slate-600 italic">None detected</li>
                ) : (
                  computer.peripherals.mice.map((m, index) => (
                    <li key={index} className="text-sm text-slate-200 font-semibold leading-relaxed border-l-2 border-indigo-500/40 pl-2">
                      {m}
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* Webcam Peripheral */}
            <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-900 space-y-2.5">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-500"
                >
                  <path d="M12 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                  <path d="M12 14c-4 0-7 2-7 6v2h14v-2c0-4-3-6-7-6Z" />
                  <circle cx="12" cy="6" r="1" />
                </svg>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Webcams</h4>
              </div>
              <ul className="space-y-1.5">
                {computer.peripherals.webcams.length === 0 ? (
                  <li className="text-xs text-slate-600 italic">None detected</li>
                ) : (
                  computer.peripherals.webcams.map((web, index) => (
                    <li key={index} className="text-sm text-slate-200 font-semibold leading-relaxed border-l-2 border-indigo-500/40 pl-2">
                      {web}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Detail Footer Stats */}
      <div className="flex justify-between items-center text-xs text-slate-500 px-2 pt-2 border-t border-slate-900">
        <div>
          Device ID: <span className="font-mono text-slate-400">{computer.id}</span>
        </div>
        <div>
          Last Scanned: <span className="font-mono text-slate-400">{new Date(computer.lastSeen).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
