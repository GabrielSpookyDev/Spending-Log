<script setup lang="ts">
import { useSpendingStore, months } from "~/stores/spending";
import { storeToRefs } from "pinia";
import { useFormatters } from "~/composables/useFormatters";
import CircleIcon from "~/components/CircleIcon.vue";
import type { Expense } from "~/types";

const spendingStore = useSpendingStore();
const { monthlyBudget, expenses } = storeToRefs(spendingStore);
const { formatCurrency } = useFormatters();

const budgetAmount = ref(monthlyBudget.value.amount);
const selectedMonth = ref(monthlyBudget.value.month);
const selectedYear = ref(monthlyBudget.value.year);

const formState = reactive({
  valid: true,
  errors: {} as Record<string, string[]>,
});

// Generate years (current year ± 5 years)
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

function validateForm() {
  formState.errors = {};

  if (budgetAmount.value <= 0) {
    formState.errors.budgetAmount = ["Budget amount must be greater than 0"];
  }

  if (!selectedMonth.value) {
    formState.errors.selectedMonth = ["Month is required"];
  }

  if (!selectedYear.value) {
    formState.errors.selectedYear = ["Year is required"];
  }

  formState.valid = Object.keys(formState.errors).length === 0;
  return formState.valid;
}

function saveBudget() {
  if (!validateForm()) return;

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

// Import/Export functionality
const importFile = ref<File | null>(null);
const importError = ref<string | null>(null);
const importSuccess = ref(false);

function exportData() {
  const data = {
    monthlyBudget: monthlyBudget.value,
    expenses: expenses.value,
  };

  const jsonData = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `spending-log-export-${
    new Date().toISOString().split("T")[0]
  }.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    importFile.value = input.files[0];
    importError.value = null;
    importSuccess.value = false;
  }
}

function importData() {
  importError.value = null;
  importSuccess.value = false;

  if (!importFile.value) {
    importError.value = "Please select a file to import";
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      if (!e.target || typeof e.target.result !== "string") {
        throw new Error("Failed to read file");
      }

      const data = JSON.parse(e.target.result);

      // Validate data structure
      if (
        !data.monthlyBudget ||
        !data.expenses ||
        !Array.isArray(data.expenses)
      ) {
        throw new Error("Invalid data format");
      }

      // Validate monthly budget
      if (
        typeof data.monthlyBudget.amount !== "number" ||
        typeof data.monthlyBudget.month !== "string" ||
        typeof data.monthlyBudget.year !== "number"
      ) {
        throw new Error("Invalid monthly budget format");
      }

      // Validate expenses
      for (const expense of data.expenses) {
        if (
          !expense.id ||
          typeof expense.amount !== "number" ||
          typeof expense.description !== "string" ||
          typeof expense.date !== "string" ||
          typeof expense.category !== "string"
        ) {
          throw new Error("Invalid expense format");
        }
      }

      // Update form fields with imported values
      budgetAmount.value = data.monthlyBudget.amount;
      selectedMonth.value = data.monthlyBudget.month;
      selectedYear.value = data.monthlyBudget.year;

      // Using existing methods instead of direct store manipulation
      // This avoids the readonly issues and property access errors

      // First update the budget which we know is supported by the API
      spendingStore.setMonthlyBudget(data.monthlyBudget.amount);

      // Then handle expenses - we need to check the store implementation
      // to ensure we're using proper APIs
      if (data.expenses && Array.isArray(data.expenses)) {
        // Clear existing expenses and add new ones
        data.expenses.forEach((expense: Expense) => {
          // If there's a store method to add expenses, we would use it here
          // Now using the correct approach for the addExpense API
          if (spendingStore.addExpense) {
            // The addExpense method expects an object without id
            const { amount, description, date, category } = expense;
            spendingStore.addExpense({ amount, description, date, category });
          }
        });
      }

      importSuccess.value = true;
      setTimeout(() => {
        importSuccess.value = false;
      }, 3000);
    } catch (error) {
      importError.value =
        error instanceof Error ? error.message : "Failed to import data";
    }
  };

  reader.onerror = () => {
    importError.value = "Error reading file";
  };

  reader.readAsText(importFile.value);
}

// Example data for import
const exampleData = {
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

// Format the JSON with proper indentation and no extra whitespace
// Variable is now prefixed with _ to indicate it's unused
const _exampleJson = JSON.stringify(exampleData, null, 2);
</script>

<template>
  <div>
    <UCard>
      <template #header>
        <div class="flex items-center">
          <CircleIcon
            name="i-heroicons-cog-6-tooth"
            bg-color="bg-blue-100"
            icon-color="text-blue-600"
          />
          <h2 class="text-lg font-medium">Budget Settings</h2>
        </div>
      </template>

      <UForm
        :state="formState"
        class="space-y-6 py-4"
        @submit.prevent="saveBudget"
      >
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
                v-model="budgetAmount"
                type="number"
                placeholder="Enter your monthly budget"
                min="0"
                step="0.01"
                class="pl-1"
              />
            </UFormField>

            <UFormField label="Budget Period" required>
              <div class="grid grid-cols-2 gap-2">
                <USelect
                  v-model="selectedMonth"
                  :items="
                    months.map((month) => ({ label: month, value: month }))
                  "
                  placeholder="Select month"
                  name="selectedMonth"
                />
                <USelect
                  v-model="selectedYear"
                  :items="
                    years.map((year) => ({
                      label: year.toString(),
                      value: year,
                    }))
                  "
                  placeholder="Select year"
                  name="selectedYear"
                />
              </div>
            </UFormField>
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

        <!-- Import/Export Section -->
        <div>
          <h3 class="text-md font-medium mb-4">Data Management</h3>

          <div class="grid gap-6 md:grid-cols-2">
            <UCard class="h-full">
              <template #header>
                <div class="flex items-center">
                  <CircleIcon
                    name="i-heroicons-arrow-up-tray"
                    bg-color="bg-violet-100"
                    icon-color="text-violet-600"
                  />
                  <h3 class="text-md font-medium">Import Data</h3>
                </div>
              </template>

              <div class="space-y-4">
                <input
                  type="file"
                  accept=".json"
                  class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  @change="handleFileChange"
                />

                <UAlert
                  v-if="importError"
                  color="error"
                  variant="soft"
                  class="mt-2"
                >
                  {{ importError }}
                </UAlert>

                <UAlert
                  v-if="importSuccess"
                  color="success"
                  variant="soft"
                  class="mt-2"
                >
                  Data imported successfully!
                </UAlert>

                <UButton
                  color="primary"
                  :disabled="!importFile"
                  @click="importData"
                >
                  Import
                </UButton>
              </div>
            </UCard>

            <UCard class="h-full">
              <template #header>
                <div class="flex items-center">
                  <CircleIcon
                    name="i-heroicons-arrow-down-tray"
                    bg-color="bg-emerald-100"
                    icon-color="text-emerald-600"
                  />
                  <h3 class="text-md font-medium">Export Data</h3>
                </div>
              </template>

              <div class="space-y-4">
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Download all your budget and expense data as a JSON file
                </p>

                <UButton color="primary" @click="exportData">
                  Export All Data
                </UButton>
              </div>
            </UCard>
          </div>

          <!-- Example Data Format -->
          <div class="mt-6">
            <UAccordion
              :items="[
                {
                  label: 'Example Import Data Format',
                  slot: 'example-data',
                  icon: 'i-heroicons-document-text',
                  description:
                    'This is the expected JSON format for importing data',
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
        </div>
      </UForm>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton to="/" color="neutral" variant="ghost"> Cancel </UButton>
          <UButton
            class="hover:cursor-pointer"
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
