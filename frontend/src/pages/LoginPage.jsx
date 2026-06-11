import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try { await login(form); navigate('/') }
    catch { setError('Wrong username or password') }
    finally { setLoading(false) }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-logo">📚</div>
      <div className="auth-title">SchoolTrack</div>
      <div className="auth-sub">Your child's school — organised</div>

      <form className="auth-card" onSubmit={handle}>
        <div className="field">
          <label>Username</label>
          <input
            autoComplete="username" autoFocus
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password" autoComplete="current-password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          />
        </div>
        {error && <p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p>}
        <button className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--ink2)' }}>
        New parent?{' '}
        <Link to="/register" style={{ color: 'var(--indigo)', fontWeight: 600 }}>Create account</Link>
      </p>
    </div>
  )
}
