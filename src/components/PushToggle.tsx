'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PushToggle() {
  const [subscribed, setSubscribed] = useState(false)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setSupported(true)
      navigator.serviceWorker.ready.then(async (reg) => {
        const sub = await reg.pushManager.getSubscription()
        setSubscribed(!!sub)
      })
    }
  }, [])

  const toggle = async () => {
    const reg = await navigator.serviceWorker.ready
    if (subscribed) {
      const sub = await reg.pushManager.getSubscription()
      await sub?.unsubscribe()
      setSubscribed(false)
    } else {
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey || vapidKey === 'your_vapid_public_key') {
        alert('VAPID公開鍵が設定されていません。.env.localを確認してください。')
        return
      }
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      })
      await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      })
      setSubscribed(true)
    }
  }

  if (!supported) return null

  return (
    <Button
      variant="ghost" size="sm"
      className={`shrink-0 ${subscribed ? 'text-primary' : 'text-muted-foreground'}`}
      onClick={toggle}
      title={subscribed ? '通知をオフにする' : '授業リマインダー通知をオンにする'}
    >
      {subscribed ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
    </Button>
  )
}
