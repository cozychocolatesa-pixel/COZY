import { createClient } from '@supabase/supabase-js'

export type Product = {
  id: string
  name: string
  name_ar: string
  price: number
  image_url: string
  category: 'occasions' | 'boxes'
  is_active: boolean
  sort_order: number
  description?: string
  created_at: string
}

export function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  if (!url || url === 'your_supabase_url_here') return null
  return createClient(url, key)
}

export const supabase = (() => {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    if (!url || url === 'your_supabase_url_here') {
      return null
    }
    return createClient(url, key)
  } catch {
    return null
  }
})()
