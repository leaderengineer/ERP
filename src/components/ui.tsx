import { clsx } from 'clsx'
import { useState, useEffect } from 'react'

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline'; asChild?: boolean }
) {
  const { className, variant = 'primary', asChild, children, ...rest } = props
  const [isDark, setIsDark] = useState(false)
  
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark')
    }
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])
  
  const primaryStyles = clsx(
    'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all',
    'text-white border-transparent shadow-lg hover:shadow-xl',
    'hover:opacity-90 active:scale-[0.98] transform',
    'dark:bg-primary dark:text-white dark:shadow-lg dark:hover:bg-primary/90 dark:hover:shadow-xl',
    className
  )
  
  const primaryStyle = !isDark ? { backgroundColor: '#19172a' } : {}
  
  const outlineStyles = clsx(
    'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all',
    'border-2 border-gray-300 text-gray-800 bg-white hover:bg-gray-50',
    'hover:border-gray-400 shadow-sm hover:shadow-md active:scale-[0.98] transform',
    'dark:border-border dark:text-gray-200 dark:bg-card/50 dark:hover:bg-card/80 dark:hover:border-primary/50',
    className
  )
  
  if (asChild) {
    return (
      <span
        className={variant === 'primary' ? primaryStyles : outlineStyles}
        style={variant === 'primary' ? primaryStyle : {}}
        {...rest}
      >
        {children}
      </span>
    )
  }
  return (
    <button
      className={variant === 'primary' ? primaryStyles : outlineStyles}
      style={variant === 'primary' ? primaryStyle : {}}
      {...rest}
    >
      {children}
    </button>
  )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props
  const [isDark, setIsDark] = useState(false)
  
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark')
    }
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])
  
  const inputStyle = !isDark && !props.disabled 
    ? { 
        backgroundColor: '#19172a', 
        color: 'white',
      } 
    : {}
  
  return (
    <input
      className={clsx(
        'w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 outline-none',
        'focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all',
        'shadow-sm focus:shadow-lg hover:border-gray-400',
        'dark:bg-card/50 dark:text-gray-100 dark:border-border dark:placeholder:text-gray-400',
        'dark:focus:ring-primary dark:focus:border-primary dark:hover:border-gray-600',
        // Placeholder color override for light mode
        !isDark && !props.disabled ? 'placeholder:text-gray-400' : 'placeholder:text-gray-500',
        className,
      )}
      style={inputStyle}
      {...rest}
    />
  )
}

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props
  return (
    <div
      className={clsx(
        'bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg',
        'hover:shadow-xl transition-shadow duration-300',
        'dark:bg-card dark:border-border dark:shadow-lg',
        className,
      )}
      {...rest}
    />
  )
}


