// DOM elements
const display = document.getElementById("display");
const buttons = document.querySelectorAll(".btn");
const historyDiv = document.getElementById("history");

let currentDisplayValue = "0";
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;
let theme = localStorage.getItem("theme") || "light";

window.onload = () => {
  document.body.classList.add(`${theme}-mode`);

  const savedHistory = JSON.parse(localStorage.getItem("calcHistory")) || [];
  savedHistory.forEach((item) => addToHistory(item.expression, item.result));

  updateDisplay(currentDisplayValue);
  window.addEventListener("resize", adjustFontSize);
};

function updateDisplay(value) {
  if (typeof value === "number") {
    value = roundResult(value);
  }
  currentDisplayValue = String(value);
  display.textContent = currentDisplayValue;
  adjustFontSize();
}

function adjustFontSize() {
  const displayWidth = display.offsetWidth;
  const textWidth = display.scrollWidth;

  const maxDisplayFontSizePx = 48;
  const minDisplayFontSizePx = 24;

  let currentMaxFontSize = maxDisplayFontSizePx;
  let currentMinFontSize = minDisplayFontSizePx;

  if (window.innerWidth <= 400) {
    currentMaxFontSize = 40;
  }
  if (window.innerWidth <= 320) {
    currentMaxFontSize = 32;
    currentMinFontSize = 20;
  }

  if (textWidth > displayWidth) {
    const ratio = displayWidth / textWidth;
    let newSizePx = currentMaxFontSize * ratio;
    if (newSizePx < currentMinFontSize) {
      newSizePx = currentMinFontSize;
    }
    display.style.fontSize = `${newSizePx}px`;
  } else {
    if (currentDisplayValue === "Sıfıra Bölme!") {
      display.style.fontSize = `${currentMinFontSize}px`;
    } else {
      display.style.fontSize = `${currentMaxFontSize}px`;
    }
  }
}

function roundResult(number) {
  return Math.round(number * 100000000) / 100000000;
}

function clearCalculator() {
  currentDisplayValue = "0";
  firstOperand = null;
  operator = null;
  waitingForSecondOperand = false;
  updateDisplay(currentDisplayValue);
  if (historyDiv) {
    historyDiv.innerHTML = "";
    localStorage.removeItem("calcHistory");
  }
}

function inputNumber(number) {
  if (waitingForSecondOperand) {
    currentDisplayValue = number;
    waitingForSecondOperand = false;
  } else {
    currentDisplayValue =
      currentDisplayValue === "0" ? number : currentDisplayValue + number;
  }
  updateDisplay(currentDisplayValue);
}

function inputDecimal() {
  if (waitingForSecondOperand) {
    currentDisplayValue = "0.";
    waitingForSecondOperand = false;
  } else if (!currentDisplayValue.includes(".")) {
    currentDisplayValue += ".";
  }
  updateDisplay(currentDisplayValue);
}

function handleOperator(nextOperator) {
  const inputValue = parseFloat(currentDisplayValue);

  if (operator && waitingForSecondOperand) {
    operator = nextOperator;
    return;
  }

  if (firstOperand === null) {
    firstOperand = inputValue;
  } else if (operator) {
    const result = operate(operator, firstOperand, inputValue);
    updateDisplay(result);
    firstOperand = result;
  }

  waitingForSecondOperand = true;
  operator = nextOperator;
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
      if (b === 0) {
        return "Sıfıra Bölme!";
      }
      return divide(a, b);
    default:
      return b;
  }
}

function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  return a / b;
}

function backspace() {
  if (currentDisplayValue === "Sıfıra Bölme!") {
    clearCalculator();
    return;
  }
  if (currentDisplayValue.length > 1) {
    currentDisplayValue = currentDisplayValue.slice(0, -1);
  } else {
    currentDisplayValue = "0";
  }
  updateDisplay(currentDisplayValue);
}

function toggleSign() {
  if (currentDisplayValue === "Sıfıra Bölme!") {
    clearCalculator();
    return;
  }
  currentDisplayValue = String(parseFloat(currentDisplayValue) * -1);
  updateDisplay(currentDisplayValue);
}

function percent() {
  if (currentDisplayValue === "Sıfıra Bölme!") {
    clearCalculator();
    return;
  }
  currentDisplayValue = String(parseFloat(currentDisplayValue) / 100);
  updateDisplay(currentDisplayValue);
}

function addToHistory(expression, result) {
  if (!historyDiv) return;

  const p = document.createElement("p");
  p.textContent = `${expression} = ${result}`;
  p.classList.add("history-item");
  p.addEventListener("click", () => {
    const parts = expression.split(" ");
    if (parts.length === 3) {
      firstOperand = parseFloat(parts[0]);
      operator = parts[1];
      currentDisplayValue = parts[2];
      updateDisplay(currentDisplayValue);
      waitingForSecondOperand = false;
    }
  });
  historyDiv.appendChild(p);
  historyDiv.scrollTop = historyDiv.scrollHeight;

  const currentHistory = JSON.parse(localStorage.getItem("calcHistory")) || [];
  currentHistory.push({ expression, result });
  localStorage.setItem("calcHistory", JSON.stringify(currentHistory));
}

buttons.forEach((button) => {
  button.addEventListener("click", (event) => {
    const key = event.target.dataset.key || event.target.id;
    if (key === "clear") {
      clearCalculator();
    } else if (key === "backspace") {
      backspace();
    } else if (key === "decimal") {
      inputDecimal();
    } else if (["+", "-", "*", "/"].includes(event.target.dataset.op)) {
      handleOperator(event.target.dataset.op);
    } else if (key === "equals") {
      if (
        firstOperand !== null &&
        operator !== null &&
        !waitingForSecondOperand
      ) {
        const inputValue = parseFloat(currentDisplayValue);
        const result = operate(operator, firstOperand, inputValue);
        addToHistory(`${firstOperand} ${operator} ${inputValue}`, result);
        updateDisplay(result);
        firstOperand = null;
        operator = null;
        waitingForSecondOperand = true;
      }
    } else if (key === "plus-minus") {
      toggleSign();
    } else if (key === "percent") {
      percent();
    } else if (!isNaN(parseFloat(event.target.textContent))) {
      inputNumber(event.target.textContent);
    }
  });
});

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (key >= "0" && key <= "9") {
    inputNumber(key);
  } else if (key === ".") {
    inputDecimal();
  } else if (key === "+" || key === "-" || key === "*" || key === "/") {
    handleOperator(key);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    if (
      firstOperand !== null &&
      operator !== null &&
      !waitingForSecondOperand
    ) {
      const inputValue = parseFloat(currentDisplayValue);
      const result = operate(operator, firstOperand, inputValue);
      addToHistory(`${firstOperand} ${operator} ${inputValue}`, result);
      updateDisplay(result);
      firstOperand = null;
      operator = null;
      waitingForSecondOperand = true;
    }
  } else if (key === "Backspace") {
    backspace();
  } else if (key.toLowerCase() === "c") {
    clearCalculator();
  } else if (key.toLowerCase() === "h") {
    if (historyDiv) {
      historyDiv.innerHTML = "";
      localStorage.removeItem("calcHistory");
    }
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
