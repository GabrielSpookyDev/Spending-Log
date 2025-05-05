<script setup lang="ts">
import { useSpendingStore } from "~/stores/spending";
import { storeToRefs } from "pinia";
import { useFormatters } from "~/composables/useFormatters";
import CircleIcon from "~/components/CircleIcon.vue";
import MonthlyBudgetCard from "~/components/MonthlyBudgetCard.vue";
import DailyBudgetCard from "~/components/DailyBudgetCard.vue";
import RemainingBudgetCard from "~/components/RemainingBudgetCard.vue";

const spendingStore = useSpendingStore();
const { monthlyBudget, dailyBudget, spendingDays, expenses } =
  storeToRefs(spendingStore);
const { formatCurrency } = useFormatters();

// Calculate total spent and remaining
const totalSpent = computed(() => spendingStore.getTotalSpentThisMonth());
const totalRemaining = computed(
  () => monthlyBudget.value.amount - totalSpent.value
);

// Calculate percentage spent and color
const percentageSpent = computed(() => {
  if (
    !monthlyBudget.value ||
    !monthlyBudget.value.amount ||
    totalSpent.value === undefined
  )
    return 0;
  if (monthlyBudget.value.amount === 0) return 0;
  return Math.min(
    Math.round((totalSpent.value / monthlyBudget.value.amount) * 100),
    100
  );
});

const progressColor = computed(() => {
  if (percentageSpent.value > 80) return "error";
  if (percentageSpent.value > 60) return "warning";
  return "success";
});

// Generate today's data
const today = new Date();
const todayString = today.toISOString().split("T")[0];
const todayData = computed(() => {
  return (
    spendingDays.value.find((day) => day.date === todayString) || {
      date: todayString,
      budget: 0,
      spent: 0,
      remaining: 0,
    }
  );
});

// Filter days to only show current week
const currentWeek = computed(() => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0); // Start of Sunday

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999); // End of Saturday

  return spendingDays.value.filter((day) => {
    const date = new Date(day.date);
    return date >= startOfWeek && date <= endOfWeek;
  });
});

// Recent transactions
const recentTransactions = computed(() => {
  return [...expenses.value]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
});

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
  <div>
    <!-- Top cards row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <MonthlyBudgetCard
        :monthly-budget="monthlyBudget"
        :total-spent="totalSpent"
        :percentage-spent="percentageSpent"
        :progress-color="progressColor"
      />
      <DailyBudgetCard :daily-budget="dailyBudget" :today-data="todayData" />
      <RemainingBudgetCard :total-remaining="totalRemaining" />
    </div>

    <!-- Category chart and weekly view -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Category chart -->
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium">Spending by Category</h3>
          </div>
        </template>

        <div class="py-4 flex justify-center">
          <SpendingChart :height="250" :width="250" />
        </div>
      </UCard>

      <!-- Weekly spending view -->
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium">Weekly Overview</h3>
          </div>
        </template>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left py-2 px-2">Day</th>
                <th class="text-left py-2 px-2">Budget</th>
                <th class="text-left py-2 px-2">Spent</th>
                <th class="text-left py-2 px-2">Remaining</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="day in currentWeek"
                :key="day.date"
                class="border-b last:border-none hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td class="py-3 px-2">
                  <div class="font-medium">
                    {{
                      new Date(day.date).toLocaleDateString("en-US", {
                        weekday: "short",
                      })
                    }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{
                      new Date(day.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }}
                  </div>
                </td>
                <td class="py-3 px-2">{{ formatCurrency(day.budget) }}</td>
                <td class="py-3 px-2">{{ formatCurrency(day.spent) }}</td>
                <td
                  class="py-3 px-2"
                  :class="
                    day.remaining >= 0 ? 'text-green-600' : 'text-red-600'
                  "
                >
                  {{ formatCurrency(day.remaining) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
    </div>

    <!-- Recent transactions -->
    <UCard class="mb-6">
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-medium">Recent Transactions</h3>
          <UButton
            to="/expenses/add"
            icon="i-heroicons-plus"
            size="sm"
            color="primary"
            variant="soft"
          >
            Add Expense
          </UButton>
        </div>
      </template>

      <div
        v-if="recentTransactions.length === 0"
        class="py-8 text-center text-gray-500"
      >
        <CircleIcon
          name="i-heroicons-receipt-percent"
          bg-color="bg-gray-100"
          icon-color="text-gray-400"
          class="mx-auto"
        />
        <h3 class="mt-2 text-sm font-medium">No transactions yet</h3>
        <p class="mt-1 text-sm">Add your first expense to get started.</p>
        <div class="mt-6">
          <UButton to="/expenses/add" icon="i-heroicons-plus" color="primary">
            Add Expense
          </UButton>
        </div>
      </div>

      <div v-else class="overflow-x-auto">
        <ul class="divide-y">
          <li
            v-for="transaction in recentTransactions"
            :key="transaction.id"
            class="py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div class="flex justify-between">
              <div>
                <p class="font-medium">{{ transaction.description }}</p>
                <p class="text-xs text-gray-500">
                  {{
                    new Date(transaction.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  •
                  {{
                    transaction.category.charAt(0).toUpperCase() +
                    transaction.category.slice(1)
                  }}
                </p>
              </div>
              <p class="font-medium text-red-600">
                -{{ formatCurrency(transaction.amount) }}
              </p>
            </div>
          </li>
        </ul>
      </div>

      <template v-if="recentTransactions.length > 0" #footer>
        <div class="text-center">
          <UButton variant="ghost" to="/expenses"
            >View All Transactions</UButton
          >
        </div>
      </template>
    </UCard>

    <!-- Spending Overviews with tabs -->
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
                    yearlySpendingData.reduce(
                      (sum, year) => sum + year.spent,
                      0
                    )
                  )
                }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </UCard>
  </div>
</template>
