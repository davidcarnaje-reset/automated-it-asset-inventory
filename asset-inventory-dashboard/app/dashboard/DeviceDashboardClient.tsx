"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Computer, normalizeComputer, getMockComputers } from "@/app/lib/api";

export default function DeviceDashboardClient() {
  const router = useRouter();
  const [computers, setComputers] = useState<Computer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "offline">("all");
  const [isPending, startTransition] = useTransition();

  // Load live data from local API server on mount
  useEffect(() => {
    let active = true;

    async function loadData() {
      const endpoints = [
        "http://localhost:5067/api/computers",
        "http://localhost:5067/api/inventory",
      ];

      let success = false;

      for (const url of endpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const res = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data) ? data : (data.items || data.data || []);
            if (Array.isArray(list)) {
              if (active) {
                setComputers(list.map(normalizeComputer));
                setError(null);
                setIsLoading(false);
                success = true;
                return;
              }
            }
          }
        } catch (e) {
          console.warn(`Failed to connect to ${url}:`, e);
        }
      }

      // If connection fails, set computers to an empty list and show error
      if (active && !success) {
        setComputers([]);
        setError("Could not reach server");
        setIsLoading(false);
      }
    }

    loadData();

    // Poll for live status updates every 10 seconds
    const intervalId = setInterval(loadData, 10000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  // Helper to determine if a computer is online (last seen within 5 minutes)
  const checkIsOnline = (lastSeenStr: string) => {
    try {
      const lastSeen = new Date(lastSeenStr);
      const diffMs = new Date().getTime() - lastSeen.getTime();
      const diffMins = diffMs / (1000 * 60);
      return diffMins < 5 && diffMs >= 0;
    } catch {
      return false;
    }
  };

  // Filter computers based on search query and status filter
  const filteredComputers = computers.filter((comp) => {
    const online = checkIsOnline(comp.lastSeen);
    
    // Status Filter
    if (statusFilter === "online" && !online) return false;
    if (statusFilter === "offline" && online) return false;

    // Search Query (filters by Hostname or Serial Number)
    const matchSearch =
      comp.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchSearch;
  });

  // Calculate Metrics
  const totalCount = computers.length;
  const onlineCount = computers.filter(c => checkIsOnline(c.lastSeen)).length;
  const offlineCount = totalCount - onlineCount;

  const handleRowClick = (id: string) => {
    startTransition(() => {
      router.push(`/dashboard/${id}`);
    });
  };

  // Premium loading state while fetching database contents
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-32 bg-slate-900/40 rounded-2xl border border-slate-900/80"></div>
          <div className="h-32 bg-slate-900/40 rounded-2xl border border-slate-900/80"></div>
          <div className="h-32 bg-slate-900/40 rounded-2xl border border-slate-900/80"></div>
        </div>

        {/* Action Header Skeleton */}
        <div className="h-16 bg-slate-900/40 rounded-2xl border border-slate-900/80"></div>

        {/* Table Skeleton */}
        <div className="rounded-2xl border border-slate-900/80 bg-slate-950 p-6 space-y-4">
          <div className="h-10 bg-slate-900/50 rounded-xl"></div>
          <div className="h-12 bg-slate-900/30 rounded-xl"></div>
          <div className="h-12 bg-slate-900/30 rounded-xl"></div>
          <div className="h-12 bg-slate-900/30 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-red-400 flex items-center gap-3 backdrop-blur-sm">
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
            className="text-red-400 shrink-0"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white">Connection Error</h4>
            <p className="text-xs text-red-300/80 mt-0.5">{error}. Retrying automatically...</p>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Metric: Total Devices */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-900 bg-slate-900/20 p-6 shadow-xl backdrop-blur-sm">
          <div className="absolute right-4 top-4 text-slate-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
              <line x1="6" y1="6" x2="6.01" y2="6" />
              <line x1="6" y1="18" x2="6.01" y2="18" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-400">Total Tracked Devices</p>
          <h3 className="mt-2 text-3xl font-bold text-white tracking-tight">{totalCount}</h3>
          <p className="mt-1 text-xs text-slate-500">Registered machines in database</p>
        </div>

        {/* Metric: Online Devices */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-900 bg-slate-900/20 p-6 shadow-xl backdrop-blur-sm">
          <div className="absolute right-4 top-4 text-emerald-950">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a10 10 0 1 0 10 10H12V2Z" />
              <path d="M12 2a10 10 0 0 1 10 10h-10V2Z" className="opacity-40" />
              <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-400">Online Devices</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-emerald-400 tracking-tight">{onlineCount}</h3>
            <span className="flex h-2 w-2 relative self-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Active within the last 5 minutes</p>
        </div>

        {/* Metric: Offline Devices */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-900 bg-slate-900/20 p-6 shadow-xl backdrop-blur-sm sm:col-span-2 lg:col-span-1">
          <div className="absolute right-4 top-4 text-slate-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-400">Offline Devices</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-300 tracking-tight">{offlineCount}</h3>
          <p className="mt-1 text-xs text-slate-500">Devices inactive or powered down</p>
        </div>
      </div>

      {/* Table Actions Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-900 bg-slate-950 p-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
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
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by hostname or serial number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none text-white transition-all placeholder:text-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex gap-1.5 p-1 bg-slate-900/60 border border-slate-800/80 rounded-xl">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === "all"
                ? "bg-slate-800 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setStatusFilter("online")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === "online"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Online ({onlineCount})
          </button>
          <button
            onClick={() => setStatusFilter("offline")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === "offline"
                ? "bg-slate-800 text-slate-300 shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Offline ({offlineCount})
          </button>
        </div>
      </div>

      {/* Main Asset Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-900 bg-slate-950 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-300">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-900/10 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th scope="col" className="px-6 py-4">Hostname</th>
                <th scope="col" className="px-6 py-4">IP Address</th>
                <th scope="col" className="px-6 py-4">Active User</th>
                <th scope="col" className="px-6 py-4">OS Version</th>
                <th scope="col" className="px-6 py-4">Serial Number</th>
                <th scope="col" className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {filteredComputers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="36"
                      height="36"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mx-auto text-slate-700 mb-3"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                    No devices match the active search or filters.
                  </td>
                </tr>
              ) : (
                filteredComputers.map((comp) => {
                  const online = checkIsOnline(comp.lastSeen);
                  return (
                    <tr
                      key={comp.id}
                      onClick={() => handleRowClick(comp.id)}
                      className={`group cursor-pointer hover:bg-slate-900/40 transition-colors ${
                        isPending ? "pointer-events-none opacity-60" : ""
                      }`}
                    >
                      <td className="px-6 py-4.5 font-semibold text-white group-hover:text-indigo-400 transition-colors">
                        <div className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-slate-500 group-hover:text-indigo-400 transition-colors"
                          >
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                            <line x1="8" y1="21" x2="16" y2="21" />
                            <line x1="12" y1="17" x2="12" y2="21" />
                          </svg>
                          {comp.hostname}
                        </div>
                      </td>
                      <td className="px-6 py-4.5 font-mono text-xs text-slate-300">
                        {comp.ipAddress}
                      </td>
                      <td className="px-6 py-4.5 text-slate-300">
                        {comp.activeUser}
                      </td>
                      <td className="px-6 py-4.5 text-slate-400">
                        {comp.osVersion}
                      </td>
                      <td className="px-6 py-4.5 font-mono text-xs text-slate-400">
                        {comp.serialNumber}
                      </td>
                      <td className="px-6 py-4.5">
                        {online ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Online
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-400 border border-slate-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-600"></span>
                            Offline
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="flex justify-between items-center text-xs text-slate-500 px-2">
        <div>
          Showing {filteredComputers.length} of {totalCount} devices
        </div>
        <div>
          Click on any row to view hardware specifications & peripherals.
        </div>
      </div>
    </div>
  );
}
