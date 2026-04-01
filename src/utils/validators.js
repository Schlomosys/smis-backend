export function required(value) {
  return value !== null && value !== undefined && value !== ''
}

export function email(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}
