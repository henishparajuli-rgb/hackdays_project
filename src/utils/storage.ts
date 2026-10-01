import { LoggedMeal, UserProfile } from '../types';

const PROFILE_KEY = 'nutrisnap_profile';
const MEALS_KEY = 'nutrisnap_meals';
const THEME_KEY = 'nutrisnap_theme';

/**
 * Format a Date object into YYYY-MM-DD
 */
export function formatDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Load user profile from localStorage
 */
export function getStoredProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch (e) {
    console.error('Failed to load profile from localStorage', e);
    return null;
  }
}

/**
 * Save user profile to localStorage
 */
export function saveStoredProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile to localStorage', e);
  }
}

/**
 * Load all logged meals from localStorage
 */
export function getStoredMeals(): LoggedMeal[] {
  try {
    const raw = localStorage.getItem(MEALS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LoggedMeal[];
  } catch (e) {
    console.error('Failed to load meals from localStorage', e);
    return [];
  }
}

/**
 * Save meals list to localStorage
 */
export function saveAllMeals(meals: LoggedMeal[]): void {
  try {
    localStorage.setItem(MEALS_KEY, JSON.stringify(meals));
  } catch (e) {
    console.error('Failed to save meals to localStorage', e);
  }
}

/**
 * Add or append a meal
 */
export function logMeal(meal: LoggedMeal): void {
  const current = getStoredMeals();
  const updated = [meal, ...current];
  saveAllMeals(updated);
}

/**
 * Update an existing meal
 */
export function updateMeal(updatedMeal: LoggedMeal): void {
  const current = getStoredMeals();
  const updated = current.map(m => (m.id === updatedMeal.id ? updatedMeal : m));
  saveAllMeals(updated);
}

/**
 * Delete a meal by ID
 */
export function deleteMeal(mealId: string): void {
  const current = getStoredMeals();
  const updated = current.filter(m => m.id !== mealId);
  saveAllMeals(updated);
}

/**
 * Get meals for a specific date (YYYY-MM-DD)
 */
export function getMealsForDate(dateKey: string): LoggedMeal[] {
  const current = getStoredMeals();
  return current.filter(m => m.dateKey === dateKey);
}

/**
 * Reset/clear today's meal logs
 */
export function clearMealsForDate(dateKey: string): void {
  const current = getStoredMeals();
  const updated = current.filter(m => m.dateKey !== dateKey);
  saveAllMeals(updated);
}

/**
 * Theme storage
 */
export function getStoredTheme(): 'light' | 'dark' {
  try {
    const theme = localStorage.getItem(THEME_KEY);
    if (theme === 'dark' || theme === 'light') return theme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function saveStoredTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error('Failed to save theme', e);
  }
}

/**
 * Export meal logs to CSV format and trigger download
 */
export function exportMealsToCSV(meals: LoggedMeal[]): void {
  if (!meals || meals.length === 0) {
    alert('No meals found to export.');
    return;
  }

  const headers = [
    'Date',
    'Time',
    'Meal Type',
    'Food Items',
    'Weight (g)',
    'Calories (kcal)',
    'Protein (g)',
    'Carbs (g)',
    'Fat (g)',
    'Notes'
  ];

  const rows = meals.map(meal => {
    const dateObj = new Date(meal.timestamp);
    const dateStr = meal.dateKey;
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const itemsSummary = meal.items.map(it => `${it.name} (${it.weight_g}g)`).join('; ');
    const totalWeight = meal.items.reduce((acc, it) => acc + (it.weight_g || 0), 0);

    return [
      `"${dateStr}"`,
      `"${timeStr}"`,
      `"${meal.mealType.toUpperCase()}"`,
      `"${itemsSummary.replace(/"/g, '""')}"`,
      totalWeight,
      meal.totalCalories,
      meal.totalProtein,
      meal.totalCarbs,
      meal.totalFat,
      `"${(meal.notes || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `nutrisnap_food_log_${formatDateKey()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Pre-populate initial starter state if user is brand new, so the experience is immediately rich
 */
export function seedSampleData(): void {
  const existingProfile = getStoredProfile();
  if (!existingProfile) {
    const defaultProfile: UserProfile = {
      weightKg: 70,
      heightFt: 5,
      heightIn: 9,
      age: 26,
      sex: 'male',
      activityLevel: 'moderate',
      goal: 'lose',
    };
    saveStoredProfile(defaultProfile);
  }

  const existingMeals = getStoredMeals();
  if (existingMeals.length === 0) {
    const today = formatDateKey(new Date());
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = formatDateKey(yesterdayDate);

    const sampleMeals: LoggedMeal[] = [
      {
        id: 'sample-meal-1',
        dateKey: today,
        timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
        mealType: 'breakfast',
        items: [
          {
            name: 'Oatmeal with Almond Milk & Berries',
            calories_per_100g: 75,
            protein_g_per_100g: 3.5,
            carbs_g_per_100g: 14.0,
            fat_g_per_100g: 1.8,
            confidence: 'high',
            weight_g: 250,
            totalCalories: 188,
            totalProtein: 8.8,
            totalCarbs: 35.0,
            totalFat: 4.5,
          },
          {
            name: 'Boiled Egg',
            calories_per_100g: 155,
            protein_g_per_100g: 13.0,
            carbs_g_per_100g: 1.1,
            fat_g_per_100g: 11.0,
            confidence: 'high',
            weight_g: 50,
            totalCalories: 78,
            totalProtein: 6.5,
            totalCarbs: 0.6,
            totalFat: 5.5,
          }
        ],
        totalCalories: 266,
        totalProtein: 15.3,
        totalCarbs: 35.6,
        totalFat: 10.0,
        notes: 'Wholesome balanced breakfast'
      },
      {
        id: 'sample-meal-2',
        dateKey: today,
        timestamp: new Date(Date.now() - 1 * 3600000).toISOString(),
        mealType: 'lunch',
        items: [
          {
            name: 'Nepali Dal Bhat & Tarkari',
            calories_per_100g: 140,
            protein_g_per_100g: 4.5,
            carbs_g_per_100g: 26.0,
            fat_g_per_100g: 2.2,
            confidence: 'high',
            weight_g: 350,
            totalCalories: 490,
            totalProtein: 15.8,
            totalCarbs: 91.0,
            totalFat: 7.7,
          },
          {
            name: 'Saag (Sautéed Greens)',
            calories_per_100g: 65,
            protein_g_per_100g: 2.8,
            carbs_g_per_100g: 4.0,
            fat_g_per_100g: 4.2,
            confidence: 'high',
            weight_g: 100,
            totalCalories: 65,
            totalProtein: 2.8,
            totalCarbs: 4.0,
            totalFat: 4.2,
          }
        ],
        totalCalories: 555,
        totalProtein: 18.6,
        totalCarbs: 95.0,
        totalFat: 11.9,
        notes: 'Traditional steamed rice with yellow dal, spiced vegetables and saag',
        photoUrl: '/src/assets/images/nutrisnap_dal_bhat_1790831458467.jpg'
      },
      {
        id: 'sample-meal-3',
        dateKey: yesterday,
        timestamp: new Date(Date.now() - 28 * 3600000).toISOString(),
        mealType: 'dinner',
        items: [
          {
            name: 'Steamed Chicken Momo with Chutney',
            calories_per_100g: 180,
            protein_g_per_100g: 12.0,
            carbs_g_per_100g: 19.5,
            fat_g_per_100g: 6.0,
            confidence: 'high',
            weight_g: 250,
            totalCalories: 450,
            totalProtein: 30.0,
            totalCarbs: 48.8,
            totalFat: 15.0,
          }
        ],
        totalCalories: 450,
        totalProtein: 30.0,
        totalCarbs: 48.8,
        totalFat: 15.0,
        notes: 'Steamed dumplings with spicy tomato sesame achar',
        photoUrl: '/src/assets/images/nutrisnap_momo_dish_1790831480700.jpg'
      }
    ];

    saveAllMeals(sampleMeals);
  }
}
