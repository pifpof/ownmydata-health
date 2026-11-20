/* global document */
// Acceptance driver for the ownmydata viewer (VA1-VA12). Fictional vault only.
// Usage: npm run accept. Screenshots and results land in $TMPDIR/ownmydata-accept/.
import { _electron as electron } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const APP = process.env.APP ?? path.resolve(import.meta.dirname, '../..')
const FIX = process.env.FIX ?? path.join(APP, 'tests/fixtures/rich-vault')
const WORK = process.env.WORK ?? path.join(os.tmpdir(), 'ownmydata-accept')
const SHOTS = path.join(WORK, 'shots')
const VAULT = path.join(WORK, 'vault')
const UD = path.join(WORK, 'userdata')
fs.rmSync(WORK, { recursive: true, force: true })
fs.mkdirSync(SHOTS, { recursive: true })
fs.cpSync(FIX, VAULT, { recursive: true })
const BIN = path.join(APP, 'node_modules/electron/dist/Electron.app/Contents/MacOS/Electron')

const results = []
const check = (id, ok, note = '') => {
  results.push(`${ok ? 'PASS' : 'FAIL'} ${id} ${note}`)
  console.log(results.at(-1))
}

async function launch() {
  const app = await electron.launch({
    executablePath: BIN,
    args: [APP],
    env: { ...process.env, OMD_USER_DATA: UD, ELECTRON_RENDERER_URL: '' },
    timeout: 30000
  })
  const page = await app.firstWindow()
  await page.waitForLoadState('domcontentloaded')
  await page.setViewportSize?.({ width: 1280, height: 820 }).catch(() => {})
  await page.waitForTimeout(800)
  return { app, page }
}
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, `${name}.png`) })
const stubDialog = (app, dir) =>
  app.evaluate(({ dialog }, d) => {
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [d] })
  }, dir)
const text = (page) => page.evaluate(() => document.body.innerText)
const clickText = async (page, sel, t) => {
  await page.locator(sel, { hasText: t }).first().click()
  await page.waitForTimeout(350)
}
const crumbs = async (page) => (await page.locator('header ol').innerText()).replace(/\s+/g, ' ')

let { app, page } = await launch()
await shot(page, '01-welcome')
check('VA1a', (await text(page)).includes('Choose your vault folder'), 'welcome shown on first launch')

// VA2: not a vault
await stubDialog(app, path.join(VAULT, 'memory'))
await clickText(page, 'button', 'Choose your vault folder')
await shot(page, '02-not-a-vault')
check('VA2', (await text(page)).includes('doesn’t have a health vault'), 'not-a-vault message')

// VA1: choose the vault
await stubDialog(app, VAULT)
await clickText(page, 'button', 'Choose your vault folder')
await page.waitForTimeout(500)
await shot(page, '03-overview')
const ov = await text(page)
check('VA1', ov.includes('Pat Sample') && ov.includes('In your vault'), 'overview with owner name')

// VA5: drill and back
await clickText(page, 'nav button', 'Episodes')
await clickText(page, 'tbody tr', 'Left ear investigation')
await shot(page, '04-episode')
await page.locator('a', { hasText: 'visit' }).first().click()
await page.waitForTimeout(400)
const c1 = await crumbs(page)
await shot(page, '05-visit-from-timeline')
await page.keyboard.press('Meta+BracketLeft')
await page.waitForTimeout(300)
// menu accelerators don't reach Playwright's synthetic keys; use the toolbar button instead if needed
if (!(await crumbs(page)).includes('Left ear investigation')) await page.getByLabel('Back').click()
await page.waitForTimeout(300)
const c2 = await crumbs(page)
await page.getByLabel('Back').click()
await page.waitForTimeout(300)
const c3 = await crumbs(page)
check('VA5', c1.startsWith('Visits') && c2.includes('Left ear investigation') && c3 === 'Episodes', `${c1} | ${c2} | ${c3}`)

// VA6: condition page
await clickText(page, 'nav button', 'Conditions')
await page.getByPlaceholder('Filter by name or alias').fill('ear thing')
await page.waitForTimeout(200)
await shot(page, '06-conditions-filtered')
await clickText(page, 'tbody tr', 'hearing loss')
await page.waitForTimeout(300)
await shot(page, '07-condition')
const cond = (await text(page)).toLowerCase()
check('VA6', ['key facts', 'body site', 'open original', 'linked from', 'resolved', 'provisional'].every((w) => cond.includes(w)), 'chips, facts, sources, backlinks')

