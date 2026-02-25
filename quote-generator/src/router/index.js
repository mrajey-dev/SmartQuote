import { createRouter, createWebHistory } from "vue-router"
import AuthView from "../views/AuthView.vue"
import HomeView from "../views/HomeView.vue"
import CompanyDetailsView from "../views/CompanyDetailsView.vue"
import CustomersView from "../views/CustomersView.vue"
import GenerateQuotationView from "../views/GenerateQuotationView.vue"
import QuotationListView from "../views/QuotationListView.vue"
import GenerateInvoiceView from "../views/GenerateInvoiceView.vue"
import StockManagementView from "../views/StockManagementView.vue"

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

router.beforeEach((to, from, next) => {

  const token = localStorage.getItem("token")

  // If route requires login
  if (to.meta.requiresAuth && !token) {
    return next("/")
  }

  // If already logged in and trying to go to login page
  if (to.meta.guestOnly && token) {
    return next("/home")
  }

  next()
})

export default router