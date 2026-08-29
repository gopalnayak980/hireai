import React from 'react'
import { HiOutlineInboxStack } from 'react-icons/hi2'

/**
 * Reusable EmptyState component for zero-data states
 * 
 * @param {React.ReactNode} icon - Custom icon or illustration
 * @param {string} title - Primary headline
 * @param {string} description - Explanatory message
 * @param {React.ReactNode} action - CTA button or action link
 * @param {string} className - Additional CSS classes
 */
const EmptyState = ({
  icon,
  title = 'No items found',
  description,
  action,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`text-center py-12 px-6 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex flex-col items-center justify-center ${className}`}
      {...props}
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4 shadow-subtle">
        {icon || <HiOutlineInboxStack className="w-7 h-7 text-slate-400" aria-hidden="true" />}
      </div>

      <h3 className="text-base font-semibold text-slate-900 mb-1">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {action && (
        <div className="flex items-center justify-center">
          {action}
        </div>
      )}
    </div>
  )
}

export default EmptyState
