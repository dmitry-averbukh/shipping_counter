const uploadField = document.getElementById('upload');
const processButton = document.getElementById('process');
const filterButton = document.getElementById('filter');
const totalStickersElement = document.getElementById('total-stickers');
const startStickerInput = document.getElementById('start-sticker');
const endStickerInput = document.getElementById('end-sticker');
const totalServicesElement = document.getElementById('total-services');
const totalNatashaElement = document.getElementById('total-natasha');
const tableBody = document.querySelector("#result-table tbody");

let selectedFile = null;
let allWeights = [];
let allTrackNumbers = [];

// Обработка выбора файла
uploadField.addEventListener('change', (event) => {
    selectedFile = event.target.files[0];
    processButton.disabled = !!selectedFile ? false : true;
});

// Функция расчёта стоимости услуг
function calculateServiceCost(weight) {
    if (weight <= 0.25) return 0;
    if (weight <= 0.5) return 150;
    if (weight <= 1) return 200;
    if (weight <= 2) return 250;
    return 0;
}

// Функция расчёта стоимости Наташи с учётом "скама"
function calculateNatashaCost(weight) {
    let baseCost = 0;

    if (weight <= 0.25) baseCost = 0;
    else if (weight <= 0.5) baseCost = 50;
    else if (weight <= 1) baseCost = 100;
    else if (weight <= 2) baseCost = 150;

    // Логика "скама" — минус 50 гривен
    if (
        (weight > 0.25 && weight <= 0.3) ||  // 250–300 г
        (weight > 0.5 && weight <= 0.55) || // 500–550 г
        (weight > 1 && weight <= 1.05)      // 1 кг–1.05 кг
    ) {
        baseCost -= 50;
    }

    return Math.max(baseCost, 0); // Не допускаем отрицательных значений
}

// Функция отображения таблицы
function displayTable(weights, trackNumbers, startSticker = 1) {
    tableBody.innerHTML = '';
    let totalServiceCost = 0;
    let totalNatashaCost = 0;

    weights.forEach((weightStr, index) => {
        const weight = parseFloat(weightStr);
        const serviceCost = calculateServiceCost(weight);
        const natashaCost = calculateNatashaCost(weight);
        const trackNumber = trackNumbers[index];

        totalServiceCost += serviceCost;
        totalNatashaCost += natashaCost;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${startSticker + index}</td>
            <td>${trackNumber}</td>
            <td>${weight.toFixed(3)} kg</td>
            <td>${serviceCost} UAH</td>
            <td>${natashaCost} UAH</td>
        `;
        tableBody.appendChild(row);
    });

    totalServicesElement.textContent = totalServiceCost;
    totalNatashaElement.textContent = totalNatashaCost;
}

// Обработчик кнопки "Filter"
filterButton.addEventListener('click', () => {
    const start = parseInt(startStickerInput.value, 10) || 1;
    const end = parseInt(endStickerInput.value, 10) || allWeights.length;

    if (start < 1 || end > allWeights.length || start > end) {
        alert('Введите корректный диапазон!');
        return;
    }

    const filteredWeights = allWeights.slice(start - 1, end);
    const filteredTrackNumbers = allTrackNumbers.slice(start - 1, end);
    displayTable(filteredWeights, filteredTrackNumbers, start);
});

// Обработчик кнопки "Start Processing"
processButton.addEventListener('click', async () => {
    if (!selectedFile) {
        alert('Выберите файл!');
        return;
    }

    const reader = new FileReader();
    reader.onload = async function () {
        const typedArray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;

        allWeights = [];
        allTrackNumbers = [];
        const weightRegex = /(\d+\.\d+)\s*kg/;
        const trackNumberRegex = /LL\s+\d{3}\s+\d{3}\s+\d{3}\s+UA/;

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const text = textContent.items.map(item => item.str).join("\n");

            const weightMatch = text.match(weightRegex);
            if (weightMatch) {
                allWeights.push(weightMatch[0]);
            }

            const trackMatch = text.match(trackNumberRegex);
            if (trackMatch) {
                allTrackNumbers.push(trackMatch[0]);
            }
        }

        totalStickersElement.textContent = allWeights.length;
        filterButton.disabled = false;
        displayTable(allWeights, allTrackNumbers);
    };

    reader.readAsArrayBuffer(selectedFile);
});
