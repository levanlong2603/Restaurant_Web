<template>
  <div class="user-profile-page">
    <!-- Sidebar cố định -->
    <div class="sidebar-fixed">
      <Navigation @sidebar-toggle="handleSidebarToggle" />
    </div>

    <!-- Main content điều chỉnh theo sidebar -->
    <main class="profile-container" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <!-- Profile Header -->
      <div class="profile-header">
        <h1 class="profile-title">Hồ sơ người dùng</h1>
        <div class="profile-status">
          <span class="status-badge" :class="user.role?.toLowerCase()">{{ user.role }}</span>
        </div>
      </div>

      <div class="profile-content">
        <!-- Left Panel - Avatar & Basic Info -->
        <div class="profile-left">
          <div class="avatar-section">
              <div class="avatar-container">
              <img :src="getImageUrl(user.profilePhoto)" alt="User Avatar" class="avatar" @error="handleImageError" />
              <div v-if="isEditing" class="avatar-overlay">
                <label for="photo-upload" class="upload-label">
                  <span>Đổi ảnh</span>
                </label>
                <input 
                  id="photo-upload" 
                  type="file" 
                  @change="handlePhotoUpload" 
                  accept="image/jpeg,image/jpg,image/png"
                  class="upload-input" 
                />
              </div>
            </div>

            <div v-if="isEditing && previewPhoto" class="preview-section">
              <p class="preview-label">Xem trước:</p>
              <div class="preview-container">
                <img :src="previewPhoto" alt="Preview Avatar" class="preview-image" />
                <button type="button" class="remove-preview" @click="removePhoto">
                  Xóa
                </button>
              </div>
            </div>
          </div>

          <div class="user-basic-info">
            <h2 class="display-name">{{ user.name }}</h2>
            <p class="username">{{ user.email }}</p>
            <div class="user-stats">
              <div class="stat-item">
                <span class="stat-label">Thành viên từ</span>
                <span class="stat-value">2025</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Trạng thái</span>
                <span class="stat-value active">Hoạt động</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel - Detailed Information -->
        <div class="profile-right">
          <!-- Personal Information Section -->
          <div class="info-section">
            <div class="section-header">
              <h3>Thông tin cá nhân</h3>
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Họ và tên</label>
                <input 
                  type="text" 
                  v-model="user.name" 
                  :readonly="!isEditing" 
                  :class="{ 'editable': isEditing }"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input 
                  type="email" 
                  v-model="user.email" 
                  :readonly="!isEditing" 
                  :class="{ 'editable': isEditing }"
                  class="form-input"
                />
              </div>
            </div>
          </div>

          <!-- Contact Information Section -->
          <div class="info-section">
            <div class="section-header">
              <h3>Thông tin liên hệ</h3>
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Số điện thoại</label>
                <input 
                  type="text" 
                  v-model="user.phoneNumber" 
                  :readonly="!isEditing" 
                  :class="{ 'editable': isEditing }"
                  class="form-input"
                  placeholder="+84 XXX XXX XXX"
                />
              </div>
              <div class="form-group full-width">
                <label class="form-label">Địa chỉ</label>
                <input 
                  type="text" 
                  v-model="user.address" 
                  :readonly="!isEditing" 
                  :class="{ 'editable': isEditing }"
                  class="form-input"
                  placeholder="Nhập địa chỉ đầy đủ của bạn"
                />
              </div>
            </div>
          </div>

          <!-- Account Settings Section -->
          <div class="info-section">
            <div class="section-header">
              <h3>Cài đặt tài khoản</h3>
            </div>
            <div class="settings-grid">
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">Mật khẩu</span>
                  <span class="setting-desc">Đã đổi 2 tháng trước</span>
                </div>
                <button class="setting-action" @click="openChangePasswordModal">
                  Đổi mật khẩu
                </button>
              </div>
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">Trạng thái tài khoản</span>
                  <span class="setting-desc">Hoạt động và đã xác minh</span>
                </div>
                <div class="status-indicator active"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <div class="button-group">
          <button v-if="!isEditing" class="edit-btn primary-btn" @click="startEditing">
            Chỉnh sửa hồ sơ
          </button>
          <button v-if="!isEditing" class="password-btn secondary-btn" @click="openChangePasswordModal">
            Đổi mật khẩu
          </button>
          <template v-else>
            <button class="cancel-btn outline-btn" @click="cancelChanges">
              Hủy
            </button>
            <button class="save-btn primary-btn" @click="saveChanges">
              Lưu
            </button>
          </template>
        </div>
        
        <button v-if="!isEditing" class="delete-btn danger-btn" @click="deleteUser">
          Xóa tài khoản
        </button>
      </div>

      <!-- Change Password Modal -->
      <div class="modal-overlay" v-if="showChangePasswordModal" @click="closeChangePasswordModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Đổi mật khẩu</h3>
            <button class="close-btn" @click="closeChangePasswordModal">
              ×
            </button>
          </div>
          <form @submit.prevent="changePassword" class="password-form">
            <div class="form-group">
              <label for="current-password" class="form-label">Mật khẩu hiện tại</label>
              <input 
                type="password" 
                id="current-password" 
                v-model="currentPassword" 
                required 
                class="form-input"
                placeholder="Nhập mật khẩu hiện tại"
              />
            </div>
            <div class="form-group">
              <label for="new-password" class="form-label">Mật khẩu mới</label>
              <input 
                type="password" 
                id="new-password" 
                v-model="newPassword" 
                required 
                class="form-input"
                placeholder="Nhập mật khẩu mới"
              />
            </div>
            <div class="form-group">
              <label for="confirm-password" class="form-label">Xác nhận mật khẩu mới</label>
              <input 
                type="password" 
                id="confirm-password" 
                v-model="confirmPassword" 
                required 
                class="form-input"
                placeholder="Xác nhận mật khẩu mới"
              />
            </div>
            <div class="password-requirements">
              <p class="requirements-title">Yêu cầu mật khẩu:</p>
              <ul class="requirements-list">
                <li :class="{ 'met': newPassword.length >= 8 }">Ít nhất 8 ký tự</li>
                <li :class="{ 'met': /[A-Z]/.test(newPassword) }">Có ít nhất một chữ cái in hoa</li>
                <li :class="{ 'met': /[0-9]/.test(newPassword) }">Có ít nhất một chữ số</li>
              </ul>
            </div>
            <div class="modal-actions">
              <button type="button" class="cancel-btn outline-btn" @click="closeChangePasswordModal">
                Hủy
              </button>
              <button type="submit" class="save-btn primary-btn" :disabled="!isPasswordValid">
                Cập nhật mật khẩu
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';
import Navigation from '../components/Navigation.vue';

