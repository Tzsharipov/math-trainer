// Управление текстовыми подсказками для ребёнка

export function updateHintMessage(focusedRow, stepsData, dividend, divisor, hintsEnabled) {
  const sideHint = document.getElementById('sideHint');
  const sideHintText = document.getElementById('sideHintText');
  
  if (!hintsEnabled) {
    if (sideHint) sideHint.style.visibility = 'hidden';
    return;
  }
  
  let text = '';
  let useHTML = false;
  
  if (focusedRow.step === null) {
    const quotientIndex = focusedRow.quotientIndex || 0;
    const stepData = stepsData.find(s => s.quotientIndex === quotientIndex);
    
    if (stepData) {
      const partialDividend = stepData.partialDividend;
      const answer = stepData.quotientDigit;
      text = `Введи цифру частного: ${partialDividend} ÷ ${divisor} = <span class="cell-pulse-yellow" style="display:inline-block;padding:1px 6px;border-radius:6px;background:#fde047;color:#c6654af2;">${answer}</span>`;
      useHTML = true;
    } else {
      text = `Введи первую цифру частного`;
    }
  } else {
    const stepIndex = focusedRow.step;
    const stepData = stepsData[stepIndex];
    
    if (!stepData) {
      if (sideHint) sideHint.style.visibility = 'hidden';
      return;
    }
    
    if (focusedRow.type === 'product') {
      const quotientDigit = stepData.quotientDigit;
      const product = stepData.product;
      text = `Умножь ${quotientDigit} × ${divisor} = ${product}`;
    } else if (focusedRow.type === 'difference') {
      const partialDividend = stepData.partialDividend;
      const product = stepData.product;
      const remainder = stepData.remainder;
      
      if (stepIndex === stepsData.length - 1) {
        text = `Вычти ${partialDividend} − ${product} = ${remainder}`;
      } else {
        const nextStepData = stepsData[stepIndex + 1];
        const nextPartial = nextStepData ? nextStepData.partialDividend : remainder;
        text = `Вычти ${partialDividend} − ${product}, сноси цифру = ${nextPartial}`;
      }
    }
  }
  
  if (sideHintText) {
    if (useHTML) {
      sideHintText.innerHTML = text;
    } else {
      sideHintText.textContent = text;
    }
  }
  if (sideHint) sideHint.style.visibility = text ? 'visible' : 'hidden';
}

export function clearHintMessage() {
  const sideHint = document.getElementById('sideHint');
  if (sideHint) sideHint.style.visibility = 'hidden';
}

export function showSuccessHint() {
  // Не показываем — поздравление теперь в checkMessage
}