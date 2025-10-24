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
              <input type="date" v-model="selectedDate" class="date-filter" @change="fetchBills" />
              <select v-model="selectedMethod" class="status-filter" @change="filterByMethod">
                <option value="">Tất cả phương thức</option>
                <option value="bank_transfer">Quét mã QR</option>
                <option value="cash">Tiền mặt</option>
                <option value="credit_card">Thẻ</option>
              </select>
              <select v-model="selectedStatus" class="status-filter" @change="filterByStatus">
                <option value="">Tất cả trạng thái</option>
                <option value="paid">Đã thanh toán</option>
                <option value="completed">Hoàn thành</option>
              </select>
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
          <!-- Danh sách hóa đơn (dạng bảng) -->
          <div class="reservation-list-wrapper">
            <table class="reservation-table">
              <thead>
                <tr>
                  <th class="col-id">STT</th>
                  <th class="col-customer">Khách hàng</th>
                  <th class="col-time">Thời gian</th>
                  <th class="col-people">Số người</th>
                  <th class="col-table">Bàn</th>
                  <th class="col-status">Trạng thái</th>
                  <th class="col-method">Phương thức</th>
                  <th class="col-total">Tổng tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(bill, index) in filteredBills" :key="bill.bill_id">              
                  <td class="col-id">{{ index + 1 }}</td>
                  <td class="col-customer">{{ bill.customerName }}</td>
                  <td class="col-time">{{ formatDate(bill.time) }}</td>
                  <td class="col-people">{{ bill.reservation?.num_people || 'N/A' }}</td>
                  <td class="col-table">{{ bill.tableNumber }}</td>
                  <td class="col-status">
                    <span class="status" :class="bill.reservation?.status">
                      {{ statusDisplayNames[bill.reservation?.status] || bill.reservation?.status || 'Không xác định' }}
                    </span>
                  </td>
                  <td class="col-method">
                    <span class="status" :class="bill.payment_method">
                      {{ paymentMethodDisplayNames[bill.payment_method] || 'Không xác định' }}
                    </span>
                  </td>
                  <td class="col-total">{{ formatCurrency(bill.total_amount) }}</td>
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
  name: 'BillManagement',
  components: {
    Navigation,
  },
  data() {
    return {
      searchQuery: '',
      selectedStatus: '',
      selectedDate: '',
      bills: [],
      isSidebarCollapsed: false,
      statusDisplayNames: {
        paid: 'Đã thanh toán',
        completed: 'Hoàn thành',
      },
      paymentMethodDisplayNames: {
        bank_transfer: 'Quét mã QR',
        cash: 'Tiền mặt',
        credit_card: 'Thẻ',
      },
      selectedMethod: '',
      currentDateTime: '',
      updateDateTimeInterval: null,
    };
  },
  computed: {
    filteredBills() {
      let filtered = this.bills;

      if (this.searchQuery) {
        filtered = filtered.filter(
          (bill) =>
            bill.customerName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            bill.tableNumber.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            this.paymentMethodDisplayNames[bill.payment_method]?.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }

      if (this.selectedStatus) {
        filtered = filtered.filter((bill) => bill.reservation?.status === this.selectedStatus);
      }

      if(this.selectedDate) {
        const selectedDate = new Date(this.selectedDate).setHours(0, 0, 0, 0);
        filtered = filtered.filter((bill) => {
          const billDate = new Date(bill.time).setHours(0, 0, 0, 0);
          return billDate === selectedDate;
        });
      }
      
      if (this.selectedMethod) {
        filtered = filtered.filter((bill) => bill.payment_method === this.selectedMethod);
      }
      

      return filtered;
    },
  },
  created() {
    this.debouncedSearch = debounce(this.search, 300);
    this.fetchBills();
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
    refresh() {
      window.location.reload();
    },
    async fetchBills() {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('http://localhost:3000/bill/all/day', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log(response.data);
  
          this.bills = response.data.map((bill) => ({
            ...bill,
            customerName: bill.reservation.customer?.name || 'Khách hàng không xác định',
            tableNumber: bill.reservation.details?.length
            ? bill.reservation.details.map((detail) => detail.table_id).join(', ')
            : 'Chưa xác định',
          }));
          console.log(this.bills);
        } catch (error) {
          console.error('Error fetching bills:', error);
        }
    },
    search() {
      // Trigger filtering via computed property
    },
    filterByStatus() {
      // Trigger filtering via computed property
    },
    filterByMethod() {
      // Trigger filtering via computed property
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
    formatCurrency(amount) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(amount);
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

.col-method {
  width: 150px;
  white-space: nowrap;
}

.col-total {
  width: 150px;
  white-space: nowrap;
}

/* Đảm bảo các ô trong tbody khớp với thead */
.reservation-table td {
  vertical-align: middle;
}

.reservation-table td.col-status .status,
.reservation-table td.col-method .status {
  font-weight: bold;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;
}

/* Màu sắc trạng thái */
.status.paid {
  color: #388E3C;
  background-color: rgba(56, 142, 60, 0.1);
}

.status.completed {
  color: #6B4226;
  background-color: rgba(107, 66, 38, 0.1);
  opacity: 0.7;
}

/* Màu sắc phương thức thanh toán */
.status.bank_transfer {
  color: #1976D2;
  background-color: rgba(25, 118, 210, 0.1);
}

.status.cash {
  color: #F57C00;
  background-color: rgba(245, 124, 0, 0.1);
}

.status.credit_card {
  color: #7B1FA2;
  background-color: rgba(123, 31, 162, 0.1);
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
  
  .container-reservation {
    padding-top: 200px;
  }
}
</style>