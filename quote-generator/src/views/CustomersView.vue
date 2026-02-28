<template>
  <BaseLayout :title="$t('customers')">

    <!-- Avatar Section -->
    <div class="avatar-section">
      <div class="avatar-circle">
        <i class="fa fa-user" style="font-size:48px;color:white"></i>
      </div>
    </div>

    <!-- Basic Info -->
    <h3 class="section-title">{{ $t('basicInformation') }}</h3>

 <div class="input">
  <input 
    v-model="customer.customer_name"
    :placeholder="$t('customerName')"
    maxlength="50"
  />
</div>
<p class="error" v-if="errors.customer_name">
  {{ errors.customer_name }}
</p>

   <div class="input">
  <input 
    v-model="customer.company_name"
    :placeholder="$t('companyNameOptional')"
    maxlength="50"
  />
</div>
<p class="error" v-if="errors.company_name">
  {{ errors.company_name }}
</p>


    <!-- Contact Info -->
    <h3 class="section-title">{{ $t('contactDetails') }}</h3>

<div class="input">
  <input 
    v-model="customer.phone"
    type="tel"
    maxlength="10"
    inputmode="numeric"
    pattern="[0-9]*"
    :placeholder="$t('phoneNumber')"
    @input="customer.phone = customer.phone.replace(/\D/g, '')"
  />
</div>

<p class="error" v-if="errors.phone">
  {{ errors.phone }}
</p>

<div class="input">
  <input 
    v-model="customer.email"
    type="email"
    maxlength="100"
    :placeholder="$t('emailAddress')"
  />
</div>
<p class="error" v-if="errors.email">
  {{ errors.email }}
</p>


<div class="input">
  <textarea 
    v-model="customer.address"
    maxlength="200"
    :placeholder="$t('address')"
  ></textarea>
</div>
<p class="error" v-if="errors.address">
  {{ errors.address }}
</p>

    <!-- Additional -->
    <h3 class="section-title">{{ $t('additionalInfo') }}</h3>

  <div class="input">
  <textarea 
    v-model="customer.notes"
    maxlength="300"
    :placeholder="$t('notesOptional')"
  ></textarea>
</div>
<p class="error" v-if="errors.notes">
  {{ errors.notes }}
</p>


    <button 
      class="primary-btn" 
      @click="saveCustomer"
    >
    <i class="fa fa-save"></i>  {{ $t('addCustomer') }}
    </button>

  </BaseLayout>
</template>

<script setup>
import { ref } from "vue"
import BaseLayout from "./components/BaseLayout.vue"
import api from "@/services/api"
import { useRouter } from "vue-router"
const router = useRouter()
const customer = ref({
  customer_name: "",
  company_name: "",
  phone: "",
  email: "",
  address: "",
  notes: ""
})
const errors = ref({
  customer_name: "",
  company_name: "",
  phone: "",
  email: "",
  address: "",
  notes: ""
})

const validateCustomer = () => {
  let valid = true

  // Reset errors
  Object.keys(errors.value).forEach(key => {
    errors.value[key] = ""
  })

  // Customer Name (Required + Max 50)
  if (!customer.value.customer_name.trim()) {
    errors.value.customer_name = "Customer name is required"
    valid = false
  } else if (customer.value.customer_name.length > 50) {
    errors.value.customer_name = "Maximum 50 characters allowed"
    valid = false
  }

  // Company Name (Optional, Max 50)
  if (customer.value.company_name.length > 50) {
    errors.value.company_name = "Maximum 50 characters allowed"
    valid = false
  }

  // Phone (Required, 10 digits)
  if (!/^[0-9]{10}$/.test(customer.value.phone)) {
    errors.value.phone = "Phone must be 10 digits"
    valid = false
  }

  // Email (Optional but validate if entered)
  if (customer.value.email) {
    if (customer.value.email.length > 100) {
      errors.value.email = "Maximum 100 characters allowed"
      valid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.value.email)) {
      errors.value.email = "Invalid email format"
      valid = false
    }
  }

  // Address (Optional, Max 200)
  if (customer.value.address.length > 200) {
    errors.value.address = "Maximum 200 characters allowed"
    valid = false
  }

  // Notes (Optional, Max 300)
  if (customer.value.notes.length > 300) {
    errors.value.notes = "Maximum 300 characters allowed"
    valid = false
  }

  return valid
}
const saveCustomer = async () => {

  if (!validateCustomer()) {
    return
  }

  try {
    const response = await api.post("/customers", customer.value)

    alert(response.data.message)

    // Reset form
    customer.value = {
      customer_name: "",
      company_name: "",
      phone: "",
      email: "",
      address: "",
      notes: ""
    }

    // ✅ Redirect to home after OK
    router.push("/home")

  } catch (error) {
    console.error(error)
    alert("Error saving customer")
  }
}
</script>

<style scoped>

/* Section Title */
.section-title {
  margin: 20px 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
}

/* Avatar */
.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.avatar-circle {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

/* Input Fields */
.input {
  background: #E8ECEC;
  border-radius: 20px;
  padding: 12px 15px;
  margin-bottom: 12px;
  transition: 0.3s;
}

.input:hover {
  background: #dde4e4;
}

.input input,
.input textarea {
  border: none;
  color: var(--primary);
  background: transparent;
  outline: none;
  width: 100%;
  font-size: 13px;
  resize: none;
}

textarea {
  min-height: 60px;
}

/* Button */
.primary-btn {
  width: 100%;
  padding: 14px;
  border-radius: 25px;
  border: none;
  background: var(--primary);
  color: white;
  font-size: 14px;
  font-weight: 500;
  margin-top: 15px;
  cursor: pointer;
  transition: 0.3s;
}

.primary-btn:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 15px rgba(0,0,0,0.15);
}
.error {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
}

.char-count {
  font-size: 12px;
  text-align: right;
  color: #888;
  margin-top: 4px;
}
</style>