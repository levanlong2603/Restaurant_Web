<template>
    <div class="reservation-management">
        <div class="reservation-container" v-if="reservations.length > 0">
            <h2 class="header-title">Danh sách đặt bàn</h2>
            <div class="reservation-list">
                <div 
                    class="reservation-card" 
                    v-for="reservation in reservations" 
                    :key="reservation.id" 
                    :class="{
                        'clickable': reservation.status === 'pending' || reservation.status === 'preparing' || reservation.status === 'serving',
                        'status-pending': reservation.status === 'pending',
                        'status-preparing': reservation.status === 'preparing',
                        'status-serving': reservation.status === 'serving',
                        'status-paid': reservation.status === 'paid'
                    }"
                    @click="(reservation.status === 'pending' || reservation.status === 'preparing' || reservation.status === 'serving') && showDetails(reservation)"
                >
                    <div class="reservation-header">
                        <span class="reservation-id">#{{ reservation.id }}</span>
                        <span class="status-badge" :class="'status-' + reservation.status">
                            {{ getStatusLabel(reservation.status) }}
                        </span>
                    </div>
                    
                    <div class="reservation-info">
                        <div class="info-item">
                            <i class="fas fa-clock"></i>
                            <span class="label">Thời gian đặt:</span>
                            <span class="value">{{ formatDate(reservation.reservation_time) }}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-users"></i>
                            <span class="label">Số lượng khách:</span>
                            <span class="value">{{ reservation.guest_count }} người</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-utensils"></i>
                            <span class="label">Bàn:</span>
                            <span class="value">{{ reservation.tableNumber }}</span>
                        </div>
                        <div class="info-item" v-if="reservation.customer_name">
                            <i class="fas fa-user"></i>
                            <span class="label">Khách hàng:</span>
                            <span class="value">{{ reservation.customer_name }}</span>
                        </div>
                    </div>
                    
                    <div class="reservation-actions">
                        <button class="btn btn-checkin" v-if="reservation.status === 'preparing'" 
                            @click.stop="checkin(reservation)">
                            <i class="fas fa-sign-in-alt"></i>
                            Check in
                        </button>
                        <button v-if="reservation.status === 'preparing' || reservation.status === 'pending'"
                            class="btn btn-cancel" 
                            @click.stop="cancelReservation(reservation)">
                            <i class="fas fa-times"></i>
                            Hủy
                        </button>
                        <button v-if="reservation.status === 'serving'"
                            class="btn btn-order" 
                            @click.stop="addOrderItems(reservation)">
                            <i class="fas fa-utensils"></i>
                            Gọi món
                        </button>
                        <button v-if="reservation.status === 'serving'"
                            class="btn btn-checkout" 
                            @click.stop="checkOut(reservation)">
                            <i class="fas fa-cash-register"></i>
                            Thanh toán
                        </button>
                        <button v-if="reservation.status === 'paid'"
                            class="btn btn-complete" 
                            @click.stop="customerLeft(reservation)">
                            <i class="fas fa-sign-out-alt"></i>
                            Hoàn tất
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="empty-state" v-else>
            <i class="fas fa-calendar-times"></i>
            <h3>Chưa có đơn đặt bàn</h3>
            <p>Hiện tại không có đơn đặt bàn nào</p>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'ReservationManagement',
    props: {
        reservations: {
            type: Array,
            default: () => []
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
                serving: "Đang phục vụ",
                paid: "Đã thanh toán"
            };
            return statusMapping[status] || status;
        },
        
        showDetails(reservation) {
            this.$emit('update:mode', 'table');
            this.$emit('update:reservation_id', reservation.id);
        },
        
        async cancelReservation(reservation) {
            if (!confirm('Bạn có chắc chắn muốn hủy đơn đặt bàn này?')) {
                return;
            }
            
            try {
                const response = await axios.put(`http://localhost:3000/reservation/cancel`, {
                    reservation_id: reservation.id,
                }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                
                if (response) {
                    this.showNotification('Hủy đặt bàn thành công', 'success');
                }
                window.location.reload();
            } catch (error) {
                console.error('Lỗi khi hủy đặt bàn:', error);
                this.showNotification(error.response?.data?.message || 'Không thể hủy đặt bàn', 'error');
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
                    this.showNotification('Check-in thành công', 'success');
                }
                window.location.reload();
            } catch (error) {
                console.error('Lỗi khi check-in:', error);
                this.showNotification(error.response?.data?.message || 'Không thể check-in', 'error');
            }
        },
        
        addOrderItems(reservation) {
            try {
                localStorage.setItem('selectedReservation', JSON.stringify(reservation));
                this.$router.push(`/order`);
            } catch (error) {
                console.error('Lỗi khi chuyển trang:', error);
                this.showNotification('Không thể chuyển trang', 'error');
            }
        },
        
        checkOut(reservation) {
            try {
                localStorage.setItem('selectedReservation', JSON.stringify(reservation));
                this.$router.push(`/checkout`);
            } catch (error) {
                console.error('Lỗi khi chuyển trang:', error);
                this.showNotification('Không thể chuyển trang', 'error');
            }
        },
        
        customerLeft(reservation) {
            if (!confirm('Xác nhận khách đã rời đi?')) {
                return;
            }
            // Thêm logic xử lý khi khách rời đi
            this.showNotification('Đã xác nhận khách rời đi', 'success');
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
        
        showNotification(message, type) {
            // Có thể tích hợp thư viện notification hoặc dùng alert đơn giản
            alert(message);
        }
    }
};
</script>

