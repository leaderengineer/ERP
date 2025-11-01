import type { PropsWithChildren } from 'react'
import { useAppSelector } from '../hooks'

export default function RoleGuard({ allow, children }: PropsWithChildren<{ allow: ('admin' | 'teacher' | 'student' | 'guest')[] }>) {
  const role = useAppSelector(s => s.auth.role)
  if (!allow.includes(role)) return null
  return <>{children}</>
}


