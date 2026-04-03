import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const subscription = await request.json()

  // Supabase の push_subscriptions テーブルに保存 (なければスキップ)
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({ user_id: user.id, subscription: JSON.stringify(subscription) }, { onConflict: 'user_id' })

  if (error) console.error('push subscription save error:', error)

  return NextResponse.json({ ok: true })
}
