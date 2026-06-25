import fs from 'node:fs'
import path from 'node:path'

const outDir = path.join('public', 'images')
const re = /\/images\/([a-zA-Z0-9_.-]+)/g
const names = new Set()

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const filePath = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      walk(filePath)
      continue
    }
    if (!/\.(vue|js|ts)$/.test(ent.name)) continue
    const text = fs.readFileSync(filePath, 'utf8')
    let match
    while ((match = re.exec(text))) names.add(match[1])
  }
}

walk('src')
fs.mkdirSync(outDir, { recursive: true })

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
)
const jpg = Buffer.from(
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=',
  'base64',
)
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" fill="#e5e7eb"/></svg>'

for (const name of names) {
  const file = path.join(outDir, name)
  if (name.endsWith('.png')) fs.writeFileSync(file, png)
  else if (name.endsWith('.jpg') || name.endsWith('.jpeg')) fs.writeFileSync(file, jpg)
  else if (name.endsWith('.svg')) fs.writeFileSync(file, svg)
  else fs.writeFileSync(file, png)
}

console.log(`Created ${names.size} placeholders in ${outDir}`)
