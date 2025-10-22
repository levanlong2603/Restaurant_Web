<template>
  <div class="admin-page">
  <aside v-show="!isSidebarCollapsed || isMobileOpen" class="sidebar" :class="{ 'mobile-open': isMobileOpen }" :aria-hidden="isMobile && !isMobileOpen" role="navigation">
      <div class="sidebar-header">
        <img src="@/assets/images/Logo.png" alt="Logo Nhà hàng Long Quân An" class="sidebar-logo" />
        <div class="header-text">
          <h2>Long Quân An</h2>
          <p>Quản lý nhà hàng</p>
        </div>
        <i class="fas fa-chevron-left toggle-icon" @click="toggleSidebar" title="Thu gọn sidebar"></i>
      </div>
      
      <nav class="sidebar-nav">
        <ul>
          <!-- Menu cho Manager -->
          <template v-if="hasRole('manager')">
            <li :class="{ active: isActiveRoute('/manager/dashboard') }">
              <router-link to="/manager/dashboard" class="nav-link" @click="handleNavigation">
                <i class="fas fa-chart-line"></i>
                <span class="nav-text">Thống kê</span>
              </router-link>
            </li>
            <li :class="{ active: isActiveRoute('/manager/users') }">
              <router-link to="/manager/users" class="nav-link" @click="handleNavigation">
                <i class="fas fa-users"></i>
                <span class="nav-text">Quản lý tài khoản</span>
              </router-link>
            </li>
            <li :class="{ active: isActiveRoute('/manager/menu') }">
              <router-link to="/manager/menu" class="nav-link" @click="handleNavigation">
                <i class="fas fa-utensils"></i>
                <span class="nav-text">Quản lý menu</span>
              </router-link>
            </li>
          </template>

          <!-- Menu cho Staff -->
          <template v-if="hasRole('staff')">
            <li :class="{ active: isActiveRoute('/notification') }">
              <router-link to="/notification" class="nav-link" @click="handleNavigation">
                <i class="fas fa-calendar-check"></i>
                <span class="nav-text">Quản lý đặt bàn</span>
              </router-link>
            </li>
            <li :class="{ active: isActiveRoute('/reserve') }">
              <router-link to="/reserve" class="nav-link" @click="handleNavigation">
                <i class="fas fa-table"></i>
                <span class="nav-text">Đặt bàn</span>
              </router-link>
            </li>
            <li :class="{ active: isActiveRoute('/order') }">
              <router-link to="/order" class="nav-link" @click="handleNavigation">
                <i class="fas fa-concierge-bell"></i>
                <span class="nav-text">Gọi món</span>
              </router-link>
            </li>
            <li :class="{ active: isActiveRoute('/checkout') }">
              <router-link to="/checkout" class="nav-link" @click="handleNavigation">
                <i class="fas fa-cash-register"></i>
                <span class="nav-text">Thanh toán</span>
              </router-link>
            </li>
            <li :class="{ active: isActiveRoute('/invoicemanagement') }">
              <router-link to="/invoicemanagement" class="nav-link" @click="handleNavigation">
                <i class="fas fa-receipt"></i>
                <span class="nav-text">Hóa đơn</span>
              </router-link>
            </li>
          </template>

          <!-- Menu chung -->
          <li :class="{ active: isActiveRoute('/user') }">
            <router-link to="/user" class="nav-link" @click="handleNavigation">
              <i class="fas fa-user-circle"></i>
              <span class="nav-text">Thông tin cá nhân</span>
            </router-link>
          </li>

          <!-- Đăng xuất -->
          <li class="logout-item" @click="confirmLogout">
            <div class="nav-link logout-link">
              <i class="fas fa-sign-out-alt"></i>
              <span class="nav-text">Đăng xuất</span>
            </div>
          </li>
        </ul>
      </nav>

      <!-- User info footer -->
      <div class="user-footer">
        <div class="user-avatar">
          <i class="fas fa-user"></i>
        </div>
        <div class="user-info">
          <p class="user-name">{{ user.name || 'Người dùng' }}</p>
          <p class="user-role">{{ getRoleDisplayName }}</p>
        </div>
      </div>
    </aside>

    <!-- Overlay cho mobile -->
    <div class="sidebar-overlay" v-if="isMobile && isMobileOpen" @click="closeSidebar"></div>
  </div>

  <!-- Nút toggle sidebar khi collapsed -->
  <button class="sidebar-toggle" v-if="isSidebarCollapsed || (isMobile && !isMobileOpen)" @click="openSidebar" title="Mở rộng sidebar" aria-label="Mở menu">
    <i class="fas fa-bars"></i>
  </button>

  <!-- Page indicator khi sidebar collapsed -->
  <div class="page-indicator" v-if="isSidebarCollapsed && !isMobile">
    <span class="page-name">{{ currentPageName }}</span>
  </div>
