"use client";

import { useState } from "react";
import { MonthlyCashFlowItem, formatINR } from "@/lib/api";

interface CashFlowTrendChartProps {
  data: MonthlyCashFlowItem[];
  loading?: boolean;
}

export default function CashFlowTrendChart({
  data,
  loading = false,
}: CashFlowTrendChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-5 w-48 bg-slate-200 rounded animate-pulse mb-6"></div>
        <div className="h-56 bg-slate-50 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  const hasData = data && data.length > 0 && data.some((d) => d.income > 0 || d.expenses > 0);

  if (!hasData) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Cash Flow Trend</h3>
        <p className="text-xs text-slate-500 mb-6">Monthly Income vs Expense comparison</p>
        <div className="flex flex-col items-center justify-center h-48 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
          <p className="text-xs text-slate-500 font-medium">
            No monthly transaction history available yet.
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Record transactions or import a statement to view historical trends.
          </p>
        </div>
      </div>
    );
  }

  // Calculate maximum value for Y-axis scaling
  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.income, d.expenses)),
    1000
  );

  const chartWidth = 560;
  const chartHeight = 180;
  const topPadding = 20;
  const bottomPadding = 30;
  const leftPadding = 20;
  const effectiveHeight = chartHeight - topPadding - bottomPadding;
  const groupWidth = (chartWidth - leftPadding) / data.length;
  const barWidth = Math.min(22, groupWidth * 0.32);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Cash Flow Trend</h3>
          <p className="text-xs text-slate-500">Monthly Income vs Expense comparison</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500"></span>
            <span className="text-slate-600 font-medium">Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-rose-500"></span>
            <span className="text-slate-600 font-medium">Expenses</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-56 overflow-visible"
        >
          {/* Horizontal Gridlines */}
          {[0, 0.5, 1].map((ratio, i) => {
            const y = chartHeight - bottomPadding - ratio * effectiveHeight;
            return (
              <line
                key={i}
                x1={leftPadding}
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray={ratio > 0 ? "3 3" : undefined}
                strokeWidth={1}
              />
            );
          })}

          {/* Render Bars per Month */}
          {data.map((item, idx) => {
            const groupX = leftPadding + idx * groupWidth;
            const centerX = groupX + groupWidth / 2;

            const incomeHeight = (item.income / maxValue) * effectiveHeight;
            const expenseHeight = (item.expenses / maxValue) * effectiveHeight;

            const incomeY = chartHeight - bottomPadding - incomeHeight;
            const expenseY = chartHeight - bottomPadding - expenseHeight;

            const isHovered = hoveredIndex === idx;

            return (
              <g
                key={item.month}
                className="cursor-pointer transition-opacity"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Hover backdrop */}
                {isHovered && (
                  <rect
                    x={groupX}
                    y={topPadding}
                    width={groupWidth}
                    height={effectiveHeight + bottomPadding}
                    fill="#f1f5f9"
                    opacity={0.6}
                    rx={6}
                  />
                )}

                {/* Income Bar */}
                <rect
                  x={centerX - barWidth - 2}
                  y={incomeY}
                  width={barWidth}
                  height={Math.max(2, incomeHeight)}
                  fill="#10b981"
                  rx={3}
                  className="transition-all hover:opacity-85"
                />

                {/* Expense Bar */}
                <rect
                  x={centerX + 2}
                  y={expenseY}
                  width={barWidth}
                  height={Math.max(2, expenseHeight)}
                  fill="#f43f5e"
                  rx={3}
                  className="transition-all hover:opacity-85"
                />

                {/* Month Label */}
                <text
                  x={centerX}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  className="text-[11px] fill-slate-500 font-medium"
                >
                  {item.month_label.split(" ")[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && data[hoveredIndex] && (
          <div className="absolute top-2 right-2 rounded-lg border border-slate-200 bg-white/95 backdrop-blur-sm p-3 shadow-md text-xs z-10 min-w-[160px]">
            <div className="font-bold text-slate-800 border-b border-slate-100 pb-1 mb-1.5">
              {data[hoveredIndex].month_label}
            </div>
            <div className="flex items-center justify-between text-emerald-700 py-0.5">
              <span>Income:</span>
              <span className="font-semibold font-mono">
                {formatINR(data[hoveredIndex].income)}
              </span>
            </div>
            <div className="flex items-center justify-between text-rose-700 py-0.5">
              <span>Expenses:</span>
              <span className="font-semibold font-mono">
                {formatINR(data[hoveredIndex].expenses)}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-700 border-t border-slate-100 pt-1 mt-1 font-semibold">
              <span>Net:</span>
              <span
                className={`font-mono ${
                  data[hoveredIndex].net_cash_flow >= 0
                    ? "text-emerald-600"
                    : "text-rose-600"
                }`}
              >
                {formatINR(data[hoveredIndex].net_cash_flow)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
