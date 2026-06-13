import { useState, useEffect, useCallback } from 'react'
import { updates as api } from '../api'
import { useAuth } from '../AuthContext'
import AddUpdateSheet from '../components/AddUpdateSheet'
import WAPasteSheet from '../components/WAPasteSheet'
import { Toast, useToast } from '../components/Toast'

const TYPE_META = {
  homework: { label:'Homework',  badge:'badge-hw',       dot:'#3B6D11', icon:'📝' },
  test:     { label:'Test',      badge:'badge-test',     dot:'#992400', icon:'✏️' },
  fee:      { label:'Fee',       badge:'badge-fee',      dot:'#854F0B', icon:'💳' },
  notice:   { label:'Notice',    badge:'badge-notice',   dot:'#185FA5', icon:'📢' },
  event:    { label:'Event',     badge:'badge-event',    dot:'#0F6E56', icon:'📅' },
  material: { label:'Material',  badge:'badge-material', dot:'#9D174D', icon:'📦' },
  circular: { label:'Circular',  badge:'badge-circular', dot:'#534AB7', icon:'📄' },
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const GRADES = Array.from({ length: 12 }, (_, i) => String(i + 1))

function dateKey(d) { return d.toISOString().split('T')[0] }
function parseLocalDate(s) { const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d) }
function daysUntil(s) { return Math.ceil((parseLocalDate(s) - new Date(new Date().toDateString())) / 86400000) }

