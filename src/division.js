import './style.css';
import { generateNumber, hasZeroInside } from './division/divisionHelpers.js';
import { buildGrid } from './division/divisionGrid.js';
import { checkProduct, checkDifference, checkQuotient } from './division/divisionCheck.js';
import { updateHighlights, updateHighlightsForStep } from './division/divisionHighlights.js';
import { updateHintMessage, clearHintMessage } from './division/divisionHints.js';

console.log('DIVISION.JS LOADED v4 (Ð¿Ð¾Ð»Ð½Ñ‹Ð¹ Ð¿Ð¾Ñ€Ñ‚ Ð¸Ð· Laravel)');

// DOM ÑÐ»ÐµÐ¼ÐµÐ½Ñ‚Ñ‹
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
const btnBackToSettings = document.querySelector('#btnBackToSettings');

// Ð“Ð»Ð¾Ð±Ð°Ð»ÑŒÐ½Ð¾Ðµ ÑÐ¾ÑÑ‚Ð¾ÑÐ½Ð¸Ðµ
let dividend = 0;
let divisor = 0;
let quotientInputs = [];
let steps = [];
let stepsData = [];
let inputRefs = {};
let focusedRow = { step: null, type: null };
let hintsEnabled = false;
let solved = false;
let mode = 'auto';

// ÐŸÐµÑ€ÐµÐºÐ»ÑŽÑ‡ÐµÐ½Ð¸Ðµ Ñ€ÐµÐ¶Ð¸Ð¼Ð¾Ð²
document.querySelectorAll('input[name="mode"]').forEach(radio => {
  radio.onchange = (e) => {
    mode = e.target.value;
    uiAuto.classList.toggle('hidden', mode !== 'auto');
    uiManual.classList.toggle('hidden', mode !== 'manual');
  };
});

