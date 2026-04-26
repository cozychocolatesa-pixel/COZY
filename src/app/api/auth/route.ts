import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  const { otp, phone } = await request.json()

  if (!otp || !phone) {
    return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })
  }

  const normalize = (p: string) => p.replace(/[\s\-\+]/g, '')
  const supabase = getSupabase()

  // Find valid unused OTP
  const { data, error } = await supabase
    .from('otp_codes')
    .select('id')
    .eq('phone', normalize(phone))
    .eq('code', otp)
    .eq('used', false)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'الرمز غير صحيح أو منتهي الصلاحية' }, { status: 401 })
  }

  // Mark OTP as used (one-time use)
  await supabase.from('otp_codes').update({ used: true }).eq('id', data.id)

  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_auth', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24,
  })
  return response
}
