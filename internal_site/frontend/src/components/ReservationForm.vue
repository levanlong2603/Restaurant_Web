<template>
    <div class="search-bar">
      <div class="search-bar-header">
        <div class="tab-group">
          <a>Đặt bàn</a>
          <button @click="resetAll" class="reset-button">
            <img src="@/assets/reset-icon.svg" alt="Reset Icon" class="icon" />
          </button>
        </div>
      </div>
  
      <div class="search-bar-content">
        <div class="reserve-content">
          <input type="datetime-local" v-model="timeSearch" />
          <div class="phone-number-input">
              <input
                type="tel"
                v-model="phoneNumber"
                placeholder="Nhập số điện thoại"
                maxlength="11"
              />
              <p v-if="phoneError" style="color: red; font-size: small; margin-bottom: 0;">
                Số điện thoại không hợp lệ
              </p>

              <img 
                src="@/assets/search-icon.svg" 
                alt="Search Icon" 
                class="search-icon" 
                @click="searchReservation"
              />
          </div>
          <input v-model="name" placeholder="Nhập tên" />
          <input v-model="num_people" placeholder="Nhập số người ăn" type="number" min="1" />
          <select v-model="reservation_status" @change="filterReservations" >
            <option value="">Trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="preparing">Đặt trước</option>
            <option value="serving">Đang phục vụ</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
          <button @click="searchTables">Tìm bàn</button>
          <button @click="updateReservation">Xác nhận</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  
  export default {
    props: {
      reservation_id: {
        type: Number,
        default: 0  // Cung cấp giá trị mặc định
      },
      selected_tables: {
        type: Array,
        default: () => []
      },
    },
    data() {
      return {
        phoneNumber: '',
        name: '',
        timeSearch: '',
        num_people: '',
        reserved_table: [],
        tables: [],
        reservation_status: '',
        reservations: [],
        cur_reservation: '',
        phoneError: false
      };
    },
    methods: {
      validatePhone() {
        const pattern = /^[0-9]{10,11}$/;
        this.phoneError = !pattern.test(this.phoneNumber);
      },

      async searchTables() {
        try {
          const response = await axios.get('http://localhost:3000/table', {
            params: { searchTime: this.timeSearch },
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
  
          this.tables = response.data.tables.map((table) => ({
            id: table.id,
            name: `Bàn ${table.id}`,
            seats: table.id % 2 === 0 ? 4 : 2,
            status: table.status.toLowerCase(),
            reservationTime: table.reservationTime,
            reservation_id: table.reservation_id || '',
          }));
  
          // Phát ra sự kiện để truyền tables lên component cha
          this.$emit('update:tables', this.tables);
          this.$emit('update:mode', "table");
        } catch (error) {
          console.error('Lỗi khi tải danh sách bàn:', error);
        }
      },
      async resetSearch() {
        this.name = '';
        this.timeSearch = getCurrentVNTime();
        this.num_people = '';
        await this.searchTables();
        this.$emit('update:tables', this.tables); // Cập nhật lại tables rỗng khi reset
        this.$emit('update:mode', 'table');
      },
      resetAll(){
        window.location.reload();
      },
      UpdateReservationID() {
        this.name = this.reservations.find(reservation => reservation.id === this.reservation_id)?.customer?.name || '';
        this.num_people = this.reservations.find(reservation => reservation.id === this.reservation_id)?.num_people || '';
        this.timeSearch = this.reservations.find(res => res.id === this.reservation_id)?.reservation_time
        ? this.formatDate(this.reservations.find(res => res.id === this.reservation_id)?.reservation_time)
        : this.getCurrentVNTime();
        this.tables = this.reservations.find(reservation => reservation.id === this.reservation_id)?.tables || [];
        this.reservation_status = this.reservations.find(reservation => reservation.id === this.reservation_id)?.status || '';
      },
      async searchReservation() {
        if (!this.phoneNumber.trim()) {
          alert("Vui lòng nhập số điện thoại!");
          return;
        }
        try {          
          const response = await axios.get(`http://localhost:3000/reservation/search?phoneNumber=${this.phoneNumber}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          this.reservations = response.data.reservations.map((reservation) => ({
            ...reservation,
            tableNumber: reservation.details?.length
              ? reservation.details.map((table) => table.table_id).join(', ')
              : 'Chưa xác định',
          }));
          this.$emit('update:reservations', this.reservations);
          this.$emit('update:mode', 'reservation');
        } catch (error) {
          this.reservations = [];
          this.$emit('update:reservations', this.reservations);
          this.$emit('update:mode','table');
          // window.location.reload();
          if (error.response) {
            console.error("Chi tiết lỗi từ server:", error.response.data);
            alert(`${error.response.data.message || "Không thể tìm kiếm đặt bàn"}`);
          } else {
            alert("Không thể kết nối đến server, vui lòng thử lại!");
          }        
        }
      },
      async reserve(){
        try {
          console.log("Đặt bàn tại thời gian", this.timeSearch);
          const response = await axios.post('http://localhost:3000/reservation', {
            name: this.name,
            phoneNumber: this.phoneNumber,
            reservation_time: this.timeSearch,
            num_people: this.num_people,
            tables: this.selected_tables,
            status: this.reservation_status,
          }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          alert('Đặt bàn thành công!');
          this.searchTables();
          window.location.reload();
        } catch (error) {
          console.error('Lỗi khi đặt bàn:', error);
          if (error.response) {
            console.error("Chi tiết lỗi từ server:", error.response.data);
            alert(`${error.response.data.message || "Không thể đặt bàn"}`);
          } else {
            alert("Không thể kết nối đến server, vui lòng thử lại!");
          }
        }
      },
      async updateReservation() {
        try {
          if (!this.reservation_id && !this.cur_reservation) {
            this.reserve();
            return;
          }
          const response = await axios.put(`http://localhost:3000/reservation/update/${
            this.cur_reservation 
              ? this.cur_reservation 
              : this.reservation_id
          }`, {
            status: this.reservation_status,
            reservation_time: this.timeSearch,
            num_people: this.num_people,
            tables: this.selected_tables,
          }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          this.cur_reservation = null;
          if(response){
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
      async cancelReservation(){
        try {
          if (!this.reservation_id) {
            alert('Vui lòng chọn đặt bàn cần hủy!');
            return;
          }
        const response = await axios.put(`http://localhost:3000/reservation/cancel`, {
            reservation_id: this.reservation_id,
        }, {
            headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        if(response){
            alert(response.data.message);
        }
        window.location.reload();
        } catch (error) {
        console.error('Lỗi khi cập nhật đặt bàn:', error);
        if (error.response) {
          console.error("Chi tiết lỗi từ server:", error.response.data);
          alert(`${error.response.data.message || "Không thể hủy đặt bàn"}`);
        } else {
            alert("Không thể kết nối đến server, vui lòng thử lại!");
        }
        }
      },
      
      getCurrentVNTime() {
        const now = new Date();
        const vnOffset = 7 * 60 * 60 * 1000;
        return new Date(now.getTime() + vnOffset).toISOString().slice(0, 16);
      },
      formatDate(dateString) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date input');
        }
        // Điều chỉnh múi giờ Việt Nam (Asia/Ho_Chi_Minh)
        const vnDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
        const year = vnDate.getFullYear();
        const month = String(vnDate.getMonth() + 1).padStart(2, '0');
        const day = String(vnDate.getDate()).padStart(2, '0');
        const hours = String(vnDate.getHours()).padStart(2, '0');
        const minutes = String(vnDate.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      },
      async getallReservations(){
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('http://localhost:3000/reservation/all', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("get all:",response.data);

          this.reservations = response.data;
        } catch (error) {
          console.error('Error fetching reservations:', error);
        }
      },
      async fetchReservaion(){
        console.log(localStorage);
        if(localStorage.getItem('selectedReservation')){
          const reservation = JSON.parse(localStorage.getItem('selectedReservation'));
          this.cur_reservation = reservation.id;
          this.phoneNumber = reservation.customer?.phoneNumber || '';
          this.name = reservation.customer?.name || '';
          this.num_people = reservation?.num_people || '';
          this.timeSearch = reservation?.reservation_time
          ? this.formatDate(reservation?.reservation_time)
          : this.getCurrentVNTime();
          this.tables = reservation?.tables || [];
          this.reservation_status = reservation?.status || '';
          localStorage.removeItem('selectedReservation');
        }
      },
    },
    mounted() {
      this.searchTables(); // Tự động tải danh sách bàn khi component được gắn
      this.searchTime = this.getCurrentVNTime();
      this.fetchReservaion();
      if(!this.phoneNumber){
        this.getallReservations()
      };

    },
    watch: {
      timeSearch() {
        this.searchTables();
      },
      reservation_id: {
        handler(newVal, oldVal) {
          if (newVal !== oldVal) {
            console.log(`reservation_id thay đổi: ${oldVal} -> ${newVal}`);
            this.UpdateReservationID();
          }
        },
        immediate: true, 
        deep: true,
      },
    },
  }

  </script>

<style scoped>
.search-bar { 
  display: flex; 
  flex-direction: column; 
  gap: 15px; 
  padding: 15px; 
  background: linear-gradient(135deg, #c2aa77, #b29a67); 
  border-radius: 10px; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.1); 
  width: 200px; 
  border: 1px solid rgba(251, 207, 103, 0.3);
}

.tab-group { 
  display: flex; 
  gap: 20px; 
  border-bottom: 2px solid #fbcf67; 
  padding-bottom: 5px; 
  margin-bottom: 10px; 
  justify-content: center;
}

.tab-group a { 
  color: #2b2b2b; 
  text-decoration: none; 
  font-size: 16px; 
  font-weight: 500; 
  padding-bottom: 5px; 
  transition: color 0.3s; 
}

.tab-group a:hover {
  color: #fbcf67;
}

.reset-button { 
  display: inline;
  background: none; 
  border: none; 
  cursor: pointer; 
  padding: 0; 
  color: #2b2b2b;
}

.search-content, .reserve-content { 
  display: flex; 
  flex-direction: column; 
  gap: 13px; 
}

.search-bar-content input { 
  padding: 8px; 
  border: 1px solid #fbcf67; 
  border-radius: 5px; 
  font-size: 14px; 
  background: rgba(255, 255, 255, 0.2); 
  color: #2b2b2b; 
  width: 90%; 
  outline: none;
}

.search-bar-content input::placeholder {
  color: rgba(43, 43, 43, 0.6);
}

.phone-number-input { 
  position: relative;
  width: 100%;
}

.phone-number-input input{
  width: 90%;
  outline: none;
}

.phone-number-input .search-icon { 
  position: absolute; 
  right: 10px; 
  top: 50%; 
  transform: translateY(-50%); 
  width: 20px; 
  height: 20px; 
  cursor: pointer; 
  color: #2b2b2b;
}

select {
  padding: 8px; 
  border: 1px solid #fbcf67; 
  border-radius: 5px; 
  font-size: 14px; 
  background: rgba(255, 255, 255, 0.2); 
  color: #2b2b2b; 
  cursor: pointer;
  outline: none;
}

option {
  background: #c2aa77;  
  color: #2b2b2b;       
}

option:checked {
  background: #fbcf67;
  color: #2b2b2b;
}

.search-bar-content button { 
  padding: 10px; 
  border: none; 
  background: #fbcf67; 
  color: #2b2b2b; 
  border-radius: 5px; 
  cursor: pointer; 
  transition: background 0.3s; 
  font-weight: bold;
}

.search-bar-content button:hover { 
  background: #e5b756; 
}

.reserve-content button { 
  background: #28a745; 
  color: white;
}

.reserve-content button:hover { 
  background: #218838; 
}
</style>