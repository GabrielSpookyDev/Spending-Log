<script setup lang="ts">
import SpendingChart from "../SpendingChart.vue";
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-medium">Spending by Category</h3>
      </div>
    </template>

    <div class="py-4 flex justify-center">
      <SpendingChart :height="250" :width="250" />
    </div>
  </UCard>
</template>
