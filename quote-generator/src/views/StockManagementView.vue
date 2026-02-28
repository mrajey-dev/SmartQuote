<template>
  <BaseLayout :title="$t('productStock')">

    <!-- Add / Update Product -->
    <h3 class="section-title">
      {{ $t('addUpdateProduct') }}
    </h3>
<div class="input">
  <input 
    v-model="name"
    maxlength="100"
    :placeholder="$t('productName')" 
  />
</div>
<p class="error" v-if="errors.name">
  {{ errors.name }}
</p>

   <div class="input">
  <input 
    v-model="sku"
    maxlength="30"
    :placeholder="$t('skuCode')" 
  />
</div>
<p class="error" v-if="errors.sku">
  {{ errors.sku }}
</p>

   <div class="input">
  <input 
    v-model="category"
    maxlength="50"
    :placeholder="$t('category')" 
  />
</div>
<p class="error" v-if="errors.category">
  {{ errors.category }}
</p>

    <div class="row">
      <div class="input">
  <input
    type="number"
    min="0"
    v-model.number="purchasePrice"
    :placeholder="$t('purchasePrice')"
  />
</div>
<p class="error" v-if="errors.purchasePrice">
  {{ errors.purchasePrice }}
</p>
      <div class="input">
  <input
    type="number"
    min="0"
    v-model.number="sellingPrice"
    :placeholder="$t('sellingPrice')"
  />
</div>
<p class="error" v-if="errors.sellingPrice">
  {{ errors.sellingPrice }}
</p>
    </div>

    <div class="row">
      <div class="input">
  <input
    type="number"
    min="0"
    v-model.number="quantity"
    :placeholder="$t('stockQuantity')"
  />
</div>
<p class="error" v-if="errors.quantity">
  {{ errors.quantity }}
</p>
     <div class="input">
  <input
    type="number"
    min="0"
    v-model.number="lowStockAlert"
    :placeholder="$t('lowStockAlert')"
  />
</div>
<p class="error" v-if="errors.lowStockAlert">
  {{ errors.lowStockAlert }}
</p>
    </div>

    <button class="primary-btn" @click="addProduct">
      {{ editIndex !== null ? $t('updateProduct') : $t('saveProduct') }}
    </button>

    <!-- Search -->
    <div class="input">
      <input
        v-model="search"
        :placeholder="$t('searchByNameOrSku')"
      />
    </div>

    <!-- Stock List -->
    <h3 class="section-title">
      {{ $t('stockList') }}
    </h3>

    <div
      v-for="product in filteredProducts"
      :key="product.id"
      class="stock-card"
    >
      <div class="stock-header">
        <span class="product-name">
          {{ product.name }}
        </span>

        <span
          class="stock-badge"
          :class="{ low: product.quantity <= product.lowStockAlert }"
        >
          {{ product.quantity }} {{ $t('inStock') }}
        </span>
      </div>

      <div class="stock-details">
        <p>{{ $t('sku') }}: {{ product.sku }}</p>
        <p>{{ $t('category') }}: {{ product.category }}</p>
        <p>{{ $t('selling') }}: ₹ {{ product.sellingPrice }}</p>
        <p>{{ $t('purchase') }}: ₹ {{ product.purchasePrice }}</p>
      </div>

      <div class="action-row">
        <button @click="editProduct(product)">
          {{ $t('edit') }}
        </button>
        <button class="delete" @click="deleteProduct(product.id)">
          {{ $t('delete') }}
        </button>
      </div>
    </div>

  </BaseLayout>
</template>
<script setup>
import { ref, computed, onMounted } from "vue"
import api from "@/services/api"
import BaseLayout from "./components/BaseLayout.vue"

const errors = ref({
  name: "",
  sku: "",
  category: "",
  purchasePrice: "",
  sellingPrice: "",
  quantity: "",
  lowStockAlert: ""
})