</template>

<script>
import Swal from 'sweetalert2';

export default {
  name: 'Navigation',
  emits: ['sidebarToggle'],

  data() {
    return {
      isSidebarCollapsed: true, // Mặc định là thu gọn
      isMobileOpen: false,
      user: JSON.parse(localStorage.getItem('user')) || {},
      isMobile: false
    };
  },

  computed: {
    currentPageName() {
      const routeNames = {
        '/manager/dashboard': 'Thống kê',
        '/manager/users': 'QL Người dùng',
        '/manager/menu': 'QL Menu',
        '/user': 'Thông tin cá nhân',
        '/notification': 'QL Đặt bàn',
        '/reserve': 'Đặt bàn',
        '/order': 'Gọi món',
        '/checkout': 'Thanh toán',
        '/invoicemanagement': 'Hóa đơn',
      };
      return routeNames[this.$route.path] || 'Trang chủ';
    },

    getRoleDisplayName() {
      const roles = {
        manager: 'Quản lý',
        staff: 'Nhân viên',
        customer: 'Khách hàng'
      };
      return roles[this.user.role] || 'Người dùng';
    }
  },

  methods: {
    toggleSidebar() {
      if (this.isMobile) {
        this.isMobileOpen = !this.isMobileOpen;
      } else {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
      }
      this.$emit('sidebar-toggle', this.isSidebarCollapsed);
    },

    openSidebar() {
      if (this.isMobile) {
        this.isMobileOpen = true;
      } else {
        this.isSidebarCollapsed = false;
      }
      this.$emit('sidebar-toggle', this.isSidebarCollapsed);
    },

    closeSidebar() {
      if (this.isMobile) {
        this.isMobileOpen = false;
      } else {
        this.isSidebarCollapsed = true;
      }
      this.$emit('sidebar-toggle', this.isSidebarCollapsed);
    },

    handleNavigation() {
      // Tự động thu gọn sidebar sau khi chọn menu item
      this.closeSidebar();
    },

    isActiveRoute(route) {
      return this.$route.path === route;
    },

    hasRole(role) {
      if (!this.user?.role) return false;
      return this.user.role === role;
    },

    checkMobileScreen() {
      this.isMobile = window.innerWidth <= 768;
      // Trên mobile, mặc định đóng sidebar
      if (this.isMobile) {
        this.isMobileOpen = false;
      }
    },

    async confirmLogout() {
      const result = await Swal.fire({
        title: '<span style="color: #6B4226; font-size: 1.4rem; font-weight: 700;">Đăng xuất</span>',
        html: '<div style="color: #3B2F2F; font-size: 1rem; margin: 15px 0; font-weight: 500;">Bạn có chắc chắn muốn đăng xuất?</div>',
        icon: 'question',
        iconColor: '#8B5E3C',
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-sign-out-alt" style="margin-right: 8px;"></i> Đăng xuất',
        cancelButtonText: '<i class="fas fa-times" style="margin-right: 8px;"></i> Hủy',
        background: 'linear-gradient(135deg, #FFF8E7, #F5E3B3)',
        color: '#3B2F2F',
        confirmButtonColor: '#8B5E3C',
        cancelButtonColor: '#A89B8B',
        width: '420px',
        padding: '2rem',
        backdrop: 'rgba(107, 66, 38, 0.3)',
        customClass: {
          popup: 'custom-swal-popup'
        }
      });

      if (result.isConfirmed) {
        await this.handleLogout();
      }
    },

    async handleLogout() {
      // Hiệu ứng loading
      const loadingToast = Swal.fire({
        title: '<span style="color: #6B4226;">Đang đăng xuất...</span>',
        html: '<div style="margin-top: 1rem;"><div class="custom-spinner"></div></div>',
        background: 'linear-gradient(135deg, #FFF8E7, #F5E3B3)',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        timer: 1500
      });

      // Xóa dữ liệu đăng nhập
      setTimeout(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('rememberMe');
        
        loadingToast.then(() => {
          Swal.fire({
            title: '<span style="color: #388E3C; font-weight: 700;">Thành công!</span>',
            text: 'Đăng xuất thành công. Chuyển hướng đến trang đăng nhập...',
            icon: 'success',
            iconColor: '#388E3C',
            background: 'linear-gradient(135deg, #FFF8E7, #F5E3B3)',
            color: '#3B2F2F',
            confirmButtonColor: '#8B5E3C',
            showConfirmButton: false,
            timer: 1000,
            willClose: () => {
              this.$router.push('/login');
            }
          });
        });
      }, 1500);
    }
  },

  mounted() {
    this.checkMobileScreen();
    window.addEventListener('resize', this.checkMobileScreen);
    console.log('Navigation component mounted - Current user:', this.user);
    console.log('Sidebar default state: collapsed', this.isSidebarCollapsed);
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobileScreen);
  }
};
</script>

