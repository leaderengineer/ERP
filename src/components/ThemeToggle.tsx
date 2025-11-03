import { useEffect, useState } from 'react'

function getInitial(): 'dark' | 'light' {
  const saved = localStorage.getItem('theme') as 'dark' | 'light' | null
  return saved ?? 'light'
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<'dark' | 'light'>(getInitial())

  useEffect(() => {
    const root = document.documentElement
    if (mode === 'dark') root.setAttribute('data-theme', 'dark')
    else root.removeAttribute('data-theme')
    localStorage.setItem('theme', mode)
  }, [mode])

  return (
    <button onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')} style={{ color: 'var(--color-foreground)' }} className="hover:opacity-80 text-sm font-medium transition-opacity">
      {mode === 'light' ? '🌙 Dark' : '☀️ Light'}
    </button>
  )
}


