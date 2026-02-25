<template>
  <BaseLayout :title="$t('quotationList')">

    <!-- ================= SUMMARY ================= -->
    <div class="summary">
      
      <div class="summary-card total">
        <div>{{ $t('totalAll') }}</div>
        <strong>Rs. {{ totalAll.toFixed(2) }}</strong>
      </div>

      <div class="summary-card">
        <div>{{ $t('thisMonth') }}</div>
        <strong>Rs. {{ totalMonth.toFixed(2) }}</strong>
      </div>

      <div class="summary-card">
        <div>{{ $t('lastSixMonths') }}</div>
        <strong>Rs. {{ totalSixMonths.toFixed(2) }}</strong>
      </div>

      <div class="summary-card">
        <div>{{ $t('lastOneYear') }}</div>
        <strong>Rs. {{ totalYear.toFixed(2) }}</strong>
      </div>

    </div>

    <!-- ================= QUOTATION LIST ================= -->

    <div
      v-for="quotation in quotations"
      :key="quotation.id"
      class="list-item"
      :class="{ 'latest-quotation': quotation.id === latestQuotationId }"
    >
      <div class="top-row">
        <strong>{{ quotation.quotation_number }}</strong>
        <span class="amount">
          Rs. {{ Number(quotation.grand_total).toFixed(2) }}
        </span>
      </div>

      <div class="customer">
        {{ quotation.customer_name }}
      </div>

      <div class="date">
        {{ new Date(quotation.created_at).toLocaleDateString() }}
      </div>

      <!-- ACTION BUTTON -->
      <div class="action-row">
        <button class="share-btn" @click="shareQuotation(quotation.id)">
          <ShareIcon style="width:22px; color:#0F6F73;" />
        
        </button>
      </div>
    </div>

    <div v-if="quotations.length === 0" class="empty">
      {{ $t('noQuotationsFound') }}
    </div>

  </BaseLayout>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"
import BaseLayout from "./components/BaseLayout.vue"
import api from "@/services/api"
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import { ShareIcon } from '@heroicons/vue/24/solid'
import jsPDF from "jspdf"
const quotations = ref([])
const company = ref(null)
/* ================= FETCH ================= */

const fetchQuotations = async () => {
  try {
    const response = await api.get("/quotations")
    quotations.value = response.data
  } catch (error) {
    console.error(error)
    alert("Error fetching quotations")
  }
}
const latestQuotationId = computed(() => {
  if (!quotations.value.length) return null

  const latest = [...quotations.value].sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at)
  })[0]

  return latest?.id || null
})
const fetchCompany = async () => {
  try {
    const response = await api.get("/company")
    company.value = response.data
  } catch (error) {
    console.error("Error loading company", error)
  }
}
onMounted(() => {
  fetchQuotations()
  fetchCompany()
})

