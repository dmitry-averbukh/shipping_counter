// Обновим функцию отображения таблицы
function displayTable(weights, startSticker = 1) {
    tableBody.innerHTML = '';
    let totalServiceCost = 0;
    let totalNatashaCost = 0;
    let skamCount = 0;

    weights.forEach((weightStr, index) => {
        const weight = parseFloat(weightStr); // Преобразуем строку в число
        const serviceCost = calculateServiceCost(weight);
        const natashaCost = calculateNatashaCost(weight);

        totalServiceCost += serviceCost;
        totalNatashaCost += natashaCost;

        // Логика определения "skam"
        let skamStatus = '';
        if (
            (weight > 0.25 && weight <= 0.3) || // 250 г с 50-граммовым разбросом
            (weight > 0.5 && weight <= 0.55) || // 500 г с 50-граммовым разбросом
            (weight > 1 && weight <= 1.05)     // 1 кг с 50-граммовым разбросом
        ) {
            skamStatus = '✔️'; // Skam
            skamCount++;
        } else {
            skamStatus = '❌'; // Не Skam
        }

        // Создаём строку таблицы
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${startSticker + index}</td>
            <td>${weight.toFixed(3)} kg</td>
            <td>${serviceCost} UAH</td>
            <td>${natashaCost} UAH</td>
            <td>${skamStatus}</td>
        `;
        tableBody.appendChild(row);
    });

    // Обновляем общие суммы
    totalServicesElement.textContent = totalServiceCost;
    totalNatashaElement.textContent = totalNatashaCost;

    // Добавляем информацию о количестве Skam
    const skamTotalRow = document.createElement("tr");
    skamTotalRow.innerHTML = `
        <td colspan="4" class="fw-bold text-end">Total Skam:</td>
        <td>${skamCount}</td>
    `;
    tableBody.appendChild(skamTotalRow);
}

// Обновим обработчик кнопки "Filter"
filterButton.addEventListener('click', () => {
    const start = parseInt(startStickerInput.value, 10) || 1;
    const end = parseInt(endStickerInput.value, 10) || allWeights.length;

    if (start < 1 || end > allWeights.length || start > end) {
        alert('Введите корректный диапазон!');
        return;
    }

    const filteredWeights = allWeights.slice(start - 1, end);
    displayTable(filteredWeights, start);
});

// Обновим обработчик кнопки "Start Processing"
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

            // Находим первое совпадение с весом на странице
            const match = text.match(weightRegex);
            if (match) {
                allWeights.push(match[0]); // Берём только первое совпадение
            }
        }

        totalStickersElement.textContent = allWeights.length;
        filterButton.disabled = false;
        displayTable(allWeights);
    };

    reader.readAsArrayBuffer(selectedFile);
});