export default function DashboardPage() {
  const { user } = useAuth()
  const today = new Date()
  const [curYear, setCurYear]   = useState(today.getFullYear())
  const [curMonth, setCurMonth] = useState(today.getMonth())
  const [selDate, setSelDate]   = useState(new Date(today))
  const [items, setItems]       = useState([])
  const [doneSet, setDoneSet]   = useState(new Set())
  const [typeFilter, setTypeFilter] = useState('all')
  const [grade, setGrade]       = useState(user?.grade || '4')
  const [div, setDiv]           = useState(user?.division || 'ALL')
  const [showAdd, setShowAdd]   = useState(false)
  const [showPaste, setShowPaste] = useState(false)
  const [loading, setLoading]   = useState(true)
  const { toast, show }         = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.list({ grade, division: div !== 'ALL' ? div : undefined })
      setItems(r.data)
    } finally { setLoading(false) }
  }, [grade, div])

  useEffect(() => { load() }, [load])

  const toggleDone = async (id) => {
    setDoneSet(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    await api.toggleDone(id)
  }

  const changeMonth = (d) => {
    let m = curMonth + d, y = curYear
    if (m > 11) { m = 0; y++ }
    if (m < 0)  { m = 11; y-- }
    setCurMonth(m); setCurYear(y)
  }

  const itemsForDate  = (ds) => items.filter(i => i.due_date === ds)
  const itemsForMonth = (y, m) => {
    const prefix = `${y}-${String(m+1).padStart(2,'0')}`
    return items.filter(i => i.due_date?.startsWith(prefix))
  }

  const ds       = dateKey(selDate)
  const dayItems = itemsForDate(ds)
  const filtered = typeFilter === 'all' ? dayItems : dayItems.filter(i => i.update_type === typeFilter)
  const pending  = filtered.filter(i => !doneSet.has(i.id) && !i.is_done)
  const done     = filtered.filter(i => doneSet.has(i.id) || i.is_done)
  const urgentToday = dayItems.filter(i => !doneSet.has(i.id) && !i.is_done && daysUntil(i.due_date) <= 0)
  const isToday  = ds === dateKey(today)
  const dow      = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][selDate.getDay()]

  const renderCalendar = () => {
    const first      = new Date(curYear, curMonth, 1).getDay()
    const daysInMonth= new Date(curYear, curMonth+1, 0).getDate()
    const daysInPrev = new Date(curYear, curMonth, 0).getDate()
    const rem        = (7 - (first + daysInMonth) % 7) % 7

    const cells = []
    DAYS_SHORT.forEach(d => cells.push(
      <div key={`h${d}`} style={{ textAlign:'center', fontSize:11, color:'var(--ink3)', padding:'4px 0', fontWeight:500 }}>{d}</div>
    ))

    for (let i=0; i<first; i++) {
      const d = daysInPrev - first + 1 + i
      cells.push(<div key={`p${i}`} style={{ aspectRatio:1, opacity:.3, display:'flex', flexDirection:'column', alignItems:'center', paddingTop:5 }}>
        <span style={{ fontSize:13 }}>{d}</span>
      </div>)
    }

    for (let d=1; d<=daysInMonth; d++) {
      const ds2 = `${curYear}-${String(curMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
      const di  = items.filter(i => i.due_date === ds2)
      const types = [...new Set(di.map(i => i.update_type))].slice(0,3)
      const isT = d===today.getDate() && curMonth===today.getMonth() && curYear===today.getFullYear()
      const isS = d===selDate.getDate() && curMonth===selDate.getMonth() && curYear===selDate.getFullYear()

      cells.push(
        <div key={`d${d}`}
          onClick={() => setSelDate(new Date(curYear, curMonth, d))}
          style={{
            aspectRatio:1, display:'flex', flexDirection:'column', alignItems:'center',
            paddingTop:5, borderRadius:10, cursor:'pointer',
            background: isS ? '#EEF2FF' : 'transparent',
          }}>
          <div style={{
            fontSize:13, lineHeight:1, fontWeight: isT||isS ? 600 : 400,
            width:24, height:24, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
            background: isT ? '#3730A3' : 'transparent',
            color: isT ? '#fff' : isS ? '#3730A3' : 'var(--ink)',
          }}>{d}</div>
          <div style={{ display:'flex', gap:2, marginTop:2, flexWrap:'wrap', justifyContent:'center', maxWidth:26 }}>
            {types.map(t => (
              <div key={t} style={{ width:5, height:5, borderRadius:'50%', background: TYPE_META[t]?.dot || '#888', flexShrink:0 }} />
            ))}
          </div>
        </div>
      )
    }

    for (let d=1; d<=rem; d++) {
      cells.push(<div key={`n${d}`} style={{ aspectRatio:1, opacity:.3, display:'flex', flexDirection:'column', alignItems:'center', paddingTop:5 }}>
        <span style={{ fontSize:13 }}>{d}</span>
      </div>)
    }
    return cells
  }

  return (
    <div className="page">
      <div className="page-header" style={{ padding:'12px 16px 8px' }}>
        <div className="row" style={{ justifyContent:'space-between', marginBottom:10 }}>
          <div className="row" style={{ gap:8 }}>
            <button onClick={() => changeMonth(-1)} style={navBtnStyle}><i className="ti ti-chevron-left" /></button>
            <span style={{ fontSize:15, fontWeight:500, minWidth:130, textAlign:'center' }}>
              {MONTHS[curMonth]} {curYear}
            </span>
            <button onClick={() => changeMonth(1)} style={navBtnStyle}><i className="ti ti-chevron-right" /></button>
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

        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
          {renderCalendar()}
        </div>
      </div>

      <div style={{ background:'#3730A3', color:'#fff', borderRadius:'var(--r)', margin:'12px 16px 0', padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:16, fontWeight:600 }}>{dow}, {selDate.getDate()} {MONTHS[selDate.getMonth()]}</div>
          <div style={{ fontSize:12, opacity:.8, marginTop:2 }}>
            {isToday ? 'Today' : selDate > today ? 'Upcoming' : 'Past'} · {dayItems.length} update{dayItems.length!==1?'s':''} for this day
          </div>
        </div>
        {isToday && <span style={{ fontSize:11, background:'rgba(255,255,255,.2)', padding:'4px 10px', borderRadius:20 }}>Today</span>}
      </div>

      {urgentToday.length > 0 && (
        <div style={{ margin:'10px 16px 0', background:'#FEE2E2', border:'0.5px solid rgba(162,28,28,.15)', borderRadius:'var(--r)', padding:'10px 14px' }}>
          <div style={{ fontSize:11, fontWeight:600, color:'#991B1B', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:6 }}>
            ⚑ Due today
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {urgentToday.map(i => (
              <div key={i.id} style={{ fontSize:12, padding:'4px 10px', background:'#fff', borderRadius:20, border:'0.5px solid rgba(162,28,28,.2)', color:'#991B1B', fontWeight:500 }}>
                {i.title.length > 28 ? i.title.slice(0,28)+'…' : i.title}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding:'10px 16px 0' }}>
        <button onClick={() => setShowPaste(true)} style={{
          width:'100%', display:'flex', alignItems:'center', gap:10,
          padding:'11px 14px', borderRadius:'var(--r)',
          border:'1.5px dashed var(--border2)', background:'var(--surface)',
          color:'var(--ink2)', fontSize:13, cursor:'pointer', fontFamily:'inherit',
        }}>
          <span style={{ fontSize:18 }}>💬</span>
          <span>Paste a WhatsApp message to add update…</span>
          <span style={{ marginLeft:'auto', background:'var(--indigo-l)', color:'var(--indigo)', fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:20 }}>Auto</span>
        </button>
      </div>

      <div style={{ display:'flex', gap:6, overflowX:'auto', padding:'10px 16px 0', scrollbarWidth:'none' }}>
        {['all','homework','test','fee','notice','event','material'].map(t => (
          <button key={t}
            className={`chip${typeFilter===t?' on':''}`}
            onClick={() => setTypeFilter(t)}>
            {t==='all' ? 'All' : TYPE_META[t]?.icon+' '+TYPE_META[t]?.label}
          </button>
        ))}
      </div>

      <div style={{ padding:'10px 16px 0' }}>
        {loading ? (
          <div className="loading-wrap">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div style={{ fontWeight:600, color:'var(--ink)' }}>Nothing for this day</div>
            <div style={{ fontSize:13, marginTop:4 }}>Tap + to add an update for {selDate.getDate()} {MONTHS[selDate.getMonth()]}</div>
          </div>
        ) : (
          <>
            {pending.length > 0 && (
              <>
                <div className="sec-label">{pending.length} pending</div>
                {pending.map(item => <TaskCard key={item.id} item={item} done={false} onToggle={() => toggleDone(item.id)} userId={user?.id} onDelete={async(id)=>{ setItems(p=>p.filter(i=>i.id!==id)); await api.delete(id); show('Deleted') }} />)}
              </>
            )}
            {done.length > 0 && (
              <>
                <div className="sec-label" style={{ marginTop:12 }}>Done ({done.length})</div>
                {done.map(item => <TaskCard key={item.id} item={item} done={true} onToggle={() => toggleDone(item.id)} userId={user?.id} onDelete={async(id)=>{ setItems(p=>p.filter(i=>i.id!==id)); await api.delete(id); show('Deleted') }} />)}
              </>
            )}
          </>
        )}
      </div>

      <div style={{ padding:'16px 16px 0' }}>
        <div className="sec-label">Dot legend</div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:6 }}>
          {Object.entries(TYPE_META).map(([k,v]) => (
            <div key={k} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--ink2)' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:v.dot, flexShrink:0 }} />
              {v.label}
            </div>
          ))}
        </div>
      </div>

      <button className="fab" onClick={() => setShowAdd({ grade, division:div })} aria-label="Add update">+</button>

      {showPaste && <WAPasteSheet onClose={() => setShowPaste(false)} onParsed={(data) => { setShowPaste(false); setShowAdd({ grade, division:div, prefill:data }) }} />}
      {showAdd && (
        <AddUpdateSheet
          initialData={showAdd}
          onClose={() => setShowAdd(false)}
          onSaved={(item) => { setItems(prev=>[item,...prev]); setShowAdd(false); show('✓ Update added') }}
        />
      )}
      <Toast message={toast} />
    </div>
  )
}

function TaskCard({ item, done, onToggle, onDelete, userId }) {
  const meta = TYPE_META[item.update_type] || { label:item.update_type, badge:'badge-notice', icon:'📌' }
  const du   = daysUntil(item.due_date)
  const urgent = !done && du <= 0

  return (
    <div style={{
      background:'var(--surface)', border:`1px solid ${urgent?'#F09595':'var(--border)'}`,
      borderLeft: urgent ? '3px solid #E24B4A' : undefined,
      borderRadius: urgent ? '0 var(--r) var(--r) 0' : 'var(--r)',
      padding:'12px 14px', marginBottom:8,
      display:'flex', gap:10, alignItems:'flex-start',
      opacity: done ? .5 : 1,
    }}>
      <div onClick={onToggle} style={{
        width:20, height:20, borderRadius:'50%', flexShrink:0, marginTop:2,
        border: done ? 'none' : '1.5px solid var(--border2)',
        background: done ? '#166534' : 'transparent',
        display:'flex', alignItems:'center', justifyContent:'center',
        color:'#fff', fontSize:11, cursor:'pointer',
      }}>{done && '✓'}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, fontWeight:600, marginBottom:4, textDecoration: done?'line-through':'none', color: done?'var(--ink3)':'var(--ink)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {item.title}
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
          <span className={`badge ${meta.badge}`} style={{ fontSize:10 }}>{meta.icon} {meta.label}</span>
          {item.subject && item.subject!=='general' && <span style={{ fontSize:12, color:'var(--ink3)' }}>{item.subject}</span>}
          {item.amount && <span style={{ fontSize:12, color:'#854F0B', fontWeight:500 }}>{item.amount}</span>}
          {urgent && <span style={{ fontSize:12, color:'#991B1B', fontWeight:600 }}>Due today</span>}
          {item.created_by === userId && (
            <button onClick={() => onDelete(item.id)} style={{ marginLeft:'auto', border:'none', background:'none', color:'var(--border2)', cursor:'pointer', fontSize:14 }}>✕</button>
          )}
        </div>
      </div>
    </div>
  )
}

const navBtnStyle = {
  background:'none', border:'0.5px solid var(--border2)', borderRadius:'var(--r-sm)',
  width:30, height:30, cursor:'pointer', color:'var(--ink2)', fontSize:15,
  display:'flex', alignItems:'center', justifyContent:'center',
}
const selStyle = {
  fontSize:12, padding:'5px 8px', borderRadius:8,
  border:'0.5px solid var(--border2)', background:'var(--surface)', color:'var(--ink)',
  fontFamily:'inherit', WebkitAppearance:'none',
}