// VA7: lab table
await clickText(page, 'nav button', 'Results')
await page.locator('tbody tr', { hasText: 'Blood tests' }).first().click()
await page.waitForTimeout(400)
await shot(page, '08-report')
const tables = await page.locator('article table').count()
const heads = await page.locator('article th').allInnerTexts()
check('VA7', tables > 0 && heads.includes('Flag'), `tables=${tables} headers=${heads.join(',')}`)

// VA8: restricted
await clickText(page, 'nav button', 'Conditions')
await page.getByPlaceholder('Filter by name or alias').fill('')
await page.waitForTimeout(200)
await shot(page, '09-conditions-list')
const listText = await text(page)
check('VA8a', listText.includes('Private condition') && !listText.toLowerCase().includes('anxiety'), 'neutral in list')
await page.getByPlaceholder('Filter by name or alias').fill('anxiety')
await page.waitForTimeout(200)
check('VA8b', (await text(page)).includes('Nothing matches'), 'filter does not find hidden words')
await page.getByPlaceholder('Filter by name or alias').fill('')
await clickText(page, 'tbody tr', 'Private condition')
await shot(page, '10-private-hidden')
const hiddenText = await text(page)
check('VA8c', hiddenText.includes('Private record') && !hiddenText.toLowerCase().includes('anxiety'), 'hidden page')
await clickText(page, 'button', 'Show')
await page.waitForTimeout(300)
await shot(page, '11-private-shown')
check('VA8d', (await text(page)).toLowerCase().includes('anxiety'), 'shown after click')

// VA10: broken file
await clickText(page, 'nav button', 'Conditions')
await clickText(page, 'tbody tr', 'cond-20261119-broken-yaml.md')
await shot(page, '12-broken')
check('VA10', (await text(page)).includes('Couldn’t read this file'), 'broken file shown, app alive')

// VA9: live refresh
await clickText(page, 'nav button', 'Allergies')
const before = await page.locator('tbody tr').count()
fs.writeFileSync(
  path.join(VAULT, 'memory/allergies/alg-latex.md'),
  `---\ntype: allergy-intolerance\ntitle: "Latex"\ndescription: "Latex · rash (owner)"\ntags: [allergy]\nsources:\n  - resource: "session:2026-11-19"\nfhir:\n  resourceType: AllergyIntolerance\n  id: alg-latex\n  code: {text: "Latex"}\n  patient: {reference: "Patient/pt-self"}\n---\n\n# Latex\n\nRash from latex gloves (owner).\n`
)
await page.waitForTimeout(2000)
const after = await page.locator('tbody tr').count()
await shot(page, '13-live-added')
check('VA9a', after === before + 1, `rows ${before} -> ${after} within 2s`)
await clickText(page, 'tbody tr', 'Latex')
const p = path.join(VAULT, 'memory/allergies/alg-latex.md')
fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace('Rash from latex gloves', 'Hives from latex gloves'))
await page.waitForTimeout(2000)
check('VA9b', (await text(page)).includes('Hives from latex gloves'), 'open record updated in place')
fs.rmSync(p)

// VA11: no network
const net = await page.evaluate(async () => {
  try {
    await fetch('https://example.com')
    return 'reached'
  } catch (e) {
    return 'blocked: ' + e.message
  }
})
check('VA11', net.startsWith('blocked'), net)

// All files view
await clickText(page, 'nav button', 'All files')
await shot(page, '14-all-files')

await app.close()

// VA3: relaunch remembers
;({ app, page } = await launch())
await page.waitForTimeout(500)
check('VA3a', (await text(page)).includes('In your vault'), 'relaunch opens overview')
// Restricted hidden again after relaunch
await clickText(page, 'nav button', 'Conditions')
await clickText(page, 'tbody tr', 'Private condition')
check('VA8e', (await text(page)).includes('Private record'), 'hidden again after relaunch')
await app.close()
fs.renameSync(VAULT, VAULT + '-moved')
;({ app, page } = await launch())
await shot(page, '15-vault-missing')
check('VA3b', (await text(page)).includes('can’t be found'), 'moved vault -> choose with reason')
await app.close()
fs.renameSync(VAULT + '-moved', VAULT)

fs.writeFileSync(path.join(WORK, 'results.txt'), results.join('\n') + '\n')
console.log('\nDONE', results.filter((r) => r.startsWith('FAIL')).length, 'failures')
