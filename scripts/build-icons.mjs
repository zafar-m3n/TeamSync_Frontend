// Bundles the Lucide icons the app uses into src/lib/icons.json, so icons render
// without a network request (Iconify otherwise fetches each one from its API at
// runtime, and they go missing on slow or offline connections).
// Runs automatically before `npm run dev` and `npm run build`; run `npm run icons`
// after adding a new icon. An icon not in the bundle still loads from the API.
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, extname } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const lucide = require('@iconify-json/lucide/icons.json')

const SRC = new URL('../src', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const OUT = join(SRC, 'lib', 'icons.json')

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) yield* files(path)
    else if (['.js', '.jsx'].includes(extname(name))) yield path
  }
}

const used = new Set()
for (const file of files(SRC)) {
  for (const [, name] of readFileSync(file, 'utf8').matchAll(/['"`]lucide:([a-z0-9-]+)['"`]/g)) used.add(name)
}

const icons = {}
const aliases = {}
const missing = []
const add = (name) => {
  if (lucide.icons[name]) {
    icons[name] = lucide.icons[name]
  } else if (lucide.aliases?.[name]) {
    aliases[name] = lucide.aliases[name]
    add(lucide.aliases[name].parent)
  } else {
    missing.push(name)
  }
}
;[...used].sort().forEach(add)

writeFileSync(
  OUT,
  JSON.stringify({ prefix: 'lucide', width: lucide.width, height: lucide.height, icons, aliases }) + '\n',
)
console.log(`icons: bundled ${used.size} Lucide icons into src/lib/icons.json`)
if (missing.length) console.warn(`icons: not in the Lucide set (check the names): ${missing.join(', ')}`)
