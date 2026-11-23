import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import pngToIco from 'png-to-ico'

const source = process.argv[2]
const outputRoot = process.argv[3]
if (!source || !outputRoot) {
  console.error('Uso: node generate-pwa-icons.mjs <logo> <pasta-do-manager>')
  process.exit(1)
}

const root = path.resolve(outputRoot)
const iconsDir = path.join(root, 'public', 'icons')
const background = { r: 0, g: 0, b: 0, alpha: 1 }

await mkdir(iconsDir, { recursive: true })

const trimmed = await sharp(source)
  .trim({ threshold: 12 })
  .png()
  .toBuffer()

async function render(size, contentScale) {
  const inner = Math.round(size * contentScale)
  const logo = await sharp(trimmed)
    .resize(inner, inner, {
      fit: 'contain',
      background,
    })
    .png()
    .toBuffer()

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite([{ input: logo, gravity: 'centre' }])
    .png()
    .toBuffer()
}

const anyIcons = [
  ['favicon-16.png', 16],
  ['favicon-32.png', 32],
  ['favicon-48.png', 48],
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
]

const written = []

for (const [name, size] of anyIcons) {
  const file = path.join(iconsDir, name)
  await writeFile(file, await render(size, 0.82))
  written.push(file)
}

const maskable = path.join(iconsDir, 'icon-maskable-512.png')
await writeFile(maskable, await render(512, 0.62))
written.push(maskable)

const ico = await pngToIco([
  path.join(iconsDir, 'favicon-16.png'),
  path.join(iconsDir, 'favicon-32.png'),
  path.join(iconsDir, 'favicon-48.png'),
])
const favicon = path.join(root, 'public', 'favicon.ico')
await writeFile(favicon, ico)
written.push(favicon)

console.log(written.join('\n'))