export default {
  name: 'UserProfile',
  components: {
    Navigation,
  },
  data() {
    return {
      user: {
        name: '',
        email: '',
        phoneNumber: '',
        address: '',
        role: '',
        profilePhoto: null,
        profilePhotoPublicId: null,
      },
      isEditing: false,
      originalUser: null,
      defaultAvatar: 'https://freesvg.org/img/abstract-user-flat-3.png',
      previewPhoto: null,
      profilePhotoFile: null,
      showChangePasswordModal: false,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      isSidebarCollapsed: false,
    };
  },
  computed: {
    isPasswordValid() {
      return this.newPassword.length >= 8 && 
             /[A-Z]/.test(this.newPassword) && 
             /[0-9]/.test(this.newPassword) &&
             this.newPassword === this.confirmPassword;
    }
  },
  methods: {
    handleSidebarToggle(isCollapsed) {
      this.isSidebarCollapsed = isCollapsed;
    },
    async fetchUser() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found. Please login again.');
        }
        
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          throw new Error('No user data found. Please login again.');
        }

        const user = JSON.parse(userStr);
        if (!user.user_id) {
          throw new Error('Invalid user data. Please login again.');
        }

        const response = await axios.get(`http://localhost:3000/users/${user.user_id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.data.user) {
          throw new Error('No user data received from server.');
        }

        this.user = response.data.user;

        if (JSON.stringify(user) !== JSON.stringify(response.data.user)) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }

      } catch (error) {
        console.error('Error fetching user:', error);
        
        if (error.message.includes('login again')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          this.$router.push('/login');
          return;
        }

        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          this.$router.push('/login');
          return;
        }

        Swal.fire('Error!', 'Cannot fetch user information. Please try again later.', 'error');
      }
    },
    startEditing() {
      this.originalUser = { ...this.user };
      this.isEditing = true;
    },
    cancelChanges() {
      this.user = { ...this.originalUser };
      this.isEditing = false;
      this.previewPhoto = null;
      this.profilePhotoFile = null;
    },
    async uploadImageToCloudinary(file) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/cloudinary-upload-preset', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const { upload_preset, cloud_name } = response.data;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', upload_preset);
        formData.append('folder', 'users');

        const uploadResponse = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
          formData
        );
        return { url: uploadResponse.data.secure_url, publicId: uploadResponse.data.public_id };
      } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        throw new Error('Cannot upload image to Cloudinary.');
      }
    },
    async saveChanges() {
      try {
        Swal.fire({ 
          title: 'Processing...', 
          allowOutsideClick: false, 
          didOpen: () => Swal.showLoading() 
        });

        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user['user_id'];

        let profilePhotoUrl = this.user.profilePhoto;
        let profilePhotoPublicId = this.user.profilePhotoPublicId;
        if (this.profilePhotoFile) {
          const uploadResult = await this.uploadImageToCloudinary(this.profilePhotoFile);
          profilePhotoUrl = uploadResult.url;
          profilePhotoPublicId = uploadResult.publicId;
        } else if (this.user.profilePhoto === null) {
          profilePhotoUrl = null;
          profilePhotoPublicId = null;
        }

        const userData = {
          name: this.user.name,
          phoneNumber: this.user.phoneNumber,
          email: this.user.email,
          address: this.user.address,
          profilePhoto: profilePhotoUrl,
          profilePhotoPublicId,
        };

        const response = await axios.put(`http://localhost:3000/users/${userId}`, userData, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });

        this.user = response.data.user;
        localStorage.setItem('user', JSON.stringify(this.user));
        Swal.fire('Thành công!', 'Cập nhật hồ sơ thành công!', 'success');
        this.isEditing = false;
        this.previewPhoto = null;
        this.profilePhotoFile = null;
      } catch (error) {
        console.error('Error saving changes:', error);
        if (error.response?.status === 400) {
          Swal.fire('Lỗi!', 'Email đã tồn tại.', 'error');
        } else if (error.response?.status === 403) {
          Swal.fire('Lỗi!', 'Chỉ người quản lý mới có quyền thay đổi!', 'error');
        } else if (error.response?.status === 401) {
          this.$router.push('/login');
        } else {
          Swal.fire('Lỗi!', 'Lỗi khi lưu thông tin!', 'error');
        }
      }
    },
    async deleteUser() {
      const result = await Swal.fire({
        title: 'Bạn có chắc muốn xóa tài khoản này không?',
        text: "Hành động này không thể hoàn tác!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6B4226',
        confirmButtonText: 'Có, xóa tài khoản!',
        cancelButtonText: 'Hủy'
      });

      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            this.$router.push('/login');
            return;
          }

          const user = JSON.parse(localStorage.getItem('user'));
          const userId = user['user_id'];
          await axios.delete(`http://localhost:3000/users/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          Swal.fire('Đã xóa!', 'Tài khoản của bạn đã được xóa.', 'success');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          this.$router.push('/login');
        } catch (error) {
          console.error('Error deleting user:', error);
          if (error.response?.status === 403) {
            Swal.fire('Lỗi!', 'Truy cập bị từ chối: Cần quyền quản lý.', 'error');
          } else if (error.response?.status === 401) {
            this.$router.push('/login');
          } else {
            Swal.fire('Lỗi!', 'Lỗi khi xóa tài khoản.', 'error');
          }
        }
      }
    },
    openChangePasswordModal() {
      this.showChangePasswordModal = true;
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
    },
    closeChangePasswordModal() {
      this.showChangePasswordModal = false;
    },
    async changePassword() {
      if (!this.isPasswordValid) {
        Swal.fire('Error!', 'Please check password requirements.', 'error');
        return;
      }

      try {
        const passwordData = {
          currentPassword: this.currentPassword,
          newPassword: this.newPassword,
        };
        await axios.put('http://localhost:3000/users/change-password', passwordData, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });

        Swal.fire('Success!', 'Password changed successfully!', 'success');
        this.closeChangePasswordModal();
      } catch (error) {
        console.error('Error changing password:', error);
        if (error.response?.status === 400) {
          Swal.fire('Error!', 'Current password is incorrect!', 'error');
        } else if (error.response?.status === 401) {
          this.$router.push('/login');
        } else {
          Swal.fire('Error!', 'Error changing password!', 'error');
        }
      }
    },
    handlePhotoUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const filetypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = 5 * 1024 * 1024;
        if (!filetypes.includes(file.type)) {
          Swal.fire('Error!', 'Only image files (jpeg, jpg, png) are allowed!', 'error');
          event.target.value = '';
          return;
        }
        if (file.size > maxSize) {
          Swal.fire('Error!', 'Image size cannot exceed 5MB!', 'error');
          event.target.value = '';
          return;
        }
        this.profilePhotoFile = file;
        this.previewPhoto = URL.createObjectURL(file);
        this.user.profilePhoto = file;
      } else {
        this.profilePhotoFile = null;
        this.previewPhoto = null;
        this.user.profilePhoto = null;
      }
    },
    removePhoto() {
      this.profilePhotoFile = null;
      this.previewPhoto = null;
      this.user.profilePhoto = null;
      this.user.profilePhotoPublicId = null;
    },
    getImageUrl(imageName) {
      if (!imageName) {
        return this.defaultAvatar;
      }
      return imageName;
    },
    handleImageError(event) {
      event.target.src = this.defaultAvatar;
    },
  },
  mounted() {
    this.fetchUser();
  },
};
</script>

<style scoped>
.user-profile-page {
  display: flex;
  min-height: 100vh;
  background-color: #FFF8E7;
  font-family: 'Arial', sans-serif;
  position: relative;
}

/* Sidebar cố định */
.sidebar-fixed {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 1000;
}

/* Main container điều chỉnh theo sidebar */
.profile-container {
  flex: 1;
  padding: 2rem;
  background-color: #FFF8E7;
  transition: margin-left 0.3s ease;
  margin-left: 280px;
  min-height: 100vh;
  position: relative;
}

.profile-container.sidebar-collapsed {
  margin-left: 0;
}

/* Profile Header */
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(231, 194, 125, 0.3);
}

.profile-title {
  font-size: 2rem;
  font-weight: 700;
  color: #6B4226;
  margin: 0;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.admin {
  background: linear-gradient(135deg, #8B5E3C, #6B4226);
  color: #FFF8E7;
}

.status-badge.user {
  background: rgba(231, 194, 125, 0.3);
  color: #6B4226;
}

.status-badge.manager {
  background: rgba(56, 142, 60, 0.3);
  color: #2E7D32;
}

/* Profile Content Layout */
.profile-content {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

/* Left Panel */
.profile-left {
  background: rgba(255, 248, 231, 0.6);
  border-radius: 15px;
  padding: 2rem;
  border: 2px solid rgba(231, 194, 125, 0.3);
  box-shadow: 0 4px 15px rgba(107, 66, 38, 0.1);
  height: fit-content;
}

.avatar-section {
  text-align: center;
  margin-bottom: 1.5rem;
}

.avatar-container {
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #E7C27D;
  box-shadow: 0 4px 15px rgba(107, 66, 38, 0.2);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(107, 66, 38, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.upload-label {
  color: #FFF8E7;
  cursor: pointer;
  text-align: center;
  font-size: 0.8rem;
}

.upload-icon {
  display: block;
  font-size: 1.2rem;
  margin-bottom: 0.3rem;
}

.upload-input {
  display: none;
}

.preview-section {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 248, 231, 0.8);
  border-radius: 10px;
  border: 1px solid rgba(231, 194, 125, 0.5);
}

.preview-label {
  font-size: 0.9rem;
  color: #6B4226;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.preview-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #E7C27D;
}

.remove-preview {
  padding: 0.4rem 0.8rem;
  background: #D32F2F;
  color: #FFF8E7;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.3s ease;
}

.remove-preview:hover {
  background: #C62828;
  transform: translateY(-1px);
}

.user-basic-info {
  text-align: center;
}

.display-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #6B4226;
  margin-bottom: 0.5rem;
}

.username {
  font-size: 1rem;
  color: #8B5E3C;
  margin-bottom: 1.5rem;
  opacity: 0.8;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 0.8rem;
  color: #6B4226;
  opacity: 0.7;
  margin-bottom: 0.3rem;
}

.stat-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #6B4226;
}

.stat-value.active {
  color: #388E3C;
}

/* Right Panel */
.profile-right {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-section {
  background: rgba(255, 248, 231, 0.6);
  border-radius: 15px;
  padding: 1.5rem;
  border: 2px solid rgba(231, 194, 125, 0.3);
  box-shadow: 0 4px 15px rgba(107, 66, 38, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid rgba(231, 194, 125, 0.3);
}

.section-icon {
  font-size: 1.2rem;
}

.section-header h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #6B4226;
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #6B4226;
  margin-bottom: 0.5rem;
}

.form-input {
  padding: 0.8rem 1rem;
  border: 1px solid rgba(139, 94, 60, 0.5);
  border-radius: 8px;
  background: rgba(255, 248, 231, 0.8);
  color: #3B2F2F;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  font-weight: 500;
}

.form-input:focus {
  border-color: #E7C27D;
  outline: none;
  background: #FFF8E7;
  box-shadow: 0 0 0 3px rgba(231, 194, 125, 0.3);
}

.form-input:read-only {
  background: rgba(139, 94, 60, 0.1);
  color: #6B4226;
  cursor: not-allowed;
}

.form-input.editable {
  background: #FFF8E7;
  border-color: #E7C27D;
}

.settings-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 248, 231, 0.4);
  border-radius: 8px;
  border: 1px solid rgba(231, 194, 125, 0.3);
}

.setting-info {
  display: flex;
  flex-direction: column;
}

.setting-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #6B4226;
  margin-bottom: 0.3rem;
}

.setting-desc {
  font-size: 0.8rem;
  color: #8B5E3C;
  opacity: 0.7;
}

.setting-action {
  padding: 0.6rem 1rem;
  background: #E7C27D;
  color: #6B4226;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.setting-action:hover {
  background: #F5E3B3;
  transform: translateY(-1px);
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-indicator.active {
  background: #388E3C;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 2px solid rgba(231, 194, 125, 0.3);
}

.button-group {
  display: flex;
  gap: 1rem;
}

.primary-btn, .secondary-btn, .outline-btn, .danger-btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(107, 66, 38, 0.2);
}

.primary-btn {
  background: #8B5E3C;
  color: #FFF8E7;
  border: 1px solid #8B5E3C;
}

.primary-btn:hover {
  background: #6B4226;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(107, 66, 38, 0.4);
}

.secondary-btn {
  background: rgba(231, 194, 125, 0.3);
  color: #6B4226;
  border: 1px solid #E7C27D;
}

.secondary-btn:hover {
  background: rgba(231, 194, 125, 0.4);
  transform: translateY(-2px);
}

.outline-btn {
  background: rgba(255, 248, 231, 0.3);
  color: #6B4226;
  border: 1px solid #8B5E3C;
}

.outline-btn:hover {
  background: rgba(255, 248, 231, 0.4);
  transform: translateY(-2px);
}

.danger-btn {
  background: rgba(211, 47, 47, 0.1);
  color: #D32F2F;
  border: 1px solid #D32F2F;
}

.danger-btn:hover {
  background: rgba(211, 47, 47, 0.2);
  transform: translateY(-2px);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(107, 66, 38, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: linear-gradient(135deg, #FFF8E7, #F5E3B3);
  padding: 2rem;
  border-radius: 15px;
  width: min(450px, 95vw);
  color: #3B2F2F;
  box-shadow: 0 15px 35px rgba(107, 66, 38, 0.4);
  border: 2px solid #E7C27D;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #E7C27D;
}

.modal-header h3 {
  font-size: 1.3rem;
  color: #6B4226;
  margin: 0;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6B4226;
  transition: all 0.3s ease;
  padding: 0.3rem;
  border-radius: 4px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #E7C27D;
  background: rgba(231, 194, 125, 0.1);
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.password-requirements {
  background: rgba(255, 248, 231, 0.6);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(231, 194, 125, 0.3);
}

.requirements-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #6B4226;
  margin-bottom: 0.5rem;
}

.requirements-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.requirements-list li {
  font-size: 0.8rem;
  color: #8B5E3C;
  margin-bottom: 0.3rem;
  padding-left: 1rem;
  position: relative;
}

.requirements-list li:before {
  content: '○';
  position: absolute;
  left: 0;
}

.requirements-list li.met {
  color: #388E3C;
}

.requirements-list li.met:before {
  content: '✓';
  color: #388E3C;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(231, 194, 125, 0.3);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .profile-container {
    margin-left: 240px;
  }
  
  .profile-content {
    grid-template-columns: 300px 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .profile-container {
    margin-left: 0 !important;
    padding: 1.5rem 1rem;
  }
  
  .profile-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .profile-left {
    order: 2;
  }
  
  .profile-right {
    order: 1;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .button-group {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .profile-container {
    padding: 1rem 0.5rem;
  }
  
  .profile-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .profile-title {
    font-size: 1.5rem;
  }
  
  .avatar {
    width: 100px;
    height: 100px;
  }
  
  .user-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .primary-btn, .secondary-btn, .outline-btn, .danger-btn {
    padding: 0.7rem 1.2rem;
    font-size: 0.8rem;
  }
  
  .modal-content {
    padding: 1.5rem;
    margin: 1rem;
  }
}
</style>