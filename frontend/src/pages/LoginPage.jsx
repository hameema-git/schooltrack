import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export default function LoginPage() {
  const [form, setForm]   = useState({ username:'', password:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) { setError('Please enter username and password'); return }
    setLoading(true); setError('')
    try { await login(form); navigate('/') }
    catch { setError('Wrong username or password. Try again.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight:'100dvh', display:'flex', flexDirection:'column',
      justifyContent:'center', padding:'28px 24px', background:'var(--bg)',
    }}>
      <div style={{ textAlign:'center', marginBottom:28 }}>
        <div style={{ fontSize:48, marginBottom:8 }}>📚</div>
        <div style={{ fontSize:24, fontWeight:700, letterSpacing:'-.4px' }}>SchoolTrack</div>
        <div style={{ fontSize:14, color:'var(--ink2)', marginTop:4 }}>
          School updates — organised for parents
        </div>
      </div>

      <form onSubmit={handle} style={{
        background:'var(--surface)', borderRadius:20, padding:24,
        display:'flex', flexDirection:'column', gap:14,
        border:'0.5px solid var(--border)',
      }}>
        <div className="field">
          <label>Username</label>
          <input
            autoComplete="username" autoFocus
            value={form.username}
            placeholder="Your username"
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password" autoComplete="current-password"
            value={form.password}
            placeholder="Your password"
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          />
        </div>

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

        <button
          type="submit"
          disabled={loading}
          style={{
            padding:'13px', borderRadius:10, border:'none',
            background: loading ? '#A5B4FC' : '#3730A3', color:'#fff',
            fontSize:15, fontWeight:600, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily:'inherit', marginTop:4,
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          }}>
          {loading
            ? <><i className="ti ti-loader" style={{ fontSize:16 }} aria-hidden="true" /> Signing in…</>
            : <><i className="ti ti-login" style={{ fontSize:16 }} aria-hidden="true" /> Sign in</>
          }
        </button>
      </form>

      <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'var(--ink2)' }}>
        New parent?{' '}
        <Link to="/register" style={{ color:'#3730A3', fontWeight:600 }}>
          Create account →
        </Link>
      </p>
    </div>
  )
}
