"use client";

import DashboardShell from "@/components/studio-nav";
import { ErrorState } from "@/components/async-state";

export default function ProductError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <DashboardShell>
      <ErrorState message={error.message || "Failed to load product."} onRetry={reset} />
    </DashboardShell>
  );
}
