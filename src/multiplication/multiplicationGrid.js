// Построение HTML сетки для умножения столбиком

import { updateCarryForMultiply, updateCarryForSum } from './multiplicationCarries.js';
import { checkResult } from './multiplicationCheck.js';

// Обновляет подсказку и подсвечивает нужные ячейки для текущего неполного произведения
// Обновляет подсказку и подсвечивает нужные ячейки - СКОПИРОВАНО ИЗ BASICS
function updateHintAndHighlight(idx, currentRowNum, valA, valB, hintText, mathGrid) {
  const sA = valA.toString();
  const sB = valB.toString();
  const digitsB = sB.split('').reverse();
  
  // Определяем текущую цифру множителя (для текущей строки)
  const multiplierDigitIndex = currentRowNum;
  if (multiplierDigitIndex >= digitsB.length) {
    hintText.textContent = 'Сложи неполные произведения';
    return;
  }
  const mult = parseInt(digitsB[multiplierDigitIndex]);
  
  // Для данной строки вычисляем длину результата
  // ИСПРАВЛЕНИЕ: если умножаем на 0, длина = длина множимого
  let resultLength;
  if (mult === 0) {
    resultLength = sA.length;
  } else {
    resultLength = (valA * mult).toString().length;
  }
  
  // Убираем старую подсветку
  clearHighlights(mathGrid);
  
  // Логика из basics - определяем digitIndex
  const digitIndex = sA.length - 1 - (resultLength - 1 - idx);
  
  if (digitIndex >= 0 && digitIndex < sA.length) {
    const digit = sA[digitIndex];
    
    // Для умножения на 0 - специальная подсказка
    if (mult === 0) {
      hintText.textContent = `Запиши цифру 0 в результат`;
    } else {
      hintText.textContent = `Умножь ${digit} × ${mult}`;
    }
    
    // Подсвечиваем цифру множимого ЯРКО-ЖЁЛТЫМ + МИГАНИЕ
    const multiplicandDigit = mathGrid.querySelector(`[data-multiplicand-digit="${digitIndex}"]`);
    if (multiplicandDigit) {
      multiplicandDigit.classList.remove('bg-cyan-400');
      multiplicandDigit.classList.add('bg-yellow-400', 'scale-110', 'cell-pulse-yellow');
    }
    
    // Подсвечиваем цифру множителя ЯРКО-ЖЁЛТЫМ + МИГАНИЕ
    const multiplierDigitDOMIndex = sB.length - 1 - multiplierDigitIndex;
    const multiplierDigit = mathGrid.querySelector(`[data-multiplier-digit="${multiplierDigitDOMIndex}"]`);
    if (multiplierDigit) {
      multiplierDigit.classList.remove('bg-gray-400');
      multiplierDigit.classList.add('bg-yellow-400', 'scale-110', 'cell-pulse-yellow');
    }
    
    // Подсвечиваем ячейку результата СВЕТЛО-ОРАНЖЕВЫМ + МИГАНИЕ
    const inputs = document.querySelectorAll(`.math-input[data-row="${currentRowNum}"]`);
    const resultInput = inputs[idx];
    if (resultInput) {
      resultInput.classList.remove('bg-yellow-200');
      resultInput.classList.add('bg-orange-300', 'cell-pulse-orange');
    }
  } else {
    // Это ячейка для переноса (цифр множимого закончились)
    hintText.textContent = 'Запиши перенос';
    
    // Подсвечиваем только ячейку результата
    const inputs = document.querySelectorAll(`.math-input[data-row="${currentRowNum}"]`);
    const resultInput = inputs[idx];
    if (resultInput) {
      resultInput.classList.remove('bg-yellow-200');
      resultInput.classList.add('bg-orange-300', 'cell-pulse-orange');
    }
  }
}

