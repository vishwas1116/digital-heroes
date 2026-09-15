import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function PublicLayout() {
  const { isAuthenticated, user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 inset-x-0 z-50 bg-[#f8f6f1]/90 backdrop-blur-md border-b border-black/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-bold text-xl tracking-tight">
            digital<span className="text-[#1a5c4a]">.</span>heroes
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link to="/" className={location.pathname === '/' ? 'text-[#1a5c4a]' : 'hover:text-[#1a5c4a]'}>Home</Link>
            <Link to="/charities" className="hover:text-[#1a5c4a]">Charities</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="hover:text-[#1a5c4a]">Dashboard</Link>
                {user?.role === 'admin' && <Link to="/admin" className="hover:text-[#1a5c4a]">Admin</Link>}
                <button onClick={logout} className="text-[#6b6b6b] hover:text-[#1a1a1a]">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-[#1a5c4a]">Login</Link>
                <Link to="/register" className="btn-primary py-2 px-5 text-sm">Get started</Link>
              </>
            )}
          </nav>
          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <div className="md:hidden border-t border-black/5 bg-[#f8f6f1] px-6 py-4 space-y-3">
            <Link to="/" onClick={() => setOpen(false)} className="block">Home</Link>
            <Link to="/charities" onClick={() => setOpen(false)} className="block">Charities</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="block">Dashboard</Link>
                <button onClick={() => { logout(); setOpen(false) }} className="block">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="block">Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="block">Register</Link>
              </>
            )}
          </div>
        )}
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-black/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-[#6b6b6b]">
          <p>© 2026 Digital Heroes. Built for impact.</p>
          <div className="flex gap-6">
            <Link to="/charities">Charities</Link>
            <Link to="/register">Join</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
