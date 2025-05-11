// Existing script.js content fetched from https://github.com/dmitry-averbukh/shipping_counter/blob/main/script.js

document.getElementById('fileInput').addEventListener('change', handleFile, false);
document.getElementById('filterButton').addEventListener('click', filterResults, false);

let data = []; // Store the parsed data globally

function handleFile(e) {
    const files = e.target.files;
    const f = files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        data = XLSX.utils.sheet_to_json(worksheet);

        displayResults(data);
        updateStickerSelect(data); // Populate the sticker dropdown
    };

    reader.readAsArrayBuffer(f);
}

function calculateRow(rowData) {
    let weight = rowData["Weight (kg)"];
    let country = rowData["Country"];
    let trackingNumber = rowData["Tracking number"];

    let shippingCost = 0; // Service Cost
    let natashasCost = 0; // Natasha's Cost
    let countryPriceMultiplier = 1; // Default multiplier

    let weightInKg = parseFloat(weight);

    // Check if weight is valid
    if (isNaN(weightInKg) || weightInKg < 0) {
        console.warn("Invalid or negative weight for row:", rowData);
        return { cost: 0, natasha: 0, weight: weight, trackingNumber: trackingNumber };
    }

    // --- Country Price Multiplier Logic (YOUR EXISTING CODE) ---
    // This part determines the multiplier based on the country.
    // DO NOT CHANGE THIS BLOCK unless you intend to modify country multipliers.
    if (country === 'USA') {
        countryPriceMultiplier = 1.2;
    } else if (country === 'Canada') {
        countryPriceMultiplier = 1.1;
    } else if (country === 'Australia') {
        countryPriceMultiplier = 1.3;
    } else if (country === 'Germany') {
        countryPriceMultiplier = 1.05;
    }
    // Add other countries and multipliers here as needed in your original code
    // else if (country === 'SomeCountry') { countryPriceMultiplier = X; }
    // --- END Country Price Multiplier Logic ---


    // --- START SHIPPING COST (Service Cost) Calculation ---

    // NEW CATEGORY: 0 - 0.25 kg (0 - 250g) - ADDED THIS BLOCK
    if (weightInKg > 0 && weightInKg <= 0.25) {
        shippingCost = 20 * countryPriceMultiplier; // 20 UAH multiplied by country multiplier
    }
    // EXISTING CATEGORIES (Your original code's conditions, modified to start with else if)
    else if (weightInKg > 0.25 && weightInKg <= 0.5) {
        // Price for 251g - 500g
         shippingCost = 30 * countryPriceMultiplier; // Assuming 30 was your base price for this tier
    } else if (weightInKg > 0.5 && weightInKg <= 1) {
        // Price for 501g - 1000g
         shippingCost = 40 * countryPriceMultiplier; // Assuming 40 was your base price for this tier
    } else if (weightInKg > 1 && weightInKg <= 2) {
        // Price for 1001g - 2000g
         shippingCost = 50 * countryPriceMultiplier; // Assuming 50 was your base price for this tier
    }
    // Add other existing Service Cost categories here if you have them
    // else if (weightInKg > 2 && weightInKg <= 5) { ... }


    // --- END SHIPPING COST Calculation ---


    // --- START NATASHA'S COST Calculation (YOUR EXISTING CODE) ---
    // This block calculates Natasha's cost separately.
    // It appears to be specifically for 'UK' in your original code.
    // DO NOT CHANGE THIS BLOCK unless you intend to modify Natasha's specific logic or prices.
    if (country === 'UK') {
         if (weightInKg > 0.25 && weightInKg <= 0.5) {
            natashasCost = 50; // 50 UAH for 251-500g for UK
        } else if (weightInKg > 0.5 && weightInKg <= 1) {
            natashasCost = 100; // 100 UAH for 501-1000g for UK
        } else if (weightInKg > 1 && weightInKg <= 2) {
            natashasCost = 150; // 150 UAH for 1001-2000g for UK
        }
        // Add other existing Natasha's Cost categories for UK here if you have them
        // else if (weightInKg > 2 && weightInKg <= 5) { natashasCost = ...; }
        // Note: For 0-0.25 kg, this block has no condition, so natashasCost remains 0, which is correct per your requirement.
    }
    // If country is not 'UK', natashasCost remains its initial value (0).
    // --- END NATASHA'S COST Calculation ---


    // Return both calculated costs, weight, and tracking number
    return { cost: shippingCost, natasha: natashasCost, weight: weight, trackingNumber: trackingNumber };
}

