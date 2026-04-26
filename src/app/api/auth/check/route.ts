import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const isAuth = request.cookies.get('admin_auth')?.value === 'authenticated'
  if (isAuth) {
    return NextResponse.json({ authenticated: true })
  }
  return NextResponse.json({ authenticated: false }, { status: 401 })
}
