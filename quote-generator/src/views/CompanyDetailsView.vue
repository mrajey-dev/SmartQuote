<template>
  <BaseLayout :title="$t('companyDetails')">

    <div class="page-content">

      <!-- Logo & QR Row -->
      <div class="upload-row">

        <!-- Logo Upload -->
        <div class="upload-item">
          <label class="logo-upload">
            <input type="file" @change="handleLogo" hidden />

            <div v-if="!logoPreview" class="upload-placeholder">
              <div class="upload-icon">
                <i class="fa fa-image"></i>
              </div>
              <p>{{ $t('companyLogo') }}</p>
            </div>

            <img v-else :src="logoPreview" class="logo-image" />
          </label>
        </div>

        <!-- QR Code Upload -->
        <div class="upload-item">
          <label class="logo-upload">
            <input type="file" @change="handleQr" hidden />

            <div v-if="!qrPreview" class="upload-placeholder">
              <div class="upload-icon">
                <i class="fa fa-image"></i>
              </div>
              <p>QR Code</p>
            </div>

            <img v-else :src="qrPreview" class="logo-image" />
          </label>
        </div>

      </div>

      <!-- Basic Details -->
      <h3 class="section-title">{{ $t('basicInformation') }}</h3>

    <div class="input">
  <input
    v-model="form.company_name"
    :placeholder="$t('companyName')"
    maxlength="50"
  />
</div>

<p class="error" v-if="errors.company_name">
  {{ errors.company_name }}
</p>


      <div class="input">
        <input v-model="form.owner_name" :placeholder="$t('ownerName')"  maxlength="50"/>
      </div>
<p class="error" v-if="errors.owner_name">
  {{ errors.owner_name }}
</p>
     <div class="input">
  <input
    v-model="form.gst_number"
    :placeholder="$t('gstNumber')"
    @input="form.gst_number = form.gst_number.toUpperCase()"
  />
</div>
<p class="error" v-if="errors.gst_number">
  {{ errors.gst_number }}
</p>
     <div class="input">
  <input
    v-model="form.pan_number"
    :placeholder="$t('panNumber')"
    @input="form.pan_number = form.pan_number.toUpperCase()"
  />
</div>
<p class="error" v-if="errors.pan_number">
  {{ errors.pan_number }}
</p>
      <!-- Terms & Conditions -->
      <h3 class="section-title">{{ $t("termsAndConditions") }}</h3>
    

      <div class="input">
        <textarea
          v-model="form.terms"
          placeholder="Enter terms & conditions"  maxlength="500"
        ></textarea>
      </div>

      <!-- Currency -->
      <h3 class="section-title">{{ $t("currency") }}</h3>

      <div class="input">
        <select v-model="form.currency">
          <option value="INR">INR</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="JPY">JPY</option>
        </select>
      </div>

      <!-- Contact Info -->
      <h3 class="section-title">{{ $t('contactInformation') }}</h3>

      <div class="input">
        <input v-model="form.phone" :placeholder="$t('phoneNumber')" />
      </div>
<p class="error" v-if="errors.phone">
  {{ errors.phone }}
</p>
      <div class="input">
        <input v-model="form.email" :placeholder="$t('emailAddress')" maxlength="100"/>
      </div>
<p class="error" v-if="errors.email">
  {{ errors.email }}
</p>
      <div class="input">
        <input v-model="form.website" :placeholder="$t('websiteOptional')" maxlength="100"/>
      </div>
<p class="error" v-if="errors.website">
  {{ errors.website }}
</p>
      <div class="input">
        <textarea 
          v-model="form.address" 
          :placeholder="$t('companyAddress')"  maxlength="250"
        ></textarea>
      </div>
<p class="error" v-if="errors.address">
  {{ errors.address }}
</p>
      <!-- Bank Details -->
      <h3 class="section-title">{{ $t('bankDetails') }}</h3>

      <div class="input">
        <input v-model="form.bank_name" :placeholder="$t('bankName')"  maxlength="20"/>
      </div>
