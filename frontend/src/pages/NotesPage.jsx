import { useState, useEffect, useCallback } from 'react'
import { notes as api } from '../api'
import { useAuth } from '../AuthContext'
import { Toast, useToast } from '../components/Toast'

const SUBJECTS = [
  ['general','All'],['english','English'],['malayalam','Malayalam'],['hindi','Hindi'],
  ['maths','Maths'],['science','Science'],['social','Social'],['computer','Computer'],['art','Art'],['pe','PE'],
]
const GRADES = Array.from({ length: 12 }, (_, i) => String(i + 1))

export default function NotesPage() {
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [grade, setGrade] = useState(user?.grade || '4')
  const [div, setDiv] = useState(user?.division || 'ALL')
  const [subject, setSubject] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const { toast, show } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { grade }
      if (div !== 'ALL') params.division = div
      if (subject) params.subject = subject
      if (dateFilter) params.date = dateFilter
      const r = await api.list(params)
      setNotes(r.data)
    } finally { setLoading(false) }
  }, [grade, div, subject, dateFilter])

  useEffect(() => { load() }, [load])

  const toggleHelpful = async (id) => {
    const r = await api.toggleHelpful(id)
    setNotes(prev => prev.map(n => n.id === id
      ? { ...n, is_helpful: r.data.helpful, helpful_count: r.data.count } : n))
  }

  const deleteNote = async (id) => {
    setNotes(prev => prev.filter(n => n.id !== id))
    await api.delete(id)
    show('Deleted')
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div className="t-title">Class Notes</div>
            <div className="t-caption" style={{ marginTop: 2 }}>Shared by parents · for parents</div>
          </div>
          <div className="row gap-4">
            <select value={grade} onChange={e => setGrade(e.target.value)}
              style={selectStyle}>
              {GRADES.map(g => <option key={g} value={g}>Gr {g}</option>)}
            </select>
            <select value={div} onChange={e => setDiv(e.target.value)}
              style={selectStyle}>
              <option value="ALL">All div</option>
              {['A','B','C','D'].map(d => <option key={d} value={d}>Div {d}</option>)}
            </select>
          </div>
        </div>

        {/* Subject chips */}
        <div className="chip-row">
          {SUBJECTS.map(([v, l]) => (
            <button key={v} className={`chip${subject === (v === 'general' ? '' : v) ? ' on' : ''}`}
              onClick={() => setSubject(v === 'general' ? '' : v)}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Date filter */}
      <div style={{ padding: '10px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--ink3)' }}>📅 Class date:</span>
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          style={{ flex: 1, fontSize: 13, padding: '6px 10px', border: '1px solid var(--border2)', borderRadius: 8, fontFamily: 'inherit', color: 'var(--ink)' }} />
        {dateFilter && (
          <button className="btn btn-ghost btn-sm" style={{ fontSize: 13, padding: '6px 10px', minHeight: 0 }}
            onClick={() => setDateFilter('')}>Clear</button>
        )}
      </div>

      {/* How it works banner — only when no notes */}
      {!loading && notes.length === 0 && (
        <div style={{ margin: '0 16px 12px', background: 'var(--indigo-l)', borderRadius: 'var(--r)', padding: '14px 16px' }}>
          <div style={{ fontWeight: 600, color: 'var(--indigo)', marginBottom: 6 }}>📒 How class notes sharing works</div>
          <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.6 }}>
            1. A parent takes a photo of their child's notebook pages<br />
            2. Uploads it here with the subject and class date<br />
            3. Claude reads the images and writes a quick summary<br />
            4. Any parent whose child missed that day can view it here
          </div>
        </div>
      )}

      <div style={{ padding: '0 16px' }}>
        {loading ? (
          <div className="loading-wrap">Loading…</div>
        ) : notes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📒</div>
            <div style={{ fontWeight: 600, color: 'var(--ink)' }}>No notes yet</div>
            <div style={{ marginTop: 4, fontSize: 13 }}>
              {dateFilter
                ? `No notes uploaded for ${dateFilter}.`
                : `No notes for Grade ${grade}${div !== 'ALL' ? ` Div ${div}` : ''}.`}
            </div>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowUpload(true)}>
              📤 Be the first to upload
            </button>
          </div>
        ) : (
          notes.map(note => (
            <NoteCard key={note.id} note={note}
              userId={user?.id}
              onHelpful={toggleHelpful}
              onDelete={deleteNote}
            />
          ))
        )}
      </div>

      {/* FAB */}
      <button className="fab" onClick={() => setShowUpload(true)} aria-label="Upload notes" style={{ fontSize: 22 }}>📤</button>

      {showUpload && (
        <UploadSheet
          defaultGrade={grade} defaultDiv={div}
          onClose={() => setShowUpload(false)}
          onSaved={(note) => { setNotes(prev => [note, ...prev]); setShowUpload(false); show('✓ Notes uploaded!') }}
        />
      )}

      <Toast message={toast} />
    </div>
  )
}