// Убирает всю подсветку - СКОПИРОВАНО ИЗ BASICS
function clearHighlights(mathGrid) {
  
  // Возвращаем голубой цвет множимому + убираем мигание
  mathGrid.querySelectorAll('[data-multiplicand-digit]').forEach(el => {
    el.classList.remove('bg-yellow-400', 'scale-110', 'cell-pulse-yellow');
    el.classList.add('bg-cyan-400');
  });
  
  // Возвращаем серый цвет множителю + убираем мигание  
  mathGrid.querySelectorAll('[data-multiplier-digit]').forEach(el => {
    el.classList.remove('bg-yellow-400', 'scale-110', 'cell-pulse-yellow');
    el.classList.add('bg-gray-400');
  });
  
  // Возвращаем бледно-жёлтый ячейкам результата + убираем мигание
  mathGrid.querySelectorAll('.math-input').forEach(el => {
    el.classList.remove('bg-orange-300', 'bg-orange-400', 'cell-pulse-orange');
    if (!el.classList.contains('bg-green-500') && !el.classList.contains('bg-red-500') && !el.classList.contains('bg-blue-200')) {
      el.classList.add('bg-yellow-200');
    }
  });
  
  mathGrid.querySelectorAll('[data-carry]').forEach(el => {
    el.classList.remove('bg-orange-300', 'bg-orange-400', 'scale-110', 'cell-pulse-orange');
    el.classList.add('bg-gray-200');
  });
}

// Запускает показ боковой подсказки через 1 секунду - СКОПИРОВАНО ИЗ BASICS
function scheduleSideHint(idx, currentRowNum, valA, valB, carries, sideHint, sideHintText, mathGrid, totalCols) {
  if (window.currentSideHintTimer) {
    clearTimeout(window.currentSideHintTimer);
  }
  
  sideHint.classList.add('hidden');
  sideHint.classList.remove('side-hint-animate');
  
  window.currentSideHintTimer = setTimeout(() => {
    showSideHintAutomatic(idx, currentRowNum, valA, valB, carries, sideHint, sideHintText, mathGrid, totalCols);
  }, 1000);
}

function showSideHintAutomatic(idx, currentRowNum, valA, valB, carries, sideHint, sideHintText, mathGrid, totalCols) {
  const sA = valA.toString();
  const sB = valB.toString();
  const digitsB = sB.split('').reverse();
  
  const multiplierDigitIndex = currentRowNum;
  if (multiplierDigitIndex >= digitsB.length) return;
  
  const mult = parseInt(digitsB[multiplierDigitIndex]);
  
  // ИСПРАВЛЕНИЕ: если умножаем на 0, длина = длина множимого
  let resultLength;
  if (mult === 0) {
    resultLength = sA.length;
  } else {
    resultLength = (valA * mult).toString().length;
  }
  
  // ИСПОЛЬЗУЕМ ТУ ЖЕ ЛОГИКУ ЧТО В updateHintAndHighlight!
  const digitIndex = sA.length - 1 - (resultLength - 1 - idx);
  
  // Для каждой строки есть смещение (shift)
  const shift = currentRowNum;
  
  if (digitIndex < 0 || digitIndex >= sA.length) {
    // Это ячейка для переноса - показываем подсказку про перенос
    const col = totalCols - resultLength + idx - shift;
    const prevCarry = carries[col] || 0;
    
    if (prevCarry > 0) {
      sideHintText.innerHTML = `Запиши ${prevCarry}<br>${prevCarry} пишем`;
      sideHint.classList.remove('hidden');
      sideHint.classList.add('side-hint-animate');
    } else {
      sideHint.classList.add('hidden');
    }
    return;
  }
  
  const digit = parseInt(sA[digitIndex]);
  
  // Вычисляем col с учётом смещения
  const col = totalCols - resultLength + idx - shift;
  
  const prevCarry = carries[col] || 0;
  const product = digit * mult + prevCarry;
  const currentCarry = Math.floor(product / 10);
  const writtenDigit = product % 10;
  
  // Формируем текст подсказки (ВСЕГДА показываем, не только при переносах)
  let hintTextContent = `${digit}×${mult}`;
  if (prevCarry > 0) {
    hintTextContent += ` + ${prevCarry}`;
  }
  hintTextContent += ` = ${product}<br>${writtenDigit} пишем`;
  if (currentCarry > 0) {
    hintTextContent += `, ${currentCarry} в уме`;
  }
  
  sideHintText.innerHTML = hintTextContent;
  
  // Показываем с анимацией
  sideHint.classList.remove('hidden');
  sideHint.classList.add('side-hint-animate');
  
  // Подсвечиваем ячейку переноса СВЕТЛО-ОРАНЖЕВЫМ + МИГАНИЕ если есть
  if (prevCarry > 0) {
    const carryInput = mathGrid.querySelector(`[data-carry="${col}"]`);
    if (carryInput && carryInput.value) {
      carryInput.classList.remove('bg-gray-200');
      carryInput.classList.add('bg-orange-300', 'scale-110', 'cell-pulse-orange');
    }
  }
  
  // Подсвечиваем текущую ячейку для ввода СВЕТЛО-ОРАНЖЕВЫМ + МИГАНИЕ
  const inputs = document.querySelectorAll(`.math-input[data-row="${currentRowNum}"]`);
  const resultInput = inputs[idx];
  if (resultInput) {
    resultInput.classList.remove('bg-yellow-200');
    resultInput.classList.add('bg-orange-300', 'cell-pulse-orange');
  }
}

