<template>
  <div class="admin-page" v-if="!isSidebarCollapsed">
    <aside class="sidebar">
      <div class="sidebar-header">
        <img src="@/assets/images/Logo.png" alt="Logo Nhà hàng Tinh Hoa Việt" class="sidebar-logo" />
        <h2>Quản lý <br> Tinh Hoa Việt</h2>
        <i class="fas fa-sliders" @click="toggleSidebar"></i>
      </div>
      <nav>
        <ul>
          <li v-if="hasRole('manager')" :class="{ active: $route.path === '/manager/dashboard' }">
            <router-link to="/manager/dashboard">
              <i class="fas fa-chart-line"></i> Thống kê
            </router-link>
          </li>
          <li v-if="hasRole('manager')" :class="{ active: $route.path === '/manager/users' }">
            <router-link to="/manager/users">
              <i class="fas fa-users"></i> Quản lý tài khoản
            </router-link>
          </li>
          <li v-if="hasRole('manager')" :class="{ active: $route.path === '/manager/menu' }">
            <router-link to="/manager/menu">
              <i class="fas fa-bars"></i> Quản lý menu
            </router-link>
          </li>
          <li :class="{ active: $route.path === '/user' }">
            <router-link to="/user">
              <i class="fa-solid fa-address-card"></i> Thông tin cá nhân
            </router-link>
          </li>
          <li v-if="hasRole('staff')" :class="{ active: $route.path === '/notification' }">
            <router-link to="/notification">
              <i class="fas fa-bell"></i>Quản lý đặt bàn
            </router-link>
          </li>
          <li v-if="hasRole('staff')" :class="{ active: $route.path === '/reserve' }">
            <router-link to="/reserve">
              <i class="fas fa-utensils"></i> Đặt bàn
            </router-link>
          </li>
          <li v-if="hasRole('staff')" :class="{ active: $route.path === '/order' }">
            <router-link to="/order">
              <i class="fas fa-utensils"></i> Gọi món
            </router-link>
          </li>
          <li v-if="hasRole('staff')" :class="{ active: $route.path === '/checkout' }">
            <router-link to="/checkout">
              <i class="fas fa-money-bill"></i> Thanh toán
            </router-link>
          </li>
          <li v-if="hasRole('staff')" :class="{ active: $route.path === '/invoicemanagement' }">
            <router-link to="/invoicemanagement">
              <i class="fas fa-money-bill"></i> Danh sách hóa đơn
            </router-link>
          </li>
          <li @click="confirmLogout">
            <span>
              <i class="fas fa-power-off"></i> Đăng xuất
            </span>
          </li>
        </ul>
      </nav>
    </aside>
  </div>

  <!-- Nút mở lại sidebar -->
  <div class="sidebar-toggle" v-if="isSidebarCollapsed" @click="toggleSidebar">
    <i class="fas fa-sliders"></i>
  </div>

  <!-- Page Tab -->
  <div class="page-tab" v-if="isSidebarCollapsed">
    <span>{{ getPageName }}</span>
  </div>
</template>

<script>
import Swal from 'sweetalert2';

