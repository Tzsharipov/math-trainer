import './style.css';
import { getRandom } from './basics/basicsHelpers.js';
import { buildGrid } from './basics/basicsGrid.js';

console.log('BASICS.JS LOADED v1');

// DOM ÑÐ»ÐµÐ¼ÐµÐ½Ñ‚Ñ‹
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
const hintArrows = document.querySelector('#hintArrows');
const sideHint = document.querySelector('#sideHint');
const sideHintText = document.querySelector('#sideHintText');
const sideHintArrows = document.querySelector('#sideHintArrows');

// Ð­Ð»ÐµÐ¼ÐµÐ½Ñ‚Ñ‹ Ð´Ð»Ñ Ñ€ÑƒÑ‡Ð½Ð¾Ð³Ð¾ Ñ€ÐµÐ¶Ð¸Ð¼Ð°
const uiAuto = document.querySelector('#ui-auto');
const uiManual = document.querySelector('#ui-manual');
const inMultiplicand = document.querySelector('#inMultiplicand');
const inMultiplier = document.querySelector('#inMultiplier');
const btnStartMan = document.querySelector('#btnStartMan');

let currentMultiplicand = 0; // ÐœÐ½Ð¾Ð¶Ð¸Ð¼Ð¾Ðµ (Ð¼Ð½Ð¾Ð³Ð¾Ð·Ð½Ð°Ñ‡Ð½Ð¾Ðµ)
let currentMultiplier = 0;   // ÐœÐ½Ð¾Ð¶Ð¸Ñ‚ÐµÐ»ÑŒ (Ð¾Ð´Ð½Ð¾Ð·Ð½Ð°Ñ‡Ð½Ð¾Ðµ)

// ÐŸÐµÑ€ÐµÐºÐ»ÑŽÑ‡ÐµÐ½Ð¸Ðµ Ñ€ÐµÐ¶Ð¸Ð¼Ð¾Ð²
document.querySelectorAll('input[name="mode"]').forEach(radio => {
  radio.onchange = (e) => {
    uiAuto.classList.toggle('hidden', e.target.value !== 'auto');
    uiManual.classList.toggle('hidden', e.target.value !== 'manual');
  };
});

// Ð“ÐµÐ½ÐµÑ€Ð°Ñ†Ð¸Ñ Ð¿Ñ€Ð¸Ð¼ÐµÑ€Ð° (Ð°Ð²Ñ‚Ð¾Ð¼Ð°Ñ‚Ð¸Ñ‡ÐµÑÐºÐ¸Ð¹ Ñ€ÐµÐ¶Ð¸Ð¼)
btnGen.onclick = () => {
  const digits = parseInt(selectDigits.value);
  currentMultiplicand = getRandom(digits);
  currentMultiplier = getRandom(1); // ÐžÐ´Ð½Ð¾Ð·Ð½Ð°Ñ‡Ð½Ð¾Ðµ (1-9)
  buildGrid(currentMultiplicand, currentMultiplier, settingsPanel, workspace, mathGrid, checkMessage, hintPopup, hintText, hintArrows, sideHint, sideHintText, sideHintArrows);
};

// ÐÐ°Ñ‡Ð°Ñ‚ÑŒ Ñ€ÐµÑˆÐ°Ñ‚ÑŒ (Ñ€ÑƒÑ‡Ð½Ð¾Ð¹ Ñ€ÐµÐ¶Ð¸Ð¼)
btnStartMan.onclick = () => {
  const a = inMultiplicand.value;
  const b = inMultiplier.value;
  
  // ÐŸÑ€Ð¾Ð²ÐµÑ€ÐºÐ°: Ð¼Ð½Ð¾Ð¶Ð¸Ð¼Ð¾Ðµ Ð´Ð¾ 4 Ñ†Ð¸Ñ„Ñ€, Ð¼Ð½Ð¾Ð¶Ð¸Ñ‚ÐµÐ»ÑŒ Ð¾Ð´Ð½Ð¾Ð·Ð½Ð°Ñ‡Ð½Ñ‹Ð¹
  if (a.length <= 4 && b.length === 1 && a && b && parseInt(b) >= 1 && parseInt(b) <= 9) {
    currentMultiplicand = parseInt(a);
    currentMultiplier = parseInt(b);
    buildGrid(currentMultiplicand, currentMultiplier, settingsPanel, workspace, mathGrid, checkMessage, hintPopup, hintText, hintArrows, sideHint, sideHintText, sideHintArrows);
  } else {
    alert("ÐŸÑ€Ð¾Ð²ÐµÑ€ÑŒ Ñ‡Ð¸ÑÐ»Ð°! ÐœÐ½Ð¾Ð¶Ð¸Ð¼Ð¾Ðµ Ð´Ð¾ 4 Ñ†Ð¸Ñ„Ñ€, Ð¼Ð½Ð¾Ð¶Ð¸Ñ‚ÐµÐ»ÑŒ Ð¾Ñ‚ 1 Ð´Ð¾ 9.");
  }
};

// ÐžÑ‡Ð¸ÑÑ‚Ð¸Ñ‚ÑŒ Ð²ÑÑ‘
btnClearAll.onclick = () => {
  if (currentMultiplicand && currentMultiplier) {
    buildGrid(currentMultiplicand, currentMultiplier, settingsPanel, workspace, mathGrid, checkMessage, hintPopup, hintText, hintArrows, sideHint, sideHintText, sideHintArrows);
    sideHint.classList.add('hidden');
  }
};

// Новый пример (генерирует с теми же разрядностями)
btnNewExample.onclick = () => {
  if (currentMultiplicand && currentMultiplier) {
    // Определяем текущий режим
    const mode = document.querySelector('input[name="mode"]:checked').value;
    
    if (mode === 'auto') {
      // Генерируем новое число с той же разрядностью
      const digits = String(currentMultiplicand).length;
      currentMultiplicand = getRandom(digits);
      currentMultiplier = getRandom(1); // Множитель всегда однозначный
    } else {
      // В ручном режиме тоже генерируем с той же разрядностью
      const digits = String(currentMultiplicand).length;
      currentMultiplicand = getRandom(digits);
      currentMultiplier = getRandom(1);
    }
    
    buildGrid(currentMultiplicand, currentMultiplier, settingsPanel, workspace, mathGrid, checkMessage, hintPopup, hintText, hintArrows, sideHint, sideHintText, sideHintArrows);
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
