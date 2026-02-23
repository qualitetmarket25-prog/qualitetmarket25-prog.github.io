let supplierScores = [];

function processCSV() {
    const fileInput = document.getElementById("csvFile");
    const file = fileInput.files[0];

    if (!file) {
        alert("Wybierz plik CSV.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        const text = e.target.result;
        const rows = text.split("\n").map(r => r.split(","));

        // Zakładamy strukturę:
        // Nazwa, CenaHurtowa, CenaRynkowa

        const results = [];
        let totalScore = 0;
        let productCount = 0;

        for (let i = 1; i < rows.length; i++) {
            const name = rows[i][0];
            const wholesale = parseFloat(rows[i][1]);
            const retail = parseFloat(rows[i][2]);

            if (!name || isNaN(wholesale) || isNaN(retail)) continue;

            const margin = ((retail - wholesale) / wholesale) * 100;
            const score = margin > 50 ? 100 :
                          margin > 30 ? 70 :
                          margin > 15 ? 40 : 10;

            totalScore += score;
            productCount++;

            results.push({
                name,
                wholesale,
                retail,
                margin: margin.toFixed(2),
                score
            });
        }

        displayResults(results);

        const avgScore = productCount ? (totalScore / productCount).toFixed(2) : 0;

        supplierScores.push(avgScore);
        displaySupplierRanking(avgScore);
    };

    reader.readAsText(file);
}

function displayResults(results) {
    const tbody = document.querySelector("#resultsTable tbody");
    tbody.innerHTML = "";

    results.sort((a, b) => b.score - a.score);

    results.forEach(product => {
        const row = `
            <tr>
                <td>${product.name}</td>
                <td>${product.wholesale} zł</td>
                <td>${product.retail} zł</td>
                <td>${product.margin}%</td>
                <td>${product.score}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function displaySupplierRanking(avgScore) {
    const ranking = document.getElementById("supplierRanking");
    ranking.innerHTML = `
        <div class="card soft">
            <strong>Średni Score Hurtowni:</strong> ${avgScore}/100
        </div>
    `;
}
