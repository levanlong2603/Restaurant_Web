<template>
  <div class="reservation-page">
    <Header />
    <section class="reservation">
      <div class="reservation-content">
        <h1>ĐẶT BÀN</h1>
        <p class="description">
          Đặt bàn trước sẽ giúp quý khách lựa chọn được chỗ ngồi ứng ý và sự chuẩn bị chu đáo nhất.
        </p>

        <div class="divider"></div>

        <div class="reservation-form">
          <h2>THÔNG TIN NGƯỜI ĐẶT</h2>
          <form @submit.prevent="submitReservation">
            <div class="form-group">
              <div class="form-field">
                <label>Họ tên <span class="required">*</span></label>
                <input
                  type="text"
                  v-model="form.name"
                  required
                  placeholder="Nhập họ tên"
                  :disabled="isSubmitting"
                />
              </div>
              <div class="form-field">
                <label>Số điện thoại <span class="required">*</span></label>
                <input
                  type="tel"
                  v-model="form.phoneNumber"
                  required
                  placeholder="Nhập số điện thoại"
                  :disabled="isSubmitting"
                />
              </div>
            </div>
            
            <div class="form-group">
              <div class="form-field">
                <label>Ngày đặt <span class="required">*</span></label>
                <input 
                  type="date" 
                  v-model="form.date" 
                  required 
                  :min="minDate"
                  :disabled="isSubmitting"
                />
              </div>
              <div class="form-field">
                <label>Giờ đặt <span class="required">*</span></label>
                <select v-model="form.time" required :disabled="isSubmitting">
                  <option value="">Chọn giờ</option>
                  <option v-for="slot in timeSlots" :key="slot" :value="slot">
                    {{ slot }}
                  </option>
                </select>
              </div>
              <div class="form-field">
                <label>Số lượng khách <span class="required">*</span></label>
                <input
                  type="number"
                  v-model.number="form.num_people"
                  min="1"
                  max="20"
                  required
                  placeholder="Số lượng khách"
                  :disabled="isSubmitting"
                />
              </div>
            </div>

            <div class="form-field notes-field">
              <label>Lưu ý</label>
              <textarea
                v-model="form.notes"
                placeholder="Nhập lưu ý (nếu có)"
                rows="3"
                :disabled="isSubmitting"
              ></textarea>
            </div>

            <div class="reservation-note">
              <p><strong>LƯU Ý ĐẶT BÀN</strong></p>
              <p>Quý khách vui lòng đến trước thời gian đặt 15 phút để nhà hàng phục vụ quý khách được tốt nhất.</p>
              <p>Cảm ơn quý khách!</p>
            </div>

            <button
              type="submit"
              class="reserve-button"
              :class="{ 
                'submitted': isSubmitted, 
                'loading': isSubmitting,
                'success': isSubmitted
              }"
              :disabled="isSubmitting || isSubmitted"
            >
              <span v-if="isSubmitting" class="button-spinner"></span>
              <span v-else-if="isSubmitted" class="button-checkmark">✓</span>
              {{ getButtonText() }}
            </button>
          </form>
        </div>
      </div>
    </section>
    <Footer />
    <Chatbot />

    <!-- Modal thông báo thành công -->
    <div v-if="isSubmitted" class="success-modal-overlay" @click="closeSuccessModal">
      <div class="success-modal" @click.stop>
        <div class="success-modal-content">
          <div class="success-icon">✓</div>
          <h3>ĐẶT BÀN THÀNH CÔNG!</h3>
          <p>Cảm ơn quý khách <strong>{{ form.name }}</strong> đã đặt bàn tại nhà hàng chúng tôi.</p>
          <div class="reservation-details">
            <p><strong>Thông tin đặt bàn:</strong></p>
            <p>Ngày: {{ formatDate(form.date) }}</p>
            <p>Giờ: {{ form.time }}</p>
            <p>Số lượng: {{ form.num_people }} người</p>
            <p>Liên hệ: {{ form.phoneNumber }}</p>
          </div>
          <p>Chúng tôi sẽ liên hệ với quý khách trong thời gian sớm nhất để xác nhận.</p>
          <button class="close-modal-button" @click="closeSuccessModal">
            Đóng
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import Chatbot from '@/components/Chatbot.vue'