// Ð“ÐµÐ½ÐµÑ€Ð°Ñ†Ð¸Ñ Ð¿Ñ€Ð¸Ð¼ÐµÑ€Ð°
btnGen.onclick = () => {
  if (mode === 'manual') {
    const num1 = parseInt(inDividend.value);
    const num2 = parseInt(inDivisor.value);
    
    if (!num1 || !num2 || num1 < 100 || num2 < 10) {
      alert('Ð’Ð²ÐµÐ´Ð¸Ñ‚Ðµ ÐºÐ¾Ñ€Ñ€ÐµÐºÑ‚Ð½Ñ‹Ðµ Ñ‡Ð¸ÑÐ»Ð° (Ð´ÐµÐ»Ð¸Ð¼Ð¾Ðµ Ð¼Ð¸Ð½Ð¸Ð¼ÑƒÐ¼ 3-Ð·Ð½Ð°Ñ‡Ð½Ð¾Ðµ, Ð´ÐµÐ»Ð¸Ñ‚ÐµÐ»ÑŒ Ð¼Ð¸Ð½Ð¸Ð¼ÑƒÐ¼ 2-Ð·Ð½Ð°Ñ‡Ð½Ð¾Ðµ)');
      return;
    }
    if (num1 <= num2) {
      alert('Ð”ÐµÐ»Ð¸Ð¼Ð¾Ðµ Ð´Ð¾Ð»Ð¶Ð½Ð¾ Ð±Ñ‹Ñ‚ÑŒ Ð±Ð¾Ð»ÑŒÑˆÐµ Ð´ÐµÐ»Ð¸Ñ‚ÐµÐ»Ñ');
      return;
    }
    if (num1 % num2 !== 0) {
      alert('Ð”ÐµÐ»Ð¸Ð¼Ð¾Ðµ Ð´Ð¾Ð»Ð¶Ð½Ð¾ Ð´ÐµÐ»Ð¸Ñ‚ÑŒÑÑ Ð½Ð° Ð´ÐµÐ»Ð¸Ñ‚ÐµÐ»ÑŒ Ð±ÐµÐ· Ð¾ÑÑ‚Ð°Ñ‚ÐºÐ°');
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

// ÐžÑ‡Ð¸ÑÑ‚Ð¸Ñ‚ÑŒ Ð²ÑÑ‘
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
  solved = false;
    hintsEnabled = false;
    checkHints.checked = false;
    focusedRow = { step: null, type: null };
    
    // ÐžÑ‡Ð¸Ñ‰Ð°ÐµÐ¼ Ð²Ð¸Ð·ÑƒÐ°Ð»ÑŒÐ½Ð¾ Ð²ÑÐµ Ð¸Ð½Ð¿ÑƒÑ‚Ñ‹
    for (const k in inputRefs) {
      const el = inputRefs[k];
      if (el) {
        el.value = ''; // ÐžÑ‡Ð¸Ñ‰Ð°ÐµÐ¼ Ð·Ð½Ð°Ñ‡ÐµÐ½Ð¸Ðµ Ð² HTML
        el.style.backgroundColor = ''; // Ð£Ð±Ð¸Ñ€Ð°ÐµÐ¼ Ð¿Ð¾Ð´ÑÐ²ÐµÑ‚ÐºÑƒ
      }
    }
    
    setTimeout(() => inputRefs['q:0']?.focus(), 0);
  }
};

// ÐÐ¾Ð²Ñ‹Ð¹ Ð¿Ñ€Ð¸Ð¼ÐµÑ€
// Новый пример (генерирует с теми же разрядностями)
btnNewExample.onclick = () => {
  if (dividend && divisor) {
    if (mode === 'manual') {
      // В ручном режиме генерируем с той же разрядностью
      const dividendDigits = String(dividend).length;
      const divisorDigits = String(divisor).length;
      
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
    } else {
      // В автоматическом режиме - генерируем с текущими настройками
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
  }
};

// Назад к настройкам
btnBackToSettings.onclick = () => {
  workspace.classList.add('hidden');
  workspace.classList.remove('flex');
  settingsPanel.classList.remove('hidden');
  mathGrid.innerHTML = '';
  checkMessage.textContent = '';
};


// Ð’ÐºÐ»ÑŽÑ‡ÐµÐ½Ð¸Ðµ Ð¿Ð¾Ð´ÑÐºÐ°Ð·Ð¾Ðº
checkHints.onchange = () => {
  hintsEnabled = checkHints.checked;
  const dividendDigitsArray = String(dividend).split('').map(Number);
  
  const bc = document.getElementById('beigeContainer');
  const sh = document.getElementById('sideHint');
  const cm = document.getElementById('checkMessage');
  
  if (hintsEnabled) {
    if (bc) { bc.style.background = 'linear-gradient(135deg, #f5e6ca, #eedcbf)'; bc.style.padding = ''; bc.style.borderRadius = ''; bc.style.boxShadow = ''; }
    if (sh) sh.style.display = '';
    if (cm) cm.style.display = '';
    setTimeout(() => {
      inputRefs['q:0']?.focus();
      focusedRow = { step: null, type: null, quotientIndex: 0 };
      if (!solved) updateHighlights(focusedRow, inputRefs, stepsData, dividendDigitsArray, hintsEnabled);
      updateHintMessage(focusedRow, stepsData, dividend, divisor, hintsEnabled);
    }, 0);
  } else {
    if (bc) { bc.style.background = 'none'; bc.style.padding = '0'; bc.style.borderRadius = '0'; bc.style.boxShadow = 'none'; }
    if (sh) sh.style.display = 'none';
    if (cm) cm.style.display = 'none';
    // ÐŸÑ€Ð¸ Ð²Ñ‹ÐºÐ»ÑŽÑ‡ÐµÐ½Ð¸Ð¸ Ð¿Ð¾Ð´ÑÐºÐ°Ð·Ð¾Ðº - ÑƒÐ±Ð¸Ñ€Ð°ÐµÐ¼ Ð³Ð¾Ð»ÑƒÐ±ÑƒÑŽ/Ð¶Ñ‘Ð»Ñ‚ÑƒÑŽ Ð¿Ð¾Ð´ÑÐ²ÐµÑ‚ÐºÑƒ Ð¸ Ñ‚ÐµÐºÑÑ‚ Ð¿Ð¾Ð´ÑÐºÐ°Ð·ÐºÐ¸
    clearHintMessage();
    for (const k in inputRefs) {
      const el = inputRefs[k];
      if (el) {
        const bg = el.style.backgroundColor;
        // Ð£Ð±Ð¸Ñ€Ð°ÐµÐ¼ Ñ‚Ð¾Ð»ÑŒÐºÐ¾ Ð³Ð¾Ð»ÑƒÐ±ÑƒÑŽ Ð¸ Ð¶Ñ‘Ð»Ñ‚ÑƒÑŽ Ð¿Ð¾Ð´ÑÐ²ÐµÑ‚ÐºÑƒ (Ð¿Ð¾Ð´ÑÐºÐ°Ð·ÐºÐ¸)
        // ÐÐ• Ñ‚Ñ€Ð¾Ð³Ð°ÐµÐ¼ Ð·ÐµÐ»Ñ‘Ð½ÑƒÑŽ Ð¸ ÐºÑ€Ð°ÑÐ½ÑƒÑŽ (Ñ€ÐµÐ·ÑƒÐ»ÑŒÑ‚Ð°Ñ‚Ñ‹ Ð¿Ñ€Ð¾Ð²ÐµÑ€ÐºÐ¸)
        if (bg === 'rgb(68, 214, 232)' || bg === 'rgb(255, 245, 157)') {
          el.style.backgroundColor = '';
        }
      }
    }
  }
};

function buildGridWrapper() {
  buildGrid(dividend, divisor, settingsPanel, workspace, mathGrid, checkMessage, steps, stepsData, inputRefs, focusedRow, quotientInputs, setupLogic);
  const bc = document.getElementById('beigeContainer');
  const sh = document.getElementById('sideHint');
  const cm = document.getElementById('checkMessage');
  if (checkHints.checked) {
    if (bc) { bc.style.background = 'linear-gradient(135deg, #f5e6ca, #eedcbf)'; bc.style.padding = ''; bc.style.borderRadius = ''; bc.style.boxShadow = ''; }
    if (sh) sh.style.display = '';
    if (cm) cm.style.display = '';
  } else {
    if (bc) { bc.style.background = 'none'; bc.style.padding = '0'; bc.style.borderRadius = '0'; bc.style.boxShadow = 'none'; }
    if (sh) sh.style.display = 'none';
    if (cm) cm.style.display = 'none';
  }
}

function setupLogic() {
  const dividendDigitsArray = String(dividend).split('').map(Number);
  
  // Ð¡Ð¸Ð½Ñ…Ñ€Ð¾Ð½Ð¸Ð·Ð¸Ñ€ÑƒÐµÐ¼ hintsEnabled Ñ Ñ€ÐµÐ°Ð»ÑŒÐ½Ñ‹Ð¼ ÑÐ¾ÑÑ‚Ð¾ÑÐ½Ð¸ÐµÐ¼ Ñ‡ÐµÐºÐ±Ð¾ÐºÑÐ°
  hintsEnabled = checkHints.checked;
  
  // Ð§Ð°ÑÑ‚Ð½Ð¾Ðµ
  document.querySelectorAll('.quotient-input').forEach(input => {
    const index = parseInt(input.dataset.quotientIndex);
    inputRefs[`q:${index}`] = input;
    
    input.oninput = (e) => handleQuotientInput(e, index);
    input.onkeydown = (e) => handleQuotientKey(e, index);
    input.onfocus = () => {
      focusedRow = { step: null, type: null, quotientIndex: index };
      if (!solved) updateHighlights(focusedRow, inputRefs, stepsData, dividendDigitsArray, hintsEnabled);
      updateHintMessage(focusedRow, stepsData, dividend, divisor, hintsEnabled);
    };
  });
  
  // Ð¨Ð°Ð³Ð¸
  document.querySelectorAll('.step-input').forEach(input => {
    const step = parseInt(input.dataset.step);
    const type = input.dataset.type;
    const col = parseInt(input.dataset.col);
    
    inputRefs[`${step}:${type}:${col}`] = input;
    
    input.oninput = (e) => handleStepInput(e, step, type, col);
    input.onkeydown = (e) => handleStepKey(e, step, type, col);
    input.onfocus = () => {
      focusedRow = { step, type };
      if (!solved) updateHighlights(focusedRow, inputRefs, stepsData, dividendDigitsArray, hintsEnabled);
      updateHintMessage(focusedRow, stepsData, dividend, divisor, hintsEnabled);
    };
  });
  
  // Ð’Ñ‹Ð·Ñ‹Ð²Ð°ÐµÐ¼ Ð½Ð°Ñ‡Ð°Ð»ÑŒÐ½ÑƒÑŽ Ð¿Ð¾Ð´ÑÐ²ÐµÑ‚ÐºÑƒ Ð¢ÐžÐ›Ð¬ÐšÐž ÐµÑÐ»Ð¸ Ð¿Ð¾Ð´ÑÐºÐ°Ð·ÐºÐ¸ Ð²ÐºÐ»ÑŽÑ‡ÐµÐ½Ñ‹
  if (hintsEnabled) {
    updateHighlightsForStep(0, inputRefs, stepsData, dividendDigitsArray, hintsEnabled);
    updateHintMessage({ step: null, type: null, quotientIndex: 0 }, stepsData, dividend, divisor, hintsEnabled);
  }
}

function handleQuotientInput(e, index) {
  const value = e.target.value;
  quotientInputs[index] = value;
  
  if (!value) return;
  
  const correctQuotient = String(Math.floor(dividend / divisor));
  const correctDigit = correctQuotient[index];
  
  e.target.style.backgroundColor = '';
  
  if (value === correctDigit) {
    // Ð—ÐµÐ»Ñ‘Ð½Ñ‹Ð¹ Ñ„Ð¾Ð½ Ð’Ð¡Ð•Ð“Ð”Ð Ð¿Ñ€Ð¸ Ð¿Ñ€Ð°Ð²Ð¸Ð»ÑŒÐ½Ð¾Ð¼ Ð¾Ñ‚Ð²ÐµÑ‚Ðµ
    e.target.style.backgroundColor = '#86efac';
    
    const stepIndex = stepsData.findIndex(s => s.quotientIndex === index);
    if (stepIndex >= 0) {
      const stepData = stepsData[stepIndex];
      const partialDividendLen = String(stepData.partialDividend).length;
      const offset = stepData.offset;
      const rightmostCol = offset + partialDividendLen - 1;
      
      setTimeout(() => {
        inputRefs[`${stepIndex}:product:${rightmostCol}`]?.focus();
        focusedRow = { step: stepIndex, type: 'product' };
        const dividendDigitsArray = String(dividend).split('').map(Number);
        updateHintMessage(focusedRow, stepsData, dividend, divisor, hintsEnabled);
      }, 0);
    }
  } else {
    e.target.style.backgroundColor = '#ff9a9a';
  }
}

function handleStepInput(e, step, type, col) {
  const value = e.target.value;
  steps[step][type + 'Input'][col] = value;

  // Мгновенная подсветка каждой цифры по data-correct
  e.target.classList.remove('cell-pulse-yellow', 'cell-pulse-orange');
  const correct = e.target.dataset.correct;
  if (value && correct) {
    e.target.style.backgroundColor = value === correct ? '#86efac' : '#ff9a9a';
  } else {
    e.target.style.backgroundColor = '';
  }

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
        checkProduct(step, steps, stepsData, quotientInputs, inputRefs, hintsEnabled, { value: null }, checkMessage, () => { solved = true; });
        
        if (hintsEnabled && step === stepsData.length - 1) return;
        
        const offset = stepData.offset;
        const partialLen = String(stepData.partialDividend).length;
        const targetCol = offset + partialLen - 1;
        
        inputRefs[`${step}:difference:${targetCol}`]?.focus();
        focusedRow = { step, type: 'difference' };
        updateHighlights(focusedRow, inputRefs, stepsData, dividendDigitsArray, hintsEnabled);
        updateHintMessage(focusedRow, stepsData, dividend, divisor, hintsEnabled);
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
          focusedRow = { step: null, type: null, quotientIndex: nextQuotientIndex };
          if (!solved) updateHighlights(focusedRow, inputRefs, stepsData, dividendDigitsArray, hintsEnabled);
          updateHintMessage(focusedRow, stepsData, dividend, divisor, hintsEnabled);
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
        focusedRow = { step: null, type: null, quotientIndex: qIndex };
      }
    }
    if (!solved) updateHighlights(focusedRow, inputRefs, stepsData, dividendDigitsArray, hintsEnabled);
    updateHintMessage(focusedRow, stepsData, dividend, divisor, hintsEnabled);
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    
    if (type === 'product') {
      checkProduct(step, steps, stepsData, quotientInputs, inputRefs, hintsEnabled, { value: null }, checkMessage, () => { solved = true; });
      
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
    if (!solved) updateHighlights(focusedRow, inputRefs, stepsData, dividendDigitsArray, hintsEnabled);
    updateHintMessage(focusedRow, stepsData, dividend, divisor, hintsEnabled);
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault();
    steps[step][type + 'Input'][col] = '';
    e.target.value = '';
  }
}

document.body.classList.add('loaded');