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

import {
  getNutrition,
  getTodayMeals,
  createMeal,
  deleteMealRecord,
} from '../services/api';

type NutritionData = {
  date: string;
  calories: number;
  protein_grams: number;
  meals_expected: number;
  meals_completed: number;
  meals_pending: number;
};

type Meal = {
  id: number;
  date: string;
  meal_type: string;
  meal_time: string;
  description: string;
  calories: number | null;
  protein_grams: number | null;
  notes: string | null;
};

const MEAL_TYPES = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
];

export default function NutritionScreen() {
  const [data, setData] =
    useState<NutritionData | null>(null);

  const [meals, setMeals] =
    useState<Meal[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [mealType, setMealType] =
    useState('breakfast');

  const [mealTime, setMealTime] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [calories, setCalories] =
    useState('');

  const [protein, setProtein] =
    useState('');

  const [notes, setNotes] =
    useState('');

  const [message, setMessage] =
    useState('');

  async function loadNutrition() {
    try {
      const [
        summary,
        todayMeals,
      ] = await Promise.all([
        getNutrition(),
        getTodayMeals(),
      ]);

      setData(
        summary as NutritionData,
      );

      setMeals(
        todayMeals as Meal[],
      );
    } catch (error) {
      console.error(
        'Nutrition API:',
        error,
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNutrition();
  }, []);

  async function addMeal() {
    if (!description.trim()) {
      setMessage(
        'Enter what you ate first.',
      );
      return;
    }

    const caloriesValue =
      calories.trim()
        ? Number(calories)
        : null;

    const proteinValue =
      protein.trim()
        ? Number(protein)
        : null;

    if (
      (caloriesValue !== null &&
        Number.isNaN(caloriesValue)) ||
      (proteinValue !== null &&
        Number.isNaN(proteinValue))
    ) {
      setMessage(
        'Calories and protein must be numbers.',
      );
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      await createMeal({
        meal_type: mealType,
        meal_time:
          mealTime || '00:00',
        description:
          description.trim(),
        calories: caloriesValue,
        protein_grams: proteinValue,
        notes:
          notes.trim() || null,
      });

      setDescription('');
      setMealTime('');
      setCalories('');
      setProtein('');
      setNotes('');

      setMessage(
        'Meal saved.',
      );

      await loadNutrition();
    } catch (error) {
      console.error(
        'Meal API:',
        error,
      );

      setMessage(
        'Could not save the meal.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteMeal(
    mealId: number,
  ) {
    try {
      await deleteMealRecord(
        mealId,
      );

      await loadNutrition();
    } catch (error) {
      console.error(
        'Delete meal:',
        error,
      );
    }
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <Text
          style={styles.eyebrow}
        >
          SIVA OS
        </Text>

        <Text
          style={styles.title}
        >
          Nutrition
        </Text>

        <Text
          style={styles.subtitle}
        >
          Meals, calories and protein.
        </Text>

        {loading ? (
          <ActivityIndicator
            style={styles.loader}
          />
        ) : (
          <>
            <View
              style={styles.dateCard}
            >
              <View>
                <Text
                  style={styles.cardLabel}
                >
                  TODAY
                </Text>

                <Text
                  style={styles.date}
                >
                  {data?.date ?? '—'}
                </Text>
              </View>

              <Text
                style={styles.live}
              >
                LIVE
              </Text>
            </View>

            <View
              style={styles.grid}
            >
              <Metric
                title="Calories"
                value={`${data?.calories ?? 0} kcal`}
              />

              <Metric
                title="Protein"
                value={`${data?.protein_grams ?? 0} g`}
              />

              <Metric
                title="Meals"
                value={`${data?.meals_completed ?? 0}/${data?.meals_expected ?? 0}`}
              />
            </View>

            <Text
              style={styles.sectionTitle}
            >
              Add Meal
            </Text>

            <View
              style={styles.formCard}
            >
              <Text
                style={styles.inputLabel}
              >
                MEAL TYPE
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
                {MEAL_TYPES.map(
                  (type) => (
                    <Pressable
                      key={type}
                      onPress={() =>
                        setMealType(
                          type,
                        )
                      }
                      style={[
                        styles.option,
                        mealType ===
                          type &&
                          styles.optionSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          mealType ===
                            type &&
                            styles.optionTextSelected,
                        ]}
                      >
                        {capitalize(
                          type,
                        )}
                      </Text>
                    </Pressable>
                  ),
                )}
              </ScrollView>

              <Text
                style={styles.inputLabel}
              >
                TIME
              </Text>

              <TextInput
                value={mealTime}
                onChangeText={
                  setMealTime
                }
                placeholder="HH:MM"
                placeholderTextColor="#5F6672"
                style={styles.input}
              />

              <Text
                style={styles.inputLabel}
              >
                WHAT DID YOU EAT?
              </Text>

              <TextInput
                value={description}
                onChangeText={
                  setDescription
                }
                placeholder="e.g. Chicken, rice and curd"
                placeholderTextColor="#5F6672"
                style={styles.input}
              />

              <View
                style={styles.twoColumns}
              >
                <View
                  style={styles.column}
                >
                  <Text
                    style={
                      styles.inputLabel
                    }
                  >
                    CALORIES
                  </Text>

                  <TextInput
                    value={calories}
                    onChangeText={
                      setCalories
                    }
                    placeholder="kcal"
                    placeholderTextColor="#5F6672"
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </View>

                <View
                  style={styles.column}
                >
                  <Text
                    style={
                      styles.inputLabel
                    }
                  >
                    PROTEIN
                  </Text>

                  <TextInput
                    value={protein}
                    onChangeText={
                      setProtein
                    }
                    placeholder="grams"
                    placeholderTextColor="#5F6672"
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </View>
              </View>

              <Text
                style={styles.inputLabel}
              >
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
                onPress={addMeal}
                disabled={saving}
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed &&
                    styles.pressed,
                  saving &&
                    styles.disabled,
                ]}
              >
                {saving ? (
                  <ActivityIndicator
                    color="#0B0D10"
                  />
                ) : (
                  <Text
                    style={
                      styles.saveText
                    }
                  >
                    Save Meal
                  </Text>
                )}
              </Pressable>

              {message ? (
                <Text
                  style={styles.message}
                >
                  {message}
                </Text>
              ) : null}
            </View>

            <Text
              style={styles.sectionTitle}
            >
              Today's Meals
            </Text>

            <View
              style={styles.list}
            >
              {meals.length === 0 ? (
                <Text
                  style={styles.empty}
                >
                  No meals recorded today.
                </Text>
              ) : (
                meals.map(
                  (meal, index) => (
                    <View
                      key={meal.id}
                      style={[
                        styles.mealRow,
                        index ===
                          meals.length -
                            1 &&
                          styles.lastRow,
                      ]}
                    >
                      <View
                        style={
                          styles.mealInfo
                        }
                      >
                        <Text
                          style={
                            styles.mealType
                          }
                        >
                          {capitalize(
                            meal.meal_type,
                          )}
                        </Text>

                        <Text
                          style={
                            styles.description
                          }
                        >
                          {
                            meal.description
                          }
                        </Text>

                        <Text
                          style={
                            styles.meta
                          }
                        >
                          {
                            meal.meal_time
                          }

                          {meal.calories !=
                          null
                            ? ` • ${meal.calories} kcal`
                            : ''}

                          {meal.protein_grams !=
                          null
                            ? ` • ${meal.protein_grams}g protein`
                            : ''}
                        </Text>
                      </View>

                      <Pressable
                        onPress={() =>
                          handleDeleteMeal(
                            meal.id,
                          )
                        }
                      >
                        <Text
                          style={
                            styles.delete
                          }
                        >
                          Delete
                        </Text>
                      </Pressable>
                    </View>
                  ),
                )
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function capitalize(
  value: string,
) {
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

function Metric({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <View
      style={styles.metricCard}
    >
      <Text
        style={styles.metricTitle}
      >
        {title}
      </Text>

      <Text
        style={styles.metricValue}
      >
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
    marginBottom: 16,
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

  live: {
    color: '#55D69A',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
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
    fontSize: 30,
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
    paddingHorizontal: 14,
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

  twoColumns: {
    flexDirection: 'row',
    gap: 12,
  },

  column: {
    flex: 1,
  },

  saveButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 11,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveText: {
    color: '#0B0D10',
    fontSize: 13,
    fontWeight: '800',
  },

  pressed: {
    opacity: 0.7,
  },

  disabled: {
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

  empty: {
    color: '#7F8794',
    padding: 20,
    fontSize: 14,
  },

  mealRow: {
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

  mealInfo: {
    flex: 1,
    marginRight: 15,
  },

  mealType: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  description: {
    color: '#D0D4DA',
    fontSize: 14,
    marginTop: 4,
  },

  meta: {
    color: '#7F8794',
    fontSize: 11,
    marginTop: 5,
  },

  delete: {
    color: '#8E959F',
    fontSize: 11,
  },
});