<template>
  <div class="loading-screen">

  </div>
</template>

<script setup>
import { onMounted } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get("token")

  if (token) {
    localStorage.setItem("token", token)
    router.replace("/company")
  } else {
    router.replace("/")
  }
})
</script>