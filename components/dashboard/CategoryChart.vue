<script setup lang="ts">
import SpendingChart from "../SpendingChart.vue";
import { useSpendingStore } from "~/stores/spending";

const store = useSpendingStore();
</script>

<template>
  <UCard class="relative min-h-[350px]">
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-medium">Spending by Category</h3>
      </div>
    </template>

    <div class="py-4 flex justify-center">
      <div
        v-if="store.expenses.length === 0"
        class="px-4 w-11/12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <div
          class="flex items-center justify-center gap-1 text-gray-500 text-center"
        >
          <Icon name="heroicons:sparkles" class="w-6 h-6" />
          <div>Add expenses to view your category breakdown</div>
          <Icon name="heroicons:sparkles" class="w-6 h-6 rotate-180" />
        </div>
      </div>

      <SpendingChart v-else :height="250" :width="250" />
    </div>
  </UCard>
</template>
