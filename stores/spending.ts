import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import type { MonthlyBudget, Expense, SpendingDay } from "~/types";

export const useSpendingStore = defineStore("spending", () => {
  const monthlyBudget = ref<MonthlyBudget>({
    amount: 0,
    month: new Date().toLocaleString("default", { month: "long" }),
    year: new Date().getFullYear(),
  });

  const expenses = ref<Expense[]>([]);

  // Calculate days in current month
  const daysInMonth = computed(() => {
    const date = new Date(
      monthlyBudget.value.year,
      getMonthIndex(monthlyBudget.value.month) + 1,
      0
    );
    return date.getDate();
  });

  // Helper function to get month index from name
  function getMonthIndex(monthName: string): number {
    const months = [
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
    return months.findIndex(
      (month) => month.toLowerCase() === monthName.toLowerCase()
    );
  }

  // Get daily budget - recalculated based on past spending
  const dailyBudget = computed(() => {
    if (!monthlyBudget.value.amount) return 0;

    const today = new Date();
    const remainingDays = getDaysLeftInMonth(today);
    const spentSoFar = getTotalSpentThisMonth();
    const remainingBudget = monthlyBudget.value.amount - spentSoFar;

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
      const spentToday = expenses.value
        .filter((expense) => expense.date === dateString)
        .reduce((sum, expense) => sum + expense.amount, 0);

      // Add to running total
      totalSpentSoFar += spentToday;

      // Calculate remaining budget after this day
      const remainingBudget = monthlyBudget.value.amount - totalSpentSoFar;
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

    return expenses.value
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

  // Actions
  function setMonthlyBudget(amount: number) {
    monthlyBudget.value.amount = amount;
  }

  function addExpense(expense: Omit<Expense, "id">) {
    const id = Date.now().toString();
    expenses.value.push({ ...expense, id });
  }

  function removeExpense(id: string) {
    expenses.value = expenses.value.filter((expense) => expense.id !== id);
  }

  // Persist state to local storage
  if (import.meta.client) {
    const savedBudget = localStorage.getItem("monthlyBudget");
    const savedExpenses = localStorage.getItem("expenses");

    if (savedBudget) {
      monthlyBudget.value = JSON.parse(savedBudget);
    }

    if (savedExpenses) {
      expenses.value = JSON.parse(savedExpenses);
    }

    watch(
      [monthlyBudget, expenses],
      () => {
        localStorage.setItem(
          "monthlyBudget",
          JSON.stringify(monthlyBudget.value)
        );
        localStorage.setItem("expenses", JSON.stringify(expenses.value));
      },
      { deep: true }
    );
  }

  return {
    monthlyBudget,
    expenses,
    dailyBudget,
    spendingDays,
    daysInMonth,
    setMonthlyBudget,
    addExpense,
    removeExpense,
    getTotalSpentThisMonth,
  };
});
