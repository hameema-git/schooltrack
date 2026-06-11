import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { Toast, useToast } from '../components/Toast'
import api from '../api'

const ROLE_LABEL = { parent: 'Parent', class_rep: 'Class Representative', teacher: 'Teacher', admin: 'Admin' }

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { toast, show } = useToast()
  const [showInstall, setShowInstall] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="t-title">Profile</div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* User card */}
        <div className="card" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'var(--indigo)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700, flexShrink: 0,
          }}>
            {(user?.first_name?.[0] || user?.username?.[0] || '?').toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink3)', marginTop: 2 }}>
              {ROLE_LABEL[user?.role] || user?.role}
              {user?.grade && ` · Grade ${user.grade}${user.division !== 'ALL' ? ` Div ${user.division}` : ''}`}
            </div>
            {user?.child_name && (
              <div style={{ fontSize: 13, color: 'var(--ink2)', marginTop: 2 }}>
                👦 {user.child_name}
              </div>
            )}
          </div>
        </div>

        {/* Install as app */}
        <div className="card" style={{ marginBottom: 12, background: 'var(--indigo-l)', border: '1px solid rgba(99,102,241,.2)' }}>
          <div style={{ fontWeight: 600, color: 'var(--indigo)', marginBottom: 6 }}>
            📱 Install as app on your phone
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.6, marginBottom: 10 }}>
            Add SchoolTrack to your home screen for quick one-tap access — works offline too.
          </div>
          <button className="btn btn-pill"
            style={{ background: 'var(--indigo)', color: '#fff', borderColor: 'var(--indigo)', fontSize: 13 }}
            onClick={() => setShowInstall(true)}>
            How to install
          </button>
        </div>

        {/* How to use */}
        <div className="sec-label">How to use</div>
        <div className="card" style={{ marginBottom: 12 }}>
          {[
            ['💬', 'Paste WhatsApp message', 'On the home screen, tap the WhatsApp bar. Paste any teacher message — Claude reads it and fills in all details automatically.'],
            ['✓', 'Mark tasks done', 'Tap the circle on any update to mark it done. It moves to the Done section.'],
            ['📒', 'Class notes', 'Go to the Notes tab. If your child missed a class, search by date and subject. Another parent may have uploaded notes.'],
            ['📤', 'Upload notes', 'Take photos of your child\'s notebook pages and upload on the Notes tab. Claude auto-summarises what was covered.'],
            ['⚑', 'Urgent strip', 'The red strip at the top of Home shows tasks due today or tomorrow — nothing gets missed.'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}
              className="help-row">
              <div style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>{icon}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
                <div style={{ fontSize: 13, color: 'var(--ink2)', marginTop: 3, lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
          <style>{`.help-row:last-child { border-bottom: none; }`}</style>
        </div>

        {/* Roles info */}
        <div className="sec-label">Roles</div>
        <div className="card" style={{ marginBottom: 12, fontSize: 13, color: 'var(--ink2)', lineHeight: 1.7 }}>
          <b style={{ color: 'var(--ink)' }}>Parent</b> — View updates, mark done, upload notes.<br />
          <b style={{ color: 'var(--ink)' }}>Class Rep</b> — All of the above + add updates for the whole class.<br />
          <b style={{ color: 'var(--ink)' }}>Admin/Teacher</b> — Full access. Set via Django admin panel.
        </div>

        {/* Logout */}
        <button className="btn" style={{ width: '100%', color: 'var(--red)', marginBottom: 16 }} onClick={handleLogout}>
          Sign out
        </button>
      </div>

      {/* Install instructions sheet */}
      {showInstall && (
        <div className="sheet-bg" onClick={e => e.target === e.currentTarget && setShowInstall(false)}>
          <div className="sheet">
            <div className="sheet-handle" />
            <div className="sheet-header">
              <span className="t-head">📱 Install on your phone</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowInstall(false)} style={{ fontSize: 20 }}>✕</button>
            </div>
            <div className="sheet-body">
              <div style={{ fontWeight: 600, marginBottom: 8 }}>On Android (Chrome)</div>
              <div style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}>
                1. Open SchoolTrack in Chrome<br />
                2. Tap the ⋮ menu (top right)<br />
                3. Tap <b>"Add to Home screen"</b><br />
                4. Tap Add — done!
              </div>
              <div style={{ fontWeight: 600, marginTop: 16, marginBottom: 8 }}>On iPhone (Safari)</div>
              <div style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}>
                1. Open SchoolTrack in Safari<br />
                2. Tap the Share button (□ with arrow)<br />
                3. Scroll and tap <b>"Add to Home Screen"</b><br />
                4. Tap Add — done!
              </div>
              <div style={{ marginTop: 14, padding: '10px 12px', background: 'var(--surface2)', borderRadius: 'var(--r-sm)', fontSize: 13, color: 'var(--ink2)' }}>
                Once installed, SchoolTrack opens full-screen like a native app and works even with slow internet.
              </div>
            </div>
            <div className="sheet-actions">
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowInstall(false)}>Got it</button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast} />
    </div>
  )
}
