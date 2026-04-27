import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { id, action } = await req.json()
  if (!id || !action) return NextResponse.json({ error: 'missing params' }, { status: 400 })

  const supabase = createSupabaseClient()
  if (!supabase) return NextResponse.json({ error: 'no db' }, { status: 500 })

  const { data: product } = await supabase
    .from('products')
    .select('views, likes')
    .eq('id', id)
    .single()

  if (!product) return NextResponse.json({ error: 'not found' }, { status: 404 })

  if (action === 'view') {
    const { error } = await supabase
      .from('products')
      .update({ views: (product.views || 0) + 1 })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ views: (product.views || 0) + 1 })
  }

  if (action === 'like' || action === 'unlike') {
    const delta = action === 'like' ? 1 : -1
    const newLikes = Math.max(0, (product.likes || 0) + delta)
    const { error } = await supabase
      .from('products')
      .update({ likes: newLikes })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ likes: newLikes })
  }

  return NextResponse.json({ error: 'invalid action' }, { status: 400 })
}
