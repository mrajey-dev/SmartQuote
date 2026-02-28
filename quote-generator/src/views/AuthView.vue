<template>
  <div class="screen">
    <div class="phone">

      <!-- TOP SECTION -->
      <div class="top">
        <h1 v-if="isLogin">Hello!</h1>
        <h1 v-else>Register</h1>
        <!-- <p>Your Business!</p>
        <p v-if="isLogin">Welcome!</p> -->
      </div>

      <!-- CARD -->
      <div class="card">

        <!-- LOGIN -->
        <div v-if="isLogin" class="form">
          <h2>Login</h2>

       <div class="input">
  <i class="icon">✉</i>
  <input 
    type="email" 
    placeholder="Email" 
    v-model="email"
    @blur="validateEmail"
  />
</div>
<p class="error" v-if="errors.email">{{ errors.email }}</p>

         <div class="input">
  <i class="icon">🔒</i>
  <input 
    type="password" 
    placeholder="Password" 
    v-model="password"
    @blur="validatePassword"
  />
</div>
<p class="error" v-if="errors.password">{{ errors.password }}</p>
          <div class="forgot">Forgot Password</div>

          <button class="primary-btn" @click="login">
            Login
          </button>

          <!-- <div class="divider">Or login with</div> -->

          <!-- <div class="socials">
            <div class="social fb">f</div>
            <div class="social google">G</div>
          </div> -->

          <div class="bottom-text">
            Don’t have account?
            <span @click="toggle">Sign Up</span>
          </div>
        </div>

        <!-- SIGN UP -->
        <div v-else class="form">
          <div class="back" @click="toggle">← Back to login</div>
          <h2>Sign Up</h2>

<div class="input">
  <i class="icon">✉</i>
  <input 
    type="email" 
    placeholder="Email" 
    v-model="email"
    @blur="validateEmail"
  />
</div>
<p class="error" v-if="errors.email">{{ errors.email }}</p>

<div class="input">
  <i class="icon">🔒</i>
  <input 
    type="password" 
    placeholder="Password" 
    v-model="password"
    @blur="validatePassword"
  />
</div>
<p class="error" v-if="errors.password">{{ errors.password }}</p>

<div class="input">
  <i class="icon">🔒</i>
  <input 
    type="password" 
    placeholder="Confirm Password" 
    v-model="confirmPassword"
    @blur="validateConfirmPassword"
  />
</div>
<p class="error" v-if="errors.confirmPassword">
  {{ errors.confirmPassword }}
</p>

<div class="input">
  <i class="icon">📱</i>
  <input 
    type="text"
    inputmode="numeric"
    pattern="[0-9]*"
    maxlength="10"
    placeholder="Phone"
    v-model="phone"
    @input="handlePhoneInput"
    @blur="validatePhone"
  />
</div>
<p class="error" v-if="errors.phone">{{ errors.phone }}</p>

      <button 
  class="primary-btn" 
  @click="register"
  :disabled="loading"
>
  {{ loading ? "Processing..." : "Sign Up" }}
</button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import axios from "axios"

const router = useRouter()
const errors = ref({
  email: "",
  password: "",
  confirmPassword: "",
  phone: ""
})
const API = "https://products.archenterprises.co.in/api"
const handlePhoneInput = (e) => {
  // Allow only digits and limit to 10 numbers
  phone.value = e.target.value.replace(/\D/g, "").slice(0, 10)
}
const isLogin = ref(true)
const email = ref("")
const password = ref("")
const confirmPassword = ref("")
const phone = ref("")
const loading = ref(false)

const toggle = () => {
  isLogin.value = !isLogin.value
}
const validateEmail = () => {
  if (!email.value) {
    errors.value.email = "Email is required"
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = "Invalid email format"
  } else {
    errors.value.email = ""
  }
}

const validatePassword = () => {
  if (!password.value) {
    errors.value.password = "Password is required"
  } else if (password.value.length < 6) {
    errors.value.password = "Password must be at least 6 characters"
  } else {
    errors.value.password = ""
  }
}

const validateConfirmPassword = () => {
  if (!confirmPassword.value) {
    errors.value.confirmPassword = "Confirm your password"
  } else if (confirmPassword.value !== password.value) {
    errors.value.confirmPassword = "Passwords do not match"
  } else {
    errors.value.confirmPassword = ""
  }
}

const validatePhone = () => {
  if (!phone.value) {
    errors.value.phone = "Phone number is required"
  } else if (!/^[0-9]{10}$/.test(phone.value)) {
    errors.value.phone = "Phone must be 10 digits"
  } else {
    errors.value.phone = ""
  }
}
const login = async () => {
  validateEmail()
  validatePassword()

  if (errors.value.email || errors.value.password) return

  try {
    loading.value = true

    const res = await axios.post(API + "/login", {
      email: email.value,
      password: password.value
    })

    localStorage.setItem("token", res.data.token)
    localStorage.setItem("user", JSON.stringify(res.data.user))

    router.push("/home")

  } catch (err) {
    alert(err.response?.data?.message || "Login failed")
  } finally {
    loading.value = false
  }
}

const register = async () => {
  validateEmail()
  validatePassword()
  validateConfirmPassword()
  validatePhone()

  if (
    errors.value.email ||
    errors.value.password ||
    errors.value.confirmPassword ||
    errors.value.phone
  ) return

  try {
    loading.value = true

    const res = await axios.post(API + "/register", {
      email: email.value,
      password: password.value,
      phone: phone.value
    })

    localStorage.setItem("token", res.data.token)
    localStorage.setItem("user", JSON.stringify(res.data.user))

    router.push("/company")

  } catch (err) {
    alert(err.response?.data?.message || "Registration failed")
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');

* {
  font-family: 'Poppins', sans-serif;
}

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
  background: var(--primary);
  border-radius: 0px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}

/* TOP */
.top {
  padding: 60px 30px 20px;
  color: white;
}

.top h1 {
  font-size: 34px;
  font-weight: 600;
  margin-top: -28px;
}

.top p {
  font-size: 14px;
  opacity: 0.9;
}

/* CARD */
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

.form h2 {
  color: var(--primary);
  margin-bottom: 20px;
}

/* INPUT */
.input {
  background: #E8ECEC;
  border-radius: 25px;
  padding: 12px 15px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.input input {
  border: none;
  background: transparent;
  outline: none;
  margin-left: 10px;
  width: 100%;
}

.icon {
  opacity: 0.5;
}

.forgot {
  text-align: right;
  font-size: 12px;
  color: var(--primary);
  margin-bottom: 15px;
  cursor: pointer;
}

.primary-btn {
  width: 100%;
  padding: 12px;
  border-radius: 25px;
  border: none;
  background: var(--primary);
  color: white;
  font-weight: 500;
  margin-bottom: 20px;
  cursor: pointer;
  transition: 0.3s;
}

.primary-btn:hover {
  background: #095a5e;
}

.divider {
  text-align: center;
  font-size: 12px;
  color: #7A8A8A;
  margin-bottom: 15px;
}

.socials {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.social {
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  font-weight: 600;
}

.bottom-text {
  text-align: center;
  font-size: 13px;
}

.bottom-text span {
  color: var(--primary);
  font-weight: 600;
  cursor: pointer;
}

.back {
  font-size: 13px;
  margin-bottom: 10px;
  color: var(--primary);
  cursor: pointer;
}

.fb {
  color: blue;
}

.google {
  color: red;
}
.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.error {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
  margin-left: 5px;
}input:invalid,
input.error-border {
  border: 1px solid #ff4d4f;
}
</style>