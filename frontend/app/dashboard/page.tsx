"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStoredToken } from "@/lib/auth";
import {
  formatINR,
  AnalyticsOverview,
  MonthlyCashFlowItem,
  CategorySpendingItem,
  TopExpenseItem,
  BudgetAnalyticsResponse,
  getAnalyticsOverview,
  getMonthlyAnalytics,
  getCategoryAnalytics,
  getTopExpenses,
  getBudgetAnalytics,
} from "@/lib/api";
import CashFlowTrendChart from "@/components/CashFlowTrendChart";
import CategorySpendingChart from "@/components/CategorySpendingChart";
import {
  TrendingUp,
  TrendingDown,
  Percent,
  Wallet,
  Calendar,
  Plus,
  UploadCloud,
  Target,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

type DateRangeOption = "this_month" | "last_month" | "last_3_months" | "last_6_months" | "this_year";

function getDateRange(option: DateRangeOption): { start_date: string; end_date: string } {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  if (option === "last_month") {
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return {
      start_date: prevMonthStart.toISOString().split("T")[0],
      end_date: prevMonthEnd.toISOString().split("T")[0],
    };
  }

  if (option === "last_3_months") {
    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    return { start_date: start.toISOString().split("T")[0], end_date: todayStr };
  }

  if (option === "last_6_months") {
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    return { start_date: start.toISOString().split("T")[0], end_date: todayStr };
  }

  if (option === "this_year") {
    const start = new Date(now.getFullYear(), 0, 1);
    return { start_date: start.toISOString().split("T")[0], end_date: todayStr };
  }

  // Default: this_month
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return { start_date: start.toISOString().split("T")[0], end_date: todayStr };
}

export default function DashboardPage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeOption>("this_month");

  // Overview Metrics
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState<boolean>(true);

  // Category Breakdown
  const [categoryData, setCategoryData] = useState<CategorySpendingItem[]>([]);
  const [totalCategoryExpense, setTotalCategoryExpense] = useState<number>(0);
  const [categoryLoading, setCategoryLoading] = useState<boolean>(true);

  // Top Expenses
  const [topExpenses, setTopExpenses] = useState<TopExpenseItem[]>([]);
  const [topExpensesLoading, setTopExpensesLoading] = useState<boolean>(true);

  // Monthly Trend
  const [monthlyData, setMonthlyData] = useState<MonthlyCashFlowItem[]>([]);
  const [monthlyLoading, setMonthlyLoading] = useState<boolean>(true);

  // Budget Analytics
  const [budgetAnalytics, setBudgetAnalytics] = useState<BudgetAnalyticsResponse | null>(null);
  const [budgetLoading, setBudgetLoading] = useState<boolean>(true);

  // Load Session
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      setAccessToken(token);
      setUserEmail("admin@finos.local");
    }
  }, []);

  // Fetch all analytics for the selected date range
  const loadDashboardData = async (token: string, rangeOpt: DateRangeOption) => {
    const range = getDateRange(rangeOpt);

    // 1. Overview
    setOverviewLoading(true);
    getAnalyticsOverview(token, range)
      .then((res) => setOverview(res))
      .catch(() => setOverview(null))
      .finally(() => setOverviewLoading(false));

    // 2. Categories
    setCategoryLoading(true);
    getCategoryAnalytics(token, { ...range, type: "expense" })
      .then((res) => {
        setCategoryData(res.items || []);
        setTotalCategoryExpense(res.total_amount || 0);
      })
      .catch(() => {
        setCategoryData([]);
        setTotalCategoryExpense(0);
      })
      .finally(() => setCategoryLoading(false));

    // 3. Top Expenses
    setTopExpensesLoading(true);
    getTopExpenses(token, { limit: 5, ...range })
      .then((res) => setTopExpenses(res.items || []))
      .catch(() => setTopExpenses([]))
      .finally(() => setTopExpensesLoading(false));

    // 4. Monthly Trend (6 months)
    setMonthlyLoading(true);
    getMonthlyAnalytics(token, 6)
      .then((res) => setMonthlyData(res.items || []))
      .catch(() => setMonthlyData([]))
      .finally(() => setMonthlyLoading(false));

    // 5. Budget Analytics
    setBudgetLoading(true);
    getBudgetAnalytics(token)
      .then((res) => setBudgetAnalytics(res))
      .catch(() => setBudgetAnalytics(null))
      .finally(() => setBudgetLoading(false));
  };

  useEffect(() => {
    if (accessToken) {
      loadDashboardData(accessToken, dateRange);
    }
  }, [accessToken, dateRange]);

  return (
    <div className="space-y-8">
      {/* 1. Financial Overview Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Financial Overview
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Cash flow metrics and budget performance across your recorded accounts.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
              <Calendar className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRangeOption)}
                className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer text-xs"
              >
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="last_3_months">Last 3 Months</option>
                <option value="last_6_months">Last 6 Months</option>
                <option value="this_year">This Year</option>
              </select>
            </div>

            {accessToken && (
              <button
                onClick={() => loadDashboardData(accessToken, dateRange)}
                disabled={overviewLoading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                title="Refresh dashboard"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${overviewLoading ? "animate-spin" : ""}`}
                />
                <span className="hidden xs:inline">Refresh</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Compact Quick Actions Bar */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Quick Actions:
          </span>
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <Link
              href="/dashboard/transactions"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-700 transition-colors text-center"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Transaction
            </Link>
            <Link
              href="/dashboard/import"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-center"
            >
              <UploadCloud className="h-3.5 w-3.5 text-slate-500" />
              Import Statement
            </Link>
            <Link
              href="/dashboard/planning"
              className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors text-center"
            >
              <Target className="h-3.5 w-3.5 text-indigo-600" />
              Budgets & Goals
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Savings & Cash Flow Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Income</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 font-mono">
            {overviewLoading ? "--" : formatINR(overview?.total_income || 0)}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {overviewLoading ? "" : `${overview?.transaction_count || 0} recorded transactions`}
          </p>
        </div>

        {/* Total Expenses */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Expenses</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 font-mono">
            {overviewLoading ? "--" : formatINR(overview?.total_expense || 0)}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Recorded period outflows</p>
        </div>

        {/* Net Cash Flow */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Net Cash Flow</span>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                (overview?.net_cash_flow || 0) >= 0
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-rose-50 text-rose-600"
              }`}
            >
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div
            className={`mt-2 text-xl font-bold font-mono ${
              (overview?.net_cash_flow || 0) >= 0
                ? "text-emerald-600"
                : "text-rose-600"
            }`}
          >
            {overviewLoading ? "--" : formatINR(overview?.net_cash_flow || 0)}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {(overview?.net_cash_flow || 0) >= 0 ? "Surplus (Income > Expense)" : "Deficit (Expense > Income)"}
          </p>
        </div>

        {/* Savings Rate */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Savings Rate</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 font-mono">
            {overviewLoading ? "--" : `${overview?.savings_rate || 0}%`}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Proportion of income saved</p>
        </div>
      </div>

      {/* 4. Cash Flow Trend Chart */}
      <CashFlowTrendChart data={monthlyData} loading={monthlyLoading} />

      {/* 5. Category Spending & Budget Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <CategorySpendingChart
          items={categoryData}
          totalAmount={totalCategoryExpense}
          loading={categoryLoading}
        />

        {/* Budget Performance Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Budget Status</h3>
                <p className="text-xs text-slate-500">Monthly category spending limits</p>
              </div>
              <Link
                href="/dashboard/planning"
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                Manage
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {budgetLoading ? (
              <div className="space-y-3 py-4 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                <div className="h-2 bg-slate-100 rounded"></div>
              </div>
            ) : !budgetAnalytics || budgetAnalytics.total_budgeted === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                <Target className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-700">No budgets set for this month</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Establish category limits to track budget utilization.
                </p>
                <Link
                  href="/dashboard/planning"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700"
                >
                  Create Budget &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-600">Overall Utilization</span>
                    <span className="font-bold text-slate-900">
                      {formatINR(budgetAnalytics.total_spent)} of {formatINR(budgetAnalytics.total_budgeted)} ({budgetAnalytics.overall_utilization_pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        budgetAnalytics.overall_utilization_pct > 100
                          ? "bg-rose-500"
                          : budgetAnalytics.overall_utilization_pct > 85
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(100, budgetAnalytics.overall_utilization_pct)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Active Budgets</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {budgetAnalytics.items?.length || 0}
                    </span>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Over Budget</span>
                    <span className={`font-bold text-sm ${budgetAnalytics.categories_over_budget > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                      {budgetAnalytics.categories_over_budget}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Set limits to control recurring expenses</span>
            <Link href="/dashboard/planning" className="font-medium text-sky-600 hover:text-sky-700">
              View All &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* 6. Top Expenses Summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Top Outflows</h3>
            <p className="text-xs text-slate-500">Largest individual expense items in selected period</p>
          </div>
          <Link
            href="/dashboard/transactions"
            className="text-xs font-semibold text-sky-600 hover:text-sky-700"
          >
            All Transactions &rarr;
          </Link>
        </div>

        {topExpensesLoading ? (
          <div className="space-y-2 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-slate-50 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : topExpenses.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            No expenses recorded for this period.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {topExpenses.map((exp, idx) => (
              <div key={exp.id || idx} className="py-2.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-500 shrink-0">
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
  );
}
