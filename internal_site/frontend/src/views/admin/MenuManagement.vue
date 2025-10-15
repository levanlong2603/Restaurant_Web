<template>
  <div class="main-layout">
    <Navigation @sidebar-toggle="handleSidebarToggle" />
    <div class="menu-management" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <h1>Quản lý Menu</h1>
      <div class="split-container">
        <!-- Bên trái: Form thêm mới và danh sách món vừa thêm/sửa -->
        <div class="left-panel">
          <h2>Thêm món mới</h2>
          <form @submit.prevent="addItem" class="add-form">
            <div class="form-group">
              <label for="new-name">Tên món</label>
              <input id="new-name" v-model="newItem.name" placeholder="Nhập tên món" required />
            </div>
            <div class="form-group">
              <label for="new-price">Giá (VNĐ)</label>
              <input id="new-price" v-model.number="newItem.price" type="number" placeholder="Nhập giá" required />
            </div>
            <div class="form-group">
              <label for="new-description">Mô tả</label>
              <textarea id="new-description" v-model="newItem.description" placeholder="Nhập mô tả món"
                required></textarea>
            </div>
            <div class="form-group">
              <label for="new-category">Danh mục</label>
              <select id="new-category" v-model="newItem.category" required>
                <option value="" disabled>Chọn danh mục</option>
                <option value="appetizer">Khai vị</option>
                <option value="main_dish">Món chính</option>
                <option value="side_dish">Món ăn kèm</option>
                <option value="regional_specialty">Đặc sản vùng miền</option>
                <option value="vegetarian">Món chay</option>
                <option value="dessert">Tráng miệng</option>
                <option value="beverage">Đồ uống</option>
              </select>
            </div>
            <div class="form-group">
              <label>Ảnh món</label>
              <div class="image-upload">
                <div v-if="newImagePreview" class="preview-image-container">
                  <p>Ảnh xem trước:</p>
                  <img :src="newImagePreview" alt="Preview Image" class="preview-image" />
                  <button type="button" class="remove-preview" @click="removeNewImagePreview">Xóa ảnh</button>
                </div>
                <input type="file" @change="onFileChange" accept="image/*" />
              </div>
            </div>
            <button type="submit" class="submit-button">Thêm món</button>
          </form>

          <h2>Món vừa thêm/sửa</h2>
          <div class="recent-items-wrapper">
            <ul class="recent-items">
              <li v-for="item in recentItems" :key="item.id">
                <span>{{ item.name }} - {{ formatPrice(item.price) }} VNĐ</span>
                <img :src="getImageUrl(item.image)" :alt="item.name" class="preview-image" />
              </li>
            </ul>
          </div>
        </div>

        <!-- Bên phải: Danh sách menu với tìm kiếm và lọc -->
        <div class="right-panel">
          <!-- Thanh tìm kiếm và lọc cố định -->
          <div class="filter-search fixed">
            <select v-model="selectedCategory" @change="fetchMenu">
              <option value="">Tất cả danh mục</option>
              <option value="appetizer">Khai vị</option>
              <option value="main_dish">Món chính</option>
              <option value="side_dish">Món ăn kèm</option>
              <option value="regional_specialty">Đặc sản vùng miền</option>
              <option value="vegetarian">Món chay</option>
              <option value="dessert">Tráng miệng</option>
              <option value="beverage">Đồ uống</option>
            </select>
            <input v-model="searchQuery" @input="debouncedFetchMenu" placeholder="Tìm kiếm món..." />
            <label class="checkbox-label">
              <input type="checkbox" v-model="showDeleted" @change="fetchMenu" /> Hiển thị món đã xóa
            </label>
          </div>

          <!-- Danh sách menu có thể cuộn -->
          <div class="right-panel-content">
            <div v-for="(group, category) in groupedMenuItems" :key="category" class="category-group">
              <h3 class="category-title">{{ categoryDisplayNames[category] || category }}</h3>
              <ul>
                <li v-for="item in group" :key="item.id" class="menu-item">
                  <div class="item-info">
                    <span>{{ item.name }} - {{ formatPrice(item.price) }} VNĐ</span>
                    <img :src="getImageUrl(item.image)" :alt="item.name" class="preview-image" />
                  </div>
                  <div class="item-actions">
                    <button @click="openEditPopup(item)" class="action-button">Sửa</button>
                    <button v-if="item.deleted" @click="restoreItem(item.id)" class="action-button restore-button">Khôi
                      phục</button>
                    <button v-else @click="deleteItem(item.id)" class="action-button delete-button">Xóa</button>
                  </div>
                </li>
              </ul>
            </div>

            <div class="pagination">
              <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1">Trang trước</button>
              <span>Trang {{ currentPage }} / {{ totalPages }}</span>
              <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">Trang sau</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Popup chỉnh sửa -->
      <div v-if="showEditPopup" class="popup-overlay">
        <div class="popup">
          <h2>Chỉnh sửa món ăn</h2>
          <form @submit.prevent="updateItem" class="edit-form">
            <div class="form-group">
              <label for="edit-name">Tên món</label>
              <input id="edit-name" v-model="editItem.name" placeholder="Nhập tên món" required />
            </div>
            <div class="form-group">
              <label for="edit-price">Giá (VNĐ)</label>
              <input id="edit-price" v-model.number="editItem.price" type="number" placeholder="Nhập giá" required />
            </div>
            <div class="form-group">
              <label for="edit-description">Mô tả</label>
              <textarea id="edit-description" v-model="editItem.description" placeholder="Nhập mô tả món"
                required></textarea>
            </div>
            <div class="form-group">
              <label for="edit-category">Danh mục</label>
              <select id="edit-category" v-model="editItem.category" required>
                <option value="" disabled>Chọn danh mục</option>
                <option value="appetizer">Khai vị</option>
                <option value="main_dish">Món chính</option>
                <option value="side_dish">Món ăn kèm</option>
                <option value="regional_specialty">Đặc sản vùng miền</option>
                <option value="vegetarian">Món chay</option>
                <option value="dessert">Tráng miệng</option>
                <option value="beverage">Đồ uống</option>
              </select>
            </div>
            <div class="form-group">
              <label>Ảnh món</label>
              <div class="image-upload">
                <!-- Hiển thị ảnh hiện tại (nếu có) -->
                <div v-if="editItem.image && !editImagePreview" class="current-image">
                  <p>Ảnh hiện tại:</p>
                  <img :src="getImageUrl(editItem.image)" alt="Current Image" class="preview-image" />
                </div>
                <!-- Hiển thị ảnh xem trước (nếu có file mới) -->
                <div v-if="editImagePreview" class="preview-image-container">
                  <p>Ảnh xem trước:</p>
                  <img :src="editImagePreview" alt="Preview Image" class="preview-image" />
                  <button type="button" class="remove-preview" @click="removeEditImagePreview">Xóa ảnh</button>
                </div>
                <input type="file" @change="onEditFileChange" accept="image/*" />
              </div>
            </div>
            <div class="popup-buttons">
              <button type="submit" class="submit-button">Lưu</button>
              <button type="button" class="cancel-button" @click="closeEditPopup">Hủy</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';
