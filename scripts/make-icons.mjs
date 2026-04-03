import { createCanvas, loadImage } from 'canvas'
import { writeFileSync } from 'fs'

async function makeIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // 背景（白）
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, size, size)

  // エンブレム画像
  const img = await loadImage(`public/icon-${size}.png`)
  ctx.drawImage(img, 0, 0, size, size)

  // 右下に「出席」バッジ
  const badgeR = size * 0.22
  const bx = size - badgeR - size * 0.04
  const by = size - badgeR - size * 0.04

  // バッジ円（白縁 + 青背景）
  ctx.beginPath()
  ctx.arc(bx, by, badgeR + size * 0.02, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()

  ctx.beginPath()
  ctx.arc(bx, by, badgeR, 0, Math.PI * 2)
  ctx.fillStyle = '#1d4ed8'
  ctx.fill()

  // チェックマーク
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = size * 0.055
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(bx - badgeR * 0.45, by + badgeR * 0.05)
  ctx.lineTo(bx - badgeR * 0.05, by + badgeR * 0.45)
  ctx.lineTo(bx + badgeR * 0.5, by - badgeR * 0.35)
  ctx.stroke()

  writeFileSync(`public/icon-${size}.png`, canvas.toBuffer('image/png'))
  console.log(`icon-${size}.png 生成完了`)
}

await makeIcon(512)
await makeIcon(192)
