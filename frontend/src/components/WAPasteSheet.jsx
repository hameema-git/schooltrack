import { useState } from 'react'
import { parseWhatsAppMessage } from '../utils/parser'

export default function WAPasteSheet({ onClose, onParsed }) {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)

  const parse = () => {
    const parsed = parseWhatsAppMessage(text)
    if (parsed) setResult(parsed)
  }

  const confirm = () => {
    onParsed(result)
    onClose()
  }

  return (
    <div className="sheet-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sheet-handle" />
        <div className="sheet-header">
          <span className="t-head">
            <span style={{ color: '#25D366', marginRight: 6 }}>💬</span>
            Paste WhatsApp message
          </span>
          <button className="btn btn-ghost btn-icon" onClick={onClose} style={{ fontSize: 20 }}>✕</button>
        </div>

        <div className="sheet-body">
          {!result ? (
            <>
              <p className="t-body" style={{ color: 'var(--ink2)' }}>
                Copy the teacher's message from your WhatsApp group and paste it below.
                We'll auto-detect the type, subject, date and amount for you.
              </p>
              <div className="field">
                <label>Message</label>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Please send ₹35 for the Malayalam textbook by Thursday, 5 June…"
                  style={{ minHeight: 120 }}
                  autoFocus
                />
              </div>
            </>
          ) : (
            <>
              <div style={{
                background: 'var(--surface2)', borderRadius: 'var(--r-sm)',
                padding: '10px 12px', fontSize: 13, color: 'var(--ink2)',
                marginBottom: 4, lineHeight: 1.5
              }}>
                ✅ Details detected — review below and tap <strong>Open form</strong> to edit anything before saving.
              </div>

              {/* Preview card */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                <Row label="Type"    value={TYPE_LABELS[result.update_type] || result.update_type} />
                <Row label="Subject" value={result.subject} />
                <Row label="Title"   value={result.title} />
                {result.due_date && <Row label="Due"   value={result.due_date} urgent={result.is_urgent} />}
                {result.amount   && <Row label="Amount" value={result.amount} />}
                {result.description && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, color: 'var(--ink3)', fontSize: 13, lineHeight: 1.5 }}>
                    {result.description.slice(0, 120)}{result.description.length > 120 ? '…' : ''}
                  </div>
                )}
              </div>

              <button className="btn btn-ghost" style={{ fontSize: 13, alignSelf: 'flex-start', padding: '4px 0', color: 'var(--ink3)' }}
                onClick={() => setResult(null)}>
                ← Re-paste
              </button>
            </>
          )}
        </div>

        <div className="sheet-actions">
          {!result ? (
            <>
              <button className="btn btn-primary" style={{ width: '100%' }}
                onClick={parse} disabled={!text.trim()}>
                Auto-detect details
              </button>
              <button className="btn" style={{ width: '100%' }} onClick={onClose}>
                Fill form manually instead
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={confirm}>
                Open form to review & save →
              </button>
              <button className="btn" style={{ width: '100%' }} onClick={onClose}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, urgent }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
      <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--ink3)', width: 54, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontWeight: 500, color: urgent ? 'var(--red)' : 'var(--ink)' }}>
        {urgent && '⚑ '}{value}
      </span>
    </div>
  )
}

const TYPE_LABELS = {
  homework: '📝 Homework',
  test:     '✏️ Revision Test',
  notice:   '📢 Notice',
  fee:      '💳 Fee',
  circular: '📄 Circular',
  event:    '📅 Event',
  material: '📦 Material',
}
