const socket = io();

// State
let currentSymbol = 'BTC/USD';
let interactiveView = 'price';
let globalHistory = { 'BTC/USD': [], 'ETH/USD': [], 'SOL/USD': [] };
let alertThreshold = null;

// UI Elements
const symbolSelect = document.getElementById('symbolSelect');
const chartTitle = document.getElementById('chartTitle');
const tickerList = document.getElementById('tickerList');
const alertStatus = document.getElementById('alertStatus');
const alertBanner = document.getElementById('alertBanner');
const alertInput = document.getElementById('alertInput');

// Export UI Elements (NEW)
const exportSymbolSelect = document.getElementById('exportSymbolSelect');
const exportFormatSelect = document.getElementById('exportFormatSelect');
const exportCountLabel = document.getElementById('exportCountLabel');

// Stats Elements
const priceDisplay = document.getElementById('priceDisplay');
const changeDisplay = document.getElementById('changeDisplay');
const zScoreDisplay = document.getElementById('zScoreDisplay');
const spreadDisplay = document.getElementById('spreadDisplay');
const historyBody = document.getElementById('historyBody');

// --- CHART INITIALIZATION ---
const dashboardChart = new Chart(document.getElementById('dashboardChart').getContext('2d'), {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'Price', data: [], borderColor: '#3b82f6', backgroundColor: '#3b82f610', borderWidth: 2, fill: true, pointRadius: 0, tension: 0.3 }] },
    options: createChartOptions()
});

const interactiveChart = new Chart(document.getElementById('interactiveChart').getContext('2d'), {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'Value', data: [], borderColor: '#3b82f6', backgroundColor: '#3b82f610', borderWidth: 2, fill: true, pointRadius: 0, tension: 0.3 }] },
    options: createChartOptions()
});

const zChart = new Chart(document.getElementById('zScoreChart').getContext('2d'), {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'Z-Score', data: [], borderColor: '#eab308', backgroundColor: '#eab30810', borderWidth: 2, fill: true, pointRadius: 0, tension: 0.3 }] },
    options: createChartOptions()
});

const sChart = new Chart(document.getElementById('spreadChart').getContext('2d'), {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'Spread', data: [], borderColor: '#a855f7', backgroundColor: '#a855f710', borderWidth: 2, fill: true, pointRadius: 0, tension: 0.3 }] },
    options: createChartOptions()
});

function createChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { display: false },
            y: { position: 'right', grid: { color: '#27272a' } }
        }
    };
}

// --- DATA HANDLING ---
socket.on('market-update', (updates) => {
    updateTickerList(updates);

    updates.forEach(u => {
        if (globalHistory[u.symbol]) {
            globalHistory[u.symbol].push(u);
            if (globalHistory[u.symbol].length > 500) globalHistory[u.symbol].shift();
        }
    });

    const data = updates.find(x => x.symbol === currentSymbol);
    if (data) {
        updateUI(data);
        checkAlert(data.price);
        // Only update export stats if we are looking at that tab
        if(document.getElementById('controls').classList.contains('active')) {
            updateExportStats();
        }
    }
});

socket.on('market-history', (historyPack) => {
    historyPack.forEach(updateGroup => {
        updateGroup.forEach(u => {
            if (globalHistory[u.symbol]) globalHistory[u.symbol].push(u);
        });
    });
    refreshAllCharts();
});

