<template>
  <BaseLayout :title="$t('generateQuotation')">

    <!-- ================= CUSTOMER ================= -->
    <h3 class="section-title">{{ $t('customer') }}</h3>

    <div class="input">
      <select v-model="selectedCustomer">
        <option disabled value="">
          {{ $t('selectCustomer') }}
        </option>

        <option value="__new__">
          + {{ $t('new') }}
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

    <!-- Show input if Add New Selected -->
    <div v-if="selectedCustomer === '__new__'" class="input">
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
      <button
        v-if="items.length > 1"
        class="remove-btn"
        @click="removeItem(index)"
      >
        ✕
      </button>

      <!-- Product Name -->
      <div class="autocomplete">
        <input
          v-model="item.name"
          @input="searchProducts(item)"
          :placeholder="$t('enterProductName')"
        />

        <ul v-if="item.suggestions.length" class="suggestions">
          <li
            v-for="(suggestion, i) in item.suggestions"
            :key="i"
            @click="item.name = suggestion.product_name; item.suggestions = []"
          >
            {{ suggestion.product_name }}
          </li>
        </ul>
      </div>

      <!-- UNIT -->
      <div class="row">
        <input
          type="number"
          v-model.number="item.qty"
          :placeholder="$t('qty')"
        />

        <select v-model="item.unit">
          <option disabled value="">
            {{ $t('unit') }}
          </option>

          <option v-for="unit in units" :key="unit" :value="unit">
            {{ unit }}
          </option>

          <option value="Other">
            {{ $t('other') }}
          </option>
        </select>
      </div>

      <!-- Custom Unit -->
      <div v-if="item.unit === 'Other'" class="input">
        <input 
          v-model="item.customUnit" 
          :placeholder="$t('enterUnit')" 
        />
      </div>

      <!-- Price -->
      <div class="row">
        <input
          type="number"
          v-model.number="item.price"
          :placeholder="$t('price')"
        />
      </div>

      <!-- Discount & GST -->
      <div class="row">
        <input
          type="number"
          v-model.number="item.discount"
          :placeholder="$t('discountPercent')"
        />

        <input
          type="number"
          v-model.number="item.gst"
          :placeholder="$t('gstPercent')"
        />
      </div>

      <div class="item-total">
        {{ $t('total') }}: ₹ {{ itemTotal(item).toFixed(2) }}
      </div>
    </div>

    <button class="add-btn" @click="addItem">
       {{ $t('addProduct') }}
    </button>

    <!-- ================= SUMMARY ================= -->
    <div class="summary-card">
      <div class="summary-row">
        <span>{{ $t('subtotal') }}</span>
        <span>₹ {{ subtotal.toFixed(2) }}</span>
      </div>

      <div class="summary-row">
        <span>{{ $t('totalGST') }}</span>
        <span>₹ {{ totalGST.toFixed(2) }}</span>
      </div>

      <div class="summary-row total">
        <span>{{ $t('grandTotal') }}</span>
        <span>₹ {{ grandTotal.toFixed(2) }}</span>
      </div>
    </div>

    <div class="button-row">
      <button class="primary-btn" @click="saveQuotation">
        {{ $t('generateQuotation') }}
      </button>
    </div>

  </BaseLayout>
</template>
<script setup>
import { ref, computed, onMounted } from "vue"
import BaseLayout from "./components/BaseLayout.vue"
import api from "@/services/api"
import { useRouter } from "vue-router"
/* ================= CUSTOMER ================= */

const selectedCustomer = ref("")
const manualCustomer = ref("")
const customers = ref([])
const company = ref(null)
const router = useRouter()
onMounted(async () => {
  try {
    const customerResponse = await api.get("/customers")
    customers.value = customerResponse.data

    const companyResponse = await api.get("/company")
    company.value = companyResponse.data
  } catch (error) {
    console.error("Error loading data", error)
  }
})

/* ================= UNITS ================= */

const units = [
  "Piece",
  "Kg",
  "Gram",
  "Liter",
  "Meter",
  "Foot",
  "Box",
  "Dozen",
  "Pack",
  "Set",

]

