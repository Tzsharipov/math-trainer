import './style.css';
import { generateNumber, hasZeroInside } from './division/divisionHelpers.js';
import { buildGrid } from './division/divisionGrid.js';
import { checkProduct, checkDifference, checkQuotient } from './division/divisionCheck.js';
import { updateHighlights, updateHighlightsForStep } from './division/divisionHighlights.js';

console.log('DIVISION.JS LOADED v4 (полный порт из Laravel)');

// DOM элементы
const workspace = document.querySelector('#workspace');
const mathGrid = document.querySelector('#mathGrid');
const checkHints = document.querySelector('#checkHints');
const btnGen = document.querySelector('#btnGen');
const btnStartMan = document.querySelector('#btnStartMan');
const selectDividend = document.querySelector('#selectDividend');
const selectDivisor = document.querySelector('#selectDivisor');
const inDividend = document.querySelector('#inDividend');
const inDivisor = document.querySelector('#inDivisor');
const uiAuto = document.querySelector('#ui-auto');
const uiManual = document.querySelector('#ui-manual');
const checkMessage = document.querySelector('#checkMessage');
const btnClearAll = document.querySelector('#btnClearAll');
const settingsPanel = document.querySelector('#settingsPanel');
const btnNewExample = document.querySelector('#btnNewExample');

// Глобальное состояние
let dividend = 0;
let divisor = 0;
let quotientInputs = [];
let steps = [];
let stepsData = [];
let inputRefs = {};
let focusedRow = { step: null, type: null };
let hintsEnabled = false;
let mode = 'auto';

// Переключение режимов
document.querySelectorAll('input[name="mode"]').forEach(radio => {
  radio.onchange = (e) => {
    mode = e.target.value;
    uiAuto.classList.toggle('hidden', mode !== 'auto');
    uiManual.classList.toggle('hidden', mode !== 'manual');
  };
});

// Генерация примера
btnGen.onclick = () => {
  if (mode === 'manual') {
    const num1 = parseInt(inDividend.value);
    const num2 = parseInt(inDivisor.value);
    
    if (!num1 || !num2 || num1 < 100 || num2 < 10) {
      alert('Введите корректные числа (делимое минимум 3-значное, делитель минимум 2-значное)');
      return;
    }
    if (num1 <= num2) {
      alert('Делимое должно быть больше делителя');
      return;
    }
    if (num1 % num2 !== 0) {
      alert('Делимое должно делиться на делитель без остатка');
      return;
    }
    
    dividend = num1;
    divisor = num2;
  } else {
    const dividendDigits = parseInt(selectDividend.value);
    const divisorDigits = parseInt(selectDivisor.value);
    
    let attempts = 0;
    let validExample = false;
    
    while (!validExample && attempts < 100) {
      attempts++;
      
      divisor = generateNumber(divisorDigits);
      const quotientDigitsCount = dividendDigits - divisorDigits + 1;
      const q = generateNumber(quotientDigitsCount);
      dividend = q * divisor;
      
      if (String(dividend).length !== dividendDigits) continue;
      if (hasZeroInside(dividend) || hasZeroInside(divisor)) continue;
      if (String(q).includes('0')) continue;
      
      validExample = true;
    }
    
    if (!validExample) {
      divisor = generateNumber(divisorDigits);
      const quotientDigitsCount = dividendDigits - divisorDigits + 1;
      const q = generateNumber(quotientDigitsCount);
      dividend = q * divisor;
    }
  }
  
  buildGridWrapper();
};

btnStartMan.onclick = btnGen.onclick;

// Очистить всё
btnClearAll.onclick = () => {
  if (dividend && divisor) {
    quotientInputs.fill('');
    steps.forEach(s => {
      s.productInput.fill('');
      s.differenceInput.fill('');
      s.productStatus = null;
      s.differenceStatus = null;
    });
    checkMessage.textContent = '';
    hintsEnabled = false;
    checkHints.checked = false;
    focusedRow = { step: null, type: null };
    
    for (const k in inputRefs) {
      const el = inputRefs[k];
      if (el) el.style.backgroundColor = '';
    }
    
    setTimeout(() => inputRefs['q:0']?.focus(), 0);
  }
};

// Новый пример
btnNewExample.onclick = () => {
  workspace.classList.add('hidden');
  workspace.classList.remove('flex');
  settingsPanel.classList.remove('hidden');
  mathGrid.innerHTML = '';
  checkMessage.textContent = '';
};

