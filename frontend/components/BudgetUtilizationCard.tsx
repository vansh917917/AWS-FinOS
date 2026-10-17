"use client";

import { Budget, formatINR } from "@/lib/api";
import { Edit2, Trash2, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

interface BudgetUtilizationCardProps {
  budget: Budget;
  onEdit?: (budget: Budget) => void;
  onDelete?: (budget: Budget) => void;
}

export default function BudgetUtilizationCard({
  budget,
  onEdit,
  onDelete,
}: BudgetUtilizationCardProps) {
  const isOver = budget.status === "over_budget";
  const isNear = budget.status === "near_limit";

  const getStatusBadge = () => {
    if (isOver) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
          <AlertCircle className="h-3 w-3" />
          Over Budget ({budget.percentage_used.toFixed(0)}%)
        </span>
      );
    }
    if (isNear) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
          <AlertTriangle className="h-3 w-3" />
          Near Limit ({budget.percentage_used.toFixed(0)}%)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
        <CheckCircle className="h-3 w-3" />
        On Track ({budget.percentage_used.toFixed(0)}%)
      </span>
    );
  };

  const getBarColor = () => {
    if (isOver) return "bg-rose-500";
    if (isNear) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900">{budget.category}</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Budget: <span className="font-semibold text-slate-700">{formatINR(budget.budget_amount)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-1 ml-1 border-l border-slate-100 pl-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(budget)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                  title="Edit budget"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(budget)}
                  className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  title="Delete budget"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden mb-3">
        <div
          className={`h-full rounded-full ${getBarColor()} transition-all duration-300`}
          style={{ width: `${Math.min(100, budget.percentage_used)}%` }}
        />
      </div>

      {/* Metrics Row */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
        <div className="text-slate-500">
          Spent: <span className="font-semibold text-slate-800 font-mono">{formatINR(budget.spent_amount)}</span>
        </div>
        <div className="text-slate-500">
          {isOver ? (
            <span className="text-rose-600 font-semibold font-mono">
              Exceeded by {formatINR(Math.abs(budget.remaining_amount))}
            </span>
          ) : (
            <span>
              Remaining: <span className="font-semibold text-emerald-600 font-mono">{formatINR(budget.remaining_amount)}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
