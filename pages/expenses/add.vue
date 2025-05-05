<script setup lang="ts">
import { useSpendingStore } from "~/stores/spending";
import { useFormatters } from "~/composables/useFormatters";
import CircleIcon from "~/components/CircleIcon.vue";

const spendingStore = useSpendingStore();
const { formatCurrency } = useFormatters();

const newExpense = reactive({
  amount: 0,
  description: "",
  date: new Date().toISOString().split("T")[0],
  category: "general",
});

const formState = reactive({
  valid: false,
  errors: {} as Record<string, string[]>,
});

const categories = [
  { label: "General", value: "general", icon: "i-heroicons-cube" },
  { label: "Food & Dining", value: "food", icon: "i-heroicons-cake" },
  {
    label: "Transportation",
    value: "transportation",
    icon: "i-heroicons-truck",
  },
  { label: "Entertainment", value: "entertainment", icon: "i-heroicons-film" },
  { label: "Utilities", value: "utilities", icon: "i-heroicons-bolt" },
  { label: "Shopping", value: "shopping", icon: "i-heroicons-shopping-bag" },
  { label: "Health", value: "health", icon: "i-heroicons-heart" },
  { label: "Housing", value: "housing", icon: "i-heroicons-home" },
  { label: "Travel", value: "travel", icon: "i-heroicons-globe-alt" },
  { label: "Education", value: "education", icon: "i-heroicons-academic-cap" },
  {
    label: "Other",
    value: "other",
    icon: "i-heroicons-ellipsis-horizontal-circle",
  },
];

const selectedCategoryIcon = computed(() => {
  const category = categories.find((c) => c.value === newExpense.category);
  return category ? category.icon : "i-heroicons-cube";
});

const isValid = computed(() => {
  return newExpense.amount > 0 && newExpense.description.trim() !== "";
});

function validateForm() {
  formState.errors = {};

  if (!newExpense.amount || newExpense.amount <= 0) {
    formState.errors.amount = ["Amount must be greater than 0"];
  }

  if (!newExpense.description.trim()) {
    formState.errors.description = ["Description is required"];
  }

  formState.valid = Object.keys(formState.errors).length === 0;
  return formState.valid;
}

function saveExpense() {
  if (!validateForm()) return;

  spendingStore.addExpense(newExpense);
  navigateTo("/");
}
</script>

<template>
  <div>
    <UCard>
      <template #header>
        <div class="flex items-center">
          <CircleIcon
            name="i-heroicons-plus"
            bg-color="bg-blue-100"
            icon-color="text-blue-600"
          />
          <h2 class="text-lg font-medium">Add Expense</h2>
        </div>
      </template>

      <UForm
        :state="formState"
        class="space-y-6 py-4"
        @submit.prevent="saveExpense"
      >
        <!-- Amount input -->
        <UFormField label="Amount" required>
          <UInput
            v-model="newExpense.amount"
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            class="pl-1"
          />
        </UFormField>

        <!-- Description input -->
        <UFormField label="Description" required>
          <UInput
            v-model="newExpense.description"
            placeholder="What did you spend on?"
          />
        </UFormField>

        <!-- Date input -->
        <UFormField label="Date">
          <UInput v-model="newExpense.date" type="date" />
        </UFormField>

        <!-- Category input -->
        <UFormField label="Category">
          <USelect
            v-model="newExpense.category"
            :items="categories"
            :icon="selectedCategoryIcon"
          />
        </UFormField>

        <!-- Preview card -->
        <div class="mt-6">
          <h3 class="text-md font-medium mb-4">Expense Preview</h3>
          <div
            class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <div class="flex items-center mb-3">
              <CircleIcon
                :name="selectedCategoryIcon"
                bg-color="bg-gray-200 dark:bg-gray-700"
                icon-color="text-gray-700 dark:text-gray-200"
              />
              <div>
                <div class="font-medium">
                  {{ newExpense.description || "No description" }}
                </div>
                <div class="text-sm text-gray-500">
                  {{
                    new Date(newExpense.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  <span v-if="newExpense.category">
                    •
                    {{
                      categories.find((c) => c.value === newExpense.category)
                        ?.label
                    }}
                  </span>
                </div>
              </div>
              <div class="ml-auto font-medium text-red-600 text-lg">
                -{{ formatCurrency(newExpense.amount) }}
              </div>
            </div>
          </div>
        </div>
      </UForm>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton to="/" color="neutral" variant="ghost"> Cancel </UButton>
          <UButton
            color="primary"
            type="submit"
            :disabled="!isValid"
            @click="saveExpense"
          >
            Save Expense
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>