<p class="error" v-if="errors.bank_name">
  {{ errors.bank_name }}
</p>
      <div class="input">
        <input v-model="form.account_number" :placeholder="$t('accountNumber')" />
      </div>
<p class="error" v-if="errors.account_number">
  {{ errors.account_number }}
</p>
      <div class="input">
        <input v-model="form.ifsc_code" :placeholder="$t('ifscCode')" />
      </div>
<p class="error" v-if="errors.ifsc_code">
  {{ errors.ifsc_code }}
</p>
      <div class="input">
        <input v-model="form.upi_id" :placeholder="$t('upiOptional')" />
      </div>

    </div>

    <!-- ✅ Fixed Bottom Button -->
    <div class="fixed-bottom">
      <button class="primary-btn" @click="saveCompany">
        {{ $t('saveCompanyDetails') }}
      </button>
    </div>

  <!-- Crop Modal -->
<div v-if="showCropModal" class="crop-modal">
  <div class="crop-container">
    
    <Cropper
  ref="cropperRef"
  :src="tempImage"
  :stencil-props="{
    aspectRatio: currentUploadType === 'qr' ? 1 : undefined
  }"
  class="cropper"
/>

    <div class="crop-buttons">
      <button @click="cropImage" class="primary-btn">Crop</button>
      <button @click="closeCrop" class="cancel-btn">Cancel</button>
    </div>

  </div>
</div>
  </BaseLayout>
</template>


<script setup>
import { ref, onMounted, nextTick } from "vue"
import axios from "axios"
import BaseLayout from "./components/BaseLayout.vue"
import { useRouter } from "vue-router"

import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
const router = useRouter()
const errors = ref({
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
})

const validateForm = () => {
  let valid = true

  // Reset errors
  Object.keys(errors.value).forEach(key => {
    errors.value[key] = ''
  })

  // Company Name
if (!form.value.company_name.trim()) {
  errors.value.company_name = 'Company name is required'
  valid = false
} else if (form.value.company_name.length > 50) {
  errors.value.company_name = 'Maximum 50 characters allowed'
  valid = false
}

  // Owner Name
  if (!form.value.owner_name.trim()) {
    errors.value.owner_name = 'Owner name is required'
    valid = false
  }

  // GST (Optional but validate if filled)
  if (form.value.gst_number) {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    if (!gstRegex.test(form.value.gst_number)) {
      errors.value.gst_number = 'Invalid GST number'
      valid = false
    }
  }

  // PAN
  if (form.value.pan_number) {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
    if (!panRegex.test(form.value.pan_number)) {
      errors.value.pan_number = 'Invalid PAN number'
      valid = false
    }
  }

  // Phone
  if (!/^[0-9]{10}$/.test(form.value.phone)) {
    errors.value.phone = 'Phone must be 10 digits'
    valid = false
  }

  // Email
  if (!form.value.email) {
    errors.value.email = 'Email is required'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Invalid email format'
    valid = false
  }

  // Website (optional)
  if (form.value.website) {
    const urlRegex = /^(https?:\/\/)?([\w\d\-]+\.)+\w{2,}(\/.*)?$/
    if (!urlRegex.test(form.value.website)) {
      errors.value.website = 'Invalid website URL'
      valid = false
    }
  }

  // Address
  if (!form.value.address.trim()) {
    errors.value.address = 'Address is required'
    valid = false
  }


  // IFSC
  if (form.value.ifsc_code) {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/
    if (!ifscRegex.test(form.value.ifsc_code)) {
      errors.value.ifsc_code = 'Invalid IFSC code'
      valid = false
    }
  }

  return valid
}
const logoPreview = ref(null)
const logoFile = ref(null)
const qrPreview = ref(null)
const qrFile = ref(null)
const showCropModal = ref(false)
const cropperRef = ref(null)
const tempImage = ref(null)
const currentUploadType = ref(null) // 'logo' or 'qr'
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
  upi_id: '',
   terms: 'GST will be charged as applicable',
     currency: 'INR'
})
const cropImage = () => {
  const result = cropperRef.value.getResult()

  if (!result || !result.canvas) return

  result.canvas.toBlob((blob) => {
    if (!blob) return

    const file = new File([blob], "cropped.png", {
      type: "image/png"
    })

    if (currentUploadType.value === 'logo') {
      logoFile.value = file
      logoPreview.value = URL.createObjectURL(blob)
    } else {
      qrFile.value = file
      qrPreview.value = URL.createObjectURL(blob)
    }

    showCropModal.value = false
  })
}

