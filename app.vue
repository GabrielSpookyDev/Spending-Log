<script setup>
import { computed } from "vue";

const route = useRoute();
const { currentIcon } = usePageIcons();
const { $siteConfig } = useNuxtApp();

// Define the base site name from the plugin
const siteName = $siteConfig.siteName;

// Map routes to page titles
const pageTitles = {
  "/": "Dashboard",
  "/expenses": "Expenses",
  "/expenses/add": "Add Expense",
  "/settings": "Settings",
};

// Compute current page title
const pageTitle = computed(() => {
  const currentPageTitle = pageTitles[route.path] || "";
  return currentPageTitle ? `${currentPageTitle} | ${siteName}` : siteName;
});

// Set page title and favicon
useHead({
  title: pageTitle,
  meta: [{ name: "description", content: $siteConfig.description }],
  link: [{ rel: "icon", type: "image/x-icon", href: currentIcon }],
});
</script>

<template>
  <div>
    <NuxtLayout>
      <UApp>
        <NuxtPage />
      </UApp>
    </NuxtLayout>
  </div>
</template>
