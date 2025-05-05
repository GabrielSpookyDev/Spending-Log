<script setup lang="ts">
defineProps<{
  name: string;
  bgColor?: string;
  iconColor?: string;
}>();
</script>

<template>
  <div
    :class="`p-2 rounded-full ${
      bgColor || 'bg-blue-100'
    } mr-3 flex items-center justify-center w-10 h-10`"
  >
    <Icon :name="name" :class="`${iconColor || 'text-blue-600'} w-5 h-5`" />
  </div>
</template>
