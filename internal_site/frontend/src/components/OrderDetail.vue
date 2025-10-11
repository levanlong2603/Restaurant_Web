<template>
    <div class="order-detail">
        <div class="order-detail-header">
            <h2>Chi tiết đơn hàng </h2>
            <p v-if="reservation">Bàn: {{ reservation.tableNumber }}</p>
            <p v-else>Vui lòng chọn bàn</p>
        </div>
        <div class="container">
        
            <div class="order-item-container" v-if="orderItems.length > 0">
                <table class="order-table">
                    <thead>
                        <tr>
                            <th>Tên món</th>
                            <th>SL</th>
                            <th>Ghi chú</th>
                            <th class="center">Lưu</th>
                            <th class="center">Xóa</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in orderItems" :key="item.id">
                            <td>{{ item.menu.name }}</td>
                            <td>
                                <input
                                    type="number"
                                    v-model="item.quantity"
                                    class="quantity-input"
                                />
                            </td>
                            <td> <input v-model="item.note" class="note-input" /></td>
                            <td>
                                <img
                                    src="@/assets/save-icon.svg"
                                    alt="Save Icon"
                                    class="icon"
                                    @click="updateOrderItem(item)"
                                />
                            </td>
                            <td><img src="@/assets/trash-icon.svg" alt="Reset Icon" class="icon" @click="deleteOrderItem(item.id)"/></td>
                        </tr>
                    </tbody>
                </table>
                <div class="checkout-btn-container"> 
                    <button @click="checkOut" class="btn-checkout">Thanh toán</button>
                </div>
            </div>
                
            <div class="cart-item-container" v-if="localCartItems.length > 0">
                <h3>Chờ xác nhận</h3>
                <table class="order-table">
                    <thead>
                        <tr>
                            <th>Tên món</th>
                            <th>SL</th>
                            <th>Ghi chú</th>
                            <th class="center">Xóa</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in localCartItems" :key="item.id">
                            <td>{{ item.name }}</td>
                            <td>
                                <input
                                    type="number"
                                    v-model="item.quantity"
                                    class="quantity-input"
                                />
                            </td>
                            <td> <input v-model="item.note" class="note-input" /></td>
                            <td><img src="@/assets/trash-icon.svg" alt="Reset Icon" class="icon" @click="removeLocalCartItem(item.id)"/></td>
                        </tr>
                    </tbody>
                </table>
                <button @click="addOrderItem" class="btn-confirm">Xác nhận</button>

            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
export default {
    name: 'OrderDetail',
    props: {
        cartItems: {
            type: Array,
            required: true,
        },
        reservation: {
            type: Object,
            default: null,
        },
    },
    data() {
        return {
            newOrder: {
                menu_id: '',
                quantity: '',
                note: ''
            },
            editingItem: null,
            orderItems: [],
            localCartItems: [],
            reservation_id: null,
        };
    },
    methods: {
        async fetchOrderItems() {
            try {
                if(!this.reservation_id){
                    this.orderItems = [];
                    this.localCartItems = [];
                    return;
                }
                const response = await axios.get(`http://localhost:3000/order-item/${this.reservation_id}`, {
                    headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                console.log(response.data);
                this.orderItems = response.data['orderItems'];
                console.log(this.orderItems);
            } catch (error) {
                console.log('Lỗi khi tải danh sách món ăn', 'error');
            }
        },
        async addOrderItem() {
            try {
                const orderData = {
                    reservation_id: this.reservation_id,
                    items: this.localCartItems.map(item => ({
                        menu_id: item.id,
                        quantity: item.quantity,
                        note: item.note,
                    })),
                }
                console.log('orderData:', orderData);
                console.log('localCartItems:', this.localCartItems);
                const response = await axios.post('http://localhost:3000/order-item', orderData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                this.fetchOrderItems();
                this.localCartItems = [];
                this.$emit('update:cartItems', this.localCartItems);
            } catch (error) {
                console.log(error.response?.data?.message || 'Lỗi khi thêm món ăn', 'error');
            }
        },
        editItem(item) {
            this.editingItem = item.id;
        },
        async updateOrderItem(item) {
            try {
                const response = await axios.put(`http://localhost:3000/order-item/update/${item.id}`, {
                    quantity: item.quantity,
                    note: item.note,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
                console.log('Cập nhật món ăn thành công!', 'success');
            } catch (error) {
                console.log(error.response?.data?.message || 'Lỗi khi cập nhật món ăn', 'error');
            }
        },
        async deleteOrderItem(id) {
            try {
                await axios.delete(`http://localhost:3000/order-item/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                this.orderItems = this.orderItems.filter(item => item.id !== id);
                console.log('Xóa món ăn thành công!', 'success');
            } catch (error) {
                console.log(error.response?.data?.message || 'Lỗi khi xóa món ăn', 'error');
            }
        },
        removeLocalCartItem(id) {
            this.localCartItems = this.localCartItems.filter(item => item.id !== id);
            this.$emit('update:cartItems', this.localCartItems); // sync về parent nếu cần
        },
        
        showMessage(message, type) {
            this.$emit('show-message', { message, type });
        },
        checkOut() {
            localStorage.setItem('selectedReservation', JSON.stringify(this.reservation));
            this.$router.push('/checkout');
        },
        
    },
    mounted() {
        this.fetchOrderItems();
        console.log('Đã gọi hàm mounted');
        console.log('reservation_id:', this.reservation_id);
        console.log('orderItems:', this.orderItems);
    },
    watch: {
        reservation: {
            handler(newReservation) {
                if (!newReservation) {
                    this.orderItems = [];
                    this.localCartItems = [];
                    return;
                }
                this.reservation_id = newReservation.id;
                this.fetchOrderItems();
                console.log('reservation_id:', this.reservation_id);
            },
            immediate: true,
            deep: true
        },

        cartItems: {
            handler(newCartItems) {
            this.localCartItems = newCartItems;
            },
            immediate: true,
            deep: true
        }
    }

};
</script>

