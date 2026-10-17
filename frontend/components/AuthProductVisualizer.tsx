"use client";

import Link from "next/link";
import {
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Wallet,
  Percent,
  ArrowDownRight,
  ArrowUpRight,
  Lock,
} from "lucide-react";

interface AuthProductVisualizerProps {
  mode: "login" | "signup";
}

export default function AuthProductVisualizer({ mode }: AuthProductVisualizerProps) {
  const isLogin = mode === "login";

  return (
    <div className="relative flex flex-col justify-between overflow-hidden bg-navy p-6 sm:p-10 lg:p-12 text-white border-b md:border-b-0 md:border-r border-slate-800">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-sky-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-indigo-600/15 blur-3xl" />

      {/* Top: Branding Header */}
      <div className="relative z-10">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-md shadow-sky-600/20 transition-transform duration-200 group-hover:scale-105">
            <ShieldCheck className="h-5 w-5 transition-transform duration-200 group-hover:rotate-3" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white group-hover:text-sky-300 transition-colors">
            FinOS
          </span>
        </Link>

        <div className="mt-8 sm:mt-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400"></span>
            Personal Finance Operating System
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {isLogin ? "Your finances, understood." : "Take control of your finances."}
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed max-w-md">
            {isLogin
              ? "Track your spending, plan your goals, and understand your financial patterns with clarity."
              : "Build a clearer picture of your spending, goals, and financial progress in one unified view."}
          </p>
        </div>
      </div>

      {/* Middle: Compact Product Visualization (Desktop & Tablet) */}
      <div className="relative z-10 my-8 hidden md:block space-y-4">
        <div className="rounded-2xl border border-slate-800 bg-navy-surface/90 p-5 shadow-xl shadow-black/40 backdrop-blur-xs">
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold text-slate-200">Financial Overview</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">September 2026</span>
          </div>

          {/* 4 Metric Pills */}
          <div className="grid grid-cols-2 gap-2.5 pt-3">
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-2.5">
              <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                <span>Inflow</span>
                <TrendingUp className="h-3 w-3 text-emerald-400" />
              </div>
              <div className="mt-1 text-base font-bold font-mono text-white">₹58,400</div>
              <span className="text-[10px] text-emerald-400 font-medium">+12.4% vs last month</span>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-2.5">
              <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                <span>Outflow</span>
                <TrendingDown className="h-3 w-3 text-rose-400" />
              </div>
              <div className="mt-1 text-base font-bold font-mono text-white">₹41,250</div>
              <span className="text-[10px] text-slate-400">38 recorded expenses</span>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-2.5">
              <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                <span>Net Cash Flow</span>
                <Wallet className="h-3 w-3 text-emerald-400" />
              </div>
              <div className="mt-1 text-base font-bold font-mono text-emerald-400">+₹17,150</div>
              <span className="text-[10px] text-emerald-400/90 font-medium">Surplus</span>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-2.5">
              <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                <span>Savings Rate</span>
                <Percent className="h-3 w-3 text-sky-400" />
              </div>
              <div className="mt-1 text-base font-bold font-mono text-white">29.4%</div>
              <span className="text-[10px] text-slate-400">Target: 25.0%</span>
            </div>
          </div>

          {/* Mini Cash Flow Trend */}
          <div className="pt-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
              <span>Cash Flow Trend</span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[10px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> In
                </span>
                <span className="flex items-center gap-1 text-[10px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400"></span> Out
                </span>
              </div>
            </div>
            <div className="h-14 w-full">
              <svg viewBox="0 0 280 50" className="w-full h-full">
                <line x1="10" y1="45" x2="270" y2="45" stroke="#1e293b" strokeWidth="1" />
                {/* May */}
                <rect x="25" y="15" width="8" height="30" rx="2" fill="#10b981" opacity="0.85" />
                <rect x="35" y="22" width="8" height="23" rx="2" fill="#f43f5e" opacity="0.85" />
                {/* Jun */}
                <rect x="75" y="12" width="8" height="33" rx="2" fill="#10b981" opacity="0.85" />
                <rect x="85" y="20" width="8" height="25" rx="2" fill="#f43f5e" opacity="0.85" />
                {/* Jul */}
                <rect x="125" y="8" width="8" height="37" rx="2" fill="#10b981" opacity="0.85" />
                <rect x="135" y="24" width="8" height="21" rx="2" fill="#f43f5e" opacity="0.85" />
                {/* Aug */}
                <rect x="175" y="10" width="8" height="35" rx="2" fill="#10b981" opacity="0.85" />
                <rect x="185" y="18" width="8" height="27" rx="2" fill="#f43f5e" opacity="0.85" />
                {/* Sep */}
                <rect x="225" y="5" width="8" height="40" rx="2" fill="#10b981" />
                <rect x="235" y="19" width="8" height="26" rx="2" fill="#f43f5e" />
              </svg>
            </div>
          </div>

          {/* Recent Activity Snippet */}
          <div className="pt-3 border-t border-slate-800/80">
            <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 mb-2">
              Recent Activity
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between rounded-lg bg-slate-900/40 px-2.5 py-1.5">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="h-3 w-3 text-emerald-400" />
                  <span className="text-slate-300">Monthly Salary</span>
                </div>
                <span className="font-mono font-bold text-emerald-400">+₹58,400</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-900/40 px-2.5 py-1.5">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="h-3 w-3 text-rose-400" />
                  <span className="text-slate-300">Supermarket</span>
                </div>
                <span className="font-mono font-semibold text-slate-200">-₹3,250</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Privacy & Trust Bullet */}
      <div className="relative z-10 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-sky-400 shrink-0" />
          <span>Private financial workspace &bull; Your financial data stays isolated to your account</span>
        </div>
      </div>
    </div>
  );
}
