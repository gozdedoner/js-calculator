let displayValue = "0";
let firstOperand = null;
let secondOperand = null;
let currentOperator = null;
let shouldResetScreen = false;

const display = document.getElementById("display");
const numberButtons = document.querySelectorAll(".number");
const operatorButtons = document.querySelectorAll(".operator");

numberButtons.forEach((button) =>
  button.addEventListener("click", () => appendNumber(button.textContent))
);

operatorButtons.forEach((button) =>
  button.addEventListener("click", () => setOperation(button.dataset.op))
);

document.getElementById("equals").addEventListener("click", evaluate);
document.getElementById("clear").addEventListener("click", clear);
document.getElementById("decimal").addEventListener("click", addDecimal);
document.getElementById("backspace").addEventListener("click", backspace);
document.getElementById("percent").addEventListener("click", percent); // YÜZDE

// Fonksiyonlar
function updateDisplay() {
  display.textContent = displayValue;
}

function appendNumber(num) {
  if (displayValue === "0" || shouldResetScreen) {
    displayValue = num;
    shouldResetScreen = false;
  } else {
    displayValue += num;
  }
  updateDisplay();
}

function addDecimal() {
  if (shouldResetScreen) resetScreen();
  if (!displayValue.includes(".")) {
    displayValue += ".";
    updateDisplay();
  }
}

function resetScreen() {
  displayValue = "";
  shouldResetScreen = false;
}

function clear() {
  displayValue = "0";
  firstOperand = null;
  secondOperand = null;
  currentOperator = null;
  shouldResetScreen = false;
  updateDisplay();
}

function backspace() {
  displayValue = displayValue.slice(0, -1) || "0";
  updateDisplay();
}

function setOperation(operator) {
  if (currentOperator !== null) evaluate();
  firstOperand = parseFloat(displayValue);
  currentOperator = operator;
  shouldResetScreen = true;
}

function evaluate() {
  if (currentOperator === null || shouldResetScreen) return;
  secondOperand = parseFloat(displayValue);
  let result = operate(currentOperator, firstOperand, secondOperand);
  displayValue = String(result);
  currentOperator = null;
  updateDisplay();
}

function operate(op, a, b) {
  if (op === "+") return a + b;
  if (op === "-") return a - b;
  if (op === "*") return a * b;
  if (op === "/") return b === 0 ? "😂 Nope" : a / b;
}

function percent() {
  displayValue = String(parseFloat(displayValue) / 100);
  updateDisplay();
}
