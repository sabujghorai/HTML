
const input = document.getElementById("inputBox");
const buttons = document.querySelectorAll("button");

let expression = "";

function updateDisplay() {
    input.value = expression;
}

function calculate() {
    try {
        if (expression === "") return;

        // Convert percentage values, e.g. 50% to 50/100
        const percentageExpression = expression.replace(
            /(\d+(?:\.\d+)?)%/g,
            "($1/100)"
        );

        // Allow only calculator characters
        if (!/^[0-9+\-*/().\s]+$/.test(percentageExpression)) {
            throw new Error("Invalid expression");
        }

        const result = Function(
            `"use strict"; return (${percentageExpression})`
        )();

        if (!Number.isFinite(result)) {
            throw new Error("Invalid result");
        }

        expression = String(result);
        updateDisplay();

    } catch {
        input.value = "Error";
        expression = "";
    }
}

function handleInput(value) {
    if (value === "=" || value === "Enter") {
        calculate();
    }
    else if (value === "AC" || value === "Escape") {
        expression = "";
        updateDisplay();
    }
    else if (value === "DEL" || value === "Backspace") {
        expression = expression.slice(0, -1);
        updateDisplay();
    }
    else if (/^[0-9+\-*/.%]$/.test(value) || value === "00" || value === ".") {
        expression += value;
        updateDisplay();
    }
}

// Handle calculator button clicks
buttons.forEach(button => {
    button.addEventListener("click", () => {
        handleInput(button.textContent.trim());
    });
});

// Handle keyboard input
document.addEventListener("keydown", (event) => {
    const key = event.key;

    if (/^[0-9+\-*/.%]$/.test(key)) {
        handleInput(key);
    }
    else if (key === "Enter" || key === "=") {
        event.preventDefault();
        handleInput("Enter");
    }
    else if (key === "Backspace") {
        event.preventDefault();
        handleInput("Backspace");
    }
    else if (key === "Escape") {
        handleInput("Escape");
    }
});