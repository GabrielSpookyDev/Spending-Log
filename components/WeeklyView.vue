<script setup lang="ts">
import { useFormatters } from "~/composables/useFormatters";

const { formatCurrency } = useFormatters();

interface SpendingDay {
  date: string;
  budget: number;
  spent: number;
  remaining: number;
}

defineProps<{
  currentWeek: SpendingDay[];
}>();
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-medium">Weekly Overview</h3>
      </div>
    </template>

    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b">
            <th class="text-left py-2 px-2">Day</th>
            <th class="text-left py-2 px-2">Budget</th>
            <th class="text-left py-2 px-2">Spent</th>
            <th class="text-left py-2 px-2">Remaining</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="day in currentWeek"
            :key="day.date"
            class="border-b last:border-none hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <td class="py-3 px-2">
              <div class="font-medium">
                {{
                  new Date(day.date).toLocaleDateString("en-US", {
                    weekday: "short",
                  })
                }}
              </div>
              <div class="text-xs text-gray-500">
                {{
                  new Date(day.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              </div>
            </td>
            <td class="py-3 px-2">{{ formatCurrency(day.budget) }}</td>
            <td class="py-3 px-2">{{ formatCurrency(day.spent) }}</td>
            <td
              class="py-3 px-2"
              :class="day.remaining >= 0 ? 'text-green-600' : 'text-red-600'"
            >
              {{ formatCurrency(day.remaining) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </UCard>
</template>