// ============ LEVEL 2: ПОДСКАЗКИ ДЛЯ СЛОЖЕНИЯ НЕПОЛНЫХ ПРОИЗВЕДЕНИЙ ============

// Обновляет подсказку и подсвечивает ячейки для сложения
function updateHintForSum(idx, valB, hintText, mathGrid, carries) {
  const sB = valB.toString();
  const numRows = sB.length;
  const resultInputs = Array.from(document.querySelectorAll('.math-input[data-row="99"]'));
  
  // Убираем старую подсветку
  clearHighlights(mathGrid);
  
  // Получаем data-col текущей ячейки результата
  const currentCell = resultInputs[idx];
  if (!currentCell) return;
  
  const colIndex = parseInt(currentCell.dataset.col);
  
  // Находим все ячейки неполных произведений с таким же data-col
  const cellsToAdd = [];
  for (let rowIdx = 0; rowIdx < numRows; rowIdx++) {
    const cell = mathGrid.querySelector(`.math-input[data-row="${rowIdx}"][data-col="${colIndex}"]`);
    if (cell && cell.value) {
      cellsToAdd.push(cell);
    }
  }
  
  // Если нет ячеек для сложения - пропускаем
  if (cellsToAdd.length === 0) return;
  
  // ПЕРВАЯ ЯЧЕЙКА (самая правая) - особый случай
  if (idx === resultInputs.length - 1 && cellsToAdd.length === 1) {
    // Подсвечиваем только ОДНУ цифру
    const firstCell = cellsToAdd[0];
    firstCell.classList.remove('bg-yellow-200', 'bg-green-500');
    firstCell.classList.add('bg-orange-300', 'cell-pulse-orange');
    hintText.textContent = `Запиши цифру ${firstCell.value} в результат`;
  } else {
    // ОСТАЛЬНЫЕ ЯЧЕЙКИ - складываем вертикально
    const prevCarry = carries[colIndex] || 0;
    const digits = cellsToAdd.map(c => c.value).join(' + ');
    
    // Если только ОДНА цифра и НЕТ переноса - просто записать
    if (cellsToAdd.length === 1 && prevCarry === 0) {
      hintText.textContent = `Запиши цифру ${cellsToAdd[0].value} в результат`;
    } else {
      // Формируем подсказку с переносом
      if (prevCarry > 0) {
        hintText.innerHTML = `Сложи (${digits}) и <span style="color: #2563eb; font-weight: bold;">${prevCarry}</span>`;
      } else {
        hintText.textContent = `Сложи: ${digits}`;
      }
    }
    
    // Подсвечиваем ВСЕ ячейки в колонке
    cellsToAdd.forEach(cell => {
      cell.classList.remove('bg-yellow-200', 'bg-green-500');
      cell.classList.add('bg-orange-300', 'cell-pulse-orange');
    });
  }
  
  // Подсвечиваем ячейку результата
  currentCell.classList.remove('bg-blue-200');
  currentCell.classList.add('bg-orange-300', 'cell-pulse-orange');
}

// Запускает показ боковой подсказки для сложения через 1 секунду
function scheduleSideHintForSum(idx, valB, carries, sideHint, sideHintText, mathGrid) {
  if (window.currentSideHintTimer) {
    clearTimeout(window.currentSideHintTimer);
  }
  
  sideHint.classList.add('hidden');
  sideHint.classList.remove('side-hint-animate');
  
  window.currentSideHintTimer = setTimeout(() => {
    showSideHintForSum(idx, valB, carries, sideHint, sideHintText, mathGrid);
  }, 1000);
}

