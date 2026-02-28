<template>
  <BaseLayout :title="$t('quotationList')">

    <!-- ================= SUMMARY ================= -->
    <div class="summary">
      
      <div class="summary-card total">
        <div>{{ $t('totalAll') }}</div>
   <strong>{{ currencySymbol }} {{ totalAll.toFixed(2) }}</strong>
      </div>

      <div class="summary-card">
        <div>{{ $t('thisMonth') }}</div>
        <strong>{{ currencySymbol }} {{ totalMonth.toFixed(2) }}</strong>
      </div>

      <div class="summary-card">
        <div>{{ $t('lastSixMonths') }}</div>
        <strong>{{ currencySymbol }}  {{ totalSixMonths.toFixed(2) }}</strong>
      </div>

      <div class="summary-card">
        <div>{{ $t('lastOneYear') }}</div>
        <strong>{{ currencySymbol }}  {{ totalYear.toFixed(2) }}</strong>
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
          {{ currencySymbol }}  {{ Number(quotation.grand_total).toFixed(2) }}
        </span>
      </div>

      <div class="customer">
        {{ quotation.customer_name }}
      </div>

      <div class="date">
        {{ new Date(quotation.created_at).toLocaleDateString() }}
      </div>

      <!-- ACTION BUTTON -->
     <!-- ACTION BUTTONS -->
<div class="action-row">

  <!-- VIEW BUTTON -->
<button 
  class="view-btn" 
  :disabled="loadingViewId === quotation.id"
  @click="viewQuotation(quotation.id)"
>
  <span v-if="loadingViewId === quotation.id">
    Loading...
  </span>
  <span v-else>
   <i class="fa fa-eye" style="font-size:13px"></i> View
  </span>
</button>

  <!-- SHARE BUTTON -->
  <button class="share-btn" @click="shareQuotation(quotation.id)">
    <ShareIcon style="width:22px; color:var(--primary);" />
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
import { Capacitor } from '@capacitor/core'

import { FileOpener } from '@capacitor-community/file-opener'
const companyLogo = ref(null)
const companyQr = ref(null)
const loadingViewId = ref(null)
const token = localStorage.getItem("token")
const quotations = ref([])
const company = ref(null)
const currencySymbols = {
  INR: "INR",
  USD: "$",
  EUR: "€",
  JPY: "¥"
}
/* ================= FETCH ================= */

const currencySymbol = computed(() => {
  if (!company.value || !company.value.currency) {
    return "INR" // fallback
  }

  return currencySymbols[company.value.currency] || "INR"
})

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

    try {
      const logoRes = await api.get('/company/logo')
      companyLogo.value = logoRes.data.base64
    } catch (e) {}

    try {
      const qrRes = await api.get('/company/qr')
      companyQr.value = qrRes.data.base64
    } catch (e) {}

  } catch (error) {
    console.error("Error loading company", error)
  }
}
onMounted(() => {
  fetchQuotations()
  fetchCompany()
})
const getBase64FromUrl = async (url) => {

  const fetchResponse = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const blob = await fetchResponse.blob()

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
}

