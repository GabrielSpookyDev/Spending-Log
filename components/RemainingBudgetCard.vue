<script setup lang="ts">
import { useFormatters } from "~/composables/useFormatters";
import CircleIcon from "~/components/CircleIcon.vue";

defineProps<{
  totalRemaining: number;
}>();

const { formatCurrency, formatMonthYear } = useFormatters();
</script>

<template>
  <UCard class="relative overflow-hidden">
    <div class="flex items-center mb-4">
      <CircleIcon
        :name="
          totalRemaining >= 0
            ? 'i-heroicons-banknotes'
            : 'i-heroicons-exclamation-triangle'
        "
        :bg-color="totalRemaining >= 0 ? 'bg-green-100' : 'bg-red-100'"
        :icon-color="totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'"
      />
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
      {{ formatMonthYear(new Date()) }}
    </p>
  </UCard>
</template>