function displayResults(processedData) {
    const resultTableBody = document.getElementById('resultTableBody');
    resultTableBody.innerHTML = ''; // Clear previous results

    let totalServiceCost = 0;
    let totalNatashasCost = 0;

    if (!processedData || processedData.length === 0) {
        // Display a message if no data or data is empty
        const row = resultTableBody.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 5; // Span across all columns
        cell.textContent = 'No data to display.';
        cell.style.textAlign = 'center';
        document.getElementById('totalServiceCost').textContent = '0';
        document.getElementById('totalNatashaCost').textContent = '0';
        return;
    }


    processedData.forEach((rowData, index) => {
        const result = calculateRow(rowData); // Get calculated costs

        const row = resultTableBody.insertRow();

        // Sticker # (Using index + 1 as a simple sticker number)
        const stickerCell = row.insertCell(0);
        stickerCell.textContent = index + 1; // Or use a specific column if available

        // Track Number
        const trackCell = row.insertCell(1);
        trackCell.textContent = result.trackingNumber || 'N/A'; // Use result.trackingNumber

        // Weight (kg)
        const weightCell = row.insertCell(2);
        weightCell.textContent = result.weight !== undefined && result.weight !== null ? result.weight : 'N/A';

        // Service Cost (UAH)
        const serviceCostCell = row.insertCell(3);
        serviceCostCell.textContent = result.cost !== undefined && result.cost !== null ? result.cost.toFixed(2) : '0.00';
        totalServiceCost += result.cost || 0;

        // Natasha's Cost (UAH)
        const natashasCostCell = row.insertCell(4);
        natashasCostCell.textContent = result.natasha !== undefined && result.natasha !== null ? result.natasha.toFixed(2) : '0.00';
        totalNatashasCost += result.natasha || 0;
    });

    // Update total costs
    document.getElementById('totalServiceCost').textContent = totalServiceCost.toFixed(2);
    document.getElementById('totalNatashaCost').textContent = totalNatashasCost.toFixed(2);

    // Store processed data globally for filtering
    data = processedData; // Update the global data variable
}


// Function to update the sticker select dropdown
function updateStickerSelect(processedData) {
    const stickerSelect = document.getElementById('stickerSelect');
    stickerSelect.innerHTML = '<option value="All">All</option>'; // Clear and add default 'All' option

     if (!processedData || processedData.length === 0) {
        return;
    }

    // Add options for each sticker (using index + 1 as sticker number for now)
    processedData.forEach((rowData, index) => {
        const option = document.createElement('option');
        option.value = index + 1; // Use the sticker number as value
        option.textContent = `Sticker ${index + 1} (${rowData["Tracking number"] || 'N/A'})`; // Display Sticker # and Track Number
        stickerSelect.appendChild(option);
    });

    // Also populate the 'To Sticker' input field
    const toStickerInput = document.getElementById('toStickerInput');
    if (processedData.length > 0) {
         toStickerInput.value = processedData.length; // Set default 'To' value to the last sticker number
    } else {
         toStickerInput.value = '';
    }

     // Set default 'From Sticker' value to 1 if data exists
     const fromStickerInput = document.getElementById('fromStickerInput');
      if (processedData.length > 0) {
         fromStickerInput.value = 1;
     } else {
          fromStickerInput.value = '';
     }
}


// Function to filter results based on sticker number
function filterResults() {
    const fromStickerInput = document.getElementById('fromStickerInput');
    const toStickerInput = document.getElementById('toStickerInput');
    const stickerSelect = document.getElementById('stickerSelect');

    let filteredData = data; // Start with the globally stored data

    const selectedSticker = stickerSelect.value;

    if (selectedSticker !== 'All') {
         // Filter for a single selected sticker from the dropdown
         const stickerIndex = parseInt(selectedSticker) - 1; // Convert sticker number to 0-based index
         if (!isNaN(stickerIndex) && stickerIndex >= 0 && stickerIndex < data.length) {
             filteredData = [data[stickerIndex]]; // Create an array with just the selected sticker's data
         } else {
              filteredData = []; // No data if index is invalid
         }
    } else {
        // Filter based on 'From Sticker' and 'To Sticker' inputs
        const fromSticker = parseInt(fromStickerInput.value);
        const toSticker = parseInt(toStickerInput.value);

        if (!isNaN(fromSticker) && !isNaN(toSticker)) {
            // Adjust indices to be 0-based and within bounds
            const startIndex = Math.max(0, fromSticker - 1);
            const endIndex = Math.min(data.length, toSticker); // Slice end is exclusive

            if (startIndex < endIndex) {
                 filteredData = data.slice(startIndex, endIndex);
            } else {
                 filteredData = []; // No data if range is invalid
            }
        } else {
             // If inputs are not valid numbers, use all data (already set)
        }
    }

     // Display the filtered results
    displayResults(filteredData);
}


