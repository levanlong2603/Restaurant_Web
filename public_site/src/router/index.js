// Điều hướng
import { createRouter, createWebHistory } from 'vue-router';
import AboutUs from '../pages/AboutUs.vue';
import Menu from '../pages/Menu.vue';
import Reservation from '../pages/Reservation.vue';
import Contact from '../pages/Contact.vue';

const routes = [
  { path: '/', component: AboutUs },
  { path: '/menu', component: Menu },
  { path: '/reservation', component: Reservation },
  { path: '/contact', component: Contact },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;