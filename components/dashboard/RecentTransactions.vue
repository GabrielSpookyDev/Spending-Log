<script setup lang="ts">
import { useSpendingStore } from "~/stores/spending";
import { storeToRefs } from "pinia";
import { useFormatters } from "~/composables/useFormatters";
import CircleIcon from "~/components/CircleIcon.vue";

const spendingStore = useSpendingStore();
const { expenses } = storeToRefs(spendingStore);
const { formatCurrency, formatDate } = useFormatters();

// Define table row interface
interface TableRow {
  description: string;
  date: string;
  category: string;
  amount: string;
}

// Recent transactions
const recentTransactions = computed(() => {
  return [...expenses.value]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
});

// Transform data for UTable
const tableData = computed<TableRow[]>(() => {
  return recentTransactions.value.map((transaction) => ({
    description: transaction.description,
    date: formatDate(transaction.date),
    category:
      transaction.category.charAt(0).toUpperCase() +
      transaction.category.slice(1),
    amount: formatCurrency(transaction.amount),
  }));
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

    <UTable v-else :data="tableData" />

    <template v-if="recentTransactions.length > 0" #footer>
      <div class="text-center">
        <UButton variant="ghost" to="/expenses">View All Transactions</UButton>
      </div>
    </template>
  </UCard>
</template>
