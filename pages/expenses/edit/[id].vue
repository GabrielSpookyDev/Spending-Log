<script setup lang="ts">
import { useSpendingStore } from "~/stores/spending";
import { useFormatters } from "~/composables/useFormatters";
import CircleIcon from "~/components/CircleIcon.vue";
import type { Expense } from "~/types";

const route = useRoute();
const expenseId = route.params.id as string;
const spendingStore = useSpendingStore();
const toast = useToast();
const { formatCurrency, formatDate } = useFormatters();

// Find the existing expense by ID
const existingExpense = spendingStore.expenses.find(
  (exp) => exp.id === expenseId
);

// If expense not found, redirect to home
if (!existingExpense) {
  toast.add({
    title: "Expense Not Found",
    description: "The expense you're trying to edit could not be found.",
    color: "error",
  });
  navigateTo("/");
}

// Create reactive expense object for the form
const editedExpense = reactive<Omit<Expense, "id">>({
  amount: existingExpense?.amount ?? 0,
  description: existingExpense?.description ?? "",
  date: existingExpense?.date ?? new Date().toISOString().split("T")[0],
  category: existingExpense?.category ?? "general",
});

const formState = reactive({
  valid: true,
  errors: {} as Record<string, string[]>,
});

const categories = spendingStore.categories;

const selectedCategoryIcon = computed(() => {
  const category = categories.find((c) => c.value === editedExpense.category);
  return category ? category.icon : "i-heroicons-cube";
});

const isValid = computed(() => {
  return editedExpense.amount > 0 && editedExpense.description.trim() !== "";
});

function validateForm() {
  formState.errors = {};

  if (!editedExpense.amount || editedExpense.amount <= 0) {
    formState.errors.amount = ["Amount must be greater than 0"];
  }

  if (!editedExpense.description.trim()) {
    formState.errors.description = ["Description is required"];
  }

  formState.valid = Object.keys(formState.errors).length === 0;
  return formState.valid;
}

function updateExpense() {
  if (!validateForm()) return;

  spendingStore.updateExpense(expenseId, editedExpense);

  toast.add({
    title: "Expense Updated",
    description: "Your expense has been successfully updated.",
    color: "success",
  });
  navigateTo("/");
}
</script>

<template>
  <div>
    <UCard>
      <template #header>
        <div class="flex items-center">
          <CircleIcon
            name="i-heroicons-pencil-square"
            bg-color="bg-blue-100"
            icon-color="text-blue-600"
          />
          <h2 class="text-lg font-medium">Edit Expense</h2>
        </div>
      </template>

      <UForm
        :state="formState"
        class="space-y-6 py-4"
        @submit.prevent="updateExpense"
      >
        <!-- Amount input -->
        <UFormField label="Amount" required>
          <UInput
            v-model="editedExpense.amount"
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
            v-model="editedExpense.description"
            placeholder="What did you spend on?"
          />
        </UFormField>

        <!-- Date input -->
        <UFormField label="Date">
          <UInput v-model="editedExpense.date" type="date" />
        </UFormField>

        <!-- Category input -->
        <UFormField label="Category">
          <USelect
            v-model="editedExpense.category"
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
                  {{ editedExpense.description || "No description" }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ formatDate(editedExpense.date) }}
                  <span v-if="editedExpense.category">
                    •
                    {{
                      categories.find((c) => c.value === editedExpense.category)
                        ?.label
                    }}
                  </span>
                </div>
              </div>
              <div class="ml-auto font-medium text-red-600 text-lg">
                -{{ formatCurrency(editedExpense.amount) }}
              </div>
            </div>
          </div>
        </div>
      </UForm>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton to="/" color="neutral" variant="ghost"> Cancel </UButton>
          <UButton
            class="cursor-pointer"
            color="primary"
            type="submit"
            :disabled="!isValid"
            @click="updateExpense"
          >
            Update Expense
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>
