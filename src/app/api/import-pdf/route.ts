import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { ParsedLesson } from '@/lib/types'

const client = new Anthropic()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'ファイルが見つかりません' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'PDFファイルのみ対応しています' }, { status: 400 })
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'ファイルサイズは20MB以下にしてください' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64,
              },
            },
            {
              type: 'text',
              text: `このPDFは大学の年間授業予定表です。
PDFから授業スケジュールを抽出し、以下のJSON形式で返してください。

{
  "lessons": [
    {
      "subject_name": "科目名（文字列）",
      "date": "YYYY-MM-DD形式の日付",
      "start_time": "HH:mm形式の開始時刻",
      "end_time": "HH:mm形式の終了時刻",
      "location": "教室名（不明な場合はnull）",
      "period": "時限（例: 1限, 2限、不明な場合はnull）",
      "notes": "備考（不明な場合はnull）"
    }
  ]
}

注意事項：
- 授業が見つからない場合は lessons を空配列にしてください
- 日付が不明な場合はそのエントリをスキップしてください
- JSONのみを返し、説明文は不要です`,
            },
          ],
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'AI解析に失敗しました' }, { status: 500 })
    }

    // JSONを抽出（```json ... ``` のコードブロックにも対応）
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AIのレスポンスからJSONを抽出できませんでした' }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0]) as { lessons: ParsedLesson[] }

    return NextResponse.json({ lessons: parsed.lessons ?? [] })
  } catch (error) {
    console.error('PDF import error:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
