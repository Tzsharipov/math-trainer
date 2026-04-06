// Построение сетки для умножения на однозначное число - УПРОЩЁННАЯ ВЕРСИЯ С ПОДСВЕТКОЙ

// Глобальные переменные
let currentFocusedIndex = -1;
let currentMultiplicand = 0;
let currentMultiplier = 0;
let currentMathGrid = null;

export function buildGrid(multiplicand, multiplier, settingsPanel, workspace, mathGrid, checkMessage, hintPopup, hintText, sideHint, sideHintText) {
  // Скрываем панель настроек, показываем workspace
  settingsPanel.classList.add('hidden');
  workspace.classList.remove('hidden');
  workspace.classList.add('flex');
  
  checkMessage.textContent = '';
  
  // Определяем размер экрана
  const isMobile = window.innerWidth < 768;
  
  // Показываем подсказки на всех устройствах
  hintPopup.classList.remove('hidden');
  sideHint.style.visibility = 'hidden';
  
  const sA = multiplicand.toString();
  const sB = multiplier.toString();
  const result = (multiplicand * multiplier).toString();
  
  const totalCols = Math.max(sA.length, result.length) + 1;
  
  // АДАПТИВНЫЙ РАЗМЕР ЯЧЕЕК
  const cellSize = `clamp(28px, calc(85vw / ${totalCols}), 40px)`;
  const fontSize = `clamp(14px, calc(60vw / ${totalCols}), 18px)`;
  
  let html = `<div class="bg-gray-100 border-2 border-gray-400 rounded-lg shadow p-2 md:p-4 grid gap-x-1 items-start mx-auto" style="grid-template-columns: repeat(${totalCols}, ${cellSize});">`;
  
  // Строка 1: Множимое
  sA.split('').forEach((d, i) => {
    const col = totalCols - sA.length + i + 1;
    html += `<div 
      data-multiplicand-digit="${i}" 
      style="grid-row: 1; grid-column: ${col}; margin-bottom: 4px; width: ${cellSize}; height: ${cellSize}; font-size: ${fontSize};" 
      class="bg-cyan-400 text-gray-900 rounded-md font-bold text-center flex items-center justify-center transition-all duration-300">${d}</div>`;
  });
  
  // Строка 2: Знак × и множитель
  const mulCol = totalCols - sB.length - 1;
  html += `<div style="grid-row: 2; grid-column: ${mulCol}; margin-bottom: 4px; width: ${cellSize}; height: ${cellSize}; font-size: ${fontSize};" class="mr-2 text-gray-600 font-semibold flex items-center justify-center">×</div>`;
  html += `<div 
    data-multiplier 
    style="grid-row: 2; grid-column: ${totalCols}; margin-bottom: 4px; width: ${cellSize}; height: ${cellSize}; font-size: ${fontSize};" 
    class="bg-gray-400 text-gray-900 rounded-md font-bold text-center flex items-center justify-center transition-all duration-300">${sB}</div>`;
  
  // Строка 3: Переносы (в уме)
  for (let i = 1; i <= totalCols; i++) {
    html += `<div class="relative group" style="grid-row: 3; grid-column: ${i};">
      <input type="text" maxlength="1" readonly style="width: ${cellSize}; height: calc(${cellSize} * 0.75); font-size: calc(${fontSize} * 0.85);" class="text-center bg-gray-200 text-orange-600 font-bold outline-none rounded transition-all duration-300" placeholder="·" data-carry="${i - 1}">
      <div class="absolute hidden md:group-hover:block bottom-full left-0 mb-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold py-2 px-3 rounded-lg shadow-xl whitespace-nowrap z-50">💭 Цифры в уме</div>
    </div>`;
  }
  
  // Строка 4: Результат (инпуты)
  result.split('').forEach((c, colIdx) => {
    const col = totalCols - result.length + colIdx + 1;
    html += `<input type="text" inputmode="numeric" maxlength="1" 
      data-correct="${c}" data-col="${col - 1}"
      style="grid-row: 4; grid-column: ${col}; width: ${cellSize}; height: ${cellSize}; font-size: ${fontSize};"
      class="math-input text-center border-2 border-yellow-300 bg-yellow-200 rounded font-black outline-none focus:border-blue-400 transition-all shadow-sm duration-300">`;
  });
  
  html += `</div>`;
  mathGrid.innerHTML = html;
  
  // Сохраняем переменные
  currentMathGrid = mathGrid;
  currentMultiplicand = multiplicand;
  currentMultiplier = multiplier;
  
  setupLogic(multiplicand, multiplier, result, totalCols, checkMessage, hintPopup, hintText, mathGrid, sideHint, sideHintText, isMobile);
  
  // Фокус на последнюю ячейку (начинаем справа)
  const inputs = document.querySelectorAll('.math-input');
  const sAInit = multiplicand.toString().split('').reverse();
  const multInit = parseInt(multiplier);
  if (inputs.length) {
    inputs[inputs.length - 1].focus();
    currentFocusedIndex = inputs.length - 1;
    updateHintAndHighlight(inputs.length - 1, multiplicand, multiplier, hintText, mathGrid);
    // Показываем нижнюю подсказку сразу для первой ячейки
    showSideHintAutomatic(inputs.length - 1, sAInit, multInit, {}, sideHint, sideHintText, mathGrid, inputs, result.length, totalCols);
  }
}

