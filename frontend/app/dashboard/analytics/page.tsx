"use client";

import { useEffect, useState } from "react";
import { getStoredToken } from "@/lib/auth";
import {
  formatINR,
  AnalyticsOverview,
  MonthlyCashFlowItem,
  CategorySpendingItem,
  TopExpenseItem,
  getAnalyticsOverview,
  getMonthlyAnalytics,
  getCategoryAnalytics,
  getTopExpenses,
} from "@/lib/api";
import CashFlowTrendChart from "@/components/CashFlowTrendChart";
import CategorySpendingChart from "@/components/CategorySpendingChart";
import {
  BarChart3,
  Calendar,
  TrendingUp,
  TrendingDown,
  Percent,
  Wallet,
  RefreshCw,
} from "lucide-react";

export default function AnalyticsPage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [monthsCount, setMonthsCount] = useState<number>(6);
  const [categoryType, setCategoryType] = useState<"expense" | "income">("expense");

  // Overview
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState<boolean>(true);

  // Monthly data
  const [monthlyData, setMonthlyData] = useState<MonthlyCashFlowItem[]>([]);
  const [monthlyLoading, setMonthlyLoading] = useState<boolean>(true);

  // Category data
  const [categoryData, setCategoryData] = useState<CategorySpendingItem[]>([]);
  const [totalCategoryAmount, setTotalCategoryAmount] = useState<number>(0);
  const [categoryLoading, setCategoryLoading] = useState<boolean>(true);

  // Top Expenses
  const [topExpenses, setTopExpenses] = useState<TopExpenseItem[]>([]);
  const [topExpensesLoading, setTopExpensesLoading] = useState<boolean>(true);

  // Fetch Auth Session
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      setAccessToken(token);
    }
  }, []);

  // Fetch Analytics
  const fetchAnalytics = async (token: string) => {
    setOverviewLoading(true);
    getAnalyticsOverview(token)
      .then((res) => setOverview(res))
      .catch(() => setOverview(null))
      .finally(() => setOverviewLoading(false));

    setMonthlyLoading(true);
    getMonthlyAnalytics(token, monthsCount)
      .then((res) => setMonthlyData(res.items || []))
      .catch(() => setMonthlyData([]))
      .finally(() => setMonthlyLoading(false));

    setCategoryLoading(true);
    getCategoryAnalytics(token, { type: categoryType })
      .then((res) => {
        setCategoryData(res.items || []);
        setTotalCategoryAmount(res.total_amount || 0);
      })
      .catch(() => {
        setCategoryData([]);
        setTotalCategoryAmount(0);
      })
      .finally(() => setCategoryLoading(false));

    setTopExpensesLoading(true);
    getTopExpenses(token, { limit: 10 })
      .then((res) => setTopExpenses(res.items || []))
      .catch(() => setTopExpenses([]))
      .finally(() => setTopExpensesLoading(false));
  };

  useEffect(() => {
    if (accessToken) {
      fetchAnalytics(accessToken);
    }
  }, [accessToken, monthsCount, categoryType]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 border border-sky-100 mb-2">
              <BarChart3 className="h-3.5 w-3.5 text-sky-600" />
              Financial Analytics
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Spending &amp; Cash Flow Trends
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Long-term patterns, category distributions, and inflow-outflow performance.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              <select
                value={monthsCount}
                onChange={(e) => setMonthsCount(Number(e.target.value))}
                className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value={3}>Past 3 Months</option>
                <option value={6}>Past 6 Months</option>
                <option value={12}>Past 12 Months</option>
              </select>
            </div>

            {accessToken && (
              <button
                onClick={() => fetchAnalytics(accessToken)}
                disabled={overviewLoading || monthlyLoading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                title="Refresh analytics"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${overviewLoading || monthlyLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Inflow</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-xl font-bold font-mono text-slate-900">
            {overviewLoading ? "--" : formatINR(overview?.total_income || 0)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Recorded revenue</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Outflow</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-xl font-bold font-mono text-slate-900">
            {overviewLoading ? "--" : formatINR(overview?.total_expense || 0)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Recorded expenditures</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Net Surplus</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <p
            className={`mt-2 text-xl font-bold font-mono ${
              (overview?.net_cash_flow || 0) >= 0 ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {overviewLoading ? "--" : formatINR(overview?.net_cash_flow || 0)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Net balance</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Savings Rate</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-xl font-bold font-mono text-slate-900">
            {overviewLoading ? "--" : `${overview?.savings_rate || 0}%`}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Savings efficiency</span>
        </div>
      </div>

      {/* Historical Trend Chart */}
      <div className="space-y-2">
        <CashFlowTrendChart data={monthlyData} loading={monthlyLoading} />
      </div>

      {/* Category Breakdown & Top Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown with Toggle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Category Distribution
            </span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
              <button
                onClick={() => setCategoryType("expense")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  categoryType === "expense"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Expenses
              </button>
              <button
                onClick={() => setCategoryType("income")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  categoryType === "income"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Income
              </button>
            </div>
          </div>
          <CategorySpendingChart
            items={categoryData}
            totalAmount={totalCategoryAmount}
            loading={categoryLoading}
          />
        </div>

        {/* Top 10 Expenses */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Top 10 Outflows
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Largest individual expenses recorded in your account
            </p>

            {topExpensesLoading ? (
              <div className="space-y-2 py-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 bg-slate-50 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : topExpenses.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No expense transactions recorded yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
                {topExpenses.map((exp, idx) => (
                  <div key={exp.id || idx} className="py-2.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {exp.description || exp.category}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {exp.category} &bull; {exp.date}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-900 shrink-0">
                      {formatINR(exp.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