// --- UI UPDATES ---
function updateUI(data) {
    priceDisplay.innerText = data.price;
    changeDisplay.innerText = data.percent + '%';
    changeDisplay.style.color = data.change >= 0 ? '#22c55e' : '#ef4444';
    zScoreDisplay.innerText = data.zScore;
    spreadDisplay.innerText = data.spread;

    pushDataToChart(dashboardChart, data.timestamp, data.price);
    
    let val;
    if (interactiveView === 'price') val = data.price;
    else if (interactiveView === 'zscore') val = data.zScore;
    else if (interactiveView === 'spread') val = data.spread;
    pushDataToChart(interactiveChart, data.timestamp, val);

    pushDataToChart(zChart, data.timestamp, data.zScore);
    pushDataToChart(sChart, data.timestamp, data.spread);

    if (Math.random() > 0.8) {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${new Date(data.timestamp).toLocaleTimeString()}</td>
                         <td style="color:${data.change >= 0 ? '#22c55e' : '#ef4444'}">${data.price}</td>`;
        historyBody.prepend(row);
        if (historyBody.children.length > 15) historyBody.lastElementChild.remove();
    }
}

function pushDataToChart(chart, label, value) {
    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(value);
    if (chart.data.labels.length > 50) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }
    chart.update('none');
}

// --- CONTROLS ---

window.changeSymbol = function() {
    currentSymbol = symbolSelect.value;
    historyBody.innerHTML = '';
    alertThreshold = null;
    alertBanner.style.display = 'none';
    alertInput.value = '';
    alertStatus.innerHTML = `<i class="ri-information-line"></i> Inactive`;
    alertStatus.style.color = "#666";
    refreshAllCharts();
}

window.toggleMainChart = function(viewType, btn) {
    interactiveView = viewType;
    document.getElementById('chartTitle').innerText = `DETAILED ANALYSIS: ${viewType.toUpperCase()}`;
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const colors = { price: '#3b82f6', zscore: '#eab308', spread: '#a855f7' };
    interactiveChart.data.datasets[0].borderColor = colors[viewType];
    interactiveChart.data.datasets[0].backgroundColor = colors[viewType] + '10';

    interactiveChart.data.labels = [];
    interactiveChart.data.datasets[0].data = [];
    
    const dataSet = globalHistory[currentSymbol].slice(-50);
    dataSet.forEach(d => {
        let val;
        if (viewType === 'price') val = d.price;
        else if (viewType === 'zscore') val = d.zScore;
        else if (viewType === 'spread') val = d.spread;
        interactiveChart.data.labels.push(d.timestamp);
        interactiveChart.data.datasets[0].data.push(val);
    });
    interactiveChart.update();
}

function refreshAllCharts() {
    [dashboardChart, interactiveChart, zChart, sChart].forEach(c => {
        c.data.labels = [];
        c.data.datasets[0].data = [];
    });

    const dataSet = globalHistory[currentSymbol].slice(-50);
    if (dataSet.length === 0) return;

    dataSet.forEach(d => {
        dashboardChart.data.labels.push(d.timestamp);
        dashboardChart.data.datasets[0].data.push(d.price);
        
        let val;
        if (interactiveView === 'price') val = d.price;
        else if (interactiveView === 'zscore') val = d.zScore;
        else if (interactiveView === 'spread') val = d.spread;
        interactiveChart.data.labels.push(d.timestamp);
        interactiveChart.data.datasets[0].data.push(val);

        zChart.data.labels.push(d.timestamp);
        zChart.data.datasets[0].data.push(d.zScore);
        sChart.data.labels.push(d.timestamp);
        sChart.data.datasets[0].data.push(d.spread);
    });

    [dashboardChart, interactiveChart, zChart, sChart].forEach(c => c.update());
    
    const last = dataSet[dataSet.length - 1];
    priceDisplay.innerText = last.price;
    changeDisplay.innerText = last.percent + '%';
    zScoreDisplay.innerText = last.zScore;
    spreadDisplay.innerText = last.spread;
}

// --- ALERTS ---
window.setAlert = function() {
    const val = parseFloat(alertInput.value);
    if (val) {
        alertThreshold = val;
        alertStatus.innerHTML = `<i class="ri-checkbox-circle-fill" style="color:#22c55e"></i> Active: > ${val}`;
        alertStatus.style.color = "#22c55e";
    }
}

function checkAlert(price) {
    if (alertThreshold && parseFloat(price) > alertThreshold) {
        alertBanner.style.display = 'flex';
        alertBanner.innerHTML = `<i class="ri-alarm-warning-fill"></i> PRICE ALERT: ${currentSymbol} crossed ${alertThreshold}`;
    } else {
        alertBanner.style.display = 'none';
    }
}

// --- EXPORT FUNCTIONALITY (UPDATED) ---

// Called when dropdown changes or live data updates
window.updateExportStats = function() {
    const selectedSym = exportSymbolSelect.value;
    if (globalHistory[selectedSym]) {
        exportCountLabel.innerText = globalHistory[selectedSym].length;
    }
}

// New Download Function (Handles CSV/JSON)
window.downloadData = function() {
    const symbol = exportSymbolSelect.value;
    const format = exportFormatSelect.value;
    const data = globalHistory[symbol];

    if (!data || data.length === 0) return alert("No data for " + symbol);

    let content = "";
    let mimeType = "";
    let extension = "";

    if (format === 'json') {
        // JSON Export
        content = JSON.stringify(data, null, 2);
        mimeType = "application/json";
        extension = "json";
    } else {
        // CSV Export
        content = "Timestamp,Symbol,Price,Change,Percent,ZScore,Spread\n";
        data.forEach(row => {
            content += `${row.timestamp},${row.symbol},${row.price},${row.change},${row.percent},${row.zScore},${row.spread}\n`;
        });
        mimeType = "text/csv";
        extension = "csv";
    }

    const link = document.createElement("a");
    link.href = encodeURI(`data:${mimeType};charset=utf-8,` + content);
    link.download = `${symbol.replace('/','-')}_export.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// --- HELPERS ---
function updateTickerList(updates) {
    tickerList.innerHTML = '';
    updates.forEach(u => {
        const li = document.createElement('li');
        li.className = 'ticker-item';
        li.innerHTML = `<span>${u.symbol}</span> <span style="color:${u.change>=0?'#22c55e':'#ef4444'}">${u.price}</span>`;
        tickerList.appendChild(li);
    });
}