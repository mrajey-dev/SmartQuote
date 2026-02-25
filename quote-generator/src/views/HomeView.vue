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
        <strong>Greetings!</strong>
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

      <div class="dropdown-item" @click="goCompany">
         {{ $t('editCompany') }}
      </div>

      <div class="dropdown-item" @click="goChangePassword">
         {{ $t('changePassword') }}
      </div>

      <div class="dropdown-item logout-item" @click="logout">
        {{ $t('logout') }}
      </div>
    </div>
  </transition>
</div>
  </div>
</div>
      <!-- CARD -->
      <div class="card">
<h3>{{ $t('discover') }}</h3>
        <div class="menu-grid">

          <!-- <div class="menu-item" @click="openSection('company')">
            🏢
            <p>Company Details</p>
          </div> -->

          <div class="menu-item" @click="openSection('customers')">
          <i class="fa-solid fa-user"></i>
            <p>{{ $t('addCustomers') }}</p>
          </div>

          <div class="menu-item" @click="openSection('generate')">
           <i class='fas fa-file-alt'></i>
           <p>{{ $t('makeQuotation') }}</p>
          </div>
          <!-- <div class="menu-item" @click="openSection('invoice')">
            📄
            <p>Create Invoice</p>
          </div> -->

          <div class="menu-item" @click="openSection('quotations')">
            <i class="fa fa-list-alt"></i>
          <p>{{ $t('quotationList') }}</p>
          </div>

          <div class="menu-item" @click="openSection('stock')">
          <i class='fas fa-folder-open'></i>
          <p>{{ $t('productStock') }}</p>
          </div>

        </div>

        <!-- FILTER BUTTONS -->
<div class="filter-tabs">
  <button 
    :class="{ active: selectedFilter === 'weekly' }"
    @click="changeFilter('weekly')">
   {{ $t('weekly') }}
  </button>

  <button 
    :class="{ active: selectedFilter === 'monthly' }"
    @click="changeFilter('monthly')">
   {{ $t('monthly') }}
  </button>

  <button 
    :class="{ active: selectedFilter === '6months' }"
    @click="changeFilter('6months')">
   {{ $t('sixMonths') }}
  </button>

  <button 
    :class="{ active: selectedFilter === 'yearly' }"
    @click="changeFilter('yearly')">
 {{ $t('yearly') }}
  </button>
</div>
        <!-- GRAND TOTAL CARD -->
<div class="total-card">
  <div class="total-text">
   <p>{{ $t('totalQuotationAmount') }}</p>
   <h2>₹ {{ Number(totalGrand).toLocaleString() }}</h2>
  </div>
</div>


      </div>
    </div>
  </div>
</template>

<script setup>

import { ref, onMounted, onBeforeUnmount } from "vue"
import { useRouter } from "vue-router";
import { Capacitor } from '@capacitor/core'
import { StatusBar } from '@capacitor/status-bar'
import api from "@/services/api";
import { useI18n } from "vue-i18n"
const company = ref(null)
const showDropdown = ref(false)
const dropdownRef = ref(null)
const router = useRouter()
const { locale } = useI18n()
const user = ref(null);
const totalGrand = ref(0);
const selectedFilter = ref("monthly");
const selectedLanguage = ref(localStorage.getItem("lang") || "en")
const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  router.push("/")
}
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
const fetchTotal = async () => {
  try {
    const response = await api.get("/quotations/total-grand", {
      params: { filter: selectedFilter.value }
    });

    totalGrand.value = response.data.total_grand;

  } catch (error) {
    console.error("Failed to fetch total", error);
  }
};
onMounted(async () => {
  document.addEventListener("click", handleClickOutside)

  if (Capacitor.isNativePlatform()) {
    StatusBar.setBackgroundColor({ color: '#0F6F73' })
  }

  try {
    const userResponse = await api.get("/user")
    user.value = userResponse.data

    const companyResponse = await api.get("/company")
    company.value = companyResponse.data

    await fetchTotal()

  } catch (error) {
    console.error("Failed to fetch data", error)
  }
})
onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside)
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
  background: #0F6F73;
  border-radius: 0px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}

.top {
  padding: 60px 30px 20px;
  color: white;
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
  padding: 25px 10px;
  text-align: center;
  cursor: pointer;
  transition: 0.3s;
  font-size: 22px;
}

.menu-item p {
  margin-top: 10px;
  font-size: 13px;
  color: #0F6F73;
  font-weight: 500;
}

.menu-item:hover {
  background: #d6e4e4;
  transform: translateY(-3px);
}

.logout {
  text-align: center;
  font-size: 13px;
  color: #0F6F73;
  margin-top: 25px;
  cursor: pointer;
}
h3{
  margin-bottom: 22px;
  font-weight: 500;
}
.total-card {
  background: linear-gradient(135deg, #0F6F73, #138B90);
  border-radius: 25px;
  padding: 25px;
  margin-bottom: 25px;
  color: white;
  box-shadow: 0 10px 25px rgba(15,111,115,0.3);
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
  margin-bottom: 20px;
  background: #e8ecec;
  padding: 6px;
  margin-top: 16px;
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
  color: #0F6F73;
  transition: 0.3s;
}

.filter-tabs button.active {
  background: #0F6F73;
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
  color: #0F6F73;
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
  color: #0F6F73;
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
  color: #0F6F73;
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
  color: #0F6F73;
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
</style>