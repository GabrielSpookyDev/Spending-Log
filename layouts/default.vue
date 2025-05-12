<script setup>
import { computed } from "vue";

const route = useRoute();
const { $siteConfig } = useNuxtApp();
const { locale } = useI18n();

const navigationItems = computed(() => [
  {
    name: "Dashboard",
    to: `/${locale.value}`,
    icon: "i-heroicons-home",
    active: route.path === `/${locale.value}`,
  },
  {
    name: "Expenses",
    to: `/${locale.value}/expenses`,
    icon: "i-heroicons-receipt-percent",
    active: route.path === `/${locale.value}/expenses`,
  },
  {
    name: "Add Expense",
    to: `/${locale.value}/expenses/add`,
    icon: "i-heroicons-plus",
    active: route.path === `/${locale.value}/expenses/add`,
  },
  {
    name: "Settings",
    to: `/${locale.value}/settings`,
    icon: "i-heroicons-cog-6-tooth",
    active: route.path === `/${locale.value}/settings`,
  },
]);

const colorMode = useColorMode();

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Mobile header -->
    <header
      class="bg-primary text-white p-4 md:hidden sticky top-0 z-10 shadow-md"
    >
      <div class="container mx-auto flex justify-between items-center">
        <h1 class="text-xl font-bold">{{ $siteConfig.siteName }}</h1>
      </div>
    </header>

    <div
      class="container mx-auto px-4 flex flex-col md:flex-row md:min-h-screen"
    >
      <!-- Desktop Sidebar -->
      <aside
        class="hidden md:block bg-white dark:bg-gray-800 w-64 shrink-0 shadow-lg rounded-lg mt-6 h-min sticky top-6"
      >
        <div class="py-6 px-4">
          <div class="flex justify-between">
            <h1 class="text-2xl font-bold text-center text-primary">
              {{ $siteConfig.siteName }}
            </h1>
            <UButton
              :icon="
                colorMode.value === 'dark'
                  ? 'i-heroicons-sun-20-solid'
                  : 'i-heroicons-moon-20-solid'
              "
              color="gray"
              variant="ghost"
              aria-label="Theme"
              size="xl"
              @click="toggleColorMode"
            />
          </div>
          <nav class="space-y-2 mt-6">
            <UButton
              v-for="item in navigationItems"
              :key="item.name"
              :to="item.to"
              :icon="item.icon"
              :color="item.active ? 'primary' : 'gray'"
              :variant="item.active ? 'solid' : 'ghost'"
              block
              class="justify-start"
            >
              {{ item.name }}
            </UButton>
          </nav>
        </div>
      </aside>

      <!-- Main content -->
      <main class="flex-grow pb-20 md:pb-6 md:pl-6 pt-6">
        <slot />
      </main>
    </div>

    <!-- Mobile navigation -->
    <div
      class="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg z-10"
    >
      <div class="flex justify-around">
        <UButton
          v-for="item in navigationItems"
          :key="item.name"
          :to="item.to"
          :icon="item.icon"
          :color="item.active ? 'primary' : 'gray'"
          variant="ghost"
          class="py-4"
        >
          <span class="text-xs">{{ item.name }}</span>
        </UButton>
      </div>
    </div>
  </div>
</template>
