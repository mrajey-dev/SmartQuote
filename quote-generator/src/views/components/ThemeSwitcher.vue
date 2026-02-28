<script setup>
import { useColorTheme } from '@/composables/useColorTheme'
const { setTheme } = useColorTheme()
</script>

<template>
  <div class="flex gap-3">
    <button @click="setTheme('red')" class="w-8 h-8 bg-red-600 rounded-full"></button>
    <button @click="setTheme('blue')" class="w-8 h-8 bg-blue-600 rounded-full"></button>
    <button @click="setTheme('black')" class="w-8 h-8 bg-black rounded-full"></button>
    <button @click="setTheme('pink')" class="w-8 h-8 bg-pink rounded-full"></button>
    <button @click="setTheme('green')" class="w-8 h-8 bg-green rounded-full"></button>

  </div>
</template>