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

const formatNumber = (amount) => new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
}).format(amount)

const getCurrencyFormatter = (currencyCode) => {
  if (typeof currencyCode !== 'string' || !/^[A-Z]{3}$/.test(currencyCode)) return null
  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    })
  } catch {
    return null
  }
}

const formatSalary = (salary, minimum, maximum, currencyCode) => {
  const min = parseAmount(minimum)
  const max = parseAmount(maximum)
  const hasCurrencyMetadata = currencyCode !== undefined && currencyCode !== null && currencyCode !== ''

  if (hasCurrencyMetadata) {
    const formatter = getCurrencyFormatter(currencyCode)
    if (!formatter) return 'Salary not disclosed'
    if (min !== null && max !== null) {
      return max >= min
        ? `${formatter.format(min)} - ${formatter.format(max)}`
        : 'Salary not disclosed'
    }
    if (min !== null) return `${formatter.format(min)}+`
    if (max !== null) return `Up to ${formatter.format(max)}`
    return 'Salary not disclosed'
  }

  // Preserve legacy salary strings as entered, since their currency is already explicit or unknown.
  if (typeof salary === 'string' && salary.trim()) {
    const value = salary.trim()
    const partialMinimum = value.match(/^\s*([^\d\w]*[\d,]+(?:\.\d+)?K)\s*-\s*[^\w]*(?:NaN|undefined|null|Infinity)K?\s*$/i)
    if (partialMinimum) return `${partialMinimum[1]}+`
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

  // Numeric values without currency metadata remain unlabelled rather than being assumed to be INR.
  if (min !== null && max !== null) {
    return max >= min ? `${formatNumber(min)} - ${formatNumber(max)}` : 'Salary not disclosed'
  }
  if (min !== null) return `${formatNumber(min)}+`
  if (max !== null) return `Up to ${formatNumber(max)}`
  const amount = parseAmount(salary)
  return amount === null ? 'Salary not disclosed' : formatNumber(amount)
}

export default formatSalary
