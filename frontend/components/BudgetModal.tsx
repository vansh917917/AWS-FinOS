"use client";

import { useState, useEffect } from "react";
import { Budget, CreateBudgetData, UpdateBudgetData, EXPENSE_CATEGORIES } from "@/lib/api";
import { X, Loader2 } from "lucide-react";

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBudgetData | UpdateBudgetData) => Promise<void>;
  budget?: Budget | null;
  selectedMonth: string;
}

export default function BudgetModal({
  isOpen,
  onClose,
  onSubmit,
  budget,
  selectedMonth,
}: BudgetModalProps) {
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (budget) {
      setCategory(budget.category);
      setAmount(budget.budget_amount.toString());
    } else {
      setCategory(EXPENSE_CATEGORIES[0]);
      setAmount("");
    }
    setError(null);
  }, [budget, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Budget amount must be a positive number.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (budget) {
        await onSubmit({ amount: numAmount });
      } else {
        await onSubmit({
          category,
          amount: numAmount,
          month: selectedMonth,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save budget.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            {budget ? `Edit ${budget.category} Budget` : "Add Monthly Category Budget"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {!budget && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Budgets are expense-only. One budget allowed per category per month.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Monthly Budget Amount (₹)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 10000"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Month Period
            </label>
            <input
              type="text"
              disabled
              value={selectedMonth.slice(0, 7)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-50 transition-colors"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {budget ? "Save Changes" : "Create Budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
