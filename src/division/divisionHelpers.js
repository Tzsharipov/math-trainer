// Утилиты и вспомогательные функции

export function clamp(n, min, max) {
  if (!Number.isFinite(n)) return min
  return n < min ? min : n > max ? max : n
}

export function clampInt(n, min, max) {
  const v = Number.isFinite(n) ? Math.floor(n) : min
  if (v < min) return min
  if (v > max) return max
  return v
}

export function generateNumber(digits) {
  const d = clamp(Math.floor(digits), 2, 9)
  const min = Math.pow(10, d - 1)
  const max = Math.pow(10, d) - 1
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function hasZeroInside(num) {
  const str = String(num)
  for (let i = 0; i < str.length - 1; i++) {
    if (str[i] === '0') return true
  }
  return false
}

export function getUserNumber(inputArray) {
  const filledDigits = inputArray.filter(d => d !== '')
  return filledDigits.join('').replace(/^0+/, '') || '0'
}