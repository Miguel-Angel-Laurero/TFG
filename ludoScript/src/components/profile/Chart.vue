
<template>
    <div class="w-full h-full">
        <Chart type="line" :data="chartData" :options="chartOptions" />
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Chart from 'primevue/chart';
import { gameService } from '@/api/game.service';

const WEEKLY_CACHE_KEY = 'session_weekly';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const chartData = ref();
const chartOptions = ref();

async function loadWeeklyData() {
    let testsPerDay = [0, 0, 0, 0, 0, 0, 0];
    let xpPerDay    = [0, 0, 0, 0, 0, 0, 0];

    // Try localStorage cache first
    try {
        const cached = localStorage.getItem(WEEKLY_CACHE_KEY);
        if (cached) {
            const { data, cachedAt } = JSON.parse(cached);
            if (Date.now() - cachedAt < CACHE_TTL_MS) {
                testsPerDay = data.testsPerDay;
                xpPerDay    = data.xpPerDay;
                return { testsPerDay, xpPerDay };
            }
        }
    } catch {
        // ignore malformed cache
    }

    // Fetch from backend and update cache
    try {
        const { data } = await gameService.getWeekly();
        testsPerDay = data.testsPerDay;
        xpPerDay    = data.xpPerDay;
        localStorage.setItem(WEEKLY_CACHE_KEY, JSON.stringify({
            data: { testsPerDay, xpPerDay },
            cachedAt: Date.now(),
        }));
    } catch {
        // If fetch fails keep zeros (or cached stale data if available)
    }

    return { testsPerDay, xpPerDay };
}

onMounted(async () => {
    const { testsPerDay, xpPerDay } = await loadWeeklyData();
    chartData.value = setChartData(testsPerDay, xpPerDay);
    chartOptions.value = setChartOptions();
});

const setChartData = (testsPerDay, xpPerDay) => {
    const documentStyle = getComputedStyle(document.documentElement);

    return {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [
            {
                label: 'Tests completados',
                backgroundColor: documentStyle.getPropertyValue('--p-cyan-500') || '#06b6d4',
                borderColor: documentStyle.getPropertyValue('--p-cyan-500') || '#06b6d4',
                data: testsPerDay,
            },
            {
                label: 'Puntos XP ganados',
                backgroundColor: documentStyle.getPropertyValue('--p-purple-500') || '#a855f7',
                borderColor: documentStyle.getPropertyValue('--p-purple-500') || '#a855f7',
                data: xpPerDay,
            }
        ]
    };
};
const setChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color') || '#374151';
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color') || '#6b7280';
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color') || '#e5e7eb';

    return {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
            legend: {
                labels: {
                    color: textColor,
                    font: {
                        size: 12,
                        weight: 500
                    },
                    padding: 15
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += context.dataset.label.includes('XP') 
                                ? context.parsed.y + ' puntos' 
                                : context.parsed.y + ' tests';
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary,
                    font: {
                        weight: 500
                    }
                },
                grid: {
                    display: false,
                    drawBorder: false
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: textColorSecondary,
                    stepSize: 50
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            }
        }
    };
}
</script>
