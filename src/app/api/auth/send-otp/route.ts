import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function randomOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  const instanceId = process.env.GREEN_API_INSTANCE_ID
  const apiToken = process.env.GREEN_API_TOKEN
  const adminPhone = process.env.ADMIN_PHONE

  if (!instanceId || !apiToken || !adminPhone) {
    return NextResponse.json({ error: 'Green API غير مضبوط' }, { status: 500 })
  }

  const { phone } = await request.json()

  const normalize = (p: string) => p.replace(/[\s\-\+]/g, '')
  if (!phone || normalize(phone) !== normalize(adminPhone)) {
    return NextResponse.json({ error: 'الرقم غير مصرح له' }, { status: 403 })
  }

  const otp = randomOTP()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

  // Store OTP in Supabase
  const supabase = getSupabase()
  const { error: dbError } = await supabase
    .from('otp_codes')
    .insert({ phone: normalize(phone), code: otp, expires_at: expiresAt })

  if (dbError) {
    return NextResponse.json({ error: 'خطأ في قاعدة البيانات' }, { status: 500 })
  }

  const chatId = normalize(adminPhone) + '@c.us'
  const message = `🍫 *Cozy Chocolate*\n\nرمز الدخول الخاص بك:\n\n*${otp}*\n\nصالح لمدة 5 دقائق ⏱\nلا تشاركه مع أحد 🔒`

  try {
    const res = await fetch(
      `https://api.green-api.com/waInstance${instanceId}/sendMessage/${apiToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, message }),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: 'فشل إرسال الرسالة: ' + err }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'خطأ في الاتصال بـ Green API' }, { status: 500 })
  }
}
