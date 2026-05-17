'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pencil } from 'lucide-react'
import type { AppUser } from '@/lib/types'

interface Props {
  users: AppUser[]
  activeUserId: string
  onSwitch: (userId: string) => void
  onRename: (userId: string, name: string) => void
}

export function UserSwitcher({ users, activeUserId, onSwitch, onRename }: Props) {
  const [editing, setEditing] = useState<AppUser | null>(null)
  const [draft, setDraft] = useState('')

  return (
    <>
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
        {users.map((user) => (
          <div key={user.id} className="flex items-center">
            <button
              onClick={() => onSwitch(user.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all
                ${activeUserId === user.id
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'}`}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: user.color }} />
              {user.name}
            </button>
            <button
              onClick={() => { setEditing(user); setDraft(user.name) }}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Pencil className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>名前を変更</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <Label>名前</Label>
            <Input value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>キャンセル</Button>
            <Button onClick={() => {
              if (editing && draft.trim()) {
                onRename(editing.id, draft.trim())
                setEditing(null)
              }
            }}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
