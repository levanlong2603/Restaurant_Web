<template>
  <div class="main-container">
    <Navigation @sidebar-toggle="handleSidebarToggle" />
    <section class="dashboard" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <!-- Header cố định -->
      <div class="dashboard-header fixed-header">
        <div class="header-main">
          <div class="header-title-section">
            <h1>GỌI MÓN</h1>
          </div>
          <div class="header-controls-section">
            <span class="current-time">{{ currentDateTime }}</span>
            <div class="controls-group">
              <div class="filter-controls">
                <select v-model="table_id" class="status-filter">
                  <option value="" disabled>Chọn bàn</option>
                  <option v-for="table in tables" :key="table.table_id" :value="table.table_id">Bàn {{ table.table_id }}</option>
                </select>
              </div>
              <button class="refresh-button" @click="refresh">
                <i class="fas fa-sync-alt"></i> Làm mới
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Nội dung chính với padding-top để tránh bị header che -->
      <div class="container-reservation">
        <section class="order-management">
          <div class="order-container">
            <div class="menu-section">
              <MenuDetail 
                :reservation="reservation"
                @update:cartItems="updateCartItems"
                :localCartItems="cartItems"
              />
            </div>
            <div class="order-section">
              <OrderDetail 
                :reservation="reservation"
                :cartItems="cartItems"
                @update:cartItems="updateCartItems"
              />
            </div>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>
  
<script>
import axios from 'axios';
import MenuDetail from '../../components/MenuDetail.vue';
import OrderDetail from '../../components/OrderDetail.vue';
import Navigation from '../../components/Navigation.vue';

export default {
  name: 'OrderManagement',
  components: {
    MenuDetail,
    OrderDetail,
    Navigation,
  },
  data() {
    return {
      tables: [],
      table_id: '',
      reservation_id: '',
      cartItems: [],
      reservation: null,
      isSidebarCollapsed: false,
      currentDateTime: '',
      updateDateTimeInterval: null,
    };
  },
  mounted() {
    document.documentElement.style.backgroundColor = '#FFF8E7';
    this.fetchTables();
    this.fetchReservation();
    this.updateDateTime();
    this.updateDateTimeInterval = setInterval(this.updateDateTime, 60000);
    console.log("fetch table:", this.tables);
  },
  beforeDestroy() {
    clearInterval(this.updateDateTimeInterval);
  },
  methods: {
    handleSidebarToggle(isCollapsed) {
      this.isSidebarCollapsed = isCollapsed;
    },
    updateDateTime() {
      this.currentDateTime = new Date().toLocaleString("vi-VN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "numeric"
      });
    },
    async fetchTables() {
      try {
        this.reservation_id = '';
        this.table_id = '';
        const response = await axios.get('http://localhost:3000/table/served',{
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        console.log(response.data);
        this.tables = response.data['servedTables'];
      } catch (error) {
        console.log('Lỗi khi tải danh sách bàn', 'error');
      }
    },
    async refresh(){
      window.location.reload();
    },
    async fetchReservationId() {
      try {
          const response = await axios.get(`http://localhost:3000/reservation/table/${this.table_id}`, {
              headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
          });
          this.reservation = {
            ...response.data,
            customerName: response.data.customer?.name || 'Khách hàng không xác định',
            tableNumber: response.data.details?.length
                ? response.data.details.map((detail) => detail.table_id).join(', ')
                : 'Chưa xác định',
            };
            // normalize id
            if (this.reservation.id && !this.reservation.reservation_id) {
              this.reservation.reservation_id = this.reservation.id;
            }
            this.$emit('update:reservation_id', this.reservation.reservation_id);
            this.$emit('update:reservation', this.reservation);
      } catch (error) {
        console.log('Lỗi khi tải danh sách đặt bàn', 'error');
      }
    },
    updateCartItems(cartItems) {
      this.cartItems = cartItems;
    },
    async fetchReservation(){
      if (localStorage.getItem('selectedReservation')) {
        const reservation_storage = JSON.parse(localStorage.getItem('selectedReservation'));
        this.reservation = {
          ...reservation_storage,
          customerName: reservation_storage.customer?.name || 'Khách hàng không xác định',
          tableNumber: reservation_storage.details?.length
            ? reservation_storage.details.map((detail) => detail.table_id).join(', ')
            : 'Chưa xác định',
        };
        if (this.reservation.id && !this.reservation.reservation_id) {
          this.reservation.reservation_id = this.reservation.id;
        }
        this.reservation_id = this.reservation.reservation_id;
        if (this.reservation && this.reservation.details.length > 0) {
          this.table_id = reservation_storage.details[0].table_id;
        } else {
          this.table_id = null;
        }
        this.$emit('update:reservation_id', this.reservation_id);
        this.$emit('update:reservation', this.reservation);
        localStorage.removeItem('selectedReservation');
      } else {
        this.reservation_id = null;
      }
    }
  },
  watch: {
    table_id: {
          handler(new_table_id) {
            console.log("table id", new_table_id);
            this.fetchReservationId();
            console.log("reservation_id", this.reservation_id);
          },
          immediate: true,
          deep: true
      }
  },
};
</script>

<style scoped>
.main-container {
  display: flex;
  min-height: 100vh;
  background-color: #FFF8E7;
  font-family: 'Arial', sans-serif;
}

.dashboard {
  flex: 1;
  padding: 0;
  background-color: #FFF8E7;
  transition: all 0.3s ease;
  position: relative;
  margin-left: 280px; /* Khoảng cách cho sidebar */
}

/* Header cố định */
.dashboard-header.fixed-header {
  position: fixed;
  top: 0;
  left: 280px; /* Căn chỉnh theo sidebar */
  right: 0;
  z-index: 1000;
  background: linear-gradient(135deg, #8B5E3C, #6B4226);
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #E7C27D;
  box-shadow: 0 4px 15px rgba(107, 66, 38, 0.3);
  margin: 0;
  transition: left 0.3s ease; /* Hiệu ứng chuyển động khi sidebar toggle */
}

/* Khi sidebar collapsed */
.dashboard.sidebar-collapsed .dashboard-header.fixed-header {
  left: 0;
}

.dashboard.sidebar-collapsed {
  margin-left: 0;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.header-title-section {
  flex: 1;
}

.header-title-section h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #FFF8E7;
  text-shadow: 0 0 5px #E7C27D, 0 0 30px #E7C27D;
  margin: 0;
  letter-spacing: 0.5px;
  margin-left: 1cm;
}

.header-controls-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
  min-width: 400px;
}

.current-time {
  font-size: 1rem;
  color: #F5E3B3;
  font-weight: 500;
  white-space: nowrap;
}

.controls-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  justify-content: flex-end;
}

