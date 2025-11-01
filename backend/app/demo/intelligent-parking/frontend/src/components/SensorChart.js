import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { fr } from 'date-fns/locale';

class SensorChart {
    constructor(sensorKey, data, config) {
        this.sensorKey = sensorKey;
        this.data = data;
        this.config = config;
        this.chartInstance = null;
    }

    async render() {
        return `
            <div class="glass-card p-6 h-full flex flex-col">
                <div class="flex items-center mb-4">
                    <i class="fa-solid ${this.config.icon} text-2xl" style="color: ${this.config.color};"></i>
                    <h3 class="ml-4 text-lg font-semibold text-light-text dark:text-dark-text">${this.config.title}</h3>
                </div>
                <div class="flex-grow min-h-[250px]">
                    <canvas id="${this.sensorKey}-chart"></canvas>
                </div>
            </div>
        `;
    }

    async after_render() {
        const isDarkMode = document.documentElement.classList.contains('dark');
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
        const tickColor = isDarkMode ? '#9ca3af' : '#6b7280';
        const titleColor = isDarkMode ? '#f9fafb' : '#111827';

        const ctx = document.getElementById(`${this.sensorKey}-chart`).getContext('2d');
        const labels = this.data.map(d => new Date(d.timestamp));
        const chartValues = this.data.map(d => d.valeur);

        this.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `${this.config.title} (${this.config.unit})`,
                    data: chartValues,
                    borderColor: this.config.color,
                    backgroundColor: `${this.config.color}33`,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'minute',
                            tooltipFormat: 'dd/MM/yyyy HH:mm:ss',
                            displayFormats: {
                                minute: 'HH:mm'
                            }
                        },
                        adapters: { date: { locale: fr } },
                        ticks: { color: tickColor },
                        grid: { color: gridColor }
                    },
                    y: {
                        beginAtZero: false,
                        title: { display: false },
                        ticks: { color: tickColor },
                        grid: { color: gridColor }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        titleColor: titleColor,
                        bodyColor: tickColor,
                        backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                        borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(226, 232, 240, 1)',
                        borderWidth: 1,
                    }
                },
                interaction: { mode: 'nearest', axis: 'x', intersect: false }
            }
        });
    }
}

export default SensorChart;