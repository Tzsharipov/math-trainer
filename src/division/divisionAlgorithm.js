// Алгоритм расчёта шагов деления уголком (из Laravel/useDivisionSteps.js)
export function calculateDivisionSteps(dividend, divisor) {
  const divStr = String(dividend ?? '')
  const divs = Number(divisor ?? 0)
  if (!divStr || !divs) return []
  
  const correctQuotient = String(Math.floor(Number(dividend) / divs))
  const steps = []
  
  let pos = 0
  let currentNumber = 0
  let quotientIndex = 0
  
  // Ищем начальный кусок делимого, где currentNumber >= divisor
  while (pos < divStr.length) {
    currentNumber = currentNumber * 10 + parseInt(divStr[pos], 10)
    pos++
    if (currentNumber >= divs) break
  }
  
  while (quotientIndex < correctQuotient.length) {
    const quotientDigit = parseInt(correctQuotient[quotientIndex], 10)
    
    // Если цифра частного = 0, просто "вытянуть" следующую цифру из делимого
    if (quotientDigit === 0) {
      if (pos < divStr.length) {
        currentNumber = currentNumber * 10 + parseInt(divStr[pos], 10)
        pos++
      }
      quotientIndex++
      continue
    }
    
    const partialDividend = currentNumber
    const product = quotientDigit * divs
    const remainder = partialDividend - product
    const offset = pos - String(partialDividend).length
    
    steps.push({
      partialDividend,
      quotientDigit,
      quotientIndex,
      product,
      remainder,
      position: pos,
      offset
    })
    
    // подготовка к следующему шагу
    currentNumber = remainder
    quotientIndex++
    if (pos < divStr.length) {
      currentNumber = currentNumber * 10 + parseInt(divStr[pos], 10)
      pos++
    }
  }
  
  return steps
}