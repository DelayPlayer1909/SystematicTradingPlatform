const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('index');
});

// Z-Score Math
function calculateZScore(history) {
    if (history.length < 5) return 0;
    const values = history.map(x => x.price);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
    const current = values[values.length - 1];
    return stdDev === 0 ? 0 : ((current - mean) / stdDev);
}

const symbols = [
    { code: 'BTC/USD', price: 42000, volatility: 35 },
    { code: 'ETH/USD', price: 2250, volatility: 8 },
    { code: 'SOL/USD', price: 98, volatility: 1.2 }
];

let symbolHistory = { 'BTC/USD': [], 'ETH/USD': [], 'SOL/USD': [] };
let globalHistory = []; 

setInterval(() => {
    const timestamp = new Date().toISOString();
    const updates = symbols.map(sym => {
        const change = (Math.random() - 0.5) * sym.volatility;
        sym.price += change;
        symbolHistory[sym.code].push({ price: sym.price });
        if (symbolHistory[sym.code].length > 30) symbolHistory[sym.code].shift();
        return {
            symbol: sym.code,
            price: sym.price.toFixed(2),
            change: change.toFixed(2),
            percent: ((change / sym.price) * 100).toFixed(2),
            timestamp: timestamp
        };
    });

    updates.forEach(update => {
        update.zScore = calculateZScore(symbolHistory[update.symbol]).toFixed(3);
        const eth = updates.find(s => s.symbol === 'ETH/USD').price;
        const btc = updates.find(s => s.symbol === 'BTC/USD').price;
        if (update.symbol === 'ETH/USD') {
            update.spread = (parseFloat(update.price) - parseFloat(btc) * 0.05).toFixed(2);
        } else {
            update.spread = (parseFloat(update.price) - parseFloat(eth)).toFixed(2); 
        }
    });

    globalHistory.push(updates);
    if (globalHistory.length > 500) globalHistory.shift();
    io.emit('market-update', updates);
}, 200);

io.on('connection', (socket) => {
    socket.emit('market-history', globalHistory);
});

http.listen(PORT, () => console.log(`\n🚀 Server running at http://localhost:${PORT}`));