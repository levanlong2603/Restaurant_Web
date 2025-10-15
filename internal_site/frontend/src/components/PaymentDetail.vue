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
  background: linear-gradient(180deg, #8B5E3C, #6B4226); /* Nâu gỗ đến nâu đất */
  padding: 25px 30px;
  border-radius: 20px;
  color: #FFF8E7; /* Trắng kem */
  height: 85vh;
  overflow: auto;
  box-shadow: 0 8px 25px rgba(107, 66, 38, 0.3);
  border: 1px solid rgba(231, 194, 125, 0.4); /* Vàng nhạt */
  backdrop-filter: blur(10px);
}

.payment-detail-header h2 {
  color: #FFF8E7; /* Trắng kem */
  text-align: center;
  margin-top: 0;
  margin-bottom: 20px;
  font-weight: bold;
  font-size: 28px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.payment-container {
  padding: 15px 0;
  margin-bottom: 15px;
  background: rgba(255, 248, 231, 0.05); /* Trắng kem trong suốt */
  border-radius: 12px;
  border: 1px solid rgba(231, 194, 125, 0.2);
}

.payment-container p {
  margin: 12px 0;
  color: #FFF8E7; /* Trắng kem */
  font-weight: 500;
  font-size: 16px;
  padding: 0 20px;
}

.payment-method {
  margin: 25px 0;
  background: rgba(255, 248, 231, 0.1); /* Trắng kem trong suốt */
  padding: 20px;
  border-radius: 15px;
  border: 1px solid rgba(231, 194, 125, 0.3);
  backdrop-filter: blur(5px);
}

.payment-method h3 {
  margin-bottom: 15px;
  text-align: center;
  color: #FFF8E7; /* Trắng kem */
  font-size: 20px;
  font-weight: bold;
}

.payment-method select {
  width: 220px;
  padding: 12px;
  border: 1px solid #E7C27D; /* Vàng nhạt */
  border-radius: 10px;
  background: rgba(255, 248, 231, 0.15); /* Trắng kem trong suốt */
  color: #FFF8E7; /* Trắng kem */
  outline: none;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
  display: block;
  margin: 0 auto;
}

.payment-method select:focus {
  border-color: #D4AF37;
  background: rgba(255, 248, 231, 0.25);
  box-shadow: 0 0 12px rgba(231, 194, 125, 0.4);
}

.payment-method select option {
  background: #8B5E3C; /* Nâu gỗ */
  color: #FFF8E7; /* Trắng kem */
  padding: 10px;
  font-weight: 500;
}

.payment-method select option:checked {
  background: #E7C27D; /* Vàng nhạt */
  color: #3B2F2F; /* Đen nâu */
  font-weight: bold;
}

.payment-method select option:hover {
  background: #E7C27D; /* Vàng nhạt */
  color: #3B2F2F; /* Đen nâu */
}

.qr-code {
  margin: 25px 0;
  text-align: center;
  background: rgba(255, 248, 231, 0.1); /* Trắng kem trong suốt */
  padding: 25px;
  border-radius: 15px;
  border: 1px solid rgba(231, 194, 125, 0.3);
  backdrop-filter: blur(5px);
}

.qr-code h3 {
  color: #FFF8E7; /* Trắng kem */
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: bold;
}

.qr-code img {
  max-width: 220px;
  border-radius: 12px;
  border: 3px solid #E7C27D; /* Vàng nhạt */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.qr-code img:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 20px rgba(231, 194, 125, 0.3);
}

.account-info { 
  color: #FFF8E7; /* Trắng kem */
  margin-top: 12px; 
  font-weight: 500;
  font-size: 15px;
  background: rgba(231, 194, 125, 0.2);
  padding: 10px 15px;
  border-radius: 8px;
  display: inline-block;
}

.btn-copy { 
  margin-left: 10px; 
  padding: 8px 12px; 
  border-radius: 8px; 
  border: none; 
  background: #E7C27D; /* Vàng nhạt */
  cursor: pointer; 
  color: #3B2F2F; /* Đen nâu */
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.btn-copy:hover { 
  background: #D4AF37;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.btn-copy:active {
  transform: translateY(0);
}

.payment-actions {
  display: flex;
  gap: 25px;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  flex-wrap: wrap;
}

.btn-confirm {
  background: linear-gradient(135deg, #E7C27D, #D4AF37); /* Vàng nhạt đến vàng đậm */
  color: #3B2F2F; /* Đen nâu */
  border-radius: 10px;
  height: 45px;
  width: 160px;
  border: none;
  cursor: pointer;
  margin: 10px 0;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  font-size: 16px;
}

.btn-confirm:hover:not(:disabled) {
  background: linear-gradient(135deg, #D4AF37, #C19B2E);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.25);
}

.btn-confirm:disabled {
  background: rgba(160, 160, 160, 0.5);
  color: rgba(59, 47, 47, 0.5);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.checkbox-container {
  background: rgba(255, 248, 231, 0.1);
  padding: 15px 20px;
  border-radius: 10px;
  border: 1px solid rgba(231, 194, 125, 0.3);
  margin: 20px 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  color: #FFF8E7; /* Trắng kem */
  font-size: 16px;
  cursor: pointer;
  font-weight: 500;
  margin: 0;
}

.checkbox-label input {
  margin-right: 12px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #E7C27D; /* Vàng nhạt */
  border-radius: 4px;
}

.checkbox-label input:checked {
  background-color: #E7C27D; /* Vàng nhạt */
}

.checkbox-label input:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.error-message {
  color: #FFB4A2;
  text-align: center;
  margin: 20px 0;
  background: rgba(216, 67, 21, 0.15);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid rgba(216, 67, 21, 0.4);
  font-weight: 500;
  backdrop-filter: blur(5px);
}

.success-message {
  color: #A8E6A3;
  text-align: center;
  margin: 20px 0;
  background: rgba(40, 167, 69, 0.15);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid rgba(40, 167, 69, 0.4);
  font-weight: 500;
  backdrop-filter: blur(5px);
}

/* Custom scrollbar */
.payment-detail::-webkit-scrollbar {
  width: 8px;
}

.payment-detail::-webkit-scrollbar-track {
  background: rgba(255, 248, 231, 0.1);
  border-radius: 4px;
}

.payment-detail::-webkit-scrollbar-thumb {
  background: #E7C27D;
  border-radius: 4px;
}

.payment-detail::-webkit-scrollbar-thumb:hover {
  background: #D4AF37;
}

/* Responsive design */
@media (max-width: 768px) {
  .payment-detail {
    padding: 15px 20px;
    height: 90vh;
  }
  
  .payment-actions {
    flex-direction: column;
    gap: 15px;
  }
  
  .btn-confirm {
    width: 100%;
    max-width: 200px;
  }
  
  .qr-code img {
    max-width: 180px;
  }
  
  .payment-method select {
    width: 100%;
    max-width: 250px;
  }
}
</style>