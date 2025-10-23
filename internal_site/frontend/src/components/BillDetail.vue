<template>
  <div class="bill-detail">
    <div class="bill-detail-header">
      <h2>Chi tiết hóa đơn</h2>
      <button 
        v-if="billDetails && billDetails.total_amount > 0" 
        @click="generatePDF" 
        class="print-pdf-btn"
        :disabled="generatingPDF"
      >
        {{ generatingPDF ? 'Đang tạo...' : 'Xuất hóa đơn' }}
      </button>
    </div>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    <p v-else-if="billDetails && billDetails.total_amount === 0">Khách hàng chưa gọi món</p>
    <div class="bill-item-container" v-else-if="billDetails">
      <p><strong>Khách hàng: </strong>{{ billDetails.customer.name }}</p>
      <p><strong>Số điện thoại: </strong>{{ billDetails.customer.phoneNumber }}</p>

      <p><strong>Bàn:</strong> {{ billDetails.tableNumber }}</p>
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
import html2pdf from 'html2pdf.js';

export default {
  name: 'BillDetail',
  props: {
    billDetails: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      errorMessage: '',
      generatingPDF: false,
    };
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
    currentDateTime() {
      const now = new Date();
      return now.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  },
  methods: {
    formatPrice(price) {
      return new Intl.NumberFormat('vi-VN').format(parseFloat(price));
    },
    
    async generatePDF() {
      if (!this.billDetails) {
        this.errorMessage = 'Không có dữ liệu hóa đơn để in';
        return;
      }

      this.generatingPDF = true;
      this.errorMessage = '';

      try {
        // Tạo HTML template động thay vì sử dụng element ẩn
        const pdfHTML = this.createPDFTemplate();
        
        // Tạo element tạm thời
        const element = document.createElement('div');
        element.innerHTML = pdfHTML;
        element.style.width = '210mm';
        element.style.padding = '20px';
        element.style.background = 'white';
        element.style.color = 'black';
        element.style.fontFamily = 'Arial, sans-serif';
        
        // Thêm vào DOM tạm thời
        document.body.appendChild(element);
        
        const opt = {
          margin: [10, 10, 10, 10],
          filename: `Hoa_don_Long_Quan_An_${new Date().getTime()}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: true,
            width: element.scrollWidth,
            height: element.scrollHeight
          },
          jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait' 
          }
        };

        console.log('Bắt đầu tạo PDF...');
        await html2pdf().set(opt).from(element).save();
        console.log('PDF đã được tạo thành công');
        
        // Dọn dẹp
        document.body.removeChild(element);
        
      } catch (error) {
        console.error('Lỗi khi tạo PDF:', error);
        this.errorMessage = 'Lỗi khi tạo PDF: ' + error.message;
      } finally {
        this.generatingPDF = false;
      }
    },

    createPDFTemplate() {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Roboto', Arial, sans-serif; 
              background: white; 
              color: #333; 
              line-height: 1.4;
              padding: 20px;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border: 1px solid #ddd;
              border-radius: 10px;
              overflow: hidden;
            }
            .invoice-header {
              background: linear-gradient(135deg, #8B5E3C, #6B4226);
              color: white;
              padding: 25px;
              text-align: center;
            }
            .restaurant-logo {
              width: 80px;
              height: 80px;
              margin: 0 auto 10px;
              border-radius: 50%;
              overflow: hidden;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .restaurant-logo img {
              width: 100%;
              height: 100%;
              object-fit: contain;
              border-radius: 50%;
            }
            .restaurant-name {
              font-size: 24px;
              font-weight: 700;
              margin-bottom: 5px;
            }
            .restaurant-tagline {
              font-size: 14px;
              margin-bottom: 10px;
              opacity: 0.9;
            }
            .restaurant-info {
              font-size: 12px;
              opacity: 0.8;
            }
            .invoice-body {
              padding: 25px;
            }
            .invoice-title {
              text-align: center;
              font-size: 20px;
              font-weight: 600;
              margin-bottom: 20px;
              color: #8B5E3C;
              text-transform: uppercase;
            }
            .invoice-details {
              display: flex;
              justify-content: space-between;
              margin-bottom: 25px;
              padding: 15px;
              background: #f9f7f3;
              border-radius: 8px;
            }
            .detail-group {
              margin-bottom: 8px;
            }
            .detail-label {
              font-weight: 600;
              color: #8B5E3C;
              font-size: 13px;
            }
            .detail-value {
              font-weight: 500;
              font-size: 13px;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              font-size: 12px;
            }
            .items-table th {
              background: #f1e9e0;
              color: #6B4226;
              font-weight: 600;
              padding: 10px 8px;
              text-align: left;
              border-bottom: 2px solid #d4c5b2;
            }
            .items-table td {
              padding: 8px;
              border-bottom: 1px solid #eae2d6;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .total-section {
              margin-top: 25px;
              padding: 15px;
              background: #f9f7f3;
              border-radius: 8px;
              text-align: right;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            }
            .final-total {
              border-top: 2px solid #d4c5b2;
              padding-top: 10px;
              margin-top: 10px;
              font-size: 16px;
              font-weight: 700;
              color: #8B5E3C;
            }
            .invoice-footer {
              margin-top: 30px;
              padding: 15px;
              text-align: center;
              border-top: 1px dashed #d4c5b2;
              font-size: 12px;
            }
            .thank-you {
              font-size: 14px;
              font-weight: 600;
              color: #8B5E3C;
              margin-bottom: 8px;
            }
            .barcode-placeholder {
              display: inline-block;
              width: 150px;
              height: 40px;
              background: #f1e9e0;
              border: 1px dashed #d4c5b2;
              line-height: 40px;
              color: #8B5E3C;
              font-size: 10px;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="invoice-header">
              <div class="restaurant-logo">
                <img src="/Logo1.png" alt="Logo Long Quân An" onerror="this.style.display='none'">
              </div>
              <h1 class="restaurant-name">LONG QUÂN AN</h1>
              <p class="restaurant-tagline">ẨM THỰC TINH TÚY</p>
              <div class="restaurant-info">
                <p>Số 33, đường Đại Mỗ, phường Đại Mỗ, quận Nam Từ Liêm, TP. Hà Nội</p>
                <p>Hotline: 0348 047 350 | Email: nhahanglongquanan@gmail.com</p>
              </div>
            </div>
            
            <div class="invoice-body">
              <h2 class="invoice-title">HÓA ĐƠN THANH TOÁN</h2>
              
              <div class="invoice-details">
                <div class="invoice-left">
                  <div class="detail-group">
                    <div class="detail-label">Mã hóa đơn:</div>
                    <div class="detail-value">HD-${new Date().getTime().toString().slice(-6)}</div>
                  </div>
                  <div class="detail-group">
                    <div class="detail-label">Khách hàng:</div>
                    <div class="detail-value">${this.billDetails.customer?.name || 'Khách vãng lai'}</div>
                  </div>
                  <div class="detail-group">
                    <div class="detail-label">Số điện thoại:</div>
                    <div class="detail-value">${this.billDetails.customer?.phoneNumber || 'N/A'}</div>
                  </div>
                </div>
                
                <div class="invoice-right">
                  <div class="detail-group">
                    <div class="detail-label">Ngày giờ:</div>
                    <div class="detail-value">${this.currentDateTime}</div>
                  </div>
                  <div class="detail-group">
                    <div class="detail-label">Bàn:</div>
                    <div class="detail-value">${this.billDetails.tableNumber || 'N/A'}</div>
                  </div>
                  <div class="detail-group">
                  </div>
                </div>
              </div>
              
              <table class="items-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tên món</th>
                    <th class="text-right">Đơn giá</th>
                    <th class="text-center">SL</th>
                    <th class="text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.aggregatedItems.map((item, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${item.menu.name}</td>
                      <td class="text-right">${this.formatPrice(item.menu.price)}</td>
                      <td class="text-center">${item.quantity}</td>
                      <td class="text-right">${this.formatPrice(item.menu.price * item.quantity)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <div class="total-section">
                <div class="total-row final-total">
                  <div class="total-label">TỔNG CỘNG:</div>
                  <div class="total-value">${this.formatPrice(this.billDetails.total_amount)} VNĐ</div>
                </div>
              </div>
              
              <div class="invoice-footer">
                <p class="thank-you">CẢM ƠN QUÝ KHÁCH VÀ HẸN GẶP LẠI!</p>
                <p>Hóa đơn có giá trị trong vòng 30 ngày kể từ ngày xuất</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    }
  },
};
</script>

<style scoped>
.bill-detail {
  background: linear-gradient(180deg, #8B5E3C, #6B4226);
  padding: 20px 30px;
  border-radius: 20px;
  color: #FFF8E7;
  height: 85vh;
  overflow: auto;
  box-shadow: 0 8px 25px rgba(107, 66, 38, 0.3);
  border: 1px solid rgba(231, 194, 125, 0.2);
}

.bill-detail-header {
  border-bottom: 2px solid rgba(231, 194, 125, 0.5);
  padding-bottom: 15px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bill-detail-header h2 {
  color: #FFF8E7;
  margin-top: 0;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-size: 24px;
}

.print-pdf-btn {
  background: linear-gradient(135deg, #E7C27D, #D4B15F);
  color: #3B2F2F;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.print-pdf-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #D4B15F, #C19B3C);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.print-pdf-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Giữ nguyên các style cũ */
.bill-item-container {
  background: rgba(255, 248, 231, 0.15);
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(231, 194, 125, 0.4);
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
  color: #FFF8E7;
  font-weight: 500;
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
  background: linear-gradient(135deg, #E7C27D, #D4B15F);
  border: 1px solid rgba(139, 94, 60, 0.3);
  padding: 12px 10px;
  text-align: center;
  color: #3B2F2F;
  font-weight: bold;
  font-size: 14px;
}

.bill-table td {
  border: 1px solid rgba(231, 194, 125, 0.2);
  padding: 12px 10px;
  text-align: center;
  color: #FFF8E7;
  font-weight: 500;
  background: rgba(255, 248, 231, 0.05);
  transition: background 0.3s ease;
}

.bill-table tr:hover td {
  background: rgba(231, 194, 125, 0.15);
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
  color: #FFF8E7;
  font-weight: bold;
  margin: 0;
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

@media (max-width: 768px) {
  .bill-detail {
    padding: 15px 20px;
    height: 80vh;
  }
  
  .bill-detail-header {
    flex-direction: column;
    gap: 15px;
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