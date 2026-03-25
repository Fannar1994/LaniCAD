import type { Project, CalculatorType, ClientInfo, LineItem } from '@/types'
import { getApiUrl, isApiReady } from '@/lib/api-config'

/** Check reactively if the API is configured (call each time, not cached) */
export function isApiConfigured(): boolean {
  return isApiReady()
}

function getToken(): string | null {
  return localStorage.getItem('lanicad_token')
}

// ── Offline Queue ──

const QUEUE_KEY = 'lanicad_offline_queue'

interface QueuedRequest {
  id: string
  path: string
  method: string
  body: string | undefined
  timestamp: number
  label: string
}

function getQueue(): QueuedRequest[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
  } catch { return [] }
}

function saveQueue(queue: QueuedRequest[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

function enqueue(req: Omit<QueuedRequest, 'id' | 'timestamp'>): void {
  const queue = getQueue()
  queue.push({ ...req, id: crypto.randomUUID(), timestamp: Date.now() })
  saveQueue(queue)
}

/** Get the number of queued offline requests */
export function getOfflineQueueCount(): number {
  return getQueue().length
}

/** Flush the offline queue — retry all queued requests. Returns count of succeeded items. */
export async function flushOfflineQueue(): Promise<number> {
  const queue = getQueue()
  if (queue.length === 0) return 0
  const apiUrl = getApiUrl()
  if (!apiUrl) return 0
  const token = getToken()

  let succeeded = 0
  const remaining: QueuedRequest[] = []

  for (const item of queue) {
    try {
      const res = await fetch(`${apiUrl}${item.path}`, {
        method: item.method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: item.body,
      })
      if (res.ok) {
        succeeded++
      } else {
        remaining.push(item)
      }
    } catch {
      remaining.push(item)
    }
  }

  saveQueue(remaining)
  return succeeded
}

// Auto-flush when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    flushOfflineQueue().then(n => {
      if (n > 0) console.log(`[LániCAD] Synced ${n} offline request(s)`)
    })
  })
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const apiUrl = getApiUrl()
  if (!apiUrl) throw new Error('API URL er ekki stillt. Farðu í Stillingar → Almennt.')
  const token = getToken()
  const res = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })
  if (!res.ok) {
    if (res.status === 401) {
      // Notify auth system that token is invalid
      window.dispatchEvent(new CustomEvent('lanicad:auth-expired'))
    }
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `API villa (${res.status})`)
  }
  return res.json()
}

/** Like apiFetch but queues the request for later if network is unavailable */
async function apiFetchWithQueue<T>(path: string, label: string, options?: RequestInit): Promise<T> {
  try {
    return await apiFetch<T>(path, options)
  } catch (err) {
    // Queue mutation requests (POST/PUT/DELETE) when offline or API unreachable
    const method = options?.method ?? 'GET'
    if (method !== 'GET' && (
      !navigator.onLine ||
      (err instanceof TypeError && err.message.includes('fetch')) ||
      (err instanceof Error && err.message.includes('API URL'))
    )) {
      enqueue({ path, method, body: options?.body as string | undefined, label })
      throw new Error(`Ekki náðist samband — beiðni geymd til reynslu síðar (${label})`)
    }
    throw err
  }
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
  return apiFetchWithQueue<Project>('/projects', 'Vista verkefni', {
    method: 'POST',
    body: JSON.stringify(project),
  })
}

export async function updateProject(
  id: string,
  updates: Partial<Pick<Project, 'name' | 'client' | 'data' | 'line_items'>>
): Promise<Project> {
  return apiFetchWithQueue<Project>(`/projects/${encodeURIComponent(id)}`, 'Uppfæra verkefni', {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

export async function deleteProject(id: string): Promise<void> {
  await apiFetch(`/projects/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

// ── Project Sharing ──

export interface ShareInfo {
  shared: boolean
  token?: string
  created_at?: string
}

export async function getShareStatus(projectId: string): Promise<ShareInfo> {
  return apiFetch<ShareInfo>(`/projects/${encodeURIComponent(projectId)}/share`)
}

export async function shareProject(projectId: string): Promise<{ token: string; created_at: string }> {
  return apiFetch<{ token: string; created_at: string }>(`/projects/${encodeURIComponent(projectId)}/share`, {
    method: 'POST',
  })
}

export async function unshareProject(projectId: string): Promise<void> {
  await apiFetch(`/projects/${encodeURIComponent(projectId)}/share`, { method: 'DELETE' })
}

export interface SharedProject {
  name: string
  type: CalculatorType
  client: string
  data: string
  line_items: string
  created_at: string
  updated_at: string
  owner_name: string
}

export async function fetchSharedProject(token: string): Promise<SharedProject> {
  const apiUrl = getApiUrl()
  if (!apiUrl) throw new Error('API URL er ekki stillt')
  const res = await fetch(`${apiUrl}/shared/${encodeURIComponent(token)}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Villa (${res.status})`)
  }
  return res.json()
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
  return apiFetchWithQueue<Template>('/templates', 'Vista sniðmát', {
    method: 'POST',
    body: JSON.stringify(template),
  })
}

export async function deleteTemplate(id: string): Promise<void> {
  await apiFetch(`/templates/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function updateTemplate(id: string, data: {
  name: string
  description?: string
  config?: Record<string, unknown>
  is_public?: boolean
}): Promise<Template> {
  return apiFetch<Template>(`/templates/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
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
  image_url: string
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

export async function updateProduct(id: string, updates: Partial<Pick<DbProduct, 'description' | 'rates' | 'sale_price' | 'weight' | 'active' | 'category' | 'rental_no' | 'sale_no' | 'image_url'>>): Promise<DbProduct> {
  return apiFetch<DbProduct>(`/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

export async function deleteProduct(id: string): Promise<void> {
  await apiFetch(`/products/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

// ── Users (admin) ──

export interface DbUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  created_at: string
}

export async function fetchUsers(): Promise<DbUser[]> {
  return apiFetch<DbUser[]>('/users')
}

export async function createApiUser(user: { email: string; name: string; password: string; role: 'admin' | 'user' }): Promise<DbUser> {
  return apiFetch<DbUser>('/users', {
    method: 'POST',
    body: JSON.stringify(user),
  })
}

export async function updateApiUser(id: string, updates: { name?: string; role?: 'admin' | 'user'; password?: string }): Promise<DbUser> {
  return apiFetch<DbUser>(`/users/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

export async function deleteApiUser(id: string): Promise<void> {
  await apiFetch(`/users/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function changeOwnPassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiFetch('/auth/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}

// ── AI Chat ──

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  const data = await apiFetch<{ reply: string }>('/chat', {
    method: 'POST',
    body: JSON.stringify({ messages }),
  })
  return data.reply
}
