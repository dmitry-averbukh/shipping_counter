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

// Обработка выбора файла
uploadField.addEventListener('change', (event) => {
    selectedFile = event.target.files[0];
    if (selectedFile) {
        processButton.disabled = false; // Активируем кнопку обработки
    } else {
        processButton.disabled = true; // Отключаем кнопку обработки
    }
});

// Функция расчёта стоимости услуг
function calculateServiceCost(weight) {
    if (weight <= 0.25) return 20;
    if (weight <= 0.5) return 150;
    if (weight <= 1) return 200;
    if (weight <= 2) return 250;
    return 0;
}

// Функция расчёта стоимости Наташи
function calculateNatashaCost(weight) {
    if (weight <= 0.25) return 0;
    if (weight <= 0.5) return 50;
    if (weight <= 1) return 100;
    if (weight <= 2) return 200;
    return 0;
}

// Функция отображения таблицы
function displayTable(weights) {
    tableBody.innerHTML = '';
    let totalServiceCost = 0;
    let totalNatashaCost = 0;

    weights.forEach(weightStr => {
        const weight = parseFloat(weightStr);
        const serviceCost = calculateServiceCost(weight);
        const natashaCost = calculateNatashaCost(weight);

        totalServiceCost += serviceCost;
        totalNatashaCost += natashaCost;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${weight.toFixed(3)} kg</td>
            <td>${serviceCost} UAH</td>
            <td>${natashaCost} UAH</td>
        `;
        tableBody.appendChild(row);
    });

    totalServicesElement.textContent = totalServiceCost;
    totalNatashaElement.textContent = totalNatashaCost;
}

// Обработка кнопки "Start Processing"
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
        const weightRegex = /(\d+\.\d+)\s*kg/;

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const text = textContent.items.map(item => item.str).join("\n");

            text.split("\n").forEach(line => {
                const match = line.match(weightRegex);
                if (match) {
                    allWeights.push(match[0]);
                }
            });
        }

        totalStickersElement.textContent = allWeights.length;
        filterButton.disabled = false;
        displayTable(allWeights);
    };

    reader.readAsArrayBuffer(selectedFile);
});

// Обработка кнопки "Filter"
filterButton.addEventListener('click', () => {
    const start = parseInt(startStickerInput.value, 10) || 1;
    const end = parseInt(endStickerInput.value, 10) || allWeights.length;

    if (start < 1 || end > allWeights.length || start > end) {
        alert('Введите корректный диапазон!');
        return;
    }

    const filteredWeights = allWeights.slice(start - 1, end);
    displayTable(filteredWeights);
});


