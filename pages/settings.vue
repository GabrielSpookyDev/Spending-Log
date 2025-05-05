<script setup lang="ts">
import { useSpendingStore } from "~/stores/spending";
import { storeToRefs } from "pinia";

const spendingStore = useSpendingStore();
const { monthlyBudget } = storeToRefs(spendingStore);

const budgetAmount = ref(monthlyBudget.value.amount);

function saveBudget() {
  spendingStore.setMonthlyBudget(budgetAmount.value);
  navigateTo("/");
}
</script>

<template>
  <div>
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-bold">Budget Settings</h2>
          <UButton
            to="/"
            icon="i-heroicons-home"
            color="neutral"
            variant="ghost"
          />
        </div>
      </template>

      <div class="p-4">
        <UFormGroup label="Monthly Budget Amount">
          <UInput
            v-model="budgetAmount"
            type="number"
            placeholder="Enter your monthly budget"
            min="0"
            step="0.01"
          />
        </UFormGroup>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton to="/" color="neutral" variant="ghost"> Cancel </UButton>
          <UButton color="primary" @click="saveBudget"> Save Budget </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>
