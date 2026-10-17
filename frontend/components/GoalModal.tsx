"use client";

import { useState, useEffect } from "react";
import { FinancialGoal, CreateGoalData, UpdateGoalData } from "@/lib/api";
import { X, Loader2 } from "lucide-react";

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateGoalData | UpdateGoalData) => Promise<void>;
  goal?: FinancialGoal | null;
}

export default function GoalModal({
  isOpen,
  onClose,
  onSubmit,
  goal,
}: GoalModalProps) {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [targetAmount, setTargetAmount] = useState<string>("");
  const [currentAmount, setCurrentAmount] = useState<string>("");
  const [targetDate, setTargetDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setDescription(goal.description || "");
      setTargetAmount(goal.target_amount.toString());
      setCurrentAmount(goal.current_amount.toString());
      setTargetDate(goal.target_date || "");
    } else {
      setName("");
      setDescription("");
      setTargetAmount("");
      setCurrentAmount("0");
      setTargetDate("");
    }
    setError(null);
  }, [goal, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tAmt = parseFloat(targetAmount);
    const cAmt = currentAmount ? parseFloat(currentAmount) : 0;

    if (isNaN(tAmt) || tAmt <= 0) {
      setError("Target amount must be a positive number.");
      return;
    }
    if (isNaN(cAmt) || cAmt < 0) {
      setError("Current amount cannot be negative.");
      return;
    }
    if (cAmt > tAmt) {
      setError("Current saved amount cannot exceed target amount.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload: CreateGoalData | UpdateGoalData = {
        name: name.trim(),
        description: description.trim(),
        target_amount: tAmt,
        current_amount: cAmt,
        target_date: targetDate || null,
      };
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save financial goal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            {goal ? `Edit ${goal.name}` : "Create Financial Goal"}
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
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Goal Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Emergency Fund, Laptop, Vacation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="Short note or motivation"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Amount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="e.g. 100000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Saved (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 25000"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Date (Optional)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
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
              {goal ? "Save Changes" : "Create Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
