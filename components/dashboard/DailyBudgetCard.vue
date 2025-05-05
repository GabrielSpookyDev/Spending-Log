<script setup lang="ts">
import { useFormatters } from "~/composables/useFormatters";
import CircleIcon from "~/components/CircleIcon.vue";

defineProps<{
  dailyBudget: number;
  todayData: {
    spent: number;
    remaining: number;
  };
}>();

const { formatCurrency } = useFormatters();
</script>

<template>
  <UCard class="relative overflow-hidden">
    <div class="flex items-center mb-4">
      <CircleIcon
        name="i-heroicons-calendar"
        bg-color="bg-green-100"
        icon-color="text-green-600"
      />
      <h3 class="text-sm font-medium text-gray-500">Today's Budget</h3>
    </div>
    <p class="text-2xl font-semibold">{{ formatCurrency(dailyBudget) }}</p>
    <div class="mt-4 text-sm text-gray-500 flex justify-between">
      <span>Spent today: {{ formatCurrency(todayData.spent) }}</span>
      <span
        :class="todayData.remaining >= 0 ? 'text-green-600' : 'text-red-600'"
      >
        {{ todayData.remaining >= 0 ? "Remaining: " : "Overspent: " }}
        {{ formatCurrency(Math.abs(todayData.remaining)) }}
      </span>
    </div>
  </UCard>
</template>
