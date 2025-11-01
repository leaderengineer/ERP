import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../hooks'
import type { PropsWithChildren } from 'react'

export default function ProtectedRoute({ children }: PropsWithChildren) {
  const role = useAppSelector(s => s.auth.role)
  if (role === 'guest') return <Navigate to="/login" replace />
  return <>{children}</>
}


