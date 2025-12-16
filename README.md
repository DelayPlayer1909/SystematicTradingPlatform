# Systematic Trading Analytics Platform

<div align="center">

![Systematic Trading Analytics Platform Banner](https://img.shields.io/badge/Systematic%20Trading-Analytics%20Platform-3b82f6?style=for-the-badge&logo=google-analytics&logoColor=white)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/socket.io-4.7.0-white?style=flat-square&logo=socket.io)](https://socket.io/)
[![Chart.js](https://img.shields.io/badge/chart.js-4.4.0-ff6384?style=flat-square&logo=chart.js)](https://www.chartjs.org/)

*High-performance, lightweight quantitative trading dashboard with real-time analytics.*

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [Architecture](#-architecture)

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [License](#-license)

---

## 🎯 About

**Systematic Trading Analytics Platform** is a streamlined quantitative analytics dashboard designed to demonstrate real-time data processing and visualization capabilities. Unlike heavy framework-based applications, this project focuses on raw performance and low-latency updates using a lightweight stack.

### Context

Designed as a rapid-prototype for **Quant Developer** evaluations, this system simulates a high-frequency trading environment where market data is generated, processed, and visualized in milliseconds.

### Key Capabilities

- **Market Simulation**: Built-in engine simulating random walk volatility for BTC, ETH, and SOL.
- **Quant Metrics**: Real-time calculation of **Z-Scores** (Mean Reversion) and **Pair Spreads**.
- **Live Streaming**: WebSocket-based data delivery for sub-second updates.
- **Deep-Dive Visuals**: Multi-view charting system for price action and statistical indicators.

---

## ✨ Features

### 📊 Data & Simulation
- ✅ **Multi-Asset Simulation**: Simulates ticks for `BTC/USD`, `ETH/USD`, and `SOL/USD`.
- ✅ **Volatility Engine**: Unique volatility profiles for each asset class.
- ✅ **In-Memory Storage**: Circular buffer implementation for session history.

### 📈 Quantitative Analytics
- ✅ **Real-time Z-Score**: Rolling window standard deviation calculation (30-period).
- ✅ **Spread Analysis**: Dynamic spread computation (e.g., `BTC - (ETH * Ratio)`).
- ✅ **Statistical Stats**: Live percentage changes and trend tracking.

### 🎨 Interactive Dashboard
- ✅ **4-Tab Layout**: Organized into Dashboard, Charts, Analytics, and Controls.
- ✅ **Chart.js Integration**: High-performance canvas rendering for smooth lines.
- ✅ **Dynamic Toggling**: Instantly switch chart views between Price, Z-Score, and Spread.
- ✅ **Smart Alerts**: Client-side price threshold alerts with visual banners.
- ✅ **CSV Export**: One-click download of full session datasets (CSV/JSON).

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Server Runtime |
| **Express.js** | Web Server & Static File Serving |
| **Socket.io** | Real-time bi-directional event streaming |

### Frontend
| Technology | Purpose |
|------------|---------|
| **EJS / HTML5** | Semantic structure and templating |
| **CSS3** | Custom "Dark Mode" styling (No frameworks) |
| **Vanilla JS** | Client-side logic and DOM manipulation |
| **Chart.js** | Hardware-accelerated data visualization |
| **Remix Icons** | Modern UI iconography |

---

## 🏗️ Architecture

```text
┌───────────────────────────────┐
│         Market Engine         │
│     (Tick Data Generator)     │
└───────────────┬───────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│           Backend (Node.js)            │
│                                        │
│  - History Buffer (In-Memory)          │
│  - Quant Analytics (Z-Score, Spread)   │
│  - Socket.IO Broadcaster               │
│                                        │
│  Events:                               │
│  • market-update (live)                │
│  • market-history (on connect)         │
└───────────────┬────────────────────────┘
                │ WebSocket
                ▼
┌────────────────────────────────────────┐
│           Frontend (Browser)           │
│                                        │
│  - Interactive Dashboard               │
│  - Live Charts (Chart.js)              │
│  - Alert System                        │
│  - CSV Data Export                     │
└────────────────────────────────────────┘
```

### Data Flow

1. **Generation**: Server loop generates random price moves every 200ms.
2. **Calculation**: `calculateZScore` and spread logic process the new price against history.
3. **Broadcast**: `io.emit('market-update')` pushes the enriched data object to all clients.
4. **Visualization**: Client receives data, pushes to Chart.js arrays, and re-renders canvas.

---

## 📦 Installation

### Prerequisites

- **Node.js**: v14.0.0 or higher
- **npm**: Comes with Node.js

### Step 1: Clone or Create Project

Create a folder named `SystematicTradingPlatform` and verify the file structure (see [Project Structure](#-project-structure)).

### Step 2: Install Dependencies

Open your terminal in the project folder and run:

```bash
npm init -y
npm install express socket.io ejs
```

### Step 3: Run the Server

```bash
node server.js
```

You should see:
`🚀 Server running at http://localhost:3000`

---

## 🚀 Usage

### 1. Open Dashboard
Navigate to `http://localhost:3000` in your web browser.

### 2. Live Monitoring
- Watch the **Live Feed** on the left for raw tick data.
- The **Market Overview** chart shows real-time price action for BTC/USD by default.

### 3. Analytics & Charts
- Click the **Analytics** tab to access the interactive multi-view chart.
- Use the toggle buttons (Price / Z-Score / Spread) to switch analysis modes.
- Below that, view the split-view deep dive charts.

### 4. Alerting
- Go to the **Dashboard** tab.
- In the **Alert Config** box (bottom-left), enter a price (e.g., `42050`).
- Click **Set**. If the simulated price crosses this value, a red banner will appear.

### 5. Export Data
- Navigate to the **Controls** tab.
- Select your target asset (BTC, ETH, SOL) and file format (CSV, JSON).
- Check the record count in the **Data Export** card.
- Click **Download File** to get the full session history.

---

## 📁 Project Structure

```text
SystematicTradingPlatform/
├── public/                 # Static Assets
│   ├── css/
│   │   └── style.css       # Dark Mode & Grid Styling
│   └── js/
│       └── main.js         # Client-side Logic (Charts, Socket)
│
├── views/                  # Frontend Templates
│   └── index.ejs           # Main HTML Dashboard Layout
│
├── server.js               # Main Backend Entry Point
├── package.json            # Dependencies
└── README.md               # Documentation
```

---

## ⚙️ Configuration

### Simulation Speed
Edit `server.js`:
```javascript
// Change 200 to desired milliseconds (lower = faster)
setInterval(() => { ... }, 200);
```

### Volatility Settings
Edit `server.js`:
```javascript
const symbols = [
    { code: 'BTC/USD', price: 42000, volatility: 35 }, // Increase for wilder moves
    ...
];
```

---

## 👨‍💻 Author

**DelayPlayer1909**  

- **GitHub:** [@DelayPlayer1909](https://github.com/DelayPlayer1909)
- **Repository:** [SystematicTradingPlatform](https://github.com/DelayPlayer1909/SystematicTradingPlatform)


<div align="center">

**Built with ❤️ for Quantitative Traders**

</div>
