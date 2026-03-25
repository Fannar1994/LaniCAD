// Mock for @byko/lib-api-rest

export interface ProductIdentifier {
  id: number;
  amount?: number;
}

export interface Product extends ProductIdentifier {
  name: string;
  description?: string;
  categoryId?: number;
}

// Mock function to simulate fetching products
export async function getProducts(): Promise<Product[]> {
  // Return mock product data
  return [
    { id: 1, name: "Mock Product 1", description: "Test product" },
    { id: 2, name: "Mock Product 2", description: "Test product" },
  ];
}

// Mock restApi object
export const restApi = {
  get: async (url: string) => ({ data: [] }),
  post: async (url: string, data: any) => ({ data: {} }),
  products: {
    getProducts,
  },
};
