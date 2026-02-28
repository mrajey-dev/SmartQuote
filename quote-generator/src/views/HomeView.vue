<template>
  
  <div class="screen">
    <div class="phone">

<div class="top">
  <div class="top-header">
    <div>
    <h1>
  <!-- {{ $t('welcome') }} -->
  <span v-if="company?.company_name" class="company-name">
    {{ company.company_name }}
  </span>
</h1>

<p>{{ $t('manageBusiness') }}</p>
    </div>

  <div class="profile-wrapper" ref="dropdownRef">
  <div class="profile-box" @click="toggleDropdown">
   <div class="avatar">
  <img 
    v-if="company?.logo"
    :src="`https://products.archenterprises.co.in/storage/${company.logo}`"
    alt="Company Logo"
  />
  <span v-else>👤</span>

</div>
  </div>

  <transition name="fade-slide">
    <div v-if="showDropdown" class="dropdown">
      <div class="user-info">
        <strong>{{ $t('hello') }} 👋</strong>
        <small>{{ user?.email }}</small>
      </div>

      <div class="divider"></div>

      <select v-model="selectedLanguage" @change="changeLanguage">
        <option value="en">English</option>
        <option value="hi">हिंदी</option>
        <option value="mr">मराठी</option>
        <option value="fr">Français</option>
        <option value="ja">日本語</option>
      </select>
<div class="theme-section">
  <p class="theme-title">🎨 Theme Color</p>

  <div class="theme-options">
  
    <div class="theme-option green" @click="setTheme('green')"></div>
    <div class="theme-option pink" @click="setTheme('pink')"></div>
    <div class="theme-option red" @click="setTheme('red')"></div>

    <div class="theme-option blue" @click="setTheme('blue')"></div>
    <div class="theme-option black" @click="setTheme('black')"></div>
  </div>
</div>
      <div class="dropdown-item" @click="goCompany">
       ✎ {{ $t('editCompany') }}
      </div>

      <div class="dropdown-item" @click="goChangePassword">
       🗝 {{ $t('changePassword') }}
      </div>

      <div class="dropdown-item logout-item" @click="logout">
      ⏻  {{ $t('logout') }}
      </div>
    </div>
  </transition>
</div>
  
</div>
</div>
      <!-- CARD -->
      <div class="card">
<h3>{{ $t('discover') }}</h3>

<!-- SMARTQUOTE BANNER -->
<div class="smartquote-banner">
  <div class="smartquote-left">
    <h4>🚀 SmartQuote Free Plan</h4>
    <p>
      {{ remainingFree }} of {{ freeLimit }} free quotations remaining
    </p>

    <div class="progress-bar">
      <div 
        class="progress-fill"
        :style="{ width: ((usedFree / freeLimit) * 100) + '%' }"
      ></div>
    </div>
  </div>

  <div class="upgrade-btn" v-if="remainingFree === 0">
    Upgrade
  </div>
</div>

        <div class="menu-grid">

          <!-- <div class="menu-item" @click="openSection('company')">
            🏢
            <p>Company Details</p>
          </div> -->

          <div class="menu-item" @click="openSection('customers')">
          <i class="fa-solid fa-user" style="color: var(--primary);"></i>
            <p>{{ $t('addCustomers') }}</p>
          </div>

        <div 
  class="menu-item"
  :class="{ disabled: remainingFree === 0 }"
  @click="handleGenerateClick"
>
  <i class='fas fa-file-alt' style="color: var(--primary);"></i>
  <p>
    {{ $t('makeQuotation') }}
    <span v-if="remainingFree === 0" class="limit-text">
      (Limit Reached)
    </span>
  </p>
</div>
          <!-- <div class="menu-item" @click="openSection('invoice')">
            📄
            <p>Create Invoice</p>
          </div> -->

          <div class="menu-item" @click="openSection('quotations')">
            <i class="fa fa-list-alt" style="color: var(--primary);"></i>
          <p>{{ $t('quotationList') }}</p>
          </div>

          <div class="menu-item" @click="openSection('stock')">
          <i class='fas fa-folder-open'  style="color: var(--primary);"></i>
          <p>{{ $t('productStock') }}</p>
          </div>

        </div>

