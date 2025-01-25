const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

// Graph dimensions and scaling
const width = canvas.width;
const height = canvas.height;
let xMin = -2;
let xMax = 2;
let yMin = -2;
let yMax = 2;

// Clear the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, width, height);
    drawAxes(); // Redraw axes after clearing
}

// Draw the X and Y axes
function drawAxes() {
    ctx.strokeStyle = "#888";
    ctx.beginPath();
    // X-axis
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    // Y-axis
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
}

// Plot the graph based on the user's functions
function plotGraph() {
    const functions = [
        document.getElementById("functionInput1").value,
        document.getElementById("functionInput2").value,
        document.getElementById("functionInput3").value,
        document.getElementById("functionInput4").value
    ];

    const heartFunctions = [
        "y = x^0.5 - sqrt(1 - x^2)",
        "y = (-x)^0.5 + sqrt(1 - x^2)",
        "y = x^0.5 + sqrt(1 - x^2)",
        "y = (-x)^0.5 - sqrt(1 - x^2)"
    ];

    // Check if the entered functions match the heart shape equations (in any order)
    if (isHeartShape(functions, heartFunctions)) {
        drawHeartShape(); // Plot the heart shape
    } else {
        functions.forEach((func, index) => {
            if (func.trim() !== "") {
                let sanitizedInput = func.replace(/y\s*=\s*/i, "");
                sanitizedInput = sanitizedInput.replace(/\^/g, "**").replace(/sqrt\(/g, "Math.sqrt(");
                const parsedFunction = (x) => eval(sanitizedInput);

                // Adjust Y-range dynamically for each function
                adjustYRange(parsedFunction);

                // Draw the graph for this function
                drawGraph(parsedFunction, getColor(index));
            }
        });
    }
}

// Check if the entered functions match the heart shape functions (in any order)
function isHeartShape(functions, heartFunctions) {
    const lowerCaseFunctions = functions.map(f => f.trim().toLowerCase());
    return heartFunctions.every((hf) => lowerCaseFunctions.includes(hf.toLowerCase()));
}

// Function to plot the heart shape
function drawHeartShape() {
    // Define the functions for the heart shape (top and bottom curves)
    const heartFunctions = [
        (x) => Math.sqrt(1 - x * x) - Math.pow(x * x, 0.5),  // top-left curve
        (x) => Math.sqrt(1 - x * x) + Math.pow(x * x, 0.5),  // top-right curve
        (x) => -Math.pow(x * x, 0.5) + Math.sqrt(1 - x * x),  // bottom-left curve
        (x) => -Math.pow(x * x, 0.5) - Math.sqrt(1 - x * x)   // bottom-right curve
    ];

    // Plot the heart shape by adjusting for the four functions
    for (let i = 0; i < heartFunctions.length; i++) {
        drawGraph(heartFunctions[i], getColor(i)); // Draw each part of the heart
    }
}

// Draw the graph on the canvas for a specific function and color
function drawGraph(func, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3; // Thicker borders for the function lines
    ctx.beginPath();

    let firstPoint = true;

    for (let i = 0; i < width; i++) {
        const x = xMin + (i / width) * (xMax - xMin); // Map pixel x to graph x
        let y;

        try {
            y = func(x);
        } catch {
            continue;
        }

        const pixelX = i;
        const pixelY = height - ((y - yMin) / (yMax - yMin)) * height; // Map graph y to pixel y

        if (pixelY < 0 || pixelY > height) continue;

        if (firstPoint) {
            ctx.moveTo(pixelX, pixelY);
            firstPoint = false;
        } else {
            ctx.lineTo(pixelX, pixelY);
        }
    }

    ctx.stroke();
}

// Return the color for each function
function getColor(index) {
    const colors = ["red", "blue", "pink", "purple"];
    return colors[index % colors.length];
}

// Adjust the Y-range dynamically based on the graph's values
function adjustYRange(func) {
    let minY = Infinity;
    let maxY = -Infinity;

    for (let i = 0; i < width; i++) {
        const x = xMin + (i / width) * (xMax - xMin);
        let y;

        try {
            y = func(x);
        } catch {
            continue;
        }

        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    }

    yMin = minY - 1;
    yMax = maxY + 1;
}

// Initial draw to display axes
drawAxes();
