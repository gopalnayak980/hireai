const parseAmount = (value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? value : null
  }

  if (typeof value !== 'string' || !/^\s*\d[\d,]*(?:\.\d+)?\s*$/.test(value)) {
    return null
  }

  const amount = Number(value.replace(/,/g, '').trim())
  return Number.isFinite(amount) && amount > 0 ? amount : null
}

const formatAmount = (amount) => amount < 1000
  ? `\u20B9${amount.toLocaleString('en-IN')}`
  : `\u20B9${Math.round(amount / 1000)}K`

const formatSalary = (salary, minimum, maximum) => {
  const min = parseAmount(minimum)
  const max = parseAmount(maximum)

  if (min !== null && max !== null) {
    return max >= min ? `${formatAmount(min)} - ${formatAmount(max)}` : 'Salary not disclosed'
  }
  if (min !== null) return `${formatAmount(min)}+`
  if (max !== null) return `Up to ${formatAmount(max)}`

  if (typeof salary === 'number') {
    const amount = parseAmount(salary)
    return amount === null ? 'Salary not disclosed' : formatAmount(amount)
  }

  if (typeof salary !== 'string' || !salary.trim()) return 'Salary not disclosed'

  const value = salary.trim()
  const partialMinimum = value.match(/^\s*[^\d\w]*([\d,]+(?:\.\d+)?)K\s*-\s*[^\w]*(?:NaN|undefined|null|Infinity)K?\s*$/i)
  if (partialMinimum) return `\u20B9${partialMinimum[1]}K+`

  if (/(?:NaN|undefined|null|Infinity)/i.test(value) || !/\d/.test(value)) {
    return 'Salary not disclosed'
  }

  const numericAmounts = value.match(/\d[\d,.]*/g) || []
  if (!numericAmounts.some((amount) => {
    const parsed = Number(amount.replace(/,/g, ''))
    return Number.isFinite(parsed) && parsed > 0
  })) return 'Salary not disclosed'

  return value
}

export default formatSalary
