"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ShieldCheck,
  Percent,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Info,
} from "lucide-react";

interface MonthData {
  month: string;
  inflow: number;
  outflow: number;
  inflowStr: string;
  outflowStr: string;
  netStr: string;
  x: number;
}

const MONTH_DATA: MonthData[] = [
  { month: "May", inflow: 80, outflow: 65, inflowStr: "₹52,000", outflowStr: "₹42,500", netStr: "+₹9,500", x: 45 },
  { month: "Jun", inflow: 85, outflow: 70, inflowStr: "₹55,000", outflowStr: "₹45,200", netStr: "+₹9,800", x: 120 },
  { month: "Jul", inflow: 95, outflow: 60, inflowStr: "₹61,000", outflowStr: "₹39,000", netStr: "+₹22,000", x: 195 },
  { month: "Aug", inflow: 90, outflow: 75, inflowStr: "₹57,500", outflowStr: "₹48,100", netStr: "+₹9,400", x: 270 },
  { month: "Sep", inflow: 100, outflow: 72, inflowStr: "₹58,400", outflowStr: "₹41,250", netStr: "+₹17,150", x: 345 },
];

const CATEGORIES = [
  { id: "housing", name: "Housing & Rent", amount: "₹14,437", percent: 35, colorClass: "bg-sky-500", textClass: "text-sky-600" },
  { id: "dining", name: "Food & Dining", amount: "₹9,900", percent: 24, colorClass: "bg-indigo-500", textClass: "text-indigo-600" },
  { id: "transport", name: "Transportation", amount: "₹6,600", percent: 16, colorClass: "bg-amber-500", textClass: "text-amber-600" },
  { id: "utilities", name: "Utilities", amount: "₹5,775", percent: 14, colorClass: "bg-rose-500", textClass: "text-rose-600" },
  { id: "other", name: "Other Expenses", amount: "₹4,538", percent: 11, colorClass: "bg-emerald-500", textClass: "text-emerald-600" },
];