function NoteCard({ note, userId, onHelpful, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  const subjectColor = {
    maths: ['#EEF2FF','#3730A3'], english: ['#DCFCE7','#166534'],
    science: ['#FEF3C7','#92400E'], malayalam: ['#FEE2E2','#991B1B'],
    hindi: ['#EEEDFE','#534AB7'],
  }
  const [bg, fg] = subjectColor[note.subject] || ['#F6F5F2','#5A5870']

  return (
    <div className="note-card" style={{ marginBottom: 10 }}>
      <div className="note-card-header">
        <div className="row" style={{ marginBottom: 6 }}>
          <span style={{ fontWeight: 600, fontSize: 15, flex: 1 }}>
            {note.title || `${note.subject} notes`}
          </span>
          <span className="badge" style={{ background: bg, color: fg }}>
            {note.subject}
          </span>
        </div>
        <div className="row" style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--ink3)' }}>📅 {note.class_date}</span>
          <span style={{ fontSize: 12, color: 'var(--ink3)' }}>
            Gr {note.grade}{note.division !== 'ALL' ? note.division : ''}
          </span>
          {note.images?.length > 0 && (
            <span style={{ fontSize: 12, color: 'var(--ink3)' }}>
              📷 {note.images.length} page{note.images.length > 1 ? 's' : ''}
            </span>
          )}
          <span style={{ fontSize: 12, color: 'var(--ink3)', marginLeft: 'auto' }}>
            by {note.uploaded_by_name}
          </span>
        </div>

        {note.description && (
          <p style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 8, lineHeight: 1.5 }}>
            {note.description}
          </p>
        )}

        {/* AI Summary */}
        {note.ai_summary && (
          <div className="ai-chip">
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.05em' }}>
              ✨ AI Summary
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {note.ai_summary}
            </p>
          </div>
        )}

        {/* Action row */}
        <div className="row" style={{ marginTop: 8 }}>
          {note.images?.length > 0 && (
            <button className="btn btn-pill"
              style={{ fontSize: 13, minHeight: 34, padding: '6px 14px' }}
              onClick={() => setExpanded(!expanded)}>
              {expanded ? '▲ Hide pages' : `▼ See ${note.images.length} page${note.images.length > 1 ? 's' : ''}`}
            </button>
          )}
          <button
            onClick={() => onHelpful(note.id)}
            style={{
              border: 'none', background: note.is_helpful ? 'var(--green-l)' : 'var(--surface2)',
              borderRadius: 20, padding: '5px 12px', fontSize: 13, cursor: 'pointer',
              color: note.is_helpful ? 'var(--green)' : 'var(--ink3)', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 4, minHeight: 34,
            }}>
            👍 {note.helpful_count || 0}
          </button>
          {note.uploaded_by === userId && (
            <button onClick={() => onDelete(note.id)}
              style={{ border: 'none', background: 'none', color: 'var(--ink3)', cursor: 'pointer', fontSize: 13, padding: '5px 8px', marginLeft: 'auto' }}>
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Image strip */}
      {expanded && note.images?.length > 0 && (
        <div className="note-img-row">
          {note.images.map(img => (
            <a key={img.id} href={img.image_url} target="_blank" rel="noreferrer">
              <img src={img.image_url} alt={`Page ${img.page_number}`} className="note-img" />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function UploadSheet({ defaultGrade, defaultDiv, onClose, onSaved }) {
  const [form, setForm] = useState({
    grade: defaultGrade, division: defaultDiv,
    subject: 'general',
    class_date: new Date().toISOString().split('T')[0],
    title: '', description: '',
  })
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 8)
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const save = async () => {
    if (!form.class_date) { setError('Set the class date'); return }
    if (images.length === 0) { setError('Please add at least one photo'); return }
    setSaving(true); setError('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      images.forEach(img => fd.append('images', img))
      const r = await api.create(fd)
      onSaved(r.data)
    } catch { setError('Upload failed. Please try again.') }
    finally { setSaving(false) }
  }

  const SUBJECTS_UPLOAD = [
    ['general','General'],['english','English'],['malayalam','Malayalam'],['hindi','Hindi'],
    ['maths','Maths'],['science','Science'],['social','Social Science'],['computer','Computer'],['art','Art'],['pe','PE'],
  ]

  return (
    <div className="sheet-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sheet-handle" />
        <div className="sheet-header">
          <span className="t-head">📤 Upload class notes</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose} style={{ fontSize: 20 }}>✕</button>
        </div>

        <div className="sheet-body">
          <p style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.5 }}>
            Take a photo of your child's notebook and share it so other parents can help their kids catch up.
            Claude will auto-summarise what was covered.
          </p>

          {/* Photo picker - big and obvious */}
          <div
            onClick={() => document.getElementById('note-img-input').click()}
            style={{
              border: '2px dashed var(--border2)', borderRadius: 'var(--r)',
              padding: previews.length ? '10px' : '28px',
              textAlign: 'center', cursor: 'pointer',
              background: 'var(--surface2)',
            }}>
            {previews.length === 0 ? (
              <>
                <div style={{ fontSize: 36, marginBottom: 6 }}>📷</div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>Tap to add photos</div>
                <div style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 4 }}>Up to 8 pages</div>
              </>
            ) : (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {previews.map((p, i) => (
                  <img key={i} src={p} alt=""
                    style={{ width: 72, height: 90, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                ))}
                <div style={{ width: 72, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', borderRadius: 6, border: '1px dashed var(--border2)', fontSize: 22, color: 'var(--ink3)' }}>+</div>
              </div>
            )}
            <input id="note-img-input" type="file" accept="image/*" multiple
              onChange={handleImages} style={{ display: 'none' }} />
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
                <option value="ALL">All</option>
                {['A','B','C','D'].map(d => <option key={d} value={d}>Div {d}</option>)}
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label>Subject</label>
              <select value={form.subject} onChange={e => set('subject', e.target.value)}>
                {SUBJECTS_UPLOAD.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Class date</label>
              <input type="date" value={form.class_date} onChange={e => set('class_date', e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label>Title (optional)</label>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="e.g. Chapter 5 — Fractions" />
          </div>

          <div className="field">
            <label>What was covered (optional)</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Brief note for other parents…" style={{ minHeight: 60 }} />
          </div>

          {error && <p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p>}
          {saving && (
            <div style={{ background: 'var(--surface2)', borderRadius: 'var(--r-sm)', padding: '10px 14px', fontSize: 13, color: 'var(--ink2)' }}>
              ⏳ Uploading photos and generating AI summary… this takes a few seconds.
            </div>
          )}
        </div>

        <div className="sheet-actions">
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={save} disabled={saving}>
            {saving ? 'Uploading…' : '📤 Upload notes'}
          </button>
        </div>
      </div>
    </div>
  )
}

const selectStyle = {
  fontSize: 13, padding: '6px 28px 6px 10px', borderRadius: 8,
  border: '1px solid var(--border2)', background: 'var(--surface)', color: 'var(--ink)',
  fontFamily: 'inherit', WebkitAppearance: 'none',
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%235A5870' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
}
