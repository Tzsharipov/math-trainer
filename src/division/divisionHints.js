// Управление текстовыми подсказками для ребёнка

export function updateHintMessage(focusedRow, stepsData, dividend, divisor, hintsEnabled) {
  const hintEl = document.getElementById('hintMessage');
  if (!hintEl) return;
  
  // Если подсказки выключены - очищаем
  if (!hintsEnabled) {
    hintEl.textContent = '';
    return;
  }
  
  // Если фокус на частном (focusedRow.step === null)
  if (focusedRow.step === null) {
    const quotientIndex = focusedRow.quotientIndex || 0;
    const stepData = stepsData.find(s => s.quotientIndex === quotientIndex);
    
    if (stepData) {
      const partialDividend = stepData.partialDividend;
      hintEl.textContent = `💡 Введи цифру частного (${partialDividend} ÷ ${divisor} = ?)`;
    } else {
      hintEl.textContent = `💡 Введи первую цифру частного`;
    }
    return;
  }
  
  // Если фокус на шагах
  const stepIndex = focusedRow.step;
  const stepData = stepsData[stepIndex];
  
  if (!stepData) {
    hintEl.textContent = '';
    return;
  }
  
  if (focusedRow.type === 'product') {
    // Подсказка для произведения
    const quotientDigit = stepData.quotientDigit;
    const product = stepData.product;
    hintEl.textContent = `🧮 Умножь ${quotientDigit} × ${divisor} = ${product}`;
  } else if (focusedRow.type === 'difference') {
    // Подсказка для разности
    const partialDividend = stepData.partialDividend;
    const product = stepData.product;
    const remainder = stepData.remainder;
    
    if (stepIndex === stepsData.length - 1) {
      // Последний шаг
      hintEl.textContent = `➖ Вычти ${partialDividend} − ${product} = ${remainder}`;
    } else {
      // Промежуточный шаг
      const nextStepData = stepsData[stepIndex + 1];
      const nextPartial = nextStepData ? nextStepData.partialDividend : remainder;
      hintEl.textContent = `➖ Вычти ${partialDividend} − ${product}, сноси цифру = ${nextPartial}`;
    }
  }
}

export function clearHintMessage() {
  const hintEl = document.getElementById('hintMessage');
  if (hintEl) hintEl.textContent = '';
}

export function showSuccessHint() {
  const hintEl = document.getElementById('hintMessage');
  if (hintEl) hintEl.textContent = '✨ Отлично! Продолжай дальше';
}