/* ================= PRODUCTS ================= */

const items = ref([
  {
    name: "",
    suggestions: [],
    qty: "",
    unit: "",
    customUnit: "",
    price: "",
    discount: '',
    gst: '18'
  }
])

const addItem = () => {
  items.value.push({
    name: "",
    suggestions: [],
    qty: "",
    unit: "",
    customUnit: "",
    price: "",
    discount: '',
    gst: ''
  })
}

const removeItem = (index) => {
  items.value.splice(index, 1)
}

/* ================= CALCULATIONS ================= */

let timeout = null

const searchProducts = async (item) => {
  if (!item.name || item.name.length < 1) {
    item.suggestions = []
    return
  }

  clearTimeout(timeout)

  timeout = setTimeout(async () => {
    try {
      const response = await api.get("/product-suggestions", {
        params: { search: item.name }
      })

      item.suggestions = response.data
    } catch (error) {
      console.error(error)
    }
  }, 300) // debounce 300ms
}

const itemTotal = (item) => {
  const base = (item.qty || 0) * (item.price || 0)
  const discountAmount = base * ((item.discount || 0) / 100)
  const afterDiscount = base - discountAmount
  const gstAmount = afterDiscount * ((item.gst || 0) / 100)
  return afterDiscount + gstAmount
}

const subtotal = computed(() =>
  items.value.reduce((sum, item) => {
    const base = (item.qty || 0) * (item.price || 0)
    const discountAmount = base * ((item.discount || 0) / 100)
    return sum + (base - discountAmount)
  }, 0)
)

const totalGST = computed(() =>
  items.value.reduce((sum, item) => {
    const base = (item.qty || 0) * (item.price || 0)
    const discountAmount = base * ((item.discount || 0) / 100)
    const afterDiscount = base - discountAmount
    return sum + afterDiscount * ((item.gst || 0) / 100)
  }, 0)
)

const grandTotal = computed(() =>
  subtotal.value + totalGST.value
)

/* ================= SAVE ================= */

