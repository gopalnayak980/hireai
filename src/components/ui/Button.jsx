import React from 'react'

/**
 * Reusable Button component for HireAI
 * 
 * @param {'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'ai'} variant - Visual appearance
 * @param {'sm' | 'md' | 'lg'} size - Button size
 * @param {boolean} isLoading - Loading state with spinner
 * @param {boolean} disabled - Disabled state
 * @param {React.ReactNode} leftIcon - Leading icon component
 * @param {React.ReactNode} rightIcon - Trailing icon component
 * @param {string} className - Additional CSS classes
 */
const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = '',
  type = 'button',
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5 font-medium',
    md: 'px-4 py-2.5 text-sm rounded-xl gap-2 font-medium',
    lg: 'px-6 py-3.5 text-base rounded-xl gap-2.5 font-semibold',
  }

  const variantStyles = {
    primary: 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-sm hover:shadow-btn-primary focus-visible:ring-primary-500 active:scale-[0.98]',
    secondary: 'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm focus-visible:ring-slate-400 active:scale-[0.98]',
    outline: 'bg-transparent hover:bg-primary-50 active:bg-primary-100 text-primary-600 border border-primary-600/80 focus-visible:ring-primary-500 active:scale-[0.98]',
    ghost: 'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-600 hover:text-slate-900 focus-visible:ring-slate-400 active:scale-[0.98]',
    danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm hover:shadow-rose-500/20 focus-visible:ring-rose-500 active:scale-[0.98]',
    ai: 'bg-gradient-to-r from-primary-600 via-violet-600 to-cyan-600 hover:from-primary-500 hover:via-violet-500 hover:to-cyan-500 active:from-primary-700 active:to-cyan-700 text-white shadow-md shadow-violet-500/20 hover:shadow-btn-ai focus-visible:ring-violet-500 active:scale-[0.98]',
  }

  const isDisabled = disabled || isLoading

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="inline-flex shrink-0 items-center justify-center">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="inline-flex shrink-0 items-center justify-center">{rightIcon}</span>}
        </>
      )}
    </button>
  )
})

Button.displayName = 'Button'

export default Button
