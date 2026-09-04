const API_BASE_URL = 'http://192.168.1.9:8000';
async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      ...options,
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `API ${response.status}: ${errorText}`,
    );
  }

  return response.json();
}

/* -------------------------
   Daily
------------------------- */

export function getDailySummary() {
  return request('/api/v1/daily');
}

export function getTodayCheckins() {
  return request('/api/v1/daily/checkins');
}

export function completeCheckin(
  checkinId: number,
) {
  return request(
    `/api/v1/daily/checkins/${checkinId}/complete`,
    {
      method: 'POST',
    },
  );
}

export function undoCheckin(
  checkinId: number,
) {
  return request(
    `/api/v1/daily/checkins/${checkinId}/undo`,
    {
      method: 'POST',
    },
  );
}

/* -------------------------
   Health
------------------------- */

export function getHealth() {
  return request('/api/v1/health');
}

export function getTodayHealthRecords() {
  return request(
    '/api/v1/health/records/today',
  );
}

export function createHealthRecord(
  record: Record<string, unknown>,
) {
  return request(
    '/api/v1/health/records',
    {
      method: 'POST',
      body: JSON.stringify(record),
    },
  );
}

export function deleteHealthRecord(
  recordId: number,
) {
  return request(
    `/api/v1/health/records/${recordId}`,
    {
      method: 'DELETE',
    },
  );
}

/* -------------------------
   Nutrition
------------------------- */

export function getNutrition() {
  return request('/api/v1/nutrition');
}

export function getTodayMeals() {
  return request(
    '/api/v1/nutrition/meals/today',
  );
}

export function createMeal(
  meal: Record<string, unknown>,
) {
  return request(
    '/api/v1/nutrition/meals',
    {
      method: 'POST',
      body: JSON.stringify(meal),
    },
  );
}

export function deleteMealRecord(
  mealId: number,
) {
  return request(
    `/api/v1/nutrition/meals/${mealId}`,
    {
      method: 'DELETE',
    },
  );
}

/* -------------------------
   Finance
------------------------- */

export function getFinanceDaily() {
  return request(
    '/api/v1/finance/daily',
  );
}

export function getFinanceMonthly() {
  return request(
    '/api/v1/finance/monthly',
  );
}

export function getFinanceTotal() {
  return request(
    '/api/v1/finance/total',
  );
}

export function getFinanceInsights() {
  return request(
    '/api/v1/finance/insights',
  );
}

export function getTodayExpenses() {
  return request(
    '/api/v1/finance/expenses/today',
  );
}

export function createExpense(
  expense: Record<string, unknown>,
) {
  return request(
    '/api/v1/finance/expenses',
    {
      method: 'POST',
      body: JSON.stringify(expense),
    },
  );
}

export function deleteExpense(
  expenseId: number,
) {
  return request(
    `/api/v1/finance/expenses/${expenseId}`,
    {
      method: 'DELETE',
    },
  );
}

export function importTransaction(
  transaction: Record<string, unknown>,
) {
  return request(
    '/api/v1/finance/import',
    {
      method: 'POST',
      body: JSON.stringify(transaction),
    },
  );
}

export function importSmsTransaction(
  payload: Record<string, unknown>,
) {
  return request(
    '/api/v1/finance/import/sms',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}