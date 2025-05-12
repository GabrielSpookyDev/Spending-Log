<script setup lang="ts">
import { useSpendingStore } from "~/stores/spending";
import { storeToRefs } from "pinia";
import CircleIcon from "~/components/CircleIcon.vue";
import ExpenseTable from "~/components/ExpenseTable.vue";
import { useI18n } from "vue-i18n";

const { locale } = useI18n();
const spendingStore = useSpendingStore();
const { expenses } = storeToRefs(spendingStore);

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
          :to="`/${locale}/expenses/add`"
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
        <UButton
          :to="`/${locale}/expenses/add`"
          icon="i-heroicons-plus"
          color="primary"
        >
          Add Expense
        </UButton>
      </div>
    </div>

    <ExpenseTable v-else :expenses="recentTransactions" />

    <template v-if="recentTransactions.length > 0" #footer>
      <div class="text-center">
        <UButton variant="ghost" :to="`/${locale}/expenses`"
          >View All Transactions</UButton
        >
      </div>
    </template>
  </UCard>
</template>
