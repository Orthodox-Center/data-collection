const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let drawing = false;

ctx.lineWidth = 18; // Adjust thickness of pencil
ctx.lineCap = "round";
ctx.strokeStyle = "black";

async function loadAmharicCharacters(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) {
    console.error(`Dropdown with ID "${dropdownId}" not found.`);
    return;
  }
  try {
    const apiUrl = await getApiUrl();
    if (!apiUrl) {
      throw new Error("API URL could not be retrieved.");
    }
    // Show loading indicator
    dropdown.innerHTML = "<option>Loading...</option>";
    dropdown.disabled = true;

    fetch(`${apiUrl}/api/letter/grouped-by-family`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // Clear the loading indicator
        dropdown.innerHTML = "";
        dropdown.disabled = false;

        data.data.forEach((group) => {
          group.letters.forEach((letter) => {
            const option = document.createElement("option");
            option.value = letter.name;
            option.textContent = letter.name;
            option.dataset.position = letter.position;
            option.dataset.family = letter.family;
            option.dataset.rank = letter.rank;
            option.dataset.position = letter.position;
            option.dataset.translation = letter.translation;
            dropdown.appendChild(option);
          });
        });
      })
      .catch((error) => {
        console.error("Error fetching grouped letters:", error);
        dropdown.innerHTML = "<option>Error loading options</option>";
      });
  } catch (error) {
    console.error("Error fetching grouped letters:", error);
  }
}

async function getApiUrl() {
  try {
    const response = await fetch("config/config.json");
    const config = await response.json();
    const keys = config.find((item) => "API_URL" in item);
    if (!keys || !keys.API_URL) {
      console.warn("API URL is missing in config.json");
      return null;
    }
    return keys.API_URL;
  } catch (error) {
    console.error("Error reading API URL from config.json:", error.message);
    return null;
  }
}

async function saveLetter() {
  try {
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");

    // Set the temporary canvas size to 28x28
    tempCanvas.width = 28;
    tempCanvas.height = 28;
    const canvas = document.getElementById("canvas");
    // Draw the original canvas content onto the temporary canvas, resizing it
    tempCtx.drawImage(canvas, 0, 0, 28, 28);

    const imageData = tempCtx.getImageData(0, 0, 28, 28);
    const data = imageData.data;

    const canvasArray = [];
    const height = tempCanvas.height;
    const width = tempCanvas.width;

    for (let y = 0; y < height; y++) {
      let row = [];
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const a = data[index + 3]; // Alpha
        row.push(a);
      }
      canvasArray.push(row);
    }

    const selectedOption = document.querySelector(
      "#amharic-dropdown option:checked"
    );
    if (!selectedOption) {
      throw new Error("No option selected in the dropdown.");
    }

    const metadata = {
      name: selectedOption.value,
      position: selectedOption.dataset.position,
      family: selectedOption.dataset.family,
      rank: selectedOption.dataset.rank,
      translation: selectedOption.dataset.translation,
      image: JSON.stringify(canvasArray),
    };
    const apiUrl = await getApiUrl();
    if (!apiUrl) {
      throw new Error("API URL could not be retrieved.");
    }
    fetch(`${apiUrl}/api/letter/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata), // Send data
    })
      .then((response) => {
        if (!response.ok) {
          const errorMessage = document.getElementById("error-message");
          errorMessage.textContent = "Error. Please try again.";
          errorMessage.style.opacity = 1;
          setTimeout(() => {
            errorMessage.style.opacity = 0;
          }, 1000);
          throw new Error(`API request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const successMessage = document.getElementById("success-message");
        successMessage.textContent = "Success!";
        successMessage.style.opacity = 1;
        setTimeout(() => {
          successMessage.style.opacity = 0;
        }, 1000);
      })
      .catch((error) => {
        const errorMessage = document.getElementById("error-message");
        errorMessage.textContent = "Error. Please try again.";
        errorMessage.style.opacity = 1;
        setTimeout(() => {
          errorMessage.style.opacity = 0;
        }, 1000);
      });
    clearCanvas();
  } catch {
    const errorMessage = document.getElementById("error-message");
    errorMessage.textContent = "Error. Please try again.";
    errorMessage.style.opacity = 1;
    setTimeout(() => {
      errorMessage.style.opacity = 0;
    }, 1000);
  }
}

// Function to get correct position for touch/mouse events
function getPosition(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.touches ? e.touches[0].clientX : e.clientX) - rect.left,
    y: (e.touches ? e.touches[0].clientY : e.clientY) - rect.top,
  };
}

function startDrawing(e) {
  e.preventDefault();
  drawing = true;
  const pos = getPosition(e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
}

function draw(e) {
  if (!drawing) return;
  const pos = getPosition(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
}

function stopDrawing() {
  drawing = false;
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

document.addEventListener("DOMContentLoaded", function () {
  loadAmharicCharacters("amharic-dropdown");
});

// Event Listeners for Mouse
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseleave", stopDrawing);

// Event Listeners for Touch (Mobile Devices)
canvas.addEventListener("touchstart", startDrawing);
canvas.addEventListener("touchmove", draw);
canvas.addEventListener("touchend", stopDrawing);
canvas.addEventListener("touchcancel", stopDrawing);

const submitButton = document.getElementById("submit-button");
const dropdown = document.getElementById("amharic-dropdown");

if (submitButton && dropdown) {
  const toggleSubmitButton = () => {
    submitButton.disabled = dropdown.disabled;
    if (submitButton.disabled) {
      submitButton.style.cursor = "not-allowed";
      submitButton.style.backgroundColor = "#d3d3d3";
    } else {
      submitButton.style.cursor = "pointer";
      submitButton.style.backgroundColor = "";
    }
  };

  // Initial state
  toggleSubmitButton();

  // Observe changes to the dropdown's disabled property
  const observer = new MutationObserver(toggleSubmitButton);
  observer.observe(dropdown, {
    attributes: true,
    attributeFilter: ["disabled"],
  });
}
