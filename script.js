const display = document.getElementById('display');
const expressionDisplay = document.getElementById('expression');
const keys = document.getElementById('keys');
const historyList = document.getElementById('history');

const state = {
  expression: '',
  memory: 0,
  history: [],
};

const MAX_HISTORY = 12;

const tokenPattern = /(\d+\.?\d*|\.?\d+|[()+\-*/^])/g;

const updateDisplay = (value = '0') => {
  display.textContent = value;
  expressionDisplay.textContent = state.expression || ' '; 
};

const safeEval = (rawExpression) => {
  const sanitized = rawExpression.replace(/\s+/g, '');
  if (!/^[\d()+\-*/.^]+$/.test(sanitized)) throw new Error('Expresión inválida');

  const jsExpression = sanitized.replace(/\^/g, '**');
  const result = Function(`"use strict"; return (${jsExpression});`)();

  if (!Number.isFinite(result)) throw new Error('Resultado inválido');
  return Number(result.toFixed(12));
};

const getLastNumber = () => {
  const tokens = state.expression.match(tokenPattern) || [];
  for (let index = tokens.length - 1; index >= 0; index -= 1) {
    if (/^[\d.]+$/.test(tokens[index])) {
      return { value: tokens[index], startIndex: index };
    }
  }
  return null;
};

const replaceLastNumber = (newValue) => {
  const tokens = state.expression.match(tokenPattern) || [];
  const lastNumber = getLastNumber();

  if (!lastNumber) {
    state.expression += String(newValue);
    return;
  }

  tokens[lastNumber.startIndex] = String(newValue);
  state.expression = tokens.join('');
};

const addHistory = (entryExpression, result) => {
  state.history.unshift({ expression: entryExpression, result });
  if (state.history.length > MAX_HISTORY) state.history.pop();

  historyList.innerHTML = '';
  state.history.forEach((item) => {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `${item.expression} = ${item.result}`;
    button.dataset.result = item.result;
    li.appendChild(button);
    historyList.appendChild(li);
  });
};

const handleDigit = (digit) => {
  state.expression += digit;
  updateDisplay(state.expression);
};

const handleDecimal = () => {
  const lastNumber = getLastNumber();
  if (!lastNumber) {
    state.expression += '0.';
  } else if (!lastNumber.value.includes('.')) {
    state.expression += '.';
  }
  updateDisplay(state.expression || '0');
};

const handleOperator = (operator) => {
  if (!state.expression && operator !== '-') return;
  if (/[-+*/^]$/.test(state.expression)) {
    state.expression = state.expression.slice(0, -1) + operator;
  } else {
    state.expression += operator;
  }
  updateDisplay(state.expression || '0');
};

const applyUnary = (handler) => {
  const lastNumber = getLastNumber();
  if (!lastNumber) return;

  const value = Number(lastNumber.value);
  const nextValue = handler(value);
  if (!Number.isFinite(nextValue)) {
    updateDisplay('Error');
    return;
  }

  replaceLastNumber(Number(nextValue.toFixed(12)));
  updateDisplay(state.expression);
};

const evaluate = () => {
  if (!state.expression) return;
  try {
    const result = safeEval(state.expression);
    addHistory(state.expression, result);
    state.expression = String(result);
    updateDisplay(state.expression);
  } catch {
    state.expression = '';
    updateDisplay('Error');
  }
};

const clearEntry = () => {
  const lastNumber = getLastNumber();
  if (!lastNumber) {
    state.expression = '';
  } else {
    const tokens = state.expression.match(tokenPattern) || [];
    tokens[lastNumber.startIndex] = '0';
    state.expression = tokens.join('').replace(/^0+(\d)/, '$1');
  }
  updateDisplay(state.expression || '0');
};

const handleFunction = (value) => {
  const constants = {
    pi: Math.PI,
    e: Math.E,
  };

  if (constants[value] !== undefined) {
    state.expression += Number(constants[value].toFixed(12));
    updateDisplay(state.expression);
    return;
  }

  if (value === '(' || value === ')') {
    state.expression += value;
    updateDisplay(state.expression);
    return;
  }

  if (value === 'sign') applyUnary((num) => -num);
  if (value === 'square') applyUnary((num) => num ** 2);
  if (value === 'sqrt') applyUnary((num) => Math.sqrt(num));
  if (value === 'reciprocal') applyUnary((num) => 1 / num);
  if (value === 'percent') applyUnary((num) => num / 100);
  if (value === 'pow') state.expression += '^';

  updateDisplay(state.expression || '0');
};

const actions = {
  digit: (button) => handleDigit(button.dataset.value),
  decimal: handleDecimal,
  operator: (button) => handleOperator(button.dataset.value),
  equals: evaluate,
  'clear-all': () => {
    state.expression = '';
    updateDisplay('0');
  },
  'clear-entry': clearEntry,
  backspace: () => {
    state.expression = state.expression.slice(0, -1);
    updateDisplay(state.expression || '0');
  },
  func: (button) => handleFunction(button.dataset.value),
  'memory-clear': () => {
    state.memory = 0;
  },
  'memory-recall': () => {
    state.expression += String(state.memory || 0);
    updateDisplay(state.expression || '0');
  },
  'memory-add': () => {
    try {
      state.memory += safeEval(state.expression || '0');
    } catch {
      state.memory += 0;
    }
  },
  'memory-subtract': () => {
    try {
      state.memory -= safeEval(state.expression || '0');
    } catch {
      state.memory -= 0;
    }
  },
};

keys.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const action = button.dataset.action;
  const handler = actions[action];
  if (handler) handler(button);
});

historyList.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  state.expression = button.dataset.result;
  updateDisplay(state.expression);
});

document.addEventListener('keydown', (event) => {
  const { key } = event;
  if (/^[0-9]$/.test(key)) handleDigit(key);
  if (key === '.') handleDecimal();
  if (['+', '-', '*', '/'].includes(key)) handleOperator(key);
  if (key === '^') handleFunction('pow');
  if (key === 'Enter' || key === '=') evaluate();
  if (key === 'Backspace') actions.backspace();
  if (key === 'Delete') actions['clear-all']();
  if (key === '%') handleFunction('percent');
  if (key === '(' || key === ')') handleFunction(key);
});

updateDisplay('0');
