
import type { ReactNode } from "react";
import StudioNav from "@/components/studio-nav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <StudioNav>{children}</StudioNav>;
}
