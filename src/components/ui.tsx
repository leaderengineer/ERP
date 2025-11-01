import { clsx } from 'clsx'

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline'; asChild?: boolean }
) {
  const { className, variant = 'primary', asChild, children, ...rest } = props
  if (asChild) {
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-2 px-3 py-2 rounded border text-sm cursor-pointer',
          variant === 'primary' && 'bg-primary text-white border-transparent hover:opacity-90',
          variant === 'outline' && 'border-border text-gray-200 hover:bg-white/5',
          className,
        )}
        {...rest}
      >
        {children}
      </span>
    )
  }
  return (
    <button
      className={clsx(
        'inline-flex items-center gap-2 px-3 py-2 rounded border text-sm',
        variant === 'primary' && 'bg-primary text-white border-transparent hover:opacity-90',
        variant === 'outline' && 'border-border text-gray-200 hover:bg-white/5',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props
  return (
    <input
      className={clsx(
        'w-full bg-transparent text-gray-200 border border-border rounded px-3 py-2 outline-none',
        'placeholder:text-gray-500 focus:ring-2 ring-primary/40',
        className,
      )}
      {...rest}
    />
  )
}

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props
  return <div className={clsx('bg-card border border-border rounded p-4', className)} {...rest} />
}


