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
  spent: number;
  count: number;
}

interface YearlySpending {
  year: number;
  spent: number;
  count: number;
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
      spent: totalSpent,
      count: monthExpenses.length,
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
      spent: totalSpent,
      count: yearExpenses.length,
    });
  });

  return yearlyData;
});
</script>

<template>
  <UCard class="mt-6 hidden md:block">
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

      <div class="overflow-x-auto overflow-y-auto max-h-96">
        <table class="w-full">
          <thead>
            <tr class="border-b">
              <th class="text-left py-2 px-2">Month</th>
              <th class="text-right py-2 px-2">Transactions</th>
              <th class="text-right py-2 px-2">Total Spent</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(month, index) in monthlySpendingData"
              :key="index"
              class="border-b last:border-none hover:bg-gray-50 dark:hover:bg-gray-800"
              :class="
                month.month ===
                  new Date().toLocaleString('default', { month: 'long' }) &&
                selectedYear === new Date().getFullYear()
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : ''
              "
            >
              <td class="py-3 px-2">{{ month.month }}</td>
              <td class="py-3 px-2 text-right">{{ month.count }}</td>
              <td class="py-3 px-2 text-right">
                {{ formatCurrency(month.spent) }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="font-medium bg-gray-50 dark:bg-gray-800">
              <td class="py-3 px-2">Total</td>
              <td class="py-3 px-2 text-right">
                {{
                  monthlySpendingData.reduce(
                    (sum, month) => sum + month.count,
                    0
                  )
                }}
              </td>
              <td class="py-3 px-2 text-right">
                {{
                  formatCurrency(
                    monthlySpendingData.reduce(
                      (sum, month) => sum + month.spent,
                      0
                    )
                  )
                }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Yearly Spending Overview -->
    <div
      v-if="overviewTab === 'yearly'"
      class="overflow-x-auto overflow-y-auto max-h-96"
    >
      <table class="w-full">
        <thead>
          <tr class="border-b">
            <th class="text-left py-2 px-2">Year</th>
            <th class="text-right py-2 px-2">Transactions</th>
            <th class="text-right py-2 px-2">Total Spent</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="yearData in yearlySpendingData"
            :key="yearData.year"
            class="border-b last:border-none hover:bg-gray-50 dark:hover:bg-gray-800"
            :class="
              yearData.year === new Date().getFullYear()
                ? 'bg-blue-50 dark:bg-blue-900/20'
                : ''
            "
          >
            <td class="py-3 px-2">{{ yearData.year }}</td>
            <td class="py-3 px-2 text-right">{{ yearData.count }}</td>
            <td class="py-3 px-2 text-right">
              {{ formatCurrency(yearData.spent) }}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="font-medium bg-gray-50 dark:bg-gray-800">
            <td class="py-3 px-2">Total</td>
            <td class="py-3 px-2 text-right">
              {{
                yearlySpendingData.reduce((sum, year) => sum + year.count, 0)
              }}
            </td>
            <td class="py-3 px-2 text-right">
              {{
                formatCurrency(
                  yearlySpendingData.reduce((sum, year) => sum + year.spent, 0)
                )
              }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </UCard>
</template>
