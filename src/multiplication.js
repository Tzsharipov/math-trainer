import './style.css';
import { getRandom } from './multiplication/multiplicationHelpers.js';
import { buildGrid, setupLogic } from './multiplication/multiplicationGrid.js';

console.log('MULTIPLICATION.JS LOADED v11 (модульная версия)');

// DOM элементы
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
const checkMessage = document.querySelector('#checkMessage');
const btnClearAll = document.querySelector('#btnClearAll');
const settingsPanel = document.querySelector('#settingsPanel');
const btnNewExample = document.querySelector('#btnNewExample');

// Глобальное состояние
let currentA = 0;
let currentB = 0;
let carries = {};
let activeRow = { value: 0 }; // Используем объект чтобы передавать по ссылке

// Переключение режимов
document.querySelectorAll('input[name="mode"]').forEach(radio => {
  radio.onchange = (e) => {
    uiAuto.classList.toggle('hidden', e.target.value !== 'auto');
    uiManual.classList.toggle('hidden', e.target.value !== 'manual');
  };
});

// Генерация примера (автоматический режим)
btnGen.onclick = () => {
  currentA = getRandom(parseInt(selectA.value));
  currentB = getRandom(parseInt(selectB.value));
  buildGridWrapper();
};

// Начать решать (ручной режим)
btnStartMan.onclick = () => {
  const a = inA.value;
  const b = inB.value;
  if (a.length <= 7 && b.length <= 5 && a && b) {
    currentA = parseInt(a);
    currentB = parseInt(b);
    buildGridWrapper();
  } else {
    alert("Проверь числа!");
  }
};

// Очистить всё
btnClearAll.onclick = () => {
  if (currentA && currentB) {
    buildGridWrapper();
  }
};

// Новый пример
btnNewExample.onclick = () => {
  workspace.classList.add('hidden');
  workspace.classList.remove('flex');
  settingsPanel.classList.remove('hidden');
  mathGrid.innerHTML = '';
  checkMessage.textContent = '';
};

// Включение/выключение подсказок
checkHints.onchange = () => {
  if (currentA && currentB) buildGridWrapper();
};

// Обёртка для buildGrid
function buildGridWrapper() {
  buildGrid(
    currentA,
    currentB,
    settingsPanel,
    workspace,
    mathGrid,
    checkMessage,
    checkHints,
    carries,
    activeRow,
    setupLogic
  );
}

document.body.classList.add('loaded');
