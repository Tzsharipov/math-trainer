// Проверка правильности ответов (из Laravel/useDivisionChecks.js)
import { getUserNumber } from './divisionHelpers.js';
import { highlightElement } from './divisionHighlights.js';

export function checkProduct(stepIndex, steps, stepsData, quotientInputs, inputRefs, hintsEnabled, quotientStatus, checkMessage) {
  const step = steps[stepIndex]
  
  if (stepIndex >= stepsData.length) {
    step.productStatus = 'wrong'
    return
  }
  
  const stepData = stepsData[stepIndex]
  const quotientIndex = stepData.quotientIndex
  
  const correctQuotientDigit = String(stepData.quotientDigit)
  const userQuotientDigit = quotientInputs[quotientIndex]
  
  if (userQuotientDigit !== correctQuotientDigit) {
    step.productStatus = 'wrong'
    highlightElement(inputRefs[`q:${quotientIndex}`], 'wrong', hintsEnabled)
    return
  }
  
  const correctProduct = String(stepData.product)
  const userProduct = getUserNumber(step.productInput)
  
  const isCorrect = userProduct === correctProduct
  step.productStatus = isCorrect ? 'correct' : 'wrong'
  
  // Если это последний шаг и всё правильно
  if (isCorrect && stepIndex === stepsData.length - 1 && hintsEnabled) {
    const allQuotientFilled = quotientInputs.every(q => q !== '')
    if (allQuotientFilled) {
      quotientStatus.value = 'correct'
      checkMessage.textContent = '🥳 Частное введено верно!'
    }
  }
  
  // Подсветка только заполненных ячеек
  for (let c = 0; c < step.productInput.length; c++) {
    const key = `${stepIndex}:product:${c}`
    if (step.productInput[c] !== '') {
      highlightElement(inputRefs[key], isCorrect ? 'ok' : 'wrong', true)
    } else {
      if (inputRefs[key]) inputRefs[key].style.backgroundColor = ''
    }
  }
}

export function checkDifference(stepIndex, steps, stepsData, inputRefs, hintsEnabled, onComplete) {
  const step = steps[stepIndex]
  
  if (stepIndex >= stepsData.length) {
    step.differenceStatus = 'wrong'
    return
  }
  
  const stepData = stepsData[stepIndex]
  let correctValue = '0'
  
  if (stepIndex === stepsData.length - 1) {
    correctValue = String(stepData.remainder)
  } else {
    const nextStepData = stepsData[stepIndex + 1]
    correctValue = String(nextStepData.partialDividend)
  }
  
  const userDiff = getUserNumber(step.differenceInput)
  const isCorrect = userDiff === correctValue || (userDiff === '' && correctValue === '0')
  
  step.differenceStatus = isCorrect ? 'correct' : 'wrong'
  
  // Подсветка только заполненных ячеек
  for (let c = 0; c < step.differenceInput.length; c++) {
    const key = `${stepIndex}:difference:${c}`
    if (step.differenceInput[c] !== '') {
      highlightElement(inputRefs[key], isCorrect ? 'ok' : 'wrong', true)
    } else {
      if (inputRefs[key]) inputRefs[key].style.backgroundColor = ''
    }
  }
  
  // Если правильно и это последний шаг
  if (isCorrect && stepIndex === stepsData.length - 1 && onComplete) {
    onComplete()
  }
}

export function checkQuotient(dividend, divisor, quotientInputs, inputRefs, checkMessage) {
  const correctQuotient = String(Math.floor(Number(dividend) / Number(divisor)))
  const userQuotient = quotientInputs.join('')
  
  if (userQuotient.length === correctQuotient.length && userQuotient === correctQuotient) {
    checkMessage.textContent = '🥳 Частное введено верно!'
    checkMessage.className = 'text-xl font-bold text-center min-h-[2rem] text-green-600'
    
    // Confetti
    if (window.confetti) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FF6347', '#00CED1', '#32CD32', '#FF69B4']
      })
      
      setTimeout(() => {
        confetti({
          particleCount: 100,
          angle: 60,
          spread: 55,
          origin: { x: 0.3, y: 0.6 },
          colors: ['#FFD700', '#FF6347', '#00CED1']
        })
      }, 200)
      
      setTimeout(() => {
        confetti({
          particleCount: 100,
          angle: 120,
          spread: 55,
          origin: { x: 0.7, y: 0.6 },
          colors: ['#32CD32', '#FF69B4', '#FFD700']
        })
      }, 400)
    }
  } else {
    checkMessage.textContent = 'Пока неверно. Проверьте цифры частного.'
    checkMessage.className = 'text-xl font-bold text-center min-h-[2rem] text-red-600'
    
    // Подсветка ошибочных цифр
    const correct = correctQuotient.split('')
    for (let i = 0; i < quotientInputs.length; i++) {
      const key = `q:${i}`
      const qEl = inputRefs[key]
      if (!qEl) continue
      if (quotientInputs[i] !== correct[i]) {
        highlightElement(qEl, 'wrong', true)
      } else {
        highlightElement(qEl, 'ok', true)
      }
    }
  }
}