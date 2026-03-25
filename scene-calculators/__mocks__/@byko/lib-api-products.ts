// Mock for @byko/lib-api-products

import type { Product } from "./lib-api-rest";

export interface ProductWithPrice extends Product {
  price?: number;
  priceWithVat?: number;
}

// Mock hook to simulate getting product prices
export function useGetProductPrices(products: Product[]): ProductWithPrice[] {
  // Add mock prices to products
  return products.map((product) => ({
    ...product,
    price: 1000,
    priceWithVat: 1250,
  }));
}

// Export as useProductPrices as well for compatibility
export const useProductPrices = useGetProductPrices;
