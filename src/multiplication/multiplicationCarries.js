// Работа с переносами при умножении

export function updateCarryForMultiply(rowIndex, colIndex, totalCols, currentA, currentB, carries) {
  const input = document.querySelector(`.math-input[data-row="${rowIndex}"][data-col="${colIndex}"]`);
  if (!input) return;
  
  const enteredDigit = parseInt(input.value);
  if (isNaN(enteredDigit)) return;
  
  const shift = parseInt(input.dataset.shift);
  const sA = currentA.toString();
  const sB = currentB.toString();
  const multiplierDigit = parseInt(sB.split('').reverse()[rowIndex]);
  
  const multiplicandDigits = sA.split('').map(Number).reverse();
  const multiplicandIndex = totalCols - 1 - colIndex - shift;
  
  if (multiplicandIndex < 0 || multiplicandIndex >= multiplicandDigits.length) return;
  
  const multiplicandDigit = multiplicandDigits[multiplicandIndex];
  const prevCarry = carries[colIndex] || 0;
  const product = multiplicandDigit * multiplierDigit + prevCarry;
  const carry = Math.floor(product / 10);
  
  if (carry > 0) {
    carries[colIndex - 1] = carry;
    const carryInput = document.querySelector(`[data-carry="${colIndex - 1}"]`);
    if (carryInput) carryInput.value = carry;
  }
}

export function updateCarryForSum(colIndex, currentB, carries) {
  let sum = 0;
  
  const sB = currentB.toString();
  sB.split('').reverse().forEach((_, rowIdx) => {
    const rowInputs = Array.from(document.querySelectorAll(`.math-input[data-row="${rowIdx}"]`));
    const input = rowInputs.find(inp => parseInt(inp.dataset.col) === colIndex);
    
    if (input && input.dataset.correct) {
      const digit = parseInt(input.dataset.correct);
      if (!isNaN(digit)) sum += digit;
    }
  });
  
  const prevCarry = carries[colIndex] || 0;
  sum += prevCarry;
  const carry = Math.floor(sum / 10);
  
  if (carry > 0) {
    carries[colIndex - 1] = carry;
    const carryInput = document.querySelector(`[data-carry="${colIndex - 1}"]`);
    if (carryInput) carryInput.value = carry;
  }
}
