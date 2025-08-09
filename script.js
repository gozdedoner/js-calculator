const display = document.getElementById("display");
const buttons = document.querySelectorAll(".btn");

const DIV_ZERO_MSG = "Error: division by zero!";
const DECIMAL_LIMIT = 4;

let currentDisplayValue = "0";
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;
let justEvaluated = false;
let error = false;

let theme = localStorage.getItem("theme") || "light";

window.onload = () => {
  document.body.classList.add(`${theme}-mode`);
  updateDisplay(currentDisplayValue);
};

function updateDisplay(value) {
  if (typeof value === "number") value = roundResult(value);
  currentDisplayValue = String(value);

  if (error) display.classList.add("display-error");
  else display.classList.remove("display-error");

  display.textContent = currentDisplayValue;
  fitDisplayByLength(currentDisplayValue);
}

function fitDisplayByLength(text) {
  display.classList.remove("display-sm", "display-xs", "display-xxs");
  const len = text.length;
  const is320 = window.innerWidth <= 320;
  const is400 = window.innerWidth <= 400;

  if (len > (is320 ? 9 : is400 ? 11 : 12)) {
    display.classList.add("display-xxs");
  } else if (len > (is320 ? 7 : is400 ? 9 : 10)) {
    display.classList.add("display-xs");
  } else if (len > (is320 ? 6 : is400 ? 7 : 8)) {
    display.classList.add("display-sm");
  }
}

function roundResult(num) {
  if (!Number.isFinite(num)) return num;
  return parseFloat(num.toFixed(DECIMAL_LIMIT));
}

function setError(msg = DIV_ZERO_MSG) {
  error = true;
  justEvaluated = false;
  waitingForSecondOperand = false;
  operator = null;
  firstOperand = null;
  updateActiveOperatorButton(null);
  updateDisplay(msg);
}

function resetAfterErrorIfNeeded() {
  if (error) {
    error = false;
    currentDisplayValue = "0";
    updateDisplay(currentDisplayValue);
  }
}

function updateActiveOperatorButton(op) {
  document
    .querySelectorAll(".btn.is-active")
    .forEach((b) => b.classList.remove("is-active"));
  if (!op) return;
  const btn = document.querySelector(`.btn[data-op="${op}"]`);
  if (btn) btn.classList.add("is-active");
}

function clearCalculator() {
  currentDisplayValue = "0";
  firstOperand = null;
  operator = null;
  waitingForSecondOperand = false;
  justEvaluated = false;
  error = false;
  updateActiveOperatorButton(null);
  updateDisplay(currentDisplayValue);
}

function inputNumber(number) {
  resetAfterErrorIfNeeded();
  if (waitingForSecondOperand || justEvaluated) {
    currentDisplayValue = number;
    waitingForSecondOperand = false;
    justEvaluated = false;
  } else {
    currentDisplayValue =
      currentDisplayValue === "0" ? number : currentDisplayValue + number;
  }
  updateDisplay(currentDisplayValue);
}

function inputDecimal() {
  resetAfterErrorIfNeeded();
  if (waitingForSecondOperand || justEvaluated) {
    currentDisplayValue = "0.";
    waitingForSecondOperand = false;
    justEvaluated = false;
  } else if (!currentDisplayValue.includes(".")) {
    currentDisplayValue += ".";
  }
  updateDisplay(currentDisplayValue);
}

function handleOperator(nextOperator) {
  resetAfterErrorIfNeeded();
  const inputValue = parseFloat(currentDisplayValue);

  if (operator && waitingForSecondOperand) {
    operator = nextOperator;
    updateActiveOperatorButton(nextOperator);
    return;
  }

  if (firstOperand === null) {
    firstOperand = inputValue;
  } else if (operator) {
    const result = operate(operator, firstOperand, inputValue);
    if (typeof result === "string") {
      setError(result);
      return;
    }
    updateDisplay(result);
    firstOperand = result;
  }

  waitingForSecondOperand = true;
  justEvaluated = false;
  operator = nextOperator;
  updateActiveOperatorButton(nextOperator);
}

function equals() {
  if (firstOperand === null || operator === null || waitingForSecondOperand)
    return;

  const inputValue = parseFloat(currentDisplayValue);
  const result = operate(operator, firstOperand, inputValue);

  if (typeof result === "string") {
    setError(result);
    return;
  }

  updateDisplay(result);
  firstOperand = null;
  operator = null;
  waitingForSecondOperand = true;
  justEvaluated = true;
  updateActiveOperatorButton(null);
}

function operate(operatorSymbol, a, b) {
  switch (operatorSymbol) {
    case "+":
      return add(a, b);
    case "-":
      return subtract(a, b);
    case "*":
      return multiply(a, b);
    case "/":
      if (b === 0) return DIV_ZERO_MSG;
      return divide(a, b);
    default:
      return b;
  }
}

const add = (a, b) => a + b;
const subtract = (a, b) => a - b;
const multiply = (a, b) => a * b;
const divide = (a, b) => a / b;

function backspace() {
  if (error) {
    clearCalculator();
    return;
  }
  if (waitingForSecondOperand || justEvaluated) {
    currentDisplayValue = "0";
    waitingForSecondOperand = false;
    justEvaluated = false;
  } else if (currentDisplayValue.length > 1) {
    currentDisplayValue = currentDisplayValue.slice(0, -1);
  } else {
    currentDisplayValue = "0";
  }
  updateDisplay(currentDisplayValue);
}

function toggleSign() {
  if (error) {
    clearCalculator();
    return;
  }
  if (currentDisplayValue === "0" || currentDisplayValue === "0.") return;
  currentDisplayValue = String(parseFloat(currentDisplayValue) * -1);
  updateDisplay(currentDisplayValue);
}

function percent() {
  if (error) {
    clearCalculator();
    return;
  }
  currentDisplayValue = String(parseFloat(currentDisplayValue) / 100);
  updateDisplay(currentDisplayValue);
}

buttons.forEach((button) => {
  button.addEventListener("click", (event) => {
    const key = event.target.dataset.key || event.target.id;

    if (key === "clear") {
      clearCalculator();
      return;
    }
    if (key === "backspace") {
      backspace();
      return;
    }
    if (key === "decimal") {
      inputDecimal();
      return;
    }

    const opData = event.target.dataset.op;
    if (["+", "-", "*", "/"].includes(opData)) {
      handleOperator(opData);
      return;
    }

    if (key === "equals") {
      equals();
      return;
    }
    if (key === "plus-minus") {
      toggleSign();
      return;
    }
    if (key === "percent") {
      percent();
      return;
    }

    const txt = event.target.textContent;
    if (!isNaN(parseFloat(txt))) inputNumber(txt);
  });
});

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (key >= "0" && key <= "9") {
    inputNumber(key);
    return;
  }
  if (key === ".") {
    inputDecimal();
    return;
  }

  if (key === "+" || key === "-" || key === "*" || key === "/") {
    handleOperator(key);
    return;
  }

  if (key === "Enter" || key === "=") {
    event.preventDefault();
    equals();
    return;
  }

  if (key === "Backspace") {
    backspace();
    return;
  }
  if (key.toLowerCase() === "c") {
    clearCalculator();
    return;
  }
});

document.addEventListener("keydown", (e) => {
  if (e.altKey && e.key.toLowerCase() === "t") {
    theme = theme === "dark" ? "light" : "dark";
    document.body.classList.remove("dark-mode", "light-mode");
    document.body.classList.add(`${theme}-mode`);
    localStorage.setItem("theme", theme);
  }
});
