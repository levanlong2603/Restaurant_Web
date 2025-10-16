import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import messages from './locales'

// Tạo instance i18n, khởi tạo từ localStorage nếu có
const initialLang = localStorage.getItem('lang') || 'vi'
const i18n = createI18n({
  locale: initialLang, // Ngôn ngữ mặc định
  fallbackLocale: 'vi', // Ngôn ngữ dự phòng
  messages,
  legacy: false // Sử dụng Composition API
})

// Lắng nghe sự kiện thay đổi ngôn ngữ toàn cục từ Header hoặc nơi khác
window.addEventListener('lang-changed', (e) => {
  const newLang = e && e.detail ? e.detail : null
  if (newLang && i18n && i18n.global) {
    // với legacy: false, locale là một ref reactive
    try {
      i18n.global.locale.value = newLang
    } catch (err) {
      // fallback nếu cấu trúc khác
      i18n.global.locale = newLang
    }
    localStorage.setItem('lang', newLang)
  }
})

const app = createApp(App)

app.use(router)
app.use(i18n)
app.mount('#app')