function setupLogic(multiplicand, multiplier, result, totalCols, checkMessage, hintPopup, hintText, mathGrid, sideHint, sideHintText, isMobile) {
  const inputs = document.querySelectorAll('.math-input');
  const carries = {};
  const sA = multiplicand.toString().split('').reverse();
  const mult = parseInt(multiplier);
  
  // Таймер делаем переменной которая будет доступна во всех вызовах
  window.currentSideHintTimer = null;
  
  inputs.forEach((el, idx) => {
    el.oninput = (e) => {
      const val = e.target.value;
      const correct = e.target.dataset.correct;
      const col = parseInt(e.target.dataset.col);
      
      e.target.className = 'math-input text-center border-2 rounded font-black outline-none transition-all shadow-sm duration-300';
      
      if (!val) {
        e.target.classList.add('border-yellow-300', 'bg-yellow-200');
        return;
      }
      
      if (val === correct) {
        e.target.classList.add('bg-green-500', 'text-slate-900', 'border-green-600', 'font-black');
        
        // Обновляем перенос
        updateCarry(idx, sA, mult, carries, totalCols, result.length);
        
        // Убираем подсветку с текущих ячеек
        clearHighlights(mathGrid);
        
        // Переходим к следующей ячейке
        if (idx > 0) {
          currentFocusedIndex = idx - 1;
          inputs[idx - 1].focus();
          updateHintAndHighlight(idx - 1, multiplicand, multiplier, hintText, mathGrid);
          scheduleSideHint(idx - 1, sA, mult, carries, sideHint, sideHintText, mathGrid, inputs, result.length, totalCols);
        } else {
          // Все заполнено - проверяем результат
          currentFocusedIndex = -1;
          checkResult(inputs, checkMessage);
          hintPopup.classList.add('hidden');
          sideHint.style.visibility = 'hidden';
        }
      } else {
        e.target.classList.add('bg-red-500', 'text-white', 'border-red-600', 'font-black');
      }
    };
    
    el.onfocus = () => {
      currentFocusedIndex = idx;
      updateHintAndHighlight(idx, multiplicand, multiplier, hintText, mathGrid);
    };
  });
}

