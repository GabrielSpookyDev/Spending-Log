<script setup lang="ts">
import { months } from "~/stores/spending";
import { useFormatters } from "~/composables/useFormatters";

defineProps({
  budgetAmount: {
    type: Number,
    required: true,
  },
  selectedMonth: {
    type: String,
    required: true,
  },
  selectedYear: {
    type: Number,
    required: true,
  },
  formState: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits([
  "update:budgetAmount",
  "update:selectedMonth",
  "update:selectedYear",
]);

const { formatCurrency } = useFormatters();

// Generate years (current year ± 5 years)
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
</script>

<template>
  <div>
    <h3 class="text-md font-medium mb-4">Monthly Budget</h3>

    <div class="grid gap-6 md:grid-cols-2">
      <UFormField
        label="Budget Amount"
        help="Set your total spending budget for the month"
        name="budgetAmount"
        required
      >
        <span class="text-gray-500">$</span>
        <UInput
          :value="budgetAmount"
          type="number"
          placeholder="Enter your monthly budget"
          min="0"
          step="0.01"
          class="pl-1"
          @input="emit('update:budgetAmount', Number($event.target.value))"
        />
      </UFormField>

      <UFormField label="Budget Period" required>
        <div class="grid grid-cols-2 gap-2">
          <USelect
            :value="selectedMonth"
            :items="months.map((month) => ({ label: month, value: month }))"
            placeholder="Select month"
            name="selectedMonth"
            @update:model-value="emit('update:selectedMonth', $event)"
          />
          <USelect
            :value="selectedYear"
            :items="
              years.map((year) => ({
                label: year.toString(),
                value: year,
              }))
            "
            placeholder="Select year"
            name="selectedYear"
            @update:model-value="emit('update:selectedYear', $event)"
          />
        </div>
      </UFormField>
    </div>

    <div class="mt-6">
      <h3 class="text-md font-medium mb-4">Preview</h3>
      <div
        class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
      >
        <div class="flex justify-between items-center mb-2">
          <span class="text-gray-500">Monthly Budget:</span>
          <span class="font-medium">{{ formatCurrency(budgetAmount) }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-500">Time Period:</span>
          <span class="font-medium"
            >{{ selectedMonth }} {{ selectedYear }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
