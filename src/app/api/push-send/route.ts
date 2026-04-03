import webpush from 'web-push'
import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

if (process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? 'mailto:admin@example.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  )
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, body, url } = await request.json()

  const { data: rows } = await supabase
    .from('push_subscriptions')
    .select('subscription')
    .eq('user_id', user.id)

  if (!rows?.length) return NextResponse.json({ sent: 0 })

  const payload = JSON.stringify({ title, body, url })
  let sent = 0

  await Promise.allSettled(
    rows.map(async (row) => {
      try {
        await webpush.sendNotification(JSON.parse(row.subscription), payload)
        sent++
      } catch (err) {
        console.error('push send error:', err)
      }
    })
  )

  return NextResponse.json({ sent })
}
