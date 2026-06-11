import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const GRADES = Array.from({ length: 12 }, (_, i) => String(i + 1))
const DIVS = [['ALL', 'Not sure / All'], ['A', 'Division A'], ['B', 'Division B'], ['C', 'Division C'], ['D', 'Division D']]

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    username: '', password: '', first_name: '', last_name: '',
    email: '', phone: '', child_name: '', grade: '4', division: 'ALL', role: 'parent'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const next = () => {
    if (step === 1 && (!form.username || !form.password)) { setError('Fill username and password'); return }
    setError(''); setStep(s => s + 1)
  }

  const handle = async () => {
    setLoading(true); setError('')
    try { await register(form); navigate('/') }
    catch (err) {
      const d = err.response?.data
      setError(d ? Object.values(d).flat().join(' ') : 'Registration failed')
    }
    finally { setLoading(false) }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-logo">📚</div>
      <div className="auth-title">Create account</div>
      <div className="auth-sub" style={{ marginBottom: 24 }}>
        Step {step} of 2 — {step === 1 ? 'Your login details' : 'Your child\'s class'}
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
        {[1, 2].map(s => (
          <div key={s} style={{
            width: s === step ? 28 : 8, height: 8, borderRadius: 4,
            background: s <= step ? 'var(--indigo)' : 'var(--border2)',
            transition: 'width .2s'
          }} />
        ))}
      </div>

      <div className="auth-card">
        {step === 1 && <>
          <div className="form-grid">
            <div className="field"><label>First name</label>
              <input value={form.first_name} onChange={e => set('first_name', e.target.value)} autoFocus />
            </div>
            <div className="field"><label>Last name</label>
              <input value={form.last_name} onChange={e => set('last_name', e.target.value)} />
            </div>
          </div>
          <div className="field"><label>Username</label>
            <input autoComplete="username" value={form.username} onChange={e => set('username', e.target.value)} />
          </div>
          <div className="field"><label>Password</label>
            <input type="password" autoComplete="new-password" value={form.password} onChange={e => set('password', e.target.value)} />
          </div>
          <div className="field"><label>Phone (optional)</label>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
        </>}

        {step === 2 && <>
          <div className="field"><label>Child's name</label>
            <input value={form.child_name} onChange={e => set('child_name', e.target.value)} autoFocus placeholder="e.g. Aarav" />
          </div>
          <div className="form-grid">
            <div className="field"><label>Grade</label>
              <select value={form.grade} onChange={e => set('grade', e.target.value)}>
                {GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
              </select>
            </div>
            <div className="field"><label>Division</label>
              <select value={form.division} onChange={e => set('division', e.target.value)}>
                {DIVS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="field"><label>I am a</label>
            <select value={form.role} onChange={e => set('role', e.target.value)}>
              <option value="parent">Parent</option>
              <option value="class_rep">Class Representative</option>
            </select>
          </div>
          <p style={{ fontSize: 12, color: 'var(--ink3)', lineHeight: 1.5 }}>
            Class Reps can add updates for the whole class. Parents can view, mark done, and upload notes.
          </p>
        </>}

        {error && <p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10 }}>
          {step > 1 && (
            <button className="btn" style={{ flex: 1 }} onClick={() => setStep(s => s - 1)}>Back</button>
          )}
          {step < 2
            ? <button className="btn btn-primary" style={{ flex: 1 }} onClick={next}>Next →</button>
            : <button className="btn btn-primary" style={{ flex: 1 }} onClick={handle} disabled={loading}>
              {loading ? 'Creating…' : 'Done ✓'}
            </button>
          }
        </div>
      </div>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--ink2)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--indigo)', fontWeight: 600 }}>Sign in</Link>
      </p>
    </div>
  )
}
