import React, { useId } from 'react'

/**
 * Reusable accessible Input component for HireAI
 * 
 * @param {string} label - Input label
 * @param {string} error - Validation error message
 * @param {string} helperText - Descriptive helper text
 * @param {React.ReactNode} leftIcon - Leading icon
 * @param {React.ReactNode} rightIcon - Trailing icon
 * @param {boolean} disabled - Disabled state
 * @param {boolean} required - Required field indicator
 * @param {string} className - Additional CSS classes
 */
const Input = React.forwardRef(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  id: customId,
  disabled = false,
  required = false,
  className = '',
  type = 'text',
  ...props
}, ref) => {
  const generatedId = useId()
  const inputId = customId || generatedId
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`

  const hasError = Boolean(error)

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label}
          {required && <span className="text-rose-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}

      <div className="relative rounded-xl shadow-subtle">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
          className={`
            w-full rounded-xl text-sm transition-all duration-200
            bg-white text-slate-900 placeholder:text-slate-400
            border ${hasError ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200/90 focus:border-indigo-500 focus:ring-indigo-500/20'}
            focus:outline-none focus:ring-2
            disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed
            ${leftIcon ? 'pl-10' : 'pl-4'}
            ${rightIcon ? 'pr-10' : 'pr-4'}
            py-2.5
            ${className}
          `}
          {...props}
        />

        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>

      {hasError && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
          <span>{error}</span>
        </p>
      )}

      {!hasError && helperText && (
        <p id={helperId} className="mt-1.5 text-xs text-slate-500">
          {helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
