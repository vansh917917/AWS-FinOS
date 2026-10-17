import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-navy-deep py-12 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1">
            <Link href="/" className="flex items-center space-x-2.5 group w-fit">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-600 text-white shadow-sm shadow-sky-600/30 transition-transform duration-200 group-hover:scale-105">
                <ShieldCheck className="h-4 w-4 transition-transform duration-200 group-hover:rotate-3" />
              </div>
              <span className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                FinOS
              </span>
            </Link>
            <p className="text-xs text-slate-400">
              Personal Finance Operating System &bull; Cash flow intelligence and clarity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300">
            <a href="#capabilities" className="hover:text-white transition-colors duration-150">
              Capabilities
            </a>
            <a href="#intelligence" className="hover:text-white transition-colors duration-150">
              Intelligence
            </a>
            <a href="#privacy" className="hover:text-white transition-colors duration-150">
              Privacy
            </a>
            <Link href="/login" className="hover:text-white transition-colors duration-150">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="font-semibold text-sky-400 hover:text-sky-300 transition-colors duration-150 hover:underline"
            >
              Get Started
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <span>&copy; {new Date().getFullYear()} FinOS. All rights reserved.</span>
          <span>Your financial records stay private and isolated to your account.</span>
        </div>
      </div>
    </footer>
  );
}
