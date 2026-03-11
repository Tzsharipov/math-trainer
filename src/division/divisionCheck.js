// ÐŸÑ€Ð¾Ð²ÐµÑ€ÐºÐ° Ð¿Ñ€Ð°Ð²Ð¸Ð»ÑŒÐ½Ð¾ÑÑ‚Ð¸ Ð¾Ñ‚Ð²ÐµÑ‚Ð¾Ð² (Ð¸Ð· Laravel/useDivisionChecks.js)
import { getUserNumber } from './divisionHelpers.js';
import { highlightElement, clearHighlights } from './divisionHighlights.js';

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
  
  // Ð•ÑÐ»Ð¸ ÑÑ‚Ð¾ Ð¿Ð¾ÑÐ»ÐµÐ´Ð½Ð¸Ð¹ ÑˆÐ°Ð³ Ð¸ Ð²ÑÑ‘ Ð¿Ñ€Ð°Ð²Ð¸Ð»ÑŒÐ½Ð¾
  if (isCorrect && stepIndex === stepsData.length - 1) {
    const allQuotientFilled = quotientInputs.every(q => q !== '')
    if (allQuotientFilled) {
      quotientStatus.value = 'correct'
      const childName = localStorage.getItem('childName'); const message = childName ? `🥳 Умничка, ${childName}! Частное введено верно!` : '🥳 Частное введено верно!'; checkMessage.textContent = message;
      
      // Confetti
      if (window.confetti) {
        // ÐŸÐµÑ€Ð²Ñ‹Ð¹ Ð·Ð°Ð»Ð¿
        confetti({
          particleCount: 200,
          spread: 120,
          origin: { x: 0.5, y: 0.6 },
          colors: ['#FFD700', '#FF6347', '#00CED1', '#32CD32', '#FF69B4'],
          scalar: 1.5
        });
        
        // Ð’Ñ‚Ð¾Ñ€Ð¾Ð¹ Ð·Ð°Ð»Ð¿ (Ñ‡ÐµÑ€ÐµÐ· 300Ð¼Ñ)
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { x: 0.5, y: 0.6 },
            colors: ['#FFD700', '#FF6347', '#00CED1'],
            scalar: 1.5
          });
        }, 300);
        
        // Ð¢Ñ€ÐµÑ‚Ð¸Ð¹ Ð·Ð°Ð»Ð¿ (Ñ‡ÐµÑ€ÐµÐ· 600Ð¼Ñ)
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { x: 0.5, y: 0.6 },
            colors: ['#32CD32', '#FF69B4', '#FFD700'],
            scalar: 1.5
          });
        }, 600);
      }
      clearHighlights(inputRefs)
    }
  }
  
  // ÐŸÐ¾Ð´ÑÐ²ÐµÑ‚ÐºÐ° Ñ‚Ð¾Ð»ÑŒÐºÐ¾ Ð·Ð°Ð¿Ð¾Ð»Ð½ÐµÐ½Ð½Ñ‹Ñ… ÑÑ‡ÐµÐµÐº
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
  
  // ÐŸÐ¾Ð´ÑÐ²ÐµÑ‚ÐºÐ° Ñ‚Ð¾Ð»ÑŒÐºÐ¾ Ð·Ð°Ð¿Ð¾Ð»Ð½ÐµÐ½Ð½Ñ‹Ñ… ÑÑ‡ÐµÐµÐº
  for (let c = 0; c < step.differenceInput.length; c++) {
    const key = `${stepIndex}:difference:${c}`
    if (step.differenceInput[c] !== '') {
      highlightElement(inputRefs[key], isCorrect ? 'ok' : 'wrong', true)
    } else {
      if (inputRefs[key]) inputRefs[key].style.backgroundColor = ''
    }
  }
  
  // Ð•ÑÐ»Ð¸ Ð¿Ñ€Ð°Ð²Ð¸Ð»ÑŒÐ½Ð¾ Ð¸ ÑÑ‚Ð¾ Ð¿Ð¾ÑÐ»ÐµÐ´Ð½Ð¸Ð¹ ÑˆÐ°Ð³
  if (isCorrect && stepIndex === stepsData.length - 1 && onComplete) {
    onComplete()
  }
}

export function checkQuotient(dividend, divisor, quotientInputs, inputRefs, checkMessage) {
  const correctQuotient = String(Math.floor(Number(dividend) / Number(divisor)))
  const userQuotient = quotientInputs.join('')
  
  if (userQuotient.length === correctQuotient.length && userQuotient === correctQuotient) {
    const childName = localStorage.getItem('childName'); const message = childName ? `🥳 Умничка, ${childName}! Частное введено верно!` : '🥳 Частное введено верно!'; checkMessage.textContent = message;
    checkMessage.className = 'text-xl font-bold text-center min-h-[2rem] text-green-600'
    
    console.log('âœ… Ð§Ð°ÑÑ‚Ð½Ð¾Ðµ Ð¿Ñ€Ð°Ð²Ð¸Ð»ÑŒÐ½Ð¾Ðµ!');
    console.log('window.confetti:', window.confetti);
    console.log('typeof window.confetti:', typeof window.confetti);
    
    // Confetti (Ñ‚Ð¾Ñ‡Ð½Ð¾ ÐºÐ°Ðº Ð² ÑƒÐ¼Ð½Ð¾Ð¶ÐµÐ½Ð¸Ð¸)
    if (window.confetti) {
      console.log('ðŸŽ‰ Ð—Ð°Ð¿ÑƒÑÐºÐ°ÑŽ ÐºÐ¾Ð½Ñ„ÐµÑ‚Ñ‚Ð¸!');
      // ÐŸÐµÑ€Ð²Ñ‹Ð¹ Ð·Ð°Ð»Ð¿
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { x: 0.5, y: 0.6 },
        colors: ['#FFD700', '#FF6347', '#00CED1', '#32CD32', '#FF69B4'],
        scalar: 1.5
      });
      
      // Ð’Ñ‚Ð¾Ñ€Ð¾Ð¹ Ð·Ð°Ð»Ð¿ (Ñ‡ÐµÑ€ÐµÐ· 300Ð¼Ñ)
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { x: 0.5, y: 0.6 },
          colors: ['#FFD700', '#FF6347', '#00CED1'],
          scalar: 1.5
        });
      }, 300);
      
      // Ð¢Ñ€ÐµÑ‚Ð¸Ð¹ Ð·Ð°Ð»Ð¿ (Ñ‡ÐµÑ€ÐµÐ· 600Ð¼Ñ)
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { x: 0.5, y: 0.6 },
          colors: ['#32CD32', '#FF69B4', '#FFD700'],
          scalar: 1.5
        });
      }, 600);
    } else {
      console.error('âŒ window.confetti ÐÐ• ÐÐÐ™Ð”Ð•Ð!');
    }
  } else {
    const childName = localStorage.getItem('childName'); const message = childName ? `Попробуй ещё раз, ${childName}! Проверь цифры частного.` : 'Пока неверно. Проверьте цифры частного.'; checkMessage.textContent = message;
    checkMessage.className = 'text-xl font-bold text-center min-h-[2rem] text-red-600'
    
    // ÐŸÐ¾Ð´ÑÐ²ÐµÑ‚ÐºÐ° Ð¾ÑˆÐ¸Ð±Ð¾Ñ‡Ð½Ñ‹Ñ… Ñ†Ð¸Ñ„Ñ€
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