<template>
  <div class="loading">
    Logging you in...
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router"

const route = useRoute()
const router = useRouter()

const token = route.query.token

if (token) {
  localStorage.setItem("token", token)
  router.push("/home")
} else {
  router.push("/")
}
</script>