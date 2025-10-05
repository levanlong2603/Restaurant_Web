<template>
  <div class="user-profile-page">
    <Navigation @sidebar-toggle="handleSidebarToggle" />
    <main class="profile-container" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <div class="profile-content">
        <div class="profile-left">
          <h1>User profile</h1>
          <div class="avatar-section">
            <img :src="getImageUrl(user.profilePhoto)" alt="User Avatar" class="avatar" @error="handleImageError" />
            <input v-if="isEditing" type="file" @change="handlePhotoUpload" accept="image/jpeg,image/jpg,image/png"
              class="upload-input" />
            <div v-if="isEditing && previewPhoto" class="preview-image-container">
              <p>Ảnh xem trước:</p>
              <img :src="previewPhoto" alt="Preview Avatar" class="preview-image" />
              <button type="button" class="remove-preview" @click="removePhoto">Xóa ảnh</button>
            </div>
          </div>
          <div class="user-info">
            <p class="display-name">{{ user.name }}</p>
            <p class="username">{{ user.email }}</p>
            <p class="role">Role: {{ user.role }}</p>
          </div>
        </div>

        <div class="profile-right">
          <div class="details-section">
            <h3>MÔ TẢ</h3>
            <div class="form-group">
              <label>Họ và tên</label>
              <input type="text" v-model="user.name" :readonly="!isEditing" />
            </div>
          </div>
          <div class="contacts-section">
            <h3>LIÊN LẠC</h3>
            <div class="form-group">
              <label>Email</label>
              <input type="email" v-model="user.email" :readonly="!isEditing" />
            </div>
            <div class="form-group">
              <label>Số điện thoại</label>
              <input type="text" v-model="user.phoneNumber" :readonly="!isEditing" />
            </div>
            <div class="form-group">
              <label>Địa chỉ</label>
              <input type="text" v-model="user.address" :readonly="!isEditing" />
            </div>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <button v-if="!isEditing" class="edit-btn" @click="startEditing">Sửa thông tin</button>
        <button v-if="!isEditing" class="change-password-btn" @click="openChangePasswordModal">
          Đổi mật khẩu
        </button>
        <template v-else>
          <button class="cancel-btn" @click="cancelChanges">Cancel</button>
          <button class="save-btn" @click="saveChanges">Lưu</button>
        </template>
      </div>

      <div class="modal" v-if="showChangePasswordModal">
        <div class="modal-content">
          <span class="close-btn" @click="closeChangePasswordModal">×</span>
          <h3>Đổi mật khẩu</h3>
          <form @submit.prevent="changePassword">
            <div class="form-group">
              <label for="current-password">Mật khẩu hiện tại</label>
              <input type="password" id="current-password" v-model="currentPassword" required />
            </div>
            <div class="form-group">
              <label for="new-password">Mật khẩu mới</label>
              <input type="password" id="new-password" v-model="newPassword" required />
            </div>
            <div class="form-group">
              <label for="confirm-password">Xác nhận mật khẩu mới</label>
              <input type="password" id="confirm-password" v-model="confirmPassword" required />
            </div>
            <div class="modal-actions">
              <button type="button" class="cancel-btn" @click="closeChangePasswordModal">
                Cancel
              </button>
              <button type="submit" class="save-btn">Lưu</button>
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
      isSidebarCollapsed: false, // Khởi tạo trạng thái sidebar
    };
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
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user['id'];
        const response = await axios.get(`http://localhost:3000/users/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        this.user = response.data.user;
      } catch (error) {
        console.error('Error fetching user:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          this.$router.push('/login');
        }
        Swal.fire('Lỗi!', 'Không thể lấy thông tin người dùng.', 'error');
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
        console.error('Lỗi khi upload ảnh lên Cloudinary:', error);
        throw new Error('Không thể upload ảnh lên Cloudinary.');
      }
    },
    async saveChanges() {
      try {
        Swal.fire({ title: 'Đang xử lý...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user['id'];

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
        Swal.fire('Thành công!', 'Thay đổi thông tin cá nhân thành công!', 'success');
        this.isEditing = false;
        this.previewPhoto = null;
        this.profilePhotoFile = null;
      } catch (error) {
        console.error('Error saving changes:', error);
        if (error.response?.status === 400) {
          Swal.fire('Lỗi!', 'Email đã tồn tại.', 'error');
        } else if (error.response?.status === 403) {
          Swal.fire('Lỗi!', 'Chỉ quản lý mới được thay đổi!', 'error');
        } else if (error.response?.status === 401) {
          this.$router.push('/login');
        } else {
          Swal.fire('Lỗi!', 'Có lỗi xảy ra khi lưu thông tin!', 'error');
        }
      }
    },
    async deleteUser() {
      const result = await Swal.fire({
        title: 'Bạn có chắc muốn xóa tài khoản này?',
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
            this.$router.push('/login');
            return;
          }

          const user = JSON.parse(localStorage.getItem('user'));
          const userId = user['id'];
          await axios.delete(`http://localhost:3000/users/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          Swal.fire('Thành công!', 'Tài khoản đã được xóa.', 'success');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          this.$router.push('/login');
        } catch (error) {
          console.error('Error deleting user:', error);
          if (error.response?.status === 403) {
            Swal.fire('Lỗi!', 'Quyền truy cập bị từ chối: Yêu cầu vai trò quản lý.', 'error');
          } else if (error.response?.status === 401) {
            this.$router.push('/login');
          } else {
            Swal.fire('Lỗi!', 'Có lỗi xảy ra khi xóa tài khoản.', 'error');
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
      if (this.newPassword !== this.confirmPassword) {
        Swal.fire('Lỗi!', 'Mật khẩu mới và xác nhận mật khẩu không giống nhau!', 'error');
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

        Swal.fire('Thành công!', 'Thay đổi mật khẩu thành công!', 'success');
        this.closeChangePasswordModal();
      } catch (error) {
        console.error('Error changing password:', error);
        if (error.response?.status === 400) {
          Swal.fire('Lỗi!', 'Mật khẩu hiện tại không đúng!', 'error');
        } else if (error.response?.status === 401) {
          this.$router.push('/login');
        } else {
          Swal.fire('Lỗi!', 'Có lỗi xảy ra khi đổi mật khẩu!', 'error');
        }
      }
    },
    handlePhotoUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const filetypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (!filetypes.includes(file.type)) {
          Swal.fire('Lỗi!', 'Chỉ chấp nhận file ảnh (jpeg, jpg, png)!', 'error');
          event.target.value = '';
          return;
        }
        if (file.size > maxSize) {
          Swal.fire('Lỗi!', 'Kích thước ảnh không được vượt quá 5MB!', 'error');
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
  font-family: 'Arial', sans-serif;
  background: #1c2526;
  color: #fff;
  width: 100vw;
  min-height: 100vh;
  overflow-x: hidden;
  display: flex;
  align-items: center;
  z-index: 100;
}

.profile-container {
  font-size: 18px;
  width: 66.67%;
  max-width: none;
  margin: 20px auto;
  padding: 30px 20px 20px;
  background: linear-gradient(135deg, #2a3435, #1e2627);
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  transition: margin-left 0.3s ease;
}

 /* Khi sidebar thu gọn */
/* .profile-container.sidebar-collapsed {
  margin-left: 10px;
 
} */

.profile-content {
  display: flex;
  gap: 40px;
  font-size: 14px;
}

.profile-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 200px;
}

.avatar-section {
  position: relative;
  width: 100px;
  margin-bottom: 10px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ae9a64;
}

.upload-input {
  margin-top: 10px;
  font-size: 12px;
}

.preview-image-container {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-image-container p {
  font-size: 12px;
  color: #ccc;
}

.preview-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid #ae9a64;
  margin-top: 5px;
}

.remove-preview {
  margin-top: 5px;
  padding: 5px 10px;
  background-color: #d33;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.remove-preview:hover {
  background-color: #b32d2d;
}

.user-info {
  margin-bottom: 20px;
  text-align: center;
}

.display-name {
  font-size: 20px;
  font-weight: bold;
  color: #ae9a64;
}

.username {
  font-size: 16px;
  color: #ccc;
}

.profile-right {
  flex: 2;
  font-size: 20px;
}

.details-section,
.contacts-section {
  margin-bottom: 18px;
}

.details-section h3,
.contacts-section h3 {
  color: #ae9a64;
  text-transform: uppercase;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-size: 14px;
  margin-bottom: 5px;
  color: #ccc;
}

.form-group input {
  width: 90%;
  padding: 8px;
  border: 1px solid #ae9a64;
  border-radius: 5px;
  background: #1c2526;
  color: #fff;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.edit-btn,
.cancel-btn,
.save-btn,
.change-password-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 16px;
  margin-right: 20px;
}

.edit-btn,
.change-password-btn {
  background: #ae9a64;
  color: #fff;
}

.cancel-btn {
  background: #ccc;
  color: #333;
}

.save-btn {
  background: #ae9a64;
  color: #fff;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 103;
  justify-content: center;
  align-items: center;
  display: flex;
}

.modal-content {
  background: #2a3435;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  max-width: 90%;
  position: relative;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 24px;
  color: #ccc;  cursor: pointer;
}

.modal-content h3 {
  color: #ae9a64;
  text-transform: uppercase;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>