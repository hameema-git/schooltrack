/**
 * Rule-based WhatsApp school message parser.
 * No API calls. Detects type, subject, due date, amount from plain text.
 */

// ── Type detection ──────────────────────────────────────────────
const TYPE_RULES = [
  { type: 'fee',      patterns: [/fee/i, /payment/i, /pay\b/i, /amount/i, /fine/i, /term\s*\d/i, /auto\s*debit/i, /net\s*banking/i] },
  { type: 'test',     patterns: [/revision\s*test/i, /\btest\b/i, /exam/i, /assessment/i, /quiz/i, /\bUT\b/, /unit\s*test/i] },
  { type: 'material', patterns: [/send\s*₹/i, /bring\s*₹/i, /textbook/i, /book\b/i, /stationery/i, /material/i, /purchase/i, /storym/i, /storem/i, /uniform/i] },
  { type: 'circular', patterns: [/circular/i, /\.pdf/i, /notice\s*board/i, /forwarded/i] },
  { type: 'event',    patterns: [/holiday/i, /vacation/i, /onam/i, /christmas/i, /sports\s*day/i, /annual\s*day/i, /ptm/i, /open\s*house/i, /\bcca\b/i, /co-curricular/i] },
  { type: 'homework', patterns: [/homework/i, /home\s*work/i, /\bhw\b/i, /classwork/i, /worksheet/i, /fill\s*(in\s*)?(page|pg)/i, /complete\s*page/i, /write\b/i, /\bex\b.*\bpage\b/i] },
  { type: 'notice',   patterns: [/dear\s*parent/i, /kindly/i, /please\s*note/i, /important/i, /reminder/i, /inform/i, /conveyance/i, /uniform/i] },
]

// ── Subject detection ───────────────────────────────────────────
const SUBJECT_RULES = [
  { subject: 'maths',    patterns: [/maths?/i, /mathematics/i, /\bmath\b/i] },
  { subject: 'english',  patterns: [/english/i] },
  { subject: 'malayalam',patterns: [/malayalam/i, /\bmal\b/i] },
  { subject: 'hindi',    patterns: [/hindi/i] },
  { subject: 'science',  patterns: [/science/i, /physics/i, /chemistry/i, /biology/i] },
  { subject: 'social',   patterns: [/social/i, /history/i, /geography/i, /civics/i, /\bsst\b/i, /\bevs\b/i] },
  { subject: 'computer', patterns: [/computer/i, /\bit\b/i, /coding/i] },
  { subject: 'art',      patterns: [/art\b/i, /drawing/i, /craft/i, /\bcca\b/i] },
  { subject: 'pe',       patterns: [/\bpe\b/i, /sports/i, /physical/i, /\bpt\b/i] },
]

// ── Date extraction ─────────────────────────────────────────────
const MONTHS = {
  jan:1,feb:2,mar:3,apr:4,may:5,jun:6,
  jul:7,aug:8,sep:9,oct:10,nov:11,dec:12,
  january:1,february:2,march:3,april:4,june:6,
  july:7,august:8,september:9,october:10,november:11,december:12,
}
const DAYS_MAP = { monday:1, tuesday:2, wednesday:3, thursday:4, friday:5, saturday:6, sunday:0 }

