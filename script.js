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

    const colors = ["blue", "red", "green", "purple"];

    try {
        // For each function, process and plot
        for (let i = 0; i < functions.length; i++) {
            if (functions[i].trim() !== "") {
                let sanitizedInput = functions[i].replace(/y\s*=\s*/i, "");
                sanitizedInput = sanitizedInput.replace(/\^/g, "**").replace(/sqrt\(/g, "Math.sqrt(");
                const parsedFunction = (x) => eval(sanitizedInput);

                // Adjust Y-range dynamically for each function
                adjustYRange(parsedFunction);

                // Draw the graph for this function
                drawGraph(parsedFunction, colors[i]);
            }
        }
    } catch (err) {
        alert("Invalid input! Please check your function.");
    }
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

    // Adjust the Y-range to ensure the top of the heart is on top
    if (minY < 0) {
        yMin = -1.5; // Ensure it doesn't dip too low
    } else {
        yMin = minY - 1;
    }

    yMax = maxY + 1;
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

// Zooming functionality (mouse wheel)
canvas.addEventListener("wheel", (e) => {
    e.preventDefault(); // Prevent default scroll behavior

    const zoomFactor = 1.1; // Zoom in/out factor
    const zoomDirection = e.deltaY < 0 ? 1 : -1; // Zoom in if wheel scrolls up, out if down

    // Zoom the graph in or out
    const zoomAmount = zoomDirection === 1 ? zoomFactor : 1 / zoomFactor;
    const centerX = (xMin + xMax) / 2;
    const centerY = (yMin + yMax) / 2;

    const widthChange = (xMax - xMin) * (zoomAmount - 1);
    const heightChange = (yMax - yMin) * (zoomAmount - 1);

    // Update the X and Y ranges based on the zoom
    xMin += widthChange / 2;
    xMax -= widthChange / 2;
    yMin += heightChange / 2;
    yMax -= heightChange / 2;

    clearCanvas(); // Clear and redraw after zooming
    plotGraph(); // Replot the graph with the new range
});
