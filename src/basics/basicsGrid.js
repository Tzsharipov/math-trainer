// Построение сетки для умножения на однозначное число

// Глобальные переменные для пересчёта стрелок при зуме
let currentFocusedIndex = -1;
let currentMultiplicandForHint = 0;
let currentMultiplierForHint = 0;
let currentMathGrid = null;
let currentHintText = null;
let currentHintArrows = null;
let currentSideHint = null;
let currentSideHintText = null;
let currentSideHintArrows = null;
let currentSA = [];
let currentMult = 0;
let currentCarries = {};
let currentInputs = [];
let currentResultLength = 0;
let currentTotalCols = 0;

export function buildGrid(multiplicand, multiplier, settingsPanel, workspace, mathGrid, checkMessage, hintPopup, hintText, hintArrows, sideHint, sideHintText, sideHintArrows) {
  // Скрываем панель настроек, показываем workspace
  settingsPanel.classList.add('hidden');
  workspace.classList.remove('hidden');
  workspace.classList.add('flex');
  
  checkMessage.textContent = '';
  
  // Определяем размер экрана
  const isMobile = window.innerWidth < 768;
  
  // НА МОБИЛЬНЫХ СКРЫВАЕМ ПОДСКАЗКИ, на десктопе показываем
  if (isMobile) {
    hintPopup.classList.add('hidden');
    sideHint.classList.add('hidden');
  } else {
    hintPopup.classList.remove('hidden');
  }
  
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
      class="bg-cyan-400 text-gray-900 rounded-md font-bold text-center flex items-center justify-center">${d}</div>`;
  });
  
  // Строка 2: Знак × и множитель
  const mulCol = totalCols - sB.length - 1;
  html += `<div style="grid-row: 2; grid-column: ${mulCol}; margin-bottom: 4px; width: ${cellSize}; height: ${cellSize}; font-size: ${fontSize};" class="mr-2 text-gray-600 font-semibold flex items-center justify-center">×</div>`;
  html += `<div 
    data-multiplier 
    style="grid-row: 2; grid-column: ${totalCols}; margin-bottom: 4px; width: ${cellSize}; height: ${cellSize}; font-size: ${fontSize};" 
    class="bg-gray-400 text-gray-900 rounded-md font-bold text-center flex items-center justify-center">${sB}</div>`;
  
  // Строка 3: Переносы (в уме)
  for (let i = 1; i <= totalCols; i++) {
    html += `<div class="relative group" style="grid-row: 3; grid-column: ${i};">
      <input type="text" maxlength="1" readonly style="width: ${cellSize}; height: calc(${cellSize} * 0.75); font-size: calc(${fontSize} * 0.85);" class="text-center bg-gray-200 text-orange-600 font-bold outline-none rounded" placeholder="·" data-carry="${i - 1}">
      <div class="absolute hidden md:group-hover:block bottom-full left-0 mb-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold py-2 px-3 rounded-lg shadow-xl whitespace-nowrap z-50">💭 Цифры в уме</div>
    </div>`;
  }
  
  // Строка 4: Результат (инпуты)
  result.split('').forEach((c, colIdx) => {
    const col = totalCols - result.length + colIdx + 1;
    html += `<input type="text" inputmode="numeric" maxlength="1" 
      data-correct="${c}" data-col="${col - 1}"
      style="grid-row: 4; grid-column: ${col}; width: ${cellSize}; height: ${cellSize}; font-size: ${fontSize};"
      class="math-input text-center border-2 border-yellow-300 bg-yellow-200 rounded font-black outline-none focus:border-blue-400 transition-all shadow-sm">`;
  });
  
  html += `</div>`;
  mathGrid.innerHTML = html;
  
  // Сохраняем глобальные переменные для пересчёта при зуме
  currentMathGrid = mathGrid;
  currentHintText = hintText;
  currentHintArrows = hintArrows;
  currentSideHint = sideHint;
  currentSideHintText = sideHintText;
  currentSideHintArrows = sideHintArrows;
  currentMultiplicandForHint = multiplicand;
  currentMultiplierForHint = multiplier;
  currentResultLength = result.length;
  currentTotalCols = totalCols;
  
  setupLogic(multiplicand, multiplier, result, totalCols, checkMessage, hintPopup, hintText, hintArrows, mathGrid, sideHint, sideHintText, sideHintArrows, isMobile);
  
  // Добавляем слушатель resize для пересчёта стрелок при зуме
  window.removeEventListener('resize', redrawCurrentArrows); // Удаляем старый если был
  window.addEventListener('resize', redrawCurrentArrows);
  
  // Фокус на последнюю ячейку (начинаем справа)
  const inputs = document.querySelectorAll('.math-input');
  if (inputs.length) {
    currentInputs = inputs;
    inputs[inputs.length - 1].focus();
    currentFocusedIndex = inputs.length - 1;
    if (!isMobile) {
      updateHint(inputs.length - 1, multiplicand, multiplier, hintText, hintArrows, mathGrid);
    }
  }
}

// Функция для пересчёта стрелок при изменении масштаба
function redrawCurrentArrows() {
  if (currentFocusedIndex >= 0 && currentMathGrid && currentHintText && currentHintArrows) {
    // Небольшая задержка чтобы браузер успел пересчитать позиции
    setTimeout(() => {
      // Пересчитываем верхние стрелки
      updateHint(currentFocusedIndex, currentMultiplicandForHint, currentMultiplierForHint, currentHintText, currentHintArrows, currentMathGrid);
      
      // Пересчитываем боковые стрелки если они видны
      if (currentSideHint && !currentSideHint.classList.contains('hidden') && currentSA.length > 0) {
        const digitIndex = currentResultLength - 1 - currentFocusedIndex;
        if (digitIndex >= 0 && digitIndex < currentSA.length) {
          const digit = parseInt(currentSA[digitIndex]);
          const col = currentTotalCols - currentResultLength + currentFocusedIndex;
          const prevCarry = currentCarries[col] || 0;
          const product = digit * currentMult + prevCarry;
          const currentCarry = Math.floor(product / 10);
          
          drawSideArrowsAutomatic(currentFocusedIndex, currentCarry, currentSideHintArrows, currentMathGrid, currentInputs, currentCarries, col);
        }
      }
    }, 10);
  }
}

function setupLogic(multiplicand, multiplier, result, totalCols, checkMessage, hintPopup, hintText, hintArrows, mathGrid, sideHint, sideHintText, sideHintArrows, isMobile) {
  const inputs = document.querySelectorAll('.math-input');
  const carries = {};
  const sA = multiplicand.toString().split('').reverse();
  const mult = parseInt(multiplier);
  
  // Сохраняем в глобальные переменные для пересчёта при зуме
  currentSA = sA;
  currentMult = mult;
  currentCarries = carries;
  
  let sideHintTimer = null; // Таймер для показа боковой подсказки
  
  inputs.forEach((el, idx) => {
    el.oninput = (e) => {
      const val = e.target.value;
      const correct = e.target.dataset.correct;
      const col = parseInt(e.target.dataset.col);
      
      e.target.className = 'math-input text-center border-2 rounded font-black outline-none transition-all shadow-sm';
      
      if (!val) {
        e.target.classList.add('border-yellow-300', 'bg-yellow-200');
        return;
      }
      
      if (val === correct) {
        e.target.classList.add('bg-green-500', 'text-slate-900', 'border-green-600', 'font-black');
        
        // Обновляем перенос
        updateCarry(idx, sA, mult, carries, totalCols, result.length);
        
        // Переходим к следующей ячейке (влево)
        if (idx > 0) {
          currentFocusedIndex = idx - 1; // Обновляем текущий индекс
          inputs[idx - 1].focus();
          if (!isMobile) {
            updateHint(idx - 1, multiplicand, multiplier, hintText, hintArrows, mathGrid);
            // Запускаем таймер показа боковой подсказки для СЛЕДУЮЩЕЙ ячейки
            scheduleSideHint(idx - 1, sA, mult, carries, sideHint, sideHintText, sideHintArrows, mathGrid, inputs, result.length, totalCols, sideHintTimer, isMobile);
          }
        } else {
          // Все заполнено - проверяем результат
          currentFocusedIndex = -1; // Сбрасываем индекс
          checkResult(inputs, checkMessage);
          hintPopup.classList.add('hidden');
          sideHint.classList.add('hidden');
        }
      } else {
        e.target.classList.add('bg-red-500', 'text-white', 'border-red-600', 'font-black');
      }
    };
    
    el.onfocus = () => {
      currentFocusedIndex = idx; // Сохраняем текущий индекс
      if (!isMobile) {
        updateHint(idx, multiplicand, multiplier, hintText, hintArrows, mathGrid);
        // Запускаем таймер показа боковой подсказки через 1 секунду
        scheduleSideHint(idx, sA, mult, carries, sideHint, sideHintText, sideHintArrows, mathGrid, inputs, result.length, totalCols, sideHintTimer, isMobile);
      }
    };
  });
}

function updateHint(idx, multiplicand, multiplier, hintText, hintArrows, mathGrid) {
  const sA = multiplicand.toString();
  const resultLength = (multiplicand * multiplier).toString().length;
  
  // idx идёт справа налево (последняя ячейка = idx последний)
  // Нам нужна цифра множимого справа налево
  const digitIndex = sA.length - 1 - (resultLength - 1 - idx);
  
  if (digitIndex >= 0 && digitIndex < sA.length) {
    const digit = sA[digitIndex];
    hintText.textContent = `Умножь ${digit} × ${multiplier}`;
    
    // Рисуем стрелки к цифрам
    drawArrows(digitIndex, hintArrows, mathGrid);
  } else {
    hintText.textContent = 'Введи результат';
    hintArrows.innerHTML = '';
  }
}

function drawArrows(digitIndex, hintArrows, mathGrid) {
  // Очищаем предыдущие стрелки
  hintArrows.innerHTML = '';
  
  console.log('drawArrows вызвана:', digitIndex);
  
  // Находим элементы цифр
  const multiplicandDigit = mathGrid.querySelector(`[data-multiplicand-digit="${digitIndex}"]`);
  const multiplierDigit = mathGrid.querySelector('[data-multiplier]');
  
  console.log('multiplicandDigit:', multiplicandDigit);
  console.log('multiplierDigit:', multiplierDigit);
  
  if (!multiplicandDigit || !multiplierDigit) {
    console.log('НЕ НАЙДЕНЫ ЦИФРЫ!');
    return;
  }
  
  // Получаем позиции относительно всплывающего окна
  const popupRect = hintArrows.getBoundingClientRect();
  const digit1Rect = multiplicandDigit.getBoundingClientRect();
  const digit2Rect = multiplierDigit.getBoundingClientRect();
  
  // Стартовая точка (от центра верхнего края SVG)
  const startX = popupRect.width / 2; // Динамический центр SVG
  const startY = 0;
  
  // Конечные точки (центры цифр относительно SVG)
  const end1X = digit1Rect.left + digit1Rect.width / 2 - popupRect.left;
  const end1Y = digit1Rect.top - popupRect.top;
  
  const end2X = digit2Rect.left + digit2Rect.width / 2 - popupRect.left;
  const end2Y = digit2Rect.top - popupRect.top;
  
  console.log(`Стрелка 1: (${startX}, ${startY}) -> (${end1X}, ${end1Y})`);
  console.log(`Стрелка 2: (${startX}, ${startY}) -> (${end2X}, ${end2Y})`);
  
  // Рисуем две стрелки - ТОНКИЕ, ПОЛУПРОЗРАЧНЫЕ, МАЛЕНЬКИЕ НАКОНЕЧНИКИ
  hintArrows.innerHTML = `
    <!-- Стрелка к цифре множимого -->
    <defs>
      <marker id="arrowhead1" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <polygon points="0 0, 6 3, 0 6" fill="#F59E0B" fill-opacity="0.6" />
      </marker>
    </defs>
    <path 
      d="M ${startX} ${startY} Q ${startX} ${(startY + end1Y) / 2}, ${end1X} ${end1Y}" 
      stroke="#F59E0B" 
      stroke-width="2" 
      stroke-opacity="0.6"
      fill="none" 
      marker-end="url(#arrowhead1)"
    />
    
    <!-- Стрелка к множителю -->
    <defs>
      <marker id="arrowhead2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <polygon points="0 0, 6 3, 0 6" fill="#F59E0B" fill-opacity="0.6" />
      </marker>
    </defs>
    <path 
      d="M ${startX} ${startY} Q ${startX} ${(startY + end2Y) / 2}, ${end2X} ${end2Y}" 
      stroke="#F59E0B" 
      stroke-width="2" 
      stroke-opacity="0.6"
      fill="none" 
      marker-end="url(#arrowhead2)"
    />
  `;
}

// Новая функция: запускает показ боковой подсказки через 1 секунду
function scheduleSideHint(idx, sA, mult, carries, sideHint, sideHintText, sideHintArrows, mathGrid, inputs, resultLength, totalCols, sideHintTimer, isMobile) {
  // Очищаем предыдущий таймер если был
  if (sideHintTimer) {
    clearTimeout(sideHintTimer);
  }
  
  // Скрываем подсказку сразу (чтобы она плавно появилась заново)
  sideHint.classList.add('hidden');
  sideHint.classList.remove('side-hint-animate');
  
  // Запускаем таймер на 1 секунду
  sideHintTimer = setTimeout(() => {
    showSideHintAutomatic(idx, sA, mult, carries, sideHint, sideHintText, sideHintArrows, mathGrid, inputs, resultLength, totalCols);
  }, 1000);
}

function showSideHintAutomatic(idx, sA, mult, carries, sideHint, sideHintText, sideHintArrows, mathGrid, inputs, resultLength, totalCols) {
  const digitIndex = resultLength - 1 - idx;
  
  if (digitIndex < 0 || digitIndex >= sA.length) {
    sideHint.classList.add('hidden');
    return;
  }
  
  const digit = parseInt(sA[digitIndex]);
  const col = totalCols - resultLength + idx;
  const prevCarry = carries[col] || 0;
  const product = digit * mult + prevCarry;
  const currentCarry = Math.floor(product / 10);
  const writtenDigit = product % 10;
  
  // Показываем подсказку если есть ТЕКУЩИЙ перенос ИЛИ был ПРЕДЫДУЩИЙ перенос
  if (currentCarry === 0 && prevCarry === 0) {
    sideHint.classList.add('hidden');
    return;
  }
  
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
  
  // Показываем с анимацией
  sideHint.classList.remove('hidden');
  sideHint.classList.add('side-hint-animate');
  
  // Рисуем стрелки (пока БЕЗ стрелок к результату, т.к. цифра ещё не введена)
  drawSideArrowsAutomatic(idx, currentCarry, sideHintArrows, mathGrid, inputs, carries, col);
}

function drawSideArrowsAutomatic(idx, currentCarry, sideHintArrows, mathGrid, inputs, carries, col) {
  sideHintArrows.innerHTML = '';
  
  const resultInput = inputs[idx];
  if (!resultInput) return;
  
  const hintRect = sideHintArrows.getBoundingClientRect();
  const resultRect = resultInput.getBoundingClientRect();
  
  // Стартовая точка (из правого края SVG)
  const startX = hintRect.width;
  const startY = 50;
  
  // Конечная точка для стрелки к середине правой стороны ячейки (ИСХОДНАЯ формула!)
  const endX1 = resultRect.left + resultRect.width / 2 - hintRect.left;
  const endY1 = resultRect.top + resultRect.height / 2 - hintRect.top;
  
  let arrowsHTML = `
    <defs>
      <marker id="sideArrow1" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <polygon points="0 0, 6 3, 0 6" fill="#EC4899" fill-opacity="0.6" />
      </marker>
    </defs>
    <path 
      d="M ${startX} ${startY} Q ${(startX + endX1) / 2} ${startY}, ${endX1} ${endY1}" 
      stroke="#EC4899" 
      stroke-width="2" 
      stroke-opacity="0.6"
      fill="none" 
      marker-end="url(#sideArrow1)"
    />
  `;
  
  // Если есть предыдущий перенос, рисуем стрелку к нему
  if (carries[col] > 0) {
    const allCarries = document.querySelectorAll('[data-carry]');
    let targetCarry = null;
    
    allCarries.forEach(carry => {
      const carryRect = carry.getBoundingClientRect();
      if (carryRect.right < resultRect.left && Math.abs(carryRect.right - resultRect.left) < 50) {
        targetCarry = carry;
      }
    });
    
    if (targetCarry && targetCarry.value) {
      const carryRect = targetCarry.getBoundingClientRect();
      const endX2 = carryRect.left + carryRect.width / 2 - hintRect.left;
      const endY2 = carryRect.top + carryRect.height / 2 - hintRect.top;
      
      arrowsHTML += `
        <defs>
          <marker id="sideArrow2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill="#EC4899" fill-opacity="0.6" />
          </marker>
        </defs>
        <path 
          d="M ${startX} ${startY} Q ${(startX + endX2) / 2} ${startY - 20}, ${endX2} ${endY2}" 
          stroke="#EC4899" 
          stroke-width="2" 
          stroke-opacity="0.6"
          fill="none" 
          marker-end="url(#sideArrow2)"
        />
      `;
    }
  }
  
  sideHintArrows.innerHTML = arrowsHTML;
}

function showSideHint(idx, sA, mult, carryValue, writtenDigit, sideHint, sideHintText, sideHintArrows, mathGrid, inputs, carries, resultLength, totalCols) {
  const digitIndex = resultLength - 1 - idx;
  
  if (digitIndex < 0 || digitIndex >= sA.length) {
    sideHint.classList.add('hidden');
    return;
  }
  
  const digit = parseInt(sA[digitIndex]);
  const col = totalCols - resultLength + idx;
  const prevCarry = carries[col] || 0;
  const product = digit * mult + prevCarry;
  
  // Показываем подсказку если есть ТЕКУЩИЙ перенос ИЛИ был ПРЕДЫДУЩИЙ перенос
  if (carryValue === 0 && prevCarry === 0) {
    sideHint.classList.add('hidden');
    return;
  }
  
  // Формируем текст подсказки
  let hintTextContent = `${digit}×${mult}`;
if (prevCarry > 0) {
  hintTextContent += ` + ${prevCarry}`;
}
hintTextContent += ` = ${product}<br>${writtenDigit} пишем`;
if (carryValue > 0) {
  hintTextContent += `, ${carryValue} в уме`;
}
  
  sideHintText.innerHTML = hintTextContent;
  sideHint.classList.remove('hidden');
  
  // Рисуем стрелки к введённой цифре и к переносу
  drawSideArrows(idx, carryValue, sideHintArrows, mathGrid, inputs);
}

function drawSideArrows(idx, carryValue, sideHintArrows, mathGrid, inputs) {
  sideHintArrows.innerHTML = '';
  
  // Находим введённую ячейку результата
  const resultInput = inputs[idx];
  if (!resultInput) return;
  
  const hintRect = sideHintArrows.getBoundingClientRect();
  const resultRect = resultInput.getBoundingClientRect();
  
  // Стартовая точка (ОДНА для обеих стрелок - из правого края SVG = левый край подсказки)
  const startX = hintRect.width; // Динамическая ширина SVG
  const startY = 50;
  
  // Конечная точка для стрелки к результату (правый край ячейки, не закрывает цифру)
  const endX1 = resultRect.right - hintRect.left + 5;
  const endY1 = resultRect.top + resultRect.height / 2 - hintRect.top;
  
  let arrowsHTML = `
    <defs>
      <marker id="sideArrow1" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <polygon points="0 0, 6 3, 0 6" fill="#EC4899" fill-opacity="0.6" />
      </marker>
    </defs>
    <path 
      d="M ${startX} ${startY} Q ${(startX + endX1) / 2} ${startY}, ${endX1} ${endY1}" 
      stroke="#EC4899" 
      stroke-width="2" 
      stroke-opacity="0.6"
      fill="none" 
      marker-end="url(#sideArrow1)"
    />
  `;
  
  // Рисуем стрелку к переносу (тоже из той же точки)
  if (carryValue > 0 && idx > 0) {
    // Находим правильный carry input (слева от текущей ячейки)
    const allCarries = document.querySelectorAll('[data-carry]');
    let targetCarry = null;
    
    allCarries.forEach(carry => {
      const carryRect = carry.getBoundingClientRect();
      if (carryRect.right < resultRect.left && Math.abs(carryRect.right - resultRect.left) < 50) {
        targetCarry = carry;
      }
    });
    
    if (targetCarry && targetCarry.value) {
      const carryRect = targetCarry.getBoundingClientRect();
      // Указываем на правый край ячейки переноса (не закрываем цифру)
      const endX2 = carryRect.right - hintRect.left + 5;
      const endY2 = carryRect.top + carryRect.height / 2 - hintRect.top;
      
      arrowsHTML += `
        <defs>
          <marker id="sideArrow2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill="#EC4899" fill-opacity="0.6" />
          </marker>
        </defs>
        <path 
          d="M ${startX} ${startY} Q ${(startX + endX2) / 2} ${startY - 20}, ${endX2} ${endY2}" 
          stroke="#EC4899" 
          stroke-width="2" 
          stroke-opacity="0.6"
          fill="none" 
          marker-end="url(#sideArrow2)"
        />
      `;
    }
  }
  
  sideHintArrows.innerHTML = arrowsHTML;
}

function updateCarry(idx, sA, mult, carries, totalCols, resultLength) {
  // sA - это REVERSED массив цифр множимого (справа налево)
  const digitIndex = resultLength - 1 - idx;
  
  if (digitIndex < 0 || digitIndex >= sA.length) return 0;
  
  const digit = parseInt(sA[digitIndex]);
  const col = totalCols - resultLength + idx;
  const prevCarry = carries[col] || 0;
  const product = digit * mult + prevCarry;
  const carry = Math.floor(product / 10);
  
  if (carry > 0) {
    carries[col - 1] = carry;
    // Перенос должен быть НАД следующей ячейкой СЛЕВА (idx-1)
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
    // Персонализированное сообщение с именем ребёнка
    const childName = localStorage.getItem('childName');
    const message = childName 
      ? `Правильно! Умничка, ${childName}! 🎉` 
      : 'Правильно! Молодец! 🎉';
    
    checkMessage.textContent = message;
    checkMessage.className = 'text-xl font-bold text-center mt-2 text-green-600';
    
    // Конфетти
    if (window.confetti) {
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { x: 0.5, y: 0.6 },
        colors: ['#FFD700', '#FF6347', '#00CED1', '#32CD32', '#FF69B4'],
        scalar: 1.5
      });
      
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { x: 0.5, y: 0.6 },
          colors: ['#FFD700', '#FF6347', '#00CED1'],
          scalar: 1.5
        });
      }, 300);
      
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
    // Персонализированное сообщение с именем ребёнка
    const childName = localStorage.getItem('childName');
    const message = childName 
      ? `Попробуй ещё раз, ${childName}! 💪` 
      : 'Попробуй ещё раз!';
    
    checkMessage.textContent = message;
    checkMessage.className = 'text-xl font-bold text-center mt-2 text-red-600';
  }
}