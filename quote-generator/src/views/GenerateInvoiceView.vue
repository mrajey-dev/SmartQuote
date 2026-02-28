<template>
  <BaseLayout title="Create Invoice">

    <!-- Invoice Info -->
    <h3 class="section-title">Invoice Details</h3>

    <div class="row">
      <div class="input">
        <input v-model="invoiceNumber" readonly />
      </div>
      <div class="input">
        <input type="date" v-model="invoiceDate" />
      </div>
    </div>

    <!-- Customer Info -->
    <h3 class="section-title">Customer Information</h3>

    <div class="input"><input v-model="customerName" placeholder="Customer Name" /></div>
    <div class="input"><input v-model="customerPhone" placeholder="Phone Number" /></div>
    <div class="input">
      <textarea v-model="customerAddress" placeholder="Customer Address"></textarea>
    </div>

    <!-- Products -->
    <h3 class="section-title">Products</h3>

    <div
      v-for="(item, index) in items"
      :key="index"
      class="product-card"
    >
      <input v-model="item.name" placeholder="Product Name" />

      <div class="row">
        <input type="number" v-model.number="item.qty" placeholder="Qty" />
        <input type="number" v-model.number="item.price" placeholder="Price" />
      </div>

      <div class="item-total">
        Total: ₹ {{ item.qty * item.price || 0 }}
      </div>
    </div>

    <button class="add-btn" @click="addItem">
      + Add Product
    </button>

    <!-- Summary -->
    <div class="summary-card">
      <div class="summary-row">
        <span>Subtotal</span>
        <span>₹ {{ subtotal }}</span>
      </div>

      <div class="summary-row">
        <span>GST (18%)</span>
        <span>₹ {{ gst }}</span>
      </div>

      <div class="summary-row total">
        <span>Grand Total</span>
        <span>₹ {{ grandTotal }}</span>
      </div>
    </div>

    <!-- Notes -->
    <div class="input">
      <textarea v-model="notes" placeholder="Notes (Optional)"></textarea>
    </div>

    <button class="primary-btn" @click="generateInvoice">
      Generate Invoice
    </button>

  </BaseLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import BaseLayout from "./components/BaseLayout.vue"

const invoiceNumber = ref("")
const invoiceDate = ref("")
const customerName = ref("")
const customerPhone = ref("")
const customerAddress = ref("")
const notes = ref("")

const items = ref([
  { name: "", qty: 1, price: 0 }
])

onMounted(() => {
  const random = Math.floor(Math.random() * 10000)
  invoiceNumber.value = "INV-" + random
  invoiceDate.value = new Date().toISOString().substr(0, 10)
})

const addItem = () => {
  items.value.push({ name: "", qty: 1, price: 0 })
}

const subtotal = computed(() =>
  items.value.reduce((sum, item) => {
    return sum + item.qty * item.price
  }, 0)
)

const gst = computed(() => subtotal.value * 0.18)
const grandTotal = computed(() => subtotal.value + gst.value)

const generateInvoice = () => {
  alert("Invoice Generated Successfully!")
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

/* Input Styling */
.input {
  background: #E8ECEC;
  border-radius: 20px;
  padding: 12px 15px;
  margin-bottom: 12px;
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

.row {
  display: flex;
  gap: 10px;
}

.row .input {
  flex: 1;
}

/* Product Card */
.product-card {
  background: #E8ECEC;
  padding: 15px;
  border-radius: 20px;
  margin-bottom: 12px;
}

.product-card input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  font-size: 13px;
}

.item-total {
  margin-top: 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--primary);
}

/* Add Button */
.add-btn {
  width: 100%;
  padding: 10px;
  border-radius: 20px;
  border: 1px dashed var(--primary);
  background: transparent;
  color: var(--primary);
  margin-bottom: 20px;
  cursor: pointer;
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
  color: var(--primary);
}

/* Button */
.primary-btn {
  width: 100%;
  padding: 14px;
  border-radius: 25px;
  border: none;
  background: linear-gradient(135deg, var(--primary), #0C5C60);
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

</style>