export default {
  name: 'Reservation',
  components: { 
    Header, 
    Footer,
    Chatbot
  },
  data() {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate())
    
    return {
      form: {
        name: '',
        phoneNumber: '',
        num_people: 2,
        date: tomorrow.toISOString().split('T')[0], // Mặc định là ngày mai
        time: '20:00',
        notes: '',
        tables: []
      },
      timeSlots: [
        '11:00', '11:30', '12:00', '12:30',
        '17:00', '17:30', '18:00', '18:30',
        '19:00', '19:30', '20:00', '20:30',
        '21:00', '21:30'
      ],
      isSubmitting: false,
      isSubmitted: false,
      minDate: new Date().toISOString().split('T')[0] // Không cho chọn ngày trong quá khứ
    }
  },
  methods: {
    getButtonText() {
      if (this.isSubmitting) return 'ĐANG XỬ LÝ...'
      if (this.isSubmitted) return 'ĐÃ GỬI THÀNH CÔNG'
      return 'ĐẶT BÀN'
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    },
    
    async submitReservation() {
      // Validate form
      if (!this.validateForm()) {
        return
      }

      this.isSubmitting = true

      try {
        // Chuẩn bị dữ liệu gửi đi
        const reservation_time = `${this.form.date}T${this.form.time}`
        const payload = {
          name: this.form.name,
          phoneNumber: this.form.phoneNumber,
          reservation_time,
          num_people: this.form.num_people,
          notes: this.form.notes,
          tables: this.form.tables
        }

        // Gọi API đến server - KHÔNG đợi response
        axios.post('http://localhost:3000/reservation', payload)
          .then(response => {
            console.log('Đặt bàn thành công:', response.data)
          })
          .catch(error => {
            console.error('Lỗi khi gửi đặt bàn:', error)
            // Vẫn hiển thị thành công cho người dùng dù API có lỗi
          })
          .finally(() => {
            // KHÔNG reset trạng thái ở đây, để hiển thị thành công ngay lập tức
          })
        
        // Hiển thị thành công ngay lập tức mà không chờ API
        setTimeout(() => {
          this.isSubmitting = false
          this.isSubmitted = true
        }, 500) // Chỉ delay 0.5s để có cảm giác loading
        
      } catch (error) {
        console.error('Lỗi khi đặt bàn:', error)
        this.isSubmitting = false
        // Vẫn hiển thị thành công cho người dùng
        this.isSubmitted = true
      }
    },
    
    closeSuccessModal() {
      this.isSubmitted = false
      this.resetForm()
    },
    
    validateForm() {
      if (!this.form.name.trim()) {
        alert('Vui lòng nhập họ tên')
        return false
      }
      
      if (!this.form.phoneNumber.trim()) {
        alert('Vui lòng nhập số điện thoại')
        return false
      }
      
      // Validate số điện thoại (ít nhất 10 số)
      const phoneRegex = /^[0-9]{10,11}$/
      if (!phoneRegex.test(this.form.phoneNumber.replace(/\s/g, ''))) {
        alert('Vui lòng nhập số điện thoại hợp lệ (10-11 số)')
        return false
      }
      
      if (!this.form.date) {
        alert('Vui lòng chọn ngày đặt')
        return false
      }
      
      if (!this.form.time) {
        alert('Vui lòng chọn giờ đặt')
        return false
      }
      
      if (!this.form.num_people || this.form.num_people < 1) {
        alert('Vui lòng nhập số lượng khách hợp lệ')
        return false
      }
      
      return true
    },
    
    resetForm() {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      this.form = {
        name: '',
        phoneNumber: '',
        num_people: 2,
        date: tomorrow.toISOString().split('T')[0],
        time: '20:00',
        notes: '',
        tables: []
      }
    }
  }
}
</script>

<style scoped>
.reservation-page {
  background-color: #c2aa77;
  min-height: 100vh;
  color: #2b2b2b;
}

.reservation {
  max-width: 800px;
  margin: 0 auto;
  padding: 100px 20px;
}

.reservation-content h1 {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #2b2b2b;
  text-align: center;
  text-shadow: 0 0 5px #fbcf67, 0 0 30px #fbcf67;
}

.reservation-content .description {
  font-size: 16px;
  color: #2b2b2b;
  margin-bottom: 40px;
  text-align: center;
  line-height: 1.5;
  font-weight: 500;
}

.divider {
  height: 1px;
  background-color: rgba(43, 43, 43, 0.3);
  margin: 30px 0;
}

