<script setup lang="ts">
import CircleIcon from "~/components/CircleIcon.vue";
import { ref } from "vue";

const emit = defineEmits(["import-data"]);
const toast = useToast();

const importFile = ref<File | null>(null);

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    importFile.value = input.files[0];
  }
}

function importData() {
  if (!importFile.value) {
    toast.add({
      title: "Error",
      description: "Please select a file to import",
      color: "error",
    });
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
      toast.add({
        title: "Success",
        description: "Data imported successfully!",
        color: "success",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to import data";
      toast.add({
        title: "Error",
        description: errorMessage,
        color: "error",
      });
    }
  };

  reader.onerror = () => {
    toast.add({
      title: "Error",
      description: "Error reading file",
      color: "error",
    });
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
      <UInput
        type="file"
        accept=".json"
        class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        @change="handleFileChange"
      />

      <UButton color="primary" :disabled="!importFile" @click="importData">
        Import
      </UButton>
    </div>
  </UCard>
</template>
