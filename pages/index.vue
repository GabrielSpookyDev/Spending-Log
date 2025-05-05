<script setup lang="ts">
import { useSpendingStore } from "~/stores/spending";
import { storeToRefs } from "pinia";
import { useFormatters } from "~/composables/useFormatters";

const spendingStore = useSpendingStore();
const { monthlyBudget, dailyBudget, spendingDays, expenses } =
  storeToRefs(spendingStore);
const { formatCurrency, formatDate } = useFormatters();

// Calculate total spent and remaining
const totalSpent = computed(() => spendingStore.getTotalSpentThisMonth());
const totalRemaining = computed(
  () => monthlyBudget.value.amount - totalSpent.value
);

// Calculate percentage spent and color
const percentageSpent = computed(() => {
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

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

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
</script>

<template>
  <div>
    <!-- Top cards row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <!-- Budget card -->
      <UCard class="relative overflow-hidden">
        <div class="flex items-center mb-4">
          <div class="p-2 rounded-full bg-blue-100 mr-3">
            <Icon
              name="i-heroicons-currency-dollar"
              class="text-blue-600 w-5 h-5"
            />
          </div>
          <h3 class="text-sm font-medium text-gray-500">Monthly Budget</h3>
        </div>
        <p class="text-2xl font-semibold">
          {{ formatCurrency(monthlyBudget.amount) }}
        </p>

        <!-- Progress bar -->
        <div class="mt-4">
          <div class="flex justify-between text-sm mb-1">
            <span>{{ percentageSpent }}% spent</span>
            <span
              >{{ formatCurrency(totalSpent) }} /
              {{ formatCurrency(monthlyBudget.amount) }}</span
            >
          </div>
          <UProgress :value="percentageSpent" :color="progressColor" />
        </div>
      </UCard>

      <!-- Daily budget card -->
      <UCard class="relative overflow-hidden">
        <div class="flex items-center mb-4">
          <div class="p-2 rounded-full bg-green-100 mr-3">
            <Icon name="i-heroicons-calendar" class="text-green-600 w-5 h-5" />
          </div>
          <h3 class="text-sm font-medium text-gray-500">Today's Budget</h3>
        </div>
        <p class="text-2xl font-semibold">{{ formatCurrency(dailyBudget) }}</p>
        <div class="mt-4 text-sm text-gray-500 flex justify-between">
          <span>Spent today: {{ formatCurrency(todayData.spent) }}</span>
          <span
            :class="
              todayData.remaining >= 0 ? 'text-green-600' : 'text-red-600'
            "
          >
            {{ todayData.remaining >= 0 ? "Remaining: " : "Overspent: " }}
            {{ formatCurrency(Math.abs(todayData.remaining)) }}
          </span>
        </div>
      </UCard>

      <!-- Remaining budget card -->
      <UCard class="relative overflow-hidden">
        <div class="flex items-center mb-4">
          <div
            :class="`p-2 rounded-full ${
              totalRemaining >= 0 ? 'bg-green-100' : 'bg-red-100'
            } mr-3`"
          >
            <Icon
              :name="
                totalRemaining >= 0
                  ? 'i-heroicons-banknotes'
                  : 'i-heroicons-exclamation-triangle'
              "
              :class="`${
                totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'
              } w-5 h-5`"
            />
          </div>
          <h3 class="text-sm font-medium text-gray-500">Remaining Budget</h3>
        </div>
        <p
          :class="`text-2xl font-semibold ${
            totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'
          }`"
        >
          {{ formatCurrency(Math.abs(totalRemaining)) }}
          <span class="text-sm font-normal">{{
            totalRemaining < 0 ? "overspent" : ""
          }}</span>
        </p>
        <p class="mt-4 text-sm text-gray-500">
          {{
            new Date().toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })
          }}
        </p>
      </UCard>
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
        <Icon
          name="i-heroicons-receipt-percent"
          class="mx-auto h-12 w-12 text-gray-400"
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

    <!-- Full Monthly overview (only on larger screens) -->
    <UCard class="mt-6 hidden md:block">
      <template #header>
        <h3 class="text-lg font-medium">Monthly Spending Overview</h3>
      </template>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b">
              <th class="text-left py-2 px-2">Date</th>
              <th class="text-left py-2 px-2">Budget</th>
              <th class="text-left py-2 px-2">Spent</th>
              <th class="text-left py-2 px-2">Remaining</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="day in spendingDays"
              :key="day.date"
              class="border-b last:border-none hover:bg-gray-50 dark:hover:bg-gray-800"
              :class="
                day.date === todayString ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              "
            >
              <td class="py-3 px-2">{{ formatDate(day.date) }}</td>
              <td class="py-3 px-2">{{ formatCurrency(day.budget) }}</td>
              <td class="py-3 px-2">{{ formatCurrency(day.spent) }}</td>
              <td
                class="py-3 px-2"
                :class="day.remaining >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ formatCurrency(day.remaining) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </div>
</template>
