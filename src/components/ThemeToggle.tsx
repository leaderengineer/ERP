import { useEffect, useState } from 'react'

function getInitial(): 'dark' | 'light' {
  const saved = localStorage.getItem('theme') as 'dark' | 'light' | null
  return saved ?? 'dark'
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<'dark' | 'light'>(getInitial())

  useEffect(() => {
    const root = document.documentElement
    if (mode === 'light') root.setAttribute('data-theme', 'light')
    else root.removeAttribute('data-theme')
    localStorage.setItem('theme', mode)
  }, [mode])

  return (
    <button onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')} className="text-gray-300 text-sm underline">
      {mode === 'dark' ? 'Light' : 'Dark'}
    </button>
  )
}


