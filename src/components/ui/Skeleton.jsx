import React from 'react'

/**
 * Reusable Skeleton loading placeholder components
 * 
 * @param {'text' | 'circular' | 'rectangular' | 'card'} variant
 * @param {string} width
 * @param {string} height
 * @param {string} className
 */
const Skeleton = ({
  variant = 'text',
  width,
  height,
  className = '',
  ...props
}) => {
  const baseStyles = 'animate-pulse bg-slate-200/80'

  const variantStyles = {
    text: 'h-4 rounded-md w-full',
    circular: 'rounded-full shrink-0',
    rectangular: 'rounded-xl',
    card: 'rounded-2xl border border-slate-100 p-6',
  }

  const customStyles = {
    width: width || undefined,
    height: height || undefined,
  }

  return (
    <div
      aria-hidden="true"
      style={customStyles}
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.text} ${className}`}
      {...props}
    />
  )
}

// Preset: Text Line
Skeleton.Text = ({ lines = 1, className = '' }) => (
  <div className={`space-y-2.5 ${className}`} aria-hidden="true">
    {Array.from({ length: lines }).map((_, idx) => (
      <div
        key={idx}
        className={`h-3.5 bg-slate-200/80 rounded-md animate-pulse ${idx === lines - 1 && lines > 1 ? 'w-4/5' : 'w-full'}`}
      />
    ))}
  </div>
)

// Preset: Circle Avatar
Skeleton.Circle = ({ size = 'h-10 w-10', className = '' }) => (
  <div
    className={`${size} rounded-full bg-slate-200/80 animate-pulse shrink-0 ${className}`}
    aria-hidden="true"
  />
)

// Preset: Job Card Skeleton
Skeleton.JobCard = ({ className = '' }) => (
  <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-card p-6 space-y-4 animate-pulse ${className}`} aria-hidden="true">
    <div className="flex justify-between items-start">
      <div className="space-y-2 w-2/3">
        <div className="h-5 bg-slate-200 rounded-md w-3/4" />
        <div className="h-4 bg-slate-200/70 rounded-md w-1/2" />
      </div>
      <div className="h-6 bg-slate-200/70 rounded-full w-20" />
    </div>
    
    <div className="flex gap-4 pt-2">
      <div className="h-4 bg-slate-200/60 rounded-md w-24" />
      <div className="h-4 bg-slate-200/60 rounded-md w-24" />
    </div>

    <div className="flex gap-2 pt-2">
      <div className="h-6 bg-slate-200/70 rounded-full w-16" />
      <div className="h-6 bg-slate-200/70 rounded-full w-20" />
      <div className="h-6 bg-slate-200/70 rounded-full w-14" />
    </div>

    <div className="pt-2">
      <div className="h-10 bg-slate-200 rounded-xl w-full" />
    </div>
  </div>
)

// Preset: Stat Card Skeleton
Skeleton.StatCard = ({ className = '' }) => (
  <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-card p-6 space-y-3 animate-pulse ${className}`} aria-hidden="true">
    <div className="flex justify-between items-center">
      <div className="h-4 bg-slate-200/80 rounded-md w-24" />
      <div className="h-9 w-9 bg-slate-200 rounded-xl" />
    </div>
    <div className="h-8 bg-slate-200 rounded-lg w-20" />
    <div className="h-3 bg-slate-200/60 rounded-md w-32" />
  </div>
)

export default Skeleton