<transition name="fade-slide">
  <div v-if="showQR" class="qr-overlay" @click.self="showQR = false">
    <div class="qr-modal">
      
      <h3>{{ $t("shopQrTitle") }}</h3>
      <p>{{ $t("shopQrSubtitle") }}</p>

      <div class="qr-box">
        <img 
    v-if="company?.logo"
    :src="`https://products.archenterprises.co.in/storage/${company.qr_code}`"
    alt="Company Logo"
  />
      </div>

      <div class="qr-actions">
        <!-- <button @click="downloadQR">Download</button> -->
        <button class="close-btn" @click="showQR = false">{{ $t("close") }}</button>
      </div>

    </div>
  </div>
</transition>

<br><br>
        <!-- GRAND TOTAL CARD -->
<!-- SLIDER CARD -->
<div class="slider-wrapper">
  <div 
    class="slider-track"
    :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
  >
    
    <!-- Total -->
    <div class="total-card slide">
      <p>Total Quotation Amount</p>
      <h2>{{ currencySymbol }} {{ Number(totalAmount).toLocaleString() }}</h2>
    </div>

    <!-- Monthly -->
    <div class="total-card slide">
      <p>Monthly Quotation Amount</p>
      <h2>{{ currencySymbol }} {{ Number(monthlyAmount).toLocaleString() }}</h2>
    </div>

    <!-- Yearly -->
    <div class="total-card slide">
      <p>Yearly Quotation Amount</p>
      <h2>{{ currencySymbol }} {{ Number(yearlyAmount).toLocaleString() }}</h2>
    </div>

  </div>
</div>


      </div>
<!-- ✅ Floating Bottom QR Button -->
<!-- <div class="qr-fixed">
  <div class="qr-button" @click="showQR = true">
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" 
      alt="QR Code"
      class="qr-image"
    />
  </div>
</div> -->
    </div>
  </div>
</template>

<script setup>
import { useColorTheme } from '@/composables/useColorTheme'
const { setTheme } = useColorTheme()
import { ref, onMounted, onBeforeUnmount } from "vue"
import { useRouter } from "vue-router";
import { Capacitor } from '@capacitor/core'
import { StatusBar } from '@capacitor/status-bar'
import api from "@/services/api";
import { useI18n } from "vue-i18n"
import { computed } from "vue"
const currencySymbols = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  JPY: "¥"
}
const totalAmount = ref(0)
const monthlyAmount = ref(0)
const yearlyAmount = ref(0)

