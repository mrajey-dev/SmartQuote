<template>
  <div class="container">
    <div class="app-header">
    <h1>ABC Enterprises</h1>
    <p class="subtitle">Generate Quotation</p>
  </div>
    <!-- Customer Details -->
    <div class="form-section">
    <!-- <i class="fa fa-user" style="font-size:24px"> </i> -->
    <input v-model="customerName" placeholder="Enter Customer Name" />
      <input v-model="quotationNumber" placeholder="Quotation Number" />
      <input type="date" v-model="date" />
    </div>

    <h3 class="section-title">Items</h3>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(item, index) in items" :key="index">
            <td data-label="Product">
              <input v-model="item.name" placeholder="Product name" />
            </td>

            <td data-label="Qty">
              <input type="number" v-model.number="item.quantity" min="1" />
            </td>

            <td data-label="Price">
              <input type="number" v-model.number="item.price" min="0" />
            </td>

            <td class="item-total" data-label="Total">
              ₹ {{ (item.quantity * item.price).toFixed(2) }}
            </td>

            <td data-label="Remove">
              <button class="remove-btn" @click="removeItem(index)"><i class="fa fa-trash-o" style="font-size:16px;color:red"></i> Remove Item</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add Item -->
  <div class="actions">
  <button class="add-btn" @click="addItem"><i class="fa fa-plus" style="font-size:16px"></i> Add Item</button>
  <button class="print-btn" @click="printQuotation"><i class="fa fa-print" style="font-size:16px"></i> Print</button>
</div>

<!-- Sticky Grand Total Bar -->
<div class="grand-bar" @click="toggleSummary">
  <span>Grand Total</span>
  <strong>₹ {{ grandTotal.toFixed(2) }}</strong>
</div>

<!-- Expandable Summary Popup -->
<div v-if="showSummary" class="summary-popup">

  <div class="summary-row">
    <span>Subtotal</span>
    <strong>₹ {{ subTotal.toFixed(2) }}</strong>
  </div>

  <div class="summary-row discount-row">
    <span>
      Discount
      <select v-model="discountType">
        <option value="percent">%</option>
        <option value="amount">₹</option>
      </select>
    </span>
    <input type="number" v-model.number="discountValue" min="0" />
  </div>

  <div class="summary-row">
    <span>Discount Amount</span>
    <strong>- ₹ {{ discountAmount.toFixed(2) }}</strong>
  </div>

  <div class="summary-row gst-row">
    <span>GST (%)</span>
    <input type="number" v-model.number="gstRate" min="0" />
  </div>

  <div class="summary-row">
    <span>GST Amount</span>
    <strong>₹ {{ gstAmount.toFixed(2) }}</strong>
  </div>

  <hr />

  <div class="summary-row grand">
    <span>Total</span>
    <strong>₹ {{ grandTotal.toFixed(2) }}</strong>
  </div>

</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showSummary: false,
      customerName: "",
      quotationNumber: "",
      date: "",
      items: [{ name: "", quantity: 1, price: 0 }],
      gstRate: 18,
      discountValue: 0,
      discountType: "percent"
    };
  },

  computed: {
    subTotal() {
      return this.items.reduce(
        (total, item) => total + item.quantity * item.price,
        0
      );
    },

    discountAmount() {
      if (this.discountType === "percent") {
        return (this.subTotal * this.discountValue) / 100;
      }
      return this.discountValue;
    },

    taxableAmount() {
      return this.subTotal - this.discountAmount;
    },

    gstAmount() {
      return (this.taxableAmount * this.gstRate) / 100;
    },

    grandTotal() {
      return this.taxableAmount + this.gstAmount;
    }
  },

  methods: {
    toggleSummary() {
  this.showSummary = !this.showSummary;
},
    addItem() {
      this.items.push({ name: "", quantity: 1, price: 0 });
    },
    removeItem(index) {
      this.items.splice(index, 1);
    },
    printQuotation() {
      window.print();
    }
  }
};
</script>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea, #764ba2);
}

/* APP CONTAINER */
.container {
  max-width: 500px;
  margin: auto;
  background: #d7d6d6;
  min-height: 100vh;
  padding: 20px;
  border-radius: 0;
  box-shadow: none;
}

/* HEADER */
.app-header {
  text-align: center;
  margin-bottom: 20px;
}

.app-header h1 {
  font-size: 22px;
  margin: 0;
  font-weight: 700;
}

.subtitle {
  color: #888;
  font-size: 14px;
  margin-top: 4px;
}

/* FORM SECTION */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

input, select {
  padding: 12px;
  border-radius: 12px;
  border:1px solid #757474;
  font-size: 14px;
  background: #f9f9fb;
  transition: all 0.2s ease;
}

input:focus, select:focus {
  outline: none;
  border-color: #667eea;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
}

/* ITEM CARD STYLE */
table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  display: none;
}

tr {
  background: #ffffff;
  margin-bottom: 15px;
  padding: 15px;
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
  display: block;
}

td {
  display: block;
  padding: 6px 0;
}

td::before {
  content: attr(data-label);
  font-size: 11px;
  font-weight: 600;
  color: #888;
  display: block;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.item-total {
  font-weight: 600;
  color: #667eea;
  font-size: 15px;
}

/* BUTTONS */
.actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  margin-bottom: 29px;
}

button {
  flex: 1;
  padding: 14px;
  border-radius: 14px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
}

.add-btn {
  background: #001575;
  color: white;
}

.add-btn:active {
  transform: scale(0.97);
}

.print-btn {
  background: #000000;
  color: white;
}

.print-btn:active {
  transform: scale(0.97);
}

.remove-btn {
  background: #cacaca;
  color: rgb(103, 100, 100);
  width: 100%;
  margin-top: 10px;
  border-radius: 12px;
  padding: 10px;
}

/* SUMMARY BOX */
.summary-box {
  margin-top: 25px;
  padding: 18px;
  border-radius: 18px;
  background: #f4f6ff;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.02);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  align-items: center;
}

.summary-row span {
  font-size: 14px;
  font-weight: 600;
  color: #5e5959;
}

.summary-row strong {
  font-size: 14px;
}

.summary-row input {
  width: 90px;
}

.discount-row select {
  margin-left: 6px;
}

.gst-row input {
  width: 90px;
}

.grand {
  font-size: 17px;
  font-weight: bold;
  color: #333;
}

/* STICKY SUMMARY FOR MOBILE */
@media (max-width: 500px) {
  .summary-box {
    position: sticky;
    bottom: 0;
    background: rgb(234 234 234);
    border-top: 1px solid #eee;
    border-radius: 20px 20px 0 0;
  }
}

/* PRINT */
@media print {
  body {
    background: white;
  }

  button {
    display: none;
  }

  .summary-box {
    position: relative;
  }
}
/* Sticky Grand Total Bar */
.grand-bar {
  position: sticky;
  bottom: 0;
  background: #667eea;
  color: white;
  padding: 16px;
  border-radius: 20px 20px 0 0;
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 -5px 20px rgba(0,0,0,0.1);
}

/* Expandable Popup */
.summary-popup {
  background: #f4f6ff;
  padding: 18px;
  /* border-radius: 20px 20px 0 0; */
  box-shadow: 0 -5px 30px rgba(0,0,0,0.08);
  margin-bottom: 60px;
}
</style>