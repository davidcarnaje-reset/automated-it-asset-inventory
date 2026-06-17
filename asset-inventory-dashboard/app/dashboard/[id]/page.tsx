import type { Metadata } from "next";
import { fetchComputerById } from "@/app/lib/api";
import DeviceDetailClient from "./DeviceDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

// Dynamically generate descriptive metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { computer } = await fetchComputerById(id);
  
  if (!computer) {
    return {
      title: "Device Not Found | IT Asset Dashboard",
    };
  }

  return {
    title: `${computer.hostname} Details | IT Asset Dashboard`,
    description: `Core hardware specifications (CPU, RAM, Storage, GPU) and active connected peripherals for ${computer.hostname}.`,
  };
}

export default async function DeviceDetailPage({ params }: PageProps) {
  const { id } = await params;

  return <DeviceDetailClient id={id} />;
}
