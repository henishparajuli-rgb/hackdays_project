import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Plus, Trash2, Check, AlertCircle, RefreshCw, Sparkles, Scale, Info, ChevronRight, Video, VideoOff } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FoodItemDetection, LoggedMeal, MealType } from '../types';
import { calculateItemNutrients } from '../utils/calculations';
import { formatDateKey } from '../utils/storage';

interface FoodScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMeal: (meal: LoggedMeal) => void;
}

// Preset portion sizes in grams
const GRAM_PRESETS = [50, 100, 150, 200, 250, 300, 400];

// Sample showcase dishes ready to test with 1-click
const SAMPLE_TEST_DISHES = [
  {
    name: 'Authentic Nepali Dal Bhat',
    imagePath: '/src/assets/images/nutrisnap_dal_bhat_1790831458467.jpg',
    cuisine: 'Nepali / South Asian',
  },
  {
    name: 'Steamed Chicken Momo',
    imagePath: '/src/assets/images/nutrisnap_momo_dish_1790831480700.jpg',
    cuisine: 'Himalayan / Nepali',
  },
  {
    name: 'Healthy Grain & Protein Bowl',
    imagePath: '/src/assets/images/nutrisnap_healthy_bowl_1790831496085.jpg',
    cuisine: 'Balanced Fitness Bowl',
  },
];

