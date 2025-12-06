"use client";

import React from "react";

export function LoadingState({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-slate-300">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-700 border-t-sky-500" aria-hidden />
      <p className="text-sm">{label ?? "Loading..."}</p>
    </div>
  );
}

export function ErrorState({ message, actionLabel, onRetry }: { message: string; actionLabel?: string; onRetry?: () => void; }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200">
      <p className="text-slate-200">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="text-xs font-medium text-sky-400 hover:text-sky-300"
        >
          {actionLabel ?? "Try again"}
        </button>
      ) : null}
    </div>
  );
}
