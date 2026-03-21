// ── Calculator Types ──

export type CalculatorType = 'fence' | 'scaffolding' | 'formwork' | 'rolling' | 'ceiling';

export interface Product {
  id: string;
  rentalNo: string;
  saleNo?: string;
  description: string;
  rates: number[];
  salePrice: number;
  weight?: number;
}

export interface FenceProduct extends Product {
  fenceLength: number;
}

export interface ScaffoldItem {
  itemNo: string;
  name: string;
  dailyRate: number;
  weeklyRate?: number;
  salePrice: number;
  weight: number;
  quantity: number;
}

export interface FormworkItem {
  id: string;
  description: string;
  width?: number;
  height?: number;
  quantity: number;
  dayRate: number;
  weekRate: number;
  category?: string;
}

export interface RollingScaffoldPricing {
  '24h': number;
  extra: number;
  week: number;
  deposit: number;
}

export interface CeilingProp {
  id: string;
  articleNumber: string;
  name: string;
  minHeight: number;
  maxHeight: number;
  kN_min: number;
  kN_max: number;
  weight_kg: number;
  classLabel: string;
  classKey: string;
  dayRate: number;
  weekRate: number;
  salePrice: number;
}

export interface Beam {
  id: string;
  articleNumber: string;
  name: string;
  length_m: number;
  weight_kg: number;
  dayRate: number;
  weekRate: number;
  salePrice: number;
}

// ── Line Item (shared output format) ──

export interface LineItem {
  rentalNo: string;
  saleNo?: string;
  description: string;
  quantity: number;
  dailyRate?: number;
  weeklyRate?: number;
  rentalCost: number;
  saleCost?: number;
  weight?: number;
}

// ── Client Info ──

export interface ClientInfo {
  name: string;
  company: string;
  kennitala: string;
  phone: string;
  email: string;
  address: string;
  inspector?: string;
}

// ── Project ──

export interface Project {
  id: string;
  user_id: string;
  name: string;
  type: CalculatorType;
  client: ClientInfo;
  data: Record<string, unknown>;
  line_items: LineItem[];
  created_at: string;
  updated_at: string;
}

// ── Auth ──

export type UserRole = 'admin' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

// ── Navigation ──

export interface NavItem {
  key: string;
  label: string;
  icon: string;
  path: string;
}
