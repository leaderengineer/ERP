import { useState } from 'react'
import type { PropsWithChildren } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, BookOpen, Users, CalendarDays, Library, LayoutGrid, CheckSquare, Shield } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../hooks'
import { logout } from '../features/auth/authSlice'
import ThemeToggle from '../components/ThemeToggle'

export default function MainLayout({ children }: PropsWithChildren) {
  const { userName, role } = useAppSelector(s => s.auth)
  const dispatch = useAppDispatch()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background md:flex">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64
        bg-card border-r border-border
        transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        transition-transform duration-300 ease-in-out
        md:block
        md:flex-shrink-0
      `}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-border">
          <Link to="/" className="text-xl font-semibold text-white">Texnikum ERP</Link>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <Menu size={18} />
          </button>
        </div>
        <nav className="p-2 text-sm text-gray-200 h-[calc(100vh-56px)] overflow-y-auto">
          <NavItem to="/" icon={<LayoutGrid size={18} />} onClick={() => setMobileMenuOpen(false)}>Boshqaruv paneli</NavItem>
          <NavItem to="/oqituvchilar" icon={<Users size={18} />} onClick={() => setMobileMenuOpen(false)}>O'qituvchilar</NavItem>
          <NavItem to="/talabalar" icon={<Users size={18} />} onClick={() => setMobileMenuOpen(false)}>Talabalar</NavItem>
          <NavItem to="/kutubxona" icon={<Library size={18} />} onClick={() => setMobileMenuOpen(false)}>Elektron kutubxona</NavItem>
          <NavItem to="/jadval" icon={<CalendarDays size={18} />} onClick={() => setMobileMenuOpen(false)}>Dars jadvallari</NavItem>
          <NavItem to="/yonalishlar" icon={<BookOpen size={18} />} onClick={() => setMobileMenuOpen(false)}>Yo'nalishlar</NavItem>
          <NavItem to="/davomat" icon={<CheckSquare size={18} />} onClick={() => setMobileMenuOpen(false)}>Elektron davomat</NavItem>
          {role === 'admin' && (
            <NavItem to="/admin" icon={<Shield size={18} />} onClick={() => setMobileMenuOpen(false)}>Admin</NavItem>
          )}
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex-1 min-w-0 md:flex md:flex-col">
        {/* Header */}
        <header className="h-14 border-b border-border bg-card/60 backdrop-blur flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded border border-border text-gray-200 hover:bg-white/5"
            >
              <Menu size={18} />
            </button>
            <span className="text-gray-300 text-sm truncate">{userName ? `Salom, ${userName}!` : 'Xush kelibsiz'}</span>
          </div>
          <div className="text-gray-300 text-sm flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            {role !== 'guest' ? (
              <button onClick={() => dispatch(logout())} className="underline text-primary whitespace-nowrap">Chiqish</button>
            ) : (
              <NavLink to="/login" className="underline text-primary whitespace-nowrap">Kirish</NavLink>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className="p-2 md:p-4 min-h-[calc(100vh-56px)]">
          {children}
        </main>
      </div>
    </div>
  )
}

function NavItem({ to, icon, children, onClick }: { to: string; icon: React.ReactNode; children: React.ReactNode; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded transition-colors ${
          isActive ? 'bg-primary/20 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'
        }`
      }
    >
      <span className="text-primary">{icon}</span>
      {children}
    </NavLink>
  )
}


