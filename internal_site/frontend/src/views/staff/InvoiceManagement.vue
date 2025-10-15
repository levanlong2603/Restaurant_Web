<template>
  <div class="main-container">
    <Navigation @sidebar-toggle="handleSidebarToggle" />
    <div class="reservation-management" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <!-- Header không cố định -->
      <div class="header">
        <h1>Danh sách hóa đơn</h1>
        <div class="actions">
            <input type="text" v-model="searchQuery" placeholder="Tìm kiếm..." @input="debouncedSearch" />
            <input type="date" v-model="selectedDate" @change="fetchBills" />
            <select v-model="selectedMethod" @change="filterByMethod">
                <option value="">Tất cả phương thức</option>
                <option value="bank_transfer">Quét mã QR</option>
                <option value="cash">Tiền mặt</option>
                <option value="credit_card">Thẻ</option>
            </select>
            <select v-model="selectedStatus" @change="filterByStatus">
                <option value="">Tất cả trạng thái</option>
                <option value="paid">Đã thanh toán</option>
                <option value="completed">Hoàn thành</option>
            </select>
            <button @click="refresh">Làm mới</button>
        </div>
      </div>

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
            <tr v-for="(bill, index) in filteredBills" :key="bill.id">              
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
    </div>
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
  },
  methods: {
    handleSidebarToggle(isCollapsed) {
      console.log('Sidebar is collapsed:', isCollapsed);
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

.actions input[type="date"] {
  background: rgba(255, 248, 231, 0.8); /* Trắng kem trong suốt */
  cursor: pointer;
}

.actions select {
  background: rgba(255, 248, 231, 0.8); /* Trắng kem trong suốt */
}

.actions button {
  padding: 10px 20px;
  background: #8B5E3C; /* Nâu gỗ */
  color: #FFF8E7; /* Trắng kem */
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(107, 66, 38, 0.3); /* Bóng nâu */
  border: 1px solid #E7C27D; /* Viền vàng */
}

.actions button:hover {
  background: #6B4226; /* Nâu đất */
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(107, 66, 38, 0.4);
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
  text-align: center;
  border-bottom: 1px solid rgba(231, 194, 125, 0.3); /* Vàng nhạt trong suốt */
  border-right: 1px solid rgba(231, 194, 125, 0.3); /* Vàng nhạt trong suốt */
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

.col-method {
  width: 120px;
  white-space: nowrap;
}

.col-total {
  width: 120px;
}

/* Đảm bảo các ô trong tbody khớp với thead */
.reservation-table td {
  vertical-align: middle;
}

.reservation-table td.col-status .status,
.reservation-table td.col-method .status {
  font-weight: bold;
}

/* Màu sắc trạng thái */
.status.paid {
  color: #388E3C; /* Xanh lá đậm */
  background-color: rgba(56, 142, 60, 0.1);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.status.completed {
  color: #6B4226; /* Nâu đất */
  background-color: rgba(107, 66, 38, 0.1);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  opacity: 0.8;
}

/* Màu sắc phương thức thanh toán */
.status.bank_transfer {
  color: #1976D2; /* Xanh dương */
  background-color: rgba(25, 118, 210, 0.1);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.status.cash {
  color: #F57C00; /* Cam */
  background-color: rgba(245, 124, 0, 0.1);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.status.credit_card {
  color: #7B1FA2; /* Tím */
  background-color: rgba(123, 31, 162, 0.1);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
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
}

@media (max-width: 480px) {
  .header h1 {
    font-size: 20px;
  }
  
  .actions {
    gap: 8px;
  }
  
  .actions input,
  .actions select,
  .actions button {
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
}
</style>