import React from "react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Sidebar - Desktop */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-slate-900 bg-slate-950/80 backdrop-blur-md md:flex">
        {/* Sidebar Header / Logo */}
        <div className="flex h-16 items-center px-6 border-b border-slate-900">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)] group-hover:scale-105 transition-transform duration-200">
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
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                <line x1="6" y1="6" x2="6.01" y2="6" />
                <line x1="6" y1="18" x2="6.01" y2="18" />
              </svg>
            </div>
            <span className="text-base font-semibold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
              IT Asset Inventory
            </span>
          </Link>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl bg-slate-900/60 border border-slate-800/50 text-indigo-400"
          >
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
              <rect x="3" y="3" width="7" height="9" />
              <rect x="14" y="3" width="7" height="5" />
              <rect x="14" y="12" width="7" height="9" />
              <rect x="3" y="16" width="7" height="5" />
            </svg>
            Devices
          </Link>

          <div className="pt-4 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            Operations
          </div>

          <span
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-slate-500 cursor-not-allowed group"
            title="Coming soon"
          >
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
              <path d="M5 12.55a11 11 0 0 1 14.08 0" />
              <path d="M1.42 9a16 16 0 0 1 21.16 0" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" />
            </svg>
            Network Scans
            <span className="ml-auto text-[10px] bg-slate-900 text-slate-600 border border-slate-800/80 px-2 py-0.5 rounded-full font-normal">
              Soon
            </span>
          </span>

          <span
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-slate-500 cursor-not-allowed group"
            title="Coming soon"
          >
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
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Alerts
            <span className="ml-auto text-[10px] bg-slate-900 text-slate-600 border border-slate-800/80 px-2 py-0.5 rounded-full font-normal">
              Soon
            </span>
          </span>

          <span
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-slate-500 cursor-not-allowed group"
            title="Coming soon"
          >
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
              <line x1="4" y1="9" x2="20" y2="9" />
              <line x1="4" y1="15" x2="20" y2="15" />
              <line x1="10" y1="3" x2="8" y2="21" />
              <line x1="16" y1="3" x2="14" y2="21" />
            </svg>
            Settings
          </span>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-900">
          <div className="flex items-center gap-3 rounded-xl bg-slate-900/40 p-3 border border-slate-900/60">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
              AD
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-semibold text-white truncate">IT Administrator</h4>
              <p className="text-[10px] text-slate-500 truncate">admin@company.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-900/80 bg-slate-950/70 px-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="md:hidden flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/15 border border-indigo-500/30 text-indigo-400">
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
                  <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                  <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-base font-semibold text-white tracking-tight">IT Asset Management</h1>
              <p className="hidden sm:block text-[11px] text-slate-500">Automated Network Inventory System</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* System Status Indicators */}
            <div className="flex items-center gap-2 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-400 font-medium hidden sm:inline">Discovery Daemon:</span>
              <span className="text-emerald-400 font-semibold">Active</span>
            </div>

            <div className="h-4 w-px bg-slate-900"></div>

            {/* Time Stamp */}
            <div className="hidden md:block text-xs text-slate-500">
              System Time: <span className="font-mono text-slate-400">2026-06-17</span>
            </div>
          </div>
        </header>

        {/* Page Children */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