.filter-controls {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  flex: 1;
  justify-content: flex-end;
}

.status-filter {
  padding: 0.6rem 0.8rem;
  border: 1px solid #8B5E3C;
  border-radius: 8px;
  background: rgba(255, 248, 231, 0.95);
  color: #3B2F2F;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  font-weight: 500;
  min-height: 40px;
  box-sizing: border-box;
  width: 180px;
}

.status-filter:focus {
  border-color: #E7C27D;
  outline: none;
  background: #FFF8E7;
  box-shadow: 0 0 0 3px rgba(231, 194, 125, 0.3);
}

.refresh-button {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(107, 66, 38, 0.3);
  border: 1px solid #E7C27D;
  background: #E7C27D;
  color: #6B4226;
  white-space: nowrap;
  min-height: 40px;
}

.refresh-button:hover {
  background: #F5E3B3;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(231, 194, 125, 0.4);
}

.container-reservation {
  flex: 1;
  margin: 0;
  padding: 140px 0 0 0; /* Thêm padding-top để tránh bị header che */
  background-color: #FFF8E7;
  color: #3B2F2F;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: calc(100vh - 140px);
}

.order-management {
  padding: 0px;
  color: #3B2F2F;
  width: 100%;
  margin: 0 auto;
  z-index: 1;
}

.order-container {
  display: flex;
  gap: 40px;
  margin-top: 20px;
  padding: 0 20px;
  height: 100%;
}

.menu-section {
  width: 50%;
  display: flex;
}

.order-section {
  width: 50%;
}

/* Responsive design */
@media (max-width: 1200px) {
  .header-controls-section {
    min-width: 350px;
  }
  
  .status-filter {
    width: 160px;
  }
}

@media (max-width: 1024px) {
  .header-main {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-controls-section {
    min-width: auto;
    width: 100%;
    align-items: flex-start;
  }
  
  .controls-group {
    justify-content: flex-start;
  }
  
  .container-reservation {
    padding-top: 160px; /* Tăng padding-top cho responsive */
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 0;
    margin-left: 0 !important; /* Trên mobile, không có margin */
  }
  
  .dashboard-header.fixed-header {
    left: 0 !important; /* Trên mobile, header chiếm toàn bộ chiều rộng */
    padding: 1rem;
  }
  
  .header-title-section h1 {
    font-size: 1.6rem;
    margin-left: 0.5cm;
  }
  
  .controls-group {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-controls {
    flex-direction: column;
    width: 100%;
  }
  
  .status-filter {
    width: 100%;
  }
  
  .order-container {
    flex-direction: column;
    gap: 20px;
    padding: 0 10px;
    height: auto;
  }
  
  .menu-section, .order-section {
    width: 100%;
  }
  
  .container-reservation {
    padding-top: 180px; /* Tăng padding-top cho mobile */
  }
}

@media (max-width: 480px) {
  .header-title-section h1 {
    font-size: 1.4rem;
    margin-left: 0.3cm;
  }
  
  .current-time {
    font-size: 0.9rem;
  }
  
  .order-container {
    gap: 15px;
  }
  
  .refresh-button {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
  
  .container-reservation {
    padding-top: 190px; /* Tăng padding-top cho mobile nhỏ */
  }
}
</style>