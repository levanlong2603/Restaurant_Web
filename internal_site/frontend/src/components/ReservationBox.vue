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
    color: #FFF8E7; /* Trắng kem */
    border-radius: 15px;
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #8B5E3C, #6B4226); /* Nâu gỗ đến nâu đất */
    border: 1px solid rgba(231, 194, 125, 0.4); /* Vàng nhạt */
    box-shadow: 0 8px 25px rgba(107, 66, 38, 0.3);
    backdrop-filter: blur(10px);
} 

.body{
    display: flex;
    flex-direction: column;
    gap: 25px;
    justify-content: center;
    align-items: center;
    width: 90%;
}

.item{
    display: flex;
    background: linear-gradient(135deg, rgba(139, 94, 60, 0.9), rgba(107, 66, 38, 0.9)); /* Nâu gỗ trong suốt */
    justify-content: space-between;
    align-items: center;
    border: 1px solid rgba(231, 194, 125, 0.4); /* Vàng nhạt */
    border-radius: 12px;
    padding: 20px;
    width: 100%;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
    backdrop-filter: blur(5px);
    position: relative;
    overflow: hidden;
}

.item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #E7C27D, #D4AF37); /* Vàng nhạt */
    opacity: 0.7;
}

.clickable {
    cursor: pointer;
}

.clickable:hover {
    background: linear-gradient(135deg, rgba(151, 106, 72, 0.9), rgba(119, 78, 50, 0.9));
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    border-color: rgba(231, 194, 125, 0.7);
}

.info{
    flex-direction: column;
    flex: 1;
}

.info h3 {
    color: #FFF8E7; /* Trắng kem */
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: bold;
}

.info p {
    color: #F5E3B3; /* Be - nhạt hơn cho text phụ */
    margin: 4px 0;
    font-size: 14px;
    font-weight: 500;
}

.actions{
    display: flex;
    gap: 12px;
    align-items: center;
}

/* Base button styles */
.checkin-btn, .cancel-btn, .checkout-btn, .order-btn, .customer-left-btn{
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    width: 110px;
    height: 42px;
    color: #FFF8E7; /* Trắng kem */
    font-weight: bold;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
}

/* Specific button styles */
.checkin-btn {
    background: linear-gradient(135deg, #28a745, #218838);
    color: #FFF8E7;
}

.cancel-btn{
    background: linear-gradient(135deg, #dc3545, #c82333);
    color: #FFF8E7;
}

.checkout-btn, .order-btn, .customer-left-btn{
    background: linear-gradient(135deg, #E7C27D, #D4AF37); /* Vàng nhạt */
    color: #3B2F2F; /* Đen nâu */
}

/* Hover effects */
.checkin-btn:hover {
    transform: translateY(-2px) scale(1.02);
    background: linear-gradient(135deg, #34ce57, #28a745);
    box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
}

.cancel-btn:hover {
    transform: translateY(-2px) scale(1.02);
    background: linear-gradient(135deg, #e04a59, #dc3545);
    box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
}

.checkout-btn:hover, .order-btn:hover, .customer-left-btn:hover {
    transform: translateY(-2px) scale(1.02);
    background: linear-gradient(135deg, #D4AF37, #C19B2E);
    box-shadow: 0 6px 20px rgba(231, 194, 125, 0.4);
}

/* Active states */
.checkin-btn:active, .cancel-btn:active, .checkout-btn:active, 
.order-btn:active, .customer-left-btn:active {
    transform: translateY(0) scale(1);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

/* Disabled states */
.checkin-btn:disabled, .cancel-btn:disabled, .checkout-btn:disabled, 
.order-btn:disabled, .customer-left-btn:disabled {
    background: rgba(160, 160, 160, 0.5);
    color: rgba(255, 248, 231, 0.5);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

/* Status indicators */
.status-indicator {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 8px;
}

.status-confirmed {
    background: #28a745;
}

.status-pending {
    background: #ffc107;
}

.status-cancelled {
    background: #dc3545;
}

.status-completed {
    background: #E7C27D; /* Vàng nhạt */
}

/* Responsive design */
@media (max-width: 768px) {
    .reservation-box {
        width: 95%;
        padding: 15px;
    }
    
    .item {
        flex-direction: column;
        gap: 15px;
        text-align: center;
    }
    
    .actions {
        justify-content: center;
        flex-wrap: wrap;
    }
    
    .checkin-btn, .cancel-btn, .checkout-btn, .order-btn, .customer-left-btn {
        width: 100px;
        height: 38px;
        font-size: 13px;
        padding: 8px 12px;
    }
}

/* Animation for new reservations */
@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.item {
    animation: slideIn 0.3s ease-out;
}
</style>