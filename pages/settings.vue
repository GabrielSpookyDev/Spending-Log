<script setup lang="ts">
import { useSpendingStore } from "~/stores/spending";
import { storeToRefs } from "pinia";
import { useFormatters } from "~/composables/useFormatters";

const spendingStore = useSpendingStore();
const { monthlyBudget } = storeToRefs(spendingStore);
const { formatCurrency } = useFormatters();

const budgetAmount = ref(monthlyBudget.value.amount);
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const selectedMonth = ref(monthlyBudget.value.month);
const selectedYear = ref(monthlyBudget.value.year);

// Generate years (current year ± 5 years)
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

function saveBudget() {
  monthlyBudget.value.amount = budgetAmount.value;
  monthlyBudget.value.month = selectedMonth.value;
  monthlyBudget.value.year = selectedYear.value;
  navigateTo("/");
}

const hasChanges = computed(() => {
  return (
    budgetAmount.value !== monthlyBudget.value.amount ||
    selectedMonth.value !== monthlyBudget.value.month ||
    selectedYear.value !== monthlyBudget.value.year
  );
});
</script>

<template>
  <div>
    <UCard>
      <template #header>
        <div class="flex items-center">
          <div class="p-2 rounded-full bg-blue-100 mr-3">
            <Icon
              name="i-heroicons-cog-6-tooth"
              class="text-blue-600 w-5 h-5"
            />
          </div>
          <h2 class="text-lg font-medium">Budget Settings</h2>
        </div>
      </template>

      <div class="space-y-6 py-4">
        <div>
          <h3 class="text-md font-medium mb-4">Monthly Budget</h3>

          <div class="grid gap-6 md:grid-cols-2">
            <UFormGroup
              label="Budget Amount"
              help="Set your total spending budget for the month"
            >
              <UInputAddon>
                <span class="text-gray-500">$</span>
                <UInput
                  v-model="budgetAmount"
                  type="number"
                  placeholder="Enter your monthly budget"
                  min="0"
                  step="0.01"
                  class="pl-1"
                />
              </UInputAddon>
            </UFormGroup>

            <UFormGroup label="Budget Period">
              <div class="grid grid-cols-2 gap-2">
                <USelect
                  v-model="selectedMonth"
                  :options="
                    months.map((month) => ({ label: month, value: month }))
                  "
                  placeholder="Select month"
                />
                <USelect
                  v-model="selectedYear"
                  :options="
                    years.map((year) => ({
                      label: year.toString(),
                      value: year,
                    }))
                  "
                  placeholder="Select year"
                />
              </div>
            </UFormGroup>
          </div>
        </div>

        <div>
          <h3 class="text-md font-medium mb-4">Preview</h3>
          <div
            class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <div class="flex justify-between items-center mb-2">
              <span class="text-gray-500">Monthly Budget:</span>
              <span class="font-medium">{{
                formatCurrency(budgetAmount)
              }}</span>
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

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton to="/" color="neutral" variant="ghost"> Cancel </UButton>
          <UButton
            color="primary"
            :disabled="!hasChanges"
            :loading="false"
            @click="saveBudget"
          >
            Save Budget
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>
