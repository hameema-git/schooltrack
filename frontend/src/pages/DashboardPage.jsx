import { useState, useEffect, useCallback } from 'react'
import { updates as api } from "../api"
import { useAuth } from '../AuthContext'
import AddUpdateSheet from '../components/AddUpdateSheet'
import { Toast, useToast } from '../components/Toast'

const TYPE_META = {
  homework: { icon: '📝', label: 'Homework', bg: '#EEF2FF', fg: '#3730A3' },
  test:     { icon: '✏️', label: 'Test',     bg: '#FEF3C7', fg: '#92400E' },
  notice:   { icon: '📢', label: 'Notice',   bg: '#DCFCE7', fg: '#166534' },
  fee:      { icon: '💳', label: 'Fee',      bg: '#FEE2E2', fg: '#991B1B' },
  circular: { icon: '📄', label: 'PDF',      bg: '#EEEDFE', fg: '#534AB7' },
  event:    { icon: '📅', label: 'Event',    bg: '#CCFBF1', fg: '#0F766E' },
  material: { icon: '📦', label: 'Material', bg: '#FCE7F3', fg: '#9D174D' },
}

const TABS = [
  ['all','All'],['homework','📝 HW'],['test','✏️ Test'],
  ['notice','📢'],['fee','💳'],['event','📅'],
]

const GRADES = Array.from({ length: 12 }, (_, i) => String(i + 1))
const todayStr = () => new Date().toISOString().split('T')[0]
const daysUntil = d => d ? Math.ceil((new Date(d) - new Date(todayStr())) / 86400000) : 99

