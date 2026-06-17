import type { Metadata } from "next";
import DeviceDashboardClient from "./DeviceDashboardClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Devices Inventory | IT Asset Dashboard",
  description: "Real-time list of all computer devices, active network users, OS versions, and hardware specifications.",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          Devices Directory
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          List of tracked hostnames, network identifiers, and system states.
        </p>
      </div>

      <DeviceDashboardClient />
    </div>
  );
}
