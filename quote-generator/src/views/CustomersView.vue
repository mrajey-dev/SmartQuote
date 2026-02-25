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
      />
    </div>

    <div class="input">
      <input 
        v-model="customer.company_name" 
        :placeholder="$t('companyNameOptional')" 
      />
    </div>

    <!-- Contact Info -->
    <h3 class="section-title">{{ $t('contactDetails') }}</h3>

    <div class="input">
      <input 
        v-model="customer.phone" 
        type="tel" 
        :placeholder="$t('phoneNumber')" 
      />
    </div>

    <div class="input">
      <input 
        v-model="customer.email" 
        type="email" 
        :placeholder="$t('emailAddress')" 
      />
    </div>

    <div class="input">
      <textarea 
        v-model="customer.address" 
        :placeholder="$t('address')"
      ></textarea>
    </div>

    <!-- Additional -->
    <h3 class="section-title">{{ $t('additionalInfo') }}</h3>

    <div class="input">
      <textarea 
        v-model="customer.notes" 
        :placeholder="$t('notesOptional')"
      ></textarea>
    </div>

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

const customer = ref({
  customer_name: "",
  company_name: "",
  phone: "",
  email: "",
  address: "",
  notes: ""
})

const saveCustomer = async () => {
  try {
    const response = await api.post("/customers", customer.value)
    alert(response.data.message)

    // Clear form
    customer.value = {
      customer_name: "",
      company_name: "",
      phone: "",
      email: "",
      address: "",
      notes: ""
    }

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
  color: #0F6F73;
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
  background: linear-gradient(135deg, #0F6F73, #0C5C60);
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
  background: linear-gradient(135deg, #0F6F73, #0C5C60);
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

</style>