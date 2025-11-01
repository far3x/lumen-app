import { api } from '../api.js';
import Chart from 'chart.js/auto';

class Monitor {
    constructor() {
        this.socket = null;
        this.liveChart = null;
        this.dataRateInterval = null;
        // --- MODIFIED: This is now just a default, will be read from UI ---
        this.alertThreshold = 85; 
        this.MAX_CHART_POINTS = 50;
    }

    async render() {
        return `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div class="lg:col-span-1 glass-card p-6 lg:sticky lg:top-24 space-y-6">
                    <div class="flex items-center">
                        <i class="fa-solid fa-sliders text-accent-cyan text-xl"></i>
                        <h2 class="ml-4 text-xl font-semibold text-light-text dark:text-dark-text">Panneau de Contrôle</h2>
                    </div>
                    <div>
                        <label class="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1 block">Appareil de monitoring</label>
                        <select id="port-select" class="w-full bg-light-input dark:bg-dark-input border border-light-border dark:border-dark-border rounded-lg px-4 py-3 text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-accent-cyan">
                            <option>Chargement...</option>
                        </select>
                    </div>
                    <button id="start-btn" class="w-full bg-button-gradient text-white font-semibold py-3 rounded-lg shadow-lg hover:opacity-90 transition-opacity">Démarrer le Monitoring</button>
                    <div id="status-message" class="text-center text-sm text-light-text-secondary dark:text-dark-text-secondary min-h-[20px]">Sélectionnez un port et démarrez.</div>
                    
                    <div class="space-y-4 pt-4 border-t border-light-border dark:border-dark-border">
                        {/* --- NEW: Input for configurable alert threshold --- */}
                        <div>
                            <label for="alert-threshold-input" class="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1 block">Niveau d'alerte critique (dB)</label>
                            <input type="number" id="alert-threshold-input" value="${this.alertThreshold}" class="w-full bg-light-input dark:bg-dark-input border border-light-border dark:border-dark-border rounded-lg px-4 py-3 text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-accent-cyan">
                        </div>

                        <div class="text-center">
                            <div class="text-light-text-secondary dark:text-dark-text-secondary text-sm">NIVEAU SONORE ACTUEL</div>
                            <div id="db-display" class="text-6xl font-light text-light-text dark:text-dark-text mt-1">0<span class="text-3xl text-light-text-secondary dark:text-dark-text-secondary">dB</span></div>
                            <div class="w-full bg-gray-200 dark:bg-gray-700/50 rounded-full h-2.5 mt-2">
                                <div id="db-bar" class="bg-status-green h-2.5 rounded-full transition-all duration-300" style="width: 0%"></div>
                            </div>
                        </div>
                        <div class="text-center">
                            <div class="text-light-text-secondary dark:text-dark-text-secondary text-sm">DÉBIT DE DONNÉES</div>
                            <div id="data-rate" class="text-2xl font-semibold text-light-text dark:text-dark-text mt-1">0 <span class="text-base text-light-text-secondary dark:text-dark-text-secondary">/sec</span></div>
                        </div>
                    </div>

                    <div id="high-level-alert" class="hidden animate-pulse bg-red-500/80 dark:bg-status-red/80 border border-red-400 text-white font-bold text-center px-4 py-3 rounded-lg">
                        <i class="fas fa-triangle-exclamation mr-2"></i> ALERTE : NIVEAU SONORE CRITIQUE
                    </div>
                </div>

                <div class="lg:col-span-2 glass-card p-6">
                    <div class="flex items-center mb-4">
                        <i class="fa-solid fa-chart-line text-accent-cyan text-xl"></i>
                        <h2 class="ml-4 text-xl font-semibold text-light-text dark:text-dark-text">Historique de la Session</h2>
                    </div>
                    <div class="h-[500px]">
                        <canvas id="live-sound-chart"></canvas>
                    </div>
                </div>
            </div>
        `;
    }

    async after_render() {
        this.ui = {
            portSelect: document.getElementById('port-select'),
            startBtn: document.getElementById('start-btn'),
            dbDisplay: document.getElementById('db-display'),
            dbBar: document.getElementById('db-bar'),
            statusMessage: document.getElementById('status-message'),
            highLevelAlert: document.getElementById('high-level-alert'),
            dataRateDisplay: document.getElementById('data-rate'),
            chartCanvas: document.getElementById('live-sound-chart'),
            // --- NEW: Add threshold input to UI elements ---
            alertThresholdInput: document.getElementById('alert-threshold-input'),
        };
        
        // --- NEW: Event listener for the threshold input ---
        this.ui.alertThresholdInput.addEventListener('change', (e) => {
            const value = parseInt(e.target.value, 10);
            if (!isNaN(value) && value > 0) {
                this.alertThreshold = value;
                console.log(`Alert threshold set to: ${this.alertThreshold} dB`);
            } else {
                e.target.value = this.alertThreshold; // Reset to last valid value
            }
        });

        this.initializeChart();
        this.loadPorts();
        this.ui.startBtn.addEventListener('click', () => this.connectWebSocket());
    }
    
