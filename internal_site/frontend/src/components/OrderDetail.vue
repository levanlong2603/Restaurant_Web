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

<style scoped>
.order-detail {
    background: linear-gradient(180deg, #2b2b2b, #1f2020);
    padding: 20px 30px;
    border-radius: 20px;
    color: #ffffff;
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
}

.cart-item-container h3{
    text-align: center;
    margin-top: 10px;
}

.checkout-btn-container{
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
}

.btn-checkout{
    background-color: #ae9a64;
    color: white;
    border-radius: 5px;
    height: 30px;
    width: 100px;
    margin: 10px 0px;
    cursor: pointer;
}

.btn-confirm{
    background-color: #ae9a64;
    color: white;
    border-radius: 5px;
    height: 30px;
    width: 80px;
    margin: 10px 0px;
    cursor: pointer;
}

.order-detail h2{
    color: white;
    text-align: center;
    margin-top: 0px;
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
    /* align-items: center;
    justify-self: center;
    width: 85%; */
}

.order-item.header {
  font-weight: bold;
  background-color: #f0f0f0;
  border-bottom: 2px solid #ddd;
}

.order-item span {
  font-size: 16px;
  color: #ffffff;
   padding: 10px;
}


.cart-item span {
  font-size: 14px;
  color: #ffffff;
}

.order-item-container .note-input,
.cart-item-container .note-input {
    width: 100px;
    height: 20px;
    background-color: #2a2a2a;
    border: none;
    color: white;
    border-radius: 5px;
    text-align: left;
    outline: none;
}

.quantity-input {
    width: 30px;
    height: 20px;
    background-color: #2a2a2a;
    border: none;
    color: white;
    border-radius: 5px;
    text-align: center;
    outline: none;
}


.cart-item img {
    width: 20px;
    height: 20px;
    cursor: pointer;
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
}

.order-table td {
  border: 1px solid #747474;
  padding: 2px;
  text-align: center;
}

.order-table th{
  border: 1px solid #ccc;
  padding: 5px;
  text-align: center;
}

.order-table th {
  background-color: #464646;
}

.order-table input {
    width: 40px;
    height: 20px;
    background-color: #2a2a2a;
    border: none;
    color: white;
    border-radius: 5px;
    text-align: center;
}

.order-table img {
    width: 20px;
    cursor: pointer;
}

.right {
  text-align: right;
}

</style>