import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import messages from './locales'

// Tạo instance i18n
const i18n = createI18n({
  locale: 'vi', // Ngôn ngữ mặc định
  fallbackLocale: 'vi', // Ngôn ngữ dự phòng
  messages,
  legacy: false // Sử dụng Composition API
})

const app = createApp(App)

app.use(router)
app.use(i18n)
app.mount('#app')