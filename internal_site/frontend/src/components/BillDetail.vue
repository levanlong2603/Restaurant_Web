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
  background: linear-gradient(180deg, #c2aa77, #b29a67);
  padding: 20px 30px;
  border-radius: 20px;
  color: #2b2b2b;
  height: 85vh;
  overflow: auto;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.bill-detail-header h2 {
  color: #2b2b2b;
  text-align: center;
  margin-top: 0;
  font-weight: bold;
}

.bill-item-container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(251, 207, 103, 0.3);
}

.bill-item-container p {
  margin: 8px 0;
  color: #2b2b2b;
  font-weight: 500;
}

.bill-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  overflow: hidden;
}

.bill-table th {
  background-color: #fbcf67;
  border: 1px solid #e5b756;
  padding: 10px;
  text-align: center;
  color: #2b2b2b;
  font-weight: bold;
}

.bill-table td {
  border: 1px solid rgba(251, 207, 103, 0.4);
  padding: 10px;
  text-align: center;
  color: #2b2b2b;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.1);
}

.bill-total {
  margin-top: 25px;
  text-align: right;
  padding: 15px;
  background: rgba(251, 207, 103, 0.3);
  border-radius: 12px;
}

.bill-total p {
  font-size: 20px;
  color: #2b2b2b;
  font-weight: bold;
  margin: 0;
}

.error-message {
  color: #d84315;
  text-align: center;
  margin: 20px 0;
  background: rgba(216, 67, 21, 0.1);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(216, 67, 21, 0.3);
}

/* Thêm hiệu ứng hover cho các phần tử tương tác */
.bill-item-container:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

.bill-table tr:hover td {
  background: rgba(251, 207, 103, 0.2);
}
</style>