const saveQuotation = async () => {
  try {

    const finalCustomer =
      selectedCustomer.value === "__new__"
        ? manualCustomer.value
        : selectedCustomer.value

    if (!finalCustomer) {
      alert("Please select or enter a customer")
      return
    }

    // 🔥 Calculate totals properly
    let totalDiscountAmount = 0
    let totalGSTAmount = 0
 

    items.value.forEach(item => {
      const base = (item.qty || 0) * (item.price || 0)

      const discountAmount = base * ((item.discount || 0) / 100)
      const afterDiscount = base - discountAmount

      const gstAmount = afterDiscount * ((item.gst || 0) / 100)

      totalDiscountAmount += discountAmount
      totalGSTAmount += gstAmount
    })

    await api.post("/quotations", {
  customer_name: finalCustomer,

  subtotal: subtotal.value,

  // ✅ ONLY TOTAL AMOUNTS AT QUOTATION LEVEL
  total_discount_amount: totalDiscountAmount,
  total_gst_amount: totalGSTAmount,

  grand_total: grandTotal.value,

  // ✅ ITEM-LEVEL TAX & DISCOUNT
  items: items.value.map(item => ({
    name: item.name,
    qty: item.qty,
    unit: item.unit,
    customUnit: item.customUnit,
    price: item.price,
    discount: item.discount || 0, // % PER ITEM
    gst: item.gst || 0            // % PER ITEM
  }))
})

    alert("Quotation generated successfully")

    router.push("/quotations")

  } catch (error) {
    console.error(error)
    alert("All fields required")
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

/* Input Style */
.input {
  background: #E8ECEC;
  border-radius: 20px;
  padding: 12px 15px;
  margin-bottom: 12px;
}

.input select,
.product-card input {
border: none;
    background: #ffffff;
    outline: none;
    width: 100%;
    border-radius: 9px;
    padding: 11px;
    height: 42px;
    font-size: 13px;
}

/* Product Card */
.product-card {
  background: #E8ECEC;
  padding: 15px;
  border-radius: 20px;
  margin-bottom: 12px;
}

.row {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.row input {
  flex: 1;
}

.item-total {
  margin-top: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #0F6F73;
}

/* Add Button */
.add-btn {
  width: 100%;
  padding: 10px;
  border-radius: 20px;
  border: 1px dashed #0F6F73;
  background: transparent;
  color: #0F6F73;
  margin-bottom: 20px;
  cursor: pointer;
  transition: 0.3s;
}

.add-btn:hover {
  background: #E0F2F1;
}

/* Summary Card */
.summary-card {
  background: #F0F4F4;
  padding: 15px;
  border-radius: 20px;
  margin-bottom: 15px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 6px;
}

.summary-row.total {
  font-weight: 600;
  font-size: 15px;
  color: #0F6F73;
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
  cursor: pointer;
  transition: 0.3s;
}

.primary-btn:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 15px rgba(0,0,0,0.15);
}
.toggle {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.toggle button {
  flex: 1;
  padding: 8px;
  border-radius: 15px;
  border: 1px solid #0F6F73;
  background: white;
  cursor: pointer;
}
/* Wrapper */
.input {
  position: relative;
  margin-bottom: 14px;
}

/* Input, Select, Textarea */
.input input,
.input select,
.input textarea {
  width: 100%;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid #d6e2e2;
  background: #f8fbfb;
  font-size: 13px;
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

/* Hover */
.input input:hover,
.input select:hover,
.input textarea:hover {
  background: #f1f7f7;
}

/* Focus */
.input input:focus,
.input select:focus,
.input textarea:focus {
  border-color: #0F6F73;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(15, 111, 115, 0.15);
}

/* Textarea */
.input textarea {
  min-height: 70px;
  resize: vertical;
}

/* Select Arrow Fix */
.input select {
  appearance: none;
  cursor: pointer;
}

/* Placeholder */
.input input::placeholder,
.input textarea::placeholder {
  color: #9aa5a5;
  font-size: 12px;
}

/* Disabled */
.input input:disabled,
.input select:disabled,
.input textarea:disabled {
  background: #ececec;
  cursor: not-allowed;
}
.product-card {
  position: relative;
}

/* Remove Button */
.remove-btn {
      position: absolute;
    top: -4px;
    right: -3px;
    background: #0f6f73;
    border: none;
    border-radius: 91px;
    height: 23px;
    color: #ffffff;
    font-size: 14px;
    cursor: pointer;
    transition: 0.2s;
}

.remove-btn:hover {
  transform: scale(1.2);
  color: #b52b27;
}
.button-row {
  display: flex;
  gap: 10px;
}

.secondary-btn {
  /* flex: 1; */
  /* padding: 14px; */
  border-radius: 25px;
  border: 1px solid #0F6F73;
  background: white;
  color: #0F6F73;
  width: 100%;
  /* font-size: 14px; */
  cursor: pointer;
}

.secondary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
/* Unit Dropdown Styling */
.product-card select {
  width: 100%;
  padding: 11px 14px;
  border-radius: 12px;
  border: 1px solid #d6e2e2;
  background: #ffffff;
  font-size: 13px;
  outline: none;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 42px;

  /* Custom arrow */
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg fill='%230F6F73' height='20' viewBox='0 0 24 24' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
}

/* Hover */
.product-card select:hover {
  background-color: #f4fafa;
}

/* Focus */
.product-card select:focus {
  border-color: #0F6F73;
  box-shadow: 0 0 0 3px rgba(15, 111, 115, 0.15);
}

/* Disabled */
.product-card select:disabled {
  background: #ececec;
  cursor: not-allowed;
}

/* Make qty + unit look balanced */
.product-card .row select {
  flex: 1;
}
.autocomplete {
  position: relative;
}

.suggestions {
  position: absolute;
  top: 45px;
  left: 0;
  right: 0;
  background: white;
  border-radius: 10px;
  border: 1px solid #d6e2e2;
  list-style: none;
  padding: 5px 0;
  margin: 0;
  max-height: 150px;
  overflow-y: auto;
  z-index: 1000;
}

.suggestions li {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
}

.suggestions li:hover {
  background: #f0f7f7;
}
</style>