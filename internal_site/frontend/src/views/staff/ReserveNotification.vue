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
            <tr v-for="reservation in filteredReservations" :key="reservation.id">
              <td class="col-id">{{ reservation.id }}</td>
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
                console.log("ID:", reservation.id);
                const response = await axios.put(`http://localhost:3000/reservation/cancel`, {
                    reservation_id: reservation.id,
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
                console.log("ID:", reservation.id);
                console.log(localStorage.getItem('token'));
                const response = await axios.put(
                    `http://localhost:3000/reservation/checkin/${reservation.id}`,
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
        localStorage.setItem('selectedReservation', JSON.stringify(reservation));
        this.$router.push(`/checkout`);
      }
      else {
        try{
          console.log("ID:", reservation.id);
          const response = await axios.put(`http://localhost:3000/reservation/left/${reservation.id}`, null, {
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
            console.log("ID:", reservation.id);
            const response = await axios.put(`http://localhost:3000/reservation/cancel`, {
                reservation_id: reservation.id,
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
        const response = await axios.put(
          `http://localhost:3000/reservation/checkin/${reservation.id}`,
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
  background: #c2aa77;
  height: 100vh;
  overflow: hidden;
}

.reservation-management {
  flex: 1;
  margin: 0;
  padding: 0;
  background-color: #c2aa77;
  color: #2b2b2b;
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
  background-color: #c2aa77;
  padding: 20px;
  border-bottom: 1px solid #fbcf67;
}

.header h1 {
  text-align: center;
  color: #2b2b2b;
  margin: 0 0 20px 0;
  font-weight: bold;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.actions input,
.actions select {
  padding: 10px;
  border: 1px solid #fbcf67;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  color: #2b2b2b;
  font-weight: 500;
  transition: all 0.3s ease;
}

.actions input:focus,
.actions select:focus {
  border-color: #e5b756;
  background: rgba(255, 255, 255, 0.3);
  outline: none;
}

.actions select {
  background: rgba(255, 255, 255, 0.2);
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
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(251, 207, 103, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.reservation-table thead {
  background: rgba(251, 207, 103, 0.3);
  top: 0;
  z-index: 5;
}

.reservation-table th,
.reservation-table td {
  padding: 10px 15px;
  height: 35px;
  text-align: left;
  border-bottom: 1px solid rgba(251, 207, 103, 0.3);
  border-right: 1px solid rgba(251, 207, 103, 0.3);
  text-align: center;
  font-weight: 500;
}

.reservation-table th:last-child,
.reservation-table td:last-child {
  border-right: none;
}

.reservation-table th {
  font-weight: bold;
  color: #2b2b2b;
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
}

.reservation-table td.col-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* Màu sắc trạng thái */
.status.pending {
  color: #ff9800;
}

.status.preparing {
  color: #2196f3;
}

.status.serving {
  color: #4caf50;
}

.status.completed {
  color: #2b2b2b;
  opacity: 0.7;
}

/* Nút hành động */
.col-actions button {
  color: #2b2b2b;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.order-button {
  background: #fbcf67;
}
.order-button:hover {
  background: #e5b756;
  transform: translateY(-1px);
}

.approve-button {
  background: #4caf50;
  color: white;
}
.approve-button:hover {
  background: #45a049;
  transform: translateY(-1px);
}

.checkin-button {
  background: #2196f3;
  color: white;
}
.checkin-button:hover {
  background: #1976d2;
  transform: translateY(-1px);
}

.cancel-button {
  background: #d84315;
  color: white;
}
.cancel-button:hover {
  background: #c62828;
  transform: translateY(-1px);
}

.checkout-button {
  background: #2196f3;
  color: white;
}
.checkout-button:hover {
  background: #1976d2;
  transform: translateY(-1px);
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
  background: rgba(255, 255, 255, 0.15);
}
</style>