const generateQuotationPDF = async (quotationId) => {
  if (!company.value) {
    alert("Company not loaded")
    return
  }

  const response = await api.get(`/quotations/${quotationId}`)
  const quotation = response.data

  const doc = new jsPDF()

  // ================= LOGO =================
if (companyLogo.value) {
  doc.addImage(companyLogo.value, 'PNG', 18, 18, 18, 18)
}

  // ================= OUTER BORDER =================
  doc.setDrawColor(0)
  doc.setLineWidth(0.8)
  doc.roundedRect(5, 5, 200, 287, 3, 3)

  let startY = 20

  const primaryColor = [15, 111, 115]
  const darkGray = [60, 60, 60]
  const borderColor = [200, 200, 200]

  doc.setFont("helvetica", "normal")
  doc.setTextColor(...darkGray)

  // ================= HEADER =================

  doc.setDrawColor(...borderColor)
  doc.setLineWidth(0.5)
  doc.roundedRect(10, 10, 190, 45, 3, 3, "S")

  doc.setDrawColor(220)
  doc.setLineWidth(0.4)
  doc.roundedRect(14, 14, 110, 37, 2, 2, "S")

  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...primaryColor)
  doc.text(company.value.company_name || "", 40, 24)

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(80)
  doc.text(company.value.address || "", 40, 30)
  doc.text(`Phone: ${company.value.phone || ""}`, 40, 35)
  doc.text(`Email: ${company.value.email || ""}`, 40, 40)

  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...primaryColor)
  doc.text("QUOTATION", 140, 25)

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(80)
  doc.text(`Quotation No: ${quotation.quotation_number}`, 140, 33)
  doc.text(
    `Date: ${new Date(quotation.created_at).toLocaleDateString()}`,
    140,
    38
  )

  startY = 75

  // ================= CUSTOMER + TAX =================

  const sectionTopY = startY
  const boxPadding = 6
  const lineHeight = 6
  const gapBetweenBoxes = 6

  const contentHeight = 10 + (4 * lineHeight)
  const boxHeight = contentHeight + (boxPadding * 2)

  const totalWidth = 190
  const singleBoxWidth = (totalWidth - gapBetweenBoxes) / 2

  const leftBoxX = 10
  const rightBoxX = 10 + singleBoxWidth + gapBetweenBoxes

  doc.setDrawColor(200)
  doc.setLineWidth(0.5)
  doc.roundedRect(leftBoxX, sectionTopY - boxPadding, singleBoxWidth, boxHeight, 3, 3, "S")
  doc.roundedRect(rightBoxX, sectionTopY - boxPadding, singleBoxWidth, boxHeight, 3, 3, "S")

  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...primaryColor)
  doc.text("Customer Details", leftBoxX + 4, sectionTopY + 2)
  doc.text("Company Tax Details", rightBoxX + 4, sectionTopY + 2)

  let contentYLeft = sectionTopY + 10
  let contentYRight = sectionTopY + 10

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(60)

  const customer = quotation.customer || {}
  doc.text(`Name: ${customer.customer_name || ""}`, leftBoxX + 4, contentYLeft); contentYLeft += lineHeight
  doc.text(`Company: ${customer.company_name || ""}`, leftBoxX + 4, contentYLeft); contentYLeft += lineHeight
  doc.text(`Phone: ${customer.phone || ""}`, leftBoxX + 4, contentYLeft); contentYLeft += lineHeight
  doc.text(`Email: ${customer.email || ""}`, leftBoxX + 4, contentYLeft)

  doc.text(`GST No: ${company.value.gst_number || ""}`, rightBoxX + 4, contentYRight); contentYRight += lineHeight
  doc.text(`PAN No: ${company.value.pan_number || ""}`, rightBoxX + 4, contentYRight)

  startY = sectionTopY + boxHeight + 12

  // ================= ITEMS TABLE =================

  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...primaryColor)
  doc.text("Item Details", 14, startY)

  startY += 8

  doc.setFillColor(...primaryColor)
  doc.rect(14, startY - 6, 182, 10, "F")

  doc.setTextColor(255)
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")

  doc.text("S.No", 16, startY)
  doc.text("Product", 26, startY)
  doc.text("Qty", 85, startY, { align: "right" })
  doc.text("Unit", 100, startY, { align: "right" })
  doc.text(`Price (${currencySymbol.value})`, 120, startY, { align: "right" })
  doc.text("Disc%", 145, startY, { align: "right" })
  doc.text("GST%", 165, startY, { align: "right" })
  doc.text(`Total (${currencySymbol.value})`, 185, startY, { align: "right" })

  startY += 10

  doc.setFont("helvetica", "normal")
  doc.setTextColor(50)
  doc.setFontSize(9)

  quotation.items.forEach((item, index) => {

    doc.setDrawColor(220)
    doc.rect(14, startY - 5, 182, 8)

    doc.text(String(index + 1), 16, startY)
    doc.text(String(item.product_name), 26, startY)
    doc.text(String(item.quantity), 85, startY, { align: "right" })
    doc.text(String(item.unit || "-"), 100, startY, { align: "right" })
  doc.text(`${Number(item.price).toFixed(2)}`, 120, startY, { align: "right" })
doc.text(`${Number(item.discount_percent || 0)}%`, 145, startY, { align: "right" })
doc.text(`${Number(item.gst_percent || 0)}%`, 165, startY, { align: "right" })
doc.text(`${Number(item.total || 0).toFixed(2)}`, 185, startY, { align: "right" })

    startY += 8

    if (startY > 270) {
      doc.addPage()
      startY = 20
    }
  })

  // ================= PAYMENT + QR + GRAND TOTAL =================

  startY += 10

  const gtValue = Number(quotation.grand_total || 0)
  const gtWords = numberToWords(Math.floor(gtValue))

  const paymentBoxStartY = startY
  const paymentLeftMargin = 14
  const paymentOuterWidth = 181
  const paymentPadding = 6

  doc.setFont("helvetica", "bold")
  doc.setTextColor(...primaryColor)
  doc.setFontSize(11)
  doc.text("Payment Details", paymentLeftMargin + paymentPadding, startY)

  startY += 8

  doc.setFont("helvetica", "normal")
  doc.setTextColor(60)
  doc.setFontSize(10)

  doc.text(`UPI ID: ${company.value.upi_id || ""}`, paymentLeftMargin + paymentPadding, startY); startY += 6
  doc.text(`Bank: ${company.value.bank_name || ""}`, paymentLeftMargin + paymentPadding, startY); startY += 6
  doc.text(`Account No: ${company.value.account_number || ""}`, paymentLeftMargin + paymentPadding, startY); startY += 6
  doc.text(`IFSC: ${company.value.ifsc_code || ""}`, paymentLeftMargin + paymentPadding, startY)

  const grandTotalBoxYPosition = paymentBoxStartY + 5

  doc.setFillColor(...primaryColor)
  doc.roundedRect(115, grandTotalBoxYPosition, 80, 35, 3, 3, "F")

