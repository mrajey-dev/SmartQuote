<template>
  <BaseLayout :title="$t('companyDetails')">

    <!-- Logo Upload -->
    <div class="logo-section">
      <label class="logo-upload">
        <input type="file" @change="handleLogo" hidden />
        
        <div v-if="!logoPreview" class="upload-placeholder">
          <div class="upload-icon">
            <i class="fa fa-image" style="font-size:28px;color:#0F6F73"></i>
          </div>
          <p>{{ $t('companyLogo') }}</p>
        </div>

        <img v-else :src="logoPreview" class="logo-image" />
      </label>
    </div>

    <!-- Basic Details -->
    <h3 class="section-title">{{ $t('basicInformation') }}</h3>

    <div class="input">
      <input v-model="form.company_name" :placeholder="$t('companyName')" />
    </div>

    <div class="input">
      <input v-model="form.owner_name" :placeholder="$t('ownerName')" />
    </div>

    <div class="input">
      <input v-model="form.gst_number" :placeholder="$t('gstNumber')" />
    </div>

    <div class="input">
      <input v-model="form.pan_number" :placeholder="$t('panNumber')" />
    </div>

    <!-- Contact Info -->
    <h3 class="section-title">{{ $t('contactInformation') }}</h3>

    <div class="input">
      <input v-model="form.phone" :placeholder="$t('phoneNumber')" />
    </div>

    <div class="input">
      <input v-model="form.email" :placeholder="$t('emailAddress')" />
    </div>

    <div class="input">
      <input v-model="form.website" :placeholder="$t('websiteOptional')" />
    </div>

    <div class="input">
      <textarea 
        v-model="form.address" 
        :placeholder="$t('companyAddress')"
      ></textarea>
    </div>

    <!-- Bank Details -->
    <h3 class="section-title">{{ $t('bankDetails') }}</h3>

    <div class="input">
      <input v-model="form.bank_name" :placeholder="$t('bankName')" />
    </div>

    <div class="input">
      <input v-model="form.account_number" :placeholder="$t('accountNumber')" />
    </div>

    <div class="input">
      <input v-model="form.ifsc_code" :placeholder="$t('ifscCode')" />
    </div>

    <div class="input">
      <input v-model="form.upi_id" :placeholder="$t('upiOptional')" />
    </div>

    <button 
      class="primary-btn" 
      @click="saveCompany"
    >
      {{ $t('saveCompanyDetails') }}
    </button>

  </BaseLayout>
</template>

<script setup>
import { ref, onMounted } from "vue"
import axios from "axios"
import BaseLayout from "./components/BaseLayout.vue"

const logoPreview = ref(null)
const logoFile = ref(null)

const form = ref({
  company_name: '',
  owner_name: '',
  gst_number: '',
  pan_number: '',
  phone: '',
  email: '',
  website: '',
  address: '',
  bank_name: '',
  account_number: '',
  ifsc_code: '',
  upi_id: ''
})

const handleLogo = (event) => {
  const file = event.target.files[0]
  if (file) {
    logoFile.value = file
    logoPreview.value = URL.createObjectURL(file)
  }
}
onMounted(async () => {
  try {
    const token = localStorage.getItem('token')

    const response = await axios.get(
      'https://products.archenterprises.co.in/api/company',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.data) {
      // Fill form with existing data
      form.value = {
        company_name: response.data.company_name || '',
        owner_name: response.data.owner_name || '',
        gst_number: response.data.gst_number || '',
        pan_number: response.data.pan_number || '',
        phone: response.data.phone || '',
        email: response.data.email || '',
        website: response.data.website || '',
        address: response.data.address || '',
        bank_name: response.data.bank_name || '',
        account_number: response.data.account_number || '',
        ifsc_code: response.data.ifsc_code || '',
        upi_id: response.data.upi_id || ''
      }

      // Show existing logo
      if (response.data.logo) {
        logoPreview.value =
          'https://products.archenterprises.co.in/storage/' +
          response.data.logo
      }
    }

  } catch (error) {
    console.log("No existing company found")
  }
})
const saveCompany = async () => {
  try {
    const formData = new FormData()

    Object.keys(form.value).forEach(key => {
      formData.append(key, form.value[key])
    })

    if (logoFile.value) {
      formData.append('logo', logoFile.value)
    }

    const token = localStorage.getItem('token')  // ✅ get token

    await axios.post(
      'https://products.archenterprises.co.in/api/companies',
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,   // ✅ SEND TOKEN
          'Content-Type': 'multipart/form-data'
        }
      }
    )

    alert('Company saved successfully!')
  } catch (error) {
    console.error(error.response?.data || error)
    alert('Something went wrong!')
  }
}
</script>

<style scoped>

/* Section Headings */
.section-title {
  margin: 20px 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: #0F6F73;
}

/* Logo Upload Section */
.logo-section {
  text-align: center;
  margin-bottom: 20px;
}

.logo-preview {
  width: 90px;
  height: 90px;
  border-radius: 20px;
  background: #E8ECEC;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
  font-size: 12px;
  color: #555;
  cursor: pointer;
}

.file-input {
  margin-top: 10px;
  font-size: 12px;
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
.logo-section {
  margin-bottom: 25px;
  display: flex;
  justify-content: center;
}

.logo-upload {
 width: 73px;
    height: 73px;
    border-radius: 64px;
  background: #E8ECEC;
  cursor: pointer;
  transition: 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.logo-upload:hover {
  background: #dde4e4;
  transform: scale(1.03);
}

.upload-placeholder {
  text-align: center;
  padding: 15px;
}

.upload-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.upload-placeholder p {
  font-size: 12px;
  font-weight: 500;
  margin: 0;
  color: #0F6F73;
}

.upload-placeholder span {
  font-size: 10px;
  color: #666;
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.top{
      margin-top: -77px;
}
</style>