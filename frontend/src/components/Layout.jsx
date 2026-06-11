import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const TABS = [
  { path: '/',       icon: '🏠', label: 'Today'   },
  { path: '/notes',  icon: '📒', label: 'Notes'   },
  { path: '/profile',icon: '👤', label: 'Profile' },
]

export default function Layout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <Outlet />

      <nav className="bottom-nav">
        {TABS.map(t => (
          <button
            key={t.path}
            className={`nav-item${pathname === t.path ? ' active' : ''}`}
            onClick={() => navigate(t.path)}
          >
            <span className="nav-icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
