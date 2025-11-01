import { useState } from 'react'
import { Card, Button, Input } from '../components/ui'
import { useAppDispatch } from '../hooks'
import { login, type UserRole } from '../features/auth/authSlice'
import { authenticateTeacher } from '../services/teachers'
import { useNavigate } from 'react-router-dom'

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
        alert('Admin paroli noto‘g‘ri')
        return
      }
    } else if (role === 'teacher') {
      const t = authenticateTeacher(username, teacherPass)
      if (!t) {
        alert('Ism yoki parol noto‘g‘ri')
        return
      }
    }
    dispatch(login({ userName: username, role }))
    navigate('/')
  }

  return (
    <div className="max-w-sm mx-auto">
      <Card className="text-gray-200">
        <h2 className="text-white font-semibold mb-3">Kirish</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Username</label>
            <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="username" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Parol</label>
            <Input type="password" value={role === 'admin' ? adminPass : teacherPass} onChange={e => (role === 'admin' ? setAdminPass(e.target.value) : setTeacherPass(e.target.value))} placeholder="Parol" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Rol</label>
            <select className="w-full bg-transparent text-gray-200 border border-border rounded px-3 py-2" value={role} onChange={e => setRole(e.target.value as UserRole)}>
              <option value="teacher">O‘qituvchi</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <Button onClick={submit}>Kirish</Button>
        </div>
      </Card>
    </div>
  )
}