import debounce from 'lodash/debounce';
import Navigation from '../../components/Navigation.vue';

export default {
  components: {
    Navigation,
  },
  data() {
    return {
      menuItems: [],
      recentItems: [],
      newItem: {
        name: '',
        price: 0,
        description: '',
        category: '',
        image: null,
        imagePublicId: null,
      },
      isSidebarCollapsed: false,
      newImagePreview: null,
      editItem: null,
      editImagePreview: null,
      showEditPopup: false,
      selectedCategory: '',
      searchQuery: '',
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10,
      showDeleted: false,
      categoryDisplayNames: {
        appetizer: 'Khai vị',
        main_dish: 'Món chính',
        side_dish: 'Món ăn kèm',
        regional_specialty: 'Đặc sản vùng miền',
        vegetarian: 'Món chay',
        dessert: 'Tráng miệng',
        beverage: 'Đồ uống',
      },
      defaultImage: '../../assets/images/Logo.png',
    };
  },
  computed: {
    groupedMenuItems() {
      const grouped = {};
      let currentCategory = null;

      this.menuItems.forEach((item) => {
        if (item.category !== currentCategory) {
          currentCategory = item.category;
          grouped[currentCategory] = [];
        }
        grouped[currentCategory].push(item);
      });

      return grouped;
    },
  },
  async created() {
    await this.fetchMenu();

    this.$router.afterEach(() => {
      this.$emit('close-sidebar');
      this.isSidebarCollapsed = true;
    });
  },
  methods: {
    handleSidebarToggle(isCollapsed) {
      this.isSidebarCollapsed = isCollapsed;
    },
    handleCloseSidebar() {
      this.isSidebarCollapsed = true;
    },
    async fetchMenu() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found. Please login again.');
        }

        const params = {
          page: this.currentPage,
          limit: this.itemsPerPage,
        };
        if (this.selectedCategory) params.category = this.selectedCategory;
        if (this.searchQuery) params.search = this.searchQuery;
        if (this.showDeleted) params.showDeleted = true;

        const response = await axios.get('http://localhost:3000/menu', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          params,
        });

        this.menuItems = response.data.menuItems || [];
        this.totalItems = response.data.totalItems || 0;
        this.totalPages = response.data.totalPages || 1;
        this.currentPage = response.data.currentPage || 1;
      } catch (error) {
        console.error('Lỗi khi tải menu:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          Swal.fire('Hết phiên!', 'Vui lòng đăng nhập lại.', 'error');
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          this.$router.push('/login');
        } else {
          Swal.fire('Lỗi!', 'Không thể tải menu. Vui lòng thử lại.', 'error');
        }
      }
    },
    debouncedFetchMenu: debounce(function () {
      this.currentPage = 1;
      this.fetchMenu();
    }, 300),
    async changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        await this.fetchMenu();
      }
    },
    onFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.newItem.image = file;
        this.newImagePreview = URL.createObjectURL(file);
      } else {
        this.newItem.image = null;
        this.newImagePreview = null;
        this.newItem.imagePublicId = null;
      }
    },
    onEditFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.editItem.image = file;
        this.editImagePreview = URL.createObjectURL(file);
      } else {
        this.editItem.image = null;
        this.editImagePreview = null;
        this.editItem.imagePublicId = null;
      }
    },
    removeNewImagePreview() {
      this.newItem.image = null;
      this.newImagePreview = null;
      this.newItem.imagePublicId = null;
    },
    removeEditImagePreview() {
      this.editItem.image = null;
      this.editImagePreview = null;
      this.editItem.imagePublicId = null;
    },
    async uploadImageToCloudinary(file, category) {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/cloudinary-upload-preset', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const { upload_preset, cloud_name } = response.data;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', upload_preset);
      formData.append('folder', `menu/${category}`);

      const uploadResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log('Upload progress:', percentCompleted + '%');
          },
        }
      );
      return {
        url: uploadResponse.data.secure_url,
        publicId: uploadResponse.data.public_id,
      };
    },
    async addItem() {
      if (!this.newItem.name || !this.newItem.price || !this.newItem.description || !this.newItem.category) {
        Swal.fire('Lỗi!', 'Vui lòng điền đầy đủ các trường bắt buộc.', 'error');
        return;
      }

      Swal.fire({ title: 'Đang xử lý...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      try {
        let imageUrl = null;
        let imagePublicId = null;
        if (this.newItem.image) {
          const uploadResult = await this.uploadImageToCloudinary(this.newItem.image, this.newItem.category);
          imageUrl = uploadResult.url;
          imagePublicId = uploadResult.publicId;
        }

        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found.');
        const response = await axios.post(
          'http://localhost:3000/menu',
          {
            name: this.newItem.name,
            price: this.newItem.price,
            description: this.newItem.description,
            category: this.newItem.category,
            image: imageUrl,
            imagePublicId: imagePublicId,
          },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        const newItem = response.data;
        this.recentItems.unshift(newItem);
        if (this.recentItems.length > 5) this.recentItems.pop();
        this.resetForm();
        Swal.fire('Thành công!', 'Món ăn đã được thêm.', 'success');
        await this.fetchMenu();
      } catch (error) {
        console.error('Add error:', error.response?.data || error.message);
        Swal.fire('Lỗi!', error.response?.data?.message || 'Không thể thêm món. Vui lòng thử lại.', 'error');
      }
    },
    openEditPopup(item) {
      this.editItem = { ...item };
      this.editImagePreview = null;
      this.showEditPopup = true;
    },
    async updateItem() {
      if (!this.editItem.name || !this.editItem.price || !this.editItem.description || !this.editItem.category) {
        Swal.fire('Lỗi!', 'Vui lòng điền đầy đủ các trường bắt buộc.', 'error');
        return;
      }

      Swal.fire({ title: 'Đang xử lý...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      try {
        let imageUrl = this.editItem.image;
        let imagePublicId = this.editItem.imagePublicId;
        if (this.editItem.image instanceof File) {
          const uploadResult = await this.uploadImageToCloudinary(this.editItem.image, this.editItem.category);
          imageUrl = uploadResult.url;
          imagePublicId = uploadResult.publicId;
        } else if (this.editItem.image === null) {
          imageUrl = null;
          imagePublicId = null;
        }

        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found.');
        const response = await axios.patch(
          `http://localhost:3000/menu/${this.editItem.id}`,
          {
            name: this.editItem.name,
            price: this.editItem.price,
            description: this.editItem.description,
            category: this.editItem.category,
            image: imageUrl,
            imagePublicId: imagePublicId,
          },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        const updatedItem = response.data;
        const index = this.menuItems.findIndex((i) => i.id === this.editItem.id);
        this.menuItems[index] = updatedItem;
        this.recentItems.unshift(updatedItem);
        if (this.recentItems.length > 5) this.recentItems.pop();
        this.closeEditPopup();
        Swal.fire('Thành công!', 'Món ăn đã được cập nhật.', 'success');
        await this.fetchMenu();
      } catch (error) {
        console.error('Update error:', error.response?.data || error.message);
        Swal.fire('Lỗi!', error.response?.data?.message || 'Không thể sửa món. Vui lòng thử lại.', 'error');
      }
    },
    async deleteItem(id) {
      const result = await Swal.fire({
        title: 'Bạn có chắc muốn xóa món này?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ae9a64',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
      });

      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('No token found. Please login again.');
          }
          await axios.delete(`http://localhost:3000/menu/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          this.menuItems = this.menuItems.filter((item) => item.id !== id);
          this.recentItems = this.recentItems.filter((item) => item.id !== id);
          Swal.fire('Thành công!', 'Món ăn đã được xóa.', 'success');
          await this.fetchMenu();
        } catch (error) {
          console.error('Lỗi khi xóa món:', error.response?.data || error.message);
          if (error.response?.status === 401 || error.response?.status === 403) {
            Swal.fire('Hết phiên!', 'Vui lòng đăng nhập lại.', 'error');
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            this.$router.push('/login');
          } else {
            Swal.fire('Lỗi!', error.response?.data?.message || 'Không thể xóa món ăn. Vui lòng thử lại.', 'error');
          }
        }
      }
    },
    async restoreItem(id) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found. Please login again.');
        }
        const response = await axios.post(`http://localhost:3000/menu/restore/${id}`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const updatedItem = response.data.item;
        const index = this.menuItems.findIndex((i) => i.id === id);
        if (index !== -1) this.menuItems[index] = updatedItem;
        this.recentItems.unshift(updatedItem);
        if (this.recentItems.length > 5) this.recentItems.pop();
        Swal.fire('Thành công!', 'Món ăn đã được khôi phục.', 'success');
        await this.fetchMenu();
      } catch (error) {
        console.error('Lỗi khi khôi phục món:', error.response?.data || error.message);
        if (error.response?.status === 401 || error.response?.status === 403) {
          Swal.fire('Hết phiên!', 'Vui lòng đăng nhập lại.', 'error');
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          this.$router.push('/login');
        } else if (error.response?.status === 400) {
          Swal.fire('Lỗi!', error.response.data.message || 'Không thể khôi phục món ăn. Vui lòng thử lại.', 'error');
        } else {
          Swal.fire('Lỗi!', 'Không thể khôi phục món ăn. Vui lòng thử lại.', 'error');
        }
      }
    },
    getImageUrl(imageName) {
      if (!imageName) {
        return 'https://res.cloudinary.com/drem0ihib/image/upload/v1746546155/Logo_uujqeu.png';
      }
      return imageName;
    },
    formatPrice(price) {
      return new Intl.NumberFormat('vi-VN').format(price);
    },
    resetForm() {
      this.newItem = { name: '', price: 0, description: '', category: '', image: null, imagePublicId: null };
      this.newImagePreview = null;
    },
    closeEditPopup() {
      this.showEditPopup = false;
      this.editItem = null;
      this.editImagePreview = null;
    },
  },
};
</script>

<style scoped>
.main-layout {
  display: flex;
  background: #FFF8E7; /* Trắng kem */
}

.menu-management {
  flex: 1;
  margin: 0;
  padding: 0;
  background-color: #FFF8E7; /* Trắng kem */
  color: #3B2F2F; /* Đen nâu */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-right: 20px;
  padding-left: 20px;
  transition: margin-left 0.3s ease;
}

.menu-management h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #6B4226; /* Nâu đất */
  margin-bottom: 20px;
  margin-top: 30px;
  text-align: center;
  text-shadow: 0 0 5px #E7C27D, 0 0 30px #E7C27D; /* Hiệu ứng vàng */
}