export default function ProductPreview() {
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number>(4); // Default to Sep
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [activeMetric, setActiveMetric] = useState<string | null>(null);

  const activeMonth = MONTH_DATA[hoveredMonthIndex];

  return (
    <div className="rounded-2xl border border-slate-700/70 bg-white shadow-2xl shadow-black/40 overflow-hidden transition-all duration-300">
      {/* Simulated SaaS App Chrome Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100/90 px-4 py-2.5 select-none">
        <div className="flex items-center space-x-2">
          <span className="h-3 w-3 rounded-full bg-rose-400/80 inline-block transition-transform hover:scale-110 cursor-pointer"></span>
          <span className="h-3 w-3 rounded-full bg-amber-400/80 inline-block transition-transform hover:scale-110 cursor-pointer"></span>
          <span className="h-3 w-3 rounded-full bg-emerald-400/80 inline-block transition-transform hover:scale-110 cursor-pointer"></span>
        </div>
        <div className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-sky-600" />
          <span>FinOS &bull; Personal Financial Operating System</span>
        </div>
        <div className="text-[10px] text-slate-500 font-medium hidden sm:flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>FinOS Dashboard</span>
        </div>
      </div>

      {/* Dashboard Surface */}
      <div className="p-4 sm:p-6 lg:p-8 bg-slate-50/50 space-y-6">
        {/* Top Dashboard Header & Period selector */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm transition-all duration-200 hover:border-slate-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold text-sky-700 uppercase tracking-wider mb-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                Product Preview
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Financial Overview
              </h2>
              <p className="text-xs text-slate-500">
                Hover over the chart bars, category breakdown, or metric cards to inspect details.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                This Month
              </span>
              <span className="rounded-lg bg-sky-600 text-white px-2.5 py-1 text-xs font-semibold shadow-2xs">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* 4 Overview Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Income */}
          <div
            onMouseEnter={() => setActiveMetric("income")}
            onMouseLeave={() => setActiveMetric(null)}
            className={`rounded-xl border bg-white p-3.5 sm:p-4 shadow-sm transition-all duration-200 cursor-pointer ${
              activeMetric === "income"
                ? "border-emerald-300 shadow-md -translate-y-1 bg-emerald-50/20"
                : "border-slate-200 hover:border-slate-300 hover:-translate-y-0.5"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Total Income
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-transform duration-200 hover:scale-110">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 text-base sm:text-xl font-bold text-slate-900 font-mono">
              ₹58,400
            </div>
            <p className="text-[10px] sm:text-[11px] text-emerald-600 font-medium mt-1">
              +12.4% vs last month
            </p>
          </div>

          {/* Expenses */}
          <div
            onMouseEnter={() => setActiveMetric("expense")}
            onMouseLeave={() => setActiveMetric(null)}
            className={`rounded-xl border bg-white p-3.5 sm:p-4 shadow-sm transition-all duration-200 cursor-pointer ${
              activeMetric === "expense"
                ? "border-rose-300 shadow-md -translate-y-1 bg-rose-50/20"
                : "border-slate-200 hover:border-slate-300 hover:-translate-y-0.5"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Total Outflow
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition-transform duration-200 hover:scale-110">
                <TrendingDown className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 text-base sm:text-xl font-bold text-slate-900 font-mono">
              ₹41,250
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1">
              38 recorded expenses
            </p>
          </div>

          {/* Net Cash Flow */}
          <div
            onMouseEnter={() => setActiveMetric("net")}
            onMouseLeave={() => setActiveMetric(null)}
            className={`rounded-xl border bg-white p-3.5 sm:p-4 shadow-sm transition-all duration-200 cursor-pointer ${
              activeMetric === "net"
                ? "border-emerald-300 shadow-md -translate-y-1 bg-emerald-50/20"
                : "border-slate-200 hover:border-slate-300 hover:-translate-y-0.5"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Net Cash Flow
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-transform duration-200 hover:scale-110">
                <Wallet className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 text-base sm:text-xl font-bold text-emerald-600 font-mono">
              +₹17,150
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1">
              Surplus (Income &gt; Outflow)
            </p>
          </div>

          {/* Savings Rate */}
          <div
            onMouseEnter={() => setActiveMetric("savings")}
            onMouseLeave={() => setActiveMetric(null)}
            className={`rounded-xl border bg-white p-3.5 sm:p-4 shadow-sm transition-all duration-200 cursor-pointer ${
              activeMetric === "savings"
                ? "border-sky-300 shadow-md -translate-y-1 bg-sky-50/20"
                : "border-slate-200 hover:border-slate-300 hover:-translate-y-0.5"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Savings Rate
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600 transition-transform duration-200 hover:scale-110">
                <Percent className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 text-base sm:text-xl font-bold text-slate-900 font-mono">
              29.4%
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1">
              Target goal: 25.0%
            </p>
          </div>
        </div>

        {/* Cash Flow Trend Chart + Category Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Trend Chart with Interactive Tooltips (7 cols) */}
          <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Cash Flow Trend
                  </h3>
                  <p className="text-[11px] text-slate-500">Monthly Inflow vs Outflow</p>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 font-medium text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Inflow
                  </span>
                  <span className="flex items-center gap-1 font-medium text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-rose-500"></span> Outflow
                  </span>
                </div>
              </div>

              {/* Dynamic Month Inspector Strip */}
              <div className="rounded-lg bg-slate-50/80 border border-slate-100 px-3 py-1.5 flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">
                  {activeMonth.month} 2026 Details:
                </span>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-emerald-600 font-semibold">In: {activeMonth.inflowStr}</span>
                  <span className="text-rose-600 font-semibold">Out: {activeMonth.outflowStr}</span>
                  <span className="text-slate-800 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    Net: {activeMonth.netStr}
                  </span>
                </div>
              </div>

              {/* Interactive SVG Cash Flow Bar Chart */}
              <div className="h-40 w-full pt-1">
                <svg viewBox="0 0 400 130" className="w-full h-full overflow-visible">
                  {/* Horizontal Gridlines */}
                  <line x1="10" y1="10" x2="390" y2="10" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="10" y1="60" x2="390" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="10" y1="110" x2="390" y2="110" stroke="#e2e8f0" strokeWidth="1" />

                  {/* 5-month columns */}
                  {MONTH_DATA.map((b, i) => {
                    const isHovered = hoveredMonthIndex === i;
                    return (
                      <g
                        key={i}
                        className="cursor-pointer transition-all duration-200"
                        onMouseEnter={() => setHoveredMonthIndex(i)}
                      >
                        {/* Hover Column Backing */}
                        <rect
                          x={b.x - 22}
                          y="10"
                          width="44"
                          height="100"
                          rx="6"
                          fill={isHovered ? "#f1f5f9" : "transparent"}
                          className="transition-colors duration-150"
                        />

                        {/* Income bar */}
                        <rect
                          x={b.x - 14}
                          y={110 - b.inflow}
                          width="12"
                          height={b.inflow}
                          rx="3"
                          fill="#10b981"
                          className="transition-all duration-200"
                          opacity={isHovered ? 1 : 0.85}
                        />

                        {/* Expense bar */}
                        <rect
                          x={b.x}
                          y={110 - b.outflow}
                          width="12"
                          height={b.outflow}
                          rx="3"
                          fill="#f43f5e"
                          className="transition-all duration-200"
                          opacity={isHovered ? 1 : 0.85}
                        />

                        {/* Month text label */}
                        <text
                          x={b.x - 1}
                          y="125"
                          textAnchor="middle"
                          fontSize="10"
                          fill={isHovered ? "#0f172a" : "#64748b"}
                          fontWeight={isHovered ? "700" : "500"}
                          className="transition-colors duration-150"
                        >
                          {b.month}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Info className="h-3 w-3 text-slate-400" />
                Hover a bar to inspect monthly surplus
              </span>
              <span className="font-mono text-emerald-600 font-medium">5-Month Inflow Advantage</span>
            </div>
          </div>

          {/* Category Distribution & Budget status (5 cols) */}
          <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Spending by Category
                </h3>
                <span className="text-[11px] font-mono font-bold text-slate-800">
                  ₹41,250
                </span>
              </div>

              {/* Stacked colored progress bar with interactive segment highlighting */}
              <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex mb-4 p-0.5 gap-0.5">
                {CATEGORIES.map((cat) => {
                  const isHovered = hoveredCategory === cat.id;
                  const hasActive = hoveredCategory !== null;
                  return (
                    <div
                      key={cat.id}
                      onMouseEnter={() => setHoveredCategory(cat.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      style={{ width: `${cat.percent}%` }}
                      className={`${cat.colorClass} h-full rounded-xs transition-all duration-200 cursor-pointer ${
                        hasActive && !isHovered ? "opacity-35 scale-y-90" : "opacity-100 scale-y-100 shadow-xs"
                      }`}
                      title={`${cat.name}: ${cat.percent}% (${cat.amount})`}
                    />
                  );
                })}
              </div>

              {/* Category list items with hover connection */}
              <div className="space-y-1.5 text-xs">
                {CATEGORIES.slice(0, 3).map((cat) => {
                  const isHovered = hoveredCategory === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onMouseEnter={() => setHoveredCategory(cat.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      className={`flex items-center justify-between py-1 px-2 rounded-lg transition-all duration-150 cursor-pointer ${
                        isHovered ? "bg-slate-100 text-slate-900 font-medium" : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${cat.colorClass} transition-transform ${isHovered ? "scale-125" : ""}`}></span>
                        {cat.name}
                      </span>
                      <span className="font-mono font-semibold text-slate-800">
                        {cat.amount} ({cat.percent}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mini Budget Utilization Box */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="font-medium text-slate-600">Overall Budget: ₹45,000</span>
                <span className="font-bold text-emerald-600">76% Utilized &bull; On Track</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  style={{ width: "76%" }}
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Ledger Transactions Snippet */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recent Transactions
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Recent Activity</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2.5 px-2 -mx-2 rounded-lg flex items-center justify-between transition-colors duration-150 hover:bg-slate-50/80 cursor-default">
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-transform duration-150 hover:scale-110">
                  <ArrowDownRight className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Direct Deposit &bull; Monthly Salary</p>
                  <span className="text-[10px] text-slate-400">Income &bull; Sep 01, 2026</span>
                </div>
              </div>
              <span className="font-mono font-bold text-emerald-600">+₹58,400</span>
            </div>

            <div className="py-2.5 px-2 -mx-2 rounded-lg flex items-center justify-between transition-colors duration-150 hover:bg-slate-50/80 cursor-default">
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-50 text-rose-600 transition-transform duration-150 hover:scale-110">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Fresh Foods Supermarket</p>
                  <span className="text-[10px] text-slate-400">Food &amp; Dining &bull; Sep 04, 2026</span>
                </div>
              </div>
              <span className="font-mono font-bold text-slate-900">-₹3,250</span>
            </div>

            <div className="py-2.5 px-2 -mx-2 rounded-lg flex items-center justify-between transition-colors duration-150 hover:bg-slate-50/80 cursor-default">
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-50 text-rose-600 transition-transform duration-150 hover:scale-110">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Electric &amp; Water Utilities</p>
                  <span className="text-[10px] text-slate-400">Utilities &bull; Sep 07, 2026</span>
                </div>
              </div>
              <span className="font-mono font-bold text-slate-900">-₹1,840</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
