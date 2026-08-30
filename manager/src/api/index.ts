import axios from "axios"
import { getApiUrl } from "@/src/config/environment"

export const TOKEN_KEY = "COGNI_CASH_TOKEN"
export const USER_EMAIL_KEY = "COGNI_CASH_EMAIL"
export const WHITELABEL_KEY = "COGNI_CASH_WHITELABEL_ID"
export const WHITELABEL_HEADER = "x-whitelabel-id"

const api = axios.create()

api.interceptors.request.use(async (config) => {
  config.baseURL = getApiUrl()

  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    const whitelabelId = localStorage.getItem(WHITELABEL_KEY)
    if (whitelabelId) {
      config.headers[WHITELABEL_HEADER] = whitelabelId
    }
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== "undefined" &&
      error.response?.status === 401
    ) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_EMAIL_KEY)
      window.dispatchEvent(new Event("cogni-cash:unauthorized"))
    }

    return Promise.reject(error)
  },
)

export default api
