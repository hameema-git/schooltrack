import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { Toast, useToast } from '../components/Toast'

const ROLE_LABEL = {
  parent:'Parent', class_rep:'Class Representative',
  teacher:'Teacher', admin:'Admin'
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { toast, show } = useToast()
  const [showInstall, setShowInstall] = useState(false)

  const handleLogout = async () => {
    if (window.confirm('Sign out of SchoolTrack?')) {
      await logout()
      navigate('/login')
    }
  }

  return (
    <div className="page">
      <div style={{ padding:'16px 16px 0' }}>

        {/* User card */}
        <div className="card" style={{ marginBottom:12, display:'flex', alignItems:'center', gap:14 }}>
          <div style={{
            width:54, height:54, borderRadius:'50%', background:'#3730A3', color:'#fff',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:22, fontWeight:700, flexShrink:0,
          }}>
            {(user?.first_name?.[0] || user?.username?.[0] || '?').toUpperCase()}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:600, fontSize:16 }}>
              {user?.first_name ? `${user.first_name} ${user.last_name||''}`.trim() : user?.username}
            </div>
            <div style={{ fontSize:13, color:'var(--ink3)', marginTop:2 }}>
              {ROLE_LABEL[user?.role] || user?.role}
            </div>
            {user?.grade && (
              <div style={{ fontSize:13, color:'var(--ink2)', marginTop:2 }}>
                Grade {user.grade}{user.division !== 'ALL' ? ` · Div ${user.division}` : ''}
                {user.child_name ? ` · ${user.child_name}` : ''}
              </div>
            )}
          </div>
        </div>

        {/* Install as app */}
        <div className="card" style={{ marginBottom:12, background:'#EEF2FF', border:'1px solid rgba(99,102,241,.2)' }}>
          <div style={{ fontWeight:600, color:'#3730A3', marginBottom:5, display:'flex', alignItems:'center', gap:6 }}>
            <i className="ti ti-device-mobile" style={{ fontSize:16 }} aria-hidden="true" />
            Install on your phone
          </div>
          <div style={{ fontSize:13, color:'var(--ink2)', lineHeight:1.6, marginBottom:10 }}>
            Add SchoolTrack to your home screen — opens like a native app, works on slow internet too.
          </div>
          <button className="btn btn-pill"
            style={{ background:'#3730A3', color:'#fff', borderColor:'#3730A3', fontSize:13 }}
            onClick={() => setShowInstall(true)}>
            <i className="ti ti-info-circle" style={{ fontSize:14 }} aria-hidden="true" />
            How to install
          </button>
        </div>

        {/* How to use */}
        <div className="sec-label">How to use</div>
        <div className="card" style={{ marginBottom:12, padding:0 }}>
          {[
            ['ti-calendar',      'Tap a date on the calendar',  'See all homework, tests and notices for that day. Coloured dots on dates show what\'s pending.'],
            ['ti-circle-check',  'Mark tasks done',             'Tap the circle next to any task. It moves to the Done section so you know what\'s handled.'],
            ['ti-brand-whatsapp','Paste WhatsApp message',      'Tap the paste bar on Home. Paste any teacher message — the app reads it and fills in all details.'],
            ['ti-notebook',      'Class notes',                 'Go to Notes tab. Filter by date and subject to find notes uploaded by other parents for days your child missed.'],
            ['ti-upload',        'Upload notes',                'Tap the upload button on the Notes tab. Take photos of notebook pages to help other parents.'],
            ['ti-alert-triangle','Red strip = urgent',          'Anything due today or tomorrow shows in the red strip at the top. Check this first every morning.'],
          ].map(([icon, title, desc], i, arr) => (
            <div key={title} style={{
              display:'flex', gap:12, padding:'12px 16px',
              borderBottom: i < arr.length-1 ? '0.5px solid var(--border)' : 'none',
            }}>
              <div style={{
                width:34, height:34, borderRadius:8, background:'#EEF2FF',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
              }}>
                <i className={`ti ${icon}`} style={{ fontSize:17, color:'#3730A3' }} aria-hidden="true" />
              </div>
              <div>
                <div style={{ fontWeight:600, fontSize:14, marginBottom:2 }}>{title}</div>
                <div style={{ fontSize:13, color:'var(--ink2)', lineHeight:1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Roles */}
        <div className="sec-label">Roles explained</div>
        <div className="card" style={{ marginBottom:12, fontSize:13, color:'var(--ink2)', lineHeight:1.8 }}>
          <div style={{ display:'flex', gap:8, marginBottom:6 }}>
            <span style={{ background:'#EEF2FF', color:'#3730A3', borderRadius:6, padding:'2px 8px', fontSize:12, fontWeight:600, flexShrink:0 }}>Parent</span>
            <span>View updates, mark done, upload notes</span>
          </div>
          <div style={{ display:'flex', gap:8, marginBottom:6 }}>
            <span style={{ background:'#DCFCE7', color:'#166534', borderRadius:6, padding:'2px 8px', fontSize:12, fontWeight:600, flexShrink:0 }}>Class Rep</span>
            <span>All above + add updates for the class</span>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <span style={{ background:'#FEF3C7', color:'#92400E', borderRadius:6, padding:'2px 8px', fontSize:12, fontWeight:600, flexShrink:0 }}>Teacher</span>
            <span>Full access, add for any grade</span>
          </div>
        </div>

        {/* Sign out button — big and clear */}
        <button
          onClick={handleLogout}
          style={{
            width:'100%', padding:'13px', marginBottom:16,
            borderRadius:'var(--r)', border:'1.5px solid #FCA5A5',
            background:'#FEF2F2', color:'#991B1B',
            cursor:'pointer', fontFamily:'inherit', fontSize:15, fontWeight:600,
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          }}>
          <i className="ti ti-logout" style={{ fontSize:18 }} aria-hidden="true" />
          Sign out
        </button>

        <div style={{ textAlign:'center', fontSize:12, color:'var(--ink3)', marginBottom:24, paddingBottom:8 }}>
          SchoolTrack · Built for CBSE parents
        </div>
      </div>

      {/* Install sheet */}
      {showInstall && (
        <div className="sheet-bg" onClick={e => e.target === e.currentTarget && setShowInstall(false)}>
          <div className="sheet">
            <div className="sheet-handle" />
            <div className="sheet-header">
              <span className="t-head">
                <i className="ti ti-device-mobile" style={{ fontSize:16, marginRight:6 }} aria-hidden="true" />
                Install on your phone
              </span>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowInstall(false)} style={{ fontSize:20 }}>✕</button>
            </div>
            <div className="sheet-body">
              <div style={{ background:'#EEF2FF', borderRadius:'var(--r-sm)', padding:'12px 14px', marginBottom:14 }}>
                <div style={{ fontWeight:600, color:'#3730A3', marginBottom:8, fontSize:14 }}>
                  <i className="ti ti-brand-android" style={{ fontSize:15, marginRight:5 }} aria-hidden="true" />
                  Android (Chrome)
                </div>
                <div style={{ fontSize:14, color:'var(--ink2)', lineHeight:1.9 }}>
                  1. Open the app in Chrome<br/>
                  2. Tap ⋮ menu (top right)<br/>
                  3. Tap <strong>"Add to Home screen"</strong><br/>
                  4. Tap Add — done!
                </div>
              </div>
              <div style={{ background:'#F9F9F9', border:'0.5px solid var(--border)', borderRadius:'var(--r-sm)', padding:'12px 14px' }}>
                <div style={{ fontWeight:600, color:'var(--ink)', marginBottom:8, fontSize:14 }}>
                  <i className="ti ti-brand-apple" style={{ fontSize:15, marginRight:5 }} aria-hidden="true" />
                  iPhone (Safari)
                </div>
                <div style={{ fontSize:14, color:'var(--ink2)', lineHeight:1.9 }}>
                  1. Open in Safari (not Chrome)<br/>
                  2. Tap the Share button (□↑)<br/>
                  3. Scroll and tap <strong>"Add to Home Screen"</strong><br/>
                  4. Tap Add — done!
                </div>
              </div>
              <div style={{ marginTop:12, padding:'10px 12px', background:'var(--surface2)', borderRadius:'var(--r-sm)', fontSize:13, color:'var(--ink2)' }}>
                Once installed, SchoolTrack opens full-screen like a real app and loads fast even on slow internet.
              </div>
            </div>
            <div className="sheet-actions">
              <button className="btn btn-primary" style={{ width:'100%' }} onClick={() => setShowInstall(false)}>Got it</button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast} />
    </div>
  )
}
