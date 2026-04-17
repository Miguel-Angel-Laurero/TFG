<template>
    <div class="w-full h-full bg-slate-950/40 border border-white/[0.08] rounded-2xl">
        <Chart type="bar" :data="chartData" :options="chartOptions" />
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Chart from 'primevue/chart';
import { gameService } from '@/api/game.service';

const chartData = ref();
const chartOptions = ref();

onMounted(async () => {
    let counts = [0, 0, 0, 0, 0, 0, 0];
    let scores = [0, 0, 0, 0, 0, 0, 0];

    try {
        const { data } = await gameService.getWeekly();
        counts = data.counts;
        scores = data.scores;
    } catch (_) {
        // Si falla la petición se muestra el gráfico vacío
    }

    chartData.value = setChartData(counts, scores);
    chartOptions.value = setChartOptions();
});

const setChartData = (counts, scores) => {
    const documentStyle = getComputedStyle(document.documentElement);

    return {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [
            {
                label: 'Rendimiento',
                backgroundColor: documentStyle.getPropertyValue('--p-cyan-500') || '#06b6d4',
                borderColor: documentStyle.getPropertyValue('--p-cyan-500') || '#06b6d4',
                data: counts
            },
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
                    label: function (context) {
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
