export interface HealthResponse {
  status: string;
  app: string;
  version: string;
  phase?: number;
}

export interface BackendAuthResponse {
  status: string;
  user_id: string;
  email: string;
  metadata?: Record<string, any>;
}

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionListResponse {
  items: Transaction[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface CashFlowSummary {
  total_income: number;
  total_expense: number;
  net_cash_flow: number;
}

export interface TransactionQueryParams {
  page?: number;
  limit?: number;
  type?: string;
  category?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
  sort_order?: "asc" | "desc";
}

export interface CreateTransactionData {
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  transaction_date: string;
}

export interface UpdateTransactionData {
  type?: TransactionType;
  amount?: number;
  category?: string;
  description?: string;
  transaction_date?: string;
}

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Business",
  "Interest",
  "Other Income",
] as const;

export const EXPENSE_CATEGORIES = [
  "Food",
  "Groceries",
  "Transportation",
  "Shopping",
  "Bills & Utilities",
  "Rent",
  "Education",
  "Healthcare",
  "Entertainment",
  "Travel",
  "Personal Care",
  "Subscriptions",
  "Other Expense",
] as const;

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://ec2-13-126-4-165.ap-south-1.compute.amazonaws.com"
).replace(/\/+$/, "");

/**
 * Format currency to INR using Indian numbering system (e.g. ₹50,000, ₹1,25,000).
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Checks connectivity to FastAPI backend GET /health.
 */
export async function checkBackendHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Backend responded with status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Sends an authenticated verification request to FastAPI GET /api/v1/auth/me.
 */
export async function fetchAuthenticatedUser(
  accessToken: string
): Promise<BackendAuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Backend error with status: ${response.status}`
    );
  }

  return await response.json();
}

/**
 * Retrieves paginated, filtered transactions.
 */
export async function getTransactions(
  accessToken: string,
  params: TransactionQueryParams = {}
): Promise<TransactionListResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", params.page.toString());
  if (params.limit) query.set("limit", params.limit.toString());
  if (params.type) query.set("type", params.type);
  if (params.category) query.set("category", params.category);
  if (params.search) query.set("search", params.search);
  if (params.start_date) query.set("start_date", params.start_date);
  if (params.end_date) query.set("end_date", params.end_date);
  if (params.sort_order) query.set("sort_order", params.sort_order);

  const url = `${API_BASE_URL}/api/v1/transactions?${query.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to fetch transactions: ${response.status}`
    );
  }

  return await response.json();
}

/**
 * Retrieves cash flow summary (total income, total expense, net cash flow).
 */
export async function getTransactionSummary(
  accessToken: string,
  params?: { start_date?: string; end_date?: string }
): Promise<CashFlowSummary> {
  const query = new URLSearchParams();
  if (params?.start_date) query.set("start_date", params.start_date);
  if (params?.end_date) query.set("end_date", params.end_date);

  const url = `${API_BASE_URL}/api/v1/transactions/summary${
    query.toString() ? `?${query.toString()}` : ""
  }`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to fetch summary: ${response.status}`
    );
  }

  return await response.json();
}

/**
 * Creates a new transaction.
 */
export async function createTransaction(
  accessToken: string,
  data: CreateTransactionData
): Promise<Transaction> {
  const response = await fetch(`${API_BASE_URL}/api/v1/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to create transaction: ${response.status}`
    );
  }

  return await response.json();
}

/**
 * Updates an existing transaction.
 */
export async function updateTransaction(
  accessToken: string,
  id: string,
  data: UpdateTransactionData
): Promise<Transaction> {
  const response = await fetch(`${API_BASE_URL}/api/v1/transactions/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to update transaction: ${response.status}`
    );
  }

  return await response.json();
}

/**
 * Deletes a transaction.
 */
export async function deleteTransaction(
  accessToken: string,
  id: string
): Promise<{ status: string; id: string }> {
  const response = await fetch(`${API_BASE_URL}/api/v1/transactions/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to delete transaction: ${response.status}`
    );
  }

  return await response.json();
}

export type RowStatus =
  | "new"
  | "potential_duplicate"
  | "needs_review"
  | "invalid";

export interface PreviewRowItem {
  index: number;
  date: string | null;
  description: string;
  amount: number | null;
  type: "income" | "expense" | null;
  category: string;
  status: RowStatus;
  status_reason: string | null;
  is_selectable: boolean;
  default_selected: boolean;
}

export interface ImportPreviewResponse {
  import_id: string;
  filename: string;
  file_type: string;
  total_rows: number;
  valid_rows: number;
  duplicate_rows: number;
  review_rows: number;
  invalid_rows: number;
  expires_at: string;
  items: PreviewRowItem[];
}

export interface ImportConfirmResponse {
  import_id: string;
  status: string;
  imported_count: number;
  skipped_duplicate_count: number;
  skipped_invalid_count: number;
  message: string;
}

