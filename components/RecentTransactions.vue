<script setup lang="ts">
import { useSpendingStore } from "~/stores/spending";
import { storeToRefs } from "pinia";
import { useFormatters } from "~/composables/useFormatters";
import CircleIcon from "~/components/CircleIcon.vue";

const spendingStore = useSpendingStore();
const { expenses } = storeToRefs(spendingStore);
const { formatCurrency } = useFormatters();

// Recent transactions
const recentTransactions = computed(() => {
  return [...expenses.value]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
});
</script>

<template>
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
        <UButton variant="ghost" to="/expenses">View All Transactions</UButton>
      </div>
    </template>
  </UCard>
</template>
