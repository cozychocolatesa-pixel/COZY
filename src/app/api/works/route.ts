import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function GET() {
  const supabase = createSupabaseClient()
  if (!supabase) return NextResponse.json([])
  const { data } = await supabase
    .from('works')
    .select('*')
    .order('sort_order', { ascending: true })
  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  const supabase = createSupabaseClient()
  if (!supabase) return NextResponse.json({ error: 'no db' }, { status: 500 })
  const body = await req.json()
  const { data, error } = await supabase.from('works').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const supabase = createSupabaseClient()
  if (!supabase) return NextResponse.json({ error: 'no db' }, { status: 500 })
  const { id } = await req.json()
  const { error } = await supabase.from('works').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
