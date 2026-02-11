import './style.css';
import { getRandom } from './basics/basicsHelpers.js';
import { buildGrid } from './basics/basicsGrid.js';

console.log('BASICS.JS LOADED v2 - NO ARROWS');

// DOM элементы
const workspace = document.querySelector('#workspace');
const mathGrid = document.querySelector('#mathGrid');
const selectDigits = document.querySelector('#selectDigits');
const btnGen = document.querySelector('#btnGen');
const btnClearAll = document.querySelector('#btnClearAll');
const settingsPanel = document.querySelector('#settingsPanel');
const btnNewExample = document.querySelector('#btnNewExample');
const btnBackToSettings = document.querySelector('#btnBackToSettings');
const checkMessage = document.querySelector('#checkMessage');
const hintPopup = document.querySelector('#hintPopup');
const hintText = document.querySelector('#hintText');
const sideHint = document.querySelector('#sideHint');
const sideHintText = document.querySelector('#sideHintText');

// Элементы для ручного режима
const uiAuto = document.querySelector('#ui-auto');
const uiManual = document.querySelector('#ui-manual');
const inMultiplicand = document.querySelector('#inMultiplicand');
const inMultiplier = document.querySelector('#inMultiplier');
const btnStartMan = document.querySelector('#btnStartMan');

let currentMultiplicand = 0;
let currentMultiplier = 0;

// Переключение режимов
document.querySelectorAll('input[name="mode"]').forEach(radio => {
  radio.onchange = (e) => {
    uiAuto.classList.toggle('hidden', e.target.value !== 'auto');
    uiManual.classList.toggle('hidden', e.target.value !== 'manual');
  };
});

// Генерация примера (автоматический режим)
btnGen.onclick = () => {
  const digits = parseInt(selectDigits.value);
  currentMultiplicand = getRandom(digits);
  currentMultiplier = getRandom(1);
  buildGrid(currentMultiplicand, currentMultiplier, settingsPanel, workspace, mathGrid, checkMessage, hintPopup, hintText, sideHint, sideHintText);
};

// Начать решать (ручной режим)
btnStartMan.onclick = () => {
  const a = inMultiplicand.value;
  const b = inMultiplier.value;
  
  if (a.length <= 4 && b.length === 1 && a && b && parseInt(b) >= 1 && parseInt(b) <= 9) {
    currentMultiplicand = parseInt(a);
    currentMultiplier = parseInt(b);
    buildGrid(currentMultiplicand, currentMultiplier, settingsPanel, workspace, mathGrid, checkMessage, hintPopup, hintText, sideHint, sideHintText);
  } else {
    alert("Проверь числа! Множимое до 4 цифр, множитель от 1 до 9.");
  }
};

// Очистить всё
btnClearAll.onclick = () => {
  if (currentMultiplicand && currentMultiplier) {
    buildGrid(currentMultiplicand, currentMultiplier, settingsPanel, workspace, mathGrid, checkMessage, hintPopup, hintText, sideHint, sideHintText);
    sideHint.classList.add('hidden');
  }
};

// Новый пример
btnNewExample.onclick = () => {
  if (currentMultiplicand && currentMultiplier) {
    const mode = document.querySelector('input[name="mode"]:checked').value;
    const digits = String(currentMultiplicand).length;
    currentMultiplicand = getRandom(digits);
    currentMultiplier = getRandom(1);
    buildGrid(currentMultiplicand, currentMultiplier, settingsPanel, workspace, mathGrid, checkMessage, hintPopup, hintText, sideHint, sideHintText);
  }
};

// Назад к настройкам
btnBackToSettings.onclick = () => {
  workspace.classList.add('hidden');
  workspace.classList.remove('flex');
  settingsPanel.classList.remove('hidden');
  
  mathGrid.innerHTML = '';
  checkMessage.textContent = '';
  hintPopup.classList.add('hidden');
  sideHint.classList.add('hidden');
};

document.body.classList.add('loaded');
