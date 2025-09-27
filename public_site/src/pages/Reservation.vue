<template>
  <div class="reservation-page">
    <Header />
    <section class="reservation">
      <div class="reservation-content">
        <h1>ĐẶT BÀN NGAY</h1>
        <p class="description">
          Để giúp chúng tôi tìm được bàn phù hợp nhất cho bạn, vui lòng điền thông tin của bạn bên dưới.
        </p>
        <form @submit.prevent="submitReservation">
          <div class="form-group form-group-contact">
            <div class="form-field">
              <label>Tên của bạn</label>
              <input
                type="text"
                v-model="form.name"
                required
                placeholder="Nhập tên của bạn"
              />
            </div>
            <div class="form-field">
              <label>Số điện thoại</label>
              <input
                type="tel"
                v-model="form.phoneNumber"
                required
                placeholder="Nhập số điện thoại"
              />
            </div>
          </div>
          <div class="form-group">
            <div class="form-field">
              <label>Ngày đặt</label>
              <input type="date" v-model="form.date" required />
            </div>
            <div class="form-field">
              <label>Thời gian</label>
              <input type="time" v-model="form.time" required step="900" />
            </div>
            <div class="form-field">
              <label>Số lượng khách</label>
              <input
                type="number"
                v-model.number="form.num_people"
                min="1"
                required
                placeholder="Số lượng khách"
              />
            </div>
          </div>
          <div class="time-slots">
            <button
              type="button"
              v-for="slot in quickTimeSlots"
              :key="slot"
              :class="{ active: form.time === slot }"
              @click="form.time = slot"
            >
              {{ slot }}
            </button>
          </div>
          <button
            type="submit"
            class="reserve-button"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Đang gửi...' : 'ĐẶT NGAY' }}
          </button>
        </form>
      </div>
    </section>
    <Footer />
    <Chatbot />
  </div>
</template>

<script>
import axios from 'axios'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import Chatbot from '@/components/Chatbot.vue'; 

export default {
  name: 'Reservation',
  components: { 
    Header, 
    Footer,
    Chatbot
  },
  data() {
    return {
      form: {
        name: '',
        phoneNumber: '',
        num_people: 2,
        date: new Date().toISOString().split('T')[0],
        time: '20:00',
        tables: [] // nếu có chọn bàn, hoặc để trống
      },
      quickTimeSlots: [
        '11:00','11:30','12:00','19:30','19:45',
        '20:00','20:15','20:30','20:45',
        '21:00','21:15','21:30','21:45'
      ],
      isSubmitting: false
    }
  },
  methods: {
    async submitReservation() {
      this.isSubmitting = true
      // Ghép date + time thành reservation_time
      const reservation_time = `${this.form.date}T${this.form.time}`

      // Tạo payload đúng với BE
      const payload = {
        name: this.form.name,
        phoneNumber: this.form.phoneNumber,
        reservation_time,
        num_people: this.form.num_people,
        tables: this.form.tables
      }

      try {
        const { data } = await axios.post(
          'http://localhost:3000/reservation',
          payload
        )
        alert(data.message)
        this.resetForm()
      } catch (err) {
        const msg = err.response?.data?.message || 'Đặt bàn thất bại!'
        alert(msg)
        console.error('Lỗi khi gửi reservation:', err)
      } finally {
        this.isSubmitting = false
      }
    },
    resetForm() {
      this.form = {
        name: '',
        phoneNumber: '',
        num_people: 2,
        date: new Date().toISOString().split('T')[0],
        time: '20:00',
        tables: []
      }
    }
  }
}
</script>

<style scoped>
.reservation-page {
  background-color: #1a1a1a;
  min-height: 100vh;
  color: #ffffff;
}

.reservation {
  max-width: 800px;
  margin: 0 auto;
  padding: 100px 20px;
  text-align: center;
}

.reservation-content h1 {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #fbcf67;
  text-shadow: 0 0 5px #fbcf67, 0 0 30px #fbcf67;
}

.reservation-content .description {
  font-size: 16px;
  color: #fbcf67;
  margin-bottom: 40px;
}

.form-group {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
}

.form-group-contact {
  justify-content: center; /* Căn giữa dòng chứa Name và Phone */
  gap: 20px; /* Giảm khoảng cách giữa Name và Phone */
}

.form-field {
  width: 30%;
  text-align: left;
}

.form-group-contact .form-field {
  width: 35%; /* Tăng chiều rộng để không quá sát nhau */
  max-width: 300px; /* Giới hạn chiều rộng tối đa */
}

.form-field label {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #fbcf67;
  margin-bottom: 10px;
}

.form-field input {
  width: 100%;
  padding: 10px;
  background-color: #f6f6f3;
  border: 1px solid #444;
  color: #333;
  border-radius: 5px;
  font-size: 16px;
  align-items: center;
}

.time-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-bottom: 40px;
}

.time-slots button {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid #444;
  color: #ffffff;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.time-slots button.active {
  background-color: #fbcf67;
  color: white;
  border-color: #fbcf67;
}

.time-slots button:hover {
  background-color: #fbcf67;
  color: white;
}

.reserve-button {
  background-color: #fbcf67;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}

.reserve-button:hover {
  background-color: #fbcf67;
}

.reserve-button:disabled {
  background-color: #666;
  cursor: not-allowed;
}

/* Responsive design */
@media (max-width: 600px) {
  .form-group {
    flex-direction: column;
    gap: 20px;
  }
  .form-field {
    width: 100%;
  }
  .form-group-contact .form-field {
    width: 100%;
    max-width: none;
  }
}
</style>