<style scoped>
.admin-page {
  display: flex;
  min-height: 100vh;
  background-color: transparent;
}

/* Sidebar Styles */
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #6B4226 0%, #8B5E3C 100%);
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  overflow-y: auto;
  transition: all 0.3s ease;
  box-shadow: 4px 0 20px rgba(107, 66, 38, 0.3);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  border-right: 2px solid #E7C27D;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 25px 20px;
  background: rgba(107, 66, 38, 0.9);
  border-bottom: 1px solid rgba(231, 194, 125, 0.3);
}

.sidebar-logo {
  width: 45px;
  height: 45px;
  border-radius: 8px;
  border: 2px solid #E7C27D;
  padding: 3px;
  background: #FFF8E7;
}

.header-text {
  flex: 1;
}

.header-text h2 {
  font-size: 18px;
  color: #FFF8E7;
  margin: 0;
  font-weight: 700;
  line-height: 1.2;
}

.header-text p {
  font-size: 12px;
  color: #F5E3B3;
  margin: 2px 0 0 0;
  opacity: 0.8;
  font-weight: 500;
}

.toggle-icon {
  color: #E7C27D;
  font-size: 16px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
  background: rgba(231, 194, 125, 0.1);
}

.toggle-icon:hover {
  background: rgba(231, 194, 125, 0.2);
  transform: scale(1.1);
}