<style scoped>
.reservation-management {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
}

.reservation-container {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    padding: 25px;
}

.header-title {
    color: #c62828;
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 25px;
    text-align: center;
    border-bottom: 2px solid #c62828;
    padding-bottom: 15px;
}

.reservation-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.reservation-card {
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.reservation-card.clickable {
    cursor: pointer;
}

.reservation-card.clickable:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(198, 40, 40, 0.15);
    border-color: #c62828;
}

.reservation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #f0f0f0;
}

.reservation-id {
    color: #666;
    font-size: 14px;
    font-weight: 500;
}

.status-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
}

.status-pending {
    background: #fff3e0;
    color: #f57c00;
    border: 1px solid #f57c00;
}

.status-preparing {
    background: #e3f2fd;
    color: #1976d2;
    border: 1px solid #1976d2;
}

.status-serving {
    background: #e8f5e8;
    color: #2e7d32;
    border: 1px solid #2e7d32;
}

.status-paid {
    background: #f3e5f5;
    color: #7b1fa2;
    border: 1px solid #7b1fa2;
}

.reservation-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 12px;
    margin-bottom: 20px;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
}

.info-item i {
    width: 16px;
    color: #c62828;
    text-align: center;
}

.label {
    color: #666;
    font-weight: 500;
    min-width: 100px;
}

.value {
    color: #333;
    font-weight: 600;
}

.reservation-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 100px;
    justify-content: center;
}

.btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.btn-checkin {
    background: #2e7d32;
    color: white;
}

.btn-checkin:hover {
    background: #1b5e20;
}

.btn-cancel {
    background: #c62828;
    color: white;
}

.btn-cancel:hover {
    background: #b71c1c;
}

.btn-order {
    background: #ed6c02;
    color: white;
}

.btn-order:hover {
    background: #e65100;
}

.btn-checkout {
    background: #1565c0;
    color: white;
}

.btn-checkout:hover {
    background: #0d47a1;
}

.btn-complete {
    background: #7b1fa2;
    color: white;
}

.btn-complete:hover {
    background: #6a1b9a;
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #666;
}

.empty-state i {
    font-size: 64px;
    color: #c62828;
    margin-bottom: 20px;
}

.empty-state h3 {
    font-size: 20px;
    margin-bottom: 10px;
    color: #333;
}

.empty-state p {
    font-size: 14px;
}

/* Responsive Design */
@media (max-width: 768px) {
    .reservation-management {
        padding: 15px;
    }
    
    .reservation-container {
        padding: 15px;
    }
    
    .reservation-info {
        grid-template-columns: 1fr;
    }
    
    .reservation-actions {
        flex-direction: column;
    }
    
    .btn {
        width: 100%;
    }
    
    .reservation-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
}

@media (max-width: 480px) {
    .header-title {
        font-size: 20px;
    }
    
    .info-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }
    
    .label {
        min-width: auto;
    }
}
</style>