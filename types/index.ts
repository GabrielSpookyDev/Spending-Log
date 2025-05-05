export interface SpendingDay {
  date: string;
  budget: number;
  spent: number;
  remaining: number;
}

export interface MonthlyBudget {
  amount: number;
  month: string;
  year: number;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  category: string;
}
