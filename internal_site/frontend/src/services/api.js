import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Danh sách các route công khai (không cần token)
const publicRoutes = ['/menu', '/auth/login', '/auth/register'];

// Interceptor thêm token nếu không phải route công khai
api.interceptors.request.use((config) => {
  const isPublicRoute = publicRoutes.some((route) =>
    config.url?.startsWith(route)
  );

  if (!isPublicRoute) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor xử lý lỗi phản hồi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status, config } = error.response || {};

    const isPublicRoute = publicRoutes.some((route) =>
      config?.url?.startsWith(route)
    );

    // Chỉ logout nếu đang ở route riêng tư và lỗi là 401 hoặc 403
    if (!isPublicRoute && (status === 401 || status === 403)) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);



export default {
  getAllUsers() {
    return api.get("/users");
  },
  getDeletedUsers() {
    return api.get("/users/deleted");
  },
  getUser(id) {
    return api.get(`/users/${id}`);
  },
  createUser(userData, config = {}) {
    return api.post("/users/", userData, config);
  },
  updateUser(id, userData, config = {}) {
    return api.put(`/users/${id}`, userData, config);
  },
  deleteUser(id) {
    return api.delete(`/users/${id}`);
  },
  restoreUser(id) {
    return api.post(`/users/restore/${id}`);
  },
  login(credentials) {
    return api.post("/auth/login", credentials);
  },
  changePassword(passwordData) {
    return api.post("/users/change-password", passwordData);
  },
  getDashboardStats(params = {}) {
    return api.get("/dashboard/", { params });
  },
  approveUser(id) {
    return api.put(`/users/approve/${id}`);
  },
  rejectUser(id) {
    return api.put(`/users/reject/${id}`);
  },
  registerUser(userData) {
    return api.post("/auth/register", userData);
  },
  // getMenu(params = {}) {
  //   return api.get("/menu", { params });
  // },
  // createMenuItem(menuData, config = {}) {
  //   return api.post("/menu", menuData, config);
  // },
  // updateMenuItem(id, menuData, config = {}) {
  //   return api.patch(`/menu/${id}`, menuData, config);
  // },
  // deleteMenuItem(id) {
  //   return api.delete(`/menu/${id}`);
  // },
};