const validateProduct = () => {
  let valid = true

  // Reset errors
  Object.keys(errors.value).forEach(key => {
    errors.value[key] = ""
  })

  // Product Name
  if (!name.value.trim()) {
    errors.value.name = "Product name is required"
    valid = false
  } else if (name.value.length > 100) {
    errors.value.name = "Maximum 100 characters allowed"
    valid = false
  }

  // SKU
  if (sku.value && sku.value.length > 30) {
    errors.value.sku = "Maximum 30 characters allowed"
    valid = false
  }

  // Category
  if (category.value && category.value.length > 50) {
    errors.value.category = "Maximum 50 characters allowed"
    valid = false
  }

  // Purchase Price
  if (purchasePrice.value === null || purchasePrice.value === undefined) {
    errors.value.purchasePrice = "Purchase price is required"
    valid = false
  } else if (purchasePrice.value < 0) {
    errors.value.purchasePrice = "Cannot be negative"
    valid = false
  }

  // Selling Price
  if (sellingPrice.value === null || sellingPrice.value === undefined) {
    errors.value.sellingPrice = "Selling price is required"
    valid = false
  } else if (sellingPrice.value < purchasePrice.value) {
    errors.value.sellingPrice = "Selling must be ≥ Purchase"
    valid = false
  }

  // Quantity
  if (quantity.value === null || quantity.value === undefined) {
    errors.value.quantity = "Quantity required"
    valid = false
  } else if (quantity.value < 0) {
    errors.value.quantity = "Cannot be negative"
    valid = false
  }

  // Low Stock Alert
  if (lowStockAlert.value === null || lowStockAlert.value === undefined) {
    errors.value.lowStockAlert = "Low stock alert required"
    valid = false
  } else if (lowStockAlert.value < 0) {
    errors.value.lowStockAlert = "Cannot be negative"
    valid = false
  }

  return valid
}
const name = ref("")
const sku = ref("")
const category = ref("")
const purchasePrice = ref()
const sellingPrice = ref()
const quantity = ref()
const lowStockAlert = ref()

const products = ref([])
const search = ref("")
const editIndex = ref(null)

const fetchProducts = async () => {
const res = await api.get("/products")

  // If Laravel returns pagination
  if (Array.isArray(res.data.data)) {
    products.value = res.data.data
  } else if (Array.isArray(res.data)) {
    products.value = res.data
  } else {
    products.value = []
  }
}

onMounted(fetchProducts)

const filteredProducts = computed(() => {
  return products.value.filter(p =>
    p.name.toLowerCase().includes(search.value.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.value.toLowerCase())
  )
})

const totalStockValue = computed(() => {
  return products.value.reduce((sum, p) => {
    return sum + (p.purchase_price * p.quantity)
  }, 0)
})

const lowStockCount = computed(() => {
  return products.value.filter(p => p.quantity <= p.low_stock_alert).length
})

const addProduct = async () => {

  if (!validateProduct()) {
    return
  }

  const productData = {
    name: name.value.trim(),
    sku: sku.value || "SKU-" + Date.now(),
    category: category.value.trim(),
    purchase_price: purchasePrice.value,
    selling_price: sellingPrice.value,
    quantity: quantity.value,
    low_stock_alert: lowStockAlert.value
  }

  if (editIndex.value !== null) {
    await api.put(`/products/${editIndex.value}`, productData)
  } else {
    await api.post("/products", productData)
  }

  await fetchProducts()
  resetForm()
}

const editProduct = (product) => {
  name.value = product.name
  sku.value = product.sku
  category.value = product.category
  purchasePrice.value = product.purchase_price
  sellingPrice.value = product.selling_price
  quantity.value = product.quantity
  lowStockAlert.value = product.low_stock_alert

  editIndex.value = product.id
}

const deleteProduct = async (id) => {
  if (confirm("Delete this product?")) {
   await api.delete(`/products/${id}`)
    fetchProducts()
  }
}

const resetForm = () => {
  name.value = ""
  sku.value = ""
  category.value = ""
  purchasePrice.value = 0
  sellingPrice.value = 0
  quantity.value = 0
  lowStockAlert.value = 5
  editIndex.value = null
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

/* Inputs */
.input {
  background: #E8ECEC;
  border-radius: 20px;
  padding: 12px 15px;
  margin-bottom: 12px;
}

.input input {
  border: none;
  color: var(--primary);
  background: transparent;
  outline: none;
  width: 100%;
  font-size: 13px;
}

.row {
  display: flex;
  gap: 10px;
}

.row .input {
  flex: 1;
}

/* Button */
.primary-btn {
  width: 100%;
  padding: 14px;
  border-radius: 25px;
  margin-bottom: 17px;
  background: var(--primary);
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

/* Stock Card */
.stock-card {
  background: #F0F4F4;
  padding: 15px;
  border-radius: 20px;
  margin-bottom: 12px;
}

.stock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-name {
  font-weight: 600;
  color: var(--primary);
  font-size: 14px;
}

.stock-badge {
  background: var(--primary);
  color: white;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 11px;
}

.stock-badge.low {
  background: #D9534F;
}

.stock-details p {
  font-size: 12px;
  margin: 4px 0;
  color: var(--primary);
}
.stock-summary {
  background: #F8FAFA;
  padding: 12px;
  border-radius: 15px;
  margin-bottom: 15px;
  font-size: 13px;
}

.action-row {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

.action-row button {
  flex: 1;
  padding: 6px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
}

.action-row .delete {
  background: #D9534F;
  color: white;
}
.error {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
}
</style>