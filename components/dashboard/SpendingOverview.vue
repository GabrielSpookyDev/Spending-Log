<script setup lang="ts">
import { useSpendingStore } from "~/stores/spending";
import { storeToRefs } from "pinia";
import { useFormatters } from "~/composables/useFormatters";

const spendingStore = useSpendingStore();
const { expenses } = storeToRefs(spendingStore);
const { formatCurrency } = useFormatters();

// Add yearly overview functionality
const overviewTab = ref("monthly");
const selectedYear = ref(new Date().getFullYear());
const availableYears = computed(() => {
  const years = new Set<number>();
  // Add the current year by default
  years.add(new Date().getFullYear());
  // Add years from expenses
  expenses.value.forEach((expense) => {
    const expenseYear = new Date(expense.date).getFullYear();
    years.add(expenseYear);
  });
  // Sort years in descending order
  return Array.from(years).sort((a, b) => b - a);
});

// Define interfaces for spending data
interface MonthlySpending {
  month: string;
  transactions: number;
  totalSpent: string;
}

interface YearlySpending {
  year: number;
  totalSpent: string;
  transactions: number;
}

// Calculate monthly spending data
const monthlySpendingData = computed<MonthlySpending[]>(() => {
  const monthlyData: MonthlySpending[] = [];

  for (let month = 0; month < 12; month++) {
    const monthName = new Date(selectedYear.value, month, 1).toLocaleString(
      "default",
      { month: "long" }
    );

    // Filter expenses for this month and year
    const monthExpenses = expenses.value.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === month &&
        expenseDate.getFullYear() === selectedYear.value
      );
    });

    // Calculate total spent for this month
    const totalSpent = monthExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    monthlyData.push({
      month: monthName,
      transactions: monthExpenses.length,
      totalSpent: formatCurrency(totalSpent),
    });
  }

  return monthlyData;
});

// Calculate yearly spending data
const yearlySpendingData = computed<YearlySpending[]>(() => {
  const yearlyData: YearlySpending[] = [];

  // Use available years or default range
  availableYears.value.forEach((year) => {
    // Filter expenses for this year
    const yearExpenses = expenses.value.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === year;
    });

    // Calculate total spent for this year
    const totalSpent = yearExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    yearlyData.push({
      year,
      transactions: yearExpenses.length,
      totalSpent: formatCurrency(totalSpent),
    });
  });

  return yearlyData;
});
</script>

<template>
  <UCard class="mt-6">
    <template #header>
      <div
        class="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center"
      >
        <h3 class="text-lg font-medium">Spending Overview</h3>
        <div class="mt-2 sm:mt-0">
          <UTabs
            v-model="overviewTab"
            variant="link"
            :items="[
              { label: 'Monthly', slot: 'monthly', value: 'monthly' },
              { label: 'Yearly', slot: 'yearly', value: 'yearly' },
            ]"
          />
        </div>
      </div>
    </template>

    <!-- Monthly Spending Overview -->
    <div v-if="overviewTab === 'monthly'">
      <div class="mb-4 flex justify-between items-center">
        <h4 class="text-sm font-medium text-gray-700">
          Monthly Spending in {{ selectedYear }}
        </h4>
        <USelect
          v-model="selectedYear"
          :items="availableYears"
          placeholder="Select Year"
          size="sm"
          class="w-32"
        />
      </div>

      <UTable :data="monthlySpendingData" />
    </div>

    <!-- Yearly Spending Overview -->
    <div
      v-if="overviewTab === 'yearly'"
      class="overflow-x-auto overflow-y-auto max-h-96"
    >
      <UTable :data="yearlySpendingData" />
    </div>
  </UCard>
</template>