export default function DashboardPage() {
  const { user } = useAuth()
  const [items, setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]       = useState('all')
  const [grade, setGrade]   = useState(user?.grade || '4')
  const [div, setDiv]       = useState(user?.division || 'ALL')
  const [showAdd, setShowAdd] = useState(false)
  const { toast, show }     = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { grade }
      if (div !== 'ALL') params.division = div
      if (tab !== 'all') params.type = tab
      const r = await api.list(params)
      setItems(r.data)
    } finally { setLoading(false) }
  }, [grade, div, tab])

  useEffect(() => { load() }, [load])

  const toggleDone = async (id) => {
    const item = items.find(i => i.id === id)
    setItems(prev => prev.map(i => i.id === id ? { ...i, is_done: !i.is_done } : i))
    await api.toggleDone(id)
    show(item?.is_done ? 'Marked as pending' : '✓ Done!')
  }

  const deleteItem = async (id) => {
    setItems(prev => prev.filter(i => i.id !== id))
    await api.delete(id)
    show('Deleted')
  }

  const urgent  = items.filter(i => !i.is_done && daysUntil(i.due_date) <= 1)
  const pending = items.filter(i => !i.is_done)
  const done    = items.filter(i => i.is_done)

  return (
    <div className="page">

      {/* ── Header ── */}
      <div className="page-header">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div className="t-title">{getGreeting()}, {user?.first_name || 'there'} 👋</div>
            <div className="t-caption" style={{ marginTop: 2 }}>
              {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'short' })}
            </div>
          </div>
          <div className="row gap-4">
            <select value={grade} onChange={e => setGrade(e.target.value)} style={selStyle}>
              {GRADES.map(g => <option key={g} value={g}>Gr {g}</option>)}
            </select>
            <select value={div} onChange={e => setDiv(e.target.value)} style={selStyle}>
              <option value="ALL">All div</option>
              {['A','B','C','D'].map(d => <option key={d} value={d}>Div {d}</option>)}
            </select>
          </div>
        </div>

        {/* Type filter chips */}
        <div className="chip-row">
          {TABS.map(([k, l]) => (
            <button key={k} className={`chip${tab === k ? ' on' : ''}`}
              onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
      </div>

      {/* ── Urgent strip ── */}
      {urgent.length > 0 && (
        <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '.07em', color: 'var(--red)', padding: '8px 16px 2px' }}>
            ⚑ Needs attention
          </div>
          <div className="today-strip">
            {urgent.map(i => (
              <div key={i.id}
                className={`today-pill ${i.update_type === 'test' ? 'test' : 'urgent'}`}>
                {TYPE_META[i.update_type]?.icon} {i.title}
                {i.amount && <span style={{ opacity: .7 }}> · {i.amount}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, padding: '14px 16px 0' }}>
        {[
          ['Pending', pending.length, 'var(--indigo)'],
          ['Tests',   items.filter(i => !i.is_done && i.update_type === 'test').length, 'var(--amber)'],
          ['Done',    done.length, 'var(--green)'],
        ].map(([l, n, c]) => (
          <div key={l} className="card" style={{ textAlign: 'center', padding: '10px 8px' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: c, letterSpacing: '-.5px' }}>{n}</div>
            <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 1 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* ── Add update prompt bar ── */}
      <div style={{ padding: '12px 16px 0' }}>
        <button onClick={() => setShowAdd({ grade, division: div })} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '13px 16px', borderRadius: 'var(--r)',
          border: '1.5px dashed var(--border2)', background: 'var(--surface)',
          color: 'var(--ink2)', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <span style={{ fontSize: 20 }}>➕</span>
          <span>Add update — paste message or fill form…</span>
        </button>
      </div>

      {/* ── List ── */}
      <div style={{ padding: '12px 16px 0' }}>
        {loading ? (
          <div className="loading-wrap">Loading…</div>
        ) : (
          <>
            {pending.map(item => (
              <UpdateCard key={item.id} item={item} userId={user?.id}
                onToggle={toggleDone} onDelete={deleteItem} />
            ))}

            {done.length > 0 && <>
              <div className="sec-label">Done ({done.length})</div>
              {done.map(item => (
                <UpdateCard key={item.id} item={item} userId={user?.id}
                  onToggle={toggleDone} onDelete={deleteItem} />
              ))}
            </>}

            {items.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <div style={{ fontWeight: 600, color: 'var(--ink)' }}>All clear!</div>
                <div style={{ marginTop: 4, fontSize: 13 }}>
                  Nothing yet for Grade {grade}{div !== 'ALL' ? ` Div ${div}` : ''}.
                </div>
                <button className="btn btn-primary" style={{ marginTop: 16 }}
                  onClick={() => setShowAdd({ grade, division: div })}>
                  + Add first update
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── FAB ── */}
      <button className="fab" onClick={() => setShowAdd({ grade, division: div })}
        aria-label="Add update">+</button>

      {showAdd && (
        <AddUpdateSheet
          initialData={showAdd}
          onClose={() => setShowAdd(false)}
          onSaved={item => { setItems(prev => [item, ...prev]); setShowAdd(false); show('✓ Update added') }}
        />
      )}

      <Toast message={toast} />
    </div>
  )
}

function UpdateCard({ item, userId, onToggle, onDelete }) {
  const meta  = TYPE_META[item.update_type] || { icon:'📌', label:item.update_type, bg:'#f1efea', fg:'#444' }
  const days  = daysUntil(item.due_date)
  const urgent = !item.is_done && days <= 1

  return (
    <div className={`u-card${item.is_done ? ' done' : ''}${urgent ? ' urgent' : ''}`}>
      <div className={`check${item.is_done ? ' done' : ''}`} onClick={() => onToggle(item.id)}>
        {item.is_done && '✓'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row" style={{ marginBottom: 4 }}>
          <span style={{ fontWeight: 600, fontSize: 14, flex: 1, minWidth: 0,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.title}
          </span>
          <span className="badge" style={{ background: meta.bg, color: meta.fg, fontSize: 11 }}>
            {meta.icon} {meta.label}
          </span>
        </div>
        {item.description && (
          <p style={{ color: 'var(--ink2)', marginBottom: 5, fontSize: 13, lineHeight: 1.45 }}>
            {item.description}
          </p>
        )}
        <div className="row" style={{ gap: 10 }}>
          {item.due_date && (
            <span style={{ fontSize: 12, fontWeight: urgent ? 600 : 400,
              color: urgent ? 'var(--red)' : 'var(--ink3)' }}>
              {urgent ? '⚑ ' : '🗓 '}
              {days === 0 ? 'Due today' : days === 1 ? 'Due tomorrow' : `Due ${item.due_date}`}
            </span>
          )}
          {item.amount && (
            <span style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 500 }}>{item.amount}</span>
          )}
          {item.subject && item.subject !== 'general' && (
            <span style={{ fontSize: 12, color: 'var(--ink3)' }}>{item.subject}</span>
          )}
          {item.division !== 'ALL' && (
            <span style={{ fontSize: 12, color: 'var(--ink3)' }}>Div {item.division}</span>
          )}
          {item.attachment_url && (
            <a href={item.attachment_url} target="_blank" rel="noreferrer"
              style={{ fontSize: 12, color: 'var(--indigo)' }}>📎 File</a>
          )}
          {item.created_by === userId && (
            <button onClick={() => onDelete(item.id)}
              style={{ marginLeft: 'auto', border: 'none', background: 'none',
                fontSize: 16, color: 'var(--border2)', cursor: 'pointer', padding: '2px 4px' }}>
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const selStyle = {
  fontSize: 13, padding: '6px 28px 6px 10px', borderRadius: 8,
  border: '1px solid var(--border2)', background: 'var(--surface)',
  color: 'var(--ink)', fontFamily: 'inherit', WebkitAppearance: 'none',
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%235A5870' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
}
