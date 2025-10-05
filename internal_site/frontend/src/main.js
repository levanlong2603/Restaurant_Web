import { createApp } from 'vue';
import App from './App.vue'; // Đường dẫn trực tiếp trong src/
import router from './router'; // Đường dẫn trực tiếp trong src/router/
import '@fortawesome/fontawesome-free/css/all.css'; // Thêm Font Awesome

const app = createApp(App);
app.use(router);
app.mount('#app');