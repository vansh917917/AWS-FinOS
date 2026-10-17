"use client";

import { useEffect, useState } from "react";
import { getStoredToken } from "@/lib/auth";
import {
  Budget,
  FinancialGoal,
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  formatINR,
  CreateBudgetData,
  UpdateBudgetData,
  CreateGoalData,
  UpdateGoalData,
} from "@/lib/api";
import BudgetUtilizationCard from "@/components/BudgetUtilizationCard";
import GoalCard from "@/components/GoalCard";
import BudgetModal from "@/components/BudgetModal";
import GoalModal from "@/components/GoalModal";
import {
  PieChart,
  Target,
  Plus,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Loader2,
  Calendar,
} from "lucide-react";

export default function PlanningPage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Budgets state
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}-01`;
  });
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [totalBudgeted, setTotalBudgeted] = useState<number>(0);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [overallBudgetPct, setOverallBudgetPct] = useState<number>(0);
  const [budgetsLoading, setBudgetsLoading] = useState<boolean>(true);
  const [budgetsError, setBudgetsError] = useState<string | null>(null);

  // Goals state
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [totalGoalTarget, setTotalGoalTarget] = useState<number>(0);
  const [totalGoalCurrent, setTotalGoalCurrent] = useState<number>(0);
  const [overallGoalProgress, setOverallGoalProgress] = useState<number>(0);
  const [goalsLoading, setGoalsLoading] = useState<boolean>(true);
  const [goalsError, setGoalsError] = useState<string | null>(null);

  // Modals state
  const [budgetModalOpen, setBudgetModalOpen] = useState<boolean>(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [goalModalOpen, setGoalModalOpen] = useState<boolean>(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);

  // Fetch session on load
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      setAccessToken(token);
    }
  }, []);

  // Load budgets when month or token changes
  const loadBudgets = async (token: string, monthStr: string) => {
    setBudgetsLoading(true);
    setBudgetsError(null);
    try {
      const res = await getBudgets(token, monthStr);
      setBudgets(res.items || []);
      setTotalBudgeted(res.total_budgeted || 0);
      setTotalSpent(res.total_spent || 0);
      setOverallBudgetPct(res.overall_percentage || 0);
    } catch (err: any) {
      setBudgetsError(err.message || "Failed to load budgets.");
      setBudgets([]);
    } finally {
      setBudgetsLoading(false);
    }
  };

  // Load goals
  const loadGoals = async (token: string) => {
    setGoalsLoading(true);
    setGoalsError(null);
    try {
      const res = await getGoals(token);
      setGoals(res.items || []);
      setTotalGoalTarget(res.total_target_amount || 0);
      setTotalGoalCurrent(res.total_current_amount || 0);
      setOverallGoalProgress(res.overall_progress_percentage || 0);
    } catch (err: any) {
      setGoalsError(err.message || "Failed to load financial goals.");
      setGoals([]);
    } finally {
      setGoalsLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadBudgets(accessToken, selectedMonth);
      loadGoals(accessToken);
    }
  }, [accessToken, selectedMonth]);

  // Month navigation helpers
  const shiftMonth = (delta: number) => {
    const parts = selectedMonth.split("-");
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1 + delta, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    setSelectedMonth(`${y}-${m}-01`);
  };

  const resetToCurrentMonth = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    setSelectedMonth(`${y}-${m}-01`);
  };

  const getMonthDisplay = (monthStr: string) => {
    const parts = monthStr.split("-");
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Budget Handlers
  const handleSaveBudget = async (data: CreateBudgetData | UpdateBudgetData) => {
    if (!accessToken) return;
    if (editingBudget) {
      await updateBudget(accessToken, editingBudget.id, data as UpdateBudgetData);
    } else {
      await createBudget(accessToken, data as CreateBudgetData);
    }
    await loadBudgets(accessToken, selectedMonth);
  };

  const handleDeleteBudget = async (b: Budget) => {
    if (!accessToken) return;
    if (!window.confirm(`Are you sure you want to delete the ${b.category} budget?`)) return;
    try {
      await deleteBudget(accessToken, b.id);
      await loadBudgets(accessToken, selectedMonth);
    } catch (err: any) {
      alert(err.message || "Failed to delete budget.");
    }
  };

  // Goal Handlers
  const handleSaveGoal = async (data: CreateGoalData | UpdateGoalData) => {
    if (!accessToken) return;
    if (editingGoal) {
      await updateGoal(accessToken, editingGoal.id, data as UpdateGoalData);
    } else {
      await createGoal(accessToken, data as CreateGoalData);
    }
    await loadGoals(accessToken);
  };

  const handleDeleteGoal = async (g: FinancialGoal) => {
    if (!accessToken) return;
    if (!window.confirm(`Are you sure you want to delete goal '${g.name}'?`)) return;
    try {
      await deleteGoal(accessToken, g.id);
      await loadGoals(accessToken);
    } catch (err: any) {
      alert(err.message || "Failed to delete goal.");
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Financial Planning
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage monthly category budgets and track long-term financial goals.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: MONTHLY BUDGETS */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
              <PieChart className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Monthly Budgets</h2>
              <p className="text-xs text-slate-500">Track category spending limits</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Month Selector */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
              <button
                onClick={() => shiftMonth(-1)}
                className="rounded p-1 text-slate-500 hover:bg-slate-100 transition-colors"
                title="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 text-xs font-semibold text-slate-800 min-w-[120px] text-center">
                {getMonthDisplay(selectedMonth)}
              </span>
              <button
                onClick={() => shiftMonth(1)}
                className="rounded p-1 text-slate-500 hover:bg-slate-100 transition-colors"
                title="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={resetToCurrentMonth}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              title="Reset to current month"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Current
            </button>

            <button
              onClick={() => {
                setEditingBudget(null);
                setBudgetModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Budget
            </button>
          </div>
        </div>

        {budgetsError && (
          <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-100">
            {budgetsError}
          </div>
        )}

        {/* Budget Overview Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Total Budgeted</span>
            <div className="mt-1 text-base font-bold text-slate-900 font-mono">
              {formatINR(totalBudgeted)}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Actual Spent</span>
            <div className="mt-1 text-base font-bold text-rose-600 font-mono">
              {formatINR(totalSpent)}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Remaining</span>
            <div
              className={`mt-1 text-base font-bold font-mono ${
                totalBudgeted - totalSpent >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {formatINR(totalBudgeted - totalSpent)}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Utilization</span>
            <div className="mt-1 text-base font-bold text-slate-800">
              {overallBudgetPct.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Budgets Grid */}
        {budgetsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-36 rounded-xl border border-slate-200 bg-white p-5 animate-pulse"
              />
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
            <Calendar className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <h4 className="text-sm font-bold text-slate-800">
              No budgets set for {getMonthDisplay(selectedMonth)}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Plan your spending by setting monthly budgets for categories like Food, Transportation, or Shopping.
            </p>
            <button
              onClick={() => {
                setEditingBudget(null);
                setBudgetModalOpen(true);
              }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Create First Budget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((b) => (
              <BudgetUtilizationCard
                key={b.id}
                budget={b}
                onEdit={(item) => {
                  setEditingBudget(item);
                  setBudgetModalOpen(true);
                }}
                onDelete={handleDeleteBudget}
              />
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: FINANCIAL GOALS */}
      {/* ========================================================================= */}
      <section className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Financial Goals</h2>
              <p className="text-xs text-slate-500">Track targets for savings and investments</p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingGoal(null);
              setGoalModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Goal
          </button>
        </div>

        {goalsError && (
          <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-100">
            {goalsError}
          </div>
        )}

        {/* Goals Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Total Target</span>
            <div className="mt-1 text-base font-bold text-slate-900 font-mono">
              {formatINR(totalGoalTarget)}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Accumulated Savings</span>
            <div className="mt-1 text-base font-bold text-emerald-600 font-mono">
              {formatINR(totalGoalCurrent)}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Overall Progress</span>
            <div className="mt-1 text-base font-bold text-indigo-700">
              {overallGoalProgress.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Goals Grid */}
        {goalsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-36 rounded-xl border border-slate-200 bg-white p-5 animate-pulse"
              />
            ))}
          </div>
        ) : goals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
            <Target className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No goals created yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Set clear targets for emergency funds, tech purchases, vacations, or education.
            </p>
            <button
              onClick={() => {
                setEditingGoal(null);
                setGoalModalOpen(true);
              }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Create First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                onEdit={(item) => {
                  setEditingGoal(item);
                  setGoalModalOpen(true);
                }}
                onDelete={handleDeleteGoal}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      <BudgetModal
        isOpen={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        onSubmit={handleSaveBudget}
        budget={editingBudget}
        selectedMonth={selectedMonth}
      />

      <GoalModal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        onSubmit={handleSaveGoal}
        goal={editingGoal}
      />
    </div>
  );
}
