// Построение HTML сетки для деления уголком (портировано из Laravel/DivisionGrid.vue)
import { calculateDivisionSteps } from './divisionAlgorithm.js';

export function buildGrid(
  dividendVal,
  divisorVal,
  settingsPanel,
  workspace,
  mathGrid,
  checkMessage,
  steps,
  stepsData,
  inputRefs,
  focusedRow,
  quotientInputs,
  setupLogic
) {
  settingsPanel.classList.add('hidden');
  workspace.classList.remove('hidden');
  workspace.classList.add('flex');
  
  checkMessage.textContent = '';
  
  // Очищаем ссылки и состояние
  for (let key in inputRefs) {
    delete inputRefs[key];
  }
  focusedRow.step = null;
  focusedRow.type = null;
  
  const dividendStr = String(dividendVal);
  const divisorStr = String(divisorVal);
  const quotient = Math.floor(dividendVal / divisorVal);
  const quotientStr = String(quotient);
  
  // Расчёт шагов
  const calculatedSteps = calculateDivisionSteps(dividendVal, divisorVal);
  stepsData.length = 0;
  stepsData.push(...calculatedSteps);
  
  // Инициализация массивов
  quotientInputs.length = 0;
  quotientInputs.push(...Array(quotientStr.length).fill(''));
  
  const divLen = dividendStr.length;
  steps.length = 0;
  steps.push(...Array.from({ length: quotientStr.length }).map(() => ({
    productInput: Array(divLen).fill(''),
    differenceInput: Array(divLen).fill(''),
    productStatus: null,
    differenceStatus: null,
    offset: 0
  })));
  
  const dividendDigits = dividendStr.split('').map(Number);
  const divisorDigits = divisorStr.split('').map(Number);
  
  // Расчёт размеров ячеек
  const dividendCols = dividendDigits.length;
  const quotientCols = Math.max(quotientStr.length, divisorDigits.length);
  const totalGridCols = dividendCols + 1 + quotientCols;
  
  const cellWidth = `clamp(24px, calc(85vw / ${totalGridCols}), 32px)`;
  const fontSize = `clamp(11px, calc(60vw / ${totalGridCols}), 16px)`;
  
  // Построение HTML (ТОЧНАЯ структура из Laravel)
  let html = `<div class="bg-gray-100 border-2 border-gray-400 rounded-lg shadow p-2 md:p-4 mx-auto grid gap-x-1 items-start" 
    style="grid-template-columns: repeat(${dividendCols}, ${cellWidth}) 2px repeat(${quotientCols}, ${cellWidth});">`;
  
  // Делимое (розовые ячейки)
  dividendDigits.forEach((d, i) => {
    html += `<div style="grid-row: 1; grid-column: ${i + 1}; margin-bottom: 4px; width: ${cellWidth}; height: ${cellWidth}; line-height: ${cellWidth}; font-size: ${fontSize};" 
      class="bg-pink-300 text-gray-800 rounded-md font-bold text-center flex items-center justify-center">${d}</div>`;
  });
  
  // Делитель (жёлтые ячейки)
  divisorDigits.forEach((d, i) => {
    const col = dividendCols + 2 + i;
    html += `<div style="grid-row: 1; grid-column: ${col}; margin-bottom: 4px; width: ${cellWidth}; height: ${cellWidth}; line-height: ${cellWidth}; font-size: ${fontSize};" 
      class="bg-yellow-400 text-gray-800 rounded-md font-bold text-center flex items-center justify-center">${d}</div>`;
  });
  
  // Частное (синие инпуты)
  quotientStr.split('').forEach((_, i) => {
    const col = dividendCols + 2 + i;
    html += `<input type="text" inputmode="numeric" maxlength="1" 
      data-quotient-index="${i}"
      style="grid-row: 2; grid-column: ${col}; margin-top: 4px; width: ${cellWidth}; height: ${cellWidth}; font-size: ${fontSize};"
      class="quotient-input text-center border-2 border-gray-300 bg-blue-200 rounded font-black outline-none focus:border-blue-400 transition-all shadow-sm">`;
  });
  
  // Контейнер для подсказки (занимает место в grid, но сама подсказка absolute)
  const hintStartCol = dividendCols + 2;
  html += `<div style="grid-row: 3; grid-column: ${hintStartCol} / -1; position: relative; height: 0;">
    <div id="hintMessage" 
      style="position: absolute; top: 8px; left: 0; font-size: clamp(11px, calc(20vw / ${totalGridCols}), 15px); word-wrap: break-word; white-space: normal; line-height: 1.3; max-width: 400px;"
      class="text-blue-600 font-bold text-left"></div>
  </div>`;
  
  // Разделительная линия
  html += `<div class="border-l-2 border-gray-400 row-span-full" style="grid-column: ${dividendCols + 1};"></div>`;
  
  // Шаги деления - каждая ячейка в своей колонке grid
  let currentRow = 2; // Первый product будет на grid-row: 2 (как частное)
  stepsData.forEach((stepData, sIdx) => {
    const offset = stepData.offset;
    
    // Product row
    for (let c = 0; c < divLen; c++) {
      const col = c + 1;
      html += `<input type="text" inputmode="numeric" maxlength="1" 
        data-step="${sIdx}" data-type="product" data-col="${c}"
        data-step-type="product"
        style="grid-row: ${currentRow}; grid-column: ${col}; width: ${cellWidth}; height: ${cellWidth}; font-size: ${fontSize}; margin-top: ${sIdx === 0 ? '4px' : '0'};"
        class="step-input text-center border-2 border-gray-300 bg-yellow-100 rounded font-black outline-none focus:border-blue-400 transition-all shadow-sm">`;
    }
    currentRow++; // Увеличиваем ПОСЛЕ product
    
    // Difference row
    for (let c = 0; c < divLen; c++) {
      const col = c + 1;
      html += `<input type="text" inputmode="numeric" maxlength="1" 
        data-step="${sIdx}" data-type="difference" data-col="${c}"
        data-step-type="difference"
        style="grid-row: ${currentRow}; grid-column: ${col}; width: ${cellWidth}; height: ${cellWidth}; font-size: ${fontSize}; margin-bottom: 2px;"
        class="step-input text-center border-2 border-gray-300 bg-blue-100 rounded font-black outline-none focus:border-blue-400 transition-all shadow-sm">`;
    }
    currentRow++; // Увеличиваем ПОСЛЕ difference
  });
  
  html += `</div>`; // закрываем главный grid
  
  mathGrid.innerHTML = html;
  setupLogic();
  
  // Фокус на первую ячейку частного
  const firstQuotient = document.querySelector('[data-quotient-index="0"]');
  if (firstQuotient) firstQuotient.focus();
}