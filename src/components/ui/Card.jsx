import React from 'react'

/**
 * Reusable Card component for HireAI surfaces
 * 
 * @param {React.ReactNode} children
 * @param {'none' | 'sm' | 'md' | 'lg'} padding - Internal padding
 * @param {boolean} hover - Enable smooth hover elevation and border transition
 * @param {'default' | 'elevated' | 'ai'} variant - Surface aesthetic
 * @param {string} className
 * @param {React.ElementType} as - Custom wrapper element
 */
const Card = React.forwardRef(({
  children,
  padding = 'md',
  hover = false,
  variant = 'default',
  className = '',
  as: Component = 'div',
  ...props
}, ref) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  const variantStyles = {
    default: 'bg-white border border-slate-200/80 shadow-card text-slate-900',
    elevated: 'bg-white border border-slate-100 shadow-card-hover text-slate-900',
    ai: 'bg-white border border-indigo-100 shadow-card relative overflow-hidden text-slate-900',
  }

  const hoverStyles = hover
    ? 'hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-card-hover transition-all duration-200 ease-out cursor-pointer'
    : 'transition-colors duration-200'

  return (
    <Component
      ref={ref}
      className={`rounded-2xl ${variantStyles[variant] || variantStyles.default} ${paddingStyles[padding] || paddingStyles.md} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
})

Card.displayName = 'Card'

export default Card
