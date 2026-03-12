
import type { ReactNode } from "react";
import StudioNav from "@/components/studio-nav";

export default function StudioLayout({ children }: { children: ReactNode }) {
  return <StudioNav>{children}</StudioNav>;
}
