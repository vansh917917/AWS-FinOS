"use client";

import { CategorySpendingItem, formatINR } from "@/lib/api";

interface CategorySpendingChartProps {
  items: CategorySpendingItem[];
  totalAmount: number;
  loading?: boolean;
}

const CATEGORY_COLORS = [
  "bg-sky-500",
  "bg-indigo-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-purple-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-blue-500",
  "bg-pink-500",
];

export default function CategorySpendingChart({
  items,
  totalAmount,
  loading = false,
}: CategorySpendingChartProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-5 w-48 bg-slate-200 rounded animate-pulse mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-slate-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!items || items.length === 0 || totalAmount <= 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Spending by Category
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Distribution of expenses across categories
        </p>
        <div className="flex flex-col items-center justify-center h-48 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
          <p className="text-xs text-slate-500 font-medium">
            No expenses recorded for this period.
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Add transactions to view category breakdowns.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Spending by Category
          </h3>
          <p className="text-xs text-slate-500">
            Total expenses:{" "}
            <span className="font-semibold text-slate-800">
              {formatINR(totalAmount)}
            </span>
          </p>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {items.length} {items.length === 1 ? "category" : "categories"}
        </span>
      </div>

      {/* Stacked Percentage Bar */}
      <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex mb-6">
        {items.map((cat, idx) => {
          const colorClass = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
          return (
            <div
              key={cat.category}
              style={{ width: `${cat.percentage}%` }}
              className={`${colorClass} transition-all duration-300`}
              title={`${cat.category}: ${cat.percentage}% (${formatINR(cat.amount)})`}
            />
          );
        })}
      </div>

      {/* Category List */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {items.map((cat, idx) => {
          const colorClass = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
          return (
            <div key={cat.category} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${colorClass}`} />
                  <span className="font-medium text-slate-800">
                    {cat.category}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    ({cat.transaction_count} tx)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 font-mono">
                    {formatINR(cat.amount)}
                  </span>
                  <span className="text-slate-500 font-medium w-12 text-right">
                    {cat.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${colorClass}`}
                  style={{ width: `${Math.min(100, cat.percentage)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
