<template>
  <div class="payment-detail">
    <div class="payment-detail-header">
      <h2>Thanh toán</h2>
    </div>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
      <button v-if="errorMessage.includes('thời gian chờ') || errorMessage.includes('khởi tạo thanh toán')" @click="retryPayment" class="btn-retry">
        Thử lại
      </button>
    </div>

    <div class="payment-container" v-else-if="billDetails">
      <p><strong>Tổng cộng:</strong> {{ formatPrice(billDetails.total_amount) }} VNĐ</p>
      <p><strong>Trạng thái:</strong> {{ billDetails.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán' }}</p>
      <div class="payment-method" v-if="billDetails.status !== 'paid'">
        <h3>Chọn phương thức thanh toán</h3>
        <select v-model="paymentMethod" :disabled="billDetails.payment_status === 'completed'">
          <option value="" disabled>Chọn phương thức</option>
          <option value="bank_transfer">Quét mã QR</option>
          <option value="cash">Tiền mặt</option>
          <option value="credit_card">Thẻ tín dụng</option>
        </select>
        <p class="timeout-warning" v-if="paymentMethod === 'credit_card' || paymentMethod === 'bank_transfer'">
          Lưu ý: Vui lòng hoàn tất thanh toán trong vòng 15 phút.
        </p>
        <!-- Hiển thị QR / thông tin chuyển khoản khi chọn Quét mã QR -->
        <div class="qr-code" v-if="paymentMethod === 'bank_transfer'">
          <!-- The QR image should be placed at the public root: /vietqr.png -->
          <img src="/vietqr.png" alt="VietQR" v-if="true"/>
          <div class="account-info">
            <p><strong>Chủ tài khoản:</strong> LE VAN LONG</p>
            <p><strong>Số tài khoản:</strong> <span id="acct">3388826032004</span></p>
            <p style="font-size:13px;color:#ddd;">Bạn có thể quét mã QR ở trên hoặc sao chép số tài khoản để chuyển khoản.</p>
          </div>
        </div>
      </div>
      <label class="checkbox-label" v-if="billDetails.status !== 'paid'">
        <input 
          type="checkbox" 
          v-model="customerLeft" 
          @change="completeOrder"
        />
        Khách rời đi
      </label>
      <div class="payment-actions" v-if="billDetails.status !== 'paid'">
        <button 
          @click="processPayment" 
          :disabled="!paymentMethod || totalAmount === 0"
          class="btn-confirm"
        >
          Xác nhận thanh toán
        </button>
      </div>
      <div class="payment-actions" v-else>
        <button 
          @click="customerLeave" 
          class="btn-confirm"
        >
          Khách về 
        </button>
      </div>
    </div>
    <p v-else>Vui lòng chọn bàn để xử lý thanh toán.</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'PaymentDetail',
  props: {
    reservation: {
      type: [Number, String, Object],
      required: true,
    },
    billDetails: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      paymentMethod: '',
      errorMessage: '',
      customerLeft: true,
      reservation_status: 'completed',
    };
  },
  watch: {
    billDetails: {
      handler(newBill) {
        this.customerLeft = newBill?.payment_status !== 'completed' ? true : this.customerLeft;
      },
      deep: true,
    },
  },
  mounted() {
    // Lắng nghe thông báo từ tab mới
    window.addEventListener('message', this.handlePaymentResult);
  },
  beforeDestroy() {
    // Dọn dẹp listener khi component bị hủy
    window.removeEventListener('message', this.handlePaymentResult);
  },
  methods: {
    async initiatePayment() {
  try {
    this.errorMessage = '';
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Vui lòng đăng nhập để tiếp tục');

    if (!this.billDetails?.total_amount) throw new Error('Hóa đơn không hợp lệ hoặc số tiền bằng 0');

    const reservationId = this.reservation.id || this.reservation;

    const payload = {
      amount: parseInt(this.billDetails.total_amount),
      orderDescription: `Payment for reservation ${reservationId}`,
      orderType: 'billpayment',
      language: 'vn',
      bankCode: '',
      reservationId: this.reservation.id,
    };

    // Gửi yêu cầu tới backend để tạo link thanh toán
    const response = await axios.post(
      'http://localhost:3000/payment/create_payment_url',
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Mở URL VNPAY trong tab mới
    const paymentUrl = response.data.paymentUrl;
    if (paymentUrl) {
        window.open(paymentUrl, '_blank'); // hoặc location.href = paymentUrl nếu muốn redirect
      } else {
        throw new Error('Không nhận được URL thanh toán');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      this.errorMessage = errorMsg.includes('timeout')
        ? 'Giao dịch đã quá thời gian chờ thanh toán. Vui lòng thực hiện lại giao dịch.'
        : `Lỗi khi khởi tạo thanh toán: ${errorMsg}`;
    }
  },
    async processPayment() {
      try {
        this.errorMessage = '';
        // Treat all payment methods as immediate-confirm (like cash) — emit the same event
        if (['cash', 'credit_card', 'bank_transfer'].includes(this.paymentMethod)) {
          this.$emit('update:paymentStatus', {
            method: this.paymentMethod,
            status: this.reservation_status,
          });
        }
      } catch (error) {
        console.error('Lỗi khi xử lý thanh toán:', error.response?.data || error.message);
        this.errorMessage = `Lỗi khi xử lý thanh toán: ${error.response?.data?.message || error.message}`;
      }
    },
    
    retryPayment() {
      this.errorMessage = '';
      this.initiatePayment();
    },
    completeOrder() {
      this.reservation_status = this.customerLeft ? 'completed' : 'paid';
    },
    async customerLeave() {
      try {
        const reservationId = this.reservation.id || this.reservation;
        const response = await axios.put(`http://localhost:3000/reservation/left/${reservationId}`, null, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        alert(response.data.message);
        window.location.reload();
      } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái khách rời đi:', error.response?.data || error.message);
        alert(error.response?.data?.message || 'Không thể cập nhật trạng thái. Vui lòng thử lại.');
      }
    },
    async created() {
      try {
        const reservationId = this.reservation.id || this.reservation;
        const response = await axios.get(`http://localhost:3000/reservation/${reservationId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        this.$emit('update:billDetails', response.data);
      } catch (error) {
        console.error('Lỗi khi tải chi tiết hóa đơn:', error.response?.data || error.message);
        this.errorMessage = 'Không thể tải chi tiết hóa đơn.';
      }
    },
    async handlePaymentResult(event) {
      if (event.data.type === 'PAYMENT_COMPLETED') {
        const { success, responseCode, transactionId } = event.data;
        console.log('Received payment result:', event.data);
        
        if (success) {
          // Thanh toán thành công, cập nhật trạng thái
          this.reservation_status = this.customerLeft ? 'completed' : 'paid';
          this.$emit('update:paymentStatus', {
            method: this.paymentMethod,
            status: this.reservation_status,
          });

          // Làm mới dữ liệu hóa đơn
          await this.created();

          // Thông báo cho người dùng
          alert('Thanh toán thành công! Mã giao dịch: ' + transactionId);
          
          // Nếu khách rời đi, tự động gọi customerLeave
          if (this.customerLeft) {
            await this.customerLeave();
          }
        } else {
          // Thanh toán thất bại, hiển thị lỗi
          this.errorMessage = `Thanh toán thất bại. Mã lỗi: ${responseCode}. Vui lòng thử lại.`;
        }
      }
    },
  },
  computed: {
    formatPrice() {
      return (price) => new Intl.NumberFormat('vi-VN').format(parseFloat(price));
    },
    totalAmount() {
      return this.billDetails?.total_amount || 0;
    },
  },
};
</script>


<style scoped>
.payment-detail {
  background: linear-gradient(180deg, #c2aa77, #b29a67);
  padding: 20px 30px;
  border-radius: 20px;
  color: #2b2b2b;
  height: 85vh;
  overflow: auto;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(251, 207, 103, 0.3);
}

.payment-detail-header h2 {
  color: #2b2b2b;
  text-align: center;
  margin-top: 0;
  font-weight: bold;
}

.payment-container {
  padding-top: 10px;
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.payment-container p {
  margin: 10px 0;
  color: #2b2b2b;
  font-weight: 500;
}

.payment-method {
  margin: 20px 0;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 12px;
  border: 1px solid rgba(251, 207, 103, 0.3);
}

.payment-method h3 {
  margin-bottom: 10px;
  text-align: center;
  color: #2b2b2b;
}

.payment-method select {
  width: 200px;
  padding: 8px;
  border: 1px solid #fbcf67;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  color: #2b2b2b;
  outline: none;
  font-weight: 500;
}

.payment-method select option {
  background: #c2aa77;
  color: #2b2b2b;
}

.payment-method select option:checked {
  background: #fbcf67;
  color: #2b2b2b;
}

.qr-code {
  margin: 20px 0;
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(251, 207, 103, 0.3);
}

.qr-code img {
  max-width: 200px;
  border-radius: 8px;
  border: 2px solid #fbcf67;
}

.account-info { 
  color: #2b2b2b; 
  margin-top: 8px; 
  font-weight: 500;
}
.btn-copy { 
  margin-left: 8px; 
  padding: 4px 8px; 
  border-radius: 6px; 
  border: none; 
  background: #fbcf67; 
  cursor: pointer; 
  color: #2b2b2b;
  font-weight: bold;
}
.btn-copy:hover { 
  background: #e5b756; 
}

.payment-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.btn-confirm {
  background: linear-gradient(135deg, #fbcf67, #e5b756);
  color: #2b2b2b;
  border-radius: 8px;
  height: 40px;
  width: 150px;
  border: none;
  cursor: pointer;
  margin: 10px 0;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.btn-confirm:hover {
  background: linear-gradient(135deg, #e5b756, #d4a745);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.btn-confirm:disabled {
  background: #a0a0a0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.checkbox-label {
  display: flex;
  align-items: center;
  color: #2b2b2b;
  font-size: 16px;
  cursor: pointer;
  font-weight: 500;
}

.checkbox-label input {
  margin-right: 8px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #fbcf67;
}

.checkbox-label input:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.error-message {
  color: #d84315;
  text-align: center;
  margin: 20px 0;
  background: rgba(216, 67, 21, 0.1);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(216, 67, 21, 0.3);
  font-weight: 500;
}
</style>