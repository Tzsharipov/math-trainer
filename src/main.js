import './style.css';

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

checkHints.onchange = () => {
  syncActiveRowFromDOM();
  updateHintsForActiveRow();
};

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

  // ✅ СРАЗУ ставим курсор в первое поле ввода неполного произведения (самое правое в первой строке)
  focusFirstPartialCell();
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
      if (e.target.value && !/^\d$/.test(e.target.value)) e.target.value = '';

      const ok = e.target.dataset.correct;
      const row = e.target.dataset.row;

      if (g_activeRow === null && row != null) setActiveRow(parseInt(row, 10));

      e.target.className = 'math-input w-8 h-8 text-center border-2 rounded font-black text-base outline-none transition-all shadow-sm';

      if (!e.target.value) {
        e.target.classList.add(row === "99" ? 'border-blue-300' : 'border-yellow-100', row === "99" ? 'bg-blue-50' : 'bg-yellow-50');
        syncActiveRowFromDOM();
        updateHintsForActiveRow();
        return;
      }

      if (e.target.value === ok) {
        e.target.classList.add('bg-green-500', 'text-white', 'border-green-600');

        syncActiveRowFromDOM();
        updateHintsForActiveRow();

        const rowIns = Array.from(document.querySelectorAll(`.math-input[data-row="${row}"]`));
        const i = rowIns.indexOf(e.target);

        if (i > 0) {
          rowIns[i - 1].focus();
        } else {
          const allRows = [...new Set(inputs.map(inp => parseInt(inp.dataset.row, 10)))].sort((a, b) => a - b);

          const curr = parseInt(row, 10);
          const nextRowIdx = allRows[allRows.indexOf(curr) + 1];

          if (nextRowIdx !== undefined) {
            const nextIns = Array.from(document.querySelectorAll(`.math-input[data-row="${nextRowIdx}"]`));
            if (nextIns.length) nextIns[nextIns.length - 1].focus();
          }
        }
      } else {
        e.target.classList.add('bg-red-500', 'text-white', 'border-red-600');
        syncActiveRowFromDOM();
        updateHintsForActiveRow();
      }
    };
  });
}

function focusFirstPartialCell() {
  // первая строка неполного произведения — row="0"
  // "первый ввод" обычно справа, значит берем последний инпут в этой строке
  const row0 = Array.from(document.querySelectorAll(`.math-input[data-row="0"]`));
  if (!row0.length) return;

  const first = row0[row0.length - 1];
  first.focus();
  // на всякий случай обновим активный ряд и подсказки
  syncActiveRowFromDOM();
  updateHintsForActiveRow();
}

function syncActiveRowFromDOM() {
  const el = document.activeElement;
  if (!el) return;
  if (!el.classList || !el.classList.contains('math-input')) return;
  const r = el.dataset.row;
  if (r == null) return;
  const n = parseInt(r, 10);
  if (!Number.isNaN(n)) g_activeRow = n;
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
  if (g_activeRow === null) syncActiveRowFromDOM();

  if (!checkHints.checked) {
    clearHints();
    return;
  }
  if (g_activeRow === null) {
    clearHints();
    return;
  }

  if (g_activeRow === 99) {
    if (!areAllPartialProductsSolved()) {
      clearHints();
      return;
    }
    updateAdditionHintsForFinalRow();
    return;
  }

  updateMultiplicationHintsForRow(g_activeRow);
}

function areAllPartialProductsSolved() {
  const partials = Array.from(document.querySelectorAll('.math-input')).filter(el => {
    const r = Number(el.dataset.row);
    return Number.isFinite(r) && r >= 0 && r < g_digitsB_rev.length;
  });

  if (!partials.length) return false;

  for (const el of partials) {
    const v = el.value;
    const ok = el.dataset.correct;
    if (!v || !/^\d$/.test(v)) return false;
    if (v !== ok) return false;
  }
  return true;
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

  const rowVal = parseInt(g_sA, 10) * digitB;
  let rowStr = (rowVal === 0) ? "0".repeat(g_sA.length) : String(rowVal);

  const offsetR = rowIdx;
  const offsetL = g_cols - rowStr.length - offsetR;

  const carryAfterStep = calcCarriesBySteps(g_sA, digitB);
  const maxStepsToShow = Math.min(filledFromRight, carryAfterStep.length);

  for (let t = 0; t < maxStepsToShow; t++) {
    const c = carryAfterStep[t];
    if (!c) continue;

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

  let filledFromRight = 0;
  for (let i = rowInputs.length - 1; i >= 0; i--) {
    if (rowInputs[i].value && /^\d$/.test(rowInputs[i].value)) filledFromRight++;
    else break;
  }

  clearHints();
  if (filledFromRight === 0) return;

  const rightmostCol = g_finalOffsetL + g_finalLen - 1;

  let carry = 0;
  for (let step = 0; step < filledFromRight; step++) {
    const col = rightmostCol - step;

    const sumCol = sumCorrectDigitsInColumn(col);
    const total = sumCol + carry;

    const newCarry = Math.floor(total / 10);
    if (newCarry > 0) setHintAtCol(col - 1, newCarry);

    carry = newCarry;
  }
}

function sumCorrectDigitsInColumn(col) {
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
