"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log non-user facing error details to console
    console.error("FinOS application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-finos-bg px-4 text-center">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 max-w-md shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 mb-4 border border-amber-100">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Something went wrong
        </h1>
        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
          We encountered an issue loading this view. Please try refreshing or return to your dashboard.
        </p>
        {error && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg text-left text-xs text-red-700 font-mono overflow-auto max-h-48 border border-red-200">
            <p className="font-bold">{error.name}: {error.message}</p>
            {error.digest && <p className="text-[10px] text-red-500 mt-1">Digest: {error.digest}</p>}
            {error.stack && <pre className="text-[10px] text-slate-600 mt-2 whitespace-pre-wrap">{error.stack}</pre>}
          </div>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-700 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-150"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-150"
          >
            <Home className="h-3.5 w-3.5" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