if (companyQr.value) {
  const qrSize = 30
  const qrX = 115 - qrSize - 10
  const qrY = grandTotalBoxYPosition

  doc.setFillColor(255, 255, 255)
  doc.rect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, "F")
  doc.addImage(companyQr.value, 'PNG', qrX, qrY, qrSize, qrSize)

  doc.setFontSize(8)
  doc.setTextColor(80)
  doc.text("Scan to Pay", qrX + 5, qrY + qrSize + 5)
}

  doc.setTextColor(255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.text(`Grand Total (${currencySymbol.value})`, 120, grandTotalBoxYPosition + 10)

  doc.setFontSize(14)
  doc.text(`${gtValue.toFixed(2)}`, 120, grandTotalBoxYPosition + 20)

  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  const wrappedAmountWords = doc.splitTextToSize(
    `Amount in Words: ${gtWords}`,
    70
  )
  doc.text(wrappedAmountWords, 120, grandTotalBoxYPosition + 28)

  const paymentSectionHeight =
    Math.max(startY - paymentBoxStartY, 45) + paymentPadding

  doc.setDrawColor(200)
  doc.roundedRect(
    paymentLeftMargin,
    paymentBoxStartY - paymentPadding,
    paymentOuterWidth,
    paymentSectionHeight,
    4,
    4
  )

  startY = paymentBoxStartY + paymentSectionHeight + 8

  // ================= TERMS =================

  const termsTopY = startY
  const leftMargin = 14
  const boxWidth = 181
  const padding = 6

  doc.setFont("helvetica", "bold")
  doc.setTextColor(...primaryColor)
  doc.text("Terms & Conditions", leftMargin + padding, startY)

  startY += 8

  doc.setFont("helvetica", "normal")
  doc.setTextColor(80)

  const termsText = company.value?.terms || "GST will be charged as applicable"
  const termsArray = termsText.split('\n')

  termsArray.forEach((term, index) => {
    const line = `${index + 1}. ${term.trim()}`
    doc.text(line, leftMargin + padding, startY)
    startY += 6
  })

  const boxHeighttc = startY - termsTopY + padding

  doc.setDrawColor(200)
  doc.roundedRect(
    leftMargin,
    termsTopY - padding,
    boxWidth,
    boxHeighttc,
    4,
    4
  )

  // ================= FOOTER =================

  const pageCount = doc.getNumberOfPages()

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(9)
    doc.setTextColor(150)

    const part1 = "Generated by "
    const part2 = "SmartQuote"
    const part3 = ` | Page ${i} of ${pageCount}`

    const y = 290

    doc.setFont(undefined, "normal")
    const width1 = doc.getTextWidth(part1)

    doc.setFont(undefined, "bold")
    const width2 = doc.getTextWidth(part2)

    doc.setFont(undefined, "normal")
    const width3 = doc.getTextWidth(part3)

    const totalWidth = width1 + width2 + width3
    const pageWidth = doc.internal.pageSize.getWidth()
    let startX = (pageWidth - totalWidth) / 2

    doc.setFont(undefined, "normal")
    doc.text(part1, startX, y)
    startX += width1

 doc.setFont(undefined, "bold")
doc.textWithLink(part2, startX, y, {
  url: "https://archenterprises.co.in/"
})
    startX += width2

    doc.setFont(undefined, "normal")
    doc.text(part3, startX, y)
  }

  return { doc, quotation }
}

