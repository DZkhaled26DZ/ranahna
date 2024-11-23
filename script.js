const API_KEY = 'nc3cvP0d3LZzL9AIIgQQsjU6MKN8g5oanFkiAo4BdykbaOlce3HsTbWB3mPCoL8z';
const BASE_URL = 'https://api.binance.com/api/v3';

// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const refreshButton = document.getElementById('refreshButton');
const timeframeSelect = document.getElementById('timeframeSelect');
const sortSelect = document.getElementById('sortSelect');
const resetSettings = document.getElementById('resetSettings');
const signalsContainer = document.getElementById('signalsContainer');
const loadingOverlay = document.getElementById('loadingOverlay');

// State
let settings = loadSettings();
let signals = [];
let isLoading = false;

// Initialize
applySettings();
fetchData();
setInterval(fetchData, 60000); // Update every minute

// Event Listeners
themeToggle.addEventListener('click', toggleTheme);
refreshButton.addEventListener('click', fetchData);
timeframeSelect.addEventListener('change', updateTimeframe);
sortSelect.addEventListener('change', updateSort);
resetSettings.addEventListener('click', resetToDefaults);

function loadSettings() {
    const defaultSettings = {
        darkMode: true,
        timeframe: '1h',
        sortBy: 'time'
    };
    
    const savedSettings = localStorage.getItem('cryptoAnalyzerSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
}

function saveSettings() {
    localStorage.setItem('cryptoAnalyzerSettings', JSON.stringify(settings));
}

function applySettings() {
    document.body.classList.toggle('dark', settings.darkMode);
    themeToggle.textContent = settings.darkMode ? '🌙' : '☀️';
    timeframeSelect.value = settings.timeframe;
    sortSelect.value = settings.sortBy;
}

function toggleTheme() {
    settings.darkMode = !settings.darkMode;
    applySettings();
    saveSettings();
}

function updateTimeframe(e) {
    settings.timeframe = e.target.value;
    saveSettings();
    fetchData();
}

function updateSort(e) {
    settings.sortBy = e.target.value;
    saveSettings();
    renderSignals();
}

function resetToDefaults() {
    settings = {
        darkMode: true,
        timeframe: '1h',
        sortBy: 'time'
    };
    applySettings();
    saveSettings();
    fetchData();
}

async function fetchData() {
    if (isLoading) return;
    
    isLoading = true;
    loadingOverlay.classList.remove('hidden');
    
    try {
        const pairs = await fetchSpotPairs();
        const signalPromises = pairs.slice(0, 20).map(pair => 
            fetchCandles(pair, settings.timeframe).then(candles => 
                analyzeCandles(pair, candles)
            )
        );

        signals = (await Promise.all(signalPromises)).filter(signal => signal !== null);
        renderSignals();
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        isLoading = false;
        loadingOverlay.classList.add('hidden');
    }
}

async function fetchSpotPairs() {
    const response = await fetch(`${BASE_URL}/ticker/24hr`);
    const data = await response.json();
    return data
        .filter(ticker => ticker.symbol.endsWith('USDT'))
        .map(ticker => ticker.symbol);
}

async function fetchCandles(symbol, interval, limit = 100) {
    const url = `${BASE_URL}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const response = await fetch(url);
    const data = await response.json();
    
    return data.map(candle => ({
        openTime: candle[0],
        open: candle[1],
        high: candle[2],
        low: candle[3],
        close: candle[4],
        volume: candle[5],
        closeTime: candle[6]
    }));
}

function analyzeCandles(pair, candles) {
    const lastCandle = candles[candles.length - 1];
    const open = parseFloat(lastCandle.open);
    const close = parseFloat(lastCandle.close);
    const high = parseFloat(lastCandle.high);
    const low = parseFloat(lastCandle.low);

    const body = Math.abs(open - close);
    const lowerWick = Math.min(open, close) - low;
    const upperWick = high - Math.max(open, close);
    
    if (lowerWick > body * 2 && upperWick < body) {
        return {
            pair,
            time: lastCandle.closeTime,
            price: lastCandle.close,
            wickLength: lowerWick
        };
    }
    return null;
}

function renderSignals() {
    // Sort signals
    signals.sort((a, b) => {
        switch (settings.sortBy) {
            case 'price':
                return parseFloat(b.price) - parseFloat(a.price);
            case 'wick':
                return b.wickLength - a.wickLength;
            default:
                return b.time - a.time;
        }
    });

    // Render to DOM
    signalsContainer.innerHTML = signals.map(signal => `
        <div class="signal-card">
            <h2>${signal.pair}</h2>
            <p>السعر: ${parseFloat(signal.price).toFixed(8)}</p>
            <p>الوقت: ${formatTime(signal.time)}</p>
            <p>طول الذيل: ${signal.wickLength.toFixed(8)}</p>
        </div>
    `).join('');
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const options = {
        timeZone: 'Africa/Algiers',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };
    return new Intl.DateTimeFormat('ar-DZ', options).format(date);
}