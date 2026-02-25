import axios from "axios"

const api = axios.create({
  baseURL: "https://products.archenterprises.co.in/api",
  headers: {
    Accept: "application/json"
  }
})

// 🔐 Attach Sanctum token automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api