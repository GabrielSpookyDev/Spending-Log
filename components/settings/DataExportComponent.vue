<script setup lang="ts">
import CircleIcon from "~/components/CircleIcon.vue";

const emit = defineEmits(["export-data"]);
const toast = useToast();

function exportData() {
  emit("export-data");

  toast.add({
    title: "Success",
    description: "Data exported successfully!",
    color: "success",
  });
}
</script>

<template>
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

      <UButton color="primary" @click="exportData"> Export All Data </UButton>
    </div>
  </UCard>
</template>