export interface StatementImportRecord {
  id: string;
  user_id: string;
  filename: string;
  file_type: string;
  status: string;
  total_rows: number;
  valid_rows: number;
  imported_rows: number;
  duplicate_rows: number;
  failed_rows: number;
  error_message: string;
  created_at: string;
  completed_at: string | null;
  expires_at: string;
}

export interface StatementImportListResponse {
  items: StatementImportRecord[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Uploads a statement file (CSV/PDF) to generate a preview of parsed transactions.
 */
export async function previewStatementImport(
  accessToken: string,
  file: File
): Promise<ImportPreviewResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/v1/imports/preview`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to process statement: ${response.status}`
    );
  }

  return await response.json();
}

/**
 * Confirms selected transaction indices from an active preview.
 */
export async function confirmStatementImport(
  accessToken: string,
  importId: string,
  selectedIndices: number[],
  categoryOverrides?: Record<number, string>
): Promise<ImportConfirmResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/imports/${importId}/confirm`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        selected_indices: selectedIndices,
        category_overrides: categoryOverrides || {},
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to confirm statement import: ${response.status}`
    );
  }

  return await response.json();
}

/**
 * Retrieves paginated list of past statement import batches.
 */
export async function getStatementImports(
  accessToken: string,
  page = 1,
  limit = 20
): Promise<StatementImportListResponse> {
  const query = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(
    `${API_BASE_URL}/api/v1/imports?${query.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to fetch imports: ${response.status}`
    );
  }

  return await response.json();
}

/**
 * Retrieves a single statement import record by id.
 */
export async function getStatementImport(
  accessToken: string,
  importId: string
): Promise<StatementImportRecord> {
  const response = await fetch(`${API_BASE_URL}/api/v1/imports/${importId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to fetch import record: ${response.status}`
    );
  }

  return await response.json();
}

// ==============================================================================
// Financial Planning and Advanced Analytics API
// ==============================================================================

export type BudgetStatus = "under_budget" | "near_limit" | "over_budget";

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  month: string;
  budget_amount: number;
  spent_amount: number;
  remaining_amount: number;
  percentage_used: number;
  status: BudgetStatus;
  created_at: string;
  updated_at: string;
}

export interface BudgetListResponse {
  month: string;
  items: Budget[];
  total_budgeted: number;
  total_spent: number;
  overall_percentage: number;
}

export interface CreateBudgetData {
  category: string;
  amount: number;
  month: string;
}

export interface UpdateBudgetData {
  amount: number;
}

export type GoalStatus = "in_progress" | "completed";

export interface FinancialGoal {
  id: string;
  user_id: string;
  name: string;
  description: string;
  target_amount: number;
  current_amount: number;
  remaining_amount: number;
  progress_percentage: number;
  target_date?: string | null;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}

export interface GoalListResponse {
  items: FinancialGoal[];
  total_target_amount: number;
  total_current_amount: number;
  overall_progress_percentage: number;
}

export interface CreateGoalData {
  name: string;
  description?: string;
  target_amount: number;
  current_amount?: number;
  target_date?: string | null;
}

export interface UpdateGoalData {
  name?: string;
  description?: string;
  target_amount?: number;
  current_amount?: number;
  target_date?: string | null;
}

export interface AnalyticsOverview {
  total_income: number;
  total_expense: number;
  net_cash_flow: number;
  savings_rate: number;
  transaction_count: number;
  expense_count: number;
  average_expense: number;
  period_start?: string | null;
  period_end?: string | null;
}

export interface MonthlyCashFlowItem {
  month: string;
  month_label: string;
  income: number;
  expenses: number;
  net_cash_flow: number;
}

export interface MonthlyAnalyticsResponse {
  items: MonthlyCashFlowItem[];
}

export interface CategorySpendingItem {
  category: string;
  amount: number;
  percentage: number;
  transaction_count: number;
}

export interface CategoryAnalyticsResponse {
  type: string;
  total_amount: number;
  items: CategorySpendingItem[];
}

export interface TopExpenseItem {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
}

export interface TopExpensesResponse {
  items: TopExpenseItem[];
}

export interface BudgetUtilizationItem {
  category: string;
  budget_amount: number;
  spent_amount: number;
  remaining_amount: number;
  percentage_used: number;
  status: string;
}

export interface BudgetAnalyticsResponse {
  month: string;
  total_budgeted: number;
  total_spent: number;
  overall_utilization_pct: number;
  categories_under_budget: number;
  categories_near_limit: number;
  categories_over_budget: number;
  items: BudgetUtilizationItem[];
}

/**
 * Fetch monthly budgets with actual spending metrics.
 */
