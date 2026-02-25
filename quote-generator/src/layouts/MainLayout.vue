<template>
  <div class="screen">
    <div class="phone">

      <!-- TOP HEADER -->
      <div class="top">
        <div class="top-header">
          <div>
            <h1>Welcome!</h1>
            <p>Manage Your Business</p>
          </div>

          <div class="profile-wrapper" ref="dropdownRef">
            <div class="profile-icon" @click="toggleDropdown">
              👤
            </div>

            <div v-if="showDropdown" class="dropdown">
              <div class="dropdown-item" @click="goCompany">
                ✏ Edit Company
              </div>

              <div class="dropdown-item" @click="goChangePassword">
                🔒 Change Password
              </div>

              <div class="dropdown-item logout-item" @click="logout">
                🚪 Logout
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PAGE CONTENT -->
      <div class="card">
        <router-view />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue"
import { useRouter } from "vue-router"

const showDropdown = ref(false)
const dropdownRef = ref(null)
const router = useRouter()

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    showDropdown.value = false
  }
}

const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  router.push("/")
}

const goCompany = () => {
  showDropdown.value = false
  router.push("/company")
}

const goChangePassword = () => {
  showDropdown.value = false
  router.push("/change-password")
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside)
})
</script>