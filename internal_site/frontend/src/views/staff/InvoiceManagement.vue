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
  background: #1a1a1a;
  height: 100vh;
  overflow: hidden;
}

.reservation-management {
  flex: 1;
  margin: 0;
  padding: 0;
  background-color: #1a1a1a;
  color: #ffffff;
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
  background-color: #1a1a1a;
  padding: 20px;
  border-bottom: 1px solid #444;
}

.header h1 {
  text-align: center;
  color: #ffffff;
  margin: 0 0 20px 0;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.actions input,
.actions select {
  padding: 10px;
  border: 1px solid #555;
  border-radius: 5px;
  background-color: #444;
  color: #fff;
}

.actions input[type="date"] {
  background-color: #444;
  cursor: pointer;
}

.actions select {
  background-color: #444;
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
  background-color: #333;
  border-radius: 8px;
  overflow: hidden;
}

.reservation-table thead {
  background-color: #444;
  top: 0;
  z-index: 5;
}

.reservation-table th,
.reservation-table td {
  padding: 10px 15px;
  height: 35px;
  text-align: center;
  border-bottom: 1px solid #555;
  border-right: 1px solid #555;
}

.reservation-table th:last-child,
.reservation-table td:last-child {
  border-right: none;
}

.reservation-table th {
  font-weight: bold;
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
  color: #28a745;
}

.status.completed {
  color: #6c757d;
}

/* Màu sắc phương thức thanh toán */
.status.qr {
  color: #17a2b8;
}

.status.cash {
  color: #ffc107;
}

.status.card {
  color: #007bff;
}
</style>