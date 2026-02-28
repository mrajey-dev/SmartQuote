<template>
  <router-view />
  
</template>

<script setup>
import { useColorTheme } from '@/composables/useColorTheme'
useColorTheme()
</script>

<style>
/* Optional: global body reset */
body {
  margin: 0;
}
h3 .fa-solid{
color: var(--primary);
}

</style>