const currentSlide = ref(0)
let sliderInterval = null
const remainingFree = ref(100)
const usedFree = ref(0)
const freeLimit = ref(100)
const company = ref(null)
const showDropdown = ref(false)
const dropdownRef = ref(null)
const router = useRouter()
const { locale } = useI18n()
const user = ref(null);
const totalGrand = ref(0);
const selectedFilter = ref("monthly");
const selectedLanguage = ref(localStorage.getItem("lang") || "en")
const showQR = ref(false)
const downloadQR = async () => {
  const link = document.createElement("a")
  link.href = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${company?.company_name}`
  link.download = "shop-qr.png"
  link.click()
}
const handleGenerateClick = () => {
  if (remainingFree.value === 0) {
    alert("You have reached your 100 free quotations limit. Please upgrade your plan.")
    return
  }

  router.push("/generate")
}
const fetchRemainingFree = async () => {
  try {
    const response = await api.get("/quotations/free-remaining")

    remainingFree.value = response.data.remaining
    usedFree.value = response.data.used
    freeLimit.value = response.data.limit

  } catch (error) {
    console.error("Failed to fetch remaining quotations", error)
  }
}
const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  router.push("/")
}
const currencySymbol = computed(() => {
  if (!company.value || !company.value.currency) {
    return "₹" // fallback
  }

  return currencySymbols[company.value.currency] || "₹"
})
const changeLanguage = (event) => {
  locale.value = event.target.value
  localStorage.setItem("lang", event.target.value)
}
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}
// Close when clicking outside
const handleClickOutside = (event) => {
  if (
    dropdownRef.value &&
    !dropdownRef.value.contains(event.target)
  ) {
    showDropdown.value = false
  }
}
const goCompany = () => {
  showDropdown.value = false
  router.push("/company")
}

const goChangePassword = () => {
  showDropdown.value = false
  router.push("/change-password")
}
const goProfile = () => {
  router.push("/profile")
}
const changeFilter = async (filter) => {
  selectedFilter.value = filter;
  await fetchTotal();
};
const openSection = (section) => {
  router.push("/" + section)
}
const fetchTotals = async () => {
  try {
    const [totalRes, monthlyRes, yearlyRes] = await Promise.all([
      api.get("/quotations/total-grand"),
      api.get("/quotations/total-grand", { params: { filter: "monthly" } }),
      api.get("/quotations/total-grand", { params: { filter: "yearly" } })
    ])

    totalAmount.value = totalRes.data.total_grand
    monthlyAmount.value = monthlyRes.data.total_grand
    yearlyAmount.value = yearlyRes.data.total_grand

  } catch (error) {
    console.error("Failed to fetch totals", error)
  }
}
onMounted(async () => {
  await fetchRemainingFree()
  document.addEventListener("click", handleClickOutside)

  if (Capacitor.isNativePlatform()) {
    StatusBar.setBackgroundColor({ color: 'var(--primary)' })
  }

  try {
    const userResponse = await api.get("/user")
    user.value = userResponse.data

    const companyResponse = await api.get("/company")
    company.value = companyResponse.data

    await fetchTotals()
sliderInterval = setInterval(() => {
  currentSlide.value = (currentSlide.value + 1) % 3
}, 2000)
  } catch (error) {
    console.error("Failed to fetch data", error)
  }
})
onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside)
    clearInterval(sliderInterval)
})
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
  background: var(--primary);;
  border-radius: 0px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}

.top {
  padding: 60px 30px 20px;
  color: white;
  font-size: 8px;
}

.top h1 {
  font-size: 32px;
  font-weight: 600;
 margin-top: 0px;
}

.top p {
  font-size: 14px;
  opacity: 0.9;
}

.card {
  position: absolute;
  bottom: 0;
  width: 100%;
  color: var(--primary);;
  height: 80%;
  background: #F4F6F6;
  border-top-left-radius: 40px;
  border-top-right-radius: 40px;
  padding: 30px;
  overflow-y: auto;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.menu-item {
  background: #E8ECEC;
  border-radius: 20px;
  color: var(--primary);
  padding: 25px 10px;
  text-align: center;
  cursor: pointer;
  transition: 0.3s;
  font-size: 22px;
}

.menu-item p {
  margin-top: 10px;
  font-size: 13px;
 color: var(--primary);
  font-weight: 500;
}

.menu-item:hover {
  background: #d6e4e4;
  transform: translateY(-3px);
}

.logout {
  text-align: center;
  font-size: 13px;
  color: var(--primary);
  margin-top: 25px;
  cursor: pointer;
}
h3{
  margin-bottom: 22px;
  font-weight: 500;
}
.total-card {
  background: var(--primary);
  /* border-radius: 25px; */
  padding: 25px;
  margin-bottom: 25px;
  color: white;
  box-shadow: 0 2px 15px var(--primary);
}

.total-text p {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.total-text h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}
.filter-tabs {
     display: flex;
    justify-content: space-between;
    margin-bottom: 29px;
    background: #e8ecec;
    padding: 6px;
    margin-top: 37px;
    border-radius: 20px;
}

.filter-tabs button {
  flex: 1;
  border: none;
  background: transparent;
  padding: 8px 5px;
  border-radius: 15px;
  font-size: 12px;
  cursor: pointer;
  color: var(--primary);
  transition: 0.3s;
}

.filter-tabs button.active {
  background: var(--primary);
  color: white;
  font-weight: 500;
}
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.profile-icon {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  cursor: pointer;
  transition: 0.3s;
}

.profile-icon:hover {
  background: rgba(255,255,255,0.35);
}
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
}

.profile-wrapper {
  position: relative;
}

.profile-icon {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  cursor: pointer;
  transition: 0.3s;
}

.profile-icon:hover {
  background: rgba(255,255,255,0.35);
}

.dropdown {
  position: absolute;
  right: 0;
  top: 50px;
  width: 170px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  padding: 8px 0;
  z-index: 100;
  animation: fadeIn 0.2s ease-in-out;
}

.dropdown-item {
  padding: 10px 15px;
  font-size: 13px;
  cursor: pointer;
  color: var(--primary);
  transition: 0.2s;
}

.dropdown-item:hover {
  background: #f0f4f4;
}

.logout-item {
  color: #d9534f;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
/* PROFILE SECTION */
.profile-wrapper {
  position: relative;
}

.profile-box {
  cursor: pointer;
}

.avatar {
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #ffffff, #cdebea);
  color: var(--primary);
  font-weight: 600;
  font-size: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 5px 15px rgba(0,0,0,0.15);
  transition: 0.3s;
}

.avatar:hover {
  transform: scale(1.08);
}

.status-dot {
  width: 10px;
  height: 10px;
  background: #4CAF50;
  border: 2px solid white;
  border-radius: 50%;
  position: absolute;
  bottom: 2px;
  right: 2px;
}

/* DROPDOWN */
.dropdown {
  position: absolute;
  right: 0;
  top: 60px;
  width: 220px;
  background: white;
  border-radius: 18px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.15);
  padding: 12px 0;
  z-index: 100;
}

.user-info {
  padding: 10px 15px;
  font-size: 13px;
  color: var(--primary);
}

.user-info small {
  display: block;
  opacity: 0.6;
  font-size: 11px;
}

.divider {
  height: 1px;
  background: #eee;
  margin: 8px 0;
}

.dropdown select {
  width: 90%;
  margin: 8px auto;
  color: var(--primary);
  display: block;
  padding: 6px;
  border-radius: 10px;
  border: 1px solid #ddd;
  font-size: 12px;
}

.dropdown-item {
  padding: 10px 15px;
  font-size: 13px;
  cursor: pointer;
  color: var(--primary);
  transition: 0.2s;
}

.dropdown-item:hover {
  background: #f0f4f4;
}

.logout-item {
  color: #d9534f;
}

/* Animation */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}.avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  overflow: hidden;
}
.company-name {
  display: block;
  font-size: 28px;
  font-weight: 700;
  margin-top: 4px;
  color: #ffffff; /* soft white */
}


.qr-button:hover {
  transform: scale(1.08);
}

/* Overlay */
.qr-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 999;
}

/* Modal */
.qr-modal {
  width: 100%;
  background: white;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  padding: 25px;
  text-align: center;
  animation: slideUp 0.25s ease;
}

.qr-modal h3 {
  margin-bottom: 6px;
  color: var(--primary);
}

.qr-modal p {
  font-size: 12px;
  opacity: 0.6;
  margin-bottom: 20px;
}

.qr-box {
  background: #f4f6f6;
  padding: 20px;
  border-radius: 20px;
  display: inline-block;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.qr-box img {
  width: 220px;
  height: 220px;
}

.qr-actions {
  margin-top: 20px;
  display: flex;
  justify-content: space-around;
}

.qr-actions button {
  padding: 8px 18px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  font-size: 12px;
  background: var(--primary);
  color: white;
}

.close-btn {
  background: #ccc;
  color: #333;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.qr-fixed {
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 500;
}

.qr-button {
  width: 60px;
  height: 60px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  cursor: pointer;
  font-size: 22px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.25);
  transition: 0.3s;
}

.qr-button:hover {
  transform: scale(1.1);
}
.card {
  padding-bottom: 100px; /* space for fixed QR button */
}
.qr-button {
  cursor: pointer;
}

.qr-image {
  width: 40px;   /* adjust size */
  height: 40px;
  object-fit: contain;
}
.smartquote-banner {
  background: linear-gradient(135deg, #ffe8c7, #ffd59e);
  padding: 18px;
  border-radius: 20px;
  margin-bottom: 20px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}

.smartquote-banner h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #b86b00;
}

.smartquote-banner p {
  margin: 6px 0 10px;
  color: #8a5200;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #fff3e0;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #ff9800;
  transition: 0.4s ease;
}

.upgrade-btn {
  margin-top: 10px;
  background: #ff5722;
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  display: inline-block;
  cursor: pointer;
}
.menu-item.disabled {
  opacity: 0.5;
  pointer-events: none;
  background: #ddd;
  transform: none !important;
}

.limit-text {
  display: block;
  font-size: 10px;
  color: red;
  margin-top: 4px;
}
.slider-wrapper {
  overflow: hidden;
  width: 100%;
  margin-bottom: 25px;
}

.slider-track {
  display: flex;
  transition: transform .5s ease;
  width: 300%;
}

.slide {
  width: 100%;
  flex-shrink: 0;
}
h2{
  font-size: 18px;
}
p{
  font-size: 12px;
}
/* THEME SECTION */
.theme-section {
  padding: 12px 15px;
}

.theme-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 10px;
}

.theme-options {
  display: flex;
  gap: 12px;
}

.theme-option {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  transition: 0.3s;
  border: 2px solid transparent;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.theme-option:hover {
  transform: scale(1.15);
}

/* Individual Colors */
.theme-option.red {
  background: #dc2626;
}

.theme-option.blue {
  background: #00a4a7;
}
.theme-option.pink {
  background: #a70172;
}
.theme-option.green {
  background: #07a675;
}


.theme-option.black {
  background: #111827;
}
</style>