.split-container {
  display: flex;
  gap: 25px;
  height: calc(100vh - 150px);
  margin-left: 0;
  margin-top: 30px;
  z-index: 1;
}

.left-panel,
.right-panel {
  flex: 1;
  border: 2px solid #E7C27D; /* Vàng nhạt */
  border-radius: 15px;
  overflow: hidden;
  background: rgba(255, 248, 231, 0.6); /* Trắng kem trong suốt */
  box-shadow: 0 6px 20px rgba(107, 66, 38, 0.2); /* Bóng nâu */
  backdrop-filter: blur(10px);
}

.left-panel {
  padding: 25px;
  overflow-y: auto;
}

.right-panel {
  padding: 0;
  display: flex;
  flex-direction: column;
}

.left-panel h2,
.right-panel h2 {
  margin-bottom: 20px;
  font-size: 1.5rem;
  color: #6B4226; /* Nâu đất */
  text-align: center;
  font-weight: 700;
  padding-bottom: 10px;
  border-bottom: 2px solid #E7C27D; /* Vàng nhạt */
}

.add-form,
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
  margin-bottom: 20px;
}

.edit-form {
  max-height: 500px;
  overflow-y: auto;
  padding-right: 10px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #6B4226; /* Nâu đất */
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 12px;
  border: 1px solid #8B5E3C; /* Nâu gỗ */
  border-radius: 10px;
  font-size: 14px;
  background: rgba(255, 248, 231, 0.8); /* Trắng kem trong suốt */
  color: #3B2F2F; /* Đen nâu */
  transition: all 0.3s ease;
  font-weight: 500;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #E7C27D; /* Vàng nhạt */
  box-shadow: 0 0 0 3px rgba(231, 194, 125, 0.3);
  outline: none;
  background: #FFF8E7; /* Trắng kem */
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.image-upload {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.current-image,
.preview-image-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.current-image p,
.preview-image-container p {
  font-size: 14px;
  color: #6B4226; /* Nâu đất */
  font-weight: 600;
}

.preview-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 10px;
  border: 2px solid #E7C27D; /* Vàng nhạt */
  box-shadow: 0 4px 12px rgba(107, 66, 38, 0.2);
}

.remove-preview {
  padding: 8px 16px;
  background: #D32F2F; /* Đỏ */
  color: #FFF8E7; /* Trắng kem */
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  width: fit-content;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 1px solid #FFF8E7; /* Viền trắng */
}

.remove-preview:hover {
  background: #C62828; /* Đỏ đậm */
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
}

.submit-button {
  padding: 14px;
  background: linear-gradient(135deg, #8B5E3C, #6B4226); /* Gradient nâu */
  color: #FFF8E7; /* Trắng kem */
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(107, 66, 38, 0.3);
  border: 2px solid #E7C27D; /* Viền vàng */
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.submit-button:hover {
  background: linear-gradient(135deg, #6B4226, #8B5E3C);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(107, 66, 38, 0.4);
}

.recent-items-wrapper {
  max-height: 300px;
  overflow-y: auto;
  border-radius: 8px;
  background: rgba(255, 248, 231, 0.4);
  padding: 10px;
}

.recent-items {
  list-style: none;
  padding: 0;
}

.recent-items li {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid rgba(231, 194, 125, 0.3); /* Vàng nhạt trong suốt */
  transition: background-color 0.3s ease;
}

.recent-items li:hover {
  background: rgba(231, 194, 125, 0.1);
  border-radius: 6px;
}

.filter-search.fixed {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(139, 94, 60, 0.1); /* Nâu gỗ trong suốt */
  padding: 20px;
  border-bottom: 2px solid #E7C27D; /* Vàng nhạt */
  display: flex;
  gap: 15px;
  align-items: center;
  backdrop-filter: blur(10px);
}

.filter-search select,
.filter-search input {
  padding: 10px;
  font-size: 14px;
  border: 1px solid #8B5E3C; /* Nâu gỗ */
  border-radius: 8px;
  background: rgba(255, 248, 231, 0.8); /* Trắng kem trong suốt */
  color: #3B2F2F; /* Đen nâu */
  font-weight: 500;
  transition: all 0.3s ease;
}

.filter-search select:focus,
.filter-search input:focus {
  border-color: #E7C27D; /* Vàng nhạt */
  box-shadow: 0 0 0 3px rgba(231, 194, 125, 0.3);
}

.checkbox-label {
  color: #6B4226; /* Nâu đất */
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid #8B5E3C; /* Nâu gỗ */
  border-radius: 4px;
  background-color: rgba(255, 248, 231, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.checkbox-label input[type="checkbox"]:checked {
  background-color: #8B5E3C; /* Nâu gỗ */
  border-color: #8B5E3C;
}

.checkbox-label input[type="checkbox"]:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #FFF8E7; /* Trắng kem */
  font-size: 12px;
  font-weight: bold;
}

.right-panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.category-group {
  margin-bottom: 25px;
  background: rgba(255, 248, 231, 0.4);
  border-radius: 10px;
  padding: 15px;
  border: 1px solid rgba(231, 194, 125, 0.3);
}

.category-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 15px;
  color: #FFF8E7; /* Trắng kem */
  background: linear-gradient(135deg, #8B5E3C, #6B4226); /* Gradient nâu */
  padding: 12px 15px;
  border-radius: 8px;
  text-align: center;
}

ul {
  list-style: none;
  padding: 0;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-bottom: 1px solid rgba(231, 194, 125, 0.3); /* Vàng nhạt trong suốt */
  transition: all 0.3s ease;
  border-radius: 8px;
  margin-bottom: 8px;
}

.menu-item:hover {
  background: rgba(231, 194, 125, 0.15);
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(107, 66, 38, 0.1);
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #3B2F2F; /* Đen nâu */
  flex: 1;
}

.item-name {
  font-weight: 600;
  color: #6B4226; /* Nâu đất */
  font-size: 16px;
}

.item-description {
  font-size: 14px;
  color: #3B2F2F; /* Đen nâu */
  opacity: 0.8;
}

.item-price {
  font-weight: 700;
  color: #8B5E3C; /* Nâu gỗ */
  font-size: 15px;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  padding: 8px 16px;
  font-size: 13px;
  background: #E7C27D; /* Vàng nhạt */
  color: #6B4226; /* Nâu đất */
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(107, 66, 38, 0.2);
  border: 1px solid rgba(255, 248, 231, 0.3);
}

.delete-button {
  background: #D32F2F; /* Đỏ */
  color: #FFF8E7; /* Trắng kem */
}

.restore-button {
  background: #388E3C; /* Xanh lá */
  color: #FFF8E7; /* Trắng kem */
}

.action-button:hover {
  background: #F5E3B3; /* Be nhạt */
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 194, 125, 0.3);
}

.delete-button:hover {
  background: #C62828; /* Đỏ đậm */
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
}

.restore-button:hover {
  background: #2E7D32; /* Xanh lá đậm */
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(56, 142, 60, 0.3);
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 25px;
  padding: 15px;
  background: rgba(255, 248, 231, 0.4);
  border-radius: 10px;
}

.pagination button {
  padding: 10px 18px;
  background: #8B5E3C; /* Nâu gỗ */
  color: #FFF8E7; /* Trắng kem */
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(107, 66, 38, 0.3);
  border: 1px solid #E7C27D; /* Viền vàng */
}

.pagination button:hover:not(:disabled) {
  background: #6B4226; /* Nâu đất */
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 66, 38, 0.4);
}

.pagination button:disabled {
  background: #A89B8B; /* Nâu xám */
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
}

.popup {
  background: linear-gradient(135deg, #FFF8E7, #F5E3B3); /* Gradient trắng kem đến be */
  padding: 30px;
  border-radius: 15px;
  width: 450px;
  box-shadow: 0 15px 35px rgba(107, 66, 38, 0.4);
  border: 2px solid #E7C27D; /* Viền vàng */
}

.popup h2 {
  margin-bottom: 20px;
  font-size: 1.5rem;
  text-align: center;
  color: #6B4226; /* Nâu đất */
  font-weight: 700;
}

.popup-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 25px;
}

.cancel-button {
  padding: 10px 20px;
  background: rgba(139, 94, 60, 0.2); /* Nâu gỗ trong suốt */
  color: #6B4226; /* Nâu đất */
  border: 1px solid #8B5E3C; /* Nâu gỗ */
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.cancel-button:hover {
  background: rgba(139, 94, 60, 0.3);
  transform: translateY(-2px);
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(107, 66, 38, 0.8); /* Nâu đất trong suốt */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

/* Custom Scrollbar */
.recent-items-wrapper::-webkit-scrollbar,
.edit-form::-webkit-scrollbar,
.right-panel-content::-webkit-scrollbar {
  width: 8px;
}

.recent-items-wrapper::-webkit-scrollbar-track,
.edit-form::-webkit-scrollbar-track,
.right-panel-content::-webkit-scrollbar-track {
  background: rgba(231, 194, 125, 0.1);
  border-radius: 4px;
}

.recent-items-wrapper::-webkit-scrollbar-thumb,
.edit-form::-webkit-scrollbar-thumb,
.right-panel-content::-webkit-scrollbar-thumb {
  background: #E7C27D; /* Vàng nhạt */
  border-radius: 4px;
}

.recent-items-wrapper::-webkit-scrollbar-thumb:hover,
.edit-form::-webkit-scrollbar-thumb:hover,
.right-panel-content::-webkit-scrollbar-thumb:hover {
  background: #8B5E3C; /* Nâu gỗ */
}

/* Responsive Design */
@media (max-width: 768px) {
  .split-container {
    flex-direction: column;
    height: auto;
    gap: 20px;
  }

  .left-panel,
  .right-panel {
    width: 100%;
  }

  .menu-management {
    padding: 15px;
  }

  .filter-search.fixed {
    flex-direction: column;
    gap: 10px;
  }

  .menu-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .item-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .popup {
    width: 90%;
    margin: 20px;
  }
}

@media (max-width: 480px) {
  .menu-management h1 {
    font-size: 1.6rem;
    margin-top: 20px;
  }

  .left-panel,
  .right-panel {
    padding: 15px;
  }

  .action-button {
    padding: 6px 12px;
    font-size: 12px;
  }

  .pagination {
    flex-wrap: wrap;
  }

  .popup-buttons {
    flex-direction: column;
  }

  .cancel-button,
  .submit-button {
    width: 100%;
    text-align: center;
  }
}
</style>