function showSideHintForSum(idx, valB, carries, sideHint, sideHintText, mathGrid) {
  const sB = valB.toString();
  const numRows = sB.length;
  const resultInputs = Array.from(document.querySelectorAll('.math-input[data-row="99"]'));
  
  const currentCell = resultInputs[idx];
  if (!currentCell) return;
  
  const colIndex = parseInt(currentCell.dataset.col);
  
  // Находим все ячейки в этой колонке
  const cellsToAdd = [];
  for (let rowIdx = 0; rowIdx < numRows; rowIdx++) {
    const cell = mathGrid.querySelector(`.math-input[data-row="${rowIdx}"][data-col="${colIndex}"]`);
    if (cell && cell.value) {
      cellsToAdd.push(parseInt(cell.value));
    }
  }
  
  if (cellsToAdd.length === 0) return;
  
  // ПЕРВАЯ ЯЧЕЙКА (самая правая) - просто показываем цифру
  if (idx === resultInputs.length - 1 && cellsToAdd.length === 1) {
    const digit = cellsToAdd[0];
    sideHintText.innerHTML = `Запиши цифру ${digit} в результат`;
    
    sideHint.classList.remove('hidden');
    sideHint.classList.add('side-hint-animate');
  } else {
    // ОСТАЛЬНЫЕ ЯЧЕЙКИ - складываем с переносом
    const prevCarry = carries[colIndex] || 0;
    const sum = cellsToAdd.reduce((a, b) => a + b, 0) + prevCarry;
    const currentCarry = Math.floor(sum / 10);
    const writtenDigit = sum % 10;
    
    // Формируем текст подсказки
    let hintTextContent = cellsToAdd.join(' + ');
    if (prevCarry > 0) {
      hintTextContent += ` + ${prevCarry}`;
    }
    hintTextContent += ` = ${sum}<br>${writtenDigit} пишем`;
    if (currentCarry > 0) {
      hintTextContent += `, ${currentCarry} в уме`;
    }
    
    sideHintText.innerHTML = hintTextContent;
    
    sideHint.classList.remove('hidden');
    sideHint.classList.add('side-hint-animate');
    
    // Подсвечиваем перенос если есть
    if (prevCarry > 0) {
      const carryInput = mathGrid.querySelector(`[data-carry="${colIndex}"]`);
      if (carryInput && carryInput.value) {
        carryInput.classList.remove('bg-gray-200');
        carryInput.classList.add('bg-orange-300', 'scale-110', 'cell-pulse-orange');
      }
    }
  }
}

export function buildGrid(
  valA,
  valB,
  settingsPanel,
  workspace,
  mathGrid,
  checkMessage,
  checkHints,
  hintPopup,
  hintText,
  sideHint,
  sideHintText,
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
  
  // АДАПТИВНЫЙ РАЗМЕР ЯЧЕЕК
  const cellSize = `clamp(24px, calc(85vw / ${totalCols}), 32px)`;
  const fontSize = `clamp(12px, calc(60vw / ${totalCols}), 16px)`;
  
  let html = `<div class="bg-gray-100 border-2 border-gray-400 rounded-lg shadow p-2 md:p-4 grid gap-x-1 items-start mx-auto" style="grid-template-columns: repeat(${totalCols}, ${cellSize});">`;
  
  // Множимое (верхнее число)
  sA.split('').forEach((d, i) => {
    const col = totalCols - sA.length + i + 1;
    html += `<div 
      data-multiplicand-digit="${i}"
      style="grid-row: 1; grid-column: ${col}; margin-bottom: 4px; width: ${cellSize}; height: ${cellSize}; font-size: ${fontSize};" 
      class="bg-cyan-400 text-gray-900 rounded-md font-bold text-center flex items-center justify-center transition-all duration-300">${d}</div>`;
  });
  
  // Знак умножения и множитель
  const mulCol = totalCols - sB.length - 1;
  html += `<div style="grid-row: 2; grid-column: ${mulCol}; margin-bottom: 4px; width: ${cellSize}; height: ${cellSize}; font-size: ${fontSize};" class="mr-2 text-gray-600 font-semibold flex items-center justify-center">×</div>`;
  sB.split('').forEach((d, i) => {
    const col = totalCols - sB.length + i + 1;
    html += `<div 
      data-multiplier-digit="${i}"
      style="grid-row: 2; grid-column: ${col}; margin-bottom: 4px; width: ${cellSize}; height: ${cellSize}; font-size: ${fontSize};" 
      class="bg-gray-400 text-gray-900 rounded-md font-bold text-center flex items-center justify-center transition-all duration-300">${d}</div>`;
  });
  
  // Строка переносов
  for (let i = 1; i <= totalCols; i++) {
    html += `<div class="relative group" style="grid-row: 3; grid-column: ${i};">
      <input type="text" maxlength="1" readonly style="width: ${cellSize}; height: calc(${cellSize} * 0.75); font-size: calc(${fontSize} * 0.85);" class="text-center bg-gray-200 text-orange-600 font-bold outline-none rounded" placeholder="·" data-carry="${i - 1}">
      <div class="absolute hidden md:group-hover:block bottom-full left-0 mb-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold py-2 px-3 rounded-lg shadow-xl whitespace-nowrap z-50">💭 Цифры в уме</div>
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
        style="grid-row: ${gridRow}; grid-column: ${col}; width: ${cellSize}; height: ${cellSize}; font-size: ${fontSize};"
        class="math-input text-center border-2 border-yellow-300 bg-yellow-200 rounded font-black outline-none focus:border-blue-400 transition-all shadow-sm ${inactiveClass}"
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
      style="grid-row: ${resultRow}; grid-column: ${col}; width: ${cellSize}; height: ${cellSize}; font-size: ${fontSize};"
      class="math-input text-center border-2 border-blue-400 bg-blue-200 rounded font-black outline-none shadow-sm focus:border-blue-500 ${resultInactiveClass}"
      disabled>`;
  });
  
  html += `</div>`;
  mathGrid.innerHTML = html;
  
  // Определяем размер экрана
  const isMobile = window.innerWidth < 768;
  
  // НА МОБИЛЬНЫХ СКРЫВАЕМ ПОДСКАЗКИ, на десктопе показываем если включены
  if (isMobile || !checkHints.checked) {
    hintPopup.classList.add('hidden');
    sideHint.classList.add('hidden');
  } else {
    hintPopup.classList.remove('hidden');
  }
  
  // Вызываем callback для настройки логики
  setupLogicCallback(totalCols, valA, valB, checkHints, checkMessage, hintPopup, hintText, sideHint, sideHintText, mathGrid, carries, activeRow, isMobile);
  
  // Фокус на последнюю ячейку первой строки и показываем подсказку
  const firstRow = Array.from(document.querySelectorAll('.math-input[data-row="0"]'));
  if (firstRow.length) {
    firstRow[firstRow.length - 1].focus();
    if (!isMobile && checkHints.checked) {
      const idx = firstRow.length - 1;
      updateHintAndHighlight(idx, 0, valA, valB, hintText, mathGrid);
      scheduleSideHint(idx, 0, valA, valB, carries, sideHint, sideHintText, mathGrid, totalCols);
    }
  }
}

