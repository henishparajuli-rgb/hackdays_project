import { ActivityLevel, Goal, Sex, UserProfile, MetricSummary } from '../types';

/**
 * Convert feet + inches into centimeters
 * cm = (ft * 12 + in) * 2.54
 */
export function convertFeetInchesToCm(feet: number, inches: number): number {
  const totalInches = (Number(feet) || 0) * 12 + (Number(inches) || 0);
  return Math.round(totalInches * 2.54 * 10) / 10;
}

/**
 * Convert cm back to feet and inches for UI inputs
 */
export function convertCmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

/**
 * Mifflin-St Jeor equation for Basal Metabolic Rate (BMR)
 * Male: (10 × kg) + (6.25 × cm) − (5 × age) + 5
 * Female: (10 × kg) + (6.25 × cm) − (5 × age) − 161
 */
export function calculateBMR(weightKg: number, heightCm: number, age: number, sex: Sex): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = sex === 'male' ? base + 5 : base - 161;
  return Math.round(Math.max(800, bmr));
}

/**
 * Activity level multiplier mapping
 */
export function getActivityMultiplier(level: ActivityLevel): number {
  switch (level) {
    case 'sedentary':
      return 1.2;
    case 'light':
      return 1.375;
    case 'moderate':
      return 1.55;
    case 'very_active':
      return 1.725;
    case 'athlete':
      return 1.9;
    default:
      return 1.2;
  }
}

/**
 * Total Daily Energy Expenditure (TDEE) = BMR × Activity Multiplier
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multiplier = getActivityMultiplier(activityLevel);
  return Math.round(bmr * multiplier);
}

/**
 * Calculate recommended daily calorie intake target based on user goal
 * Lose: TDEE - 500 (never below BMR or 1200 kcal)
 * Maintain: TDEE
 * Gain: TDEE + 300
 */
export function calculateTargetCalories(tdee: number, bmr: number, goal: Goal): number {
  if (goal === 'lose') {
    const rawTarget = tdee - 500;
    // Safety guardrail: do not drop below BMR or absolute safe minimum of 1200 kcal
    const safeMinimum = Math.max(1200, Math.min(bmr, tdee - 200));
    return Math.round(Math.max(safeMinimum, rawTarget));
  } else if (goal === 'gain') {
    return Math.round(tdee + 300);
  }
  return Math.round(tdee);
}

/**
 * Calculate Body Mass Index (BMI) and categorization
 * BMI = kg / (m^2)
 */
export function calculateBMI(weightKg: number, heightCm: number): { bmi: number; category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese' } {
  if (!weightKg || !heightCm) {
    return { bmi: 22.0, category: 'Normal' };
  }
  const heightM = heightCm / 100;
  const rawBMI = weightKg / (heightM * heightM);
  const bmi = Math.round(rawBMI * 10) / 10;

  let category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese' = 'Normal';
  if (bmi < 18.5) {
    category = 'Underweight';
  } else if (bmi < 25.0) {
    category = 'Normal';
  } else if (bmi < 30.0) {
    category = 'Overweight';
  } else {
    category = 'Obese';
  }

  return { bmi, category };
}

/**
 * Compute full nutritional metric summary for a profile and current consumed calories
 */
export function computeMetrics(profile: UserProfile, totalCaloriesConsumedToday: number): MetricSummary {
  const heightCm = convertFeetInchesToCm(profile.heightFt, profile.heightIn);
  const bmr = calculateBMR(profile.weightKg, heightCm, profile.age, profile.sex);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const targetCalories = profile.customTargetCalories || calculateTargetCalories(tdee, bmr, profile.goal);
  const { bmi, category: bmiCategory } = calculateBMI(profile.weightKg, heightCm);

  // Deficit/surplus relative to TDEE (maintenance):
  // Positive = calorie deficit (ate less than burned)
  // Negative = calorie surplus (ate more than burned)
  const deficitOrSurplus = tdee - totalCaloriesConsumedToday;

  // 7700 kcal ≈ 1 kg of fat mass
  // If deficit is +500 kcal/day, projected 7-day weight change is (-500 * 7) / 7700 = -0.45 kg
  const weeklyEstimatedKgChange = Math.round(((-deficitOrSurplus * 7) / 7700) * 100) / 100;

  return {
    heightCm,
    bmr,
    tdee,
    targetCalories,
    bmi,
    bmiCategory,
    deficitOrSurplus,
    weeklyEstimatedKgChange,
  };
}

/**
 * Calculate per-item totals based on weight in grams
 * calories = (calories_per_100g / 100) × weight_in_grams
 */
export function calculateItemNutrients(
  calories_per_100g: number,
  protein_g_per_100g: number,
  carbs_g_per_100g: number,
  fat_g_per_100g: number,
  weight_g: number
) {
  const factor = (Number(weight_g) || 0) / 100;
  return {
    totalCalories: Math.round(calories_per_100g * factor),
    totalProtein: Math.round(protein_g_per_100g * factor * 10) / 10,
    totalCarbs: Math.round(carbs_g_per_100g * factor * 10) / 10,
    totalFat: Math.round(fat_g_per_100g * factor * 10) / 10,
  };
}
