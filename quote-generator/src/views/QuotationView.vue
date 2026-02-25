<template>
  <BaseLayout :title="$t('generateQuotation')">

    <!-- ================= CUSTOMER ================= -->
    <h3 class="section-title">{{ $t('customer') }}</h3>

    <div class="toggle">
      <button @click="customerMode='select'">
        {{ $t('select') }}
      </button>
      <button @click="customerMode='manual'">
        {{ $t('manual') }}
      </button>
    </div>

    <!-- Select Existing Customer -->
    <div v-if="customerMode==='select'" class="input">
      <select v-model="selectedCustomer">
        <option disabled value="">
          {{ $t('selectCustomer') }}
        </option>
        <option
          v-for="customer in customers"
          :key="customer.id"
          :value="customer.customer_name"
        >
          {{ customer.customer_name }}
        </option>
      </select>
    </div>

    <!-- Manual Customer -->
    <div v-else class="input">
      <input
        v-model="manualCustomer"
        :placeholder="$t('enterCustomerName')"
      />
    </div>

    <!-- ================= PRODUCTS ================= -->
    <h3 class="section-title">{{ $t('products') }}</h3>

    <div
      v-for="(item, index) in items"
      :key="index"
      class="product-card"
    >
      <input
        v-model="item.name"
        :placeholder="$t('productName')"
      />

      <div class="row">
        <input
          type="number"
          v-model.number="item.qty"
          :placeholder="$t('qty')"
        />
        <input
          type="number"
          v-model.number="item.price"
          :placeholder="$t('price')"
        />
      </div>

      <div class="item-total">
        {{ $t('total') }}:
        ₹ {{ (item.qty * item.price).toFixed(2) }}
      </div>
    </div>

    <button class="add-btn" @click="addItem">
      {{ $t('addProduct') }}
    </button>

    <!-- ================= ADJUSTMENTS ================= -->
    <h3 class="section-title">{{ $t('adjustments') }}</h3>

    <div class="row">
      <div class="input">
        <input
          type="number"
          v-model.number="discount"
          :placeholder="$t('discountPercent')"
        />
      </div>

      <div class="input">
        <input
          type="number"
          v-model.number="gstPercent"
          :placeholder="$t('gstPercent')"
        />
      </div>
    </div>

    <!-- ================= SUMMARY ================= -->
    <div class="summary-card">
      <div class="summary-row">
        <span>{{ $t('subtotal') }}</span>
        <span>₹ {{ subtotal.toFixed(2) }}</span>
      </div>

      <div class="summary-row">
        <span>
          {{ $t('discount') }} ({{ discount }}%)
        </span>
        <span>- ₹ {{ discountAmount.toFixed(2) }}</span>
      </div>

      <div class="summary-row">
        <span>{{ $t('taxableAmount') }}</span>
        <span>₹ {{ taxableAmount.toFixed(2) }}</span>
      </div>

      <div class="summary-row">
        <span>
          {{ $t('gst') }} ({{ gstPercent }}%)
        </span>
        <span>₹ {{ gst.toFixed(2) }}</span>
      </div>

      <div class="summary-row total">
        <span>{{ $t('grandTotal') }}</span>
        <span>₹ {{ grandTotal.toFixed(2) }}</span>
      </div>
    </div>

    <button class="primary-btn" @click="saveQuotation">
      {{ $t('generateQuotation') }}
    </button>

  </BaseLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import BaseLayout from "./components/BaseLayout.vue"
import api from "@/services/api"

/* ================= CUSTOMER ================= */

const customerMode = ref("select")
const selectedCustomer = ref("")
const manualCustomer = ref("")
const customers = ref([])

/* ================= FETCH CUSTOMERS ================= */

onMounted(async () => {
  try {
    const response = await api.get("/customers")
    customers.value = response.data
  } catch (error) {
    console.error("Error loading customers", error)
  }
})

/* ================= PRODUCTS ================= */

const items = ref([
  { name: "", qty: 1, price: 0 }
])

const addItem = () => {
  items.value.push({ name: "", qty: 1, price: 0 })
}

/* ================= CALCULATIONS ================= */

const discount = ref(0)
const gstPercent = ref(18)

const subtotal = computed(() =>
  items.value.reduce((sum, item) => {
    return sum + (item.qty || 0) * (item.price || 0)
  }, 0)
)

const discountAmount = computed(() =>
  subtotal.value * (discount.value / 100)
)

const taxableAmount = computed(() =>
  subtotal.value - discountAmount.value
)

const gst = computed(() =>
  taxableAmount.value * (gstPercent.value / 100)
)

const grandTotal = computed(() =>
  taxableAmount.value + gst.value
)

/* ================= SAVE QUOTATION ================= */

const saveQuotation = async () => {
  try {

    const finalCustomer =
      customerMode.value === "select"
        ? selectedCustomer.value
        : manualCustomer.value

    if (!finalCustomer) {
      alert("Please select or enter a customer")
      return
    }

    const response = await api.post("/quotations", {
      customer_name: finalCustomer,
      subtotal: subtotal.value,
      discount_percent: discount.value,
      discount_amount: discountAmount.value,
      gst_percent: gstPercent.value,
      gst_amount: gst.value,
      grand_total: grandTotal.value,
      items: items.value
    })

    alert(response.data.message)

    // Reset form
    selectedCustomer.value = ""
    manualCustomer.value = ""
    items.value = [{ name: "", qty: 1, price: 0 }]
    discount.value = 0
    gstPercent.value = 18

  } catch (error) {
    console.error(error)
    alert("Error saving quotation")
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
  font-size: 34px;
  font-weight: 600;
  margin-top: 33px;
}

.top p {
  font-size: 14px;
  opacity: 0.9;
}

.card {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 85%;
  background: #F4F6F6;
  border-top-left-radius: 40px;
  border-top-right-radius: 40px;
  padding: 30px;
}

h2 {
  color: #0F6F73;
  margin-bottom: 20px;
}

.input {
  background: #E8ECEC;
  border-radius: 25px;
  padding: 12px 15px;
  margin-bottom: 15px;
}

.input input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
}

.total {
  text-align: center;
  font-weight: 600;
  color: #0F6F73;
  margin-bottom: 15px;
}

.primary-btn {
  width: 100%;
  padding: 12px;
  border-radius: 25px;
  border: none;
  background: #0F6F73;
  color: white;
  font-weight: 500;
  margin-top: 10px;
  cursor: pointer;
}

.logout {
  text-align: center;
  font-size: 13px;
  color: #0F6F73;
  margin-top: 15px;
  cursor: pointer;
}
</style>