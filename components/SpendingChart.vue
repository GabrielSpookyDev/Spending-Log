<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useSpendingStore } from "~/stores/spending";
import { useFormatters } from "~/composables/useFormatters";
import { Chart, registerables } from "chart.js";
import type { ChartOptions } from "chart.js";
import { Doughnut } from "vue-chartjs";

Chart.register(...registerables);

// Type for the chart tooltip item
interface TooltipItem {
  label?: string;
  raw?: number;
}

// Type for category totals
interface CategoryTotals {
  [key: string]: number;
}

const props = defineProps({
  height: {
    type: Number,
    default: 220,
  },
  width: {
    type: Number,
    default: 220,
  },
});

const store = useSpendingStore();
const { formatCurrency } = useFormatters();

// Color palette
const colorPalette = [
  "#4F46E5", // Indigo
  "#0EA5E9", // Sky
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#F97316", // Orange
  "#84CC16", // Lime
  "#0891B2", // Cyan
  "#8B5CF6", // Violet (duplicate for last item)
];

const chartData = ref({
  labels: ["No data"] as string[],
  datasets: [
    {
      backgroundColor: ["#e2e8f0"] as string[],
      data: [100] as number[],
    },
  ],
});

// Fix for the chartOptions type
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const, // Type as const to make TypeScript happy
      labels: {
        boxWidth: 12,
        usePointStyle: true,
      },
    },
    tooltip: {
      callbacks: {
        label: function (tooltipItem: TooltipItem) {
          return `${tooltipItem.label || ""}: ${formatCurrency(
            tooltipItem.raw || 0
          )}`;
        },
      },
    },
  },
  // Fix for the mouse movement issue
  layout: {
    padding: {
      top: 10,
      bottom: 10,
    },
  },
} as ChartOptions<"doughnut">;

// Generate chart data based on expenses
function generateChartData() {
  // Group expenses by category and sum amounts
  const categoryTotals: CategoryTotals = {};

  // Month filter - only show current month
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const currentExpenses = store.expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return (
      expenseDate.getMonth() === currentMonth &&
      expenseDate.getFullYear() === currentYear
    );
  });

  // Group by category
  currentExpenses.forEach((expense) => {
    const { category, amount } = expense;
    if (!categoryTotals[category]) {
      categoryTotals[category] = 0;
    }
    categoryTotals[category] += amount;
  });

  // Sort by amount (descending)
  const sortedCategories = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1]
  );

  // Prepare labels and data
  const labels: string[] = [];
  const data: number[] = [];
  const colors: string[] = [];

  sortedCategories.forEach(([category, amount], index) => {
    // Find category label from store's category list
    const categoryInfo = store.categories.find((c) => c.value === category);
    labels.push(categoryInfo ? categoryInfo.label : category);
    data.push(amount);
    colors.push(colorPalette[index % colorPalette.length]);
  });

  // Update chart data
  chartData.value = {
    labels,
    datasets: [
      {
        backgroundColor: colors,
        data,
      },
    ],
  };
}

onMounted(() => {
  generateChartData();
});

// Watch for changes in expenses to update chart
watch(
  () => store.expenses,
  () => {
    generateChartData();
  },
  { deep: true }
);
</script>

<template>
  <div class="flex flex-col items-center relative">
    <div class="h-[300px] w-full flex items-center justify-center">
      <Doughnut
        :data="chartData"
        :options="chartOptions"
        :height="props.height"
        :width="props.width"
      />
    </div>
  </div>
</template>
