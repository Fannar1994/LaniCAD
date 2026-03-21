import { supabase, isSupabaseConfigured } from './supabase'
import type { Project, CalculatorType, ClientInfo, LineItem } from '@/types'

// ── Projects ──

export async function fetchProjects(): Promise<Project[]> {
  if (!isSupabaseConfigured || !supabase) return []
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchProject(id: string): Promise<Project | null> {
  if (!isSupabaseConfigured || !supabase) return null
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createProject(project: {
  name: string
  type: CalculatorType
  client: ClientInfo
  data: Record<string, unknown>
  line_items: LineItem[]
}): Promise<Project> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('projects')
    .insert({ ...project, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProject(
  id: string,
  updates: Partial<Pick<Project, 'name' | 'client' | 'data' | 'line_items'>>
): Promise<Project> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProject(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
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
  if (!isSupabaseConfigured || !supabase) return []
  let query = supabase.from('templates').select('*').order('name')
  if (type) query = query.eq('type', type)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function createTemplate(template: {
  type: CalculatorType
  name: string
  description?: string
  config: Record<string, unknown>
  is_public?: boolean
}): Promise<Template> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('templates')
    .insert({ ...template, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTemplate(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { error } = await supabase.from('templates').delete().eq('id', id)
  if (error) throw error
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
  if (!isSupabaseConfigured || !supabase) return []
  let query = supabase.from('products').select('*').order('rental_no')
  if (calculatorType) query = query.eq('calculator_type', calculatorType)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function upsertProduct(product: Omit<DbProduct, 'id' | 'created_at' | 'updated_at'>): Promise<DbProduct> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase
    .from('products')
    .upsert(product, { onConflict: 'rental_no' })
    .select()
    .single()
  if (error) throw error
  return data
}
