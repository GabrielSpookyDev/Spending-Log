<script setup lang="ts">
import { useSpendingStore } from "~/stores/spending";
import { storeToRefs } from "pinia";
import { useFormatters } from "~/composables/useFormatters";

const spendingStore = useSpendingStore();
const { monthlyBudget, dailyBudget, spendingDays } = storeToRefs(spendingStore);
const { formatCurrency, formatDate } = useFormatters();

// Calculate total spent and remaining
const totalSpent = computed(() => spendingStore.getTotalSpentThisMonth());
const totalRemaining = computed(
  () => monthlyBudget.value.amount - totalSpent.value
);
</script>

<template>
  <div>
    <UCard class="mb-4">
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-bold">Monthly Budget</h2>
          <UButton
            to="/settings"
            icon="i-heroicons-cog-6-tooth"
            color="neutral"
            variant="ghost"
          />
        </div>
      </template>

      <div class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UCard>
            <div class="text-center">
              <div class="text-gray-500 mb-1">Monthly Budget</div>
              <div class="text-2xl font-bold">
                {{ formatCurrency(monthlyBudget.amount) }}
              </div>
            </div>
          </UCard>

          <UCard>
            <div class="text-center">
              <div class="text-gray-500 mb-1">Daily Budget</div>
              <div class="text-2xl font-bold">
                {{ formatCurrency(dailyBudget) }}
              </div>
            </div>
          </UCard>

          <UCard>
            <div class="text-center">
              <div class="text-gray-500 mb-1">Remaining</div>
              <div
                class="text-2xl font-bold"
                :class="totalRemaining > 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ formatCurrency(totalRemaining) }}
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <UButton to="/expenses/add" color="primary" icon="i-heroicons-plus">
            Add Expense
          </UButton>
        </div>
      </template>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="text-lg font-bold">Daily Spending Overview</h2>
      </template>

      <div class="overflow-x-auto">
        <table class="w-full table-auto">
          <thead>
            <tr>
              <th class="px-4 py-2 text-left">Date</th>
              <th class="px-4 py-2 text-left">Budget</th>
              <th class="px-4 py-2 text-left">Spent</th>
              <th class="px-4 py-2 text-left">Remaining</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="day in spendingDays" :key="day.date">
              <td class="px-4 py-2">{{ formatDate(day.date) }}</td>
              <td class="px-4 py-2">{{ formatCurrency(day.budget) }}</td>
              <td class="px-4 py-2">{{ formatCurrency(day.spent) }}</td>
              <td
                class="px-4 py-2"
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
