import './style.css';

const app = document.querySelector('#app');

app.innerHTML = `
<div class="min-h-screen bg-sky-50 p-2 md:p-6 font-sans text-slate-800 flex flex-col items-center">
  <div class="max-w-7xl w-full flex flex-col lg:flex-row gap-6 justify-center items-start">

    <aside class="w-full lg:w-72 bg-cyan-400 p-6 rounded-[2.5rem] shadow-xl text-white shrink-0">
      <h1 class="text-xl font-black mb-4 uppercase tracking-tight">Умножение</h1>

      <div class="bg-white/20 rounded-xl p-3 mb-6 text-[11px] font-bold border border-white/30 uppercase leading-relaxed">
        Лимиты разрядности:<br>
        Множимое: 7 | Множитель: 5
      </div>

      <div class="mb-6">
        <label class="flex items-center gap-3 p-3 rounded-2xl bg-yellow-400 text-slate-800 cursor-pointer hover:bg-yellow-300 transition-all shadow-md">
          <input type="checkbox" id="checkHints" class="w-5 h-5 accent-blue-600">
          <span class="font-black text-xs uppercase">Включить подсказки</span>
        </label>
      </div>

      <div class="flex flex-col gap-2 mb-6 text-sm">
        <label class="flex items-center gap-3 p-3 rounded-2xl bg-white/10 cursor-pointer hover:bg-white/20 transition-all">
          <input type="radio" name="mode" value="auto" checked class="w-4 h-4 accent-blue-600">
          <span class="font-bold">Придумай за меня</span>
        </label>
        <label class="flex items-center gap-3 p-3 rounded-2xl bg-white/10 cursor-pointer hover:bg-white/20 transition-all">
          <input type="radio" name="mode" value="manual" class="w-4 h-4 accent-blue-600">
          <span class="font-bold">Я напишу сам</span>
        </label>
      </div>

      <div id="ui-auto" class="space-y-4">
        <select id="selectA" class="w-full p-3 rounded-xl text-slate-800 font-bold outline-none border-none shadow-lg">
          ${[1,2,3,4,5,6,7].map(n => `<option value="${n}" ${n===3?'selected':''}>${n}-значное</option>`).join('')}
        </select>
        <select id="selectB" class="w-full p-3 rounded-xl text-slate-800 font-bold outline-none border-none shadow-lg">
          ${[1,2,3,4,5].map(n => `<option value="${n}" ${n===2?'selected':''}>${n}-значное</option>`).join('')}
        </select>
        <button id="btnGen" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-xl uppercase text-sm active:scale-95 transition-all">
          Создать пример
        </button>
      </div>

      <div id="ui-manual" class="space-y-4 hidden text-slate-800">
        <input type="number" id="inA" placeholder="Число 1 (max 7)" class="w-full p-3 rounded-xl font-bold outline-none shadow-inner border-2 border-transparent focus:border-green-400">
        <input type="number" id="inB" placeholder="Число 2 (max 5)" class="w-full p-3 rounded-xl font-bold outline-none shadow-inner border-2 border-transparent focus:border-green-400">
        <button id="btnStartMan" class="w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-xl uppercase text-sm shadow-xl transition-all">
          Начать решать
        </button>
      </div>
    </aside>

    <main id="workspace" class="hidden h-fit bg-white rounded-[3rem] shadow-2xl p-8 border-8 border-white flex justify-center items-center overflow-auto max-w-full">
      <div id="mathGrid" class="font-mono w-fit"></div>
    </main>

  </div>
</div>
`;

const workspace = document.querySelector('#workspace');
const mathGrid = document.querySelector('#mathGrid');
const checkHints = document.querySelector('#checkHints');

let currentA = 0;
let currentB = 0;

let g_sA = '';
let g_sB = '';
let g_cols = 0;
let g_digitsB_rev = [];
let g_activeRow = null;

// финальная строка результата
let g_resStr = '';
let g_finalOffsetL = 0;
let g_finalLen = 0;

