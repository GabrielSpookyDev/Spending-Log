import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import type { MonthlyBudget, Expense, SpendingDay } from "~/types";

// Define months as a constant at the top level of the store
export const months = [
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

// Define state interface
interface SpendingState {
  monthlyBudget: MonthlyBudget;
  expenses: Expense[];
}

// Create default state
const createDefaultState = (): SpendingState => ({
  monthlyBudget: {
    amount: 0,
    month: new Date().toLocaleString("default", { month: "long" }),
    year: new Date().getFullYear(),
  },
  expenses: [],
});

export const useSpendingStore = defineStore("spending", () => {
  // Single state object for all data
  const state = ref<SpendingState>(createDefaultState());

  // Calculate days in current month
  const daysInMonth = computed(() => {
    const date = new Date(
      state.value.monthlyBudget.year,
      getMonthIndex(state.value.monthlyBudget.month) + 1,
      0
    );
    return date.getDate();
  });

  // Helper function to get month index from name
  function getMonthIndex(monthName: string): number {
    return months.findIndex(
      (month) => month.toLowerCase() === monthName.toLowerCase()
    );
  }

  // Get daily budget - recalculated based on past spending
  const dailyBudget = computed(() => {
    if (!state.value.monthlyBudget.amount) return 0;

    const today = new Date();
    const remainingDays = getDaysLeftInMonth(today);
    const spentSoFar = getTotalSpentThisMonth();
    const remainingBudget = state.value.monthlyBudget.amount - spentSoFar;

    return remainingDays ? remainingBudget / remainingDays : 0;
  });

  // Get spending days with calculated budgets
  const spendingDays = computed(() => {
    const result: SpendingDay[] = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDate = today.getDate();

    // Calculate total spent so far
    let totalSpentSoFar = 0;

    // Generate spending days for the current month
    for (let day = 1; day <= daysInMonth.value; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateString = date.toISOString().split("T")[0];

      // Calculate spent for this day
      const spentToday = state.value.expenses
        .filter((expense) => expense.date === dateString)
        .reduce((sum, expense) => sum + expense.amount, 0);

      // Add to running total
      totalSpentSoFar += spentToday;

      // Calculate remaining budget after this day
      const remainingBudget =
        state.value.monthlyBudget.amount - totalSpentSoFar;
      const daysRemaining = daysInMonth.value - day;

      // Calculate daily budget for remaining days
      const dailyBudgetForDay = daysRemaining
        ? remainingBudget / daysRemaining
        : 0;

      // For past days, the budget was the actual daily budget for that day
      // For current and future days, use the calculated daily budget
      let budgetForDay = 0;

      if (day < currentDate) {
        // Past day - use what was spent that day as the "budget"
        budgetForDay = spentToday;
      } else if (day === currentDate) {
        // Current day - use daily budget
        budgetForDay = dailyBudget.value;
      } else {
        // Future day - use projected daily budget
        budgetForDay = dailyBudgetForDay;
      }

      result.push({
        date: dateString,
        budget: budgetForDay,
        spent: spentToday,
        remaining: budgetForDay - spentToday,
      });
    }

    return result;
  });

  // Helper to get total spent this month
  function getTotalSpentThisMonth(): number {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    // Get first and last day of current month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const firstDayStr = firstDay.toISOString().split("T")[0];
    const lastDayStr = lastDay.toISOString().split("T")[0];

    return state.value.expenses
      .filter((expense) => {
        return expense.date >= firstDayStr && expense.date <= lastDayStr;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  }

  // Helper to calculate days left in month
  function getDaysLeftInMonth(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    return lastDay - date.getDate() + 1; // Include current day
  }

  // Categories
  const categories = [
    { label: "General", value: "general", icon: "i-heroicons-cube" },
    { label: "Food & Dining", value: "food", icon: "i-heroicons-cake" },
    {
      label: "Transportation",
      value: "transportation",
      icon: "i-heroicons-truck",
    },
    {
      label: "Entertainment",
      value: "entertainment",
      icon: "i-heroicons-film",
    },
    { label: "Utilities", value: "utilities", icon: "i-heroicons-bolt" },
    { label: "Shopping", value: "shopping", icon: "i-heroicons-shopping-bag" },
    { label: "Health", value: "health", icon: "i-heroicons-heart" },
    { label: "Housing", value: "housing", icon: "i-heroicons-home" },
    { label: "Travel", value: "travel", icon: "i-heroicons-globe-alt" },
    {
      label: "Education",
      value: "education",
      icon: "i-heroicons-academic-cap",
    },
    {
      label: "Other",
      value: "other",
      icon: "i-heroicons-ellipsis-horizontal-circle",
    },
  ];

  // Actions
  function setMonthlyBudget(amount: number) {
    state.value.monthlyBudget.amount = amount;
  }

  function addExpense(expense: Omit<Expense, "id">) {
    const id = Date.now().toString();
    state.value.expenses.push({ ...expense, id });
  }

  function removeExpense(id: string) {
    state.value.expenses = state.value.expenses.filter(
      (expense) => expense.id !== id
    );
  }

  function updateExpense(id: string, updatedExpense: Omit<Expense, "id">) {
    const index = state.value.expenses.findIndex(
      (expense) => expense.id === id
    );
    if (index !== -1) {
      state.value.expenses[index] = { ...updatedExpense, id };
    }
  }

  // Load state from localStorage
  function loadState() {
    if (!import.meta.client) return;

    try {
      const savedState = localStorage.getItem("spendingState");
      if (savedState) {
        state.value = JSON.parse(savedState);
      }
    } catch (error) {
      console.error("Failed to load state from localStorage:", error);
      // Reset to default state if loading fails
      state.value = createDefaultState();
    }
  }

  // Save state to localStorage
  function saveState() {
    if (!import.meta.client) return;

    try {
      localStorage.setItem("spendingState", JSON.stringify(state.value));
    } catch (error) {
      console.error("Failed to save state to localStorage:", error);
    }
  }

  // Initialize state
  loadState();

  // Watch for changes and persist to localStorage
  watch(
    () => state.value,
    () => {
      saveState();
    },
    { deep: true }
  );

  return {
    monthlyBudget: computed(() => state.value.monthlyBudget),
    expenses: computed(() => state.value.expenses),
    dailyBudget,
    spendingDays,
    daysInMonth,
    categories,
    months,
    setMonthlyBudget,
    addExpense,
    removeExpense,
    updateExpense,
    getTotalSpentThisMonth,
  };
});
