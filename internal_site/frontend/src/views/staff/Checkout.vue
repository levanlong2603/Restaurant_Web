<template>
  <div class="main-container">
    <Navigation @sidebar-toggle="handleSidebarToggle" />
    <section class="dashboard" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <!-- Header giống mẫu trong hình -->
      <div class="dashboard-header">
        <div class="header-main">
          <div class="header-title-section">
            <h1>THANH TOÁN</h1>
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
              <button class="refresh-button" @click="fetchTables">
                <i class="fas fa-sync-alt"></i> Làm mới
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="container-reservation">
        <section class="payment-management">
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          <div class="payment-container">
            <div class="bill-section">
              <BillDetail 
                :billDetails="billDetails"
              />
            </div>
            <div class="payment-section">
              <PaymentDetail 
                :reservation="reservation"
                :billDetails="billDetails"
                @update:paymentStatus="handlePaymentStatus"
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
import BillDetail from '../../components/BillDetail.vue';
import PaymentDetail from '../../components/PaymentDetail.vue';
import Navigation from '../../components/Navigation.vue';

export default {
  name: 'Payment',
  components: {
    BillDetail,
    PaymentDetail,
    Navigation,
  },
  data() {
    return {
      tables: [],
      table_id: '',
      billDetails: null,
      errorMessage: '',
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
        this.billDetails = null;
        this.errorMessage = '';
        const token = localStorage.getItem('token');
        if (!token) {
          this.errorMessage = 'Token không tồn tại. Vui lòng đăng nhập lại.';
          return;
        }

        const response = await axios.get('http://localhost:3000/table/served', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.tables = response.data['servedTables'] || [];
        if (!this.tables.length) {
          this.errorMessage = 'Không có bàn nào đang được phục vụ.';
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách bàn:', error.response?.data || error.message);
        this.errorMessage = error.response?.data?.message || 'Lỗi khi tải danh sách bàn. Vui lòng kiểm tra token hoặc API.';
      }
    },
    async fetchReservationId() {
      try {
        if (!this.table_id) {
          this.errorMessage = 'Vui lòng chọn bàn.';
          return;
        }
        this.errorMessage = '';
        const response = await axios.get(`http://localhost:3000/reservation/table/${this.table_id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        this.reservation = {
          ...response.data,
          customerName: response.data.customer?.name || 'Khách hàng không xác định',
          tableNumber: response.data.details.map(table => table.table_id).join(', '),
        };
        await this.fetchBillDetails();
      } catch (error) {
        console.error('Lỗi khi tải thông tin đặt bàn:', error.response?.data || error.message);
        this.errorMessage = 'Lỗi khi tải thông tin đặt bàn. Vui lòng kiểm tra API hoặc token.';
      }
    },
    async fetchBillDetails() {
      try {
        if (!this.reservation?.reservation_id) {
            this.errorMessage = 'Không có reservation_id để tải hóa đơn.';
            return;
          }
        this.errorMessage = '';
        const response = await axios.get(`http://localhost:3000/bill/${this.reservation.reservation_id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        this.billDetails = {
          ...response.data.reservation,
          tableNumber: response.data.reservation.details.map(table => table.table_id).join(', '),
          total_amount: response.data.reservation.orderItems
              ? response.data.reservation.orderItems.reduce((total, item) => {
                  // Only include non-cancelled items
                  if (item.status === 'cancelled') {
                    return total;
                  }
                  const price = parseFloat(item.menu?.price || 0);
                  const quantity = item.quantity || 0;
                  return total + price * quantity;
                }, 0)
              : 0, 
        };
      } catch (error) {
        console.error('Lỗi khi tải chi tiết hóa đơn:', error.response?.data || error.message);
        this.errorMessage = 'Lỗi khi tải chi tiết hóa đơn. Vui lòng kiểm tra API.';
      }
    },
    async handlePaymentStatus(paymentData) {
        try {
          console.log('Payment data:', paymentData);
          await axios.post(`http://localhost:3000/bill/`, {
              reservation_id: this.reservation.reservation_id,
              paymethod: paymentData.method,
              reservation_status: paymentData.status,
              total_amount: this.billDetails.total_amount,
          }, {
              headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
          });
          
          await this.fetchBillDetails();
          alert('Thanh toán thành công!');
          window.location.reload();
        } catch (error) {
        const apiMsg = error.response?.data?.message || error.response?.data || error.message;
        console.error('Lỗi khi cập nhật trạng thái thanh toán:', apiMsg);
        this.errorMessage = `Lỗi thanh toán: ${apiMsg}`;
        alert(`Lỗi thanh toán: ${apiMsg}`);
        }
    },
    async fetchReservation(){
      const raw = localStorage.getItem('selectedReservation');
      if (!raw) return;
      try {
        const reservation = JSON.parse(raw);
        // normalize older objects that might still have `id`
        if (reservation.id && !reservation.reservation_id) {
          reservation.reservation_id = reservation.id;
        }

        this.reservation = reservation;

        this.billDetails = {
          ...reservation ,
          tableNumber: (reservation.details || []).map(table => table.table_id).join(', '),
        };
        if ((reservation.details || []).length > 0) {
          this.table_id = reservation.details[0].table_id; // select the first table
        }
        // Only fetch bill details if we have a reservation_id
        if (this.reservation?.reservation_id) await this.fetchBillDetails();
      } catch (err) {
        console.error('Invalid selectedReservation in localStorage', err);
      } finally {
        localStorage.removeItem('selectedReservation'); // Clear the reservation after using it
      }
    }
  },
  watch: {
    table_id: {
      handler(new_table_id) {
        console.log('Table ID changed:', new_table_id); // Debug
        if (new_table_id) {
          this.fetchReservationId();
        } else {
          this.billDetails = null;
          this.errorMessage = '';
        }
      },
      immediate: true,
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
  padding: 2rem;
  background-color: #FFF8E7;
  transition: margin-left 0.3s ease;
}

/* Header giống mẫu trong hình */
.dashboard-header {
  background: linear-gradient(135deg, #8B5E3C, #6B4226);
  padding: 1.5rem 2rem;
  margin: -2rem -2rem 2rem -2rem;
  border-bottom: 1px solid #E7C27D;
  box-shadow: 0 4px 15px rgba(107, 66, 38, 0.3);
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
  padding: 0;
  background-color: #FFF8E7;
  color: #3B2F2F;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.payment-management {
  padding: 0px;
  color: #3B2F2F;
  width: 100%;
  margin: 0 auto;
  z-index: 1;
}

.payment-container {
  display: flex;
  gap: 40px;
  margin-top: 20px;
  padding: 0 20px;
}

.bill-section {
  width: 50%;
}

.payment-section {
  width: 50%;
}

.error-message {
  color: #D32F2F;
  text-align: center;
  margin: 20px 0;
  font-weight: 500;
  background-color: rgba(211, 47, 47, 0.1);
  padding: 15px;
  border-radius: 8px;
  border-left: 3px solid #D32F2F;
  margin: 20px auto;
  max-width: 90%;
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
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }
  
  .dashboard-header {
    padding: 1rem;
    margin: -1rem -1rem 1rem -1rem;
  }
  
  .header-title-section h1 {
    font-size: 1.6rem;
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
  
  .payment-container {
    flex-direction: column;
    gap: 20px;
    padding: 0 10px;
  }
  
  .bill-section, .payment-section {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .header-title-section h1 {
    font-size: 1.4rem;
  }
  
  .current-time {
    font-size: 0.9rem;
  }
  
  .payment-container {
    gap: 15px;
  }
  
  .refresh-button {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
}
</style>