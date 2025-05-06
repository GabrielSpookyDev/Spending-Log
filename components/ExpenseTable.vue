<script setup lang="ts">
import { useSpendingStore } from "~/stores/spending";
import { useFormatters } from "~/composables/useFormatters";
import type { TableColumn } from "@nuxt/ui";
import type { Expense } from "~/types";

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
    header: "Delete",
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
      <UButton
        size="sm"
        color="neutral"
        variant="ghost"
        icon="i-heroicons-trash"
        @click="deleteExpense(row.original.id)"
      />
    </template>
  </UTable>
</template>
