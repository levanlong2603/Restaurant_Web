<template>
  <div class="main-container">
    <Navigation @sidebar-toggle="handleSidebarToggle" />
    <section class="dashboard" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <!-- Header cố định -->
      <div class="dashboard-header fixed-header">
        <div class="header-main">
          <div class="header-controls-section">
            <div class="header-right-group">
              <input type="text" v-model="searchQuery" placeholder="Tìm kiếm..." class="search-input" />
              <select v-model="selectedStatus" class="status-filter" @change="filterByStatus">
                <option value="">Tất cả trạng thái</option>
                <option value="pending">Chờ duyệt</option>
                <option value="preparing">Đặt trước</option>
                <option value="serving">Đang phục vụ</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
              <input type="date" v-model="selectedDate" class="date-filter" @change="fetchReservations" />
              <span class="current-time">{{ currentDateTime }}</span>
              <button class="refresh-button" @click="refresh">
                <i class="fas fa-sync-alt"></i> Làm mới
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Nội dung chính với padding-top để tránh bị header che -->
      <div class="container-reservation">
        <section class="reservation-management">
          <!-- Danh sách thông báo đặt bàn (dạng bảng) -->
          <div class="reservation-list-wrapper">
            <table class="reservation-table">
              <thead>
                <tr>
                  <th class="col-id">ID</th>
                  <th class="col-customer">Khách hàng</th>
                  <th class="col-time">Thời gian đặt</th>
                  <th class="col-people">Số người</th>
                  <th class="col-table">Bàn</th>
                  <th class="col-status">Trạng thái</th>
                  <th class="col-actions">Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="reservation in filteredReservations" :key="reservation.reservation_id">
                  <td class="col-id">{{ reservation.reservation_id }}</td>
                  <td class="col-customer">{{ reservation.customerName }}</td>
                  <td class="col-time">{{ formatDate(reservation.reservation_time) }}</td>
                  <td class="col-people">{{ reservation.num_people }}</td>
                  <td class="col-table">{{ reservation.tableNumber }}</td>
                  <td class="col-status">
                    <span class="status" :class="reservation.status">
                      {{ statusDisplayNames[reservation.status] || reservation.status }}
                    </span>
                  </td>
                  <td class="col-actions">
                    <button
                      v-if="reservation.status === 'pending'"
                      class="action-btn approve-btn"
                      @click="goToDetail(reservation)"
                    >
                      Duyệt
                    </button>
                    <button
                      v-if="reservation.status === 'preparing'"
                      class="action-btn checkin-btn"
                      @click="checkin(reservation)"
                    >
                      Nhận khách
                    </button>
                    <button
                      v-if="reservation.status === 'pending' || reservation.status === 'preparing'"
                      class="action-btn cancel-btn"
                      @click="cancel(reservation)"
                    >
                      Hủy
                    </button>
                    <button
                      v-if="reservation.status === 'serving'"
                      class="action-btn order-btn"
                      @click="order(reservation)"
                    >
                      Gọi món
                    </button>
                    <button
                      v-if="reservation.status === 'serving' || reservation.status === 'paid'"
                      class="action-btn checkout-btn"
                      @click="checkout(reservation)"
                    >
                      Thanh toán
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>

<script>
import { debounce } from 'lodash';
import axios from 'axios';
import Navigation from '../../components/Navigation.vue';

