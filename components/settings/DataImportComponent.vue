<script setup lang="ts">
import CircleIcon from "~/components/CircleIcon.vue";
import { ref } from "vue";

const emit = defineEmits(["import-data"]);

const importFile = ref<File | null>(null);
const importError = ref<string | null>(null);
const importSuccess = ref(false);

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    importFile.value = input.files[0];
    importError.value = null;
    importSuccess.value = false;
  }
}

function importData() {
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
      emit("import-data", data);
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
</script>

<template>
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

      <UAlert v-if="importError" color="error" variant="soft" class="mt-2">
        {{ importError }}
      </UAlert>

      <UAlert v-if="importSuccess" color="success" variant="soft" class="mt-2">
        Data imported successfully!
      </UAlert>

      <UButton color="primary" :disabled="!importFile" @click="importData">
        Import
      </UButton>
    </div>
  </UCard>
</template>