export default {
  name: 'Manager',
  emits: ['sidebarToggle'],

  data() {
    return {
      isSidebarCollapsed: true, // Trạng thái sidebar
      user: JSON.parse(localStorage.getItem('user')) || {}, // Lấy thông tin user từ localStorage
    };
  },
  computed: {
    getPageName() {
      const path = this.$route.path;
      console.log('Trang hiện tại:', this.$route.path);
      switch (this.$route.path) {
        case '/manager/dashboard':
          return 'Thống kê';
        case '/manager/users':
          return 'QL người dùng';
        case '/manager/menu':
          return 'Menu';
        case '/user':
          return 'Profile';
        case '/notification':
          return 'Quản lý đặt bàn';
        case '/reserve':
          return 'Đặt bàn';
        case '/order':
          return 'Gọi món';
        case '/checkout':
          return 'Thanh toán';
        case '/invoicemanagement':
          return 'Danh sách hóa đơn';
        default:
          return '';
      }
    },
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
      this.$emit('sidebar-toggle', this.isSidebarCollapsed);
    },
    hasRole(roles) {
      if (!this.user || !this.user.role) return false;
      if (Array.isArray(roles)) {
        return roles.includes(this.user.role);
      }
      return this.user.role === roles;
    },
    async confirmLogout() {
      const result = await Swal.fire({
        title: 'Xác nhận đăng xuất',
        text: 'Bạn có chắc chắn muốn đăng xuất không?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Đăng xuất',
        cancelButtonText: 'Hủy',
        background: '#1a1a1a',
        color: '#ffffff',
        confirmButtonColor: '#ae9a64',
        cancelButtonColor: '#ff4d4d',
      });

      if (result.isConfirmed) {
        this.logout();
      }
    },
    logout() {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      this.$router.push('/login');
    },
  },
};
</script>

<style scoped>
.admin-page {
  display: flex;
  min-height: 100vh;
  background-color: transparent;
  color: #ffffff;
}

/* Sidebar */
.sidebar {
  width: 225px;
  background-color: #1a1a1a;
  padding: 20px;
  position: fixed;
  /* Cố định sidebar */
  top: 0;
  /* Đặt ở đầu trang */
  left: 0;
  /* Đặt ở bên trái */
  height: 100vh;
  /* Chiều cao toàn màn hình */
  overflow-y: auto;
  /* Cho phép cuộn nếu nội dung dài */
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  z-index: 100;
  /* Đảm bảo sidebar nằm trên các thành phần khác */
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
}

.sidebar-logo {
  max-width: 40px;
}

.sidebar-header h2 {
  font-size: 18px;
  color: #ae9a64;
  flex-grow: 1;
}

.sidebar-header i {
  cursor: pointer;
  color: #ae9a64;
  font-size: 18px;
}

.sidebar nav ul {
  list-style: none;
  padding: 0;
}

.sidebar nav ul li {
  padding: 10px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #bac9d3;
}

.sidebar nav ul li:hover,
.sidebar nav ul li.active {
  background-color: #ae9a64;
  color: #ffffff;
  border-radius: 5px;
}

.sidebar nav ul li a {
  color: #ffffff;
  text-decoration: none;
  font-size: 16px;
  padding-left: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sidebar nav ul li span {
  font-size: 16px;
  padding-left: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Nút mở lại sidebar */
.sidebar-toggle {
  position: fixed;
  left: 10px;
  top: 20px;
  background-color: #ae9a64;
  color: #ffffff;
  padding: 8px;
  border-radius: 5px;
  cursor: pointer;
  z-index: 20;
  transition: left 0.3s ease;
}

.sidebar-toggle i {
  font-size: 18px;
}

/* Page Tab (Thẻ đánh dấu) */
.page-tab {
  position: fixed;
  left: 0;
  top: 60px;
  background-color: #ae9a64;
  color: #ffffff;
  padding: 5px 15px;
  border-radius: 0 5px 5px 0;
  font-size: 14px;
  font-weight: bold;
  z-index: 10;
}

/* Icon Styles */
i {
  font-family: "FontAwesome" !important;
  color: #bac9d3;
}

.fa-chart-line,
.fa-users,
.fa-bars,
.fa-notifications,
.fa-power-off {
  color: #bac9d3;
  font-size: 20px;
  transition: transform 0.3s ease, color 0.3s ease;
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
    /* Ẩn sidebar trên màn hình nhỏ */
  }

  .main-layout,
  .main-container {
    margin-left: 0;
    /* Không cần margin trên màn hình nhỏ */
  }

  .sidebar-toggle {
    display: block;
    /* Hiển thị nút mở sidebar */
  }
}
</style>