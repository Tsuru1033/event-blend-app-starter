import fs from 'node:fs'
import path from 'node:path'
import QRCode from 'qrcode'

const baseUrl = process.env.QR_BASE_URL
const totalTickets = Number(
  process.env.QR_TOTAL_TICKETS || 20
)

if (!baseUrl) {
  throw new Error(
    'QR_BASE_URLを指定してください。'
  )
}

if (
  !Number.isInteger(totalTickets) ||
  totalTickets < 1 ||
  totalTickets > 100
) {
  throw new Error(
    'QR_TOTAL_TICKETSは1～100の整数にしてください。'
  )
}

const normalizedBaseUrl =
  baseUrl.replace(/\/$/, '')

const outputDirectory =
  path.resolve('output/qr')

fs.mkdirSync(outputDirectory, {
  recursive: true,
})

const manifest = []

for (
  let ticket = 1;
  ticket <= totalTickets;
  ticket += 1
) {
  const url =
    `${normalizedBaseUrl}/?ticket=${ticket}`

  const fileName =
    `ticket-${String(ticket).padStart(2, '0')}.png`

  const filePath =
    path.join(outputDirectory, fileName)

  await QRCode.toFile(filePath, url, {
    errorCorrectionLevel: 'H',
    width: 640,
    margin: 4,
  })

  manifest.push({
    ticket,
    url,
    file: path.relative(
      process.cwd(),
      filePath
    ),
  })
}

const masterUrl = `${normalizedBaseUrl}/`

const masterFilePath =
  path.join(outputDirectory, 'master.png')

await QRCode.toFile(
  masterFilePath,
  masterUrl,
  {
    errorCorrectionLevel: 'H',
    width: 720,
    margin: 4,
  }
)

manifest.push({
  ticket: 'master',
  url: masterUrl,
  file: path.relative(
    process.cwd(),
    masterFilePath
  ),
})

fs.mkdirSync(
  path.resolve('output'),
  { recursive: true }
)

fs.writeFileSync(
  path.resolve('output/qr-manifest.json'),
  JSON.stringify(manifest, null, 2),
  'utf8'
)

console.log(
  `${totalTickets}枚の固有QRとマスターQRを生成しました。`
)

console.log(
  '生成先：output/qr/'
)
