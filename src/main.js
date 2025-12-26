import './style.css';

console.log('MAIN.JS LOADED v10');

const workspace = document.querySelector('#workspace');
const mathGrid = document.querySelector('#mathGrid');
const checkHints = document.querySelector('#checkHints');
const btnGen = document.querySelector('#btnGen');
const btnStartMan = document.querySelector('#btnStartMan');
const selectA = document.querySelector('#selectA');
const selectB = document.querySelector('#selectB');
const inA = document.querySelector('#inA');
const inB = document.querySelector('#inB');
const uiAuto = document.querySelector('#ui-auto');
const uiManual = document.querySelector('#ui-manual');

let currentA = 0;
let currentB = 0;
let carries = {};

document.querySelectorAll('input[name="mode"]').forEach(radio => {
  radio.onchange = (e) => {
    uiAuto.classList.toggle('hidden', e.target.value !== 'auto');
    uiManual.classList.toggle('hidden', e.target.value !== 'manual');
  };
});

btnGen.onclick = () => {
  currentA = getRandom(parseInt(selectA.value));
  currentB = getRandom(parseInt(selectB.value));
  buildGrid(currentA, currentB);
};

btnStartMan.onclick = () => {
  const a = inA.value;
  const b = inB.value;
  if (a.length <= 7 && b.length <= 5 && a && b) {
    currentA = parseInt(a);
    currentB = parseInt(b);
    buildGrid(currentA, currentB);
  } else {
    alert("Проверь числа!");
  }
}

checkHints.onchange = () => {
  if (currentA && currentB) buildGrid(currentA, currentB);
};