// Включение подсказок
checkHints.onchange = () => {
  hintsEnabled = checkHints.checked;
  if (hintsEnabled) {
    setTimeout(() => {
      inputRefs['q:0']?.focus();
      focusedRow = { step: null, type: null };
      const dividendDigitsArray = String(dividend).split('').map(Number);
      updateHighlights(focusedRow, inputRefs, stepsData, dividendDigitsArray, hintsEnabled);
    }, 0);
  }
};

function buildGridWrapper() {
  buildGrid(dividend, divisor, settingsPanel, workspace, mathGrid, checkMessage, steps, stepsData, inputRefs, focusedRow, quotientInputs, setupLogic);
}

function setupLogic() {
  const dividendDigitsArray = String(dividend).split('').map(Number);
  
  // Частное
  document.querySelectorAll('.quotient-input').forEach(input => {
    const index = parseInt(input.dataset.quotientIndex);
    inputRefs[`q:${index}`] = input;
    
    input.oninput = (e) => handleQuotientInput(e, index);
    input.onkeydown = (e) => handleQuotientKey(e, index);
    input.onfocus = () => {
      focusedRow = { step: null, type: null };
      updateHighlights(focusedRow, inputRefs, stepsData, dividendDigitsArray, hintsEnabled);
    };
  });
  
  // Шаги
  document.querySelectorAll('.step-input').forEach(input => {
    const step = parseInt(input.dataset.step);
    const type = input.dataset.type;
    const col = parseInt(input.dataset.col);
    
    inputRefs[`${step}:${type}:${col}`] = input;
    
    input.oninput = (e) => handleStepInput(e, step, type, col);
    input.onkeydown = (e) => handleStepKey(e, step, type, col);
    input.onfocus = () => {
      focusedRow = { step, type };
      updateHighlights(focusedRow, inputRefs, stepsData, dividendDigitsArray, hintsEnabled);
    };
  });
  
  updateHighlightsForStep(0, inputRefs, stepsData, dividendDigitsArray, hintsEnabled);
}

function handleQuotientInput(e, index) {
  const value = e.target.value;
  quotientInputs[index] = value;
  
  if (!value) return;
  
  const correctQuotient = String(Math.floor(dividend / divisor));
  const correctDigit = correctQuotient[index];
  
  e.target.style.backgroundColor = '';
  
  if (value === correctDigit) {
    if (hintsEnabled) e.target.style.backgroundColor = '#86efac';
    
    const stepIndex = stepsData.findIndex(s => s.quotientIndex === index);
    if (stepIndex >= 0) {
      const stepData = stepsData[stepIndex];
      const partialDividendLen = String(stepData.partialDividend).length;
      const offset = stepData.offset;
      const rightmostCol = offset + partialDividendLen - 1;
      
      setTimeout(() => {
        inputRefs[`${stepIndex}:product:${rightmostCol}`]?.focus();
        focusedRow = { step: stepIndex, type: 'product' };
      }, 0);
    }
  } else {
    e.target.style.backgroundColor = '#ff9a9a';
  }
}

function handleStepInput(e, step, type, col) {
  const value = e.target.value;
  steps[step][type + 'Input'][col] = value;
  
  if (!value) return;
  
  const stepData = stepsData[step];
  const filledCount = steps[step][type + 'Input'].filter(d => d !== '').length;
  const dividendDigitsArray = String(dividend).split('').map(Number);
  
  if (type === 'product') {
    const expectedProduct = stepData.quotientDigit * divisor;
    const expectedLen = String(expectedProduct).length;
    
    if (filledCount < expectedLen) {
      if (col - 1 >= 0) {
        setTimeout(() => inputRefs[`${step}:product:${col - 1}`]?.focus(), 0);
      }
    } else if (filledCount === expectedLen) {
      setTimeout(() => {
        checkProduct(step, steps, stepsData, quotientInputs, inputRefs, hintsEnabled, { value: null }, checkMessage);
        
        const offset = stepData.offset;
        const partialLen = String(stepData.partialDividend).length;
        const targetCol = offset + partialLen - 1;
        
        inputRefs[`${step}:difference:${targetCol}`]?.focus();
        focusedRow = { step, type: 'difference' };
        updateHighlights(focusedRow, inputRefs, stepsData, dividendDigitsArray, hintsEnabled);
      }, 0);
    }
  } else if (type === 'difference') {
    const diffOnlyLen = stepData.remainder ? String(stepData.remainder).length : 1;
    
    if (filledCount < diffOnlyLen) {
      if (col - 1 >= 0) {
        setTimeout(() => inputRefs[`${step}:difference:${col - 1}`]?.focus(), 0);
      }
    } else if (filledCount === diffOnlyLen) {
      const partialDividend = stepData.partialDividend ? stepData.partialDividend.toString() : '';
      const offset = stepData.offset || 0;
      const targetColForCarry = offset + partialDividend.length;
      
      if (targetColForCarry < dividendDigitsArray.length) {
        setTimeout(() => inputRefs[`${step}:difference:${targetColForCarry}`]?.focus(), 0);
      }
    } else {
      setTimeout(() => {
        checkDifference(step, steps, stepsData, inputRefs, hintsEnabled, () => {
          checkQuotient(dividend, divisor, quotientInputs, inputRefs, checkMessage);
        });
        
        const nextQuotientIndex = step + 1;
        if (nextQuotientIndex < quotientInputs.length) {
          inputRefs[`q:${nextQuotientIndex}`]?.focus();
          focusedRow = { step: null, type: null };
          updateHighlights(focusedRow, inputRefs, stepsData, dividendDigitsArray, hintsEnabled);
        }
      }, 0);
    }
  }
}