    initializeChart() {
        if (this.liveChart) this.liveChart.destroy();
        const isDarkMode = document.documentElement.classList.contains('dark');
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
        const tickColor = isDarkMode ? '#9ca3af' : '#6b7280';

        const ctx = this.ui.chartCanvas.getContext('2d');
        this.liveChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Niveau Sonore (dB)',
                    data: [],
                    borderColor: '#22d3ee',
                    backgroundColor: 'rgba(34, 211, 238, 0.2)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { display: false },
                    y: { 
                        beginAtZero: true, 
                        max: 120,
                        grid: { color: gridColor },
                        ticks: { color: tickColor }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    updateDbUI(db) {
        const roundedDb = Math.round(db);
        this.ui.dbDisplay.innerHTML = `${roundedDb}<span class="text-3xl text-light-text-secondary dark:text-dark-text-secondary">dB</span>`;
        
        const percentage = Math.min(db / 120 * 100, 100);
        this.ui.dbBar.style.width = `${percentage}%`;
        
        // --- MODIFIED: Use dynamic alert threshold for color coding ---
        const yellowThreshold = this.alertThreshold * 0.7; // Yellow starts at 70% of alert level
        if (db < yellowThreshold) this.ui.dbBar.className = 'bg-status-green h-2.5 rounded-full transition-all duration-300';
        else if (db < this.alertThreshold) this.ui.dbBar.className = 'bg-status-yellow h-2.5 rounded-full transition-all duration-300';
        else this.ui.dbBar.className = 'bg-status-red h-2.5 rounded-full transition-all duration-300';

        this.ui.highLevelAlert.classList.toggle('hidden', db < this.alertThreshold);
    }

    updateChart(data) {
        if (!this.liveChart) return;
        
        this.liveChart.data.labels.push(new Date().toLocaleTimeString());
        this.liveChart.data.datasets[0].data.push(data.db);

        if (this.liveChart.data.labels.length > this.MAX_CHART_POINTS) {
            this.liveChart.data.labels.shift();
            this.liveChart.data.datasets[0].data.shift();
        }
        this.liveChart.update('none');
    }
    
    startDataRateCalculation() {
        let messageCount = 0;
        const sessionStartTime = Date.now();
        if (this.dataRateInterval) clearInterval(this.dataRateInterval);

        this.dataRateInterval = setInterval(() => {
            const elapsedSeconds = (Date.now() - sessionStartTime) / 1000;
            const rate = elapsedSeconds > 1 ? (messageCount / elapsedSeconds).toFixed(1) : 0;
            this.ui.dataRateDisplay.innerHTML = `${rate} <span class="text-base text-light-text-secondary dark:text-dark-text-secondary">/sec</span>`;
        }, 2000);
        
        return () => messageCount++;
    }

    stopDataRateCalculation() {
        if (this.dataRateInterval) clearInterval(this.dataRateInterval);
        this.dataRateInterval = null;
        this.ui.dataRateDisplay.innerHTML = `0 <span class="text-base text-light-text-secondary dark:text-dark-text-secondary">/sec</span>`;
    }

    async loadPorts() {
        try {
            const ports = await api.getSerialPorts();
            this.ui.portSelect.innerHTML = '<option value="">-- Sélectionnez un appareil --</option>';
            if (ports.length === 0) {
                this.ui.portSelect.innerHTML = '<option value="">Aucun appareil trouvé</option>';
            } else {
                ports.forEach(port => {
                    const option = document.createElement('option');
                    option.value = port.device;
                    option.textContent = `${port.description} (${port.device})`;
                    this.ui.portSelect.appendChild(option);
                });
            }
        } catch (error) {
            this.ui.statusMessage.textContent = error.message;
        }
    }

    async connectWebSocket() {
        if (this.socket) {
            this.socket.close();
            return;
        }

        const selectedPort = this.ui.portSelect.value;
        if (!selectedPort) {
            this.ui.statusMessage.textContent = 'Veuillez sélectionner un port.';
            return;
        }
        
        this.initializeChart();
        this.updateDbUI(0);
        this.ui.statusMessage.textContent = 'Nettoyage des anciennes données...';
        
        try {
            await api.clearReadings(); 
            await api.clearPublicSoundReadings();
        } catch (error) {
            this.ui.statusMessage.textContent = `Erreur lors du nettoyage : ${error.message}`;
            return;
        }

        const token = localStorage.getItem('accessToken');
        const encodedPort = selectedPort.replace(/\//g, '---');
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${window.location.host}/ws/${encodedPort}?token=${token}`;
        
        this.socket = new WebSocket(wsUrl);
        const incrementMessageCount = this.startDataRateCalculation();

        this.socket.onopen = () => {
            this.ui.statusMessage.textContent = `Connecté à ${selectedPort}. En attente...`;
            this.ui.startBtn.textContent = 'Arrêter le Monitoring';
            this.ui.startBtn.className = 'w-full bg-status-red text-white font-semibold py-3 rounded-lg shadow-lg hover:opacity-90 transition-opacity';
            this.ui.portSelect.disabled = true;
            // --- NEW: Disable threshold input during monitoring ---
            this.ui.alertThresholdInput.disabled = true;
        };

        this.socket.onmessage = (event) => {
            incrementMessageCount();
            const data = JSON.parse(event.data);
            if (data.error) {
                this.ui.statusMessage.textContent = `Erreur: ${data.error}`;
                this.socket.close();
            } else if (data.db !== undefined) {
                this.ui.statusMessage.textContent = `Flux de données actif`;
                this.updateDbUI(data.db);
                this.updateChart(data);
            }
        };

        this.socket.onclose = () => {
            this.ui.statusMessage.textContent = 'Connexion fermée.';
            this.ui.startBtn.textContent = 'Démarrer le Monitoring';
            this.ui.startBtn.className = 'w-full bg-button-gradient text-white font-semibold py-3 rounded-lg shadow-lg hover:opacity-90 transition-opacity';
            this.ui.portSelect.disabled = false;
            // --- NEW: Re-enable threshold input ---
            this.ui.alertThresholdInput.disabled = false;
            this.socket = null;
            this.stopDataRateCalculation();
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket Error:', error);
            this.ui.statusMessage.textContent = 'Erreur de connexion WebSocket.';
        };
    }
}
export default Monitor;