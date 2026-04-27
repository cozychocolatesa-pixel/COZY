import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

function isAuthenticated(request: NextRequest): boolean {
  return request.cookies.get('admin_auth')?.value === 'authenticated'
}

export async function GET() {
  const supabase = getSupabase()
  if (!supabase) return NextResponse.json([])
  const { data } = await supabase.from('categories').select('*').order('sort_order')
  return NextResponse.json(data || [])
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 500 })
  const body = await request.json()
  const { data, error } = await supabase.from('categories').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(request: NextRequest) {
  if (!isAuthenticated(request)) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 500 })
  const { id, ...updates } = await request.json()
  const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  if (!isAuthenticated(request)) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 500 })
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  await supabase.from('categories').delete().eq('id', id)
  return NextResponse.json({ success: true })
}