function parseDate(text) {
  const now = new Date()
  const y   = now.getFullYear()

  // "tomorrow"
  if (/tomorrow/i.test(text)) {
    const d = new Date(now); d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }

  // "today"
  if (/\btoday\b/i.test(text)) {
    return now.toISOString().split('T')[0]
  }

  // "next Monday / this Thursday"
  const dayMatch = text.match(/(?:next|this)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i)
  if (dayMatch) {
    const target = DAYS_MAP[dayMatch[1].toLowerCase()]
    const d = new Date(now)
    const diff = (target - d.getDay() + 7) % 7 || 7
    d.setDate(d.getDate() + diff)
    return d.toISOString().split('T')[0]
  }

  // "DD Month YYYY" or "DD Month" — e.g. "4 June 2026", "11 Jun"
  const dmyMatch = text.match(/(\d{1,2})\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s*(\d{4})?/i)
  if (dmyMatch) {
    const day   = dmyMatch[1].padStart(2, '0')
    const month = String(MONTHS[dmyMatch[2].toLowerCase().slice(0,3)]).padStart(2, '0')
    const year  = dmyMatch[3] || y
    return `${year}-${month}-${day}`
  }

  // "June 4" or "June 4, 2026"
  const mdyMatch = text.match(/(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:[,\s]+(\d{4}))?/i)
  if (mdyMatch) {
    const month = String(MONTHS[mdyMatch[1].toLowerCase().slice(0,3)]).padStart(2, '0')
    const day   = mdyMatch[2].padStart(2, '0')
    const year  = mdyMatch[3] || y
    return `${year}-${month}-${day}`
  }

  // "DD/MM/YYYY" or "DD-MM-YYYY"
  const numMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/)
  if (numMatch) {
    const day   = numMatch[1].padStart(2, '0')
    const month = numMatch[2].padStart(2, '0')
    const year  = numMatch[3].length === 2 ? '20' + numMatch[3] : numMatch[3]
    return `${year}-${month}-${day}`
  }

  // "last date … 10 June" pattern
  const ldMatch = text.match(/last\s+date[^0-9]*(\d{1,2})\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)/i)
  if (ldMatch) {
    const day   = ldMatch[1].padStart(2, '0')
    const month = String(MONTHS[ldMatch[2].toLowerCase().slice(0,3)]).padStart(2, '0')
    return `${y}-${month}-${day}`
  }

  return ''
}

// ── Amount extraction ───────────────────────────────────────────
function parseAmount(text) {
  const m = text.match(/₹\s*(\d+(?:[,\d]*)?(?:\.\d+)?)/)
  if (m) return `₹${m[1].replace(/,/g,'')}`
  const m2 = text.match(/Rs\.?\s*(\d+(?:[,\d]*)?(?:\.\d+)?)/i)
  if (m2) return `₹${m2[1].replace(/,/g,'')}`
  return ''
}

// ── Title generation ────────────────────────────────────────────
function makeTitle(text, type, subject, amount) {
  // Try to pull the most meaningful sentence (first non-greeting line)
  const lines = text.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 8 && !/^dear\s*parent/i.test(l))

  if (lines.length > 0) {
    // Take first substantive line, cap at 60 chars
    let t = lines[0].replace(/^[•\-\*]\s*/, '').trim()
    if (t.length > 60) t = t.slice(0, 57) + '…'
    return t
  }

  // Fallback: build from type + subject + amount
  const typeLabel = { homework:'Homework', test:'Revision Test', notice:'Notice',
    fee:'Fee Payment', circular:'Circular', event:'Event', material:'Material needed' }
  let title = typeLabel[type] || 'Update'
  if (subject !== 'general') title += ` · ${subject}`
  if (amount) title += ` (${amount})`
  return title
}

// ── Main parser ─────────────────────────────────────────────────
export function parseWhatsAppMessage(text) {
  if (!text || !text.trim()) return null

  // Detect type — first match wins
  let update_type = 'notice'
  for (const rule of TYPE_RULES) {
    if (rule.patterns.some(p => p.test(text))) {
      update_type = rule.type
      break
    }
  }

  // Detect subject
  let subject = 'general'
  for (const rule of SUBJECT_RULES) {
    if (rule.patterns.some(p => p.test(text))) {
      subject = rule.subject
      break
    }
  }

  const due_date = parseDate(text)
  const amount   = parseAmount(text)
  const title    = makeTitle(text, update_type, subject, amount)

  // Clean description — strip greetings, trim to 200 chars
  const description = text
    .replace(/dear\s*parent[,\s]*/gi, '')
    .replace(/thank\s*you[.!]*/gi, '')
    .trim()
    .slice(0, 200)

  const is_urgent = due_date
    ? (new Date(due_date) - new Date()) / 86400000 <= 1
    : false

  return { update_type, subject, title, description, due_date, amount, is_urgent }
}
