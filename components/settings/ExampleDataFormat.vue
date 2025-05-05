<script setup lang="ts">
// Example data for import
const _exampleData = {
  monthlyBudget: {
    amount: 1000,
    month: "January",
    year: 2023,
  },
  expenses: [
    {
      id: "1234567890",
      amount: 25.99,
      description: "Groceries",
      date: "2023-01-15",
      category: "food",
    },
  ],
};
</script>

<template>
  <div class="mt-6">
    <UAccordion
      :items="[
        {
          label: 'Example Import Data Format',
          slot: 'example-data',
          icon: 'i-heroicons-document-text',
          description: 'This is the expected JSON format for importing data',
        },
      ]"
    >
      <template #example-data>
        <div class="mt-4">
          <pre
            class="text-xs bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-auto"
          ><code><span class="text-gray-800 dark:text-gray-300">{
  <span class="text-blue-600 dark:text-blue-400">"monthlyBudget"</span>: {
    <span class="text-blue-600 dark:text-blue-400">"amount"</span>: <span class="text-green-600 dark:text-green-400">1000</span>,
    <span class="text-blue-600 dark:text-blue-400">"month"</span>: <span class="text-amber-600 dark:text-amber-400">"January"</span>,
    <span class="text-blue-600 dark:text-blue-400">"year"</span>: <span class="text-green-600 dark:text-green-400">2023</span>
  },
  <span class="text-blue-600 dark:text-blue-400">"expenses"</span>: [
    {
      <span class="text-blue-600 dark:text-blue-400">"id"</span>: <span class="text-amber-600 dark:text-amber-400">"1234567890"</span>,
      <span class="text-blue-600 dark:text-blue-400">"amount"</span>: <span class="text-green-600 dark:text-green-400">25.99</span>,
      <span class="text-blue-600 dark:text-blue-400">"description"</span>: <span class="text-amber-600 dark:text-amber-400">"Groceries"</span>,
      <span class="text-blue-600 dark:text-blue-400">"date"</span>: <span class="text-amber-600 dark:text-amber-400">"2023-01-15"</span>,
      <span class="text-blue-600 dark:text-blue-400">"category"</span>: <span class="text-amber-600 dark:text-amber-400">"food"</span>
    }
  ]
}</span></code></pre>
        </div>
      </template>
    </UAccordion>
  </div>
</template>
