import type { PricingTier, RentalPricingResult, InriverPriceResponse } from "./interface";
import { FENCE_PRICING } from "./configuration";

// Inriver PIM API configuration (loaded from environment or config file)
interface InriverConfig {
  apiUrl: string;
  apiKey: string;
  credentials: {
    username: string;
    password: string;
    depot: string;
  };
}

let sessionID: string | null = null;
let inriverConfig: InriverConfig | null = null;

/**
 * Load Inriver API configuration
 * In production, this would come from environment variables or a secure config
 */
export const loadInriverConfig = async (): Promise<void> => {
  try {
    // Try to load from a config endpoint or file
    const response = await fetch("/api_config.json");
    if (response.ok) {
      inriverConfig = await response.json();
      console.log("Inriver API configuration loaded");
    } else {
      console.warn("Inriver config not found, will use fallback pricing");
    }
  } catch (error) {
    console.warn("Could not load Inriver config:", error);
  }
};

/**
 * Authenticate with Inriver PIM API
 */
const authenticateInriver = async (): Promise<string> => {
  if (sessionID) return sessionID;
  if (!inriverConfig) throw new Error("Inriver config not available");

  const response = await fetch(`${inriverConfig.apiUrl}/logon`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": inriverConfig.apiKey,
    },
    body: JSON.stringify({
      USERNAME: inriverConfig.credentials.username,
      PASSWORD: inriverConfig.credentials.password,
      DEPOT: inriverConfig.credentials.depot,
    }),
  });

  if (!response.ok) {
    throw new Error(`Inriver authentication failed: ${response.status}`);
  }

  const data = await response.json();
  sessionID = data.SessionID;
  return sessionID;
};

/**
 * Fetch pricing for a specific SKU from Inriver
 */
const fetchInriverRate = async (sku: string): Promise<number> => {
  if (!inriverConfig) throw new Error("Inriver config not available");

  const session = await authenticateInriver();
  const url = new URL(`${inriverConfig.apiUrl}/rates`);
  url.searchParams.append("$filter", `Itemno eq '${sku}'`);

  const response = await fetch(url.toString(), {
    headers: {
      SessionID: session,
      "x-api-key": inriverConfig.apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch rate for ${sku}: ${response.status}`);
  }

  const json: InriverPriceResponse = await response.json();
  if (!json.value || json.value.length === 0) {
    throw new Error(`No pricing data found for ${sku}`);
  }

  return json.value[0].DailyRate;
};

/**
 * Calculate pricing tier based on rental days
 */
export const getPricingTier = (days: number): PricingTier => {
  if (days <= 30) return "1-30";
  if (days <= 60) return "30-60";
  if (days <= 90) return "60-90";
  if (days <= 120) return "90-120";
  return "120+";
};

/**
 * Calculate days between two dates
 */
export const calculateDaysBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate + "T12:00:00");
  const end = new Date(endDate + "T12:00:00");
  const timeDiff = end.getTime() - start.getTime();
  return Math.max(1, Math.round(timeDiff / (1000 * 60 * 60 * 24)) + 1);
};

/**
 * Format date to Icelandic format (DD.MM.YYYY)
 */
export const formatIcelandicDate = (dateString: string): string => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}.${month}.${year}`;
};

/**
 * Format number with Icelandic conventions
 */
export const formatIcelandicNumber = (num: number): string => {
  return new Intl.NumberFormat("de-DE").format(Math.round(num));
};

/**
 * Get pricing for rental items with Inriver API fallback
 */
export const getRentalPricing = async (
  skus: string[],
  days: number
): Promise<RentalPricingResult> => {
  const tier = getPricingTier(days);

  // Try to fetch from Inriver API first
  if (inriverConfig) {
    try {
      const ratePromises = skus.map((sku) => fetchInriverRate(sku));
      const rates = await Promise.all(ratePromises);
      const totalDailyRate = rates.reduce((sum, rate) => sum + rate, 0);

      return {
        rate: totalDailyRate,
        source: "api",
        breakdown: {
          dailyRate: totalDailyRate,
          days,
          tier,
        },
      };
    } catch (error) {
      console.warn("Inriver API unavailable, using fallback pricing:", error);
    }
  }

  // Fallback to default pricing
  let totalDailyRate = 0;
  skus.forEach((sku) => {
    const itemPricing = FENCE_PRICING[sku];
    if (itemPricing && itemPricing[tier] !== undefined) {
      totalDailyRate += itemPricing[tier];
    } else {
      console.warn(`No fallback pricing found for SKU: ${sku}`);
    }
  });

  return {
    rate: totalDailyRate,
    source: "fallback",
    breakdown: {
      dailyRate: totalDailyRate,
      days,
      tier,
    },
  };
};

/**
 * Calculate scaffold rental cost based on pricing tables
 */
export const calculateScaffoldCost = (
  pricingTier: { "24h": number; extra: number; week: number },
  days: number
): number => {
  if (days === 1) {
    return pricingTier["24h"];
  }

  if (days >= 2 && days <= 6) {
    // 24h rate + extra day rate for each additional day
    return pricingTier["24h"] + pricingTier.extra * (days - 1);
  }

  // For 7+ days: full weeks + extra days
  const fullWeeks = Math.floor(days / 7);
  const extraDays = days % 7;
  return pricingTier.week * fullWeeks + pricingTier["24h"] * extraDays;
};

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = (): string => {
  return new Date().toISOString().split("T")[0];
};
