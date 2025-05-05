<script setup lang="ts">
import { useSpendingStore } from "~/stores/spending";
import { storeToRefs } from "pinia";
import MonthlyBudgetCard from "~/components/dashboard/MonthlyBudgetCard.vue";
import DailyBudgetCard from "~/components/dashboard/DailyBudgetCard.vue";
import RemainingBudgetCard from "~/components/dashboard/RemainingBudgetCard.vue";
import CategoryChart from "~/components/dashboard/CategoryChart.vue";
import WeeklyView from "~/components/dashboard/WeeklyView.vue";
import RecentTransactions from "~/components/dashboard/RecentTransactions.vue";
import SpendingOverview from "~/components/dashboard/SpendingOverview.vue";

const spendingStore = useSpendingStore();
const { monthlyBudget, dailyBudget, spendingDays } = storeToRefs(spendingStore);

// Calculate total spent and remaining
const totalSpent = computed(() => spendingStore.getTotalSpentThisMonth());
const totalRemaining = computed(
  () => monthlyBudget.value.amount - totalSpent.value
);

// Calculate percentage spent and color
const percentageSpent = computed(() => {
  if (
    !monthlyBudget.value ||
    !monthlyBudget.value.amount ||
    totalSpent.value === undefined
  )
    return 0;
  if (monthlyBudget.value.amount === 0) return 0;
  return Math.min(
    Math.round((totalSpent.value / monthlyBudget.value.amount) * 100),
    100
  );
});

const progressColor = computed(() => {
  if (percentageSpent.value > 80) return "error";
  if (percentageSpent.value > 60) return "warning";
  return "success";
});

// Generate today's data
const today = new Date();
const todayString = today.toISOString().split("T")[0];
const todayData = computed(() => {
  return (
    spendingDays.value.find((day) => day.date === todayString) || {
      date: todayString,
      budget: 0,
      spent: 0,
      remaining: 0,
    }
  );
});

// Filter days to only show current week
const currentWeek = computed(() => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0); // Start of Sunday

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999); // End of Saturday

  return spendingDays.value.filter((day) => {
    const date = new Date(day.date);
    return date >= startOfWeek && date <= endOfWeek;
  });
});
</script>

<template>
  <div>
    <!-- Top cards row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <MonthlyBudgetCard
        :monthly-budget="monthlyBudget"
        :total-spent="totalSpent"
        :percentage-spent="percentageSpent"
        :progress-color="progressColor"
      />
      <DailyBudgetCard :daily-budget="dailyBudget" :today-data="todayData" />
      <RemainingBudgetCard :total-remaining="totalRemaining" />
    </div>

    <!-- Category chart and weekly view -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <CategoryChart />
      <WeeklyView :current-week="currentWeek" />
    </div>

    <!-- Recent transactions -->
    <RecentTransactions />

    <!-- Spending Overview -->
    <SpendingOverview />
  </div>
</template>
