import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui'
import { useAppDispatch } from '../hooks'
import { login, type UserRole } from '../features/auth/authSlice'
import { authenticateTeacher } from '../services/teachers'
import { useNavigate } from 'react-router-dom'
import { User, Lock } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'

export default function Login() {
  const [username, setUsername] = useState('')
  const [role, setRole] = useState<UserRole>('teacher')
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [adminPass, setAdminPass] = useState('')
  const ADMIN_PASSWORD = 'texnikum-admin-2025'
  const [teacherPass, setTeacherPass] = useState('')

  function submit() {
    if (!username.trim()) return
    if (role === 'admin') {
      if (adminPass !== ADMIN_PASSWORD) {
        alert("Admin paroli noto'g'ri")
        return
      }
    } else if (role === 'teacher') {
      const t = authenticateTeacher(username, teacherPass)
      if (!t) {
        alert("Username yoki parol noto'g'ri")
        return
      }
    }
    dispatch(login({ userName: username, role }))
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <header className="h-14 border-b flex items-center justify-between px-6 sticky top-0 z-30" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}>
        <Link to="/" className="text-xl font-semibold" style={{ color: 'var(--color-foreground)' }}>Texnikum ERP</Link>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white dark:bg-card rounded-xl shadow-xl p-8 border" style={{ borderColor: 'var(--color-border)' }}>
          <div className="text-center mb-6">
            <div className="mb-4 flex justify-center">
              <svg width="80" height="80" viewBox="0 0 100 100" className="text-green-600">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2"/>
                <path d="M30 50 L45 65 L70 35" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-foreground)' }}>
              Dang'ara shahrining 1-politeknikum kollejiga kirish tizimi
            </h1>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Username kiriting"
                className="w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                style={{ 
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-card)',
                  color: 'var(--color-foreground)'
                }}
                onKeyPress={e => e.key === 'Enter' && submit()}
              />
              <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            <div className="relative">
              <input
                type="password"
                value={role === 'admin' ? adminPass : teacherPass}
                onChange={e => (role === 'admin' ? setAdminPass(e.target.value) : setTeacherPass(e.target.value))}
                placeholder="Parolni kiriting"
                className="w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                style={{ 
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-card)',
                  color: 'var(--color-foreground)'
                }}
                onKeyPress={e => e.key === 'Enter' && submit()}
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            <div>
              <select
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white"
                style={{ 
                  borderColor: 'var(--color-border)',
                  backgroundColor: document.documentElement.getAttribute('data-theme') === 'dark' ? 'var(--color-card)' : '#19172a',
                  color: 'white'
                }}
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
              >
                <option value="teacher" className="bg-white text-gray-900">O'qituvchi</option>
                <option value="admin" className="bg-white text-gray-900">Admin</option>
              </select>
            </div>

            <Button
              onClick={submit}
              className="w-full text-white font-medium py-3 rounded-lg transition-colors"
            >
              Kirish
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}