const shareQuotation = async (quotationId) => {
  try {
    const { doc } = await generateQuotationPDF(quotationId)

    const pdfBase64 = doc.output('datauristring').split(',')[1]

    await Filesystem.writeFile({
      path: 'Quotation.pdf',
      data: pdfBase64,
      directory: Directory.Documents
    })

    const file = await Filesystem.getUri({
      directory: Directory.Documents,
      path: 'Quotation.pdf'
    })

    // 🔥 IMPORTANT: use file.uri directly
    await Share.share({
      title: 'Quotation',
      text: 'Please find attached quotation.',
      files: [file.uri]   // ✅ THIS IS THE FIX
    })

  } catch (error) {
    console.error(error)
  }
}

const viewQuotation = async (quotationId) => {
  try {
    loadingViewId.value = quotationId

    const { doc } = await generateQuotationPDF(quotationId)

    const pdfBase64 = doc.output('datauristring').split(',')[1]
    const fileName = `Preview-${quotationId}.pdf`

    // 🔥 Request permission (important for Android)
    await Filesystem.requestPermissions()

    await Filesystem.writeFile({
      path: fileName,
      data: pdfBase64,
      directory: Directory.Documents
    })

    const file = await Filesystem.getUri({
      directory: Directory.Documents,
      path: fileName
    })

    await FileOpener.open({
      filePath: file.uri,
      contentType: 'application/pdf'
    })

  } catch (error) {
    console.error("Error viewing quotation:", error)
  } finally {
    loadingViewId.value = null
  }
}
function numberToWords(num) {

  if (num === null || num === undefined) return ""

  num = Number(num)

  if (isNaN(num)) return ""

  const integerPart = Math.floor(Math.abs(num))

  if (integerPart === 0) return "Zero Only"

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six',
    'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
    'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ]

  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty',
    'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ]

  function convertHundreds(n) {
    let str = ''

    if (n > 99) {
      str += ones[Math.floor(n / 100)] + ' Hundred '
      n = n % 100
    }

    if (n > 19) {
      str += tens[Math.floor(n / 10)] + ' '
      n = n % 10
    }

    if (n > 0) {
      str += ones[n] + ' '
    }

    return str
  }

  let result = ''

  if (integerPart >= 10000000) {
    result += convertHundreds(Math.floor(integerPart / 10000000)) + 'Crore '
  }

  if (integerPart >= 100000) {
    result += convertHundreds(Math.floor((integerPart / 100000) % 100)) + 'Lakh '
  }

  if (integerPart >= 1000) {
    result += convertHundreds(Math.floor((integerPart / 1000) % 100)) + 'Thousand '
  }

  result += convertHundreds(integerPart % 1000)

  return result.trim() + ' Only'
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
    <td>${item.product_name}</td>
    <td>${item.quantity}</td>
    <td>${currencySymbol.value} ${Number(item.price).toFixed(2)}</td>
    <td>${currencySymbol.value} ${Number(item.total).toFixed(2)}</td>
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
            <span>${currencySymbol.value} ${Number(quotation.subtotal || 0).toFixed(2)}</span>
          </div>

          <div class="total-row">
            <span>Discount</span>
            <span>- ${currencySymbol.value} ${Number(quotation.total_discount_amount || 0).toFixed(2)}</span>
          </div>

          <div class="total-row">
            <span>GST</span>
            <span>${currencySymbol.value} ${Number(quotation.total_gst_amount || 0).toFixed(2)}</span>
          </div>

          <div class="total-row grand">
            <span>Grand Total</span>
            <span>${currencySymbol.value} ${Number(quotation.grand_total).toFixed(2)}</span>
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
  font-weight: 500; color: var(--primary);
}

.amount {
  color: var(--primary);
  font-weight: 700;
  font-size: 12px;
}

/* ================= CUSTOMER + DATE ================= */

.customer {
  margin-top: 6px;
  font-size: 14px;
  color: var(--primary);
}

.date {
  margin-top: 4px;
  font-size: 12px;
  color: var(--primary);
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
   color: var(--primary);
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
  color: var(--primary);
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
  background: var(--primary);
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
  border: 1.5px dashed var(--primary);
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
  background: var(--primary);
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
  border: 2px solid var(--primary);
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