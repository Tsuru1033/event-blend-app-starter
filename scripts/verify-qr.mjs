import fs from 'node:fs'
import { PNG } from 'pngjs'
import jsQR from 'jsqr'

const manifestPath =
  'output/qr-manifest.json'

if (!fs.existsSync(manifestPath)) {
  throw new Error(
    'output/qr-manifest.jsonがありません。先にQRを生成してください。'
  )
}

const manifest = JSON.parse(
  fs.readFileSync(manifestPath, 'utf8')
)

let failureCount = 0

for (const item of manifest) {
  if (!fs.existsSync(item.file)) {
    failureCount += 1

    console.error(
      `NG：${item.ticket}のQR画像がありません。`
    )

    continue
  }

  const image = PNG.sync.read(
    fs.readFileSync(item.file)
  )

  const result = jsQR(
    new Uint8ClampedArray(image.data),
    image.width,
    image.height
  )

  const decodedUrl = result?.data || ''

  if (decodedUrl !== item.url) {
    failureCount += 1

    console.error(
      `NG：札番号 ${item.ticket}`
    )

    console.error(
      `予定URL：${item.url}`
    )

    console.error(
      `読取URL：${decodedUrl || '読み取り失敗'}`
    )

    continue
  }

  console.log(
    `OK：札番号 ${item.ticket}`
  )
}

if (failureCount > 0) {
  throw new Error(
    `${failureCount}件のQRに問題があります。`
  )
}

console.log(
  'すべてのQRが正常です。'
)
