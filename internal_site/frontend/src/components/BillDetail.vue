<template>
  <div class="bill-detail">
    <div class="bill-detail-header">
      <h2>Chi tiết hóa đơn</h2>
    </div>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    <p v-else-if="billDetails && billDetails.total_amount === 0">Khách hàng chưa gọi món</p>
    <div class="bill-item-container" v-else-if="billDetails">
      <p><strong>Khách hàng: </strong>{{ billDetails.customer.name }}</p>
      <p><strong>Số điện thoại: </strong>{{ billDetails.customer.phoneNumber }}</p>

      <p><strong>Bàn:</strong> {{ billDetails.tableNumber }}</p>
      <p><strong>Trạng thái:</strong> {{ billDetails.payment_status === 'completed' ? 'Đã thanh toán' : 'Chưa thanh toán' }}</p>
      <table class="bill-table">
        <thead>
          <tr>
            <th>Tên món</th>
            <th>SL</th>
            <th>Giá</th>
            <th>Tổng</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in aggregatedItems" :key="item.menu.id">
            <td>{{ item.menu.name }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ formatPrice(item.menu.price) }} </td>
            <td>{{ formatPrice(item.menu.price * item.quantity) }} </td>
          </tr>
        </tbody>
      </table>
      <div class="bill-total">
        <p><strong>Tổng cộng:</strong> {{ formatPrice(billDetails.total_amount) }} VNĐ</p>
      </div>
    </div>
    <p v-else>Vui lòng chọn bàn để xem chi tiết hóa đơn.</p>
  </div>
</template>

<script>
export default {
  name: 'BillDetail',
  props: {
    billDetails: {
      type: Object,
      default: null,
    },
  },
  computed: {
    aggregatedItems() {
      if (!this.billDetails || !this.billDetails.orderItems) return [];
      const itemMap = new Map();
      this.billDetails.orderItems.forEach(item => {
        const menuId = item.menu.id;
        if (itemMap.has(menuId)) {
          const existing = itemMap.get(menuId);
          existing.quantity += item.quantity;
        } else {
          itemMap.set(menuId, {
            menu: item.menu,
            quantity: item.quantity,
          });
        }
      });
      return Array.from(itemMap.values());
    },
    totalAmount() {
      if (!this.billDetails || !this.billDetails.orderItems) return 0;
      return this.billDetails.orderItems.reduce((total, item) => total + item.menu.price * item.quantity, 0);
    },
    formatPrice() {
      return (price) => new Intl.NumberFormat('vi-VN').format(parseFloat(price));
    },
  },
  methods: {
    formatPrice(price) {
      return new Intl.NumberFormat('vi-VN').format(parseFloat(price));
    },
  },
};
</script>

<style scoped>
.bill-detail {
  background: linear-gradient(180deg, #2b2b2b, #1f2020);
  padding: 20px 30px;
  border-radius: 20px;
  color: #ffffff;
  height: 85vh;
  overflow: auto;
}

.bill-detail-header h2 {
  color: white;
  text-align: center;
  margin-top: 0;
}

.bill-item-container {
  border-radius: 8px;
  padding-top: 10px;
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.bill-item-container p {
  margin: 10px 0;
}

.bill-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.bill-table th {
  background-color: #c2aa77;
  border: 1px solid #ccc;
  padding: 5px;
  text-align: center;
}

.bill-table td {
  border: 1px solid #747474;
  padding: 5px;
  text-align: center;
}

.bill-total {
  margin-top: 20px;
  text-align: right;
}

.bill-total p {
  font-size: 18px;
  color: #ae9a64;
}

.error-message {
  color: #ff5555;
  text-align: center;
  margin: 20px 0;
}
</style>