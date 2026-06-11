import { useState } from 'react'
import { updates as api } from '../api'
import { useAuth } from '../AuthContext'

const TYPES = [
  ['homework', '📝', 'Homework'],
  ['test',     '✏️', 'Test'],
  ['notice',   '📢', 'Notice'],
  ['fee',      '💳', 'Fee'],
  ['circular', '📄', 'Circular'],
  ['event',    '📅', 'Event'],
  ['material', '📦', 'Material'],
]

const SUBJECTS = [
  ['general','General'],['english','English'],['malayalam','Malayalam'],
  ['hindi','Hindi'],['maths','Maths'],['science','Science'],
  ['social','Social Science'],['computer','Computer'],['art','Art'],['pe','PE'],
]

const GRADES = Array.from({ length: 12 }, (_, i) => String(i + 1))

export default function AddUpdateSheet({ onClose, onSaved, initialData }) {
  const { user } = useAuth()
  const p = initialData?.prefill || {}

  const [form, setForm] = useState({
    update_type: p.update_type || 'homework',
    subject:     p.subject     || 'general',
    title:       p.title       || '',
    description: p.description || '',
    due_date:    p.due_date    || '',
    amount:      p.amount      || '',
    grade:       initialData?.grade     || user?.grade    || '4',
    division:    initialData?.division  || user?.division || 'ALL',
    is_urgent:   p.is_urgent   || false,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.title.trim()) { setError('Please enter a title'); return }
    setSaving(true); setError('')
    try {
      const r = await api.create(form)
      onSaved(r.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save. Check your role — only Class Reps and above can add updates.')
    } finally { setSaving(false) }
  }

  const hasPrefill = !!initialData?.prefill

  return (
    <div className="sheet-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sheet-handle" />
        <div className="sheet-header">
          <span className="t-head">
            {hasPrefill ? '✅ Review & save' : '➕ Add update'}
          </span>
          <button className="btn btn-ghost btn-icon" onClick={onClose} style={{ fontSize: 20 }}>✕</button>
        </div>

        <div className="sheet-body">
          {hasPrefill && (
            <div style={{
              background: '#F0FDF4', border: '1px solid rgba(22,101,52,.2)',
              borderRadius: 'var(--r-sm)', padding: '9px 12px',
              fontSize: 13, color: '#166534'
            }}>
              Details were auto-detected from your message. Edit anything that looks wrong.
            </div>
          )}

          {/* Type — tap pills */}
          <div className="field">
            <label>Type</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 2 }}>
              {TYPES.map(([v, icon, l]) => (
                <button key={v}
                  className={`chip${form.update_type === v ? ' on' : ''}`}
                  onClick={() => set('update_type', v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {icon} {l}
                </button>
              ))}
            </div>
          </div>

          {/* Title — most important field, placed high */}
          <div className="field">
            <label>Title <span style={{ color: 'var(--red)', fontSize: 13 }}>*</span></label>
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g. Send ₹35 for Malayalam book"
              autoFocus={!hasPrefill}
            />
          </div>

          <div className="form-grid">
            <div className="field">
              <label>Subject</label>
              <select value={form.subject} onChange={e => set('subject', e.target.value)}>
                {SUBJECTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Due date</label>
              <input type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} />
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label>Grade</label>
              <select value={form.grade} onChange={e => set('grade', e.target.value)}>
                {GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Division</label>
              <select value={form.division} onChange={e => set('division', e.target.value)}>
                <option value="ALL">All divisions</option>
                {['A','B','C','D'].map(d => <option key={d} value={d}>Div {d}</option>)}
              </select>
            </div>
          </div>

          <div className="field">
            <label>Details <span style={{ color: 'var(--ink3)', fontWeight: 400, textTransform: 'none', fontSize: 12 }}>(optional)</span></label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Any extra info for parents…"
              style={{ minHeight: 64 }}
            />
          </div>

          <div className="form-grid">
            <div className="field">
              <label>Amount <span style={{ color: 'var(--ink3)', fontWeight: 400, textTransform: 'none', fontSize: 12 }}>(if any)</span></label>
              <input value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="₹35" />
            </div>
            <div className="field" style={{ justifyContent: 'flex-end', paddingBottom: 2 }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: 8,
                cursor: 'pointer', textTransform: 'none', fontSize: 14, fontWeight: 400
              }}>
                <input type="checkbox" checked={form.is_urgent}
                  onChange={e => set('is_urgent', e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--indigo)', flexShrink: 0 }} />
                Mark urgent
              </label>
            </div>
          </div>

          {error && (
            <div style={{ background: 'var(--red-l)', borderRadius: 'var(--r-sm)', padding: '9px 12px', fontSize: 13, color: 'var(--red)' }}>
              {error}
            </div>
          )}
        </div>

        <div className="sheet-actions">
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={save} disabled={saving}>
            {saving ? 'Saving…' : '✓ Save update'}
          </button>
          <button className="btn" style={{ width: '100%' }} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
