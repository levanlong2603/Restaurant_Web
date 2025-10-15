<template>
    <div class="main-container">
    <Navigation @sidebar-toggle="handleSidebarToggle" />
    <div class="reservation-management" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <div class="header">
        <h1>Table</h1>
        <div class="select-table">
          <select v-model="table_id" class="cart" Chọn bàn>
            <option :value="''" disabled>Chọn bàn</option>
            <option v-for="table in tables" :key="table.id" :value="table.id">Bàn {{ table.id }}</option>
          </select>
          <button @click="refresh">Refresh</button>
        </div>
      </div>
      <div class="container">
        <div class="menu">
          <MenuDetail 
          :reservation="reservation"
          @update:cartItems="updateCartItems"
          :localCartItems="cartItems"
          />
        </div>
        <div class="order">
          <OrderDetail 
          :reservation="reservation"
          :cartItems="cartItems"
          @update:cartItems="updateCartItems"
          />
        </div>
          
      </div>
    </div>
  </div>
</template>
  
<script>
import axios from 'axios';
import MenuDetail from '../../components/MenuDetail.vue';
import OrderDetail from '../../components/OrderDetail.vue';
import Navigation from '../../components/Navigation.vue';

  
  export default {
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
      };
    },
    mounted() {
      document.documentElement.style.backgroundColor = '#1a1a1a';
      this.fetchTables();
      this.fetchReservation();
      console.log("fetch table:",this.tables);
    },
    methods: {
      handleSidebarToggle(isCollapsed) {
        console.log('Sidebar is collapsed:', isCollapsed);
        this.isSidebarCollapsed = isCollapsed;
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
            this.$emit('update:reservation_id', this.reservation.id);
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
          this.reservation_id = this.reservation.id;
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
  background: #FFF8E7; /* Trắng kem */
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
  margin: 0 50px;
}

.header{
  background-color: #FFF8E7; /* Trắng kem */
  align-items: center;
}
.header h1{
  color: #6B4226; /* Nâu đất */
  text-align: center;
  margin-top: 20px;
  margin-bottom: 10px;
  font-weight: bold;
  text-shadow: 0 0 5px #E7C27D, 0 0 30px #E7C27D; /* Hiệu ứng vàng */
}

.select-table{
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 10px;
  outline: none;
}


.header select{
  width: 100px;
  height: 30px;
  background: rgba(255, 248, 231, 0.8); /* Trắng kem trong suốt */
  border: 1px solid #8B5E3C; /* Nâu gỗ */
  color: #3B2F2F; /* Đen nâu */
  border-radius: 8px;
  outline: none;
  padding: 0 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.header select:focus {
  border-color: #E7C27D; /* Vàng nhạt */
  background: #FFF8E7; /* Trắng kem */
  box-shadow: 0 0 0 3px rgba(231, 194, 125, 0.3);
}

.header button{
  width: 100px;
  height: 35px;
  background: #8B5E3C; /* Nâu gỗ */
  box-shadow: 0 4px 15px rgba(107, 66, 38, 0.3); /* Bóng nâu */
  color: #FFF8E7; /* Trắng kem */
  border-radius: 8px;
  margin-left: 30px;
  border: 1px solid #E7C27D; /* Viền vàng */
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.header button:hover{
  background: #6B4226; /* Nâu đất */
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(107, 66, 38, 0.4);
}

.container {
  display: flex;
  gap: 40px;
  margin-top: 20px;
}

.cart{
  color: #3B2F2F; /* Đen nâu */
}

.menu {
  width: 50%;
  display: flex;
}

.order {
  width: 50%;
}

/* Responsive design */
@media (max-width: 768px) {
  .reservation-management {
    margin: 0 20px;
    padding-right: 10px;
  }
  
  .container {
    flex-direction: column;
    gap: 20px;
  }
  
  .menu, .order {
    width: 100%;
  }
  
  .select-table {
    flex-direction: column;
    gap: 15px;
  }
  
  .header button {
    margin-left: 0;
  }
}

@media (max-width: 480px) {
  .reservation-management {
    margin: 0 10px;
  }
  
  .header h1 {
    font-size: 24px;
    margin-top: 15px;
  }
  
  .header select, .header button {
    width: 120px;
  }
  
  .container {
    gap: 15px;
    margin-top: 15px;
  }
}
</style>