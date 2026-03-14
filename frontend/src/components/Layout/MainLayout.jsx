import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import MobileTopbar from './MobileTopbar'
import './MainLayout.scss'

export default function MainLayout({ role = 'receptionist' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Close sidebar on route change (mobile nav click)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="main-layout">
      {/* Desktop sidebar — hidden on mobile via CSS */}
      <div className="sidebar-desktop-wrap">
        <Sidebar role={role} />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          role="presentation"
        >
          <div
            className="sidebar-overlay__panel"
            onClick={e => e.stopPropagation()}
          >
            <Sidebar role={role} mobile onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Mobile top bar */}
      <MobileTopbar onMenuClick={() => setSidebarOpen(true)} role={role} />

      <main className="main-layout__content">
        <Outlet />
      </main>

      <MobileNav role={role} />
    </div>
  )
}