function handleQuotientKey(e, index) {
  if (e.key === 'ArrowRight' && index + 1 < quotientInputs.length) {
    e.preventDefault();
    inputRefs[`q:${index + 1}`]?.focus();
  } else if (e.key === 'ArrowLeft' && index > 0) {
    e.preventDefault();
    inputRefs[`q:${index - 1}`]?.focus();
  }
}

function handleStepKey(e, step, type, col) {
  const dividendDigitsArray = String(dividend).split('').map(Number);
  const totalCols = dividendDigitsArray.length;
  
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    if (col + 1 < totalCols) inputRefs[`${step}:${type}:${col + 1}`]?.focus();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    if (col > 0) inputRefs[`${step}:${type}:${col - 1}`]?.focus();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    
    if (type === 'difference') {
      const targetCol = Math.min(col, steps[step].productInput.length - 1);
      inputRefs[`${step}:product:${targetCol}`]?.focus();
      focusedRow = { step, type: 'product' };
    } else if (type === 'product') {
      if (step > 0) {
        const prevStep = step - 1;
        const targetCol = Math.min(col, steps[prevStep].differenceInput.length - 1);
        inputRefs[`${prevStep}:difference:${targetCol}`]?.focus();
        focusedRow = { step: prevStep, type: 'difference' };
      } else {
        const qIndex = Math.min(col, quotientInputs.length - 1);
        inputRefs[`q:${qIndex}`]?.focus();
        focusedRow = { step: null, type: null };
      }
    }
    updateHighlights(focusedRow, inputRefs, stepsData, dividendDigitsArray, hintsEnabled);
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    
    if (type === 'product') {
      checkProduct(step, steps, stepsData, quotientInputs, inputRefs, hintsEnabled, { value: null }, checkMessage);
      
      const stepData = stepsData[step];
      const partialDividend = String(stepData.partialDividend);
      const differenceArrayLength = steps[step].differenceInput.length;
      const offset = stepData.offset;
      const colToFocus = offset + partialDividend.length - 1;
      
      if (colToFocus >= 0 && colToFocus < differenceArrayLength) {
        inputRefs[`${step}:difference:${colToFocus}`]?.focus();
      } else {
        inputRefs[`${step}:difference:${differenceArrayLength - 1}`]?.focus();
      }
      focusedRow = { step, type: 'difference' };
    } else if (type === 'difference') {
      checkDifference(step, steps, stepsData, inputRefs, hintsEnabled, () => {
        checkQuotient(dividend, divisor, quotientInputs, inputRefs, checkMessage);
      });
      
      if (step + 1 < steps.length) {
        const nextStepIndex = step + 1;
        const nextStepData = stepsData[nextStepIndex];
        const offset = nextStepData ? nextStepData.offset : 0;
        const partialLen = nextStepData ? String(nextStepData.partialDividend).length : 1;
        const colToFocus = offset + partialLen - 1;
        
        if (colToFocus >= 0) {
          inputRefs[`${nextStepIndex}:product:${colToFocus}`]?.focus();
          focusedRow = { step: nextStepIndex, type: 'product' };
        }
      } else {
        checkQuotient(dividend, divisor, quotientInputs, inputRefs, checkMessage);
      }
    }
    updateHighlights(focusedRow, inputRefs, stepsData, dividendDigitsArray, hintsEnabled);
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault();
    steps[step][type + 'Input'][col] = '';
    e.target.value = '';
  }
}

document.body.classList.add('loaded');