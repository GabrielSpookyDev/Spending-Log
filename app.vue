<script setup lang="ts">
import { computed } from "vue";
import * as locales from "@nuxt/ui/locale";

const route = useRoute();
const { currentIcon } = usePageIcons();
const { $siteConfig } = useNuxtApp();

const { locale } = useI18n();

const lang = computed(() => locales[locale.value].code);
const dir = computed(() => locales[locale.value].dir);

useHead({
  htmlAttrs: {
    lang,
    dir,
  },
});

// Define the base site name from the plugin
const siteName = $siteConfig.siteName;

// Map routes to page titles
const pageTitles = {
  "/": "Dashboard",
  "/expenses": "Expenses",
  "/expenses/add": "Add Expense",
  "/settings": "Settings",
};

// Define a type for the keys of pageTitles
type PagePath = keyof typeof pageTitles;

// Compute current page title
const pageTitle = computed(() => {
  // Remove locale prefix from path for title lookup
  const pathWithoutLocale = route.path.replace(`/${locale.value}`, "");
  const currentPageTitle = pageTitles[pathWithoutLocale as PagePath] || "";
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
      <UApp :locale="locales[locale]">
        <NuxtPage />
      </UApp>
    </NuxtLayout>
  </div>
</template>