function getRandom(digits) {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildGrid(valA, valB) {
  workspace.classList.remove('hidden');
  carries = {};
  
  const sA = valA.toString();
  const sB = valB.toString();
  const res = (valA * valB).toString();
  const digitsB = sB.split('').reverse();
  
  // Вычисляем количество колонок
  const totalCols = Math.max(sA.length + sB.length, res.length) + 1;
  
  let html = `<div class="bg-gray-100 border-2 border-gray-400 rounded-lg shadow p-4 grid gap-x-1 items-start" style="grid-template-columns: repeat(${totalCols}, 32px);">`;
  
  // 1. МНОЖИМОЕ (grid-row: 1)
  sA.split('').forEach((d, i) => {
    const col = totalCols - sA.length + i + 1;
    html += `<div style="grid-row: 1; grid-column: ${col}; margin-bottom: 4px;" class="w-8 h-8 bg-cyan-400 text-gray-900 rounded-md font-bold text-center flex items-center justify-center">${d}</div>`;
  });
  
  // 2. МНОЖИТЕЛЬ (grid-row: 2)
  const mulCol = totalCols - sB.length - 1;
  html += `<div style="grid-row: 2; grid-column: ${mulCol}; margin-bottom: 4px;" class="w-8 h-8 mr-2 text-gray-600 font-semibold flex items-center justify-center">×</div>`;
  sB.split('').forEach((d, i) => {
    const col = totalCols - sB.length + i + 1;
    html += `<div style="grid-row: 2; grid-column: ${col}; margin-bottom: 4px;" class="w-8 h-8 bg-gray-400 text-gray-900 rounded-md font-bold text-center flex items-center justify-center">${d}</div>`;
  });
  
  // 3. СТРОКА ПЕРЕНОСОВ (grid-row: 3) - ОДНА для всей сетки
  for (let i = 1; i <= totalCols; i++) {
    html += `<input type="text" maxlength="1" readonly style="grid-row: 3; grid-column: ${i};" class="w-8 h-6 text-center bg-gray-200 text-orange-600 font-bold text-sm outline-none rounded" placeholder="·" data-carry="${i - 1}">`;
  }
  
  // 4. НЕПОЛНЫЕ ПРОИЗВЕДЕНИЯ (grid-row: 4+)
  digitsB.forEach((digitB, rowIdx) => {
    const rowVal = valA * parseInt(digitB);
    const rowStr = (rowVal === 0) ? "0".repeat(sA.length) : rowVal.toString();
    const shift = rowIdx;
    const gridRow = rowIdx + 4;
    
    rowStr.split('').forEach((c, colIdx) => {
      const col = totalCols - rowStr.length - shift + colIdx + 1;
      html += `<input type="text" inputmode="numeric" maxlength="1" 
        data-correct="${c}" data-row="${rowIdx}" data-col="${col - 1}" data-shift="${shift}"
        style="grid-row: ${gridRow}; grid-column: ${col};"
        class="math-input w-8 h-8 text-center border-2 border-yellow-300 bg-yellow-200 rounded font-black text-base outline-none focus:border-blue-400 transition-all shadow-sm">`;
    });
  });
  
  // 5. РАЗДЕЛИТЕЛЬ (grid-row после неполных произведений)
  const separatorRow = digitsB.length + 4;
  html += `<div style="grid-row: ${separatorRow}; grid-column: 1 / span ${totalCols}; border-bottom: 2px solid #9ca3af; margin-top: 4px; margin-bottom: 4px;"></div>`;
  
  // 6. РЕЗУЛЬТАТ (grid-row после разделителя)
  const resultRow = separatorRow + 1;
  res.split('').forEach((c, colIdx) => {
    const col = totalCols - res.length + colIdx + 1;
    html += `<input type="text" inputmode="numeric" maxlength="1" 
      data-correct="${c}" data-row="99" data-col="${col - 1}"
      style="grid-row: ${resultRow}; grid-column: ${col};"
      class="math-input w-8 h-8 text-center border-2 border-blue-400 bg-blue-200 rounded font-black text-base outline-none shadow-sm focus:border-blue-500">`;
  });
  
  html += `</div>`;
  mathGrid.innerHTML = html;
  setupLogic(totalCols);
  
  const firstRow = Array.from(document.querySelectorAll('.math-input[data-row="0"]'));
  if (firstRow.length) firstRow[firstRow.length - 1].focus();
}

function setupLogic(totalCols) {
  const inputs = document.querySelectorAll('.math-input');
  
  inputs.forEach(el => {
    el.oninput = (e) => {
      const val = e.target.value;
      const correct = e.target.dataset.correct;
      const row = e.target.dataset.row;
      const col = parseInt(e.target.dataset.col);
      
      e.target.className = 'math-input w-8 h-8 text-center border-2 rounded font-black text-base outline-none transition-all shadow-sm';
      
      if (!val) {
        e.target.classList.add(row === "99" ? 'border-blue-400 bg-blue-200' : 'border-yellow-300 bg-yellow-200');
        return;
      }
      
      if (val === correct) {
        e.target.classList.add('bg-green-500', 'text-slate-900', 'border-green-600', 'font-black');
        
        if (checkHints.checked) {
          if (row !== "99") {
            updateCarryForMultiply(parseInt(row), col, totalCols);
          } else {
            updateCarryForSum(col);
          }
        }
        
        const rowInputs = Array.from(document.querySelectorAll(`.math-input[data-row="${row}"]`));
        const idx = rowInputs.indexOf(e.target);
        
        if (idx > 0) {
          rowInputs[idx - 1].focus();
        } else {
          // Очистка переносов
          document.querySelectorAll('[data-carry]').forEach(c => c.value = '');
          carries = {};
          
          const allRows = [...new Set(Array.from(inputs).map(inp => inp.dataset.row))].sort((a, b) => {
            if (a === '99') return 1;
            if (b === '99') return -1;
            return parseInt(a) - parseInt(b);
          });
          const currentRowIdx = allRows.indexOf(row);
          const nextRow = allRows[currentRowIdx + 1];
          
          if (nextRow) {
            const nextInputs = Array.from(document.querySelectorAll(`.math-input[data-row="${nextRow}"]`));
            if (nextInputs.length) nextInputs[nextInputs.length - 1].focus();
          }
        }
      } else {
        e.target.classList.add('bg-red-500', 'text-white', 'border-red-600', 'font-black');
      }
    };
  });
}

function updateCarryForMultiply(rowIndex, colIndex, totalCols) {
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

function updateCarryForSum(colIndex) {
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