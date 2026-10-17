"use client";

import { CashFlowSummary, formatINR } from "@/lib/api";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Scale } from "lucide-react";

interface CashFlowSummaryCardsProps {
  summary: CashFlowSummary | null;
  loading?: boolean;
}

export default function CashFlowSummaryCards({
  summary,
  loading = false,
}: CashFlowSummaryCardsProps) {
  const totalIncome = summary?.total_income ?? 0;
  const totalExpense = summary?.total_expense ?? 0;
  const netCashFlow = summary?.net_cash_flow ?? 0;
  const isNetPositive = netCashFlow >= 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Total Income */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Income
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <ArrowDownRight className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          {loading ? (
            <div className="h-7 w-28 animate-pulse rounded bg-slate-100" />
          ) : (
            <p className="text-2xl font-bold tracking-tight text-emerald-600">
              {formatINR(totalIncome)}
            </p>
          )}
          <p className="mt-1 text-xs text-slate-500">Recorded inflows</p>
        </div>
      </div>

      {/* Total Expenses */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Expenses
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          {loading ? (
            <div className="h-7 w-28 animate-pulse rounded bg-slate-100" />
          ) : (
            <p className="text-2xl font-bold tracking-tight text-rose-600">
              {formatINR(totalExpense)}
            </p>
          )}
          <p className="mt-1 text-xs text-slate-500">Recorded outflows</p>
        </div>
      </div>

      {/* Net Cash Flow */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Net Cash Flow
          </span>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
              isNetPositive
                ? "bg-sky-50 text-sky-600 border-sky-100"
                : "bg-amber-50 text-amber-600 border-amber-100"
            }`}
          >
            <Scale className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          {loading ? (
            <div className="h-7 w-28 animate-pulse rounded bg-slate-100" />
          ) : (
            <p
              className={`text-2xl font-bold tracking-tight ${
                isNetPositive ? "text-slate-900" : "text-amber-600"
              }`}
            >
              {formatINR(netCashFlow)}
            </p>
          )}
          <p className="mt-1 text-xs text-slate-500">
            {isNetPositive ? "Net surplus" : "Net deficit"} (Income - Expenses)
          </p>
        </div>
      </div>
    </div>
  );
}
