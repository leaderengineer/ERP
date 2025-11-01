import { PropsWithChildren } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, BookOpen, Users, CalendarDays, Library, LayoutGrid, CheckSquare, Shield } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../hooks'
import { logout } from '../features/auth/authSlice'
import ThemeToggle from '../components/ThemeToggle'

export default function MainLayout({ children }: PropsWithChildren) {
  const { userName, role } = useAppSelector(s => s.auth)
  const dispatch = useAppDispatch()
  return (
    <div className="min-h-screen grid grid-cols-[260px_1fr] grid-rows-[60px_1fr] bg-background">
      <aside className="row-span-2 bg-card border-r border-border hidden md:block">
        <div className="h-14 flex items-center px-4 border-b border-border">
          <Link to="/" className="text-xl font-semibold text-white">Texnikum ERP</Link>
        </div>
        <nav className="p-2 text-sm text-gray-200">
          <NavItem to="/" icon={<LayoutGrid size={18} />}>Boshqaruv paneli</NavItem>
          <NavItem to="/oqituvchilar" icon={<Users size={18} />}>O‘qituvchilar</NavItem>
          <NavItem to="/talabalar" icon={<Users size={18} />}>Talabalar</NavItem>
          <NavItem to="/kutubxona" icon={<Library size={18} />}>Elektron kutubxona</NavItem>
          <NavItem to="/jadval" icon={<CalendarDays size={18} />}>Dars jadvallari</NavItem>
          <NavItem to="/yonalishlar" icon={<BookOpen size={18} />}>Yo‘nalishlar</NavItem>
          <NavItem to="/davomat" icon={<CheckSquare size={18} />}>Elektron davomat</NavItem>
          {role === 'admin' && (
            <NavItem to="/admin" icon={<Shield size={18} />}>Admin</NavItem>
          )}
        </nav>
      </aside>
      <header className="col-start-2 h-14 border-b border-border bg-card/60 backdrop-blur flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button className="md:hidden inline-flex items-center justify-center p-2 rounded border border-border text-gray-200">
            <Menu size={18} />
          </button>
          <span className="text-gray-300 text-sm">{userName ? `Salom, ${userName}!` : 'Xush kelibsiz'}</span>
        </div>
        <div className="text-gray-300 text-sm flex items-center gap-4">
          <ThemeToggle />
          {role !== 'guest' ? (
            <button onClick={() => dispatch(logout())} className="underline text-primary">Chiqish</button>
          ) : (
            <NavLink to="/login" className="underline text-primary">Kirish</NavLink>
          )}
        </div>
      </header>
      <main className="col-start-2 p-4">
        {children}
      </main>
    </div>
  )
}

function NavItem({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
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