export const FoodScannerModal: React.FC<FoodScannerModalProps> = ({
  isOpen,
  onClose,
  onSaveMeal,
}) => {
  // Step: 'capture' | 'analyzing' | 'review'
  const [step, setStep] = useState<'capture' | 'analyzing' | 'review'>('capture');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [detectedItems, setDetectedItems] = useState<FoodItemDetection[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [scanStatusIndex, setScanStatusIndex] = useState<number>(0);

  // Live Camera Stream State
  const [isLiveCameraActive, setIsLiveCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const scanningStatuses = [
    'Scanning food geometry & portion depths...',
    'Identifying ingredients and regional dishes...',
    'Matching Nepali & South Asian nutritional profiles...',
    'Calculating caloric density & macronutrient ratios...',
  ];

  // Cycle through scanning status messages for delightful micro-feedback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'analyzing') {
      interval = setInterval(() => {
        setScanStatusIndex(prev => (prev + 1) % scanningStatuses.length);
      }, 900);
    }
    return () => clearInterval(interval);
  }, [step]);

  // Clean up webcam stream on unmount or close
  useEffect(() => {
    if (!isOpen) {
      stopLiveCamera();
      resetState();
    }
  }, [isOpen]);

  const stopLiveCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
    setIsLiveCameraActive(false);
  };

  const startLiveCamera = async () => {
    try {
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsLiveCameraActive(true);
    } catch (err: any) {
      console.warn('Live camera permission error:', err);
      // Fallback to standard input capture
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    }
  };

  const captureFrameFromLiveCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    stopLiveCamera();
    processBase64Image(dataUrl);
  };

  const resetState = () => {
    setStep('capture');
    setImagePreview(null);
    setDetectedItems([]);
    setNotes('');
    setErrorMsg(null);
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      processBase64Image(base64Data);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleSampleSelect = async (samplePath: string, name: string) => {
    try {
      setErrorMsg(null);
      setImagePreview(samplePath);
      setStep('analyzing');

      // Fetch the asset and convert to base64
      const response = await fetch(samplePath);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        sendToVisionAI(base64String);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Error loading sample image:', err);
      setErrorMsg('Failed to load sample image.');
      setStep('capture');
    }
  };

  const processBase64Image = (base64Url: string) => {
    setErrorMsg(null);
    setImagePreview(base64Url);
    setStep('analyzing');
    sendToVisionAI(base64Url);
  };

  const sendToVisionAI = async (base64Url: string) => {
    try {
      // Strip data url prefix for API payload if present
      const base64Content = base64Url.includes(',')
        ? base64Url.split(',')[1]
        : base64Url;

      const res = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Content,
          mimeType: 'image/jpeg',
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned error status: ${res.status}`);
      }

      const data = await res.json();

      if (!data.items || data.items.length === 0) {
        setErrorMsg(
          data.notes ||
          'No recognizable food was detected in this photo. Please make sure the food is well-lit and clearly visible.'
        );
        setStep('capture');
        return;
      }

      // Initialize items with portion sizes & calculations
      const initializedItems: FoodItemDetection[] = data.items.map((item: any, index: number) => {
        const weight = item.suggested_weight_g || 150;
        const calPer100g = item.calories_per_100g || 120;
        const proteinPer100g = item.protein_g_per_100g || 5;
        const carbsPer100g = item.carbs_g_per_100g || 15;
        const fatPer100g = item.fat_g_per_100g || 3;

        const calculated = calculateItemNutrients(
          calPer100g,
          proteinPer100g,
          carbsPer100g,
          fatPer100g,
          weight
        );

        return {
          id: `item-${Date.now()}-${index}`,
          name: item.name || 'Food Item',
          calories_per_100g: calPer100g,
          protein_g_per_100g: proteinPer100g,
          carbs_g_per_100g: carbsPer100g,
          fat_g_per_100g: fatPer100g,
          confidence: item.confidence || 'high',
          weight_g: weight,
          totalCalories: calculated.totalCalories,
          totalProtein: calculated.totalProtein,
          totalCarbs: calculated.totalCarbs,
          totalFat: calculated.totalFat,
        };
      });

      setDetectedItems(initializedItems);
      setNotes(data.notes || '');
      setStep('review');
    } catch (err: any) {
      console.error('AI food analysis failure:', err);
      setErrorMsg(
        'Unable to complete AI photo recognition. You can try another photo or enter food items manually.'
      );
      setStep('capture');
    }
  };

  // Update item fields (weight, name, calories_per_100g)
  const handleItemChange = (index: number, field: string, value: any) => {
    setDetectedItems(prev => {
      const next = [...prev];
      const item = { ...next[index], [field]: value };

      // Recalculate if weight or per-100g values change
      if (['weight_g', 'calories_per_100g', 'protein_g_per_100g', 'carbs_g_per_100g', 'fat_g_per_100g'].includes(field)) {
        const weight = Number(item.weight_g) || 0;
        const cal100 = Number(item.calories_per_100g) || 0;
        const p100 = Number(item.protein_g_per_100g) || 0;
        const c100 = Number(item.carbs_g_per_100g) || 0;
        const f100 = Number(item.fat_g_per_100g) || 0;

        const calculated = calculateItemNutrients(cal100, p100, c100, f100, weight);
        item.totalCalories = calculated.totalCalories;
        item.totalProtein = calculated.totalProtein;
        item.totalCarbs = calculated.totalCarbs;
        item.totalFat = calculated.totalFat;
      }

      next[index] = item;
      return next;
    });
  };

  const handleRemoveItem = (index: number) => {
    setDetectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddNewItem = () => {
    const newItem: FoodItemDetection = {
      id: `manual-item-${Date.now()}`,
      name: 'Custom Food Item',
      calories_per_100g: 150,
      protein_g_per_100g: 6,
      carbs_g_per_100g: 20,
      fat_g_per_100g: 4,
      weight_g: 100,
      confidence: 'high',
      totalCalories: 150,
      totalProtein: 6,
      totalCarbs: 20,
      totalFat: 4,
    };
    setDetectedItems(prev => [...prev, newItem]);
  };

  const handleConfirmLog = () => {
    if (detectedItems.length === 0) {
      setErrorMsg('Please add at least one food item before logging.');
      return;
    }

    const totalCalories = detectedItems.reduce((sum, item) => sum + item.totalCalories, 0);
    const totalProtein = Math.round(detectedItems.reduce((sum, item) => sum + item.totalProtein, 0) * 10) / 10;
    const totalCarbs = Math.round(detectedItems.reduce((sum, item) => sum + item.totalCarbs, 0) * 10) / 10;
    const totalFat = Math.round(detectedItems.reduce((sum, item) => sum + item.totalFat, 0) * 10) / 10;

    const newMeal: LoggedMeal = {
      id: `meal-${Date.now()}`,
      dateKey: formatDateKey(new Date()),
      timestamp: new Date().toISOString(),
      mealType,
      items: detectedItems,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      photoUrl: imagePreview || undefined,
      notes: notes || undefined,
    };

    onSaveMeal(newMeal);

    // Micro-interaction celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#3A2D28', '#D97706', '#16A34A', '#2563EB'],
      });
    } catch {
      // ignore
    }

    onClose();
  };

  if (!isOpen) return null;

  const totalMealCalories = detectedItems.reduce((sum, it) => sum + it.totalCalories, 0);
  const totalMealProtein = Math.round(detectedItems.reduce((sum, it) => sum + it.totalProtein, 0) * 10) / 10;
  const totalMealCarbs = Math.round(detectedItems.reduce((sum, it) => sum + it.totalCarbs, 0) * 10) / 10;
  const totalMealFat = Math.round(detectedItems.reduce((sum, it) => sum + it.totalFat, 0) * 10) / 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      
      {/* Modal Dialog Card */}
      <div className="glass-panel w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-[#3A2D28]/20 dark:border-[#F5EFEB]/20 animate-in fade-in duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3A2D28]/12 dark:border-[#F5EFEB]/12 bg-white dark:bg-[#1E1714]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#3A2D28] dark:bg-[#F5EFEB] text-[#F5EFEB] dark:text-[#3A2D28] flex items-center justify-center shadow-xs">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#3A2D28] dark:text-[#F5EFEB]">
                {step === 'capture' && 'Snap & Analyze Food'}
                {step === 'analyzing' && 'Analyzing Food Photograph...'}
                {step === 'review' && 'Review & Confirm Meal'}
              </h2>
              <p className="text-xs text-[#3A2D28]/70 dark:text-[#F5EFEB]/70 mt-0.5">
                {step === 'capture' && 'Upload a photo or capture with your camera'}
                {step === 'analyzing' && 'AI vision model calculating calories & macros'}
                {step === 'review' && 'Adjust portion weights and verify detected items'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#3A2D28]/70 hover:text-[#3A2D28] dark:text-[#F5EFEB]/70 dark:hover:text-white hover:bg-[#3A2D28]/10 dark:hover:bg-[#F5EFEB]/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* Error Message Banner */}
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-900 flex items-start gap-2.5 text-xs text-rose-950 dark:text-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div className="flex-1 font-semibold">{errorMsg}</div>
              <button onClick={() => setErrorMsg(null)} className="text-rose-600 hover:text-rose-900 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* STEP 1: CAPTURE & UPLOAD */}
          {step === 'capture' && (
            <div className="space-y-6">
              
              {/* Live WebCam Stream View (if active) */}
              {isLiveCameraActive ? (
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-80 flex items-center justify-center border border-slate-700">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 z-10">
                    <button
                      onClick={stopLiveCamera}
                      className="px-4 py-2 bg-slate-800/80 text-white rounded-xl text-xs font-semibold backdrop-blur hover:bg-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={captureFrameFromLiveCamera}
                      className="px-6 py-2.5 bg-[#3A2D28] hover:bg-[#261D19] text-white font-bold rounded-xl text-sm shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      Capture Photo
                    </button>
                  </div>
                </div>
              ) : (
                /* Drag & Drop Zone */
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    if (e.dataTransfer.files?.[0]) {
                      handleFileSelect(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer ${
                    isDragOver
                      ? 'border-[#3A2D28] bg-[#3A2D28]/10 dark:border-[#F5EFEB] dark:bg-[#F5EFEB]/15'
                      : 'border-[#3A2D28]/25 dark:border-[#F5EFEB]/25 hover:border-[#3A2D28] dark:hover:border-[#F5EFEB] bg-[#FAF8F5] dark:bg-[#1B1412]'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#3A2D28]/10 dark:bg-[#F5EFEB]/10 text-[#3A2D28] dark:text-[#F5EFEB] flex items-center justify-center">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-extrabold text-[#3A2D28] dark:text-[#F5EFEB] mb-1">
                    Drag and drop your food photo here
                  </h3>
                  <p className="text-xs text-[#3A2D28]/70 dark:text-[#F5EFEB]/70 mb-4">
                    Supports JPG, PNG, WEBP from your phone camera or gallery
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        startLiveCamera();
                      }}
                      className="px-4 py-2 text-xs font-bold text-white dark:text-[#3A2D28] bg-[#3A2D28] hover:bg-[#261D19] dark:bg-[#F5EFEB] dark:hover:bg-white rounded-xl flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Open Camera
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="px-4 py-2 text-xs font-bold text-[#3A2D28] dark:text-[#F5EFEB] bg-white dark:bg-[#231B18] border border-[#3A2D28]/20 dark:border-[#F5EFEB]/20 rounded-xl hover:bg-[#3A2D28]/5 dark:hover:bg-[#F5EFEB]/5 flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Browse Files
                    </button>
                  </div>

                  {/* Hidden standard file inputs */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                    }}
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                    }}
                  />
                </div>
              )}

              {/* Sample test photos row for immediate 1-click testing */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#3A2D28] dark:text-[#F5EFEB]">
                    Or Try With Sample Foods
                  </span>
                  <span className="text-[11px] text-[#3A2D28]/60 dark:text-[#F5EFEB]/60 font-mono font-medium">Instant AI recognition</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SAMPLE_TEST_DISHES.map((dish, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSampleSelect(dish.imagePath, dish.name)}
                      className="group p-2.5 rounded-2xl border border-[#3A2D28]/15 dark:border-[#F5EFEB]/15 bg-white dark:bg-[#1B1412] hover:border-[#3A2D28] dark:hover:border-[#F5EFEB] hover:shadow-md transition-all text-left flex items-center gap-3 cursor-pointer"
                    >
                      <img
                        src={dish.imagePath}
                        alt={dish.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#3A2D28] dark:text-[#F5EFEB] truncate">
                          {dish.name}
                        </div>
                        <div className="text-[10px] text-amber-700 dark:text-amber-400 font-bold mt-0.5">
                          {dish.cuisine}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* STEP 2: ANIMATED SCANNER STATE */}
          {step === 'analyzing' && (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              
              {/* Photo with Futuristic Laser Sweep Overlay in Amber/Gold */}
              <div className="relative w-64 h-64 rounded-3xl overflow-hidden shadow-xl border-2 border-[#3A2D28]/40 dark:border-[#F5EFEB]/40 mb-6 bg-slate-900">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Food being analyzed"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover filter brightness-90"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                    <Camera className="w-12 h-12" />
                  </div>
                )}

                {/* Laser scan bar */}
                <div className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_18px_#f59e0b] animate-scan-laser pointer-events-none" />

                {/* Target Corners HUD */}
                <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
                <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-amber-400 pointer-events-none" />
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 text-[#3A2D28] dark:text-[#F5EFEB] text-sm font-bold mb-1">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-600 dark:text-amber-400" />
                <span>{scanningStatuses[scanStatusIndex]}</span>
              </div>
              <p className="text-xs text-[#3A2D28]/70 dark:text-[#F5EFEB]/70 max-w-sm">
                Powered by visual intelligence trained on global & South Asian nutrition datasets
              </p>
            </div>
          )}

          {/* STEP 3: REVIEW & EDIT DETECTED FOOD ITEMS */}
          {step === 'review' && (
            <div className="space-y-6">
              
              {/* Meal Summary Top Bar */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1B1412] border border-[#3A2D28]/15 dark:border-[#F5EFEB]/15 flex flex-wrap items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Analyzed Meal"
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-xl object-cover border border-[#3A2D28]/20 dark:border-[#F5EFEB]/20 shadow-xs"
                    />
                  )}
                  <div>
                    <span className="text-[11px] font-bold text-[#3A2D28]/70 dark:text-[#F5EFEB]/70 uppercase tracking-wider">
                      Total Calculated Intake
                    </span>
                    <div className="text-2xl font-extrabold font-mono text-[#3A2D28] dark:text-[#F5EFEB] tabular-nums">
                      {totalMealCalories.toLocaleString()} <span className="text-sm font-normal text-[#3A2D28]/60 dark:text-[#F5EFEB]/60">kcal</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <div className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 font-bold">
                    P: <span>{totalMealProtein}g</span>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-bold">
                    C: <span>{totalMealCarbs}g</span>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-green-50 dark:bg-green-950/70 border border-green-200 dark:border-green-800 text-green-900 dark:text-green-200 font-bold">
                    F: <span>{totalMealFat}g</span>
                  </div>
                </div>
              </div>

              {/* Meal Type & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#3A2D28] dark:text-[#F5EFEB] mb-1.5">
                    Meal Type
                  </label>
                  <div className="grid grid-cols-4 gap-1 p-1 bg-white dark:bg-[#1B1412] border border-[#3A2D28]/15 dark:border-[#F5EFEB]/15 rounded-xl">
                    {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setMealType(t)}
                        className={`py-1.5 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer ${
                          mealType === t
                            ? 'bg-[#3A2D28] text-white dark:bg-[#F5EFEB] dark:text-[#3A2D28] shadow-xs'
                            : 'text-[#3A2D28]/70 hover:text-[#3A2D28] dark:text-[#F5EFEB]/70 dark:hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3A2D28] dark:text-[#F5EFEB] mb-1.5">
                    Notes / Details (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. light oil, extra dal, no sugar"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#3A2D28]/20 dark:border-[#F5EFEB]/20 bg-white dark:bg-[#1B1412] text-[#3A2D28] dark:text-[#F5EFEB] focus:outline-none focus:ring-2 focus:ring-[#3A2D28]"
                  />
                </div>
              </div>

              {/* Detected Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#3A2D28] dark:text-[#F5EFEB]">
                    Detected Food Items & Portions ({detectedItems.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddNewItem}
                    className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                {detectedItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-4 rounded-2xl border border-[#3A2D28]/15 dark:border-[#F5EFEB]/15 bg-white dark:bg-[#1B1412] space-y-3 shadow-xs"
                  >
                    {/* Item Title and Remove */}
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                        className="font-bold text-sm text-[#3A2D28] dark:text-[#F5EFEB] bg-transparent border-b border-transparent hover:border-[#3A2D28]/20 focus:border-[#3A2D28] focus:outline-none flex-1 py-0.5"
                      />
                      
                      <div className="flex items-center gap-2">
                        {item.confidence && (
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            item.confidence === 'high'
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                          }`}>
                            {item.confidence} confidence
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-[#3A2D28]/60 hover:text-rose-600 dark:text-[#F5EFEB]/60 dark:hover:text-rose-400 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Weight & Portion Selection */}
                    <div>
                      <div className="flex items-center justify-between text-xs text-[#3A2D28]/80 dark:text-[#F5EFEB]/80 mb-1.5">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Scale className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Portion Weight:</span>
                        </div>
                        <div className="flex items-center gap-1 font-mono">
                          <input
                            type="number"
                            min="10"
                            max="3000"
                            value={item.weight_g}
                            onChange={(e) => handleItemChange(idx, 'weight_g', Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-16 px-2 py-0.5 text-right font-bold text-xs bg-[#FAF8F5] dark:bg-[#231B18] border border-[#3A2D28]/20 dark:border-[#F5EFEB]/20 rounded-lg text-[#3A2D28] dark:text-[#F5EFEB] focus:outline-none focus:ring-1 focus:ring-[#3A2D28]"
                          />
                          <span className="font-bold text-[#3A2D28] dark:text-[#F5EFEB]">g</span>
                        </div>
                      </div>

                      {/* Quick Grams Preset Buttons */}
                      <div className="flex flex-wrap gap-1.5">
                        {GRAM_PRESETS.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleItemChange(idx, 'weight_g', preset)}
                            className={`px-3 py-1 text-xs rounded-xl font-mono font-bold transition-all cursor-pointer ${
                              item.weight_g === preset
                                ? 'bg-[#3A2D28] text-white dark:bg-[#F5EFEB] dark:text-[#3A2D28] shadow-xs'
                                : 'bg-[#FAF8F5] dark:bg-[#231B18] border border-[#3A2D28]/15 dark:border-[#F5EFEB]/15 text-[#3A2D28]/80 dark:text-[#F5EFEB]/80 hover:bg-[#3A2D28]/10 dark:hover:bg-[#F5EFEB]/10'
                            }`}
                          >
                            {preset}g
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Item Nutrient Output & Editable density */}
                    <div className="pt-2 border-t border-[#3A2D28]/10 dark:border-[#F5EFEB]/10 flex flex-wrap items-center justify-between text-xs font-mono text-[#3A2D28]/85 dark:text-[#F5EFEB]/85">
                      <div>
                        Calculated:{' '}
                        <span className="font-extrabold text-[#3A2D28] dark:text-[#F5EFEB] text-sm">
                          {item.totalCalories} kcal
                        </span>
                      </div>
                      <div className="text-[11px] text-[#3A2D28]/60 dark:text-[#F5EFEB]/60">
                        {item.calories_per_100g} kcal/100g · P: {item.totalProtein}g · C: {item.totalCarbs}g · F: {item.totalFat}g
                      </div>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-[#3A2D28]/12 dark:border-[#F5EFEB]/12 bg-white dark:bg-[#1E1714] flex items-center justify-between gap-3">
          {step === 'review' ? (
            <>
              <button
                type="button"
                onClick={() => setStep('capture')}
                className="px-4 py-2 text-xs font-bold text-[#3A2D28]/70 dark:text-[#F5EFEB]/70 hover:text-[#3A2D28] dark:hover:text-white cursor-pointer"
              >
                Retake Photo
              </button>
              <button
                type="button"
                onClick={handleConfirmLog}
                className="px-6 py-2.5 bg-[#3A2D28] hover:bg-[#261D19] dark:bg-[#F5EFEB] dark:hover:bg-white text-white dark:text-[#3A2D28] font-bold text-xs rounded-xl shadow-lg shadow-[#3A2D28]/25 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Log {totalMealCalories} kcal</span>
              </button>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-[#3A2D28]/70 dark:text-[#F5EFEB]/70 hover:text-[#3A2D28] dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