// режимы
document.querySelectorAll('input[name="mode"]').forEach(radio => {
  radio.onchange = (e) => {
    document.querySelector('#ui-auto').classList.toggle('hidden', e.target.value !== 'auto');
    document.querySelector('#ui-manual').classList.toggle('hidden', e.target.value !== 'manual');
  };
});

document.querySelector('#btnGen').onclick = () => {
  currentA = getRandom(Number(document.querySelector('#selectA').value));
  currentB = getRandom(Number(document.querySelector('#selectB').value));
  buildGrid(currentA, currentB);
};

document.querySelector('#btnStartMan').onclick = () => {
  const a = document.querySelector('#inA').value;
  const b = document.querySelector('#inB').value;
  if (a && b && a.length <= 7 && b.length <= 5) {
    currentA = parseInt(a, 10);
    currentB = parseInt(b, 10);
    buildGrid(currentA, currentB);
  } else {
    alert("Проверь числа!");
  }
};

checkHints.onchange = () => updateHintsForActiveRow();

// ====== GRID BUILD ======
function buildGrid(valA, valB) {
  workspace.classList.remove('hidden');

  g_sA = String(valA);
  g_sB = String(valB);

  g_resStr = String(valA * valB);
  g_cols = Math.max(g_sA.length + g_sB.length, g_resStr.length) + 1;
  g_digitsB_rev = g_sB.split('').reverse().map(x => parseInt(x, 10));

  g_finalLen = g_resStr.length;
  g_finalOffsetL = g_cols - g_finalLen;

  let html = `<div class="grid gap-1 w-fit" style="grid-template-columns: repeat(${g_cols}, 32px);">`;

  // 1) A
  for (let i = 0; i < g_cols - g_sA.length; i++) html += '<div></div>';
  g_sA.split('').forEach(c => {
    html += `<div class="w-8 h-8 bg-cyan-500 text-white rounded flex items-center justify-center text-lg font-bold shadow-sm">${c}</div>`;
  });

  // 2) B
  html += `<div class="w-8 h-8 flex items-center justify-center text-xl font-bold text-slate-400">×</div>`;
  for (let i = 0; i < g_cols - g_sB.length - 1; i++) html += '<div></div>';
  g_sB.split('').forEach(c => {
    html += `<div class="w-8 h-8 bg-slate-500 text-white rounded flex items-center justify-center text-lg font-bold shadow-sm">${c}</div>`;
  });

  // ----- HINT ROW: полная сетка на g_cols -----
  html += `<div class="col-span-full h-1"></div>`;
  for (let col = 0; col < g_cols; col++) {
    html += `
      <input
        type="text"
        readonly
        tabindex="-1"
        data-hcol="${col}"
        class="w-8 h-6 text-center border-b-2 border-orange-200 bg-orange-50/30 text-orange-600 font-bold text-[16px] outline-none rounded-t-sm"
        placeholder="·"
        value=""
      >
    `;
  }

  html += `<div class="col-span-full h-0.5 bg-slate-200 my-1 rounded-full"></div>`;

  // 3) partial rows
  const digitsB = g_sB.split('').reverse();
  digitsB.forEach((digit, rowIndex) => {
    const rowVal = valA * parseInt(digit, 10);
    let rowStr = (rowVal === 0) ? "0".repeat(g_sA.length) : String(rowVal);

    const offsetR = rowIndex;
    const offsetL = g_cols - rowStr.length - offsetR;

    for (let i = 0; i < offsetL; i++) html += '<div></div>';

    rowStr.split('').forEach((c, j) => {
      const col = offsetL + j;
      html += `
        <input
          type="text"
          inputmode="numeric"
          maxlength="1"
          data-correct="${c}"
          data-row="${rowIndex}"
          data-col="${col}"
          class="math-input w-8 h-8 text-center border-2 border-yellow-100 bg-yellow-50 rounded font-black text-base outline-none focus:border-blue-400 transition-all shadow-sm"
        >
      `;
    });

    for (let i = 0; i < offsetR; i++) html += '<div></div>';
  });

  if (g_sB.length > 1) html += `<div class="col-span-full h-0.5 bg-slate-200 my-1 rounded-full"></div>`;

  // 4) final
  const fIdx = 99;
  for (let i = 0; i < g_finalOffsetL; i++) html += '<div></div>';
  g_resStr.split('').forEach((c, j) => {
    const col = g_finalOffsetL + j;
    html += `
      <input
        type="text"
        inputmode="numeric"
        maxlength="1"
        data-correct="${c}"
        data-row="${fIdx}"
        data-col="${col}"
        class="math-input w-8 h-8 text-center border-2 border-blue-300 bg-blue-50 rounded font-black text-base outline-none shadow-sm focus:border-blue-500"
      >
    `;
  });

  html += `</div>`;
  mathGrid.innerHTML = html;

  g_activeRow = null;
  clearHints();
  setupLogic();
}

