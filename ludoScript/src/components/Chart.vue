
<template>
    <div class="h-full w-full">
        <Chart type="bar" :data="chartData" :options="chartOptions" class="w-full h-full min-h-[300px]"  />
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Chart from 'primevue/chart';

onMounted(() => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});

const chartData = ref();
const chartOptions = ref();

const setChartData = () => {
    const documentStyle = getComputedStyle(document.documentElement);

    return {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [
            {
                label: 'Tests completados',
                backgroundColor: documentStyle.getPropertyValue('--p-cyan-500') || '#06b6d4',
                borderColor: documentStyle.getPropertyValue('--p-cyan-500') || '#06b6d4',
                data: [5, 8, 6, 9, 7, 4, 6]
            },
            {
                label: 'Puntos XP ganados',
                backgroundColor: documentStyle.getPropertyValue('--p-purple-500') || '#a855f7',
                borderColor: documentStyle.getPropertyValue('--p-purple-500') || '#a855f7',
                data: [150, 240, 180, 270, 210, 120, 180]
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
