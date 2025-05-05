<script setup lang="ts">
import { useSpendingStore } from "~/stores/spending";

const spendingStore = useSpendingStore();

const newExpense = reactive({
  amount: 0,
  description: "",
  date: new Date().toISOString().split("T")[0],
  category: "general",
});

const categories = [
  { label: "General", value: "general" },
  { label: "Food", value: "food" },
  { label: "Transportation", value: "transportation" },
  { label: "Entertainment", value: "entertainment" },
  { label: "Utilities", value: "utilities" },
  { label: "Shopping", value: "shopping" },
  { label: "Health", value: "health" },
  { label: "Other", value: "other" },
];

function saveExpense() {
  spendingStore.addExpense(newExpense);
  navigateTo("/");
}
</script>

<template>
  <div>
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-bold">Add Expense</h2>
          <UButton to="/" icon="i-heroicons-home" variant="ghost" />
        </div>
      </template>

      <div class="p-4 space-y-4">
        <UFormGroup label="Amount">
          <UInput
            v-model="newExpense.amount"
            type="number"
            placeholder="Enter amount"
            min="0"
            step="0.01"
          />
        </UFormGroup>

        <UFormGroup label="Description">
          <UInput
            v-model="newExpense.description"
            placeholder="What did you spend on?"
          />
        </UFormGroup>

        <UFormGroup label="Date">
          <UInput v-model="newExpense.date" type="date" />
        </UFormGroup>

        <UFormGroup label="Category">
          <USelect v-model="newExpense.category" :options="categories" />
        </UFormGroup>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton to="/" variant="ghost"> Cancel </UButton>
          <UButton color="primary" @click="saveExpense"> Save Expense </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>