export default {
  name: 'ReservationManagement',
  components: {
    Navigation,
  },
  data() {
    return {
      searchQuery: '',
      selectedStatus: '',
      reservations: [],
      isSidebarCollapsed: false,
      statusDisplayNames: {
        pending: 'Chờ duyệt',
        preparing: 'Đặt trước',
        serving: 'Đang phục vụ',
        paid: 'Đã thanh toán',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy',
      },
      selectedDate: '',
      currentDateTime: '',
      updateDateTimeInterval: null,
    };
  },
  computed: {
    filteredReservations() {
      let filtered = this.reservations;
      if (this.searchQuery) {
        filtered = filtered.filter(
          (reservation) =>
            reservation.customerName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            reservation.tableNumber.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            (reservation.customer?.phoneNumber?.toLowerCase().includes(this.searchQuery.toLowerCase()) ?? false)
        );
      }

      if (this.selectedStatus) {
        filtered = filtered.filter((reservation) => reservation.status === this.selectedStatus);
      }

      if (this.selectedDate) {
        const selectedDate = new Date(this.selectedDate).setHours(0, 0, 0, 0);
        filtered = filtered.filter((reservation) => {
          const reservationDate = new Date(reservation.reservation_time).setHours(0, 0, 0, 0);
          return reservationDate === selectedDate;
        });
      }

      return filtered;
    },
  },
  created() {
    this.debouncedSearch = debounce(this.search, 300);
    this.fetchReservations();
    this.updateDateTime();
    this.updateDateTimeInterval = setInterval(this.updateDateTime, 60000);
  },
  beforeDestroy() {
    clearInterval(this.updateDateTimeInterval);
  },
  methods: {
    handleSidebarToggle(isCollapsed) {
      this.isSidebarCollapsed = isCollapsed;
    },
    async fetchReservations() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/reservation/all', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data);

        this.reservations = response.data
          .map((reservation) => ({
            ...reservation,
            customerName: reservation.customer?.name || 'Khách hàng không xác định',
            tableNumber: reservation.details?.length
              ? reservation.details.map((detail) => detail.table_id).join(', ')
              : 'Chưa xác định',
            phoneNumber: reservation.customer?.phoneNumber || 'Chưa có số điện thoại',
          }));
      } catch (error) {
        console.error('Error fetching reservations:', error);
      }
    },
    async cancelReservation(reservation) {
      try {
        const resId = reservation.reservation_id || reservation.id;
        console.log("ID:", resId);
        const response = await axios.put(`http://localhost:3000/reservation/cancel`, {
          reservation_id: resId,
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response) {
          alert(response.data.message);
        }
        console.log('Hủy đặt bàn:', response.data);
        window.location.reload();
      } catch (error) {
        console.error('Lỗi khi cập nhật đặt bàn:', error);
        if (error.response) {
          console.error("Chi tiết lỗi từ server:", error.response.data);
          alert(`${error.response.data.message || "Không thể cập nhật đặt bàn"}`);
        } else {
          alert("Không thể kết nối đến server, vui lòng thử lại!");
        }
      }
    },
    async checkin(reservation) {
      try {
        const resId = reservation.reservation_id || reservation.id;
        console.log("ID:", resId);
        console.log(localStorage.getItem('token'));
        const response = await axios.put(
          `http://localhost:3000/reservation/checkin/${resId}`,
          null,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (response) {
          alert(response.data.message);
        }
        window.location.reload();
      } catch (error) {
        console.error('Lỗi khi check-in:', error);
      }
    },
    search() {},
    filterByStatus() {},
    goToDetail(reservation) {
      localStorage.setItem('selectedReservation', JSON.stringify(reservation));
      this.$router.push(`/reserve`);
    },
    async checkout(reservation) {
      if (reservation.status === 'serving') {
        localStorage.setItem('selectedReservation', JSON.stringify({
          ...reservation,
          reservation_id: reservation.reservation_id
        }));
        this.$router.push(`/checkout`);
      } else {
        try {
          console.log("Processing checkout for reservation:", reservation.reservation_id);
          const response = await axios.put(`http://localhost:3000/reservation/left/${reservation.reservation_id}`, null, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          if (response) {
            alert(response.data.message);
          }
          window.location.reload();
        } catch (error) {
          console.error('Lỗi khi thanh toán:', error);
          if (error.response) {
            console.error("Chi tiết lỗi từ server:", error.response.data);
            alert(`${error.response.data.message || "Không thể thanh toán"}`);
          } else {
            alert("Không thể kết nối đến server, vui lòng thử lại!");
          }
        }
      }
    },
    async cancel(reservation) {
      try {
        console.log("Cancelling reservation:", reservation.reservation_id);
        const response = await axios.put(`http://localhost:3000/reservation/cancel`, {
          reservation_id: reservation.reservation_id,
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response) {
          alert(response.data.message);
        }
        window.location.reload();
      } catch (error) {
        console.error('Lỗi khi cập nhật đặt bàn:', error);
        if (error.response) {
          console.error("Chi tiết lỗi từ server:", error.response.data);
          alert(`${error.response.data.message || "Không thể cập nhật đặt bàn"}`);
        } else {
          alert("Không thể kết nối đến server, vui lòng thử lại!");
        }
      }
    },
    async order(reservation) {
      localStorage.setItem('selectedReservation', JSON.stringify(reservation));
      this.$router.push(`/order`);
    },
    async refresh() {
      window.location.reload();
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
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

/* Header cố định - Trong suốt */
.dashboard-header.fixed-header {
  position: fixed;
  top: 0;
  left: 280px; /* Căn chỉnh theo sidebar */
  right: 0;
  z-index: 1000;
  background: rgba(255, 248, 231, 0.85); /* Trong suốt */
  backdrop-filter: blur(10px); /* Hiệu ứng blur cho nền trong suốt */
  padding: 1rem 2rem;
  border-bottom: 1px solid rgba(231, 194, 125, 0.5);
  box-shadow: 0 4px 15px rgba(107, 66, 38, 0.1);
  margin: 0;
  transition: left 0.3s ease;
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
  justify-content: flex-end;
  align-items: center;
  width: 100%;
}

.header-controls-section {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.header-right-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.current-time {
  font-size: 1rem;
  color: #6B4226;
  font-weight: 600;
  white-space: nowrap;
  background: rgba(231, 194, 125, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(139, 94, 60, 0.2);
}

.search-input,
.status-filter,
.date-filter {
  padding: 0.6rem 0.8rem;
  border: 1px solid rgba(139, 94, 60, 0.5);
  border-radius: 8px;
  background: rgba(255, 248, 231, 0.9);
  color: #3B2F2F;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  font-weight: 500;
  min-height: 40px;
  box-sizing: border-box;
}

.search-input {
  width: 200px;
}

.status-filter {
  width: 160px;
}

.date-filter {
  width: 150px;
}

.search-input:focus,
.status-filter:focus,
.date-filter:focus {
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
  box-shadow: 0 2px 8px rgba(107, 66, 38, 0.2);
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
  padding: 100px 0 0 0; /* Giảm padding-top vì header đã gọn hơn */
  background-color: #FFF8E7;
  color: #3B2F2F;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: calc(100vh - 100px);
}

.reservation-management {
  padding: 0px;
  color: #3B2F2F;
  width: 100%;
  margin: 0 auto;
  z-index: 1;
}

.reservation-list-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  width: 100%;
  height: 100%;
}

.reservation-table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(255, 248, 231, 0.5);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(231, 194, 125, 0.3);
  box-shadow: 0 4px 15px rgba(107, 66, 38, 0.2);
  font-size: 16px;
}

.reservation-table thead {
  background: rgba(139, 94, 60, 0.3);
}

.reservation-table th,
.reservation-table td {
  padding: 15px 20px;
  height: 50px;
  text-align: left;
  border-bottom: 1px solid rgba(231, 194, 125, 0.3);
  border-right: 1px solid rgba(231, 194, 125, 0.3);
  text-align: center;
  font-weight: 500;
}

.reservation-table th:last-child,
.reservation-table td:last-child {
  border-right: none;
}

.reservation-table th {
  font-weight: bold;
  color: #6B4226;
  font-size: 16px;
}

/* Cố định chiều rộng cho từng cột với kích thước lớn hơn */
.col-id {
  width: 80px;
}

.col-customer {
  width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-time {
  width: 200px;
  white-space: nowrap;
}

.col-people {
  width: 100px;
}

.col-table {
  width: 120px;
  white-space: nowrap;
}

.col-status {
  width: 150px;
  white-space: nowrap;
}

.col-actions {
  width: 300px;
  text-align: right;
}

/* Đảm bảo các ô trong tbody khớp với thead */
.reservation-table td {
  vertical-align: middle;
}

.reservation-table td.col-status .status {
  font-weight: bold;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;
}

.reservation-table td.col-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* Màu sắc trạng thái */
.status.pending {
  color: #F57C00;
  background-color: rgba(245, 124, 0, 0.1);
}

.status.preparing {
  color: #1976D2;
  background-color: rgba(25, 118, 210, 0.1);
}

.status.serving {
  color: #388E3C;
  background-color: rgba(56, 142, 60, 0.1);
}

.status.paid {
  color: #7B1FA2;
  background-color: rgba(123, 31, 162, 0.1);
}

.status.completed {
  color: #6B4226;
  background-color: rgba(107, 66, 38, 0.1);
  opacity: 0.7;
}

.status.cancelled {
  color: #D32F2F;
  background-color: rgba(211, 47, 47, 0.1);
}

/* Nút hành động với kích thước lớn hơn */
.action-btn {
  padding: 10px 16px;
  background: rgba(255, 248, 231, 0.6);
  border: 1px solid #8B5E3C;
  border-radius: 6px;
  color: #6B4226;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(107, 66, 38, 0.2);
  min-height: 40px;
  min-width: 80px;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.order-btn {
  background: #E7C27D;
  color: #6B4226;
  border: 1px solid #E7C27D;
}

.order-btn:hover {
  background: #F5E3B3;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(231, 194, 125, 0.3);
}

.approve-btn {
  background: #388E3C;
  color: #FFF8E7;
  border: 1px solid #388E3C;
}

.approve-btn:hover {
  background: #2E7D32;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(56, 142, 60, 0.3);
}

.checkin-btn {
  background: #1976D2;
  color: #FFF8E7;
  border: 1px solid #1976D2;
}

.checkin-btn:hover {
  background: #1565C0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(25, 118, 210, 0.3);
}

.cancel-btn {
  background: #D32F2F;
  color: #FFF8E7;
  border: 1px solid #D32F2F;
}

.cancel-btn:hover {
  background: #C62828;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(211, 47, 47, 0.3);
}

.checkout-btn {
  background: #7B1FA2;
  color: #FFF8E7;
  border: 1px solid #7B1FA2;
}

.checkout-btn:hover {
  background: #6A1B9A;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(123, 31, 162, 0.3);
}

.reservation-table td.col-actions {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Hiệu ứng hover cho hàng */
.reservation-table tbody tr {
  transition: background-color 0.3s ease;
}

.reservation-table tbody tr:hover {
  background: rgba(231, 194, 125, 0.2);
}

/* Custom scrollbar */
.reservation-list-wrapper::-webkit-scrollbar {
  width: 8px;
}

.reservation-list-wrapper::-webkit-scrollbar-track {
  background: rgba(231, 194, 125, 0.1);
  border-radius: 4px;
}

.reservation-list-wrapper::-webkit-scrollbar-thumb {
  background: #E7C27D;
  border-radius: 4px;
}

.reservation-list-wrapper::-webkit-scrollbar-thumb:hover {
  background: #8B5E3C;
}

/* Responsive design */
@media (max-width: 1200px) {
  .header-right-group {
    gap: 0.8rem;
  }
  
  .search-input {
    width: 180px;
  }
  
  .status-filter {
    width: 140px;
  }
  
  .date-filter {
    width: 140px;
  }
}

@media (max-width: 1024px) {
  .header-right-group {
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 1rem;
  }
  
  .container-reservation {
    padding-top: 140px;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 0;
    margin-left: 0 !important;
  }
  
  .dashboard-header.fixed-header {
    left: 0 !important;
    padding: 1rem;
  }
  
  .header-right-group {
    flex-direction: column;
    width: 100%;
    gap: 0.8rem;
  }
  
  .search-input,
  .status-filter,
  .date-filter {
    width: 100%;
  }
  
  .current-time {
    width: 100%;
    text-align: center;
  }
  
  .refresh-button {
    width: 100%;
    justify-content: center;
  }
  
  .reservation-list-wrapper {
    padding: 10px;
  }
  
  .reservation-table {
    font-size: 14px;
  }
  
  .reservation-table th,
  .reservation-table td {
    padding: 10px 12px;
  }
  
  .container-reservation {
    padding-top: 180px;
  }
}

@media (max-width: 480px) {
  .current-time {
    font-size: 0.9rem;
  }
  
  .reservation-table {
    font-size: 12px;
  }
  
  .reservation-table th,
  .reservation-table td {
    padding: 8px 10px;
  }
  
  .action-btn {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .container-reservation {
    padding-top: 200px;
  }
}
</style>