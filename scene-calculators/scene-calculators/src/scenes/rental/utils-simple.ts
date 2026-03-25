import type { PricingTier } from "./interface";
import { FENCE_PRICING, MIN_RENTAL_DAYS } from "./configuration";

/**
 * Calculate pricing tier based on rental days
 */
export const getPricingTier = (days: number): PricingTier => {
  if (days <= 30) return "1-30";
  if (days <= 60) return "30-60";
  if (days <= 90) return "60-90";
  return "90+";
};

/**
 * Get rental pricing from static configuration (NO API)
 */
export function getRentalPricing(
  skus: string[],
  rentalDays: number,
): { totalCost: number; dailyRate: number } {
  const tier = getPricingTier(rentalDays);
  let totalDailyRate = 0;

  for (const sku of skus) {
    const pricing = FENCE_PRICING[sku];
    if (pricing && pricing[tier] !== undefined) {
      totalDailyRate += pricing[tier];
    }
  }

  return {
    totalCost: totalDailyRate * rentalDays,
    dailyRate: totalDailyRate,
  };
}

/**
 * Calculate scaffold rental cost based on pricing table and days
 */
export function calculateScaffoldCost(
  pricingTable: Record<string, { "24h": number; extra: number; week: number }>,
  rentalDays: number,
): number {
  const pricing = Object.values(pricingTable)[0]; // Get first entry as base pricing
  
  if (rentalDays === 1) {
    return pricing["24h"];
  }

  if (rentalDays <= 6) {
    return pricing["24h"] + pricing.extra * (rentalDays - 1);
  }

  const weeks = Math.floor(rentalDays / 7);
  const extraDays = rentalDays % 7;
  let total = weeks * pricing.week;

  if (extraDays > 0) {
    if (extraDays === 1) {
      total += pricing["24h"];
    } else {
      total += pricing["24h"] + pricing.extra * (extraDays - 1);
    }
  }

  return total;
}

/**
 * Calculate days between two dates
 */
export function calculateDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(diffDays, MIN_RENTAL_DAYS);
}

/**
 * Format date for Icelandic locale (dd.mm.yyyy)
 */
export function formatIcelandicDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Format number for Icelandic locale (1.234,56 kr)
 */
export function formatIcelandicNumber(num: number): string {
  return new Intl.NumberFormat("is-IS", {
    style: "currency",
    currency: "ISK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
