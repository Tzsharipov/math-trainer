// Вспомогательные функции для модуля "Старт: Умножаем на одно число"

export function getRandom(digits) {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
