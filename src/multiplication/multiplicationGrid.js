// Построение HTML сетки для умножения столбиком

import { updateCarryForMultiply, updateCarryForSum } from './multiplicationCarries.js';
import { checkResult } from './multiplicationCheck.js';

export function buildGrid(
  valA,
  valB,
  settingsPanel,
  workspace,
  mathGrid,
  checkMessage,
  checkHints,
  carries,
  activeRow,
  setupLogicCallback
) {
  // Скрываем панель настроек, показываем workspace
  settingsPanel.classList.add('hidden');
  workspace.classList.remove('hidden');
  workspace.classList.add('flex');
  
  // Очищаем состояние
  for (let key in carries) delete carries[key];
  checkMessage.textContent = '';
  activeRow.value = 0;
  
  const sA = valA.toString();
  const sB = valB.toString();
  const res = (valA * valB).toString();
  const digitsB = sB.split('').reverse();
  
  const totalCols = Math.max(sA.length + sB.length, res.length) + 1;
  
  let html = `<div class="bg-gray-100 border-2 border-gray-400 rounded-lg shadow p-4 grid gap-x-1 items-start" style="grid-template-columns: repeat(${totalCols}, 32px);">`;
  
  // Множимое (верхнее число)
  sA.split('').forEach((d, i) => {
    const col = totalCols - sA.length + i + 1;
    html += `<div style="grid-row: 1; grid-column: ${col}; margin-bottom: 4px;" class="w-8 h-8 bg-cyan-400 text-gray-900 rounded-md font-bold text-center flex items-center justify-center">${d}</div>`;
  });
  
  // Знак умножения и множитель
  const mulCol = totalCols - sB.length - 1;
  html += `<div style="grid-row: 2; grid-column: ${mulCol}; margin-bottom: 4px;" class="w-8 h-8 mr-2 text-gray-600 font-semibold flex items-center justify-center">×</div>`;
  sB.split('').forEach((d, i) => {
    const col = totalCols - sB.length + i + 1;
    html += `<div style="grid-row: 2; grid-column: ${col}; margin-bottom: 4px;" class="w-8 h-8 bg-gray-400 text-gray-900 rounded-md font-bold text-center flex items-center justify-center">${d}</div>`;
  });
  
  // Строка переносов
  for (let i = 1; i <= totalCols; i++) {
    html += `<div class="relative group" style="grid-row: 3; grid-column: ${i};">
      <input type="text" maxlength="1" readonly class="w-8 h-6 text-center bg-gray-200 text-orange-600 font-bold text-sm outline-none rounded" placeholder="·" data-carry="${i - 1}">
      <div class="absolute hidden group-hover:block bottom-full left-0 mb-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold py-2 px-3 rounded-lg shadow-xl whitespace-nowrap z-50">💭 Цифры в уме</div>
    </div>`;
  }
  
  // Строки неполных произведений
  digitsB.forEach((digitB, rowIdx) => {
    const rowVal = valA * parseInt(digitB);
    const rowStr = (rowVal === 0) ? "0".repeat(sA.length) : rowVal.toString();
    const shift = rowIdx;
    const gridRow = rowIdx + 4;
    
    rowStr.split('').forEach((c, colIdx) => {
      const col = totalCols - rowStr.length - shift + colIdx + 1;
      const isActive = rowIdx === 0;
      const inactiveClass = !isActive ? 'opacity-50 cursor-not-allowed' : '';
      
      html += `<input type="text" inputmode="numeric" maxlength="1" 
        data-correct="${c}" data-row="${rowIdx}" data-col="${col - 1}" data-shift="${shift}"
        style="grid-row: ${gridRow}; grid-column: ${col};"
        class="math-input w-8 h-8 text-center border-2 border-yellow-300 bg-yellow-200 rounded font-black text-base outline-none focus:border-blue-400 transition-all shadow-sm ${inactiveClass}"
        ${!isActive ? 'disabled' : ''}>`;
    });
  });
  
  // Разделительная линия
  const separatorRow = digitsB.length + 4;
  html += `<div style="grid-row: ${separatorRow}; grid-column: 1 / span ${totalCols}; border-bottom: 2px solid #9ca3af; margin-top: 4px; margin-bottom: 4px;"></div>`;
  
  // Строка результата
  const resultRow = separatorRow + 1;
  const resultInactiveClass = 'opacity-50 cursor-not-allowed';
  
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
  
  // Вызываем callback для настройки логики
  setupLogicCallback(totalCols, valA, valB, checkHints, checkMessage, carries, activeRow);
  
  // Фокус на последнюю ячейку первой строки
  const firstRow = Array.from(document.querySelectorAll('.math-input[data-row="0"]'));
  if (firstRow.length) firstRow[firstRow.length - 1].focus();
}

export function setupLogic(totalCols, currentA, currentB, checkHints, checkMessage, carries, activeRowObj) {
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
            updateCarryForMultiply(parseInt(row), col, totalCols, currentA, currentB, carries);
          } else {
            updateCarryForSum(col, currentB, carries);
          }
        }
        
        const rowInputs = Array.from(document.querySelectorAll(`.math-input[data-row="${row}"]`));
        const idx = rowInputs.indexOf(e.target);
        
        if (idx > 0) {
          rowInputs[idx - 1].focus();
        } else {
          // Очистка переносов
          document.querySelectorAll('[data-carry]').forEach(c => c.value = '');
          for (let key in carries) delete carries[key];
          
          // Проверяем - вся ли строка правильная
          const allCorrect = rowInputs.every(inp => inp.value === inp.dataset.correct);
          
          if (!allCorrect) return;
          
          // Строка правильная - активируем следующую
          if (row === '99') {
            checkResult(checkMessage);
          } else {
            const nextRowNum = parseInt(row) + 1;
            const nextRowInputs = Array.from(document.querySelectorAll(`.math-input[data-row="${nextRowNum}"]`));
            
            if (nextRowInputs.length > 0) {
              activeRowObj.value = nextRowNum;
              nextRowInputs.forEach(inp => {
                inp.disabled = false;
                inp.classList.remove('opacity-50', 'cursor-not-allowed');
              });
              nextRowInputs[nextRowInputs.length - 1].focus();
            } else {
              activeRowObj.value = 99;
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
          const rowInputs = Array.from(document.querySelectorAll(`.math-input[data-row="99"]`));
          const allFilled = rowInputs.every(inp => inp.value !== '');
          if (allFilled) checkResult(checkMessage);
        }
      }
    };
  });
}
