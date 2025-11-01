import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../hooks'

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const role = useAppSelector(s => s.auth.role)
  if (role === 'guest') return <Navigate to="/login" replace />
  return children
}


