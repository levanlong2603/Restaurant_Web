<template>
    <div class="main-container">
      <Navigation @sidebar-toggle="handleSidebarToggle" />
      <!-- <div class="reservation-management" :class="{ 'sidebar-collapsed': isSidebarCollapsed }"></div> -->
      <div class="payment-page">
        <div class="header">
          <h1>Thanh toán</h1>
          <div class="select-table">
            <select v-model="table_id" class="cart">
              <option value="" disabled>Chọn bàn</option>
              <option v-for="table in tables" :key="table.id" :value="table.id">Bàn {{ table.id }}</option>
            </select>
            <button @click="fetchTables" class="refresh-button">Làm mới</button>
          </div>
        </div>
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        <div class="container">
          <div class="bill">
            <BillDetail 
              :billDetails="billDetails"
            />
          </div>
          <div class="payment">
            <PaymentDetail 
              :reservation="reservation"
              :billDetails="billDetails"
              @update:paymentStatus="handlePaymentStatus"
            />
          </div>
        </div>
      </div>
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
      };
    },
    mounted() {
      document.documentElement.style.backgroundColor = '#1a1a1a';
      this.fetchTables();
      this.fetchReservation();
    },
    methods: {
      async fetchTables() {
        try {
          this.reservation_id = '';
          this.table_id = '';
          this.billDetails = null;
          this.errorMessage = '';
          const response = await axios.get('http://localhost:3000/table/served', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          this.tables = response.data['servedTables'] || [];
          if (!this.tables.length) {
            this.errorMessage = 'Không có bàn nào đang được phục vụ.';
          }
        } catch (error) {
          console.error('Lỗi khi tải danh sách bàn:', error.response?.data || error.message);
          this.errorMessage = 'Lỗi khi tải danh sách bàn. Vui lòng kiểm tra token hoặc API.';
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
            tableNumber: response.data.details.map(table => table.id).join(', '),
          };
          await this.fetchBillDetails();
        } catch (error) {
          console.error('Lỗi khi tải thông tin đặt bàn:', error.response?.data || error.message);
          this.errorMessage = 'Lỗi khi tải thông tin đặt bàn. Vui lòng kiểm tra API hoặc token.';
        }
      },
      async fetchBillDetails() {
        try {
          if (!this.reservation.id) {
            this.errorMessage = 'Không có reservation_id để tải hóa đơn.';
            return;
          }
          this.errorMessage = '';
          const response = await axios.get(`http://localhost:3000/bill/${this.reservation.id}`, {
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
                reservation_id: this.reservation.id,
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
          console.error('Lỗi khi cập nhật trạng thái thanh toán:', error.response?.data.message || error.message);
          alert("Lỗi thanh toán:", error.response?.data.message || error.message);
          }
      },
      async fetchReservation(){
        const reservation = JSON.parse(localStorage.getItem('selectedReservation'));
        if (reservation) {
          this.billDetails = {
            ...reservation ,
            tableNumber: reservation.details.map(table => table.table_id).join(', '),
          };
          if(reservation.details.length > 0) {
            this.table_id = reservation.details[0].table_id; // Assuming the first table is the one to be used
          }
          this.fetchBillDetails();
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
    padding-right: 20px; /* Cho khoảng trống bên phải bảng */
    transition: margin-left 0.3s ease; /* Hiệu ứng mượt mà khi sidebar thay đổi */
  }

  .reservation-management.sidebar-collapsed {
    margin-left: 10px; 
  }

  .payment-page {
    flex: 1;
    /* margin: 0 50px; */
    padding: 0 80px;
    background-color: #1a1a1a;
    color: #ffffff;
    display: flex;
    flex-direction: column;
    overflow-y: auto; /* Cho phép cuộn dọc */
  }

  .header {
    background-color: #1a1a1a;
    align-items: center;
    padding: 10px
  }
  
  .header h1 {
    color: white;
    text-align: center;
    margin-top: 20px;
    margin-bottom: 10px;
  }
  
  .select-table {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    margin-bottom: 10px;
    gap: 30px;
  }
  
  .header select {
    width: 100px;
    height: 30px;
    padding: 5px;
    border: 1px solid #464646;
    border-radius: 4px;
    background-color: #2a2a2a;
    color: #ffffff;
    outline: none;
  }
  
  .header .refresh-button {
    padding: 8px 16px;
    background-color: #ae9a64;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .header .refresh-button:hover {
    background-color: #8e7a4e;
  }
  
  .container {
    display: flex;
    gap: 40px;
    margin-top: 20px;
  }
  
  .cart {
    color: white;
  }
  
  .bill {
    width: 50%;
  }
  
  .payment {
    width: 50%;
  }
  
  .error-message {
    color: #ff5555;
    text-align: center;
    margin: 20px 0;
  }
  </style>