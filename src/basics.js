import './style.css';
import { getRandom } from './basics/basicsHelpers.js';
import { buildGrid } from './basics/basicsGrid.js';

console.log('BASICS.JS LOADED v1');

// DOM элементы
const workspace = document.querySelector('#workspace');
const mathGrid = document.querySelector('#mathGrid');
const selectDigits = document.querySelector('#selectDigits');
const btnGen = document.querySelector('#btnGen');
const btnClearAll = document.querySelector('#btnClearAll');
const settingsPanel = document.querySelector('#settingsPanel');
const btnNewExample = document.querySelector('#btnNewExample');
const checkMessage = document.querySelector('#checkMessage');
const hintPopup = document.querySelector('#hintPopup');
const hintText = document.querySelector('#hintText');
const hintArrows = document.querySelector('#hintArrows');
const sideHint = document.querySelector('#sideHint');
const sideHintText = document.querySelector('#sideHintText');
const sideHintArrows = document.querySelector('#sideHintArrows');

// Элементы для ручного режима
const uiAuto = document.querySelector('#ui-auto');
const uiManual = document.querySelector('#ui-manual');
const inMultiplicand = document.querySelector('#inMultiplicand');
const inMultiplier = document.querySelector('#inMultiplier');
const btnStartMan = document.querySelector('#btnStartMan');

let currentMultiplicand = 0; // Множимое (многозначное)
let currentMultiplier = 0;   // Множитель (однозначное)

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
  currentMultiplier = getRandom(1); // Однозначное (1-9)
  buildGrid(currentMultiplicand, currentMultiplier, settingsPanel, workspace, mathGrid, checkMessage, hintPopup, hintText, hintArrows, sideHint, sideHintText, sideHintArrows);
};

// Начать решать (ручной режим)
btnStartMan.onclick = () => {
  const a = inMultiplicand.value;
  const b = inMultiplier.value;
  
  // Проверка: множимое до 4 цифр, множитель однозначный
  if (a.length <= 4 && b.length === 1 && a && b && parseInt(b) >= 1 && parseInt(b) <= 9) {
    currentMultiplicand = parseInt(a);
    currentMultiplier = parseInt(b);
    buildGrid(currentMultiplicand, currentMultiplier, settingsPanel, workspace, mathGrid, checkMessage, hintPopup, hintText, hintArrows, sideHint, sideHintText, sideHintArrows);
  } else {
    alert("Проверь числа! Множимое до 4 цифр, множитель от 1 до 9.");
  }
};

// Очистить всё
btnClearAll.onclick = () => {
  if (currentMultiplicand && currentMultiplier) {
    buildGrid(currentMultiplicand, currentMultiplier, settingsPanel, workspace, mathGrid, checkMessage, hintPopup, hintText, hintArrows, sideHint, sideHintText, sideHintArrows);
    sideHint.classList.add('hidden');
  }
};

// Новый пример
btnNewExample.onclick = () => {
  workspace.classList.add('hidden');
  workspace.classList.remove('flex');
  settingsPanel.classList.remove('hidden');
  
  mathGrid.innerHTML = '';
  checkMessage.textContent = '';
  hintPopup.classList.add('hidden');
  sideHint.classList.add('hidden');
};

document.body.classList.add('loaded');
