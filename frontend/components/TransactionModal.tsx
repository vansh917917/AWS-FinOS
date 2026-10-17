"use client";

import { useState, useEffect } from "react";
import {
  Transaction,
  TransactionType,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  CreateTransactionData,
  UpdateTransactionData,
} from "@/lib/api";
import { X, Loader2, AlertCircle } from "lucide-react";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTransactionData | UpdateTransactionData) => Promise<void>;
  initialData?: Transaction | null;
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: TransactionModalProps) {
  const isEditing = !!initialData;

  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [transactionDate, setTransactionDate] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize or reset form values
  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(initialData.amount.toString());
      setCategory(initialData.category);
      setDescription(initialData.description || "");
      setTransactionDate(initialData.transaction_date);
    } else {
      setType("expense");
      setAmount("");
      setCategory(EXPENSE_CATEGORIES[0]);
      setDescription("");
      // Default to today in YYYY-MM-DD
      setTransactionDate(new Date().toISOString().split("T")[0]);
    }
    setError(null);
  }, [initialData, isOpen]);

  // When type changes, ensure selected category is valid for new type
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === "income") {
      if (!INCOME_CATEGORIES.includes(category as any)) {
        setCategory(INCOME_CATEGORIES[0]);
      }
    } else {
      if (!EXPENSE_CATEGORIES.includes(category as any)) {
        setCategory(EXPENSE_CATEGORIES[0]);
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    if (!category) {
      setError("Please select a category");
      return;
    }

    if (!transactionDate) {
      setError("Please select a transaction date");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        type,
        amount: parsedAmount,
        category,
        description: description.trim(),
        transaction_date: transactionDate,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save transaction");
    } finally {
      setLoading(false);
    }
  };

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {isEditing ? "Edit Transaction" : "Add Transaction"}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error notice */}
        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-100">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => handleTypeChange("expense")}
                className={`rounded-md py-1.5 text-xs font-semibold transition-all ${
                  type === "expense"
                    ? "bg-white text-rose-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("income")}
                className={`rounded-md py-1.5 text-xs font-semibold transition-all ${
                  type === "income"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label
              htmlFor="amount"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Amount (INR)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-slate-400 font-semibold">
                ₹
              </span>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 pl-8 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Transaction Date */}
          <div>
            <label
              htmlFor="transactionDate"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Date
            </label>
            <input
              id="transactionDate"
              type="date"
              required
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Description (Optional)
            </label>
            <input
              id="description"
              type="text"
              maxLength={255}
              placeholder="e.g. Lunch at cafe, Client invoice"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Submit / Cancel Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Update Transaction"
              ) : (
                "Add Transaction"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