export function setupLogic(totalCols, currentA, currentB, checkHints, checkMessage, hintPopup, hintText, sideHint, sideHintText, mathGrid, carries, activeRowObj, isMobile) {
  const inputs = document.querySelectorAll('.math-input');
  
  // Таймер для показа боковой подсказки
  window.currentSideHintTimer = null;
  
  inputs.forEach(el => {
    el.oninput = (e) => {
      const val = e.target.value;
      const correct = e.target.dataset.correct;
      const row = e.target.dataset.row;
      const col = parseInt(e.target.dataset.col);
      
      e.target.className = 'math-input text-center border-2 rounded font-black outline-none transition-all shadow-sm';
      
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
        
        // СПЕЦИАЛЬНАЯ ОБРАБОТКА: если строка умножения и введён 0
        if (row !== "99" && val === "0") {
          // Проверяем - вся ли строка из нулей?
          const allZeros = rowInputs.every(inp => inp.dataset.correct === "0");
          
          if (allZeros) {
            // Автоматически заполняем все ячейки нулями и подсвечиваем ВСЕ зелёным
            rowInputs.forEach(inp => {
              inp.value = "0";
              inp.className = 'math-input text-center border-2 rounded font-black outline-none transition-all shadow-sm';
              inp.classList.add('bg-green-500', 'text-slate-900', 'border-green-600', 'font-black');
            });
            
            // Убираем подсветку
            if (!isMobile && checkHints.checked) {
              clearHighlights(mathGrid);
            }
            
            // Переходим к следующей строке
            const nextRowNum = parseInt(row) + 1;
            const nextRowInputs = Array.from(document.querySelectorAll(`.math-input[data-row="${nextRowNum}"]`));
            
            
            if (nextRowInputs.length > 0) {
              activeRowObj.value = nextRowNum;
              nextRowInputs.forEach(inp => {
                inp.disabled = false;
                inp.classList.remove('opacity-50', 'cursor-not-allowed');
              });
              nextRowInputs[nextRowInputs.length - 1].focus();
              
              
              if (!isMobile && checkHints.checked) {
                updateHintAndHighlight(nextRowInputs.length - 1, nextRowNum, currentA, currentB, hintText, mathGrid);
                scheduleSideHint(nextRowInputs.length - 1, nextRowNum, currentA, currentB, carries, sideHint, sideHintText, mathGrid, totalCols);
              }
            } else {
              activeRowObj.value = 99;
              const resultInputs = Array.from(document.querySelectorAll(`.math-input[data-row="99"]`));
              resultInputs.forEach(inp => {
                inp.disabled = false;
                inp.classList.remove('opacity-50', 'cursor-not-allowed');
              });
              resultInputs[resultInputs.length - 1].focus();
              if (!isMobile && checkHints.checked) {
                updateHintForSum(resultInputs.length - 1, currentB, hintText, mathGrid, carries);
                scheduleSideHintForSum(resultInputs.length - 1, currentB, carries, sideHint, sideHintText, mathGrid);
              }
            }
            return; // Выходим, не продолжаем обычную логику
          }
        }
        
        // Убираем подсветку
        if (!isMobile && checkHints.checked) {
          clearHighlights(mathGrid);
        }
        
        if (idx > 0) {
          // Переходим к следующей ячейке
          const nextIdx = idx - 1;
          rowInputs[nextIdx].focus();
          
          // Обновляем подсказки для СЛЕДУЮЩЕЙ ячейки
          if (!isMobile && checkHints.checked) {
            if (row === "99") {
              // LEVEL 2: Подсказки для сложения
              updateHintForSum(nextIdx, currentB, hintText, mathGrid, carries);
              scheduleSideHintForSum(nextIdx, currentB, carries, sideHint, sideHintText, mathGrid);
            } else {
              // LEVEL 1: Подсказки для умножения
              updateHintAndHighlight(nextIdx, parseInt(row), currentA, currentB, hintText, mathGrid);
              scheduleSideHint(nextIdx, parseInt(row), currentA, currentB, carries, sideHint, sideHintText, mathGrid, totalCols);
            }
          }
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
              // Показываем подсказку для первой ячейки новой строки
              if (!isMobile && checkHints.checked) {
                // Проверяем - нулевая ли следующая строка?
                const nextRowAllZeros = nextRowInputs.every(inp => inp.dataset.correct === "0");
                if (!nextRowAllZeros) {
                  // Обычная строка
                  updateHintAndHighlight(nextRowInputs.length - 1, nextRowNum, currentA, currentB, hintText, mathGrid);
                  scheduleSideHint(nextRowInputs.length - 1, nextRowNum, currentA, currentB, carries, sideHint, sideHintText, mathGrid, totalCols);
                }
                // Для нулевой строки подсветка будет в onfocus
              }
            } else {
              activeRowObj.value = 99;
              const resultInputs = Array.from(document.querySelectorAll(`.math-input[data-row="99"]`));
              resultInputs.forEach(inp => {
                inp.disabled = false;
                inp.classList.remove('opacity-50', 'cursor-not-allowed');
              });
              resultInputs[resultInputs.length - 1].focus();
              // Показываем подсказки для первой ячейки результата
              if (!isMobile && checkHints.checked) {
                updateHintForSum(resultInputs.length - 1, currentB, hintText, mathGrid, carries);
                scheduleSideHintForSum(resultInputs.length - 1, currentB, carries, sideHint, sideHintText, mathGrid);
              }
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
    
    // Обработчик фокуса - показываем подсказку
    el.onfocus = () => {
      const row = el.dataset.row;
      
      if (row === "99") {
        // LEVEL 2: Подсказки для сложения
        const resultInputs = Array.from(document.querySelectorAll('.math-input[data-row="99"]'));
        const idx = resultInputs.indexOf(el);
        
        if (!isMobile && checkHints.checked && idx >= 0) {
          updateHintForSum(idx, currentB, hintText, mathGrid, carries);
          scheduleSideHintForSum(idx, currentB, carries, sideHint, sideHintText, mathGrid);
        }
        return;
      }
      
      const rowInputs = Array.from(document.querySelectorAll(`.math-input[data-row="${row}"]`));
      const idx = rowInputs.indexOf(el);
      
      if (!isMobile && checkHints.checked && idx >= 0) {
        // Обычная логика для ВСЕХ строк
        updateHintAndHighlight(idx, parseInt(row), currentA, currentB, hintText, mathGrid);
        scheduleSideHint(idx, parseInt(row), currentA, currentB, carries, sideHint, sideHintText, mathGrid, totalCols);
      }
    };
  });
}
