<script setup lang="ts">
import { useFormatters } from "~/composables/useFormatters";
import CircleIcon from "~/components/CircleIcon.vue";

defineProps<{
  monthlyBudget: { amount: number };
  totalSpent: number;
  percentageSpent: number;
  progressColor:
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "error"
    | "neutral";
}>();

const { formatCurrency } = useFormatters();
</script>

<template>
  <UCard class="relative overflow-hidden">
    <div class="flex items-center mb-4">
      <CircleIcon
        name="i-heroicons-currency-dollar"
        bg-color="bg-green-100"
        icon-color="text-green-600"
      />
      <h3 class="text-sm font-medium text-gray-500">Monthly Budget</h3>
    </div>
    <p class="text-2xl font-semibold">
      {{ formatCurrency(monthlyBudget.amount) }}
    </p>

    <!-- Progress bar -->
    <div class="mt-4">
      <div class="flex justify-between text-sm mb-1">
        <span>{{ percentageSpent }}% spent</span>
        <span
          >{{ formatCurrency(totalSpent) }} /
          {{ formatCurrency(monthlyBudget.amount) }}</span
        >
      </div>
      <UProgress
        :model-value="percentageSpent"
        :color="progressColor"
        :loading="false"
      />
    </div>
  </UCard>
</template>
