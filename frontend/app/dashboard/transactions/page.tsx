"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { getStoredToken } from "@/lib/auth";
import {
  getTransactions,
  getTransactionSummary,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  Transaction,
  CashFlowSummary,
  TransactionType,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  CreateTransactionData,
  UpdateTransactionData,
  formatINR,
} from "@/lib/api";
import CashFlowSummaryCards from "@/components/CashFlowSummaryCards";
import TransactionModal from "@/components/TransactionModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import {
  Plus,
  UploadCloud,
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Edit2,
  Trash2,
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertCircle,
  Inbox,
  X,
} from "lucide-react";


export default function TransactionsPage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Data states
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<CashFlowSummary | null>(null);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // UI state
  const [loading, setLoading] = useState<boolean>(true);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Filters and Pagination

  const [page, setPage] = useState<number>(1);
  const limit = 20;
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Search with debounce
  const [searchInput, setSearchInput] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Handle Search Input Debounce (350ms)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(val.trim());
      setPage(1); // UX rule: filter change resets page to 1
    }, 350);
  };

  // Helper to reset filters
  const resetFilters = () => {
    setTypeFilter("");
    setCategoryFilter("");
    setStartDate("");
    setEndDate("");
    setSortOrder("desc");
    setSearchInput("");
    setDebouncedSearch("");
    setPage(1);
  };

  // Fetch transactions
  const fetchTransactionsData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);

    try {
      const data = await getTransactions(accessToken, {
        page,
        limit,
        type: typeFilter || undefined,
        category: categoryFilter || undefined,
        search: debouncedSearch || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        sort_order: sortOrder,
      });

      setTransactions(data.items);
      setTotalItems(data.total);
      setTotalPages(data.total_pages);
    } catch (err: any) {
      setError(err.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [
    accessToken,
    page,
    typeFilter,
    categoryFilter,
    debouncedSearch,
    startDate,
    endDate,
    sortOrder,
  ]);

  // Fetch summary
  const fetchSummaryData = useCallback(async () => {
    if (!accessToken) return;
    setSummaryLoading(true);
    try {
      const summaryData = await getTransactionSummary(accessToken, {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      setSummary(summaryData);
    } catch (err) {
      console.error("Failed to load summary:", err);
    } finally {
      setSummaryLoading(false);
    }
  }, [accessToken, startDate, endDate]);

  // Load session on mount
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      setAccessToken(token);
    }
  }, []);

  // Fetch data when parameters change
  useEffect(() => {
    if (accessToken) {
      fetchTransactionsData();
      fetchSummaryData();
    }
  }, [accessToken, fetchTransactionsData, fetchSummaryData]);

  // Clear success banner after 4s
  useEffect(() => {
    if (successBanner) {
      const t = setTimeout(() => setSuccessBanner(null), 4000);
      return () => clearTimeout(t);
    }
  }, [successBanner]);

  // Handle Create / Update Submission
  const handleModalSubmit = async (
    formData: CreateTransactionData | UpdateTransactionData
  ) => {
    if (!accessToken) return;
    if (editingTransaction) {
      await updateTransaction(accessToken, editingTransaction.id, formData);
      setSuccessBanner("Transaction updated successfully");
    } else {
      await createTransaction(accessToken, formData as CreateTransactionData);
      setSuccessBanner("Transaction added successfully");
    }
    fetchTransactionsData();
    fetchSummaryData();
  };

  // Handle Delete Confirmation
  const confirmDelete = async () => {
    if (!accessToken || !deletingId) return;
    await deleteTransaction(accessToken, deletingId);
    setSuccessBanner("Transaction deleted successfully");
    setDeletingId(null);
    fetchTransactionsData();
    fetchSummaryData();
  };

  const isFiltered = !!(
    typeFilter ||
    categoryFilter ||
    startDate ||
    endDate ||
    debouncedSearch
  );

  const availableCategories =

    typeFilter === "income"
      ? INCOME_CATEGORIES
      : typeFilter === "expense"
      ? EXPENSE_CATEGORIES
      : [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

  const formatDisplayDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Cash Flow Transactions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Record, categorize, and monitor all income and expenses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard/import"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <UploadCloud className="h-3.5 w-3.5 text-slate-500" />
            Import Statement
          </Link>

          <button
            onClick={() => {
              setEditingTransaction(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Transaction
          </button>
        </div>

      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800 border border-emerald-200 flex items-center justify-between">
          <span>{successBanner}</span>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-600 hover:text-emerald-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Cash Flow Summary Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {startDate || endDate ? "Filtered Period Summary" : "Overall Cash Flow"}
          </h2>
          {accessToken && (
            <button
              onClick={() => {
                fetchTransactionsData();
                fetchSummaryData();
              }}
              disabled={loading || summaryLoading}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              <RefreshCw
                className={`h-3 w-3 ${loading || summaryLoading ? "animate-spin" : ""}`}
              />
              Sync
            </button>
          )}
        </div>
        <CashFlowSummaryCards summary={summary} loading={summaryLoading} />
      </div>

      {/* Search, Filter, and Sort Controls */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search description or category..."
              value={searchInput}
              onChange={handleSearchChange}
              className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Type Filter */}
          <div className="w-full sm:w-36">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCategoryFilter(""); // Reset category when type changes
                setPage(1); // UX rule: reset to page 1
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="w-full sm:w-44">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1); // UX rule: reset to page 1
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
            >
              <option value="">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div className="w-full sm:w-36">
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value as "desc" | "asc");
                setPage(1); // UX rule: reset to page 1
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Date Range Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 shrink-0" /> Date Range:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1); // UX rule: reset to page 1
                }}
                className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs text-slate-800 focus:border-sky-500 focus:outline-none"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1); // UX rule: reset to page 1
                }}
                className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs text-slate-800 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {isFiltered && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold transition-colors self-start sm:self-auto"
            >
              <X className="h-3.5 w-3.5" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1">
            <p className="font-semibold">Unable to load transactions</p>
            <p className="mt-0.5">{error}</p>
            <p className="mt-1 text-slate-600">
              Please check your connection or try refreshing the page.
            </p>
          </div>
          <button
            onClick={fetchTransactionsData}
            className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-rose-700 border border-rose-300 hover:bg-rose-50"
          >
            Retry
          </button>
        </div>
      )}

      {/* Transactions List / Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-sky-600" />
            <p className="text-xs">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
              <Inbox className="h-6 w-6" />
            </div>
            {isFiltered ? (
              <>
                <h3 className="text-sm font-bold text-slate-900">
                  No matching transactions found
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Try adjusting your search criteria or date filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Reset All Filters
                </button>
              </>
            ) : (
              <>
                <h3 className="text-sm font-bold text-slate-900">
                  No transactions yet
                </h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                  Add your first income or expense to start tracking your cash flow.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2.5">
                  <button
                    onClick={() => {
                      setEditingTransaction(null);
                      setModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-700 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Transaction
                  </button>
                  <Link
                    href="/dashboard/import"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
                  >
                    <UploadCloud className="h-3.5 w-3.5 text-slate-500" />
                    Import Statement
                  </Link>
                </div>
              </>
            )}
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Date</th>
                    <th className="px-6 py-3 font-semibold">Description</th>
                    <th className="px-6 py-3 font-semibold">Category</th>
                    <th className="px-6 py-3 font-semibold">Type</th>
                    <th className="px-6 py-3 font-semibold text-right">Amount</th>
                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => {
                    const isIncome = tx.type === "income";
                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-50/75 transition-colors"
                      >
                        <td className="px-6 py-3.5 whitespace-nowrap text-slate-600 font-medium">
                          {formatDisplayDate(tx.transaction_date)}
                        </td>
                        <td className="px-6 py-3.5 font-medium text-slate-900 max-w-xs truncate">
                          {tx.description || (
                            <span className="text-slate-400 italic">
                              No description
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
                            {tx.category}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          {isIncome ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                              <ArrowDownRight className="h-3 w-3 text-emerald-600" />
                              Income
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200">
                              <ArrowUpRight className="h-3 w-3 text-rose-600" />
                              Expense
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-3.5 whitespace-nowrap text-right font-mono font-bold text-sm">
                          <span
                            className={
                              isIncome ? "text-emerald-600" : "text-slate-900"
                            }
                          >
                            {isIncome ? "+" : "-"} {formatINR(tx.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingTransaction(tx);
                              setModalOpen(true);
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-sky-600 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingId(tx.id);
                              setDeleteModalOpen(true);
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100">
              {transactions.map((tx) => {
                const isIncome = tx.type === "income";
                return (
                  <div key={tx.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] font-medium text-slate-500">
                          {formatDisplayDate(tx.transaction_date)}
                        </span>
                        <p className="text-sm font-semibold text-slate-900">
                          {tx.description || tx.category}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-mono font-bold ${
                          isIncome ? "text-emerald-600" : "text-slate-900"
                        }`}
                      >
                        {isIncome ? "+" : "-"} {formatINR(tx.amount)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                          {tx.category}
                        </span>
                        {isIncome ? (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                            Income
                          </span>
                        ) : (
                          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 border border-rose-200">
                            Expense
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingTransaction(tx);
                            setModalOpen(true);
                          }}
                          className="rounded p-1 text-slate-400 hover:text-sky-600"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingId(tx.id);
                            setDeleteModalOpen(true);
                          }}
                          className="rounded p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-600">
              <div>
                Showing{" "}
                <span className="font-semibold text-slate-900">
                  {Math.min(totalItems, (page - 1) * limit + 1)}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-900">
                  {Math.min(totalItems, page * limit)}
                </span>{" "}
                of <span className="font-semibold text-slate-900">{totalItems}</span>{" "}
                transactions
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </button>
                <span className="text-slate-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleModalSubmit}
        initialData={editingTransaction}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingId(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Transaction?"
        message="Are you sure you want to delete this transaction? It will immediately update your cash flow records."
      />
    </div>
  );
}
