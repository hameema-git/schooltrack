import { useState, useEffect, useCallback } from 'react'
import { notes as api } from '../api'
import { useAuth } from '../AuthContext'
import { Toast, useToast } from '../components/Toast'

const SUBJECTS = [
  ['','All'],['english','English'],['malayalam','Malayalam'],['hindi','Hindi'],
  ['maths','Maths'],['science','Science'],['social','Social'],
  ['computer','Computer'],['art','Art'],['pe','PE'],
]
const GRADES = Array.from({ length:12 }, (_,i) => String(i+1))

export default function NotesPage() {
  const { user } = useAuth()
  const [notes, setNotes]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [grade, setGrade]         = useState(user?.grade || '4')
  const [div, setDiv]             = useState(user?.division || 'ALL')
  const [subject, setSubject]     = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const { toast, show } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { grade }
      if (div !== 'ALL') params.division = div
      if (subject)       params.subject = subject
      if (dateFilter)    params.date = dateFilter
      const r = await api.list(params)
      setNotes(r.data)
    } finally { setLoading(false) }
  }, [grade, div, subject, dateFilter])

  useEffect(() => { load() }, [load])

  const toggleHelpful = async (id) => {
    const r = await api.toggleHelpful(id)
    setNotes(prev => prev.map(n => n.id===id
      ? { ...n, is_helpful:r.data.helpful, helpful_count:r.data.count } : n))
  }

  const deleteNote = async (id) => {
    setNotes(prev => prev.filter(n => n.id!==id))
    await api.delete(id)
    show('Deleted')
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="row" style={{ justifyContent:'space-between', marginBottom:10 }}>
          <div>
            <div className="t-title">Class Notes</div>
            <div className="t-caption" style={{ marginTop:2 }}>Shared by parents · for parents</div>
          </div>
          <div className="row" style={{ gap:6 }}>
            <select value={grade} onChange={e=>setGrade(e.target.value)} style={selStyle}>
              {GRADES.map(g=><option key={g} value={g}>Gr {g}</option>)}
            </select>
            <select value={div} onChange={e=>setDiv(e.target.value)} style={selStyle}>
              <option value="ALL">All</option>
              {['A','B','C','D'].map(d=><option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Subject chips */}
        <div className="chip-row">
          {SUBJECTS.map(([v,l]) => (
            <button key={v} className={`chip${subject===v?' on':''}`} onClick={()=>setSubject(v)}>{l}</button>
          ))}
        </div>
      </div>

      {/* Date filter row */}
      <div style={{ padding:'10px 16px', display:'flex', gap:8, alignItems:'center' }}>
        <i className="ti ti-calendar" style={{ fontSize:15, color:'var(--ink3)', flexShrink:0 }} aria-hidden="true" />
        <span style={{ fontSize:13, color:'var(--ink3)', flexShrink:0 }}>Class date:</span>
        <input type="date" value={dateFilter} onChange={e=>setDateFilter(e.target.value)}
          style={{ flex:1, fontSize:13, padding:'6px 10px', border:'1px solid var(--border2)', borderRadius:8, fontFamily:'inherit', color:'var(--ink)' }} />
        {dateFilter && (
          <button onClick={()=>setDateFilter('')} style={{
            border:'0.5px solid var(--border2)', background:'none', borderRadius:8,
            padding:'6px 10px', fontSize:13, cursor:'pointer', color:'var(--ink2)', fontFamily:'inherit',
            display:'flex', alignItems:'center', gap:4,
          }}>
            <i className="ti ti-x" style={{ fontSize:13 }} aria-hidden="true" /> Clear
          </button>
        )}
      </div>

      {/* How it works — shown when empty */}
      {!loading && notes.length===0 && (
        <div style={{ margin:'0 16px 12px', background:'#EEF2FF', borderRadius:'var(--r)', padding:'14px 16px', border:'0.5px solid rgba(99,102,241,.2)' }}>
          <div style={{ fontWeight:600, color:'#3730A3', marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
            <i className="ti ti-info-circle" style={{ fontSize:15 }} aria-hidden="true" />
            How class notes sharing works
          </div>
          {[
            'A parent photos their child\'s notebook pages',
            'Uploads here with subject and class date',
            'Any parent can view notes for days their child missed',
          ].map((s,i) => (
            <div key={i} style={{ fontSize:13, color:'var(--ink2)', display:'flex', gap:8, marginBottom:4 }}>
              <span style={{ background:'#3730A3', color:'#fff', borderRadius:'50%', width:18, height:18, display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, flexShrink:0, marginTop:1 }}>{i+1}</span>
              {s}
            </div>
          ))}
        </div>
      )}

      <div style={{ padding:'0 16px' }}>
        {loading ? (
          <div className="loading-wrap">Loading…</div>
        ) : notes.length===0 ? (
          <div className="empty-state">
            <div className="empty-icon">📒</div>
            <div style={{ fontWeight:600, color:'var(--ink)' }}>No notes yet</div>
            <div style={{ fontSize:13, marginTop:4 }}>
              {dateFilter ? `No notes uploaded for ${dateFilter}.` : `No notes for Grade ${grade}${div!=='ALL'?` Div ${div}`:''}.`}
            </div>
            <button className="btn btn-primary" style={{ marginTop:16 }} onClick={()=>setShowUpload(true)}>
              <i className="ti ti-upload" style={{ fontSize:15 }} aria-hidden="true" />
              Be the first to upload
            </button>
          </div>
        ) : notes.map(note => (
          <NoteCard key={note.id} note={note} userId={user?.id}
            onHelpful={toggleHelpful} onDelete={deleteNote} />
        ))}
      </div>

      {/* FAB */}
      <button className="fab" onClick={()=>setShowUpload(true)} aria-label="Upload notes">
        <i className="ti ti-upload" style={{ fontSize:22 }} aria-hidden="true" />
      </button>

      {showUpload && (
        <UploadSheet
          defaultGrade={grade} defaultDiv={div}
          onClose={()=>setShowUpload(false)}
          onSaved={(note)=>{ setNotes(prev=>[note,...prev]); setShowUpload(false); show('✓ Notes uploaded!') }}
        />
      )}
      <Toast message={toast} />
    </div>
  )
}

function NoteCard({ note, userId, onHelpful, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const subjectColor = {
    maths:['#EEF2FF','#3730A3'], english:['#DCFCE7','#166534'],
    science:['#FEF3C7','#92400E'], malayalam:['#FEE2E2','#991B1B'],
    hindi:['#EEEDFE','#534AB7'],
  }
  const [bg,fg] = subjectColor[note.subject] || ['#F6F5F2','#5A5870']

  return (
    <div style={{ background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:'var(--r)', marginBottom:10, overflow:'hidden' }}>
      <div style={{ padding:'13px 14px' }}>
        <div className="row" style={{ marginBottom:6 }}>
          <span style={{ fontWeight:600, fontSize:15, flex:1 }}>{note.title || `${note.subject} notes`}</span>
          <span className="badge" style={{ background:bg, color:fg, fontSize:11 }}>{note.subject}</span>
        </div>
        <div className="row" style={{ marginBottom:8, gap:10 }}>
          <span style={{ fontSize:12, color:'var(--ink3)', display:'flex', alignItems:'center', gap:4 }}>
            <i className="ti ti-calendar" style={{ fontSize:12 }} aria-hidden="true" />{note.class_date}
          </span>
          <span style={{ fontSize:12, color:'var(--ink3)' }}>Gr {note.grade}{note.division!=='ALL'?note.division:''}</span>
          {note.images?.length>0 && <span style={{ fontSize:12, color:'var(--ink3)', display:'flex', alignItems:'center', gap:3 }}>
            <i className="ti ti-photo" style={{ fontSize:12 }} aria-hidden="true" />{note.images.length} page{note.images.length>1?'s':''}
          </span>}
          <span style={{ fontSize:12, color:'var(--ink3)', marginLeft:'auto' }}>by {note.uploaded_by_name}</span>
        </div>

        {note.description && <p style={{ fontSize:13, color:'var(--ink2)', marginBottom:8, lineHeight:1.5 }}>{note.description}</p>}

        {/* Action row */}
        <div className="row">
          {note.images?.length>0 && (
            <button onClick={()=>setExpanded(!expanded)} style={{
              border:'0.5px solid var(--border2)', background:'none', borderRadius:20,
              padding:'5px 12px', fontSize:13, cursor:'pointer', color:'var(--ink2)',
              fontFamily:'inherit', display:'flex', alignItems:'center', gap:5, minHeight:34,
            }}>
              <i className={`ti ti-${expanded?'eye-off':'eye'}`} style={{ fontSize:13 }} aria-hidden="true" />
              {expanded ? 'Hide' : `View ${note.images.length} page${note.images.length>1?'s':''}`}
            </button>
          )}
          <button onClick={()=>onHelpful(note.id)} style={{
            border:'none', borderRadius:20, padding:'5px 12px', fontSize:13,
            cursor:'pointer', fontFamily:'inherit', minHeight:34,
            background: note.is_helpful ? '#DCFCE7' : 'var(--surface2)',
            color: note.is_helpful ? '#166534' : 'var(--ink3)',
            display:'flex', alignItems:'center', gap:5, fontWeight:500,
          }}>
            <i className="ti ti-thumb-up" style={{ fontSize:13 }} aria-hidden="true" />
            {note.helpful_count||0} Helpful
          </button>
          {note.uploaded_by===userId && (
            <button onClick={()=>onDelete(note.id)} style={{
              border:'0.5px solid #FECACA', background:'none', borderRadius:20,
              padding:'5px 12px', fontSize:13, cursor:'pointer', color:'#991B1B',
              fontFamily:'inherit', display:'flex', alignItems:'center', gap:4, minHeight:34, marginLeft:'auto',
            }}>
              <i className="ti ti-trash" style={{ fontSize:13 }} aria-hidden="true" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Image strip */}
      {expanded && note.images?.length>0 && (
        <div style={{ display:'flex', gap:6, padding:'0 14px 12px', overflowX:'auto', scrollbarWidth:'none' }}>
          {note.images.map(img => (
            <a key={img.id} href={img.image_url} target="_blank" rel="noreferrer">
              <img src={img.image_url} alt={`Page ${img.page_number}`}
                style={{ width:90, height:120, objectFit:'cover', borderRadius:8, border:'0.5px solid var(--border)', flexShrink:0 }} />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function UploadSheet({ defaultGrade, defaultDiv, onClose, onSaved }) {
  const [form, setForm] = useState({
    grade:defaultGrade, division:defaultDiv, subject:'general',
    class_date:new Date().toISOString().split('T')[0], title:'', description:'',
  })
  const [images, setImages]   = useState([])
  const [previews, setPreviews] = useState([])
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  const set = (k,v) => setForm(f => ({ ...f, [k]:v }))

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0,8)
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const save = async () => {
    if (!form.class_date) { setError('Please set the class date'); return }
    if (images.length===0) { setError('Please add at least one photo of the notes'); return }
    setSaving(true); setError('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k,v]) => fd.append(k,v))
      images.forEach(img => fd.append('images',img))
      const r = await api.create(fd)
      onSaved(r.data)
    } catch { setError('Upload failed. Please try again.') }
    finally { setSaving(false) }
  }

  const SUBJECTS_LIST = [
    ['general','General'],['english','English'],['malayalam','Malayalam'],['hindi','Hindi'],
    ['maths','Maths'],['science','Science'],['social','Social Science'],
    ['computer','Computer'],['art','Art'],['pe','PE'],
  ]

  return (
    <div className="sheet-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="sheet">
        <div className="sheet-handle" />
        <div className="sheet-header">
          <span className="t-head">
            <i className="ti ti-upload" style={{ fontSize:16, marginRight:6 }} aria-hidden="true" />
            Upload class notes
          </span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}
            style={{ fontSize:20, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        <div className="sheet-body">
          <p style={{ fontSize:13, color:'var(--ink2)', lineHeight:1.6 }}>
            Take photos of your child's notebook and share with other parents whose child missed this class.
          </p>

          {/* Photo picker */}
          <div onClick={()=>document.getElementById('note-img-input').click()}
            style={{
              border:'2px dashed var(--border2)', borderRadius:'var(--r)',
              padding: previews.length ? '10px' : '28px',
              textAlign:'center', cursor:'pointer', background:'var(--surface2)',
            }}>
            {previews.length===0 ? (
              <>
                <i className="ti ti-camera" style={{ fontSize:36, color:'var(--ink3)', display:'block', marginBottom:8 }} aria-hidden="true" />
                <div style={{ fontWeight:600, fontSize:15 }}>Tap to add photos</div>
                <div style={{ fontSize:12, color:'var(--ink3)', marginTop:4 }}>Up to 8 pages</div>
              </>
            ) : (
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {previews.map((p,i) => (
                  <img key={i} src={p} alt="" style={{ width:72, height:90, objectFit:'cover', borderRadius:6 }} />
                ))}
                <div style={{ width:72, height:90, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--surface)', borderRadius:6, border:'1px dashed var(--border2)', fontSize:22, color:'var(--ink3)' }}>
                  <i className="ti ti-plus" aria-hidden="true" />
                </div>
              </div>
            )}
            <input id="note-img-input" type="file" accept="image/*" multiple onChange={handleImages} style={{ display:'none' }} />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="field">
              <label>Grade</label>
              <select value={form.grade} onChange={e=>set('grade',e.target.value)}>
                {GRADES.map(g=><option key={g} value={g}>Grade {g}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Division</label>
              <select value={form.division} onChange={e=>set('division',e.target.value)}>
                <option value="ALL">All</option>
                {['A','B','C','D'].map(d=><option key={d} value={d}>Div {d}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="field">
              <label>Subject</label>
              <select value={form.subject} onChange={e=>set('subject',e.target.value)}>
                {SUBJECTS_LIST.map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Class date</label>
              <input type="date" value={form.class_date} onChange={e=>set('class_date',e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label>Title (optional)</label>
            <input value={form.title} onChange={e=>set('title',e.target.value)} placeholder="e.g. Chapter 5 — Fractions" />
          </div>
          <div className="field">
            <label>What was covered (optional)</label>
            <textarea value={form.description} onChange={e=>set('description',e.target.value)}
              placeholder="Brief note for other parents…" style={{ minHeight:60 }} />
          </div>

          {error && (
            <div style={{ background:'#FEF2F2', borderRadius:8, padding:'9px 12px', fontSize:13, color:'#991B1B', display:'flex', gap:6 }}>
              <i className="ti ti-alert-circle" style={{ fontSize:15, flexShrink:0 }} aria-hidden="true" /> {error}
            </div>
          )}
          {saving && (
            <div style={{ background:'var(--surface2)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'var(--ink2)', display:'flex', gap:6, alignItems:'center' }}>
              <i className="ti ti-loader" style={{ fontSize:15 }} aria-hidden="true" /> Uploading photos…
            </div>
          )}
        </div>

        <div className="sheet-actions">
          <button className="btn btn-primary" style={{ width:'100%' }} onClick={save} disabled={saving}>
            <i className="ti ti-upload" style={{ fontSize:15 }} aria-hidden="true" />
            {saving ? 'Uploading…' : 'Upload notes'}
          </button>
          <button className="btn" style={{ width:'100%' }} onClick={onClose}>
            <i className="ti ti-x" style={{ fontSize:15 }} aria-hidden="true" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

const selStyle = {
  fontSize:12, padding:'5px 8px', borderRadius:8,
  border:'0.5px solid var(--border2)', background:'var(--surface)', color:'var(--ink)',
  fontFamily:'inherit', WebkitAppearance:'none',
}
