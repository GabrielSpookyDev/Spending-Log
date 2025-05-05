<script setup lang="ts">
import { useFormatters } from "~/composables/useFormatters";
import { computed } from "vue";

const { formatCurrency } = useFormatters();

interface SpendingDay {
  date: string;
  budget: number;
  spent: number;
  remaining: number;
}

interface TableRow {
  date: string;
  budget: string;
  spent: string;
  remaining: string;
}

const props = defineProps<{
  currentWeek: SpendingDay[];
}>();

// Transform the data for UTable
const tableData = computed<TableRow[]>(() => {
  return props.currentWeek.map((day: SpendingDay) => ({
    date: new Date(day.date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
    budget: formatCurrency(day.budget),
    spent: formatCurrency(day.spent),
    remaining: formatCurrency(day.remaining),
  }));
});
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-medium">Weekly Overview</h3>
      </div>
    </template>

    <UTable :data="tableData" />
  </UCard>
</template>
