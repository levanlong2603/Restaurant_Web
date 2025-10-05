<template>
    <div class="reservation-box">
        <div class="body" v-if="reservations.length > 0">
            <h2 class="header-title">Danh sách đặt bàn </h2>
            <div 
                class="item" 
                v-for="reservation in reservations" 
                :key="reservation.id" 
                :class="{'clickable': reservation.status === 'pending' || reservation.status === 'preparing' ||  reservation.status === 'serving'}"
                @click="(reservation.status === 'pending' || reservation.status === 'preparing' ||  reservation.status === 'serving') && showDetails(reservation)"
            >
                <div class="info">
                    <p class="status">Trạng thái: {{ getStatusLabel(reservation.status) }}</p>
                    <p class="reservation-time">Thời gian đặt: {{ formatDate(reservation.reservation_time) }}</p>
                    <p class="seats">Bàn: {{ reservation.tableNumber }}</p>
                </div>
                <div class="actions">
                    <button class="checkin-btn" v-if="reservation.status === 'preparing'" 
                        @click="checkin(reservation)">
                        Check in
                    </button>
                    <button v-if="reservation.status === 'preparing' || reservation.status === 'pending' "
                        class="cancel-btn" 
                        @click="cancelReservation(reservation)">
                        Hủy đặt bàn
                    </button>
                    <button v-if="reservation.status === 'serving'"
                        class="order-btn" 
                        @click="addOrderItems(reservation)">
                        Gọi món
                    </button>
                    <button v-if="reservation.status === 'serving'"
                        class="checkout-btn" 
                        @click="checkOut(reservation)">
                        Check out
                    </button>
                    <button v-if="reservation.status === 'paid'"
                        class="customer-left-btn" 
                        @click="customerLeft(reservation)">
                        Khách ra về
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
export default {
    props: {
        reservations: {
            type: Array,
            default: () => [] // Mặc định là mảng rỗng nếu không có dữ liệu
        }
    },
    methods: {
        getStatusLabel(status) {
            const statusMapping = {
                pending: "Chờ duyệt",
                preparing: "Đặt trước",
                confirmed: "Đã xác nhận",
                cancelled: "Đã hủy",
                completed: "Hoàn thành",
            };
            return statusMapping[status] || status;
        },
        showDetails(reservation) {
            this.$emit('update:mode', 'table');
            this.$emit('update:reservation_id', reservation.id);
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


        // Thiếu phương thức reservereservation, cần thêm nếu dùng
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
        async addOrderItems(reservation){
            try {
                console.log("ID:", reservation);
                localStorage.setItem('selectedReservation', JSON.stringify(reservation));
                this.$router.push(`/order`);
            }
            catch{

            }
        },
        async checkOut(reservation){
            try {
                localStorage.setItem('selectedReservation', JSON.stringify(reservation));
                this.$router.push(`/checkout`);
            }
            catch{
                
            }
        },
        async customerLeft(reservation){
            try {

            }
            catch{
                
            }
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

<style>
.reservation-box{
    width: 800px;
    color: #ffffff;
    border-radius: 5px;
    padding: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
} 

.body{
    display: flex;
    flex-direction: column;
    gap: 30px;
    justify-content: center;
    align-items: center;
    width: 80%;
}

.item{
    display: flex;
    background-color: #161616;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #4f4f4f63;
    border-radius: 10px;
    padding: 15px;
    width: 100%;
}


.clickable {
    cursor: pointer;
}

.clickable:hover {
    background-color: #3d3d3d;
}

.info{
    /* display: flex; */
    flex-direction: column;
}
.actions{
    display: flex;
    gap: 10px;
}
.checkin-btn, .cancel-btn, .checkout-btn, .order-btn, .customer-left-btn{
    padding: 5px 10px;
    border: none;
    border-radius: 5px;
    background-color: #ffffff;
    cursor: pointer;
    width: 100px;
    height: 40px;
}

.checkin-btn {
    background-color: #00c92f;
    color: #ffffff;
}

.cancel-btn{
    background-color: #c90000;
    color: #ffffff;
}

.checkout-btn, .order-btn, .customer-left-btn{
    background-color: #0300a4;
    color: #ffffff;
}

.checkin-btn:hover {
    transform: scale(1.05);
    background-color: #00c92fb3;
    color: #ffffff;
}

.cancel-btn:hover {
    transform: scale(1.05);
    background-color: #c90000b3;
    color: #ffffff;
}
</style>