export async function getBudgets(
  accessToken: string,
  month?: string
): Promise<BudgetListResponse> {
  const query = month ? `?month=${encodeURIComponent(month)}` : "";
  const response = await fetch(`${API_BASE_URL}/api/v1/budgets${query}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to fetch budgets: ${response.status}`);
  }
  return await response.json();
}

/**
 * Create a monthly category budget.
 */
export async function createBudget(
  accessToken: string,
  data: CreateBudgetData
): Promise<Budget> {
  const response = await fetch(`${API_BASE_URL}/api/v1/budgets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to create budget: ${response.status}`);
  }
  return await response.json();
}

/**
 * Update a monthly category budget amount.
 */
export async function updateBudget(
  accessToken: string,
  budgetId: string,
  data: UpdateBudgetData
): Promise<Budget> {
  const response = await fetch(`${API_BASE_URL}/api/v1/budgets/${budgetId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to update budget: ${response.status}`);
  }
  return await response.json();
}

/**
 * Delete a budget configuration.
 */
export async function deleteBudget(
  accessToken: string,
  budgetId: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/budgets/${budgetId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to delete budget: ${response.status}`);
  }
}

/**
 * Fetch all financial goals with derived progress metrics.
 */
export async function getGoals(
  accessToken: string
): Promise<GoalListResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/goals`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to fetch goals: ${response.status}`);
  }
  return await response.json();
}

/**
 * Create a new financial goal.
 */
export async function createGoal(
  accessToken: string,
  data: CreateGoalData
): Promise<FinancialGoal> {
  const response = await fetch(`${API_BASE_URL}/api/v1/goals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to create goal: ${response.status}`);
  }
  return await response.json();
}

/**
 * Update a financial goal.
 */
export async function updateGoal(
  accessToken: string,
  goalId: string,
  data: UpdateGoalData
): Promise<FinancialGoal> {
  const response = await fetch(`${API_BASE_URL}/api/v1/goals/${goalId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to update goal: ${response.status}`);
  }
  return await response.json();
}

/**
 * Delete a financial goal.
 */
export async function deleteGoal(
  accessToken: string,
  goalId: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/goals/${goalId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to delete goal: ${response.status}`);
  }
}

/**
 * Fetch analytics overview for a given date range.
 */
export async function getAnalyticsOverview(
  accessToken: string,
  params?: { start_date?: string; end_date?: string }
): Promise<AnalyticsOverview> {
  const query = new URLSearchParams();
  if (params?.start_date) query.set("start_date", params.start_date);
  if (params?.end_date) query.set("end_date", params.end_date);

  const url = `${API_BASE_URL}/api/v1/analytics/overview${
    query.toString() ? `?${query.toString()}` : ""
  }`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to fetch overview analytics: ${response.status}`);
  }
  return await response.json();
}

/**
 * Fetch historical monthly cash flow trends.
 */
export async function getMonthlyAnalytics(
  accessToken: string,
  months: number = 6
): Promise<MonthlyAnalyticsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/analytics/monthly?months=${months}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to fetch monthly analytics: ${response.status}`);
  }
  return await response.json();
}

/**
 * Fetch category spending breakdown.
 */
export async function getCategoryAnalytics(
  accessToken: string,
  params?: { start_date?: string; end_date?: string; type?: "income" | "expense" }
): Promise<CategoryAnalyticsResponse> {
  const query = new URLSearchParams();
  if (params?.start_date) query.set("start_date", params.start_date);
  if (params?.end_date) query.set("end_date", params.end_date);
  if (params?.type) query.set("type", params.type);

  const url = `${API_BASE_URL}/api/v1/analytics/categories${
    query.toString() ? `?${query.toString()}` : ""
  }`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to fetch category analytics: ${response.status}`);
  }
  return await response.json();
}

/**
 * Fetch top expense transactions.
 */
export async function getTopExpenses(
  accessToken: string,
  params?: { limit?: number; start_date?: string; end_date?: string }
): Promise<TopExpensesResponse> {
  const query = new URLSearchParams();
  if (params?.limit) query.set("limit", params.limit.toString());
  if (params?.start_date) query.set("start_date", params.start_date);
  if (params?.end_date) query.set("end_date", params.end_date);

  const url = `${API_BASE_URL}/api/v1/analytics/top-expenses${
    query.toString() ? `?${query.toString()}` : ""
  }`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to fetch top expenses: ${response.status}`);
  }
  return await response.json();
}

/**
 * Fetch budget utilization analytics.
 */
export async function getBudgetAnalytics(
  accessToken: string,
  month?: string
): Promise<BudgetAnalyticsResponse> {
  const query = month ? `?month=${encodeURIComponent(month)}` : "";
  const response = await fetch(`${API_BASE_URL}/api/v1/analytics/budget${query}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to fetch budget analytics: ${response.status}`);
  }
  return await response.json();
}



