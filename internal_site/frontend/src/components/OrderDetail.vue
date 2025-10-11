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
                <tr>
                    <td colspan="4" style="text-align: center">
                        <div class="confirm-btn-container">
                        <button class="btn-confirm">Xác nhận</button>
                        </div>
                    </td>
                    </tr>

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

<style scoped>
.order-detail {
    background: linear-gradient(180deg, #c2aa77, #b29a67);
    padding: 20px 30px;
    border-radius: 20px;
    color: #2b2b2b;
    border: 1px solid rgba(251, 207, 103, 0.3);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.container{
    height: 85vh;
    overflow: auto;
    width: 100%;
}

.order-item-container {
    border-radius: 8px;
    padding-top: 0px;
    padding-bottom: 10px;
    margin-bottom: 10px;
}

.cart-item-container {
    padding-top: 10px;
    padding-bottom: 10px;
    margin-bottom: 10px;
    justify-items: center;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    border: 1px solid rgba(251, 207, 103, 0.3);
    margin: 10px 0;
}

.cart-item-container h3{
    text-align: center;
    margin-top: 10px;
    color: #2b2b2b;
}

.checkout-btn-container{
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
}

.btn-checkout{
    background: linear-gradient(135deg, #fbcf67, #e5b756);
    color: #2b2b2b;
    border-radius: 8px;
    height: 40px;
    width: 120px;
    margin: 10px 0px;
    cursor: pointer;
    border: none;
    font-weight: bold;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.btn-checkout:hover {
    background: linear-gradient(135deg, #e5b756, #d4a745);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.confirm-btn-container{
   display: flex;
    justify-content: center;
    align-items: center;
    margin: 15px 0;
    width: 100%;
}

.btn-confirm{
    background: linear-gradient(135deg, #fbcf67, #e5b756);
    color: #2b2b2b;
    border-radius: 8px;
    height: 40px;
    width: 120px;
    margin: 10px 0px;
    cursor: pointer;
    border: none;
    font-weight: bold;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.btn-confirm:hover {
    background: linear-gradient(135deg, #e5b756, #d4a745);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.order-detail h2{
    color: #2b2b2b;
    text-align: center;
    margin-top: 0px;
    font-weight: bold;
}

.order-item {
    display: grid;
    grid-template-columns: 4fr 1fr 1fr 1fr;
    gap: 10px;
    align-items: center;
    justify-self: center;
    width: 85%;
    padding: 0px 20px;
    margin-bottom: 5px;
}

.cart-item {
    display: grid;
    grid-template-columns:  8fr 4fr 1fr 1fr 1fr;
    gap: 10px;
    align-items: center;
    justify-self: center;
    width: 85%;
    padding: 0px 20px;
    margin-bottom: 5px;
}

.cart-item-detail1 {
    display: grid;
    grid-template-columns: 1fr 2fr 2fr ;
    gap: 10px;
}

.order-item.header {
  font-weight: bold;
  background: rgba(251, 207, 103, 0.3);
  border-bottom: 2px solid #fbcf67;
  border-radius: 6px;
  padding: 10px;
}

.order-item span {
  font-size: 16px;
  color: #2b2b2b;
  padding: 10px;
  font-weight: 500;
}

.cart-item span {
  font-size: 14px;
  color: #2b2b2b;
  font-weight: 500;
}

.order-item-container .note-input,
.cart-item-container .note-input {
    width: 100px;
    height: 25px;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid #fbcf67;
    color: #2b2b2b;
    border-radius: 5px;
    text-align: left;
    outline: none;
    padding: 0 8px;
}

.quantity-input {
    width: 40px;
    height: 25px;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid #fbcf67;
    color: #2b2b2b;
    border-radius: 5px;
    text-align: center;
    outline: none;
    font-weight: 500;
}

.cart-item img {
    width: 20px;
    height: 20px;
    cursor: pointer;
    filter: brightness(0.3);
}

.left {
  text-align: left;
}
.center {
  text-align: center;
}

.order-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.order-table td {
  border: 1px solid rgba(251, 207, 103, 0.4);
  padding: 8px;
  text-align: center;
  color: #2b2b2b;
  font-weight: 500;
}

.order-table th{
  border: 1px solid #fbcf67;
  padding: 10px;
  text-align: center;
}

.order-table th {
  background: #fbcf67;
  color: #2b2b2b;
  font-weight: bold;
}

.order-table input {
    width: 50px;
    height: 25px;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid #fbcf67;
    color: #2b2b2b;
    border-radius: 5px;
    text-align: center;
    font-weight: 500;
}

.order-table img {
    width: 20px;
    cursor: pointer;
    filter: brightness(0.3);
}

.right {
  text-align: right;
}

/* Thêm hiệu ứng hover cho các hàng */
.cart-item:hover, .order-item:not(.header):hover {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    transition: background 0.3s ease;
}

.order-table tr:hover td {
    background: rgba(251, 207, 103, 0.2);
}
</style>