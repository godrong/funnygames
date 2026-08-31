import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const output = resolve(root, 'dist')

await rm(output, { recursive: true, force: true })
await mkdir(resolve(output, 'blind-soup'), { recursive: true })
await cp(resolve(root, 'games/blind-soup/dist'), resolve(output, 'blind-soup'), { recursive: true })
await cp(resolve(root, 'hub/assets'), resolve(output, 'assets'), { recursive: true })

const hubHtml = await readFile(resolve(root, 'hub/index.html'), 'utf8')
const hubCss = await readFile(resolve(root, 'hub/styles.css'), 'utf8')
await writeFile(resolve(output, 'index.html'), hubHtml)
await writeFile(resolve(output, 'styles.css'), hubCss)

console.log('Built FunnyGames hub with Blind Soup at /blind-soup/')
