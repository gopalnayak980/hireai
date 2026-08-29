import React from 'react'
import Skeleton from './Skeleton'

/**
 * Reusable StatCard component for dashboards and metrics
 * 
 * @param {string} title - Stat title/label
 * @param {string | number} value - Primary metric value
 * @param {React.ReactNode} icon - Vector icon component
 * @param {{ value: string, isPositive?: boolean, label?: string }} trend - Optional percentage/trend
 * @param {string} description - Subtitle/helper text
 * @param {boolean} isLoading - Loading skeleton state
 * @param {'default' | 'primary' | 'success' | 'warning' | 'ai'} variant - Accent style
 * @param {string} className
 */
const StatCard = ({
  title,
  value,
  icon,
  trend,
  description,
  isLoading = false,
  variant = 'default',
  className = '',
  ...props
}) => {
  if (isLoading) {
    return <Skeleton.StatCard className={className} />
  }

  const iconBgStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200/60',
    primary: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    warning: 'bg-amber-50 text-amber-600 border-amber-100',
    ai: 'bg-gradient-to-r from-indigo-50 to-violet-50 text-violet-600 border-violet-100',
  }

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-card p-6 transition-all duration-200 hover:shadow-card-hover hover:border-slate-300 ${className}`}
      {...props}
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {icon && (
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg ${iconBgStyles[variant] || iconBgStyles.default}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </span>
        {trend && (
          <span
            className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${trend.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>

      {(description || trend?.label) && (
        <p className="text-xs text-slate-500 mt-2 font-normal">
          {description || trend?.label}
        </p>
      )}
    </div>
  )
}

export default StatCard
