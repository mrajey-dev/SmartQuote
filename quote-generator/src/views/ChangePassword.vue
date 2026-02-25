<template>
  <div class="screen">
    <div class="phone">

      <!-- TOP -->
      <div class="top">
        <h1>{{ $t('changePassword') }}</h1>
      </div>

      <!-- CARD -->
      <div class="card">

        <div class="form">

          <div class="input">
            <i class="icon">🔒</i>
            <input
              type="password"
              :placeholder="$t('currentPassword')"
              v-model="currentPassword"
            />
          </div>

          <div class="input">
            <i class="icon">🔑</i>
            <input
              type="password"
              :placeholder="$t('newPassword')"
              v-model="newPassword"
            />
          </div>

          <div class="input">
            <i class="icon">🔑</i>
            <input
              type="password"
              :placeholder="$t('confirmNewPassword')"
              v-model="confirmPassword"
            />
          </div>

          <button
            class="primary-btn"
            @click="changePassword"
            :disabled="loading"
          >
            {{ loading ? $t('updating') : $t('updatePassword') }}
          </button>

          <div v-if="message" class="success-msg">
            {{ message }}
          </div>

          <div v-if="error" class="error-msg">
            {{ error }}
          </div>

          <div class="back" @click="router.back()">
            ← {{ $t('back') }}
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import api from "@/services/api"

const router = useRouter()

const currentPassword = ref("")
const newPassword = ref("")
const confirmPassword = ref("")
const loading = ref(false)
const message = ref("")
const error = ref("")

const changePassword = async () => {

  message.value = ""
  error.value = ""

  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    error.value = "Please fill all fields"
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = "New passwords do not match"
    return
  }

  try {
    loading.value = true

    await api.post("/change-password", {
      current_password: currentPassword.value,
      new_password: newPassword.value,
      new_password_confirmation: confirmPassword.value
    })

    message.value = "Password updated successfully"

    // Clear fields
    currentPassword.value = ""
    newPassword.value = ""
    confirmPassword.value = ""

    // Optional: go back after 1.5s
    setTimeout(() => {
      router.push("/home")
    }, 1500)

  } catch (err) {
    error.value = err.response?.data?.message || "Failed to update password"
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.screen {
  height: 100vh;
  background: linear-gradient(135deg, #8FC3B5 60%, #7BB7A9 100%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.phone {
  width: 100%;
  height: 100%;
  background: #0F6F73;
}

.top {
  padding: 60px 30px 20px;
  color: white;
}

.card {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 80%;
  background: #F4F6F6;
  border-top-left-radius: 40px;
  border-top-right-radius: 40px;
  padding: 30px;
}

.input {
  background: #E8ECEC;
  border-radius: 15px;
  padding: 12px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.input input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  font-size: 14px;
}

.primary-btn {
  width: 100%;
  padding: 12px;
  background: #0F6F73;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  margin-top: 10px;
}

.success-msg {
  margin-top: 15px;
  color: green;
  font-size: 13px;
}

.error-msg {
  margin-top: 15px;
  color: red;
  font-size: 13px;
}

.back {
  margin-top: 20px;
  text-align: center;
  font-size: 13px;
  cursor: pointer;
  color: #0F6F73;
}
</style>