const closeCrop = () => {
  showCropModal.value = false
}
const handleLogo = (event) => {
  const file = event.target.files[0]
  if (file) {
    currentUploadType.value = 'logo'
    tempImage.value = URL.createObjectURL(file)
    showCropModal.value = true
  }
}

const handleQr = (event) => {
  const file = event.target.files[0]
  if (file) {
    currentUploadType.value = 'qr'
    tempImage.value = URL.createObjectURL(file)
    showCropModal.value = true
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
        upi_id: response.data.upi_id || '',
         terms: response.data.terms || 'GST will be charged as applicable.',
           currency: response.data.currency || 'INR'
      }

      // Show existing logo
      if (response.data.logo) {
        logoPreview.value =
          'https://products.archenterprises.co.in/storage/' +
          response.data.logo
      }
      // Show existing QR
if (response.data.qr_code) {
  qrPreview.value =
    'https://products.archenterprises.co.in/storage/' +
    response.data.qr_code
}
    }

  } catch (error) {
    console.log("No existing company found")
  }
})
const saveCompany = async () => {

  if (!validateForm()) {
    return
  }

  try {
    const formData = new FormData()

    Object.keys(form.value).forEach(key => {
      formData.append(key, form.value[key])
    })

    if (logoFile.value) {
      formData.append('logo', logoFile.value)
    }

    if (qrFile.value) {
      formData.append('qr_code', qrFile.value)
    }

    const token = localStorage.getItem('token')

    await axios.post(
      'https://products.archenterprises.co.in/api/companies',
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    )

 if (confirm("Company saved successfully")) {
  router.push('/home')
}


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
  color: var(--primary);
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
  border-radius: 0px;
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
  /* margin-bottom: 8px; */
}

.upload-placeholder p {
  font-size: 8px;
  font-weight: 500;
  margin: 0;
  color: var(--primary);
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
/* Upload Row Layout */
.upload-row {
  display: flex;
  justify-content: center;
  gap: 25px;
  margin-bottom: 25px;
}

/* Each Item */
.upload-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.input select {
  border: none;
  background: transparent;
  color: var(--primary);
  outline: none;
  width: 100%;
  font-size: 13px;
}
.page-content {
  padding-bottom: 100px;
}

/* Fixed bottom container */
.fixed-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  /* padding: 12px 16px; */
  /* background: white; */
  box-shadow: 0 -4px 10px rgba(0,0,0,0.05);
  z-index: 100;
}

/* Button */
.primary-btn {
  width: 100%;
  padding: 14px;
  border-radius: 0px;
  border: none;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.3s;
}

.primary-btn:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 15px rgba(0,0,0,0.15);
}
.crop-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.crop-container {
  background: white;
  padding: 20px;
  width: 90%;
  max-width: 400px;
  border-radius: 12px;
}

.crop-buttons {
  margin-top: 15px;
  display: flex;
  gap: 7px;
  justify-content: space-between;
}

.cancel-btn {
 width: 50%;
  padding: 14px;
  border-radius: 11px;
  border: none;
  background: linear-gradient(135deg, #929898, #b1b1b1);
  color: rgb(15, 12, 12);
  font-size: 14px;
  font-weight: 500;
  margin-top: 15px;
  cursor: pointer;
  transition: 0.3s;
}
.cropper {
  height: 300px;
  width: 100%;
}
.error {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
  margin-left: 4px;
}

.char-count {
  font-size: 12px;
  text-align: right;
  color: #888;
  margin-top: 4px;
}
</style>