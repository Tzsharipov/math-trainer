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
const checkMessage = document.querySelector('#checkMessage'); // НОВОЕ
const btnClearAll = document.querySelector('#btnClearAll');
const settingsPanel = document.querySelector('#settingsPanel');
const btnNewExample = document.querySelector('#btnNewExample');

let currentA = 0;
let currentB = 0;
let carries = {};
let activeRow = 0; // Текущая активная строка

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
btnClearAll.onclick = () => {
  clearAll();
};
btnNewExample.onclick = () => {
  // Скрываем workspace, показываем панель настроек
  workspace.classList.add('hidden');
  workspace.classList.remove('flex');
  settingsPanel.classList.remove('hidden');
  
  // Очищаем сетку
  mathGrid.innerHTML = '';
  checkMessage.textContent = '';
};


checkHints.onchange = () => {
  if (currentA && currentB) buildGrid(currentA, currentB);
};

function getRandom(digits) {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildGrid(valA, valB) {
  // Скрываем панель настроек, показываем workspace
  settingsPanel.classList.add('hidden');
  workspace.classList.remove('hidden');
  workspace.classList.add('flex');
  
  carries = {};
  checkMessage.textContent = '';
  activeRow = 0;
  const sA = valA.toString();
  const sB = valB.toString();
  const res = (valA * valB).toString();
  const digitsB = sB.split('').reverse();
  
  const totalCols = Math.max(sA.length + sB.length, res.length) + 1;
  
  let html = `<div class="bg-gray-100 border-2 border-gray-400 rounded-lg shadow p-4 grid gap-x-1 items-start" style="grid-template-columns: repeat(${totalCols}, 32px);">`;
  
  sA.split('').forEach((d, i) => {
    const col = totalCols - sA.length + i + 1;
    html += `<div style="grid-row: 1; grid-column: ${col}; margin-bottom: 4px;" class="w-8 h-8 bg-cyan-400 text-gray-900 rounded-md font-bold text-center flex items-center justify-center">${d}</div>`;
  });
  
  const mulCol = totalCols - sB.length - 1;
  html += `<div style="grid-row: 2; grid-column: ${mulCol}; margin-bottom: 4px;" class="w-8 h-8 mr-2 text-gray-600 font-semibold flex items-center justify-center">×</div>`;
  sB.split('').forEach((d, i) => {
    const col = totalCols - sB.length + i + 1;
    html += `<div style="grid-row: 2; grid-column: ${col}; margin-bottom: 4px;" class="w-8 h-8 bg-gray-400 text-gray-900 rounded-md font-bold text-center flex items-center justify-center">${d}</div>`;
  });
  
  // 3. СТРОКА ПЕРЕНОСОВ (grid-row: 3) - ОДНА для всей сетки
for (let i = 1; i <= totalCols; i++) {
  html += `<div class="relative group" style="grid-row: 3; grid-column: ${i};">
    <input type="text" maxlength="1" readonly class="w-8 h-6 text-center bg-gray-200 text-orange-600 font-bold text-sm outline-none rounded" placeholder="·" data-carry="${i - 1}">
    <div class="absolute hidden group-hover:block bottom-full left-0 mb-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold py-2 px-3 rounded-lg shadow-xl whitespace-nowrap z-50">💭 Цифры в уме</div>
  </div>`;
}
  
  digitsB.forEach((digitB, rowIdx) => {
    const rowVal = valA * parseInt(digitB);
    const rowStr = (rowVal === 0) ? "0".repeat(sA.length) : rowVal.toString();
    const shift = rowIdx;
    const gridRow = rowIdx + 4;
    
    rowStr.split('').forEach((c, colIdx) => {
      const col = totalCols - rowStr.length - shift + colIdx + 1;
      const isActive = rowIdx === 0; // Первая строка активна
const inactiveClass = !isActive ? 'opacity-50 cursor-not-allowed' : '';

html += `<input type="text" inputmode="numeric" maxlength="1" 
  data-correct="${c}" data-row="${rowIdx}" data-col="${col - 1}" data-shift="${shift}"
  style="grid-row: ${gridRow}; grid-column: ${col};"
  class="math-input w-8 h-8 text-center border-2 border-yellow-300 bg-yellow-200 rounded font-black text-base outline-none focus:border-blue-400 transition-all shadow-sm ${inactiveClass}"
  ${!isActive ? 'disabled' : ''}>`;
    });
  });
  
  const separatorRow = digitsB.length + 4;
  html += `<div style="grid-row: ${separatorRow}; grid-column: 1 / span ${totalCols}; border-bottom: 2px solid #9ca3af; margin-top: 4px; margin-bottom: 4px;"></div>`;
  
const resultRow = separatorRow + 1;
const resultInactiveClass = 'opacity-50 cursor-not-allowed'; // Результат заблокирован изначально

res.split('').forEach((c, colIdx) => {
  const col = totalCols - res.length + colIdx + 1;
  html += `<input type="text" inputmode="numeric" maxlength="1" 
    data-correct="${c}" data-row="99" data-col="${col - 1}"
    style="grid-row: ${resultRow}; grid-column: ${col};"
    class="math-input w-8 h-8 text-center border-2 border-blue-400 bg-blue-200 rounded font-black text-base outline-none shadow-sm focus:border-blue-500 ${resultInactiveClass}"
    disabled>`;
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
  
  // Проверяем - вся ли строка правильная
  const rowInputs = Array.from(document.querySelectorAll(`.math-input[data-row="${row}"]`));
  const allCorrect = rowInputs.every(inp => inp.value === inp.dataset.correct);
  
  if (!allCorrect) {
    // Есть ошибки - не переходим дальше
    return;
  }
  
  // Строка правильная - активируем следующую
  if (row === '99') {
    checkResult();
  } else {
    const nextRowNum = parseInt(row) + 1;
    
    // Пробуем найти следующую строку неполных произведений
    const nextRowInputs = Array.from(document.querySelectorAll(`.math-input[data-row="${nextRowNum}"]`));
    
    if (nextRowInputs.length > 0) {
      // Есть следующая строка неполных произведений - разблокируем её
      activeRow = nextRowNum;
      nextRowInputs.forEach(inp => {
        inp.disabled = false;
        inp.classList.remove('opacity-50', 'cursor-not-allowed');
      });
      nextRowInputs[nextRowInputs.length - 1].focus();
    } else {
      // Нет больше неполных произведений - активируем результат
      activeRow = 99;
      const resultInputs = Array.from(document.querySelectorAll(`.math-input[data-row="99"]`));
      resultInputs.forEach(inp => {
        inp.disabled = false;
        inp.classList.remove('opacity-50', 'cursor-not-allowed');
      });
      resultInputs[resultInputs.length - 1].focus();
    }
  }
}
      } else {
        e.target.classList.add('bg-red-500', 'text-white', 'border-red-600', 'font-black');
      if (row === '99') {
    // Проверяем результат даже если неправильная цифра
        const rowInputs = Array.from(document.querySelectorAll(`.math-input[data-row="99"]`));
        const allFilled = rowInputs.every(inp => inp.value !== '');
      if (allFilled) checkResult();
  }



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

// НОВАЯ ФУНКЦИЯ - проверка результата
function checkResult() {
  const resultInputs = Array.from(document.querySelectorAll('.math-input[data-row="99"]'));
  
  const allFilled = resultInputs.every(inp => inp.value !== '');
  if (!allFilled) return;
  
  const allCorrect = resultInputs.every(inp => inp.value === inp.dataset.correct);
  
  if (allCorrect) {
    checkMessage.textContent = 'Правильно! Молодец! 🎉';
    checkMessage.className = 'text-xl font-bold text-center min-h-[2rem] text-green-600';
    
  if (window.confetti) {
  // Первый залп
  confetti({
    particleCount: 200,
    spread: 120,
    origin: { x: 0.5, y: 0.6 },
    colors: ['#FFD700', '#FF6347', '#00CED1', '#32CD32', '#FF69B4'],
    scalar: 1.5
  });
  
  // Второй залп (через 300мс)
  setTimeout(() => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { x: 0.5, y: 0.6 },
      colors: ['#FFD700', '#FF6347', '#00CED1'],
      scalar: 1.5
    });
  }, 300);
  
  // Третий залп (через 600мс)
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
  } else {
    checkMessage.textContent = 'Попробуй ещё раз!';
    checkMessage.className = 'text-xl font-bold text-center min-h-[2rem] text-red-600';
  }
}

function clearAll() {
  if (currentA && currentB) {
    buildGrid(currentA, currentB);
  }
}

document.body.classList.add('loaded');