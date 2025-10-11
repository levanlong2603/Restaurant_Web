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
  background: #c2aa77;
}

.menu-management {
  flex: 1;
  margin: 0;
  padding: 0;
  background-color: #c2aa77;
  color: #2b2b2b;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-right: 20px;
  padding-left: 20px;
  transition: margin-left 0.3s ease;
}


.menu-management h1 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2b2b2b;
  margin-bottom: 20px;
  margin-top: 30px;
  text-align: center;
}

.split-container {
  display: flex;
  gap: 20px;
  height: calc(100vh - 150px);
  margin-left: 0;
  margin-top: 30px;
  z-index: 1;
}

.left-panel,
.right-panel {
  flex: 1;
  border: 1px solid #fbcf67;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.left-panel {
  padding: 20px;
  overflow-y: auto;
}

.right-panel {
  padding: 0;
  display: flex;
  flex-direction: column;
}

.left-panel h2,
.right-panel h2 {
  margin-bottom: 15px;
  font-size: 25px;
  color: #2b2b2b;
  text-align: center;
  font-weight: bold;
}

.add-form,
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 30px;
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
  gap: 5px;
}

.form-group label {
  font-size: 14px;
  font-weight: bold;
  color: #2b2b2b;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px;
  border: 1px solid #fbcf67;
  border-radius: 8px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.2);
  color: #2b2b2b;
  transition: all 0.3s;
  font-weight: 500;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #e5b756;
  box-shadow: 0 0 5px rgba(251, 207, 103, 0.5);
  outline: none;
  background: rgba(255, 255, 255, 0.3);
}

.form-group textarea {
  resize: vertical;
  min-height: 20px;
}

.image-upload {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.current-image,
.preview-image-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.current-image p,
.preview-image-container p {
  font-size: 14px;
  color: #2b2b2b;
  opacity: 0.8;
  font-weight: 500;
}

.preview-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #fbcf67;
}

.remove-preview {
  padding: 5px 10px;
  background: #d84315;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  width: fit-content;
  font-weight: 500;
  transition: all 0.3s;
}

.remove-preview:hover {
  background: #c62828;
  transform: scale(1.05);
}

.submit-button {
  padding: 12px;
  background: #fbcf67;
  color: #2b2b2b;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.submit-button:hover {
  background: #e5b756;
  transform: translateY(-2px);
}

.recent-items-wrapper {
  max-height: 300px;
  overflow-y: auto;
}

.recent-items {
  list-style: none;
  padding: 0;
}

.recent-items li {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 10px;
  border-bottom: 1px solid rgba(251, 207, 103, 0.3);
}

.filter-search.fixed {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-bottom: 1px solid #fbcf67;
  display: flex;
  gap: 10px;
  align-items: center;
}

.filter-search select,
.filter-search input {
  padding: 8px;
  font-size: 16px;
  border: 1px solid #fbcf67;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  color: #2b2b2b;
  font-weight: 500;
}

.checkbox-label {
  color: #2b2b2b;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
}

.checkbox-label input[type="checkbox"] {
  appearance: none;
  width: 16px;
  height: 16px;
  border: 2px solid #fbcf67;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s;
}

.checkbox-label input[type="checkbox"]:checked {
  background-color: #fbcf67;
  position: relative;
}

.checkbox-label input[type="checkbox"]:checked::after {
  content: '\2713';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #2b2b2b;
  font-size: 12px;
  font-weight: bold;
}

.right-panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.category-group {
  margin-bottom: 20px;
}

.category-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #2b2b2b;
  background: rgba(251, 207, 103, 0.3);
  padding: 10px;
  border-radius: 8px;
}

ul {
  list-style: none;
  padding: 0;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 15px;
  border-bottom: 1px solid rgba(251, 207, 103, 0.3);
  transition: all 0.3s;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  color: #2b2b2b;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  padding: 6px 12px;
  font-size: 14px;
  background: #fbcf67;
  color: #2b2b2b;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.delete-button {
  background: #d84315;
  color: white;
}

.restore-button {
  background: #4caf50;
  color: white;
}

.action-button:hover {
  background: #e5b756;
  transform: scale(1.05);
}

.delete-button:hover {
  background: #c62828;
  transform: scale(1.05);
}

.restore-button:hover {
  background: #45a049;
  transform: scale(1.05);
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.pagination button {
  padding: 8px 16px;
  background: #fbcf67;
  color: #2b2b2b;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.pagination button:hover:not(:disabled) {
  background: #e5b756;
  transform: translateY(-2px);
}

.pagination button:disabled {
  background: rgba(255, 255, 255, 0.2);
  cursor: not-allowed;
  opacity: 0.6;
}

.popup {
  background: linear-gradient(135deg, #c2aa77, #b29a67);
  padding: 25px;
  border-radius: 12px;
  width: 450px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(251, 207, 103, 0.3);
}

.popup h2 {
  margin-bottom: 20px;
  font-size: 25px;
  text-align: center;
  color: #2b2b2b;
  font-weight: bold;
}

.popup-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.cancel-button {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.3);
  color: #2b2b2b;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
}

.cancel-button:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: scale(1.05);
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

@media (max-width: 768px) {
  .split-container {
    flex-direction: column;
    height: auto;
  }

  .left-panel,
  .right-panel {
    width: 100%;
  }

  .menu-management {
    padding: 15px;
  }
}
</style>