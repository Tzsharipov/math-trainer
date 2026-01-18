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

let currentMultiplicand = 0; // Множимое (многозначное)
let currentMultiplier = 0;   // Множитель (однозначное)

// Генерация примера
btnGen.onclick = () => {
  const digits = parseInt(selectDigits.value);
  currentMultiplicand = getRandom(digits);
  currentMultiplier = getRandom(1); // Однозначное (1-9)
  buildGrid(currentMultiplicand, currentMultiplier, settingsPanel, workspace, mathGrid, checkMessage, hintPopup, hintText, hintArrows, sideHint, sideHintText, sideHintArrows);
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
