<script setup lang="ts">
import { useSpendingStore } from "~/stores/spending";
import { storeToRefs } from "pinia";
import { useFormatters } from "~/composables/useFormatters";
import CircleIcon from "~/components/CircleIcon.vue";
import type { Expense } from "~/types";

// Define the structure for the expense groups
interface ExpenseGroup {
  label: string;
  expenses: Expense[];
  total: number;
}

const spendingStore = useSpendingStore();
const { expenses } = storeToRefs(spendingStore);
const { formatCurrency, formatDate, formatMonthYear } = useFormatters();

// Sort expenses by date (newest first)
const sortedExpenses = computed(() => {
  return [...expenses.value].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
});

// Group expenses by month/year with proper typing
const groupedExpenses = computed<ExpenseGroup[]>(() => {
  const groups: Record<string, ExpenseGroup> = {};

  sortedExpenses.value.forEach((expense) => {
    const date = new Date(expense.date);
    const monthYear = formatMonthYear(date);

    if (!groups[monthYear]) {
      groups[monthYear] = {
        label: monthYear,
        expenses: [],
        total: 0,
      };
    }

    groups[monthYear].expenses.push(expense);
    groups[monthYear].total += expense.amount;
  });

  return Object.values(groups);
});

// Get category label
function getCategoryLabel(categoryValue: string): string {
  const category = spendingStore.categories.find(
    (c) => c.value === categoryValue
  );
  return category ? category.label : categoryValue;
}

// Delete expense
function deleteExpense(id: string) {
  if (confirm("Are you sure you want to delete this expense?")) {
    spendingStore.removeExpense(id);
  }
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">All Expenses</h1>
      <UButton to="/expenses/add" color="primary" icon="i-heroicons-plus">
        Add Expense
      </UButton>
    </div>

    <!-- No expenses state -->
    <UCard v-if="sortedExpenses.length === 0" class="text-center py-8">
      <CircleIcon
        name="i-heroicons-receipt-percent"
        bg-color="bg-gray-100"
        icon-color="text-gray-400"
        class="mx-auto"
      />
      <h3 class="mt-2 text-lg font-medium">No expenses yet</h3>
      <p class="mt-1 text-gray-500">
        Start tracking your spending by adding your first expense.
      </p>
      <div class="mt-6">
        <UButton to="/expenses/add" color="primary" icon="i-heroicons-plus">
          Add Your First Expense
        </UButton>
      </div>
    </UCard>

    <!-- Expenses list -->
    <div v-else class="space-y-6">
      <div
        v-for="(group, index) in groupedExpenses"
        :key="index"
        class="space-y-2"
      >
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-medium">{{ group.label }}</h2>
          <div class="text-gray-500 text-sm">
            Total:
            <span class="font-medium">{{ formatCurrency(group.total) }}</span>
          </div>
        </div>

        <UCard>
          <ul class="divide-y">
            <li
              v-for="expense in group.expenses"
              :key="expense.id"
              class="py-4 px-4"
            >
              <div class="flex items-center">
                <div class="mr-4">
                  <CircleIcon
                    :name="
                      spendingStore.categories.find(
                        (c) => c.value === expense.category
                      )?.icon || 'i-heroicons-cube'
                    "
                    bg-color="bg-gray-100 dark:bg-gray-800"
                    icon-color="text-gray-600 dark:text-gray-300"
                  />
                </div>

                <div class="flex-grow">
                  <div class="font-medium">{{ expense.description }}</div>
                  <div class="text-sm text-gray-500">
                    {{ formatDate(expense.date) }} •
                    {{ getCategoryLabel(expense.category) }}
                  </div>
                </div>

                <div class="ml-4 flex flex-col items-end">
                  <div class="font-medium text-red-600">
                    -{{ formatCurrency(expense.amount) }}
                  </div>
                  <UButton
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    icon="i-heroicons-trash"
                    class="mt-2"
                    @click="deleteExpense(expense.id)"
                  />
                </div>
              </div>
            </li>
          </ul>
        </UCard>
      </div>
    </div>
  </div>
</template>
