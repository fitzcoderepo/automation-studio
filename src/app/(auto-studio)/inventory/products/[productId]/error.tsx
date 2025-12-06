"use client";

import { ErrorState } from "@/components/async-state";

export default function ProductError({ error, reset }: { error: Error; reset: () => void }) {
  return <ErrorState message={error.message || "Failed to load product."} onRetry={reset} />;
}