/* Navigation Styles */
.sidebar-nav {
  flex: 1;
  padding: 20px 0;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-nav li {
  margin: 8px 15px;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.sidebar-nav li:not(.logout-item):hover {
  background: rgba(231, 194, 125, 0.15);
  transform: translateX(5px);
}

.sidebar-nav li.active {
  background: rgba(231, 194, 125, 0.25);
  border-left: 4px solid #E7C27D;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 14px 20px;
  color: #FFF8E7;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
}

.nav-link i {
  font-size: 16px;
  width: 20px;
  text-align: center;
  color: #E7C27D;
  transition: all 0.3s ease;
}

.nav-text {
  flex: 1;
  font-weight: 500;
}

.sidebar-nav li.active .nav-link i,
.sidebar-nav li:hover .nav-link i {
  color: #F5E3B3;
  transform: scale(1.1);
}

/* Logout Item */
.logout-item {
  margin-top: auto;
  border-top: 1px solid rgba(231, 194, 125, 0.2);
  padding-top: 15px;
}

.logout-item .logout-link {
  color: #F5A9A9;
  cursor: pointer;
}

.logout-item .logout-link i {
  color: #F5A9A9;
}

.logout-item:hover {
  background: rgba(245, 169, 169, 0.1);
}

.logout-item:hover .logout-link {
  color: #FF6B6B;
}

.logout-item:hover .logout-link i {
  color: #FF6B6B;
}

/* User Footer */
.user-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: rgba(107, 66, 38, 0.8);
  border-top: 1px solid rgba(231, 194, 125, 0.2);
  margin-top: auto;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(231, 194, 125, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #E7C27D;
}

.user-avatar i {
  color: #E7C27D;
  font-size: 16px;
}

.user-info {
  flex: 1;
}

.user-name {
  color: #FFF8E7;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
}

.user-role {
  color: #F5E3B3;
  font-size: 12px;
  margin: 2px 0 0 0;
  opacity: 0.8;
  font-weight: 500;
}

/* Sidebar Toggle Button */
.sidebar-toggle {
  position: fixed;
  left: 20px;
  top: 20px;
  background: linear-gradient(135deg, #8B5E3C, #6B4226);
  color: #FFF8E7;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  z-index: 999;
  transition: all 0.3s ease;
  border: 2px solid #E7C27D;
  box-shadow: 0 4px 15px rgba(107, 66, 38, 0.4);
  font-size: 16px;
}

.sidebar-toggle:hover {
  background: linear-gradient(135deg, #6B4226, #8B5E3C);
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(107, 66, 38, 0.5);
}

/* Page Indicator */
.page-indicator {
  position: fixed;
  left: 0;
  top: 80px;
  background: linear-gradient(135deg, #E7C27D, #8B5E3C);
  color: #6B4226;
  padding: 10px 20px;
  border-radius: 0 12px 12px 0;
  font-size: 14px;
  font-weight: 700;
  z-index: 998;
  box-shadow: 0 4px 15px rgba(107, 66, 38, 0.3);
  border: 1px solid rgba(231, 194, 125, 0.5);
  border-left: none;
}

.page-name {
  font-weight: 600;
}

/* Overlay cho mobile */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* Custom Scrollbar */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(231, 194, 125, 0.1);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #E7C27D;
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #F5E3B3;
}

/* Responsive Design */
@media (max-width: 768px) {
  .sidebar {
    width: 280px;
    transform: translateX(-100%);
    z-index: 1001;
  }
  
  .sidebar.mobile-open {
    transform: translateX(0);
  }
  
  .sidebar-toggle {
    display: block;
  }
  
  .page-indicator {
    display: none; /* Ẩn page indicator trên mobile */
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 100%;
  }

  .sidebar-header {
    padding: 20px 15px;
  }
  
  .sidebar-nav {
    padding: 15px 0;
  }
  
  .sidebar-nav li {
    margin: 6px 10px;
  }
  
  .nav-link {
    padding: 12px 15px;
    font-size: 14px;
  }
  
  .user-footer {
    padding: 15px;
  }
}

/* Slightly reduce width on very small phones when shown as drawer */
@media (max-width: 360px) {
  .sidebar { width: 95%; }
}

/* Animation for mobile */
@media (max-width: 768px) {
  .sidebar {
    transition: transform 0.3s ease;
  }
}

/* Custom SweetAlert2 Styles */
:deep(.custom-swal-popup) {
  border: 2px solid #E7C27D;
  border-radius: 15px;
}

:deep(.custom-spinner) {
  width: 40px;
  height: 40px;
  border: 4px solid #E7C27D;
  border-top: 4px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>