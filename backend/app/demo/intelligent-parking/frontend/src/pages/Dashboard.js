import { api } from '../api.js';
import SensorChart from '../components/SensorChart.js';

class Dashboard {
    async render() {
        return `
            <div class="glass-card p-6">
                <div class="flex items-center mb-6 border-b border-light-border dark:border-dark-border pb-4">
                    <i class="fa-solid fa-layer-group text-accent-cyan text-xl"></i>
                    <h1 class="ml-4 text-xl font-semibold text-light-text dark:text-dark-text">Analyse Globale des Capteurs</h1>
                </div>
                <div id="error-box" class="hidden"></div>
                <div id="charts-grid" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    ${this.renderSkeletons()}
                </div>
            </div>
        `;
    }

    renderSkeletons() {
        let skeletons = '';
        for (let i = 0; i < 5; i++) {
            skeletons += `
                <div class="glass-card p-6 h-full flex flex-col animate-pulse">
                    <div class="flex items-center mb-4">
                        <div class="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                        <div class="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-md ml-4"></div>
                    </div>
                    <div class="flex-grow bg-gray-200/50 dark:bg-gray-700/50 rounded-lg"></div>
                </div>
            `;
        }
        return skeletons;
    }

    async after_render() {
        const chartsGrid = document.getElementById('charts-grid');
        const errorBox = document.getElementById('error-box');

        const SENSOR_CONFIG = {
            'capteurTemp': { title: 'Température', icon: 'fa-temperature-half', unit: '°C', color: '#f87171' },
            'capteurLum': { title: 'Luminosité', icon: 'fa-lightbulb', unit: 'lux', color: '#facc15' },
            'capteurSon': { title: 'Niveau Sonore', icon: 'fa-volume-high', unit: 'dB', color: '#22d3ee' },
            'capteurGaz': { title: 'Niveau de Gaz', icon: 'fa-smog', unit: 'ppm', color: '#a78bfa' },
            'capteurProximite': { title: 'Proximité', icon: 'fa-person-walking-arrow-right', unit: 'cm', color: '#34d399' }
        };

        try {
            const sensorData = await api.getAnalytics();
            if (sensorData.error) throw new Error(sensorData.error);
            
            chartsGrid.innerHTML = '';
            let chartsRendered = 0;
            
            for (const sensorKey in SENSOR_CONFIG) {
                if (sensorData[sensorKey] && sensorData[sensorKey].length > 1) {
                    const chartData = sensorData[sensorKey];
                    const chartConfig = SENSOR_CONFIG[sensorKey];
                    const chartComponent = new SensorChart(sensorKey, chartData, chartConfig);
                    
                    const chartWrapper = document.createElement('div');
                    chartWrapper.innerHTML = await chartComponent.render();
                    chartsGrid.appendChild(chartWrapper.firstElementChild);
                    await chartComponent.after_render();
                    chartsRendered++;
                }
            }

            if (chartsRendered === 0) {
                throw new Error("Aucune donnée de capteur suffisante pour afficher les graphiques.");
            }

        } catch (error) {
            chartsGrid.innerHTML = '';
            errorBox.innerHTML = `<div class="bg-red-500/20 border border-red-500 text-red-400 dark:text-red-300 px-4 py-3 rounded-lg text-center">${error.message}</div>`;
            errorBox.classList.remove('hidden');
        }
    }
}
export default Dashboard;