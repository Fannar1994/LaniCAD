import type { Project, CalculatorType, ClientInfo, LineItem } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

/** True when the API URL is configured (always true for local dev) */
export const isApiConfigured = Boolean(API_URL)

function getToken(): string | null {
  return localStorage.getItem('lanicad_token')
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `API villa (${res.status})`)
  }
  return res.json()
}

// ── Projects ──

export async function fetchProjects(): Promise<Project[]> {
  if (!getToken()) return []
  return apiFetch<Project[]>('/projects')
}

export async function fetchProject(id: string): Promise<Project | null> {
  if (!getToken()) return null
  return apiFetch<Project>(`/projects/${encodeURIComponent(id)}`)
}

export async function createProject(project: {
  name: string
  type: CalculatorType
  client: ClientInfo
  data: Record<string, unknown>
  line_items: LineItem[]
}): Promise<Project> {
  return apiFetch<Project>('/projects', {
    method: 'POST',
    body: JSON.stringify(project),
  })
}

export async function updateProject(
  id: string,
  updates: Partial<Pick<Project, 'name' | 'client' | 'data' | 'line_items'>>
): Promise<Project> {
  return apiFetch<Project>(`/projects/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

export async function deleteProject(id: string): Promise<void> {
  await apiFetch(`/projects/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

// ── Templates ──

export interface Template {
  id: string
  user_id: string | null
  type: CalculatorType
  name: string
  description: string
  config: Record<string, unknown>
  is_public: boolean
  created_at: string
}

export async function fetchTemplates(type?: CalculatorType): Promise<Template[]> {
  if (!getToken()) return []
  const query = type ? `?type=${encodeURIComponent(type)}` : ''
  return apiFetch<Template[]>(`/templates${query}`)
}

export async function createTemplate(template: {
  type: CalculatorType
  name: string
  description?: string
  config: Record<string, unknown>
  is_public?: boolean
}): Promise<Template> {
  return apiFetch<Template>('/templates', {
    method: 'POST',
    body: JSON.stringify(template),
  })
}

export async function deleteTemplate(id: string): Promise<void> {
  await apiFetch(`/templates/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

// ── Products ──

export interface DbProduct {
  id: string
  calculator_type: CalculatorType
  rental_no: string
  sale_no: string
  description: string
  category: string
  rates: Record<string, number>
  sale_price: number
  weight: number
  active: boolean
  created_at: string
  updated_at: string
}

export async function fetchProducts(calculatorType?: CalculatorType): Promise<DbProduct[]> {
  const query = calculatorType ? `?calculator_type=${encodeURIComponent(calculatorType)}` : ''
  return apiFetch<DbProduct[]>(`/products${query}`)
}

export async function upsertProduct(product: Omit<DbProduct, 'id' | 'created_at' | 'updated_at'>): Promise<DbProduct> {
  return apiFetch<DbProduct>('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  })
}
