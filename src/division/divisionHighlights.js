// Управление подсветкой ячеек (из Laravel/useHighlights.js)
import { clampInt } from './divisionHelpers.js';

export function clearHighlights(inputRefs) {
  for (const k in inputRefs) {
    const el = inputRefs[k]
    if (!el) continue
    const bg = el.style.backgroundColor
    // НЕ стираем зелёный и красный фон (результаты проверки)
    if (bg === 'rgb(134, 239, 172)' || bg === 'rgb(255, 154, 154)') {
      continue
    }
    el.style.backgroundColor = ''
  }
}

export function highlightElement(el, type, hintsEnabled) {
  if (!el) return
  
  if (type === 'hint') {
    if (!hintsEnabled) return
    
    const currentBg = el.style.backgroundColor
    if (currentBg === 'rgb(134, 239, 172)' || currentBg === 'rgb(255, 154, 154)') {
      return
    }
    
    if (el.dataset.stepType === 'product') {
      el.style.backgroundColor = '#44d6e8'
    } else if (el.dataset.stepType === 'difference') {
      el.style.backgroundColor = '#fff59d'
    }
  } else if (type === 'ok') {
    el.style.backgroundColor = '#86efac'
  } else if (type === 'wrong') {
    el.style.backgroundColor = '#ff9a9a'
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