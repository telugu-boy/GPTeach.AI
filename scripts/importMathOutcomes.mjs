#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import xlsx from 'xlsx'
import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function requireEnv(key, fallbackKey) {
  const value = process.env[key] ?? (fallbackKey ? process.env[fallbackKey] : undefined)
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}${fallbackKey ? ` (or ${fallbackKey})` : ''}`)
  }
  return value
}

function normalizeGrade(label) {
  const normalized = label.trim()
  if (/kindergarten/i.test(normalized)) {
    return { gradeCode: 'K', gradeLabel: 'Kindergarten' }
  }
  const match = normalized.match(/\d+/)
  if (match) {
    return { gradeCode: match[0], gradeLabel: `Grade ${match[0]}` }
  }
  return { gradeCode: normalized.replace(/\s+/g, ''), gradeLabel: normalized }
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function strandCode(value) {
  const tokens = value.split(/[^A-Za-z0-9]+/).filter(Boolean)
  if (!tokens.length) return 'GEN'
  const letters = tokens
    .map((token) => {
      if (token.length <= 3) return token.toUpperCase()
      return token[0].toUpperCase()
    })
    .join('')
  return letters.slice(0, 6) || 'GEN'
}

function splitSpecificOutcomes(text) {
  const normalized = text.replace(/\r\n/g, '\n').trim()
  const regex = /(\d+)\.\s*([\s\S]*?)(?=(?:\n\d+\.\s)|$)/g
  const entries = []
  let match
  while ((match = regex.exec(normalized)) !== null) {
    const number = Number(match[1])
    const description = match[2].replace(/\s+/g, ' ').trim()
    if (!description) continue
    entries.push({ number, text: description })
  }
  if (!entries.length && normalized) {
    entries.push({ number: 1, text: normalized })
  }
  return entries
}

const dryRun = process.argv.includes('--dry-run')
let db = null

if (!dryRun) {
  const serviceAccountPath = requireEnv('FIREBASE_SERVICE_ACCOUNT', 'GOOGLE_APPLICATION_CREDENTIALS')
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'))
  initializeApp({ credential: cert(serviceAccount) })
  db = getFirestore()
}

const workbookPath = path.resolve(__dirname, '..', 'mathematics_outcomes_k9_complete.xlsx')
const workbook = xlsx.readFile(workbookPath, { cellDates: false })
const collectionName = process.env.FIREBASE_COLLECTION ?? 'mathOutcomes'

const docs = []
const generalCounters = new Map()

for (const sheetName of workbook.SheetNames) {
  const sheet = workbook.Sheets[sheetName]
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' })
  for (const row of rows) {
    const gradeRaw = (row['Grade'] ?? '').trim()
    const generalOutcome = (row['General Outcome'] ?? '').trim()
    const specificRaw = (row['Specific Outcomes'] ?? '').trim()
    if (!gradeRaw || !specificRaw) continue

    const { gradeCode, gradeLabel } = normalizeGrade(gradeRaw)
    const counterKey = `${sheetName}|${gradeCode}`
    const generalIndex = (generalCounters.get(counterKey) ?? 0) + 1
    generalCounters.set(counterKey, generalIndex)

    const specs = splitSpecificOutcomes(specificRaw)
    const strandSlug = slugify(sheetName)
    const strandShort = strandCode(sheetName)

    specs.forEach(({ number, text }) => {
      const paddedGeneral = String(generalIndex).padStart(2, '0')
      const paddedSpecific = String(number).padStart(2, '0')
      const id = `math-${gradeCode}-${strandSlug}-${paddedGeneral}-${paddedSpecific}`
      docs.push({
        id,
        code: `MATH${gradeCode}-${strandShort}${paddedGeneral}.${paddedSpecific}`,
        subject: 'Mathematics',
        grade: gradeCode,
        gradeLabel,
        strand: sheetName,
        strandSlug,
        generalOutcome,
        generalIndex,
        specificIndex: number,
        description: `${generalOutcome} — ${text}`,
        jurisdiction: 'Alberta',
        searchText: [gradeLabel, sheetName, generalOutcome, text].join(' ').toLowerCase(),
      })
    })
  }
}

console.log(`Prepared ${docs.length} outcomes across ${workbook.SheetNames.length} strands.`)

if (dryRun) {
  const outputPath = path.resolve(__dirname, '..', 'dist', 'mathOutcomes.json')
  fs.writeFileSync(outputPath, JSON.stringify(docs, null, 2))
  console.log(`Dry run complete. Wrote ${docs.length} outcomes to ${outputPath}`)
  process.exit(0)
}

const chunkSize = 400
let processed = 0

while (processed < docs.length) {
  const batch = db.batch()
  const slice = docs.slice(processed, processed + chunkSize)
  slice.forEach((doc) => {
    const ref = db.collection(collectionName).doc(doc.id)
    batch.set(ref, doc, { merge: true })
  })
  // eslint-disable-next-line no-await-in-loop
  await batch.commit()
  processed += slice.length
  console.log(`Committed ${processed}/${docs.length}`)
}

console.log('Import complete.')
