// Проверка правильности результата умножения

export function checkResult(checkMessage) {
  const resultInputs = Array.from(document.querySelectorAll('.math-input[data-row="99"]'));
  
  const allFilled = resultInputs.every(inp => inp.value !== '');
  if (!allFilled) return;
  
  const allCorrect = resultInputs.every(inp => inp.value === inp.dataset.correct);
  
  if (allCorrect) {
    const childName = localStorage.getItem('childName');
    const message = childName 
      ? `Правильно! Умничка, ${childName}! 🎉` 
      : 'Правильно! Молодец! 🎉';
    
    // Выводим поздравление в нижнюю подсказку
    const sideHint = document.getElementById('sideHint');
    const sideHintText = document.getElementById('sideHintText');
    const sideHintBox = sideHint?.querySelector('div');
    if (sideHintText) sideHintText.textContent = message;
    if (sideHintBox) sideHintBox.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    if (sideHint) sideHint.style.visibility = 'visible';
    
    checkMessage.textContent = '';
    checkMessage.className = 'text-xl font-bold text-center mt-1 min-h-[0]';
    
    if (window.confetti) {
      // Первый залп
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { x: 0.5, y: 0.6 },
        colors: ['#FFD700', '#FF6347', '#00CED1', '#32CD32', '#FF69B4'],
        scalar: 1.5
      });
      
      // Второй залп (через 300мс)
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { x: 0.5, y: 0.6 },
          colors: ['#FFD700', '#FF6347', '#00CED1'],
          scalar: 1.5
        });
      }, 300);
      
      // Третий залп (через 600мс)
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { x: 0.5, y: 0.6 },
          colors: ['#32CD32', '#FF69B4', '#FFD700'],
          scalar: 1.5
        });
      }, 600);
    }
  } else {
    const childName = localStorage.getItem('childName');
    const message = childName 
      ? `Попробуй ещё раз, ${childName}! 💪` 
      : 'Попробуй ещё раз!';
    
    const sideHint = document.getElementById('sideHint');
    const sideHintText = document.getElementById('sideHintText');
    const sideHintBox = sideHint?.querySelector('div');
    if (sideHintText) sideHintText.textContent = message;
    if (sideHintBox) sideHintBox.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    if (sideHint) sideHint.style.visibility = 'visible';
    
    checkMessage.textContent = '';
    checkMessage.className = 'text-xl font-bold text-center mt-1 min-h-[0]';
  }
}