const shareQuotation = async (quotationId) => {
  
  try {
    if (!company.value) {
      alert("Company not loaded")
      return
    }

    // Fetch full quotation
    const response = await api.get(`/quotations/${quotationId}`)
    const quotation = response.data

    const doc = new jsPDF()
    let startY = 20

    /* ================= HEADER BAR ================= */
    doc.setFillColor(15, 111, 115)
    doc.rect(0, 0, 210, 30, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.text(company.value.company_name || "", 14, 18)

    doc.setFontSize(12)
    doc.text("QUOTATION", 150, 18)

    startY = 40

    /* ================= COMPANY DETAILS ================= */
    doc.setTextColor(0)
    doc.setFontSize(10)

    doc.text(company.value.address || "", 14, startY)
    startY += 5
    doc.text(`Phone: ${company.value.phone || ""}`, 14, startY)
    startY += 5
    doc.text(`Email: ${company.value.email || ""}`, 14, startY)
    startY += 5
    doc.text(`GST: ${company.value.gst_number || ""}`, 14, startY)

    startY += 10

    /* ================= QUOTATION INFO ================= */
    doc.setDrawColor(200)
    doc.rect(14, startY, 182, 20)

    doc.text(`Quotation No: ${quotation.quotation_number}`, 18, startY + 8)
    doc.text(`Customer: ${quotation.customer_name}`, 18, startY + 15)
    doc.text(
      `Date: ${new Date(quotation.created_at).toLocaleDateString()}`,
      120,
      startY + 8
    )

    startY += 30

    /* ================= TABLE HEADER ================= */
    doc.setFillColor(230, 247, 248)
    doc.rect(14, startY - 6, 182, 8, "F")

    doc.setFontSize(11)
    doc.text("Product", 16, startY)
    doc.text("Qty", 120, startY)
    doc.text("Price", 140, startY)
    doc.text("Total", 170, startY)

    startY += 8
    doc.setDrawColor(220)

    /* ================= USE DB TOTALS ================= */
    let subtotal = Number(quotation.subtotal) || 0
    let totalDiscount = Number(quotation.discount_amount) || 0
    let totalGST = Number(quotation.gst_amount) || 0
    let grandTotal = Number(quotation.grand_total) || 0

    /* ================= ITEMS ================= */
    if (quotation.items && quotation.items.length) {

      quotation.items.forEach((item) => {

        const name = String(item?.product_name || "-")
        const qty = Number(item?.quantity || 0)
        const price = Number(item?.price || 0)
        const total = Number(item?.total || 0)

        const splitName = doc.splitTextToSize(name, 95)

        doc.text(splitName, 16, startY)
        doc.text(String(qty), 120, startY)
        doc.text(`Rs. ${price.toFixed(2)}`, 140, startY)
        doc.text(`Rs. ${total.toFixed(2)}`, 170, startY)

        const rowHeight =
          (Array.isArray(splitName) ? splitName.length : 1) * 6

        startY += rowHeight

        doc.line(14, startY - 2, 196, startY - 2)

        if (startY > 270) {
          doc.addPage()
          startY = 20
        }
      })
    }

    /* ================= TOTALS BOX ================= */
    if (startY > 240) {
      doc.addPage()
      startY = 20
    }

    startY += 10
    doc.rect(110, startY, 86, 30)

    doc.setFontSize(11)
    doc.setTextColor(0)

    doc.text(`Subtotal: Rs. ${subtotal.toFixed(2)}`, 115, startY + 8)
    doc.text(`Discount: Rs. ${totalDiscount.toFixed(2)}`, 115, startY + 15)
    doc.text(`GST: Rs. ${totalGST.toFixed(2)}`, 115, startY + 22)

    doc.setFontSize(13)
    doc.setTextColor(15, 111, 115)
    doc.text(`Grand Total: Rs. ${grandTotal.toFixed(2)}`, 115, startY + 30)

    /* ================= SAVE & SHARE ================= */
    const fileName = `Quotation-${quotation.quotation_number}.pdf`
    const pdfOutput = doc.output("datauristring")

    await Filesystem.writeFile({
      path: fileName,
      data: pdfOutput.split(",")[1],
      directory: Directory.Documents
    })

    const fileUri = await Filesystem.getUri({
      directory: Directory.Documents,
      path: fileName
    })

    await Share.share({
      title: "Share Quotation",
      text: "Please find attached quotation.",
      url: fileUri.uri
    })

  } catch (error) {
    console.error("Share Error:", error)
  }
  
}

function convertBlobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      resolve(reader.result.split(',')[1])
    }
    reader.readAsDataURL(blob)
  })
}
/* ================= PRINT FUNCTION ================= */