// ====== INPUT LOGIC ======
function setupLogic() {
  const inputs = Array.from(document.querySelectorAll('.math-input'));

  inputs.forEach(el => {
    el.onfocus = () => {
      const r = el.dataset.row;
      setActiveRow(r ? parseInt(r, 10) : null);
    };
  });

  inputs.forEach(el => {
    el.oninput = (e) => {
      // только 1 цифра
      if (e.target.value && !/^\d$/.test(e.target.value)) e.target.value = '';

      const ok = e.target.dataset.correct;
      const row = e.target.dataset.row;

      e.target.className = 'math-input w-8 h-8 text-center border-2 rounded font-black text-base outline-none transition-all shadow-sm';

      if (!e.target.value) {
        e.target.classList.add(row === "99" ? 'border-blue-300' : 'border-yellow-100', row === "99" ? 'bg-blue-50' : 'bg-yellow-50');
        updateHintsForActiveRow();
        return;
      }

      if (e.target.value === ok) {
        e.target.classList.add('bg-green-500', 'text-white', 'border-green-600');
        updateHintsForActiveRow();

        // переход фокуса
        const rowIns = Array.from(document.querySelectorAll(`.math-input[data-row="${row}"]`));
        const i = rowIns.indexOf(e.target);

        if (i > 0) {
          rowIns[i - 1].focus();
        } else {
          const allRows = [...new Set(inputs.map(inp => parseInt(inp.dataset.row, 10)))]
            .sort((a, b) => a - b);

          const curr = parseInt(row, 10);
          const nextRowIdx = allRows[allRows.indexOf(curr) + 1];

          if (nextRowIdx !== undefined) {
            const nextIns = Array.from(document.querySelectorAll(`.math-input[data-row="${nextRowIdx}"]`));
            if (nextIns.length) nextIns[nextIns.length - 1].focus();
          }
        }
      } else {
        e.target.classList.add('bg-red-500', 'text-white', 'border-red-600');
        updateHintsForActiveRow();
      }
    };
  });
}

function setActiveRow(rowIndexOrNull) {
  if (rowIndexOrNull === null || Number.isNaN(rowIndexOrNull)) {
    g_activeRow = null;
    clearHints();
    return;
  }

  if (g_activeRow !== rowIndexOrNull) {
    g_activeRow = rowIndexOrNull;
    clearHints();
  }

  updateHintsForActiveRow();
}

// ====== HINTS ======
function updateHintsForActiveRow() {
  if (!checkHints.checked) {
    clearHints();
    return;
  }
  if (g_activeRow === null) {
    clearHints();
    return;
  }

  // подсказки для строки результата (сложение неполных произведений)
  if (g_activeRow === 99) {
    updateAdditionHintsForFinalRow();
    return;
  }

  // подсказки для неполных произведений (умножение на цифру)
  updateMultiplicationHintsForRow(g_activeRow);
}

