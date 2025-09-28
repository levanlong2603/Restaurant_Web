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
        background: '#f8f8f8',
        color: '#333333',
        confirmButtonColor: '#c62828',
        cancelButtonColor: '#757575',
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
  color: #333333;
}

/* Sidebar */
.sidebar {
  width: 225px;
  background-color: #ffffff;
  padding: 20px;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  overflow-y: auto;
  transition: width 0.3s ease;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  border-right: 1px solid #e0e0e0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #c62828;
}

.sidebar-logo {
  max-width: 40px;
}

.sidebar-header h2 {
  font-size: 18px;
  color: #c62828;
  flex-grow: 1;
  font-weight: bold;
}

.sidebar-header i {
  cursor: pointer;
  color: #c62828;
  font-size: 18px;
  transition: transform 0.3s ease;
}

.sidebar-header i:hover {
  transform: rotate(90deg);
}

.sidebar nav ul {
  list-style: none;
  padding: 0;
}

.sidebar nav ul li {
  padding: 12px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #555555;
  margin-bottom: 5px;
  border-radius: 5px;
}

.sidebar nav ul li:hover {
  background-color: #ffebee;
  color: #c62828;
}

.sidebar nav ul li.active {
  background-color: #c62828;
  color: #ffffff;
}

.sidebar nav ul li a {
  color: inherit;
  text-decoration: none;
  font-size: 16px;
  padding-left: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.sidebar nav ul li span {
  font-size: 16px;
  padding-left: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

/* Nút mở lại sidebar */
.sidebar-toggle {
  position: fixed;
  left: 10px;
  top: 20px;
  background-color: #c62828;
  color: #ffffff;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  z-index: 20;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.sidebar-toggle:hover {
  background-color: #b71c1c;
  transform: scale(1.05);
}

.sidebar-toggle i {
  font-size: 18px;
}

/* Page Tab (Thẻ đánh dấu) */
.page-tab {
  position: fixed;
  left: 0;
  top: 60px;
  background-color: #c62828;
  color: #ffffff;
  padding: 8px 15px;
  border-radius: 0 5px 5px 0;
  font-size: 14px;
  font-weight: bold;
  z-index: 10;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

/* Icon Styles */
i {
  font-family: "FontAwesome" !important;
  color: inherit;
  width: 20px;
  text-align: center;
}

.fa-chart-line,
.fa-users,
.fa-bars,
.fa-notifications,
.fa-power-off {
  font-size: 18px;
  transition: transform 0.3s ease;
}

.sidebar nav ul li:hover i {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }

  .main-layout,
  .main-container {
    margin-left: 0;
  }

  .sidebar-toggle {
    display: block;
  }
  
  .page-tab {
    top: 70px;
    font-size: 12px;
    padding: 6px 12px;
  }
}
</style>