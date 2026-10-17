import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy px-4 text-center text-white relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-sky-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-indigo-600/15 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-md rounded-2xl border border-slate-800 bg-navy-surface p-8 shadow-2xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm shadow-sky-600/30 mb-6">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          404
        </h1>
        <h2 className="mt-2 text-lg font-bold text-slate-200 sm:text-xl">
          Page not found
        </h2>
        <p className="mt-2 text-xs text-slate-400 sm:text-sm leading-relaxed">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-700 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-150"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-150 group-hover:-translate-x-0.5" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
