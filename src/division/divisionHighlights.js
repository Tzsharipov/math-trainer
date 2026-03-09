// Управление подсветкой ячеек (из Laravel/useHighlights.js)
import { clampInt } from './divisionHelpers.js';

export function clearHighlights(inputRefs) {
  for (const k in inputRefs) {
    const el = inputRefs[k]
    if (!el) continue
    // НЕ стираем зелёный и красный (результаты проверки)
    if (el.classList.contains('bg-green-400') || el.classList.contains('bg-red-400')) {
      continue
    }
    // Убираем классы подсветки и анимации
    el.classList.remove('cell-pulse-orange', 'cell-pulse-yellow', 'bg-orange-300', 'bg-yellow-300')
    // Восстанавливаем исходный фон
    if (el.dataset.stepType === 'product') {
      el.style.backgroundColor = ''
      el.classList.remove('bg-blue-100')
      // Восстанавливаем через оригинальный класс
    } else if (el.dataset.stepType === 'difference') {
      el.style.backgroundColor = ''
    } else if (el.dataset.quotientIndex !== undefined) {
      el.style.backgroundColor = ''
    }
  }
}

export function highlightElement(el, type, hintsEnabled) {
  if (!el) return

  if (type === 'hint') {
    if (!hintsEnabled) return
    // Не перебиваем зелёный/красный
    if (el.classList.contains('bg-green-400') || el.classList.contains('bg-red-400')) return

    // Убираем старую подсветку
    el.classList.remove('cell-pulse-orange', 'cell-pulse-yellow', 'bg-orange-300', 'bg-yellow-300')

    if (el.dataset.stepType === 'product') {
      el.classList.add('bg-orange-300', 'cell-pulse-orange')
    } else if (el.dataset.stepType === 'difference') {
      el.classList.add('bg-yellow-300', 'cell-pulse-yellow')
    } else if (el.dataset.quotientIndex !== undefined) {
      el.classList.add('bg-orange-300', 'cell-pulse-orange')
    }
  } else if (type === 'ok') {
    el.classList.remove('cell-pulse-orange', 'cell-pulse-yellow', 'bg-orange-300', 'bg-yellow-300')
    el.classList.add('bg-green-400')
    el.style.backgroundColor = ''
  } else if (type === 'wrong') {
    el.classList.remove('cell-pulse-orange', 'cell-pulse-yellow', 'bg-orange-300', 'bg-yellow-300')
    el.classList.add('bg-red-400')
    el.style.backgroundColor = ''
  }
}

export function updateHighlightsForStep(stepIndex, inputRefs, stepsData, dividendDigitsArray, hintsEnabled) {
  clearHighlights(inputRefs)
  if (!stepsData.length) return
  const sd = stepsData[stepIndex]
  if (!sd) return
  
  const pdStr = String(sd.partialDividend)
  const len = pdStr.length
  const offset = clampInt(sd.offset, 0, dividendDigitsArray.length - 1)
  
  for (let c = offset; c < offset + len; c++) {
    const key = `${stepIndex}:product:${c}`
    highlightElement(inputRefs[key], 'hint', hintsEnabled)
  }
  
  const qKey = `q:${sd.quotientIndex}`
  highlightElement(inputRefs[qKey], 'hint', hintsEnabled)
}

export function updateHighlights(focusedRow, inputRefs, stepsData, dividendDigitsArray, hintsEnabled) {
  clearHighlights(inputRefs)
  if (!stepsData.length) return
  
  if (focusedRow.step === null) {
    updateHighlightsForStep(0, inputRefs, stepsData, dividendDigitsArray, hintsEnabled)
    return
  }
  
  const stepIndex = focusedRow.step
  const stepDatum = stepsData[stepIndex]
  if (!stepDatum) return
  
  if (focusedRow.type === 'product') {
    const pdStr = String(stepDatum.partialDividend)
    const len = pdStr.length
    const offset = clampInt(stepDatum.offset, 0, dividendDigitsArray.length - 1)
    
    for (let c = offset; c < offset + len; c++) {
      const key = `${stepIndex}:product:${c}`
      highlightElement(inputRefs[key], 'hint', hintsEnabled)
    }
    
    const qKey = `q:${stepDatum.quotientIndex}`
    highlightElement(inputRefs[qKey], 'hint', hintsEnabled)
  } else if (focusedRow.type === 'difference') {
    const next = stepsData[stepIndex + 1]
    if (next) {
      const pdStr = String(next.partialDividend)
      const len = pdStr.length
      const offset = clampInt(next.offset, 0, dividendDigitsArray.length - 1)
      for (let c = offset; c < offset + len; c++) {
        const key = `${stepIndex}:difference:${c}`
        highlightElement(inputRefs[key], 'hint', hintsEnabled)
      }
    } else {
      const remStr = String(stepDatum.remainder)
      const len = remStr.length || 1
      const offset = clampInt(stepDatum.offset, 0, dividendDigitsArray.length - 1)
      for (let c = offset; c < offset + len; c++) {
        const key = `${stepIndex}:difference:${c}`
        highlightElement(inputRefs[key], 'hint', hintsEnabled)
      }
    }
  } else {
    updateHighlightsForStep(stepIndex, inputRefs, stepsData, dividendDigitsArray, hintsEnabled)
  }
}