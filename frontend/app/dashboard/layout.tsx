"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getStoredToken, logoutUser } from "@/lib/auth";
import {
  ShieldCheck,
  LogOut,
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  BarChart3,
  User,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>("admin@finos.local");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const handleSignOut = async () => {
    await logoutUser();
    router.push("/login");
    router.refresh();
  };

  const navLinks = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard, exact: true },
    { name: "Transactions", href: "/dashboard/transactions", icon: ArrowLeftRight, exact: false },
    { name: "Planning", href: "/dashboard/planning", icon: Target, exact: false },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, exact: false },
  ];

  const isLinkActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-finos-bg flex flex-col">
      {/* Top Header (Solid Deep Navy Shell) */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-navy text-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="flex items-center space-x-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm shadow-sky-600/30 transition-transform duration-200 group-hover:scale-105">
                <ShieldCheck className="h-5 w-5 transition-transform duration-200 group-hover:rotate-3" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-sky-300 transition-colors">
                FinOS
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden sm:flex items-center space-x-1 pl-4 border-l border-slate-800">
              {navLinks.map((item) => {
                const active = isLinkActive(item.href, item.exact);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                      active
                        ? "bg-sky-500/15 border border-sky-400/30 text-sky-400 font-bold"
                        : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-3">
            {userEmail && (
              <div className="hidden md:flex items-center gap-2 text-xs text-slate-300 bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-medium truncate max-w-[180px]">{userEmail}</span>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-900/50 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area (Crisp Light Surfaces) */}
      <main className="flex-1 py-6 sm:py-8 pb-32 sm:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
      </main>

      {/* Mobile Bottom Navigation Bar (4 Core Hubs) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden border-t border-slate-800 bg-navy px-2 pt-2 pb-[max(env(safe-area-inset-bottom),0.625rem)] flex items-center justify-around shadow-xl text-slate-400">
        <Link
          href="/dashboard"
          className={`flex min-h-[44px] min-w-[56px] flex-col items-center justify-center gap-1 text-[11px] font-medium py-1 px-2.5 rounded-xl transition-all ${
            pathname === "/dashboard"
              ? "bg-sky-500/15 border border-sky-400/30 text-sky-400 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Overview</span>
        </Link>
        <Link
          href="/dashboard/transactions"
          className={`flex min-h-[44px] min-w-[56px] flex-col items-center justify-center gap-1 text-[11px] font-medium py-1 px-2.5 rounded-xl transition-all ${
            pathname?.startsWith("/dashboard/transactions")
              ? "bg-sky-500/15 border border-sky-400/30 text-sky-400 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ArrowLeftRight className="h-4 w-4" />
          <span>Transactions</span>
        </Link>
        <Link
          href="/dashboard/planning"
          className={`flex min-h-[44px] min-w-[56px] flex-col items-center justify-center gap-1 text-[11px] font-medium py-1 px-2.5 rounded-xl transition-all ${
            pathname?.startsWith("/dashboard/planning")
              ? "bg-sky-500/15 border border-sky-400/30 text-sky-400 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Target className="h-4 w-4" />
          <span>Planning</span>
        </Link>
        <Link
          href="/dashboard/analytics"
          className={`flex min-h-[44px] min-w-[56px] flex-col items-center justify-center gap-1 text-[11px] font-medium py-1 px-2.5 rounded-xl transition-all ${
            pathname?.startsWith("/dashboard/analytics")
              ? "bg-sky-500/15 border border-sky-400/30 text-sky-400 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Analytics</span>
        </Link>
      </nav>

      {/* Footer */}
      <footer className="hidden sm:block border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} FinOS - Personal Finance Operating System. All rights reserved.
      </footer>
    </div>
  );
}
