import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import DashboardManagement from "../views/admin/DashboardManagement.vue";
import UsersManagement from "../views/admin/UsersManagement.vue";
import MenuManagement from "../views/admin/MenuManagement.vue";
import Table from "../components/Table.vue";
import Header from "../components/Header.vue";
import Reserve from "../views/staff/Reserve.vue";
import Order from "../views/staff/Order.vue";
import ReserverNotification from "../views/staff/ReserveNotification.vue";
import ReservationBox from "../components/PaymentDetail.vue";
import UserProfile from "../views/UserProfile.vue";
import Checkout from "../views/staff/Checkout.vue";
import InvoiceManagement from "../views/staff/InvoiceManagement.vue";

const routes = [
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/table", component: Table },
  { path: "/", redirect: "/login" },
  { path: "/notification", component: ReserverNotification },
  {
    path: "/manager",
    meta: { requiresAuth: true, requiresManager: true },
    children: [
      { path: "", redirect: "manager/users" }, // Redirect mặc định
      {
        path: "users",
        name: "UsersManagement",
        component: UsersManagement,
      },
      {
        path: "menu",
        name: "MenuManagement",
        component: MenuManagement,
      },
      {
        path: "dashboard",
        name: "Dashboard",
        component: DashboardManagement,
      }
    ],
    meta: { requiresAuth: true, role: "manager" },
  },
  {
    path: '/staff',
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: 'user' }, // Redirect mặc định
      {
        path: 'notification',
        name: 'Notification',
        component: Notification,
      }
    ],
  },
  {
    path: "/header",
    component: Header,
  },
  {
    path: "/reserve",
    component: Reserve,
    meta: { requiresAuth: true, role: "staff" },
  },
  {
    path: "/order",
    component: Order,
    meta: { requiresAuth: true, role: "staff" },
  },
  {
    path: "/invoicemanagement",
    component: InvoiceManagement,
    meta: { requiresAuth: true, role: "staff" },
  },
  {
    path: "/user",
    component: UserProfile,
    meta: { requiresAuth: true },
  },
  {
    path: "/checkout",
    component: Checkout,
    meta: { requiresAuth: true, role: "staff" },
  },
  {
    path: "/payment",
    component: ReservationBox,
    meta: { requiresAuth: true, role: "staff" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userRole = user ? user.role : null;

  if (to.meta.requiresAuth) {
    if (!token) {
      return next("/login");
    }
    if (to.meta.role && to.meta.role !== userRole) {
      if (userRole === "manager") {
        return next("/manager");
      } else if (userRole === "staff") {
        return next("/reserve");
      } else {
        return next("/login");
      }
    }
  } else if (token && to.path === "/login") {
    // Nếu đã đăng nhập, không cho phép truy cập lại trang login
    if (userRole === "manager") {
      return next("/manager");
    } else if (userRole === "staff") {
      return next("/reserve");
    }
  }
  next();
});

export default router;
