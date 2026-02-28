import { createRouter, createWebHistory } from "vue-router"
import AuthView from "../views/AuthView.vue"
import HomeView from "../views/HomeView.vue"
import CompanyDetailsView from "../views/CompanyDetailsView.vue"
import CustomersView from "../views/CustomersView.vue"
import GenerateQuotationView from "../views/GenerateQuotationView.vue"
import QuotationListView from "../views/QuotationListView.vue"
import GenerateInvoiceView from "../views/GenerateInvoiceView.vue"
import StockManagementView from "../views/StockManagementView.vue"
import axios from "axios"
const API = "https://products.archenterprises.co.in/api"
const routes = [
  { 
    path: "/", 
    component: AuthView,
    meta: { guestOnly: true }
  },
{
  path: "/change-password",
  component: () => import("@/views/ChangePassword.vue")
},
  { 
    path: "/home",
    component: HomeView,
    meta: { requiresAuth: true }
  },

  { 
    path: "/company",
    component: CompanyDetailsView,
    meta: { requiresAuth: true }
  },

  { 
    path: "/customers",
    component: CustomersView,
    meta: { requiresAuth: true }
  },

  { 
    path: "/generate",
    component: GenerateQuotationView,
    meta: { requiresAuth: true }
  },

  { 
    path: "/invoice",
    component: GenerateInvoiceView,
    meta: { requiresAuth: true }
  },

  { 
    path: "/quotations",
    component: QuotationListView,
    meta: { requiresAuth: true }
  },

  { 
    path: "/stock",
    component: StockManagementView,
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/* ===========================
   ROUTE GUARD
=========================== */

router.beforeEach(async (to, from, next) => {

  const token = localStorage.getItem("token")

  // If route requires authentication
  if (to.meta.requiresAuth) {

    if (!token) {
      return next("/")
    }

    try {
      await axios.get(API + "/user", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      return next()

    } catch (error) {
      localStorage.clear()
      return next("/")
    }
  }

  // If route is only for guests (login page)
  if (to.meta.guestOnly) {

    if (!token) {
      return next()
    }

    try {
      await axios.get(API + "/user", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      return next("/home")

    } catch (error) {
      localStorage.clear()
      return next()
    }
  }

  next()
})

export default router