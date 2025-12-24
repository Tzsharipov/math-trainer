import './style.css';

// === DOM ЭЛЕМЕНТЫ ===
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

// === СОСТОЯНИЕ ===
let currentA = 0;
let currentB = 0;

// === ОБРАБОТЧИКИ СОБЫТИЙ ===

// Переключение режима (авто/ручной)
document.querySelectorAll('input[name="mode"]').forEach(radio => {
  radio.onchange = (e) => {
    uiAuto.classList.toggle('hidden', e.target.value !== 'auto');
    uiManual.classList.toggle('hidden', e.target.value !== 'manual');
  };
});

// Кнопка "Создать пример" (авто режим)
btnGen.onclick = () => {
  currentA = getRandom(parseInt(selectA.value));
  currentB = getRandom(parseInt(selectB.value));
  buildGrid(currentA, currentB);
};

// Кнопка "Начать решать" (ручной режим)
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
};

// Переключение подсказок - перестраиваем сетку
checkHints.onchange = () => {
  if (currentA && currentB) {
    buildGrid(currentA, currentB);
  }
};

// === ГЕНЕРАЦИЯ СЛУЧАЙНОГО ЧИСЛА ===
function getRandom(digits) {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// === ПОСТРОЕНИЕ СЕТКИ УМНОЖЕНИЯ ===
function buildGrid(valA, valB) {
  workspace.classList.remove('hidden');
  
  const sA = valA.toString();
  const sB = valB.toString();
  const res = (valA * valB).toString();
  const cols = Math.max(sA.length + sB.length, res.length) + 1;
  
  let html = `<div class="grid gap-1 w-fit" style="grid-template-columns: repeat(${cols}, 32px);">`;
  
  // 1. МНОЖИМОЕ (первая строка)
  for (let i = 0; i < cols - sA.length; i++) {
    html += '<div></div>';
  }
  sA.split('').forEach(c => {
    html += `<div class="w-8 h-8 bg-cyan-500 text-white rounded flex items-center justify-center text-lg font-bold shadow-sm">${c}</div>`;
  });
  
  // 2. МНОЖИТЕЛЬ (вторая строка)
  html += `<div class="w-8 h-8 flex items-center justify-center text-xl font-bold text-slate-400">×</div>`;
  for (let i = 0; i < cols - sB.length - 1; i++) {
    html += '<div></div>';
  }
  sB.split('').forEach(c => {
    html += `<div class="w-8 h-8 bg-slate-500 text-white rounded flex items-center justify-center text-lg font-bold shadow-sm">${c}</div>`;
  });
  
  // 3. СТРОКА ПЕРЕНОСОВ "В УМЕ" (пока пустая, заполнится при вводе)
  html += `<div class="col-span-full h-1"></div>`;
  for (let i = 0; i < cols - sA.length; i++) {
    html += '<div></div>';
  }
  for (let i = 0; i < sA.length; i++) {
    html += `<input type="text" maxlength="1" readonly class="w-8 h-6 text-center border-b-2 border-orange-200 bg-orange-50/30 text-orange-600 font-bold text-[10px] outline-none rounded-t-sm" placeholder="·" data-carry-col="${i}">`;
  }
  
  // Разделитель
  html += `<div class="col-span-full h-0.5 bg-slate-200 my-1 rounded-full"></div>`;
  
  // 4. ПРОМЕЖУТОЧНЫЕ СТРОКИ (неполные произведения)
  const digitsB = sB.split('').reverse();
  digitsB.forEach((digit, rowIndex) => {
    const rowVal = valA * parseInt(digit);
    let rowStr = (rowVal === 0) ? "0".repeat(sA.length) : rowVal.toString();
    const offsetR = rowIndex;
    const offsetL = cols - rowStr.length - offsetR;
    
    for (let i = 0; i < offsetL; i++) {
      html += '<div></div>';
    }
    
    rowStr.split('').forEach((c, colIdx) => {
      html += `<input type="text" inputmode="numeric" maxlength="1" 
        data-correct="${c}" 
        data-row="${rowIndex}" 
        data-col="${colIdx}"
        class="math-input w-8 h-8 text-center border-2 border-yellow-100 bg-yellow-50 rounded font-black text-base outline-none focus:border-blue-400 transition-all shadow-sm">`;
    });
    
    for (let i = 0; i < offsetR; i++) {
      html += '<div></div>';
    }
  });
  
  // Разделитель перед результатом (если больше 1 строки)
  if (sB.length > 1) {
    html += `<div class="col-span-full h-0.5 bg-slate-200 my-1 rounded-full"></div>`;
  }
  
  // 5. ИТОГОВЫЙ РЕЗУЛЬТАТ
  const fIdx = 99; // Уникальный индекс для результата
  const fOffset = cols - res.length;
  for (let i = 0; i < fOffset; i++) {
    html += '<div></div>';
  }
  res.split('').forEach((c, colIdx) => {
    html += `<input type="text" inputmode="numeric" maxlength="1" 
      data-correct="${c}" 
      data-row="${fIdx}"
      data-col="${colIdx}"
      class="math-input w-8 h-8 text-center border-2 border-blue-300 bg-blue-50 rounded font-black text-base outline-none shadow-sm focus:border-blue-500">`;
  });
  
  html += `</div>`;
  mathGrid.innerHTML = html;
  
  // Подключаем обработчики
  setupLogic();
  
  // Автофокус на первую ячейку первой строки (справа)
  const firstRowInputs = document.querySelectorAll('.math-input[data-row="0"]');
  if (firstRowInputs.length > 0) {
    firstRowInputs[firstRowInputs.length - 1].focus();
  }
}

// === ЛОГИКА ПРОВЕРКИ И НАВИГАЦИИ ===
function setupLogic() {
  const inputs = document.querySelectorAll('.math-input');
  
  inputs.forEach(el => {
    el.oninput = (e) => {
      const val = e.target.value;
      const ok = e.target.dataset.correct;
      const row = e.target.dataset.row;
      
      // Сброс стилей
      e.target.className = 'math-input w-8 h-8 text-center border-2 rounded font-black text-base outline-none transition-all shadow-sm';
      
      if (!val) {
        // Пустое поле - возвращаем базовый стиль
        e.target.classList.add(
          row === "99" ? 'border-blue-300' : 'border-yellow-100',
          row === "99" ? 'bg-blue-50' : 'bg-yellow-50'
        );
        return;
      }
      
      // Проверка правильности
      if (val === ok) {
        e.target.classList.add('bg-green-500', 'text-slate-900', 'border-green-600', 'font-black');
        
        // Автопереход на следующую ячейку
        const rowInputs = Array.from(document.querySelectorAll(`.math-input[data-row="${row}"]`));
        const currentIndex = rowInputs.indexOf(e.target);
        
        if (currentIndex > 0) {
          // Переход влево в той же строке
          rowInputs[currentIndex - 1].focus();
        } else {
          // Переход на следующую строку
          const allRows = [...new Set(Array.from(inputs).map(inp => parseInt(inp.dataset.row)))].sort((a, b) => a - b);
          const nextRowIdx = allRows[allRows.indexOf(parseInt(row)) + 1];
          
          if (nextRowIdx) {
            const nextInputs = Array.from(document.querySelectorAll(`.math-input[data-row="${nextRowIdx}"]`));
            if (nextInputs.length) {
              nextInputs[nextInputs.length - 1].focus();
            }
          }
        }
      } else {
        // Неправильный ответ - белый текст на красном
        e.target.classList.add('bg-red-500', 'text-white', 'border-red-600', 'font-black');
      }
    };
  });
}