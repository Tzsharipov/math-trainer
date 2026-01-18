// Проверка правильности результата умножения

export function checkResult(checkMessage) {
  const resultInputs = Array.from(document.querySelectorAll('.math-input[data-row="99"]'));
  
  const allFilled = resultInputs.every(inp => inp.value !== '');
  if (!allFilled) return;
  
  const allCorrect = resultInputs.every(inp => inp.value === inp.dataset.correct);
  
  if (allCorrect) {
    checkMessage.textContent = 'Правильно! Молодец! 🎉';
    checkMessage.className = 'text-xl font-bold text-center mt-2 text-green-600';
    
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
    checkMessage.textContent = 'Попробуй ещё раз!';
    checkMessage.className = 'text-xl font-bold text-center mt-2 text-red-600';
  }
}
