<script setup lang="ts">
import { useSpendingStore } from "~/stores/spending";
import { storeToRefs } from "pinia";
import CircleIcon from "~/components/CircleIcon.vue";
import BudgetSettingsForm from "~/components/settings/BudgetSettingsForm.vue";
import DataImportComponent from "~/components/settings/DataImportComponent.vue";
import DataExportComponent from "~/components/settings/DataExportComponent.vue";
import ExampleDataFormat from "~/components/settings/ExampleDataFormat.vue";
import type { Expense } from "~/types";
import { useI18n } from "vue-i18n";
import type { AccordionItem } from "@nuxt/ui";

type LocaleCode = "en" | "pt_br";

const { locale, locales, setLocale } = useI18n();
const spendingStore = useSpendingStore();
const { monthlyBudget, expenses } = storeToRefs(spendingStore);

const budgetAmount = ref(monthlyBudget.value.amount);
const selectedMonth = ref(monthlyBudget.value.month);
const selectedYear = ref(monthlyBudget.value.year);

const formState = reactive({
  valid: true,
  errors: {} as Record<string, string[]>,
});

const languageOptions = computed(() => {
  return locales.value.map((locale) => ({
    label: locale.name,
    value: locale.code,
  }));
});

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

function updateLocale(newLocale: LocaleCode) {
  setLocale(newLocale);
}

// Export data functionality
function handleExportData() {
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

// Import data functionality
function handleImportData(data: {
  monthlyBudget: {
    amount: number;
    month: string;
    year: number;
  };
  expenses: Expense[];
}) {
  try {
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
    spendingStore.setMonthlyBudget(data.monthlyBudget.amount);

    // Handle expenses
    if (data.expenses && Array.isArray(data.expenses)) {
      data.expenses.forEach((expense: Expense) => {
        if (spendingStore.addExpense) {
          const { amount, description, date, category } = expense;
          spendingStore.addExpense({ amount, description, date, category });
        }
      });
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

const accordionItems = ref<AccordionItem[]>([
  {
    label: "Budget Settings",
    icon: "i-heroicons-banknotes",
    slot: "budget",
  },
  {
    label: "Data Management",
    icon: "i-heroicons-circle-stack",
    slot: "data",
  },
  {
    label: "Language Settings",
    icon: "i-heroicons-language",
    slot: "language",
  },
]);
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
          <h2 class="ml-2 text-lg font-medium">Settings</h2>
        </div>
      </template>

      <UForm
        :state="formState"
        class="space-y-6 py-4"
        @submit.prevent="saveBudget"
      >
        <UAccordion
          :items="accordionItems"
          :default-value="['0']"
          type="multiple"
        >
          <template #budget>
            <BudgetSettingsForm
              v-model:budget-amount="budgetAmount"
              v-model:selected-month="selectedMonth"
              v-model:selected-year="selectedYear"
              :form-state="formState"
              class="py-4"
            />
          </template>

          <template #data>
            <div class="py-4 space-y-6">
              <div class="grid gap-6 md:grid-cols-2">
                <DataImportComponent @import-data="handleImportData" />
                <DataExportComponent @export-data="handleExportData" />
              </div>
              <ExampleDataFormat />
            </div>
          </template>

          <template #language>
            <div class="py-4">
              <div class="flex items-center gap-4">
                <span class="text-sm text-gray-600"
                  >Select your preferred language:</span
                >
                <USelect
                  v-model="locale"
                  :items="languageOptions"
                  class="w-48"
                  @update:model-value="updateLocale"
                />
              </div>
            </div>
          </template>
        </UAccordion>

        <div
          class="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700"
        >
          <UButton to="/" color="neutral" variant="ghost"> Cancel </UButton>
          <UButton
            class="hover:cursor-pointer"
            color="primary"
            :disabled="!hasChanges || !formState.valid"
            :loading="false"
            type="submit"
          >
            Save Settings
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>
