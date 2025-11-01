import { useAppDispatch, useAppSelector } from '../hooks'
import { setRole, type UserRole } from '../features/auth/authSlice'
import { Card, Button } from '../components/ui'

export default function Admin() {
  const role = useAppSelector(s => s.auth.role)
  const dispatch = useAppDispatch()

  function switchRole(next: UserRole) {
    dispatch(setRole(next))
  }

  return (
    <Card className="text-gray-200">
      <h2 className="text-white font-semibold mb-3">Admin panel</h2>
      <div className="mb-3">Joriy rol: <span className="text-primary font-semibold">{role}</span></div>
      <div className="space-x-2">
        <Button onClick={() => switchRole('admin')}>Admin</Button>
        <Button variant="outline" onClick={() => switchRole('teacher')}>O‘qituvchi</Button>
        <Button variant="outline" onClick={() => switchRole('guest')}>Mehmon</Button>
      </div>
    </Card>
  )
}


