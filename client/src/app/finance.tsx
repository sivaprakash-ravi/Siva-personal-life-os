import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE_URL = 'http://127.0.0.1:8000';

type DailyFinance = {
  date: string;
  expense_count: number;
  total_amount: number;
};

type MonthlyFinance = {
  month: string;
  expense_count: number;
  total_amount: number;
};

type MonthlyTotal = {
  monthly_total: number;
};

type FinanceInsights = {
  [key: string]: unknown;
};

type Expense = {
  id: number;
  date: string;
  category: string;
  subcategory: string | null;
  amount: number;
  description: string | null;
  payment_method: string | null;
  source: string;
  merchant: string | null;
  transaction_reference: string | null;
  notes: string | null;
};

const CATEGORIES = [
  'food',
  'transport',
  'shopping',
  'bills',
  'health',
  'entertainment',
  'education',
  'travel',
  'other',
];

const PAYMENT_METHODS = [
  'cash',
  'upi',
  'debit_card',
  'credit_card',
  'bank_transfer',
  'other',
];

export default function FinanceScreen() {
  const [daily, setDaily] = useState<DailyFinance | null>(null);
  const [monthly, setMonthly] =
    useState<MonthlyFinance | null>(null);
  const [total, setTotal] =
    useState<MonthlyTotal | null>(null);
  const [insights, setInsights] =
    useState<FinanceInsights | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [category, setCategory] = useState('food');
  const [paymentMethod, setPaymentMethod] =
    useState('upi');
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [description, setDescription] =
    useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  async function loadFinance() {
    try {
      const [
        dailyResponse,
        monthlyResponse,
        totalResponse,
        insightsResponse,
        expensesResponse,
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/finance/daily`),
        fetch(`${API_BASE_URL}/api/v1/finance/monthly`),
        fetch(`${API_BASE_URL}/api/v1/finance/total`),
        fetch(`${API_BASE_URL}/api/v1/finance/insights`),
        fetch(
          `${API_BASE_URL}/api/v1/finance/expenses/today`,
        ),
      ]);

      if (
        !dailyResponse.ok ||
        !monthlyResponse.ok ||
        !totalResponse.ok ||
        !insightsResponse.ok ||
        !expensesResponse.ok
      ) {
        throw new Error('Failed to load finance data');
      }

      const [
        dailyData,
        monthlyData,
        totalData,
        insightData,
        expenseData,
      ] = await Promise.all([
        dailyResponse.json(),
        monthlyResponse.json(),
        totalResponse.json(),
        insightsResponse.json(),
        expensesResponse.json(),
      ]);

      setDaily(dailyData);
      setMonthly(monthlyData);
      setTotal(totalData);
      setInsights(insightData);
      setExpenses(expenseData);
    } catch (error) {
      console.error('Finance API:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFinance();
  }, []);

  async function addExpense() {
    if (!amount.trim()) {
      setMessage('Enter an amount first.');
      return;
    }

    const numericAmount = Number(amount);

    if (
      Number.isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      setMessage('Enter a valid amount.');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/finance/expenses`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: numericAmount,
            category,
            description:
              description.trim() || null,
            payment_method: paymentMethod,
            source: 'manual',
            merchant:
              merchant.trim() || null,
            notes: notes.trim() || null,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          await response.text(),
        );
      }

      setAmount('');
      setMerchant('');
      setDescription('');
      setNotes('');
      setMessage('Expense recorded.');

      await loadFinance();
    } catch (error) {
      console.error('Expense API:', error);
      setMessage(
        'Could not save the expense.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteExpense(expenseId: number) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/finance/expenses/${expenseId}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error(
          'Failed to delete expense',
        );
      }

      await loadFinance();
    } catch (error) {
      console.error(
        'Delete expense:',
        error,
      );
    }
  }

  const monthlyAmount =
    total?.monthly_total ??
    monthly?.total_amount ??
    0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>
          SIVA OS
        </Text>

        <Text style={styles.title}>
          Finance
        </Text>

        <Text style={styles.subtitle}>
          Spending and financial activity.
        </Text>

        {loading ? (
          <ActivityIndicator
            style={styles.loader}
          />
        ) : (
          <>
            <View style={styles.dateCard}>
              <View>
                <Text style={styles.cardLabel}>
                  TODAY
                </Text>

                <Text style={styles.date}>
                  {daily?.date ?? '—'}
                </Text>
              </View>

              <Text style={styles.status}>
                LIVE
              </Text>
            </View>

            <View style={styles.heroCard}>
              <Text style={styles.heroLabel}>
                THIS MONTH
              </Text>

              <Text style={styles.heroValue}>
                ₹{formatAmount(monthlyAmount)}
              </Text>

              <Text style={styles.heroSubtext}>
                Total recorded spending
              </Text>
            </View>

            <View style={styles.grid}>
              <Metric
                title="Today's Spending"
                value={`₹${formatAmount(
                  daily?.total_amount ?? 0,
                )}`}
              />

              <Metric
                title="Today's Expenses"
                value={`${daily?.expense_count ?? 0}`}
              />

              <Metric
                title="Monthly Expenses"
                value={`${monthly?.expense_count ?? 0}`}
              />

              <Metric
                title="Monthly Total"
                value={`₹${formatAmount(
                  monthlyAmount,
                )}`}
              />
            </View>

            <Text style={styles.sectionTitle}>
              Add Expense
            </Text>

            <View style={styles.formCard}>
              <Text style={styles.inputLabel}>
                CATEGORY
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.selector
                }
              >
                {CATEGORIES.map((item) => (
                  <Pressable
                    key={item}
                    onPress={() =>
                      setCategory(item)
                    }
                    style={[
                      styles.option,
                      category === item &&
                        styles.optionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        category === item &&
                          styles.optionTextSelected,
                      ]}
                    >
                      {formatLabel(item)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>
                AMOUNT
              </Text>

              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="₹ 0.00"
                placeholderTextColor="#5F6672"
                keyboardType="numeric"
                style={styles.input}
              />

              <Text style={styles.inputLabel}>
                PAYMENT METHOD
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.selector
                }
              >
                {PAYMENT_METHODS.map((item) => (
                  <Pressable
                    key={item}
                    onPress={() =>
                      setPaymentMethod(item)
                    }
                    style={[
                      styles.option,
                      paymentMethod === item &&
                        styles.optionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        paymentMethod === item &&
                          styles.optionTextSelected,
                      ]}
                    >
                      {formatLabel(item)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>
                MERCHANT
              </Text>

              <TextInput
                value={merchant}
                onChangeText={setMerchant}
                placeholder="e.g. Swiggy"
                placeholderTextColor="#5F6672"
                style={styles.input}
              />

              <Text style={styles.inputLabel}>
                DESCRIPTION
              </Text>

              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="What was this expense for?"
                placeholderTextColor="#5F6672"
                style={styles.input}
              />

              <Text style={styles.inputLabel}>
                NOTES
              </Text>

              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Optional notes"
                placeholderTextColor="#5F6672"
                multiline
                style={[
                  styles.input,
                  styles.notesInput,
                ]}
              />

              <Pressable
                onPress={addExpense}
                disabled={saving}
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed &&
                    styles.buttonPressed,
                  saving &&
                    styles.buttonDisabled,
                ]}
              >
                {saving ? (
                  <ActivityIndicator
                    color="#0B0D10"
                  />
                ) : (
                  <Text
                    style={styles.saveButtonText}
                  >
                    Save Expense
                  </Text>
                )}
              </Pressable>

              {message ? (
                <Text style={styles.message}>
                  {message}
                </Text>
              ) : null}
            </View>

            <Text style={styles.sectionTitle}>
              Today's Expenses
            </Text>

            <View style={styles.list}>
              {expenses.length === 0 ? (
                <Text style={styles.emptyText}>
                  No expenses recorded today.
                </Text>
              ) : (
                expenses.map((expense, index) => (
                  <View
                    key={expense.id}
                    style={[
                      styles.expenseRow,
                      index ===
                        expenses.length - 1 &&
                        styles.lastRow,
                    ]}
                  >
                    <View
                      style={styles.expenseInfo}
                    >
                      <Text
                        style={styles.expenseTitle}
                      >
                        {expense.merchant ||
                          formatLabel(
                            expense.category,
                          )}
                      </Text>

                      <Text
                        style={styles.expenseDescription}
                      >
                        {expense.description ||
                          formatLabel(
                            expense.category,
                          )}
                      </Text>

                      <Text
                        style={styles.expenseMeta}
                      >
                        {formatLabel(
                          expense.category,
                        )}
                        {' • '}
                        {formatLabel(
                          expense.payment_method ||
                            'other',
                        )}
                        {' • '}
                        {expense.source}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.expenseRight
                      }
                    >
                      <Text
                        style={styles.expenseAmount}
                      >
                        ₹
                        {formatAmount(
                          expense.amount,
                        )}
                      </Text>

                      <Pressable
                        onPress={() =>
                          deleteExpense(
                            expense.id,
                          )
                        }
                      >
                        <Text
                          style={styles.deleteText}
                        >
                          Delete
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </View>

            <Text style={styles.sectionTitle}>
              Spending Overview
            </Text>

            <View style={styles.summaryCard}>
              <Detail
                title="Today"
                value={`₹${formatAmount(
                  daily?.total_amount ?? 0,
                )}`}
              />

              <Detail
                title="Today transactions"
                value={`${daily?.expense_count ?? 0}`}
              />

              <Detail
                title="This month"
                value={`₹${formatAmount(
                  monthlyAmount,
                )}`}
              />

              <Detail
                title="Monthly transactions"
                value={`${monthly?.expense_count ?? 0}`}
                last
              />
            </View>

            <Text style={styles.sectionTitle}>
              Insights
            </Text>

            <View style={styles.insightCard}>
              {insights &&
              Object.keys(insights).length > 0 ? (
                Object.entries(insights)
                  .slice(0, 6)
                  .map(([key, value]) => (
                    <Detail
                      key={key}
                      title={formatLabel(key)}
                      value={formatInsightValue(
                        value,
                      )}
                    />
                  ))
              ) : (
                <Text style={styles.emptyText}>
                  No spending insights available
                  yet.
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatAmount(value: number) {
  return Number(value || 0).toLocaleString(
    'en-IN',
    {
      maximumFractionDigits: 2,
    },
  );
}

function formatLabel(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatInsightValue(
  value: unknown,
) {
  if (typeof value === 'number') {
    return value.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
    });
  }

  if (
    typeof value === 'object' &&
    value !== null
  ) {
    return JSON.stringify(value);
  }

  return String(value ?? '—');
}

function Metric({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>
        {title}
      </Text>

      <Text style={styles.metricValue}>
        {value}
      </Text>
    </View>
  );
}

function Detail({
  title,
  value,
  last = false,
}: {
  title: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.detailRow,
        last && styles.detailRowLast,
      ]}
    >
      <Text style={styles.detailTitle}>
        {title}
      </Text>

      <Text style={styles.detailValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0D10',
  },

  content: {
    padding: 24,
    paddingBottom: 120,
  },

  eyebrow: {
    color: '#7F8794',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '800',
    marginTop: 8,
  },

  subtitle: {
    color: '#929AA6',
    fontSize: 15,
    marginTop: 6,
    marginBottom: 24,
  },

  loader: {
    marginTop: 50,
  },

  dateCard: {
    backgroundColor: '#15181D',
    borderWidth: 1,
    borderColor: '#242830',
    borderRadius: 18,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardLabel: {
    color: '#7F8794',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  date: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
  },

  status: {
    color: '#55D69A',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  heroCard: {
    backgroundColor: '#15181D',
    borderWidth: 1,
    borderColor: '#242830',
    borderRadius: 18,
    padding: 24,
    marginBottom: 12,
  },

  heroLabel: {
    color: '#7F8794',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  heroValue: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '800',
    marginTop: 8,
  },

  heroSubtext: {
    color: '#929AA6',
    fontSize: 14,
    marginTop: 4,
  },

  grid: {
    gap: 12,
  },

  metricCard: {
    backgroundColor: '#15181D',
    borderWidth: 1,
    borderColor: '#242830',
    borderRadius: 18,
    padding: 20,
  },

  metricTitle: {
    color: '#9AA1AC',
    fontSize: 14,
    fontWeight: '600',
  },

  metricValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 8,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 32,
    marginBottom: 12,
  },

  formCard: {
    backgroundColor: '#15181D',
    borderWidth: 1,
    borderColor: '#242830',
    borderRadius: 18,
    padding: 20,
  },

  inputLabel: {
    color: '#7F8794',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 9,
  },

  selector: {
    gap: 8,
    paddingBottom: 16,
  },

  option: {
    borderWidth: 1,
    borderColor: '#2A2F37',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },

  optionSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },

  optionText: {
    color: '#929AA6',
    fontSize: 12,
    fontWeight: '600',
  },

  optionTextSelected: {
    color: '#0B0D10',
  },

  input: {
    backgroundColor: '#0B0D10',
    borderWidth: 1,
    borderColor: '#292E37',
    borderRadius: 11,
    color: '#FFFFFF',
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },

  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  saveButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 11,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButtonText: {
    color: '#0B0D10',
    fontSize: 13,
    fontWeight: '800',
  },

  buttonPressed: {
    opacity: 0.7,
  },

  buttonDisabled: {
    opacity: 0.55,
  },

  message: {
    color: '#929AA6',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },

  list: {
    backgroundColor: '#15181D',
    borderWidth: 1,
    borderColor: '#242830',
    borderRadius: 18,
    overflow: 'hidden',
  },

  expenseRow: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#242830',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  lastRow: {
    borderBottomWidth: 0,
  },

  expenseInfo: {
    flex: 1,
    marginRight: 15,
  },

  expenseTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  expenseDescription: {
    color: '#D0D4DA',
    fontSize: 13,
    marginTop: 4,
  },

  expenseMeta: {
    color: '#7F8794',
    fontSize: 10,
    marginTop: 5,
  },

  expenseRight: {
    alignItems: 'flex-end',
  },

  expenseAmount: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  deleteText: {
    color: '#8E959F',
    fontSize: 11,
    marginTop: 5,
  },

  summaryCard: {
    backgroundColor: '#15181D',
    borderWidth: 1,
    borderColor: '#242830',
    borderRadius: 18,
    overflow: 'hidden',
  },

  insightCard: {
    backgroundColor: '#15181D',
    borderWidth: 1,
    borderColor: '#242830',
    borderRadius: 18,
    overflow: 'hidden',
  },

  detailRow: {
    paddingHorizontal: 20,
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: '#242830',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  detailRowLast: {
    borderBottomWidth: 0,
  },

  detailTitle: {
    color: '#929AA6',
    fontSize: 14,
    flex: 1,
  },

  detailValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    maxWidth: '55%',
    textAlign: 'right',
  },

  emptyText: {
    color: '#7F8794',
    padding: 20,
    fontSize: 14,
  },
});