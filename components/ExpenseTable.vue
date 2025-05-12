<script setup lang="ts">
import { useSpendingStore } from "~/stores/spending";
import { useFormatters } from "~/composables/useFormatters";
import type { TableColumn } from "@nuxt/ui";
import type { Expense } from "~/types";
import { useI18n } from "vue-i18n";

// Define the table row interface
interface TableRow {
  id: string;
  description: string;
  date: string;
  category: string;
  amount: string;
}

const props = defineProps<{
  expenses: Expense[];
}>();

const spendingStore = useSpendingStore();
const { formatCurrency, formatDate } = useFormatters();
const { locale } = useI18n();

// Define columns with delete action column
const columns: TableColumn<TableRow>[] = [
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
  {
    header: "Actions",
    id: "action",
  },
];

// Transform expense data for table
const tableData = computed<TableRow[]>(() => {
  return props.expenses.map((expense) => ({
    id: expense.id,
    description: expense.description,
    date: formatDate(expense.date),
    category: getCategoryLabel(expense.category),
    amount: formatCurrency(expense.amount),
  }));
});

// Get category label
function getCategoryLabel(categoryValue: string): string {
  const category = spendingStore.categories.find(
    (c) => c.value === categoryValue
  );
  return category ? category.label : categoryValue;
}

// Delete expense function
function deleteExpense(id: string) {
  if (confirm("Are you sure you want to delete this expense?")) {
    spendingStore.removeExpense(id);
  }
}
</script>

<template>
  <UTable :data="tableData" :columns="columns">
    <template #action-cell="{ row }">
      <div class="flex space-x-2">
        <UButton
          size="sm"
          color="neutral"
          variant="ghost"
          icon="i-heroicons-pencil-square"
          @click="navigateTo(`/${locale}/expenses/edit/${row.original.id}`)"
        />
        <UButton
          size="sm"
          color="neutral"
          variant="ghost"
          icon="i-heroicons-trash"
          @click="deleteExpense(row.original.id)"
        />
      </div>
    </template>
  </UTable>
</template>
