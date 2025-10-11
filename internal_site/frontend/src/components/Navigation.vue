<template>
  <div class="admin-page" v-if="!isSidebarCollapsed">
    <aside class="sidebar">
      <div class="sidebar-header">
        <img src="@/assets/images/Logo.png" alt="Logo Nhà hàng Tinh Hoa Việt" class="sidebar-logo" />
        <h2>Quản lý <br> Long Quân An</h2>
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
        title: '<span style="color: #2b2b2b; font-size: 1.3rem; font-weight: 600;">Xác nhận đăng xuất</span>',
        html: '<div style="color: #2b2b2b; font-size: 1rem; margin: 15px 0; font-weight: 500;">Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?</div>',
        icon: 'question',
        iconColor: '#2b2b2b',
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-sign-out-alt" style="margin-right: 8px;"></i> Đăng xuất',
        cancelButtonText: '<i class="fas fa-times" style="margin-right: 8px;"></i> Hủy bỏ',
        background: 'linear-gradient(135deg, #c2aa77, #b29a67)',
        color: '#2b2b2b',
        confirmButtonColor: '#2b2b2b',
        cancelButtonColor: '#8b7a4d',
        width: '400px',
        padding: '1.5rem',
        backdrop: 'rgba(194, 170, 119, 0.1)'
      });

      if (result.isConfirmed) {
        // Hiệu ứng loading
        Swal.fire({
          title: 'Đang đăng xuất...',
          text: 'Vui lòng chờ trong giây lát',
          icon: 'info',
          iconColor: '#2b2b2b',
          background: 'linear-gradient(135deg, #c2aa77, #b29a67)',
          color: '#2b2b2b',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
          timer: 1500
        });

        // Đợi một chút cho hiệu ứng
        setTimeout(() => {
          this.logout();
        }, 1500);
      }
    },
    logout() {
      // Xóa dữ liệu đăng nhập
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('rememberMe');
      
      // Thông báo thành công và chuyển hướng
      Swal.fire({
        title: '<span style="color: #2b2b2b; font-weight: 600;">Đăng xuất thành công!</span>',
        text: 'Chuyển đến trang đăng nhập...',
        icon: 'success',
        iconColor: '#2b2b2b',
        background: 'linear-gradient(135deg, #c2aa77, #b29a67)',
        color: '#2b2b2b',
        confirmButtonColor: '#2b2b2b',
        confirmButtonText: '<span style="color: #c2aa77;">OK</span>',
        showConfirmButton: false,
        timer: 1000,
        didClose: () => {
          this.$router.push('/login');
        }
      }).then(() => {
        this.$router.push('/login');
      });
    }
  }
};
</script>

<style scoped>
.admin-page {
  display: flex;
  min-height: 100vh;
  background-color: transparent;
  color: #2b2b2b;
}

/* Sidebar */
.sidebar {
  width: 225px;
  background: linear-gradient(180deg, #c2aa77, #b29a67);
  padding: 20px;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  overflow-y: auto;
  transition: width 0.3s ease;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  z-index: 100;
  border-right: 1px solid rgba(251, 207, 103, 0.3);
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
  color: #2b2b2b;
  flex-grow: 1;
  font-weight: bold;
}

.sidebar-header i {
  cursor: pointer;
  color: #2b2b2b;
  font-size: 18px;
}

.sidebar nav ul {
  list-style: none;
  padding: 0;
}

.sidebar nav ul li {
  padding: 12px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #2b2b2b;
  margin: 5px 0;
  border-radius: 8px;
}

.sidebar nav ul li:hover,
.sidebar nav ul li.active {
  background: rgba(251, 207, 103, 0.5);
  color: #2b2b2b;
  border-radius: 8px;
  transform: translateX(5px);
}

.sidebar nav ul li a {
  color: #2b2b2b;
  text-decoration: none;
  font-size: 16px;
  padding-left: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
}

.sidebar nav ul li span {
  font-size: 16px;
  padding-left: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
}

/* Nút mở lại sidebar */
.sidebar-toggle {
  position: fixed;
  left: 10px;
  top: 20px;
  background: #fbcf67;
  color: #2b2b2b;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  z-index: 20;
  transition: all 0.3s ease;
  border: 1px solid rgba(251, 207, 103, 0.3);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.sidebar-toggle:hover {
  background: #e5b756;
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
  background: #fbcf67;
  color: #2b2b2b;
  padding: 8px 15px;
  border-radius: 0 8px 8px 0;
  font-size: 14px;
  font-weight: bold;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* Icon Styles */
i {
  font-family: "FontAwesome" !important;
  color: #2b2b2b;
}

.fa-chart-line,
.fa-users,
.fa-bars,
.fa-notifications,
.fa-power-off {
  color: #2b2b2b;
  font-size: 18px;
  transition: transform 0.3s ease, color 0.3s ease;
}

.sidebar nav ul li:hover i,
.sidebar nav ul li.active i {
  color: #2b2b2b;
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
}

/* Thêm style cho main content area */
.main-content {
  margin-left: 225px;
  flex: 1;
  padding: 20px;
  background: transparent;
}

/* Khi sidebar thu gọn */
.sidebar.collapsed {
  width: 60px;
}

.sidebar.collapsed .sidebar-header h2,
.sidebar.collapsed nav ul li span {
  display: none;
}

.sidebar.collapsed .sidebar-header {
  justify-content: center;
}

.sidebar.collapsed nav ul li a {
  justify-content: center;
  padding-left: 0;
}
</style>