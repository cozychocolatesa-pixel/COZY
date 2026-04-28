import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function POST(request: NextRequest) {
  const isAuth = request.cookies.get('admin_auth')?.value === 'authenticated'
  if (!isAuth) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'لم يتم اختيار ملف' }, { status: 400 })
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('products')
    .upload(fileName, file, { upsert: true })

  if (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message, details: JSON.stringify(error) }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage
    .from('products')
    .getPublicUrl(data.path)

  return NextResponse.json({ url: publicUrl })
}
