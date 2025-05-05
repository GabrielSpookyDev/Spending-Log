export function useFormatters() {
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateStr: string): string => {
    // Ensure we're working with the correct date by handling timezone properly
    const parts = dateStr.split("-");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
    const day = parseInt(parts[2], 10);

    const date = new Date(year, month, day);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Format date as month and year only
  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  return {
    formatCurrency,
    formatDate,
    formatMonthYear,
  };
}
