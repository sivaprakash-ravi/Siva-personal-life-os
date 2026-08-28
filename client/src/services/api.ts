const API_BASE_URL = 'http://127.0.0.1:8000';

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


export function getHealth() {
  return request('/api/v1/health');
}


export function getNutrition() {
  return request('/api/v1/nutrition');
}


export function getFinanceDaily() {
  return request('/api/v1/finance/daily');
}


export function getFinanceMonthly() {
  return request('/api/v1/finance/monthly');
}


export function getFinanceTotal() {
  return request('/api/v1/finance/total');
}


export function getFinanceInsights() {
  return request('/api/v1/finance/insights');
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