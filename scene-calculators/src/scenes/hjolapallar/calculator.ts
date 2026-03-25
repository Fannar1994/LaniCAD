import { useMemo } from "react";
import type { ProductWithPrice } from "@byko/lib-api-products";
import type { ProductIdentifier } from "@byko/lib-api-rest";
import type {
  Configuration,
  ComponentQuantity,
  RentalPricing,
} from "./interface";
import {
  NARROW_SCAFFOLD_PRICING,
  WIDE_SCAFFOLD_PRICING,
  QUICKLY_PRICING,
  SUPPORT_LEGS_PRICING,
  SCAFFOLD_PRODUCTS,
  QUICKLY_COMPONENTS,
} from "./configuration";

/**
 * Calculate number of days between two dates (inclusive)
 */
export function calculateDaysBetween(
  startDate: string,
  endDate: string
): number {
  const start = new Date(startDate + "T12:00:00");
  const end = new Date(endDate + "T12:00:00");

  const timeDiff = end.getTime() - start.getTime();
  return Math.max(1, Math.round(timeDiff / (1000 * 60 * 60 * 24)) + 1);
}

/**
 * Calculate rental price based on duration and pricing structure
 */
export function getRentalPrice(days: number, pricing: RentalPricing): number {
  if (days === 1) {
    return pricing["24h"];
  } else if (days >= 2 && days <= 6) {
    // 24h rate + extra day rate for each additional day
    return pricing["24h"] + pricing.extra * (days - 1);
  } else {
    // For 7+ days: (full weeks × week rate) + (extra days × 24h rate)
    const fullWeeks = Math.floor(days / 7);
    const extraDays = days % 7;
    const weekCost = pricing.week * fullWeeks;
    const dailyCost = pricing["24h"] * extraDays;
    return weekCost + dailyCost;
  }
}

/**
 * Get pricing description text
 */
export function getPricingDescription(days: number): string {
  if (days === 1) {
    return "24 klst. verð";
  } else if (days >= 2 && days <= 6) {
    return `24 klst. + ${days - 1} viðbótardagar`;
  } else {
    const fullWeeks = Math.floor(days / 7);
    const extraDays = days % 7;

    if (extraDays === 0) {
      return fullWeeks === 1 ? "viku verð" : `${fullWeeks} vikur verð`;
    } else {
      if (fullWeeks === 1) {
        return `viku verð + ${extraDays} dagur`;
      } else {
        return `${fullWeeks} vikur verð + ${extraDays} dagur`;
      }
    }
  }
}

/**
 * Calculate component quantities based on configuration
 */
function getComponentQuantities(
  config: Configuration
): ComponentQuantity[] {
  const components: ComponentQuantity[] = [];

  if (config.scaffoldType === "quicky") {
    // Quicky has fixed components
    QUICKLY_COMPONENTS.forEach((product) => {
      components.push({
        itemno: product.itemno,
        productId: product.id,
        name: product.name,
        qty: product.fixedQty || 0,
      });
    });
  } else {
    // Narrow or wide scaffold - quantities vary by height
    if (!config.height) return components;

    SCAFFOLD_PRODUCTS.forEach((product) => {
      if (product.quantities) {
        const qty = product.quantities[config.height!];
        if (qty > 0) {
          components.push({
            itemno: product.itemno,
            productId: product.id,
            name: product.name,
            qty,
          });
        }
      }
    });

    // Add support legs if selected (2 units)
    if (config.includeSupportLegs) {
      const supportLeg = SCAFFOLD_PRODUCTS.find(
        (p) => p.itemno === "01-PAL-HP01-116"
      );
      if (supportLeg) {
        components.push({
          itemno: supportLeg.itemno,
          productId: supportLeg.id,
          name: supportLeg.name,
          qty: 2,
        });
      }
    }
  }

  return components;
}

/**
 * Main calculation hook for scaffold rental
 */
export function useCalculateProductList(
  products: ProductWithPrice[],
  config: Configuration
) {
  return useMemo(() => {
    // Calculate rental period
    const rentalDays = calculateDaysBetween(
      config.rentalStartDate,
      config.rentalEndDate
    );

    // Determine pricing structure based on scaffold type
    let pricing: RentalPricing;
    let scaffoldDescription: string;

    if (config.scaffoldType === "quickly") {
      pricing = QUICKLY_PRICING;
      scaffoldDescription = "Quickly hjólapallur (4m vinnuhæð)";
    } else if (config.scaffoldType === "narrow") {
      if (!config.height) {
        return {
          productList: [],
          rentalCost: 0,
          deposit: 0,
          totalCost: 0,
          rentalDays: 0,
          pricingDescription: "",
          scaffoldDescription: "",
        };
      }
      pricing = NARROW_SCAFFOLD_PRICING[config.height];
      const standHeight = config.height;
      const workingHeight = parseFloat(config.height) + 2;
      scaffoldDescription = `Hjólapallur mjór 0.75m (${standHeight}m standhæð/${workingHeight}m vinnuhæð)`;
    } else {
      // wide
      if (!config.height) {
        return {
          productList: [],
          rentalCost: 0,
          deposit: 0,
          totalCost: 0,
          rentalDays: 0,
          pricingDescription: "",
          scaffoldDescription: "",
        };
      }
      pricing = WIDE_SCAFFOLD_PRICING[config.height];
      const standHeight = config.height;
      const workingHeight = parseFloat(config.height) + 2;
      scaffoldDescription = `Hjólapallur breiður 1.35m (${standHeight}m standhæð/${workingHeight}m vinnuhæð)`;
    }

    // Calculate scaffold rental cost
    const scaffoldRentalCost = getRentalPrice(rentalDays, pricing);

    // Calculate support legs cost if included (only for narrow/wide)
    let supportLegsCost = 0;
    if (
      config.includeSupportLegs &&
      config.scaffoldType !== "quicky"
    ) {
      supportLegsCost = getRentalPrice(rentalDays, SUPPORT_LEGS_PRICING) * 2; // 2 support legs
    }

    const totalRentalCost = scaffoldRentalCost + supportLegsCost;
    const deposit = pricing.deposit;

    // Get component quantities
    const components = getComponentQuantities(config);

    // Map to product list with prices
    const productList: ProductIdentifier[] = components.map((component) => ({
      id: component.productId,
      amount: component.qty,
    }));

    return {
      productList,
      rentalCost: totalRentalCost,
      supportLegsCost, // Separate support legs cost for display
      deposit,
      totalCost: totalRentalCost + deposit,
      rentalDays,
      pricingDescription: getPricingDescription(rentalDays),
      scaffoldDescription,
      components, // Include component details for display
    };
  }, [products, config]);
}
