import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const GRADES = Array.from({ length:12 }, (_,i) => String(i+1))

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    username:'', password:'', first_name:'', last_name:'',
    phone:'', child_name:'', grade:'4', division:'ALL', role:'parent'
  })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const set = (k,v) => setForm(f => ({ ...f, [k]:v }))

  const next = () => {
    if (!form.first_name.trim()) { setError('Please enter your name'); return }
    if (!form.username.trim())   { setError('Please choose a username'); return }
    if (form.password.length < 6){ setError('Password must be at least 6 characters'); return }
    setError(''); setStep(2)
  }

  const back = () => { setError(''); setStep(1) }

  const submit = async () => {
    setLoading(true); setError('')
    try { await register(form); navigate('/') }
    catch (err) {
      const d = err.response?.data
      setError(d ? Object.values(d).flat().join(' ') : 'Registration failed. Try a different username.')
    }
    finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight:'100dvh', display:'flex', flexDirection:'column',
      justifyContent:'center', padding:'24px', background:'var(--bg)',
    }}>
      {/* Back to login */}
      <div style={{ marginBottom:16 }}>
        <Link to="/login" style={{
          display:'inline-flex', alignItems:'center', gap:5,
          color:'var(--ink2)', textDecoration:'none', fontSize:14,
        }}>
          <i className="ti ti-arrow-left" style={{ fontSize:16 }} aria-hidden="true" />
          Back to sign in
        </Link>
      </div>

      <div style={{ textAlign:'center', marginBottom:20 }}>
        <div style={{ fontSize:36, marginBottom:6 }}>📚</div>
        <div style={{ fontSize:20, fontWeight:700 }}>Create account</div>
        <div style={{ fontSize:13, color:'var(--ink2)', marginTop:4 }}>
          Step {step} of 2 — {step===1 ? 'Your details' : 'Your child\'s class'}
        </div>
        {/* Progress bar */}
        <div style={{ display:'flex', gap:5, justifyContent:'center', marginTop:12 }}>
          {[1,2].map(s => (
            <div key={s} style={{
              height:4, borderRadius:4,
              width: s===step ? 32 : 12,
              background: s<=step ? '#3730A3' : 'var(--border2)',
              transition:'width .2s',
            }} />
          ))}
        </div>
      </div>

      <div style={{
        background:'var(--surface)', borderRadius:20, padding:24,
        display:'flex', flexDirection:'column', gap:14,
        border:'0.5px solid var(--border)',
      }}>
        {step === 1 && <>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="field">
              <label>First name</label>
              <input value={form.first_name} onChange={e=>set('first_name',e.target.value)} autoFocus placeholder="Priya" />
            </div>
            <div className="field">
              <label>Last name</label>
              <input value={form.last_name} onChange={e=>set('last_name',e.target.value)} placeholder="Nair" />
            </div>
          </div>
          <div className="field">
            <label>Username <span style={{ color:'var(--red)', fontWeight:400 }}>*</span></label>
            <input value={form.username} onChange={e=>set('username',e.target.value)} autoComplete="username" placeholder="priya_nair" />
          </div>
          <div className="field">
            <label>Password <span style={{ color:'var(--red)', fontWeight:400 }}>*</span></label>
            <input type="password" value={form.password} onChange={e=>set('password',e.target.value)} autoComplete="new-password" placeholder="Min 6 characters" />
          </div>
          <div className="field">
            <label>Phone (optional)</label>
            <input type="tel" value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="98765 43210" />
          </div>
        </>}

        {step === 2 && <>
          <div className="field">
            <label>Child's name</label>
            <input value={form.child_name} onChange={e=>set('child_name',e.target.value)} autoFocus placeholder="e.g. Aarav" />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="field">
              <label>Grade</label>
              <select value={form.grade} onChange={e=>set('grade',e.target.value)}>
                {GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Division</label>
              <select value={form.division} onChange={e=>set('division',e.target.value)}>
                <option value="ALL">Not sure</option>
                {['A','B','C','D'].map(d => <option key={d} value={d}>Div {d}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label>I am a</label>
            <select value={form.role} onChange={e=>set('role',e.target.value)}>
              <option value="parent">Parent</option>
              <option value="class_rep">Class Representative</option>
            </select>
          </div>
          <div style={{
            background:'#EEF2FF', borderRadius:8, padding:'10px 12px',
            fontSize:13, color:'#3730A3', lineHeight:1.5,
          }}>
            <strong>Class Rep</strong> can add updates for the class.
            Regular <strong>Parent</strong> can view, mark done, and upload notes.
          </div>
        </>}

        {error && (
          <div style={{
            background:'#FEF2F2', border:'0.5px solid #FECACA',
            borderRadius:8, padding:'9px 12px', fontSize:13, color:'#991B1B',
            display:'flex', alignItems:'center', gap:6,
          }}>
            <i className="ti ti-alert-circle" style={{ fontSize:15, flexShrink:0 }} aria-hidden="true" />
            {error}
          </div>
        )}

        <div style={{ display:'flex', gap:10, marginTop:4 }}>
          {step === 2 && (
            <button onClick={back} style={{
              flex:1, padding:'12px', borderRadius:10,
              border:'1px solid var(--border2)', background:'none',
              color:'var(--ink)', cursor:'pointer', fontFamily:'inherit',
              fontSize:14, fontWeight:500,
              display:'flex', alignItems:'center', justifyContent:'center', gap:6,
            }}>
              <i className="ti ti-arrow-left" style={{ fontSize:15 }} aria-hidden="true" />
              Back
            </button>
          )}
          {step === 1
            ? <button onClick={next} style={{
                flex:1, padding:'12px', borderRadius:10, border:'none',
                background:'#3730A3', color:'#fff', cursor:'pointer',
                fontFamily:'inherit', fontSize:14, fontWeight:600,
                display:'flex', alignItems:'center', justifyContent:'center', gap:6,
              }}>
                Next <i className="ti ti-arrow-right" style={{ fontSize:15 }} aria-hidden="true" />
              </button>
            : <button onClick={submit} disabled={loading} style={{
                flex:2, padding:'12px', borderRadius:10, border:'none',
                background: loading ? '#A5B4FC' : '#3730A3', color:'#fff',
                cursor: loading?'not-allowed':'pointer',
                fontFamily:'inherit', fontSize:14, fontWeight:600,
                display:'flex', alignItems:'center', justifyContent:'center', gap:6,
              }}>
                {loading
                  ? <><i className="ti ti-loader" style={{ fontSize:15 }} aria-hidden="true" /> Creating…</>
                  : <><i className="ti ti-check" style={{ fontSize:15 }} aria-hidden="true" /> Create account</>
                }
              </button>
          }
        </div>
      </div>
    </div>
  )
}
