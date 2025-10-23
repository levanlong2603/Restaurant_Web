import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import messages from './locales'

const initialLang = localStorage.getItem('lang') || 'vi'

const i18n = createI18n({
  locale: initialLang, // Ngôn ngữ mặc định (từ localStorage nếu có)
  fallbackLocale: 'en', // Ngôn ngữ dự phòng
  messages,
  legacy: false, // Sử dụng Composition API
  globalInjection: true, // Inject $t globally
  allowComposition: true // Cho phép sử dụng composition API
})

// Lắng nghe sự kiện thay đổi ngôn ngữ
window.addEventListener('lang-changed', (e) => {
  const newLang = e && e.detail
  if (newLang && i18n.global) {
    try {
      i18n.global.locale.value = newLang
    } catch (err) {
      i18n.global.locale = newLang
    }
    localStorage.setItem('lang', newLang)
  }
})

const app = createApp(App)
app.use(router)
app.use(i18n)
app.mount('#app')