// Обновляет подсказку и подсвечивает нужные ячейки
function updateHintAndHighlight(idx, multiplicand, multiplier, hintText, mathGrid) {
  const sA = multiplicand.toString();
  const resultLength = (multiplicand * multiplier).toString().length;
  
  // Убираем старую подсветку
  clearHighlights(mathGrid);
  
  const digitIndex = sA.length - 1 - (resultLength - 1 - idx);
  
  if (digitIndex >= 0 && digitIndex < sA.length) {
    const digit = sA[digitIndex];
    hintText.textContent = `Умножь ${digit} × ${multiplier}`;
    
    // Подсвечиваем цифру множимого ЯРКО-ЖЁЛТЫМ + МИГАНИЕ
    const multiplicandDigit = mathGrid.querySelector(`[data-multiplicand-digit="${digitIndex}"]`);
    if (multiplicandDigit) {
      multiplicandDigit.classList.remove('bg-cyan-400');
      multiplicandDigit.classList.add('bg-yellow-400', 'scale-110', 'cell-pulse-yellow');
    }
    
    // Подсвечиваем множитель ЯРКО-ЖЁЛТЫМ + МИГАНИЕ
    const multiplierDigit = mathGrid.querySelector('[data-multiplier]');
    if (multiplierDigit) {
      multiplierDigit.classList.remove('bg-gray-400');
      multiplierDigit.classList.add('bg-yellow-400', 'scale-110', 'cell-pulse-yellow');
    }
    
    // Подсвечиваем ячейку результата СВЕТЛО-ОРАНЖЕВЫМ + МИГАНИЕ
    const inputs = document.querySelectorAll('.math-input');
    const resultInput = inputs[idx];
    if (resultInput) {
      resultInput.classList.remove('bg-yellow-200');
      resultInput.classList.add('bg-orange-300', 'cell-pulse-orange');
    }
  } else {
    // Это последняя ячейка - перенос
    hintText.textContent = 'Запиши перенос';
    
    // Подсвечиваем только ячейку результата
    const inputs = document.querySelectorAll('.math-input');
    const resultInput = inputs[idx];
    if (resultInput) {
      resultInput.classList.remove('bg-yellow-200');
      resultInput.classList.add('bg-orange-300', 'cell-pulse-orange');
    }
  }
}

// Убирает всю подсветку
function clearHighlights(mathGrid) {
  // Возвращаем голубой цвет множимому + убираем мигание
  mathGrid.querySelectorAll('[data-multiplicand-digit]').forEach(el => {
    el.classList.remove('bg-yellow-400', 'scale-110', 'cell-pulse-yellow');
    el.classList.add('bg-cyan-400');
  });
  
  // Возвращаем серый цвет множителю + убираем мигание
  mathGrid.querySelectorAll('[data-multiplier]').forEach(el => {
    el.classList.remove('bg-yellow-400', 'scale-110', 'cell-pulse-yellow');
    el.classList.add('bg-gray-400');
  });
  
  // Возвращаем бледно-жёлтый ячейкам результата + убираем мигание
  mathGrid.querySelectorAll('.math-input').forEach(el => {
    el.classList.remove('bg-orange-300', 'bg-orange-400', 'cell-pulse-orange');
    if (!el.classList.contains('bg-green-500') && !el.classList.contains('bg-red-500')) {
      el.classList.add('bg-yellow-200');
    }
  });
  
  mathGrid.querySelectorAll('[data-carry]').forEach(el => {
    el.classList.remove('bg-orange-300', 'bg-orange-400', 'scale-110', 'cell-pulse-orange');
    el.classList.add('bg-gray-200');
  });
}

// Показывает подсказку сразу без задержки
function scheduleSideHint(idx, sA, mult, carries, sideHint, sideHintText, mathGrid, inputs, resultLength, totalCols) {
  if (window.currentSideHintTimer) {
    clearTimeout(window.currentSideHintTimer);
  }
  
  showSideHintAutomatic(idx, sA, mult, carries, sideHint, sideHintText, mathGrid, inputs, resultLength, totalCols);
}

