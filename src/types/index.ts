export type Sex = 'male' | 'female';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active' | 'athlete';

export type Goal = 'lose' | 'maintain' | 'gain';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface UserProfile {
  weightKg: number;
  heightFt: number;
  heightIn: number;
  age: number;
  sex: Sex;
  activityLevel: ActivityLevel;
  goal: Goal;
  customTargetCalories?: number;
}

export interface MetricSummary {
  heightCm: number;
  bmr: number;
  tdee: number;
  targetCalories: number;
  bmi: number;
  bmiCategory: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
  deficitOrSurplus: number; // positive = deficit (under TDEE), negative = surplus
  weeklyEstimatedKgChange: number; // kg change estimated per week (negative = weight loss, positive = gain)
}

export interface FoodItemDetection {
  id?: string;
  name: string;
  calories_per_100g: number;
  protein_g_per_100g: number;
  carbs_g_per_100g: number;
  fat_g_per_100g: number;
  confidence?: 'low' | 'medium' | 'high';
  suggested_weight_g?: number;
  weight_g: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface LoggedMeal {
  id: string;
  dateKey: string; // YYYY-MM-DD
  timestamp: string; // ISO
  mealType: MealType;
  items: FoodItemDetection[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  photoUrl?: string;
  notes?: string;
}

export interface DailySummary {
  dateKey: string;
  caloriesConsumed: number;
  targetCalories: number;
  tdee: number;
  deficitOrSurplus: number;
  mealsCount: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}