const printQuotation = (quotation) => {

  if (!company.value) {
    alert("Company details not loaded")
    return
  }

  const printWindow = window.open("", "_blank")

  printWindow.document.write(`
    <html>
      <head>
        <title>Quotation ${quotation.quotation_number}</title>
        <style>
          body { font-family: Arial; padding: 30px; }
          .header { border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
          .company-name { font-size: 22px; font-weight: bold; }
          .meta { margin-top: 15px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; }
          th { background: #f2f2f2; }
          .right { text-align: right; }
          .total-section { margin-top: 20px; width: 320px; float: right; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .grand { font-size: 18px; font-weight: bold; }
          .footer { margin-top: 60px; text-align: right; }
        </style>
      </head>
      <body>

        <!-- ================= COMPANY HEADER ================= -->
        <div class="header">
          <div class="company-name">${company.value.company_name}</div>
          <div>${company.value.address || ''}</div>
          <div>Phone: ${company.value.phone || ''}</div>
          <div>Email: ${company.value.email || ''}</div>
          <div>GST No: ${company.value.gst_number || ''}</div>
        </div>

        <!-- ================= QUOTATION INFO ================= -->
        <div class="meta">
          <div><strong>Quotation No:</strong> ${quotation.quotation_number}</div>
          <div><strong>Customer:</strong> ${quotation.customer_name}</div>
          <div><strong>Date:</strong> ${new Date(quotation.created_at).toLocaleDateString()}</div>
        </div>

        <!-- ================= ITEMS TABLE ================= -->
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${
              quotation.items && quotation.items.length
              ? quotation.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.qty}</td>
                  <td>Rs. ${Number(item.price).toFixed(2)}</td>
                 <td>Rs. ${
  (() => {
    const base = item.qty * item.price
    const discount = base * ((item.discount || 0) / 100)
    const afterDiscount = base - discount
    const gst = afterDiscount * ((item.gst || 0) / 100)
    return (afterDiscount + gst).toFixed(2)
  })()
}</td>
                </tr>
              `).join("")
              : `<tr><td colspan="4">No items found</td></tr>`
            }
          </tbody>
        </table>

        <!-- ================= TOTALS ================= -->
        <div class="total-section">
          <div class="total-row">
            <span>Subtotal</span>
            <span>Rs. ${Number(quotation.subtotal || 0).toFixed(2)}</span>
          </div>

          <div class="total-row">
            <span>Discount</span>
            <span>- Rs. ${Number(quotation.discount_amount || 0).toFixed(2)}</span>
          </div>

          <div class="total-row">
            <span>GST</span>
            <span>Rs. ${Number(quotation.gst_amount || 0).toFixed(2)}</span>
          </div>

          <div class="total-row grand">
            <span>Grand Total</span>
            <span>Rs. ${Number(quotation.grand_total).toFixed(2)}</span>
          </div>
        </div>

        <!-- ================= SIGNATURE ================= -->
      

      </body>
    </html>
  `)

  printWindow.document.close()
 setTimeout(() => {
  printWindow.print()
}, 500)
}

/* ================= FILTER HELPERS ================= */

const filterByDays = (days) => {
  const now = new Date()
  const pastDate = new Date()
  pastDate.setDate(now.getDate() - days)

  return quotations.value.filter(q => {
    const created = new Date(q.created_at)
    return created >= pastDate
  })
}

/* ================= TOTALS ================= */

const totalAll = computed(() =>
  quotations.value.reduce((sum, q) => sum + Number(q.grand_total), 0)
)

const totalWeek = computed(() =>
  filterByDays(7).reduce((sum, q) => sum + Number(q.grand_total), 0)
)

const totalMonth = computed(() =>
  filterByDays(30).reduce((sum, q) => sum + Number(q.grand_total), 0)
)

const totalThreeMonths = computed(() =>
  filterByDays(90).reduce((sum, q) => sum + Number(q.grand_total), 0)
)

const totalSixMonths = computed(() =>
  filterByDays(180).reduce((sum, q) => sum + Number(q.grand_total), 0)
)

const totalYear = computed(() =>
  filterByDays(365).reduce((sum, q) => sum + Number(q.grand_total), 0)
)

</script>

<style scoped>

/* ================= LIST ITEM ================= */

.list-item {
  background: #ffffff;
  padding: 18px;
  border-radius: 16px;
  margin-bottom: 14px;
  transition: all 0.25s ease;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  border: 1px solid #f0f0f0;
}

.list-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}

/* ================= TOP ROW ================= */

.top-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 500;
}

.amount {
  color: #0F6F73;
  font-weight: 700;
  font-size: 12px;
}

/* ================= CUSTOMER + DATE ================= */

.customer {
  margin-top: 6px;
  font-size: 14px;
  color: #444;
}

.date {
  margin-top: 4px;
  font-size: 12px;
  color: #888;
}

/* ================= EMPTY ================= */

.empty {
  text-align: center;
  margin-top: 40px;
  color: #999;
  font-size: 14px;
}

/* ================= SUMMARY ================= */

.summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 22px;
}

.summary-card {
  background: #ffffff;
  padding: 14px;
  border-radius: 14px;
  font-size: 13px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.04);
  border: 1px solid #f1f1f1;
  transition: 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.summary-card strong {
  display: block;
  margin-top: 6px;
  font-size: 16px;
  color: #0F6F73;
}

/* ================= ACTION ROW ================= */

.action-row {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

/* ================= VIEW BUTTON ================= */

.view-btn {
  background: linear-gradient(135deg, #0F6F73, #138b91);
  color: white;
  border: none;
  padding: 6px 14px;
  font-size: 13px;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.2s ease;
  font-weight: 500;
}

.view-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(15, 111, 115, 0.4);
}

/* ================= TOTAL BORDER ================= */

.total {
  border: 1.5px dashed #0F6F73;
  background: #f6fbfb;
}

/* ================= ICON BUTTONS ================= */

.whatsapp-btn,
.share-btn {
  border: none;
  padding: 6px 10px;
  background-color: transparent;
  margin-left: 8px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  transition: 0.2s ease;
}

.whatsapp-btn:hover,
.share-btn:hover {
  transform: scale(1.1);
}

.wa-icon {
  font-size: 15px;
}

/* ================= PRINT STYLES ================= */

body {
  font-family: Arial, sans-serif;
  padding: 15px;
  font-size: 14px;
  background: #f9f9f9;
}

table {
  width: 100%;
  font-size: 13px;
  border-collapse: collapse;
}

table th {
  background: #0F6F73;
  color: white;
  padding: 8px;
  text-align: left;
}

table td {
  padding: 8px;
  border-bottom: 1px solid #e5e5e5;
}

.total-section {
  width: 100%;
  float: none;
  margin-top: 20px;
  padding: 12px;
  border-radius: 10px;
  background: #fafafa;
  border: 1px solid #eaeaea;
}

/* ================= LATEST QUOTATION HIGHLIGHT ================= */

.latest-quotation {
  border: 2px solid #0F6F73;
  background: #e6f7f8;
  animation: highlightPulse 1.5s ease-in-out infinite alternate;
}

@keyframes highlightPulse {
  from {
    box-shadow: 0 0 6px rgba(15, 111, 115, 0.2);
  }
  to {
    box-shadow: 0 0 18px rgba(15, 111, 115, 0.6);
  }
}

/* ================= PRINT MEDIA ================= */

@media print {
  body {
    font-size: 12px;
    background: white;
  }

  .view-btn,
  .whatsapp-btn,
  .share-btn {
    display: none;
  }

  .list-item {
    box-shadow: none;
    border: 1px solid #ddd;
  }
}

</style>