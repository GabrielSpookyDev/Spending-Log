import { computed } from "vue";

export function usePageIcons() {
  const route = useRoute();

  // Map routes to their specific icons in case you want to change them

  const iconMap: Record<string, string> = {
    "/": "/icons/dashboard.ico",
    "/expenses": "/icons/expenses.ico",
    "/expenses/add": "/icons/add-expense.ico",
    "/settings": "/icons/settings.ico",
  };

  // Get the current route's icon or fallback to default
  const currentIcon = computed(() => {
    return iconMap[route.path] || "/favicon.ico";
  });

  return {
    currentIcon,
  };
}