function updateMultiplicationHintsForRow(rowIdx) {
  if (rowIdx < 0 || rowIdx >= g_digitsB_rev.length) {
    clearHints();
    return;
  }

  const rowInputs = Array.from(document.querySelectorAll(`.math-input[data-row="${rowIdx}"]`));
  if (!rowInputs.length) {
    clearHints();
    return;
  }

  let filledFromRight = 0;
  for (let i = rowInputs.length - 1; i >= 0; i--) {
    if (rowInputs[i].value && /^\d$/.test(rowInputs[i].value)) filledFromRight++;
    else break;
  }

  clearHints();
  if (filledFromRight === 0) return;

  const digitB = g_digitsB_rev[rowIdx];

  // геометрия строки (так же как buildGrid)
  const rowVal = parseInt(g_sA, 10) * digitB;
  let rowStr = (rowVal === 0) ? "0".repeat(g_sA.length) : String(rowVal);

  const offsetR = rowIdx;
  const offsetL = g_cols - rowStr.length - offsetR;

  // перенос после каждого шага ввода справа налево
  const carryAfterStep = calcCarriesBySteps(g_sA, digitB); // t=0..lenA-1

  const maxStepsToShow = Math.min(filledFromRight, carryAfterStep.length);

  for (let t = 0; t < maxStepsToShow; t++) {
    const c = carryAfterStep[t];
    if (!c) continue;

    // перенос ставим над следующей колонкой слева от введённой цифры
    const col = offsetL + rowStr.length - 2 - t;
    const safeCol = (col >= 0) ? col : (offsetL - 1);
    setHintAtCol(safeCol, c);
  }
}

function updateAdditionHintsForFinalRow() {
  const rowInputs = Array.from(document.querySelectorAll(`.math-input[data-row="99"]`));
  if (!rowInputs.length) {
    clearHints();
    return;
  }

  // сколько введено подряд справа
  let filledFromRight = 0;
  for (let i = rowInputs.length - 1; i >= 0; i--) {
    if (rowInputs[i].value && /^\d$/.test(rowInputs[i].value)) filledFromRight++;
    else break;
  }

  clearHints();
  if (filledFromRight === 0) return;

  // правый край результата
  const rightmostCol = g_finalOffsetL + g_finalLen - 1;

  // берём правильные цифры неполных произведений из data-correct (они не зависят от того, что ввёл ребёнок)
  // и считаем переносы сложения справа налево
  let carry = 0;

  // показываем перенос после каждого введённого шага
  for (let step = 0; step < filledFromRight; step++) {
    const col = rightmostCol - step;

    const sumCol = sumCorrectDigitsInColumn(col); // сумма всех неполных произведений в этой колонке
    const total = sumCol + carry;

    const newCarry = Math.floor(total / 10);
    // перенос после ввода цифры в колонке col должен появиться над колонкой col-1
    if (newCarry > 0) setHintAtCol(col - 1, newCarry);

    carry = newCarry;
  }

  // если дошли до самого левого разряда результата и перенос ещё остался — он уже будет виден над колонкой левее,
  // это нормальная школьная запись
}

function sumCorrectDigitsInColumn(col) {
  // суммируем только неполные произведения (row 0..lenB-1)
  let sum = 0;
  for (let r = 0; r < g_digitsB_rev.length; r++) {
    const cell = document.querySelector(`.math-input[data-row="${r}"][data-col="${col}"]`);
    if (!cell) continue;
    const d = cell.dataset.correct;
    if (d && /^\d$/.test(d)) sum += parseInt(d, 10);
  }
  return sum;
}

function clearHints() {
  document.querySelectorAll('[data-hcol]').forEach(el => (el.value = ''));
}

function setHintAtCol(col, value) {
  if (col < 0) return;
  const el = document.querySelector(`[data-hcol="${col}"]`);
  if (!el) return;
  el.value = String(value);
}

// переносы после шага умножения (для неполных произведений)
function calcCarriesBySteps(strA, bDigit) {
  const A = strA.split('').map(d => parseInt(d, 10));
  const n = A.length;

  let carry = 0;
  const out = new Array(n).fill(0);

  for (let i = n - 1, t = 0; i >= 0; i--, t++) {
    const prod = A[i] * bDigit + carry;
    carry = Math.floor(prod / 10);
    out[t] = carry;
  }
  return out;
}

function getRandom(d) {
  const min = Math.pow(10, d - 1);
  const max = Math.pow(10, d) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
