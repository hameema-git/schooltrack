import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const TABS = [
  { path: '/',        icon: 'ti-calendar',  label: 'Home'    },
  { path: '/notes',   icon: 'ti-notebook',  label: 'Notes'   },
  { path: '/profile', icon: 'ti-user',      label: 'Profile' },
]

export default function Layout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    if (window.confirm('Sign out of SchoolTrack?')) {
      await logout()
      navigate('/login')
    }
  }

  return (
    <div style={{ minHeight:'100dvh', background:'var(--bg)' }}>
      {/* Top bar — name + logout */}
      <div style={{
        background:'var(--surface)', borderBottom:'1px solid var(--border)',
        padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between',
        position:'sticky', top:0, zIndex:60,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:32, height:32, borderRadius:'50%', background:'#3730A3',
            color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:13, fontWeight:600, flexShrink:0,
          }}>
            {(user?.first_name?.[0] || user?.username?.[0] || '?').toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize:14, fontWeight:600, lineHeight:1.2 }}>
              {user?.first_name ? `${user.first_name} ${user.last_name||''}`.trim() : user?.username}
            </div>
            <div style={{ fontSize:11, color:'var(--ink3)', marginTop:1 }}>
              Grade {user?.grade}{user?.division && user.division !== 'ALL' ? ` · Div ${user.division}` : ''}
              {user?.child_name ? ` · ${user.child_name}` : ''}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            display:'flex', alignItems:'center', gap:5,
            padding:'6px 12px', borderRadius:8,
            border:'0.5px solid var(--border2)', background:'none',
            color:'var(--ink2)', fontSize:13, cursor:'pointer', fontFamily:'inherit',
          }}>
          <i className="ti ti-logout" style={{ fontSize:15 }} aria-hidden="true" />
          Sign out
        </button>
      </div>

      <Outlet />

      {/* Bottom nav */}
      <nav style={{
        position:'fixed', bottom:0, left:0, right:0,
        height:'calc(60px + env(safe-area-inset-bottom, 0px))',
        background:'var(--surface)', borderTop:'1px solid var(--border)',
        display:'grid', gridTemplateColumns:'1fr 1fr 1fr',
        zIndex:100, paddingBottom:'env(safe-area-inset-bottom, 0px)',
      }}>
        {TABS.map(t => (
          <button key={t.path}
            onClick={() => navigate(t.path)}
            style={{
              display:'flex', flexDirection:'column', alignItems:'center',
              justifyContent:'center', gap:3,
              border:'none', background:'none', cursor:'pointer',
              color: pathname === t.path ? '#3730A3' : 'var(--ink3)',
              fontFamily:'inherit', fontSize:10, fontWeight:500, padding:'6px 4px',
            }}>
            <i className={`ti ${t.icon}`} style={{ fontSize:22, lineHeight:1 }} aria-hidden="true" />
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
