import { useState } from 'react'
import { parseWhatsAppMessage } from '../utils/parser'

export default function WAPasteSheet({ onClose, onParsed }) {
  const [text, setText]     = useState('')
  const [result, setResult] = useState(null)

  const parse = () => {
    const parsed = parseWhatsAppMessage(text)
    if (parsed) setResult(parsed)
    else setResult({ error: true })
  }

  const confirm = () => {
    onParsed(result)
    onClose()
  }

  return (
    <div className="sheet-bg" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sheet-handle" />
        <div className="sheet-header">
          <span className="t-head">
            <span style={{ color:'#25D366', marginRight:6 }}>💬</span>
            Paste WhatsApp message
          </span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}
            style={{ fontSize:20, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        <div className="sheet-body">
          {!result ? (
            <>
              <p style={{ fontSize:13, color:'var(--ink2)', lineHeight:1.6 }}>
                Copy the teacher's message from your WhatsApp group and paste it below.
                We'll auto-detect the type, subject, date and amount.
              </p>
              <div className="field">
                <label>Message</label>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="e.g. Please send ₹35 for the Malayalam textbook by Thursday, 5 June…"
                  style={{ minHeight:120 }}
                  autoFocus
                />
              </div>
            </>
          ) : result.error ? (
            <div style={{
              background:'#FEF2F2', border:'0.5px solid #FECACA',
              borderRadius:'var(--r-sm)', padding:'12px 14px', fontSize:13, color:'#991B1B',
              display:'flex', gap:8, alignItems:'flex-start',
            }}>
              <i className="ti ti-alert-circle" style={{ fontSize:16, flexShrink:0, marginTop:1 }} aria-hidden="true" />
              <div>
                <div style={{ fontWeight:600, marginBottom:4 }}>Could not detect details</div>
                The message may be unclear. Use the manual form to fill in the details yourself.
              </div>
            </div>
          ) : (
            <>
              <div style={{
                background:'#F0FDF4', border:'1px solid rgba(22,101,52,.15)',
                borderRadius:'var(--r-sm)', padding:'10px 12px', fontSize:13,
                color:'#166534', marginBottom:4, display:'flex', gap:6,
              }}>
                <i className="ti ti-circle-check" style={{ fontSize:15, flexShrink:0, marginTop:1 }} aria-hidden="true" />
                Details detected! Review below and tap <strong>Open form</strong> to edit before saving.
              </div>

              {/* Preview */}
              <div className="card" style={{ display:'flex', flexDirection:'column', gap:10, fontSize:14 }}>
                <PreviewRow label="Type"    value={TYPE_LABELS[result.update_type]||result.update_type} />
                <PreviewRow label="Subject" value={result.subject} />
                <PreviewRow label="Title"   value={result.title} />
                {result.due_date && <PreviewRow label="Due"    value={result.due_date} urgent={result.is_urgent} />}
                {result.amount   && <PreviewRow label="Amount" value={result.amount} />}
                {result.description && (
                  <div style={{ borderTop:'1px solid var(--border)', paddingTop:8, color:'var(--ink3)', fontSize:13, lineHeight:1.5 }}>
                    {result.description.slice(0,100)}{result.description.length>100?'…':''}
                  </div>
                )}
              </div>

              <button onClick={() => setResult(null)} style={{
                border:'none', background:'none', cursor:'pointer', color:'var(--ink3)',
                fontSize:13, padding:'4px 0', fontFamily:'inherit',
                display:'flex', alignItems:'center', gap:5,
              }}>
                <i className="ti ti-arrow-left" style={{ fontSize:13 }} aria-hidden="true" />
                Re-paste different message
              </button>
            </>
          )}
        </div>

        <div className="sheet-actions">
          {!result ? (
            <>
              <button className="btn btn-primary" style={{ width:'100%' }}
                onClick={parse} disabled={!text.trim()}>
                <i className="ti ti-wand" style={{ fontSize:15 }} aria-hidden="true" />
                Auto-detect details
              </button>
              <button className="btn" style={{ width:'100%' }} onClick={onClose}>
                <i className="ti ti-edit" style={{ fontSize:15 }} aria-hidden="true" />
                Fill form manually instead
              </button>
            </>
          ) : result.error ? (
            <>
              <button className="btn btn-primary" style={{ width:'100%' }} onClick={onClose}>
                <i className="ti ti-edit" style={{ fontSize:15 }} aria-hidden="true" />
                Open manual form
              </button>
              <button className="btn" style={{ width:'100%' }} onClick={onClose}>
                <i className="ti ti-x" style={{ fontSize:15 }} aria-hidden="true" />
                Cancel
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-primary" style={{ width:'100%' }} onClick={confirm}>
                <i className="ti ti-arrow-right" style={{ fontSize:15 }} aria-hidden="true" />
                Open form to review & save
              </button>
              <button className="btn" style={{ width:'100%' }} onClick={onClose}>
                <i className="ti ti-x" style={{ fontSize:15 }} aria-hidden="true" />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function PreviewRow({ label, value, urgent }) {
  return (
    <div style={{ display:'flex', gap:10, alignItems:'baseline' }}>
      <span style={{
        fontSize:11, fontWeight:600, textTransform:'uppercase',
        letterSpacing:'.05em', color:'var(--ink3)', width:54, flexShrink:0,
      }}>{label}</span>
      <span style={{ fontWeight:500, color: urgent ? 'var(--red)' : 'var(--ink)' }}>
        {urgent && '⚑ '}{value}
      </span>
    </div>
  )
}

const TYPE_LABELS = {
  homework:'📝 Homework', test:'✏️ Revision Test', notice:'📢 Notice',
  fee:'💳 Fee', circular:'📄 Circular', event:'📅 Event', material:'📦 Material',
}
