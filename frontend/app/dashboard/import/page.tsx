"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { getStoredToken } from "@/lib/auth";
import {
  previewStatementImport,
  confirmStatementImport,
  getStatementImports,
  ImportPreviewResponse,
  ImportConfirmResponse,
  PreviewRowItem,
  StatementImportRecord,
  formatINR,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
} from "@/lib/api";
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Clock,
  AlertCircle,
  FileUp,
} from "lucide-react";

export default function StatementImportPage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Preview states
  const [preview, setPreview] = useState<ImportPreviewResponse | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [confirming, setConfirming] = useState<boolean>(false);
  const [confirmResult, setConfirmResult] = useState<ImportConfirmResponse | null>(null);

  // Import history states
  const [history, setHistory] = useState<StatementImportRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 1. Initialize auth session
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      setAccessToken(token);
    }
  }, []);

  // 2. Fetch past import history
  const loadHistory = useCallback(async () => {
    if (!accessToken) return;
    setHistoryLoading(true);
    try {
      const res = await getStatementImports(accessToken, 1, 10);
      setHistory(res.items || []);
    } catch (err) {
      console.error("Failed to load import history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      loadHistory();
    }
  }, [accessToken, loadHistory]);

  // 3. Handle File Selection
  const handleFileChange = (file: File | null) => {
    setUploadError(null);
    setConfirmResult(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Size limit check (10MB)
    const MAX_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      setUploadError("The selected file exceeds the 10MB limit. Please choose a smaller statement file.");
      setSelectedFile(null);
      return;
    }

    // Extension check
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv" && ext !== "pdf") {
      setUploadError("Unsupported format. Please upload a CSV (.csv) or text-based PDF (.pdf) file.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  // 4. Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // 5. Submit for Preview
  const handleGeneratePreview = async () => {
    if (!accessToken || !selectedFile) return;

    setUploading(true);
    setUploadError(null);
    setPreview(null);
    setConfirmResult(null);

    try {
      const data = await previewStatementImport(accessToken, selectedFile);
      setPreview(data);

      // Pre-select items with default_selected = true
      const initialSelected = data.items
        .filter((item) => item.default_selected && item.is_selectable)
        .map((item) => item.index);
      setSelectedIndices(initialSelected);
    } catch (err: any) {
      setUploadError(err.message || "Failed to process the uploaded statement file.");
    } finally {
      setUploading(false);
    }
  };

  // 6. Selection Toggles
  const handleToggleRow = (idx: number) => {
    if (selectedIndices.includes(idx)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== idx));
    } else {
      setSelectedIndices([...selectedIndices, idx]);
    }
  };

  const handleSelectAllReady = () => {
    if (!preview) return;
    const readyIndices = preview.items
      .filter((i) => i.status === "new" && i.is_selectable)
      .map((i) => i.index);
    setSelectedIndices(readyIndices);
  };

  const handleSelectAllValid = () => {
    if (!preview) return;
    const allSelectable = preview.items
      .filter((i) => i.is_selectable)
      .map((i) => i.index);
    setSelectedIndices(allSelectable);
  };

  const handleDeselectAll = () => {
    setSelectedIndices([]);
  };

  // 6.5 Category Change in Preview
  const handleCategoryChange = (idx: number, newCat: string) => {
    if (!preview) return;
    const updatedItems = preview.items.map((item) =>
      item.index === idx ? { ...item, category: newCat } : item
    );
    setPreview({ ...preview, items: updatedItems });
  };

  // 7. Confirm Import
  const handleConfirmImport = async () => {
    if (!accessToken || !preview) return;
    if (selectedIndices.length === 0) {
      setUploadError("Please select at least one transaction to import.");
      return;
    }

    setConfirming(true);
    setUploadError(null);

    try {
      const categoryOverrides: Record<number, string> = {};
      preview.items.forEach((item) => {
        if (item.category) {
          categoryOverrides[item.index] = item.category;
        }
      });

      const result = await confirmStatementImport(
        accessToken,
        preview.import_id,
        selectedIndices,
        categoryOverrides
      );
      setConfirmResult(result);
      setPreview(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      loadHistory();
    } catch (err: any) {
      setUploadError(err.message || "An error occurred while confirming import.");
    } finally {
      setConfirming(false);
    }
  };

  // Helper badge renderers
  const renderRowStatusBadge = (item: PreviewRowItem) => {
    switch (item.status) {
      case "new":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            Ready
          </span>
        );
      case "potential_duplicate":
        return (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"
            title={item.status_reason || "Potential duplicate"}
          >
            <AlertTriangle className="h-3 w-3" />
            Duplicate
          </span>
        );
      case "needs_review":
        return (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
            title={item.status_reason || "Requires review"}
          >
            <HelpCircle className="h-3 w-3" />
            Review
          </span>
        );
      case "invalid":
      default:
        return (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200"
            title={item.status_reason || "Invalid format"}
          >
            <XCircle className="h-3 w-3" />
            Invalid
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Statement Import
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload bank or credit card statements in CSV or text-based PDF format. FinOS extracts transactions, screens for duplicates, and previews each row before import.
        </p>
      </div>

      {/* Success Notification Banner */}
      {confirmResult && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-1 rounded-full bg-emerald-100 text-emerald-700 mt-0.5">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-emerald-900">
                  Import Completed Successfully
                </h3>
                <p className="text-xs text-emerald-700 mt-1">
                  Imported <strong className="font-semibold">{confirmResult.imported_count}</strong> transactions into your account.
                  {confirmResult.skipped_duplicate_count > 0 && (
                    <span> Skipped {confirmResult.skipped_duplicate_count} duplicate records.</span>
                  )}
                  {confirmResult.skipped_invalid_count > 0 && (
                    <span> Skipped {confirmResult.skipped_invalid_count} unselected or invalid items.</span>
                  )}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <Link
                    href="/dashboard/transactions"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-800 transition-colors"
                  >
                    View in Transactions
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    onClick={() => setConfirmResult(null)}
                    className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-50 transition-colors"
                  >
                    Import Another Statement
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Notification Banner */}
      {uploadError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-rose-900">Processing Error</h4>
              <p className="text-xs text-rose-700 mt-0.5">{uploadError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Section 1: File Upload & Dropzone (when no active preview) */}
      {!preview && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">Upload Statement File</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a statement file from your computer. Maximum file size is 10MB.
            </p>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
              isDragging
                ? "border-sky-500 bg-sky-50/50"
                : selectedFile
                ? "border-emerald-300 bg-emerald-50/20"
                : "border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileChange(e.target.files[0]);
                }
              }}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              disabled={uploading}
            />

            <div className="flex flex-col items-center pointer-events-none">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-600 mb-3 shadow-inner">
                {selectedFile ? (
                  selectedFile.name.endsWith(".csv") ? (
                    <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
                  ) : (
                    <FileText className="h-6 w-6 text-sky-600" />
                  )
                ) : (
                  <UploadCloud className="h-6 w-6" />
                )}
              </div>

              {selectedFile ? (
                <div>
                  <p className="text-sm font-semibold text-slate-800">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB : Click to change file
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Click to select or drag and drop your statement file here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports text-based PDF (.pdf) and CSV (.csv) exports
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>Statement previews expire automatically after 24 hours.</span>
            </div>

            <button
              onClick={handleGeneratePreview}
              disabled={!selectedFile || uploading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Parsing Statement...
                </>
              ) : (
                <>
                  <FileUp className="h-4 w-4" />
                  Generate Preview
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Section 2: Statement Preview & Confirmation (when preview is loaded) */}
      {preview && (
        <div className="space-y-6">
          {/* Preview Overview Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                    {preview.file_type.toUpperCase()} Statement
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">{preview.filename}</h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Preview generated. Review the extracted rows below, select transactions to include, then confirm import.
                </p>
              </div>

              <button
                onClick={() => {
                  setPreview(null);
                  setSelectedFile(null);
                  setSelectedIndices([]);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                Discard & Upload Another File
              </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <span className="text-xs font-medium text-slate-500">Total Extracted</span>
                <p className="text-2xl font-bold text-slate-900 mt-1">{preview.total_rows}</p>
                <span className="text-xs text-slate-400 mt-0.5 block">All detected rows</span>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                <span className="text-xs font-medium text-emerald-700">Ready to Import</span>
                <p className="text-2xl font-bold text-emerald-800 mt-1">{preview.valid_rows}</p>
                <span className="text-xs text-emerald-600 mt-0.5 block">New transactions</span>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                <span className="text-xs font-medium text-amber-700">Potential Duplicates</span>
                <p className="text-2xl font-bold text-amber-800 mt-1">{preview.duplicate_rows}</p>
                <span className="text-xs text-amber-600 mt-0.5 block">Matches existing data</span>
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
                <span className="text-xs font-medium text-rose-700">Review / Invalid</span>
                <p className="text-2xl font-bold text-rose-800 mt-1">
                  {preview.review_rows + preview.invalid_rows}
                </p>
                <span className="text-xs text-rose-600 mt-0.5 block">Skipped automatically</span>
              </div>
            </div>

            {/* Quick Filter & Selection Bar */}
            <div className="mt-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllReady}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  Select All Ready ({preview.valid_rows})
                </button>
                <button
                  type="button"
                  onClick={handleSelectAllValid}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  Select All Valid ({preview.valid_rows + preview.duplicate_rows})
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Deselect All
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 w-full lg:w-auto">
                <span className="text-xs font-medium text-slate-600">
                  <strong className="text-slate-900 font-semibold">{selectedIndices.length}</strong> of{" "}
                  {preview.items.filter((i) => i.is_selectable).length} selectable rows selected
                </span>

                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={confirming || selectedIndices.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {confirming ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Confirm & Import ({selectedIndices.length})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Extracted Transactions Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-3.5 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Transaction Preview List ({preview.items.length} rows)
              </h3>
              <span className="text-xs text-slate-500">
                Unchecked transactions will not be imported
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th scope="col" className="px-4 py-3 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={
                          preview.items.filter((i) => i.is_selectable).length > 0 &&
                          selectedIndices.length ===
                            preview.items.filter((i) => i.is_selectable).length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleSelectAllValid();
                          } else {
                            handleDeselectAll();
                          }
                        }}
                        aria-label="Select all selectable transactions"
                        className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Date
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Description
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Type
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Category
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      Amount
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {preview.items.map((item) => {
                    const isSelected = selectedIndices.includes(item.index);
                    return (
                      <tr
                        key={item.index}
                        className={`transition-colors ${
                          !item.is_selectable
                            ? "bg-slate-50/60 opacity-60"
                            : isSelected
                            ? "bg-sky-50/30 hover:bg-sky-50/50"
                            : "hover:bg-slate-50/80"
                        }`}
                      >
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={!item.is_selectable}
                            onChange={() => handleToggleRow(item.index)}
                            aria-label={`Select row ${item.index + 1}`}
                            className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 disabled:opacity-40"
                          />
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-slate-800 whitespace-nowrap">
                          {item.date || "Invalid Date"}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-700 max-w-xs truncate">
                          {item.description || "Statement Transaction"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {item.type === "income" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Income
                            </span>
                          ) : item.type === "expense" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              Expense
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              Ambiguous
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                          <select
                            value={item.category || (item.type === "income" ? "Other Income" : "Other Expense")}
                            disabled={!item.is_selectable}
                            onChange={(e) => handleCategoryChange(item.index, e.target.value)}
                            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer disabled:bg-slate-50 disabled:cursor-not-allowed"
                            aria-label={`Category for transaction ${item.index + 1}`}
                          >
                            {item.type === "income"
                              ? INCOME_CATEGORIES.map((cat) => (
                                  <option key={cat} value={cat}>
                                    {cat}
                                  </option>
                                ))
                              : EXPENSE_CATEGORIES.map((cat) => (
                                  <option key={cat} value={cat}>
                                    {cat}
                                  </option>
                                ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold text-right whitespace-nowrap">
                          {item.amount !== null ? (
                            <span
                              className={
                                item.type === "income" ? "text-emerald-600" : "text-slate-900"
                              }
                            >
                              {formatINR(item.amount)}
                            </span>
                          ) : (
                            <span className="text-slate-400">---</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {renderRowStatusBadge(item)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Past Statement Imports History */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Import History</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Records of previously uploaded and confirmed statement batches.
            </p>
          </div>
          <button
            onClick={loadHistory}
            disabled={historyLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${historyLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No statement imports have been completed yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-3">Filename</th>
                  <th scope="col" className="px-6 py-3">Format</th>
                  <th scope="col" className="px-6 py-3">Date Uploaded</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3 text-right">Total Rows</th>
                  <th scope="col" className="px-6 py-3 text-right">Imported</th>
                  <th scope="col" className="px-6 py-3 text-right">Duplicates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3 text-xs font-medium text-slate-900">
                      {record.filename}
                    </td>
                    <td className="px-6 py-3 text-xs uppercase font-semibold text-slate-500">
                      {record.file_type}
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-600">
                      {record.created_at ? new Date(record.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }) : "---"}
                    </td>
                    <td className="px-6 py-3 text-xs">
                      {record.status === "completed" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Completed
                        </span>
                      ) : record.status === "preview_ready" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
                          Preview Ready
                        </span>
                      ) : record.status === "expired" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          {record.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-xs font-medium text-right text-slate-700">
                      {record.total_rows}
                    </td>
                    <td className="px-6 py-3 text-xs font-semibold text-right text-emerald-600">
                      {record.imported_rows}
                    </td>
                    <td className="px-6 py-3 text-xs font-medium text-right text-amber-600">
                      {record.duplicate_rows}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
