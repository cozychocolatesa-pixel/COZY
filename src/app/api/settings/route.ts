import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

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
  if (!supabase) return NextResponse.json({})

  const { data } = await supabase.from('settings').select('key, value').limit(1000)
  if (!data) return NextResponse.json({})

  const result: Record<string, string> = {}
  data.forEach(({ key, value }) => { result[key] = value })
  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
  })
}

export async function PUT(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

  const body: Record<string, string> = await request.json()

  const entries = Object.entries(body)

  for (const [key, value] of entries) {
    const { data: existing } = await supabase.from('settings').select('key, value').eq('key', key).single()
    if (existing) {
      // Only overwrite if new value is non-empty OR existing value is already empty
      if (value !== '' || existing.value === '' || existing.value === null) {
        await supabase.from('settings').update({ value }).eq('key', key)
      }
    } else {
      await supabase.from('settings').insert({ key, value })
    }
  }

  return NextResponse.json({ success: true })
}
