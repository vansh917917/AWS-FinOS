"use client";

import { FinancialGoal, formatINR } from "@/lib/api";
import { Target, CheckCircle2, Clock, Edit2, Trash2 } from "lucide-react";

interface GoalCardProps {
  goal: FinancialGoal;
  onEdit?: (goal: FinancialGoal) => void;
  onDelete?: (goal: FinancialGoal) => void;
}

export default function GoalCard({
  goal,
  onEdit,
  onDelete,
}: GoalCardProps) {
  const isCompleted = goal.status === "completed";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                isCompleted ? "bg-emerald-100 text-emerald-600" : "bg-sky-100 text-sky-600"
              }`}
            >
              <Target className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">{goal.name}</h4>
              {goal.description && (
                <p className="text-xs text-slate-500 line-clamp-1">{goal.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-3 w-3" />
                Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 border border-sky-200">
                <Clock className="h-3 w-3" />
                {goal.progress_percentage.toFixed(0)}%
              </span>
            )}
            {(onEdit || onDelete) && (
              <div className="flex items-center gap-1 ml-1 border-l border-slate-100 pl-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(goal)}
                    className="rounded p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                    title="Edit goal"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(goal)}
                    className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    title="Delete goal"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden my-3">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isCompleted ? "bg-emerald-500" : "bg-sky-600"
            }`}
            style={{ width: `${Math.min(100, goal.progress_percentage)}%` }}
          />
        </div>

        {/* Amount figures */}
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-500 font-medium">Saved:</span>
          <span className="font-semibold text-slate-800 font-mono">
            {formatINR(goal.current_amount)} / {formatINR(goal.target_amount)}
          </span>
        </div>
      </div>

      {/* Footer info: target date & remaining */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2.5 mt-2">
        <span>
          {goal.target_date ? `Target: ${goal.target_date}` : "No deadline"}
        </span>
        <span className="font-medium text-slate-600">
          {isCompleted ? (
            <span className="text-emerald-600 font-semibold">Goal achieved!</span>
          ) : (
            <span>{formatINR(goal.remaining_amount)} to go</span>
          )}
        </span>
      </div>
    </div>
  );
}
