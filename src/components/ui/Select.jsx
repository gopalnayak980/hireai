import React, { useId } from 'react'

/**
 * Reusable accessible Select dropdown component for HireAI
 * 
 * @param {string} label - Field label
 * @param {Array<string | { value: string | number, label: string, disabled?: boolean }>} options - Select options
 * @param {string} error - Validation error
 * @param {string} helperText - Descriptive helper text
 * @param {string} placeholder - Placeholder / default prompt
 * @param {boolean} disabled - Disabled state
 * @param {boolean} required - Required field indicator
 * @param {string} className - Additional CSS classes
 */
const Select = React.forwardRef(({
  label,
  options = [],
  error,
  helperText,
  placeholder,
  id: customId,
  disabled = false,
  required = false,
  className = '',
  value,
  onChange,
  ...props
}, ref) => {
  const generatedId = useId()
  const selectId = customId || generatedId
  const errorId = `${selectId}-error`
  const helperId = `${selectId}-helper`

  const hasError = Boolean(error)

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label}
          {required && <span className="text-rose-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}

      <div className="relative rounded-xl shadow-subtle">
        <select
          ref={ref}
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
          className={`
            w-full appearance-none rounded-xl text-sm transition-all duration-200
            bg-white text-slate-900
            border ${hasError ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200/90 focus:border-indigo-500 focus:ring-indigo-500/20'}
            focus:outline-none focus:ring-2
            disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed
            pl-4 pr-10 py-2.5 cursor-pointer
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt, idx) => {
            if (typeof opt === 'string') {
              return (
                <option key={`${opt}-${idx}`} value={opt}>
                  {opt}
                </option>
              )
            }
            return (
              <option key={`${opt.value}-${idx}`} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            )
          })}
        </select>

        {/* Custom chevron indicator */}
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {hasError && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-rose-600 font-medium">
          {error}
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

Select.displayName = 'Select'

export default Select
