const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

// Graph dimensions and scaling
const width = canvas.width;
const height = canvas.height;
let xMin = -2;
let xMax = 2;
let yMin = -2;
let yMax = 2;
let dragStart = null;  // For panning

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
        // If heart shape detected, plot the functions without alert
        plotHeartShape();
    } else {
        // Otherwise, plot the entered functions normally
        try {
            for (let i = 0; i < functions.length; i++) {
                if (functions[i].trim() !== "") {
                    let sanitizedInput = functions[i].replace(/y\s*=\s*/i, "");
                    sanitizedInput = sanitizedInput.replace(/\^/g, "**").replace(/sqrt\(/g, "Math.sqrt(");
                    const parsedFunction = (x) => eval(sanitizedInput);

                    // Draw the graph for this function
                    drawGraph(parsedFunction, colors[i]);
                }
            }
        } catch (err) {
            alert("Invalid input! Please check your function.");
        }
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

    heartFunctions.forEach((funcStr, index) => {
        let sanitizedInput = funcStr.replace(/\^/g, "**").replace(/sqrt\(/g, "Math.sqrt(");
        const parsedFunction = (x) => eval(sanitizedInput);
        drawGraph(parsedFunction, colors[index]);
    });
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

// Initial draw to display axes
drawAxes();

// Panning functionality (dragging the mouse) is removed as requested

// Zooming functionality (mouse wheel)

canvas.addEventListener("wheel", (e) => {
    e.preventDefault(); // Prevent default scroll behavior

    const zoomFactor = 1.1; // Zoom in/out factor
    const zoomDirection = e.deltaY < 0 ? 1 : -1; // Zoom in if wheel scrolls up, out if down

    // Calculate the center point of the zoom based on mouse position
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;
    const zoomAmount = zoomDirection === 1 ? zoomFactor : 1 / zoomFactor;

    // Calculate the new ranges for xMin, xMax, yMin, and yMax based on the zoom amount
    const newWidth = (xMax - xMin) * zoomAmount;
    const newHeight = (yMax - yMin) * zoomAmount;

    // Adjust the ranges so that the zoom happens centered on the mouse position
    xMin = xMin + (mouseX / width) * (xMax - xMin) - (mouseX / width) * newWidth;
    xMax = xMax - (mouseX / width) * (xMax - xMin) + (mouseX / width) * newWidth;
    yMin = yMin + (mouseY / height) * (yMax - yMin) - (mouseY / height) * newHeight;
    yMax = yMax - (mouseY / height) * (yMax - yMin) + (mouseY / height) * newHeight;

    clearCanvas(); // Clear and redraw after zooming
    plotGraph(); // Replot the graph with the new range
});
