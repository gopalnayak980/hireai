import React from 'react'

/**
 * Reusable Badge component for status, tags, and AI indicators
 * 
 * @param {'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'ai' | 'primary'} variant
 * @param {'sm' | 'md'} size
 * @param {boolean} dot - Render an indicator dot
 * @param {React.ReactNode} icon - Optional leading icon
 * @param {string} className
 */
const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  icon = null,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-xs font-medium gap-1.5',
    md: 'px-3 py-1 text-xs font-semibold gap-1.5',
  }

  const variantStyles = {
    primary: 'bg-indigo-50 text-indigo-700 border border-indigo-200/80',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    info: 'bg-sky-50 text-sky-700 border border-sky-200/80',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200/80',
    ai: 'bg-gradient-to-r from-indigo-50 via-violet-50 to-cyan-50 text-violet-700 border border-violet-200/80',
  }

  const dotColors = {
    primary: 'bg-indigo-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-sky-500',
    neutral: 'bg-slate-400',
    ai: 'bg-violet-500',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full tracking-wide transition-colors ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.neutral} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColors[variant] || dotColors.neutral}`}
          aria-hidden="true"
        />
      )}
      {icon && <span className="inline-flex shrink-0 items-center justify-center">{icon}</span>}
      <span>{children}</span>
    </span>
  )
}

export default Badge
