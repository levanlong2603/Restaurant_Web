<template>
  <div class="main-container">
    <Navigation @sidebar-toggle="handleSidebarToggle" />
    <div class="reservation-management" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <!-- Header không cố định -->
      <div class="header">
        <h1>Quản lý Đặt bàn</h1>
        <div class="actions">
          <input type="text" v-model="searchQuery" placeholder="Tìm kiếm..." @input="debouncedSearch" />
          <input type="date" v-model="selectedDate" @change="fetchReservations" />
          <select v-model="selectedStatus" @change="filterByStatus">
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="preparing">Đặt trước</option>
            <option value="serving">Đang phục vụ</option>
            <option value="paid">Đã thanh toán</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

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
                  class="approve-button"
                  @click="goToDetail(reservation)"
                >
                Duyệt
              </button>
              <button
                v-if="reservation.status === 'preparing'"
                class="checkin-button"
                @click="checkin(reservation)"
              >
                Check in
              </button>
                <button
                  v-if="reservation.status === 'pending' || reservation.status === 'preparing'"
                  class="cancel-button"
                  @click="cancel(reservation)"
                >
                  Hủy
                </button>
                <button
                  v-if="reservation.status === 'serving'"
                  class="order-button"
                  @click="order(reservation)"
                >
                  Gọi món
                </button>
                <button
                  v-if="reservation.status === 'serving' || reservation.status === 'paid'"
                  class="checkout-button"
                  @click="checkout(reservation)"
                >
                  Check out
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
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
      selectedStatus: '' ,
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
            (reservation.customer?.phoneNumber?.toLowerCase().includes(this.searchQuery.toLowerCase()) ?? false)        );
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
          phoneNumber: reservation.customer?.phoneNumber || 'Chưa có số điện thoại', // Thêm số điện thoại
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
            // Thêm logic check-in tại đây
            try {
        const resId = reservation.reservation_id || reservation.id;
        console.log("ID:", resId);
        console.log(localStorage.getItem('token'));
        const response = await axios.put(
          `http://localhost:3000/reservation/checkin/${resId}`,
                    null, // nếu không có data body
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
    async checkout(reservation){
          if(reservation.status === 'serving'){
        localStorage.setItem('selectedReservation', JSON.stringify({
          ...reservation,
          reservation_id: reservation.reservation_id  // Đảm bảo lưu reservation_id
        }));
        this.$router.push(`/checkout`);
      }
      else {
        try{
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
    async checkin(reservation) {
      try {
        console.log("Checking in reservation:", reservation.reservation_id);
        const response = await axios.put(
          `http://localhost:3000/reservation/checkin/${reservation.reservation_id}`,
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
  },
};
</script>

<style scoped>
.main-container {
  display: flex;
  background: #FFF8E7; /* Trắng kem */
  height: 100vh;
  overflow: hidden;
}

.reservation-management {
  flex: 1;
  margin: 0;
  padding: 0;
  background-color: #FFF8E7; /* Trắng kem */
  color: #3B2F2F; /* Đen nâu */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-right: 20px;
  transition: margin-left 0.3s ease;
}

.reservation-management.sidebar-collapsed {
  margin-left: 10px; 
}

.header {
  background-color: #FFF8E7; /* Trắng kem */
  padding: 20px;
  border-bottom: 1px solid #E7C27D; /* Vàng nhạt */
}

.header h1 {
  text-align: center;
  color: #6B4226; /* Nâu đất */
  margin: 0 0 20px 0;
  font-weight: bold;
  text-shadow: 0 0 5px #E7C27D, 0 0 30px #E7C27D; /* Hiệu ứng vàng */
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.actions input,
.actions select {
  padding: 10px;
  border: 1px solid #8B5E3C; /* Nâu gỗ */
  border-radius: 8px;
  background: rgba(255, 248, 231, 0.8); /* Trắng kem trong suốt */
  color: #3B2F2F; /* Đen nâu */
  font-weight: 500;
  transition: all 0.3s ease;
}

.actions input:focus,
.actions select:focus {
  border-color: #E7C27D; /* Vàng nhạt */
  background: #FFF8E7; /* Trắng kem */
  outline: none;
  box-shadow: 0 0 0 3px rgba(231, 194, 125, 0.3);
}

.actions select {
  background: rgba(255, 248, 231, 0.8); /* Trắng kem trong suốt */
}

.reservation-list-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  width: 100%;
}

.reservation-table {
  width: 98%;
  border-collapse: collapse;
  background: rgba(255, 248, 231, 0.5); /* Trắng kem trong suốt */
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(231, 194, 125, 0.3); /* Vàng nhạt trong suốt */
  box-shadow: 0 4px 15px rgba(107, 66, 38, 0.2); /* Bóng nâu */
}

.reservation-table thead {
  background: rgba(139, 94, 60, 0.3); /* Nâu gỗ trong suốt */
  top: 0;
  z-index: 5;
}

.reservation-table th,
.reservation-table td {
  padding: 10px 15px;
  height: 35px;
  text-align: left;
  border-bottom: 1px solid rgba(231, 194, 125, 0.3); /* Vàng nhạt trong suốt */
  border-right: 1px solid rgba(231, 194, 125, 0.3); /* Vàng nhạt trong suốt */
  text-align: center;
  font-weight: 500;
}

.reservation-table th:last-child,
.reservation-table td:last-child {
  border-right: none;
}

.reservation-table th {
  font-weight: bold;
  color: #6B4226; /* Nâu đất */
}

/* Cố định chiều rộng cho từng cột */
.col-id {
  width: 50px;
}

.col-customer {
  width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-time {
  width: 180px;
  white-space: nowrap;
}

.col-people {
  width: 80px;
}

.col-table {
  width: 100px;
  white-space: nowrap;
}

.col-status {
  width: 120px;
  white-space: nowrap;
}

.col-actions {
  width: 200px;
  text-align: right;
}

/* Đảm bảo các ô trong tbody khớp với thead */
.reservation-table td {
  vertical-align: middle;
}

.reservation-table td.col-status .status {
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.reservation-table td.col-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* Màu sắc trạng thái */
.status.pending {
  color: #F57C00; /* Cam */
  background-color: rgba(245, 124, 0, 0.1);
}

.status.preparing {
  color: #1976D2; /* Xanh dương */
  background-color: rgba(25, 118, 210, 0.1);
}

.status.serving {
  color: #388E3C; /* Xanh lá */
  background-color: rgba(56, 142, 60, 0.1);
}

.status.paid {
  color: #7B1FA2; /* Tím */
  background-color: rgba(123, 31, 162, 0.1);
}

.status.completed {
  color: #6B4226; /* Nâu đất */
  background-color: rgba(107, 66, 38, 0.1);
  opacity: 0.7;
}

.status.cancelled {
  color: #D32F2F; /* Đỏ */
  background-color: rgba(211, 47, 47, 0.1);
}

/* Nút hành động */
.col-actions button {
  color: #FFF8E7; /* Trắng kem */
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(107, 66, 38, 0.2); /* Bóng nâu */
  border: 1px solid rgba(255, 248, 231, 0.3); /* Viền trắng trong suốt */
}

.order-button {
  background: #E7C27D; /* Vàng nhạt */
  color: #6B4226; /* Nâu đất */
}
.order-button:hover {
  background: #F5E3B3; /* Be nhạt */
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(231, 194, 125, 0.3);
}

.approve-button {
  background: #388E3C; /* Xanh lá */
}
.approve-button:hover {
  background: #2E7D32; /* Xanh lá đậm */
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(56, 142, 60, 0.3);
}

.checkin-button {
  background: #1976D2; /* Xanh dương */
}
.checkin-button:hover {
  background: #1565C0; /* Xanh dương đậm */
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(25, 118, 210, 0.3);
}

.cancel-button {
  background: #D32F2F; /* Đỏ */
}
.cancel-button:hover {
  background: #C62828; /* Đỏ đậm */
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(211, 47, 47, 0.3);
}

.checkout-button {
  background: #7B1FA2; /* Tím */
}
.checkout-button:hover {
  background: #6A1B9A; /* Tím đậm */
  transform: translateY(-1px);
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
  background: rgba(231, 194, 125, 0.2); /* Vàng nhạt trong suốt */
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
  background: #E7C27D; /* Vàng nhạt */
  border-radius: 4px;
}

.reservation-list-wrapper::-webkit-scrollbar-thumb:hover {
  background: #8B5E3C; /* Nâu gỗ */
}

/* Responsive design */
@media (max-width: 768px) {
  .reservation-management {
    padding-right: 10px;
  }
  
  .header {
    padding: 15px;
  }
  
  .actions {
    flex-wrap: wrap;
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
    padding: 8px 10px;
  }
  
  .col-actions {
    width: 150px;
  }
}

@media (max-width: 480px) {
  .header h1 {
    font-size: 20px;
  }
  
  .actions {
    gap: 8px;
  }
  
  .actions input,
  .actions select {
    padding: 8px;
    font-size: 14px;
  }
  
  .reservation-table {
    font-size: 12px;
  }
  
  .reservation-table th,
  .reservation-table td {
    padding: 6px 8px;
  }
  
  .col-actions button {
    padding: 4px 8px;
    font-size: 12px;
  }
}
</style>