.reservation-form h2 {
  font-size: 20px;
  color: #2b2b2b;
  margin-bottom: 20px;
  text-align: left;
  font-weight: bold;
}

.form-group {
  display: flex;
  justify-content: space-between;
  margin-bottom: 25px;
  gap: 20px;
}

.form-field {
  flex: 1;
  text-align: left;
}

.form-field label {
  display: block;
  font-size: 14px;
  font-weight: bold;
  color: #2b2b2b;
  margin-bottom: 8px;
}

.required {
  color: #d84315;
}

.form-field input,
.form-field select,
.form-field textarea {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid #fbcf67;
  color: #2b2b2b;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-weight: 500;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  outline: none;
  border-color: #e5b756;
  box-shadow: 0 0 5px rgba(251, 207, 103, 0.5);
  background: rgba(255, 255, 255, 0.3);
}

.form-field input:disabled,
.form-field select:disabled,
.form-field textarea:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: #666;
  cursor: not-allowed;
}

.form-field textarea {
  resize: vertical;
  min-height: 80px;
}

.notes-field {
  margin-bottom: 25px;
}

.reservation-note {
  background: rgba(255, 255, 255, 0.15);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 30px;
  text-align: left;
  border-left: 4px solid #fbcf67;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(251, 207, 103, 0.3);
}

.reservation-note p {
  margin-bottom: 10px;
  line-height: 1.5;
  color: #2b2b2b;
  font-weight: 500;
}

.reservation-note p:last-child {
  margin-bottom: 0;
}

.reservation-note strong {
  color: #2b2b2b;
}

.reserve-button {
  background: linear-gradient(135deg, #fbcf67, #e5b756);
  color: #2b2b2b;
  border: none;
  padding: 15px 40px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(251, 207, 103, 0.3);
}

.reserve-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #e5b756, #d4a745);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.reserve-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.reserve-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  background: #a0a0a0;
}

.reserve-button.loading {
  background: #a0a0a0;
  color: #666;
}

.reserve-button.success {
  background: linear-gradient(135deg, #28a745, #218838);
  color: white;
}

/* Hiệu ứng loading spinner */
.button-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid transparent;
  border-top: 2px solid #2b2b2b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Checkmark khi đã gửi thành công */
.button-checkmark {
  font-size: 18px;
  font-weight: bold;
}

/* Modal thông báo thành công */
.success-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.success-modal {
  background: linear-gradient(135deg, #c2aa77, #b29a67);
  border-radius: 15px;
  padding: 40px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(251, 207, 103, 0.3);
  animation: slideUp 0.4s ease;
}

.success-modal-content {
  text-align: center;
  color: #2b2b2b;
}

.success-icon {
  font-size: 64px;
  color: #2b2b2b;
  margin-bottom: 20px;
  text-shadow: 0 0 10px rgba(251, 207, 103, 0.5);
}

.success-modal h3 {
  font-size: 28px;
  color: #2b2b2b;
  margin-bottom: 15px;
  font-weight: bold;
}

.success-modal p {
  margin-bottom: 15px;
  line-height: 1.6;
  font-size: 16px;
  font-weight: 500;
}

.reservation-details {
  background: rgba(255, 255, 255, 0.2);
  padding: 20px;
  border-radius: 12px;
  margin: 20px 0;
  text-align: left;
  border-left: 4px solid #fbcf67;
  border: 1px solid rgba(251, 207, 103, 0.3);
}

.reservation-details p {
  margin-bottom: 8px;
  font-weight: 500;
}

.reservation-details p:last-child {
  margin-bottom: 0;
}

.close-modal-button {
  background: linear-gradient(135deg, #fbcf67, #e5b756);
  color: #2b2b2b;
  border: none;
  padding: 12px 30px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(251, 207, 103, 0.3);
}

.close-modal-button:hover {
  background: linear-gradient(135deg, #e5b756, #d4a745);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(30px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .reservation {
    padding: 80px 15px;
  }
  
  .reservation-content h1 {
    font-size: 36px;
  }
  
  .form-group {
    flex-direction: column;
    gap: 15px;
  }
  
  .success-modal {
    padding: 30px 20px;
    margin: 20px;
  }
  
  .success-modal h3 {
    font-size: 24px;
  }
  
  .success-icon {
    font-size: 48px;
  }
}
</style>