function showSideHintAutomatic(idx, sA, mult, carries, sideHint, sideHintText, mathGrid, inputs, resultLength, totalCols) {
  const digitIndex = resultLength - 1 - idx;
  
  if (digitIndex < 0 || digitIndex >= sA.length) {
    sideHint.style.visibility = 'hidden';
    return;
  }
  
  const digit = parseInt(sA[digitIndex]);
  const col = totalCols - resultLength + idx;
  const prevCarry = carries[col] || 0;
  const product = digit * mult + prevCarry;
  const currentCarry = Math.floor(product / 10);
  const writtenDigit = product % 10;
  
  // Формируем текст подсказки
  let hintTextContent = `${digit}×${mult}`;
  if (prevCarry > 0) {
    hintTextContent += ` + ${prevCarry}`;
  }
  hintTextContent += ` = ${product}<br>${writtenDigit} пишем`;
  if (currentCarry > 0) {
    hintTextContent += `, ${currentCarry} в уме`;
  }
  
  sideHintText.innerHTML = hintTextContent;
  
  // Показываем сразу
  sideHint.style.visibility = 'visible';
  
  // Подсвечиваем ячейку переноса СВЕТЛО-ОРАНЖЕВЫМ + МИГАНИЕ если есть
  if (prevCarry > 0) {
    const carryInput = mathGrid.querySelector(`[data-carry="${col}"]`);
    if (carryInput && carryInput.value) {
      carryInput.classList.remove('bg-gray-200');
      carryInput.classList.add('bg-orange-300', 'scale-110', 'cell-pulse-orange');
    }
  }
  
  // Подсвечиваем текущую ячейку для ввода СВЕТЛО-ОРАНЖЕВЫМ + МИГАНИЕ
  const resultInput = inputs[idx];
  if (resultInput) {
    resultInput.classList.remove('bg-yellow-200');
    resultInput.classList.add('bg-orange-300', 'cell-pulse-orange');
  }
}

function updateCarry(idx, sA, mult, carries, totalCols, resultLength) {
  const digitIndex = resultLength - 1 - idx;
  
  if (digitIndex < 0 || digitIndex >= sA.length) return 0;
  
  const digit = parseInt(sA[digitIndex]);
  const col = totalCols - resultLength + idx;
  const prevCarry = carries[col] || 0;
  const product = digit * mult + prevCarry;
  const carry = Math.floor(product / 10);
  
  if (carry > 0) {
    carries[col - 1] = carry;
    const carryCol = col - 1;
    const carryInput = document.querySelector(`[data-carry="${carryCol}"]`);
    if (carryInput) carryInput.value = carry;
  }
  
  return carry;
}

function checkResult(inputs, checkMessage) {
  const allFilled = Array.from(inputs).every(inp => inp.value !== '');
  if (!allFilled) return;
  
  const allCorrect = Array.from(inputs).every(inp => inp.value === inp.dataset.correct);
  
  if (allCorrect) {
    const childName = localStorage.getItem('childName');
    const message = childName 
      ? `Правильно! Умничка, ${childName}! 🎉` 
      : 'Правильно! Молодец! 🎉';
    
    checkMessage.textContent = message;
    checkMessage.className = 'text-xl font-bold text-center mt-2 text-green-600';
    
    if (window.confetti) {
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { x: 0.5, y: 0.6 },
        colors: ['#FFD700', '#FF6347', '#00CED1', '#32CD32', '#FF69B4'],
        scalar: 1.5
      });
      
      setTimeout(() => confetti({
        particleCount: 150,
        spread: 100,
        origin: { x: 0.5, y: 0.6 },
        colors: ['#FFD700', '#FF6347', '#00CED1'],
        scalar: 1.5
      }), 300);
      
      setTimeout(() => confetti({
        particleCount: 150,
        spread: 100,
        origin: { x: 0.5, y: 0.6 },
        colors: ['#32CD32', '#FF69B4', '#FFD700'],
        scalar: 1.5
      }), 600);
    }
  } else {
    const childName = localStorage.getItem('childName');
    const message = childName 
      ? `Попробуй ещё раз, ${childName}! 💪` 
      : 'Попробуй ещё раз!';
    
    checkMessage.textContent = message;
    checkMessage.className = 'text-xl font-bold text-center mt-2 text-red-600';
  }
}
