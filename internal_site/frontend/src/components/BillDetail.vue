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
          <tr v-for="item in aggregatedItems" :key="item.menu.menu_id">
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
        const menuId = item.menu.menu_id;
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
  background: linear-gradient(180deg, #8B5E3C, #6B4226); /* Nâu gỗ đến nâu đất */
  padding: 20px 30px;
  border-radius: 20px;
  color: #FFF8E7; /* Trắng kem cho chữ chính */
  height: 85vh;
  overflow: auto;
  box-shadow: 0 8px 25px rgba(107, 66, 38, 0.3);
  border: 1px solid rgba(231, 194, 125, 0.2); /* Thêm viền vàng nhạt */
}

.bill-detail-header {
  border-bottom: 2px solid rgba(231, 194, 125, 0.5); /* Đường phân cách */
  padding-bottom: 15px;
  margin-bottom: 20px;
}

.bill-detail-header h2 {
  color: #FFF8E7; /* Trắng kem */
  text-align: center;
  margin-top: 0;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-size: 24px;
}

.bill-item-container {
  background: rgba(255, 248, 231, 0.15); /* Trắng kem trong suốt */
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(231, 194, 125, 0.4); /* Vàng nhạt */
  transition: all 0.3s ease;
}

.bill-item-container:hover {
  background: rgba(255, 248, 231, 0.25);
  transform: translateY(-2px);
  border-color: rgba(231, 194, 125, 0.7);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.bill-item-container p {
  margin: 8px 0;
  color: #FFF8E7; /* Trắng kem */
  font-weight: 500;
}

.bill-item-container .item-label {
  color: #E7C27D; /* Vàng nhạt cho nhãn */
  font-weight: 600;
}

.bill-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  background: rgba(255, 248, 231, 0.1);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(231, 194, 125, 0.3);
}

.bill-table th {
  background: linear-gradient(135deg, #E7C27D, #D4B15F); /* Gradient vàng */
  border: 1px solid rgba(139, 94, 60, 0.3);
  padding: 12px 10px;
  text-align: center;
  color: #3B2F2F; /* Đen nâu */
  font-weight: bold;
  font-size: 14px;
}

.bill-table td {
  border: 1px solid rgba(231, 194, 125, 0.2);
  padding: 12px 10px;
  text-align: center;
  color: #FFF8E7; /* Trắng kem */
  font-weight: 500;
  background: rgba(255, 248, 231, 0.05);
  transition: background 0.3s ease;
}

.bill-table tr:hover td {
  background: rgba(231, 194, 125, 0.15);
}

.bill-table .total-row td {
  background: rgba(231, 194, 125, 0.2);
  font-weight: bold;
  color: #FFF8E7;
}

.bill-total {
  margin-top: 25px;
  text-align: right;
  padding: 20px;
  background: linear-gradient(135deg, rgba(231, 194, 125, 0.3), rgba(139, 94, 60, 0.2));
  border-radius: 12px;
  border: 1px solid rgba(231, 194, 125, 0.4);
  backdrop-filter: blur(10px);
}

.bill-total p {
  font-size: 20px;
  color: #FFF8E7; /* Trắng kem */
  font-weight: bold;
  margin: 0;
}

.bill-total .total-amount {
  color: #E7C27D; /* Vàng nhạt cho số tiền */
  font-size: 24px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.error-message {
  color: #FFE0B2;
  text-align: center;
  margin: 20px 0;
  background: rgba(183, 28, 28, 0.2);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid rgba(255, 224, 178, 0.4);
  backdrop-filter: blur(10px);
}

/* Scrollbar tùy chỉnh */
.bill-detail::-webkit-scrollbar {
  width: 8px;
}

.bill-detail::-webkit-scrollbar-track {
  background: rgba(255, 248, 231, 0.1);
  border-radius: 4px;
}

.bill-detail::-webkit-scrollbar-thumb {
  background: #E7C27D;
  border-radius: 4px;
}

.bill-detail::-webkit-scrollbar-thumb:hover {
  background: #D4B15F;
}

/* Nút hành động */
.bill-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 25px;
}

.bill-button {
  background: linear-gradient(135deg, #E7C27D, #D4B15F);
  color: #3B2F2F;
  border: none;
  padding: 12px 25px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  min-width: 120px;
}

.bill-button:hover {
  background: linear-gradient(135deg, #D4B15F, #C19B3C);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.bill-button.secondary {
  background: rgba(255, 248, 231, 0.2);
  color: #FFF8E7;
  border: 1px solid #E7C27D;
}

.bill-button.secondary:hover {
  background: rgba(231, 194, 125, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .bill-detail {
    padding: 15px 20px;
    height: 80vh;
  }
  
  .bill-table {
    font-size: 14px;
  }
  
  .bill-table th,
  .bill-table td {
    padding: 8px 6px;
  }
}
</style>