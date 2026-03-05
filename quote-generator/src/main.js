import './assets/main.css'
import { StatusBar } from '@capacitor/status-bar'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { App as CapacitorApp } from '@capacitor/app'
import i18n from "./i18n"
import '@fortawesome/fontawesome-free/css/all.min.css'

const app = createApp(App)

app.use(router)
app.use(i18n)
app.mount('#app')

StatusBar.setOverlaysWebView({ overlay: true })

// ✅ Handle Android Back Button
CapacitorApp.addListener('backButton', () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    CapacitorApp.exitApp()
  }
})

/* =====================================
   🔥 ADD THIS PART FOR GOOGLE LOGIN
===================================== */

CapacitorApp.addListener('appUrlOpen', async (event) => {
  if (event.url.includes('login-success')) {
    const url = new URL(event.url)
    const token = url.searchParams.get('token')

    if (token) {
      localStorage.setItem('token', token)

      // small delay to ensure router is ready
      setTimeout(() => {
        router.replace('/home')
      }, 300)
    }
  }
})