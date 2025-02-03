const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

// Graph dimensions and scaling
const width = canvas.width;
const height = canvas.height;
let xMin = -10;
let xMax = 10;
let yMin = -10;
let yMax = 10;

// Clear the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, width, height);
    drawAxes(); // Redraw axes after clearing
}

// Draw the X and Y axes
function drawAxes() {
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1;

    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
}

// Check if the entered functions match the heart criteria
function isHeartShape(functions) {
    const heartFunctions = [
        "y = x^0.5 - sqrt(1 - x^2)",
        "y = (-x)^0.5 - sqrt(1 - x^2)",
        "y = x^0.5 + sqrt(1 - x^2)",
        "y = (-x)^0.5 + sqrt(1 - x^2)"
    ];

    // Sort and compare the functions to match the heart shape pattern
    const sortedFunctions = functions.map(func => func.replace(/\s+/g, '').toLowerCase()).sort();
    const sortedHeartFunctions = heartFunctions.map(func => func.replace(/\s+/g, '').toLowerCase()).sort();
    return JSON.stringify(sortedFunctions) === JSON.stringify(sortedHeartFunctions);
}

// Parse and sanitize a user-provided function
function parseFunction(input) {
    try {
        const sanitizedInput = input
            .replace(/y\s*=\s*/i, "") // Remove "y ="
            .replace(/([0-9])([a-zA-Z])/g, "$1*$2") // Add '*' between number and variable (e.g., 2x -> 2*x)
            .replace(/\^/g, "**") // Replace ^ with **
            .replace(/sqrt\(/g, "Math.sqrt(") // Replace sqrt with Math.sqrt
            .replace(/pi/gi, "Math.PI") // Replace pi with Math.PI
            .replace(/e/gi, "Math.E"); // Replace e with Math.E
        return (x) => eval(sanitizedInput); // Create a function of x
    } catch {
        return null; // Return null if the function is invalid
    }
}

// Plot the graph based on the user's functions
function plotGraph() {
    const functions = [
        document.getElementById("functionInput1").value,
        document.getElementById("functionInput2").value,
        document.getElementById("functionInput3").value,
        document.getElementById("functionInput4").value
    ];

    const colors = ["blue", "red", "green", "purple"];

    // Check if the functions match the heart pattern
    if (isHeartShape(functions)) {
        plotHeartShape(); // Plot the heart shape if detected
    } else {
        clearCanvas(); // Clear canvas before plotting
        drawAxes(); // Redraw axes

        functions.forEach((func, index) => {
            if (func.trim() !== "") {
                const parsedFunc = parseFunction(func);
                if (parsedFunc) {
                    drawGraph(parsedFunc, colors[index]);
                } else {
                    console.warn(`Invalid function: ${func}`);
                }
            }
        });
    }
}

// Plot the heart shape by drawing the specific four functions
function plotHeartShape() {
    const heartFunctions = [
        "x^0.5 - sqrt(1 - x^2)",
        "(-x)^0.5 - sqrt(1 - x^2)",
        "x^0.5 + sqrt(1 - x^2)",
        "(-x)^0.5 + sqrt(1 - x^2)"
    ];

    const colors = ["blue", "red", "green", "purple"];

    clearCanvas(); // Clear canvas before plotting
    drawAxes(); // Redraw axes

    heartFunctions.forEach((funcStr, index) => {
        const parsedFunc = parseFunction(funcStr);
        if (parsedFunc) {
            drawGraph(parsedFunc, colors[index]);
        }
    });
}

// Draw the graph on the canvas for a specific function and color
function drawGraph(func, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2; // Thicker line for better visibility
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

        const pixelX = ((x - xMin) / (xMax - xMin)) * width; // Map graph x to pixel x
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

// Initial draw to display axes
drawAxes();

// Zooming functionality (mouse wheel)
canvas.addEventListener("wheel", (e) => {
    e.preventDefault(); // Prevent default scroll behavior

    const zoomFactor = 1.1; // Zoom in/out factor
    const zoomDirection = e.deltaY < 0 ? 1 : -1; // Zoom in if wheel scrolls up, out if down

    const zoomAmount = zoomDirection === 1 ? zoomFactor : 1 / zoomFactor;
    const centerX = (xMin + xMax) / 2;
    const centerY = (yMin + yMax) / 2;

    const newWidth = (xMax - xMin) * zoomAmount;
    const newHeight = (yMax - yMin) * zoomAmount;

    xMin = centerX - newWidth / 2;
    xMax = centerX + newWidth / 2;
    yMin = centerY - newHeight / 2;
    yMax = centerY + newHeight / 2;

    clearCanvas();
    plotGraph();
});
