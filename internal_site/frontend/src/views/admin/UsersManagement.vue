<template>
    <div class="main-container">
        <Navigation - Navigation @sidebar-toggle="handleSidebarToggle" />
        <div class="container-user" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
            <section class="users-management">
                <div class="dashboard-header" ref="dashboardHeader">
                    <div class="header-top">
                        <h2>QUẢN LÝ TÀI KHOẢN NHÂN VIÊN</h2>
                        <span>{{ currentDateTime }}</span>
                    </div>
                    <div class="header-actions">
                        <div class="filter-section">
                            <input type="text" v-model="searchQuery" placeholder="Tìm kiếm..." class="search-input" />
                            <select v-model="roleFilter" class="role-filter">
                                <option value="">Tất cả vai trò</option>
                                <option value="manager">Quản lý</option>
                                <option value="staff">Nhân viên</option>
                            </select>
                        </div>
                        <button class="action-button add-user-btn" @click="openAddUserModal">
                            <i class="fa-solid fa-plus"></i> Thêm
                        </button>
                        <button class="action-button show-deleted-btn" @click="showDeletedUsers = !showDeletedUsers">
                            {{ showDeletedUsers ? "Ẩn người dùng đã xóa" : "Xem người dùng đã xóa" }}
                        </button>
                        <button class="action-button refresh-button" @click="refreshUsers">
                            <i class="fas fa-sync-alt"></i> Làm mới
                        </button>
                    </div>
                </div>

                <!-- Danh sách người dùng chờ duyệt -->
                <div class="users-list" v-if="!showDeletedUsers && pendingUsers.length > 0">
                    <h2>Yêu cầu đăng ký ({{ pendingUsers.length }})</h2>
                    <div class="table-header">
                        <div class="col-user">Người dùng (Chờ duyệt)</div>
                        <div class="col-meta">Last active</div>
                        <div class="col-meta">Date added</div>
                        <div class="col-actions">Hành động</div>
                    </div>
                    <div class="user-item pending-user" v-for="user in pendingUsers" :key="user.id"
                        @click="openProfileModal(user)">
                        <div class="user-details">
                            <img :src="getImageUrl(user.profilePhoto)" alt="Ảnh đại diện" class="user-photo"
                                @error="handleImageError" />
                            <div class="user-info">
                                <h3>{{ user.name }}</h3>
                                <p>{{ user.email }}</p>
                                <p><strong>Trạng thái:</strong> {{ user.status }}</p>
                            </div>
                        </div>
                        <div class="user-meta">{{ formatDate(user.lastActive) }}</div>
                        <div class="user-meta">{{ formatDate(user.dateAdded) }}</div>
                        <div class="user-actions">
                            <button @click.stop="approveUser(user)" class="action-btn approve-btn"><i
                                    class="fas fa-check"></i> Duyệt</button>
                            <button @click.stop="rejectUser(user)" class="action-btn reject-btn"><i
                                    class="fas fa-times"></i> Từ chối</button>
                        </div>
                    </div>
                </div>

                <!-- Danh sách người dùng đang hoạt động -->
                <div class="users-list" v-if="!showDeletedUsers">
                    <div class="table-header">
                        <div class="col-user">Người dùng</div>
                        <div class="col-meta">
                            <span @click="sortByLastActive" class="sort-link">
                                Last active <i
                                    :class="sortDirection === 'asc' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                            </span>
                        </div>
                        <div class="col-meta">Date added</div>
                        <div class="col-actions">Hành động</div>
                    </div>
                    <div class="user-item" v-for="user in paginatedUsers" :key="user.id"
                        @click="openProfileModal(user)">
                        <div class="user-details">
                            <img :src="getImageUrl(user.profilePhoto)" alt="Ảnh đại diện" class="user-photo"
                                @error="handleImageError" />
                            <div class="user-info">
                                <h3>{{ user.name }}</h3>
                                <p>{{ user.email }}</p>
                                <p><strong>Role:</strong> {{ user.role }}</p>
                            </div>
                        </div>
                        <div class="user-meta">{{ formatDate(user.lastActive) }}</div>
                        <div class="user-meta">{{ formatDate(user.dateAdded) }}</div>
                        <div class="user-actions">
                            <button @click.stop="openEditModal(user)" class="action-btn edit-btn"><i
                                    class="fas fa-edit"></i></button>
                            <button @click.stop="confirmDelete(user)" class="action-btn delete-btn"><i
                                    class="fas fa-trash"></i></button>
                        </div>
                    </div>
                    <div class="pagination" v-if="totalPages > 1">
                        <button @click="changePage(1)" :disabled="currentPage === 1" class="pagination-btn first-btn"><i
                                class="fas fa-angle-double-left"></i></button>
                        <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1"
                            class="pagination-btn prev-btn"><i class="fas fa-angle-left"></i></button>
                        <div class="page-numbers">
                            <button v-for="page in displayedPages" :key="page" @click="changePage(page)"
                                :class="{ 'pagination-btn': true, 'active': currentPage === page }">
                                {{ page }}
                            </button>
                            <span v-if="showLastEllipsis">...</span>
                            <button v-if="showLastPage" @click="changePage(totalPages)"
                                :class="{ 'pagination-btn': true, 'active': currentPage === totalPages }">
                                {{ totalPages }}
                            </button>
                        </div>
                        <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages"
                            class="pagination-btn next-btn"><i class="fas fa-angle-right"></i></button>
                        <button @click="changePage(totalPages)" :disabled="currentPage === totalPages"
                            class="pagination-btn last-btn"><i class="fas fa-angle-double-right"></i></button>
                    </div>
                    <p v-if="!paginatedUsers.length && !pendingUsers.length">Không có người dùng nào để hiển thị.</p>
                </div>

                <!-- Danh sách người dùng đã xóa mềm -->
                <div class="users-list" v-else>
                    <div class="table-header">
                        <div class="col-user">Người dùng</div>
                        <div class="col-meta">
                            <span @click="sortByLastActive" class="sort-link">
                                Last active <i
                                    :class="sortDirection === 'asc' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                            </span>
                        </div>
                        <div class="col-meta">Date added</div>
                        <div class="col-actions">Hành động</div>
                    </div>
                    <div class="user-item deleted-user" v-for="user in paginatedDeletedUsers" :key="user.id">
                        <div class="user-details">
                            <img :src="getImageUrl(user.profilePhoto)" alt="Ảnh đại diện" class="user-photo"
                                @error="handleImageError" />
                            <div class="user-info">
                                <h3>{{ user.name }}</h3>
                                <p>{{ user.email }}</p>
                                <p><strong>Vai trò:</strong> {{ user.role }}</p>
                            </div>
                        </div>
                        <div class="user-meta">{{ formatDate(user.lastActive) }}</div>
                        <div class="user-meta">{{ formatDate(user.dateAdded) }}</div>
                        <div class="user-actions">
                            <button @click.stop="confirmRestore(user)" class="action-btn restore-btn"><i
                                    class="fas fa-undo"></i></button>
                        </div>
                    </div>
                    <div class="pagination" v-if="deletedTotalPages > 1">
                        <button @click="changeDeletedPage(1)" :disabled="currentDeletedPage === 1"
                            class="pagination-btn first-btn"><i class="fas fa-angle-double-left"></i></button>
                        <button @click="changeDeletedPage(currentDeletedPage - 1)" :disabled="currentDeletedPage === 1"
                            class="pagination-btn prev-btn"><i class="fas fa-angle-left"></i></button>
                        <div class="page-numbers">
                            <button v-for="page in displayedDeletedPages" :key="page" @click="changeDeletedPage(page)"
                                :class="{ 'pagination-btn': true, 'active': currentDeletedPage === page }">
                                {{ page }}
                            </button>
                            <span v-if="showDeletedLastEllipsis">...</span>
                            <button v-if="showDeletedLastPage" @click="changeDeletedPage(deletedTotalPages)"
                                :class="{ 'pagination-btn': true, 'active': currentDeletedPage === deletedTotalPages }">
                                {{ deletedTotalPages }}
                            </button>
                        </div>
                        <button @click="changeDeletedPage(currentDeletedPage + 1)"
                            :disabled="currentDeletedPage === deletedTotalPages" class="pagination-btn next-btn"><i
                                class="fas fa-angle-right"></i></button>
                        <button @click="changeDeletedPage(deletedTotalPages)"
                            :disabled="currentDeletedPage === deletedTotalPages" class="pagination-btn last-btn"><i
                                class="fas fa-angle-double-right"></i></button>
                    </div>
                    <p v-if="!paginatedDeletedUsers.length">Không có người dùng đã xóa để hiển thị.</p>
                </div>

                <!-- Modal chỉnh sửa/thêm người dùng -->
                <div v-if="showUserModal" class="modal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>{{ editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới' }}</h2>
                            <button class="close-btn" @click="showUserModal = false">×</button>
                        </div>
                        <form @submit.prevent="saveUser" class="edit-form">
                            <div class="form-group">
                                <label>Tên</label>
                                <input v-model="userForm.name" required />
                            </div>
                            <div class="form-group">
                                <label>Số điện thoại</label>
                                <input v-model="userForm.phoneNumber" required />
                            </div>
                            <div class="form-group">
                                <label>Email</label>
                                <input v-model="userForm.email" type="email" required />
                            </div>
                            <div class="form-group">
                                <label>Địa chỉ</label>
                                <input v-model="userForm.address" required />
                            </div>
                            <div class="form-group">
                                <label>Mật khẩu (để trống nếu không thay đổi)</label>
                                <input v-model="userForm.password" type="password" :required="!editingUser" />
                            </div>
                            <div class="form-group">
                                <label>Vai trò</label>
                                <select v-model="userForm.role" required>
                                    <option value="staff">Nhân viên</option>
                                    <option value="manager">Quản lý</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Ảnh đại diện</label>
                                <div class="image-upload">
                                    <div v-if="isValidPhoto(userForm.profilePhoto) && !previewPhoto"
                                        class="current-image">
                                        <p>Ảnh hiện tại:</p>
                                        <img :src="getImageUrl(userForm.profilePhoto)" alt="Ảnh đại diện"
                                            class="preview-image" @error="handleImageError" />
                                    </div>
                                    <div v-if="previewPhoto" class="preview-image-container">
                                        <p>Ảnh xem trước:</p>
                                        <img :src="previewPhoto" alt="Ảnh đại diện" class="preview-image" />
                                        <button type="button" class="remove-preview" @click="removeUserPhoto">Xóa
                                            ảnh</button>
                                    </div>
                                    <input type="file" @change="handleUserPhotoUpload"
                                        accept="image/jpeg,image/jpg,image/png" />
                                </div>
                            </div>
                            <div class="modal-actions">
                                <div class="right-actions">
                                    <button type="button" @click="showUserModal = false" class="cancel-btn">Hủy</button>
                                    <button type="submit" class="submit-btn">Lưu thay đổi</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Modal hiển thị hồ sơ -->
                <div v-if="showProfileModal" class="modal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button class="close-btn" @click="showProfileModal = false">×</button>
                        </div>
                        <div class="profile-details">
                            <h3>Hồ sơ người dùng</h3>
                            <img :src="getImageUrl(selectedUser.profilePhoto)" alt="Ảnh đại diện" class="profile-photo"
                                @error="handleImageError" />
                            <p><strong>Tên:</strong> {{ selectedUser.name }}</p>
                            <p><strong>Số điện thoại:</strong> {{ selectedUser.phoneNumber }}</p>
                            <p><strong>Email:</strong> {{ selectedUser.email }}</p>
                            <p><strong>Địa chỉ:</strong> {{ selectedUser.address }}</p>
                            <p><strong>Trạng thái:</strong> {{ selectedUser.status }}</p>
                            <p v-if="selectedUser.status === 'approved' || selectedUser.status === 'rejected'">
                                <strong>Vai trò:</strong> {{ selectedUser.role || 'Chưa gán' }}
                            </p>
                            <p><strong>Lần cuối hoạt động:</strong> {{ formatDate(selectedUser.lastActive) }}</p>
                            <p><strong>Ngày thêm:</strong> {{ formatDate(selectedUser.dateAdded) }}</p>
                            <div class="profile-actions" v-if="selectedUser.status === 'approved'">
                                <button @click="openEditModal(selectedUser)" class="action-btn edit-btn"><i
                                        class="fas fa-edit"></i> Sửa</button>
                                <button @click="confirmDelete(selectedUser)" class="action-btn delete-btn"><i
                                        class="fas fa-trash"></i> Xóa</button>
                            </div>
                            <div class="profile-actions" v-else-if="selectedUser.status === 'pending'">
                                <button @click="approveUser(selectedUser)" class="action-btn approve-btn"><i
                                        class="fas fa-check"></i> Duyệt</button>
                                <button @click="rejectUser(selectedUser)" class="action-btn reject-btn"><i
                                        class="fas fa-times"></i> Từ chối</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Popup xác nhận xóa -->
                <div v-if="showDeletePopup" class="popup">
                    <div class="popup-content">
                        <h3>Xác nhận xóa người dùng</h3>
                        <div class="user-info">
                            <p><strong>Tên:</strong> {{ userToDelete.name }}</p>
                            <p><strong>Email:</strong> {{ userToDelete.email }}</p>
                            <p><strong>Role:</strong> {{ userToDelete.role }}</p>
                        </div>
                        <p class="warning-text">Bạn có chắc chắn muốn xóa người dùng này không? Hành động này không thể
                            hoàn tác.</p>
                        <div class="popup-actions">
                            <button @click="showDeletePopup = false" class="cancel-btn">Hủy</button>
                            <button @click="deleteUser" class="confirm-btn">Xóa</button>
                        </div>
                    </div>
                </div>

                <!-- Popup xác nhận khôi phục -->
                <div v-if="showRestorePopup" class="popup">
                    <div class="popup-content">
                        <h3>Xác nhận khôi phục người dùng</h3>
                        <div class="user-info">
                            <p><strong>Tên:</strong> {{ userToRestore.name }}</p>
                            <p><strong>Email:</strong> {{ userToRestore.email }}</p>
                            <p><strong>Role:</strong> {{ userToRestore.role }}</p>
                        </div>
                        <p class="success-text">Bạn có muốn khôi phục người dùng này không?</p>
                        <div class="popup-actions">
                            <button @click="showRestorePopup = false" class="cancel-btn">Hủy</button>
                            <button @click="restoreUser" class="confirm-btn">Khôi phục</button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import Navigation from '../../components/Navigation.vue';
import Swal from 'sweetalert2';

export default {
    name: 'UsersManagement',
    components: {
        Navigation,
    },
    data() {
        return {
            users: [],
            deletedUsers: [],
            pendingUsers: [],
            isSidebarCollapsed: false,
            searchQuery: '',
            roleFilter: '',
            sortDirection: 'desc',
            showUserModal: false,
            showProfileModal: false,
            showDeletePopup: false,
            showRestorePopup: false,
            showDeletedUsers: false,
            editingUser: null,
            selectedUser: null,
            userToDelete: null,
            userToRestore: null,
            userForm: {
                id: null,
                name: '',
                phoneNumber: '',
                email: '',
                address: '',
                password: '123456',
                role: '',
                profilePhoto: null,
                profilePhotoPublicId: null,
                lastActive: null,
                dateAdded: null,
            },
            defaultAvatar: 'https://freesvg.org/img/abstract-user-flat-3.png',
            previewPhoto: null,
            currentPage: 1,
            currentDeletedPage: 1,
            limit: 10,
            maxVisiblePages: 5,
            currentDateTime: '',
            updateDateTimeInterval: null,
        };
    },
    computed: {
        filteredUsers() {
            let filtered = this.users.filter(user => user.status === 'approved');

            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                filtered = filtered.filter(
                    (user) =>
                        user.name.toLowerCase().includes(query) ||
                        user.email.toLowerCase().includes(query)
                );
            }

            if (this.roleFilter) {
                filtered = filtered.filter((user) => user.role === this.roleFilter);
            }

            filtered = filtered.sort((a, b) => {
                const dateA = new Date(a.lastActive || a.dateAdded);
                const dateB = new Date(b.lastActive || b.dateAdded);
                return this.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
            });

            return filtered;
        },
        paginatedUsers() {
            const start = (this.currentPage - 1) * this.limit;
            const end = start + this.limit;
            return this.filteredUsers.slice(start, end);
        },
        totalPages() {
            return Math.ceil(this.filteredUsers.length / this.limit);
        },
        totalItems() {
            return this.filteredUsers.length;
        },
        displayedPages() {
            const pages = [];
            const half = Math.floor(this.maxVisiblePages / 2);
            let start = Math.max(1, this.currentPage - half);
            let end = Math.min(this.totalPages, start + this.maxVisiblePages - 1);

            if (end - start + 1 < this.maxVisiblePages) {
                start = Math.max(1, end - this.maxVisiblePages + 1);
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            return pages;
        },
        showLastEllipsis() {
            return this.displayedPages[this.displayedPages.length - 1] < this.totalPages - 1;
        },
        showLastPage() {
            return this.displayedPages[this.displayedPages.length - 1] < this.totalPages;
        },
        paginatedDeletedUsers() {
            const start = (this.currentDeletedPage - 1) * this.limit;
            const end = start + this.limit;
            return this.deletedUsers.slice(start, end);
        },
        deletedTotalPages() {
            return Math.ceil(this.deletedUsers.length / this.limit);
        },
        displayedDeletedPages() {
            const pages = [];
            const half = Math.floor(this.maxVisiblePages / 2);
            let start = Math.max(1, this.currentDeletedPage - half);
            let end = Math.min(this.deletedTotalPages, start + this.maxVisiblePages - 1);

            if (end - start + 1 < this.maxVisiblePages) {
                start = Math.max(1, end - this.maxVisiblePages + 1);
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            return pages;
        },
        showDeletedLastEllipsis() {
            return this.displayedDeletedPages[this.displayedDeletedPages.length - 1] < this.deletedTotalPages - 1;
        },
        showDeletedLastPage() {
            return this.displayedDeletedPages[this.displayedDeletedPages.length - 1] < this.deletedTotalPages;
        },
    },
    methods: {
        handleSidebarToggle(isCollapsed) {
            this.isSidebarCollapsed = isCollapsed;
        },
        async fetchUsers() {
            try {
                const response = await axios.get('http://localhost:3000/users', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                    params: { page: this.currentPage, limit: this.limit }
                });
                this.users = response.data.users || [];
                this.pendingUsers = this.users.filter(user => user.status === 'pending');
                this.totalItems = response.data.totalItems || 0;
                this.totalPages = response.data.totalPages || 1;
            } catch (error) {
                console.error('Lỗi khi lấy danh sách người dùng:', error.message);
                this.users = [];
                this.pendingUsers = [];
                Swal.fire('Lỗi!', 'Không thể lấy danh sách người dùng.', 'error');
            }
        },
        async fetchDeletedUsers() {
            try {
                const response = await axios.get('http://localhost:3000/users/deleted', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                    params: { page: this.currentDeletedPage, limit: this.limit }
                });
                this.deletedUsers = response.data.users || [];
                this.deletedTotalPages = response.data.totalPages || 1;
            } catch (error) {
                console.error('Lỗi khi lấy danh sách người dùng đã xóa:', error.message);
                this.deletedUsers = [];
                Swal.fire('Lỗi!', 'Không thể lấy danh sách người dùng đã xóa.', 'error');
            }
        },
        async approveUser(user) {
            try {
                await axios.put(`http://localhost:3000/users/approve/${user.id}`, {}, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                });
                await this.fetchUsers();
                this.showProfileModal = false;
                Swal.fire('Thành công!', 'Duyệt người dùng thành công!', 'success');
            } catch (error) {
                console.error('Lỗi khi duyệt người dùng:', error.message);
                Swal.fire('Lỗi!', error.response?.data?.message || 'Có lỗi xảy ra khi duyệt người dùng.', 'error');
            }
        },
        async rejectUser(user) {
            try {
                await axios.put(`http://localhost:3000/users/reject/${user.id}`, {}, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                });
                await this.fetchUsers();
                this.showProfileModal = false;
                Swal.fire('Thành công!', 'Từ chối người dùng thành công!', 'success');
            } catch (error) {
                console.error('Lỗi khi từ chối người dùng:', error.message);
                Swal.fire('Lỗi!', error.response?.data?.message || 'Có lỗi xảy ra khi từ chối người dùng.', 'error');
            }
        },
        openAddUserModal() {
            this.editingUser = null;
            this.userForm = {
                id: null,
                name: '',
                phoneNumber: '',
                email: '',
                address: '',
                password: '123456',
                role: '',
                profilePhoto: null,
                profilePhotoPublicId: null,
                lastActive: null,
                dateAdded: new Date().toISOString(),
            };
            this.previewPhoto = null;
            this.showUserModal = true;
        },
        openEditModal(user) {
            this.editingUser = user;
            this.userForm = { ...user, password: '' };
            this.previewPhoto = null;
            this.showUserModal = true;
            this.showProfileModal = false;
        },
        async openProfileModal(user) {
            try {
                const response = await axios.get(`http://localhost:3000/users/${user.id}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                });
                this.selectedUser = response.data.user;
                this.showProfileModal = true;
            } catch (error) {
                console.error('Lỗi khi lấy thông tin hồ sơ:', error.message);
                Swal.fire('Lỗi!', 'Không thể lấy thông tin hồ sơ.', 'error');
            }
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
        async saveUser() {
            try {
                if (!this.userForm.name || !this.userForm.phoneNumber || !this.userForm.email || !this.userForm.address) {
                    Swal.fire('Lỗi!', 'Vui lòng điền đầy đủ các trường bắt buộc: Tên, Số điện thoại, Email, Địa chỉ', 'error');
                    return;
                }

                Swal.fire({ title: 'Đang xử lý...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

                let profilePhotoUrl = this.userForm.profilePhoto;
                let profilePhotoPublicId = this.userForm.profilePhotoPublicId;
                if (this.userForm.profilePhoto instanceof File) {
                    const uploadResult = await this.uploadImageToCloudinary(this.userForm.profilePhoto);
                    profilePhotoUrl = uploadResult.url;
                    profilePhotoPublicId = uploadResult.publicId;
                } else if (this.userForm.profilePhoto === null) {
                    profilePhotoUrl = null;
                    profilePhotoPublicId = null;
                }

                const userData = {
                    name: this.userForm.name,
                    phoneNumber: this.userForm.phoneNumber,
                    email: this.userForm.email,
                    address: this.userForm.address,
                    role: this.userForm.role,
                    profilePhoto: profilePhotoUrl,
                    profilePhotoPublicId,
                    dateAdded: this.userForm.dateAdded,
                };
                if (this.userForm.password) {
                    userData.password = this.userForm.password;
                }
                if (this.editingUser && this.userForm.lastActive) {
                    userData.lastActive = this.userForm.lastActive;
                }

                const token = localStorage.getItem('token');
                let response;
                if (this.editingUser) {
                    response = await axios.put(`http://localhost:3000/users/${this.userForm.id}`, userData, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    Swal.fire('Thành công!', 'Cập nhật người dùng thành công!', 'success');
                } else {
                    response = await axios.post('http://localhost:3000/users', userData, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    Swal.fire('Thành công!', 'Tạo người dùng thành công!', 'success');
                }

                await this.fetchUsers();
                if (this.showProfileModal && this.editingUser) {
                    const updatedUserResponse = await axios.get(`http://localhost:3000/users/${this.editingUser.id}`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    this.selectedUser = updatedUserResponse.data.user;
                }

                this.showUserModal = false;
            } catch (error) {
                console.error('Lỗi khi lưu người dùng:', error.response?.data || error.message);
                Swal.fire('Lỗi!', error.response?.data?.message || 'Có lỗi xảy ra khi lưu người dùng.', 'error');
            }
        },
        confirmDelete(user) {
            this.userToDelete = user;
            this.showDeletePopup = true;
        },
        async deleteUser() {
            try {
                await axios.delete(`http://localhost:3000/users/${this.userToDelete.id}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                });
                this.showDeletePopup = false;
                this.showProfileModal = false;
                await this.fetchUsers();
                Swal.fire('Thành công!', 'Xóa người dùng thành công!', 'success');
            } catch (error) {
                console.error('Lỗi khi xóa người dùng:', error.message);
                Swal.fire('Lỗi!', error.response?.data?.message || 'Có lỗi xảy ra khi xóa người dùng.', 'error');
            }
        },
        confirmRestore(user) {
            this.userToRestore = user;
            this.showRestorePopup = true;
        },
        async restoreUser() {
            try {
                await axios.post(`http://localhost:3000/users/restore/${this.userToRestore.id}`, {}, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                });
                this.showRestorePopup = false;
                await this.fetchUsers();
                await this.fetchDeletedUsers();
                Swal.fire('Thành công!', 'Khôi phục người dùng thành công!', 'success');
            } catch (error) {
                console.error('Lỗi khi khôi phục người dùng:', error.message);
                Swal.fire('Lỗi!', error.response?.data?.message || 'Có lỗi xảy ra khi khôi phục người dùng.', 'error');
            }
        },
        handleUserPhotoUpload(event) {
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
                this.userForm.profilePhoto = file;
                this.previewPhoto = URL.createObjectURL(file);
            } else {
                this.userForm.profilePhoto = null;
                this.previewPhoto = null;
            }
        },
        removeUserPhoto() {
            this.userForm.profilePhoto = null;
            this.previewPhoto = null;
        },
        isValidPhoto(photo) {
            return typeof photo === 'string' && photo.trim() !== '';
        },
        getImageUrl(imageName) {
            if (!imageName || typeof imageName !== 'string' || imageName.trim() === '') {
                return this.defaultAvatar;
            }
            return imageName;
        },
        handleImageError(event) {
            event.target.src = this.defaultAvatar;
        },
        formatDate(date) {
            if (!date) return 'N/A';
            return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        },
        sortByLastActive() {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        },
        async refreshUsers() {
            this.currentPage = 1;
            this.currentDeletedPage = 1;
            await this.fetchUsers();
            await this.fetchDeletedUsers();
            Swal.fire('Thành công!', 'Danh sách người dùng đã được làm mới!', 'success');
        },
        updateDateTime() {
            this.currentDateTime = new Date().toLocaleString("vi-VN", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "numeric" });
        },
    },
    created() {
        this.fetchUsers();
        this.fetchDeletedUsers();
        this.updateDateTime();
        this.updateDateTimeInterval = setInterval(this.updateDateTime, 60000);
        this.$router.afterEach(() => {
            this.$emit('close-sidebar');
            this.isSidebarCollapsed = true;
        });
    },
    beforeDestroy() {
        clearInterval(this.updateDateTimeInterval);
    },
};
</script>

<style scoped>
.main-container {
    display: flex;
    min-height: 100vh;
    background-color: #1e1e1e;
    font-family: 'Arial', sans-serif;
}

.container-user {
    flex: 1;
    margin: 0;
    padding: 0;
    background-color: #1a1a1a;
    color: #ffffff;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding-right: 20px;
    padding-left: 20px;
    transition: margin-left 0.3s ease;
}

.users-management {
    padding: 0px;
    color: #ffffff;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    z-index: 1;
    padding-top: 130px;
}

.dashboard-header {
    position: fixed;
    top: 0;
    background-color: #2a2a2a;
    z-index: 3;
    padding-bottom: 1rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid #444;
    width: 95%;
}

.header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.header-top h2 {
    font-size: 1.8rem;
    font-weight: 600;
    color: #d4af37;
    margin-left: 350px;
}

.header-top span {
    font-size: 1rem;
    color: #b0b0b0;
    margin-right: 20px;
}

.header-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
    margin-left: 200px;
}

.filter-section {
    display: flex;
    gap: 0.5rem;
}

.search-input,
.role-filter {
    padding: 0.5rem;
    border: 1px solid #444;
    border-radius: 5px;
    background-color: #333;
    color: #e0e0e0;
    font-size: 0.9rem;
    transition: border-color 0.3s ease;
}

.search-input:focus,
.role-filter:focus {
    border-color: #d4af37;
    outline: none;
}

.action-button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 5px;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: background-color 0.3s ease, transform 0.2s ease;
    color: #fff;
}

.add-user-btn {
    background-color: #0056ff;
}

.add-user-btn:hover {
    background-color: #0042cc;
    transform: translateY(-2px);
}

.show-deleted-btn {
    background-color: #666;
}

.show-deleted-btn:hover {
    background-color: #555;
    transform: translateY(-2px);
}

.refresh-button {
    background-color: #4a90e2;
}

.refresh-button:hover {
    background-color: #357abd;
    transform: translateY(-2px);
}

.users-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    background-color: #2a2a2a;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
}

.users-list h2 {
    font-size: 22px;
    font-weight: bold;
    color: #ae9a64;
    margin-bottom: 15px;
}

.users-list p {
    color: #ff4d4d;
    font-size: 16px;
}

.table-header {
    display: grid;
    grid-template-columns: 1fr 120px 120px 120px;
    align-items: center;
    background-color: #333;
    padding: 12px 15px;
    border-radius: 6px;
    font-weight: bold;
    color: #ddd;
    border-bottom: 1px solid #444;
}

.col-user {
    text-align: left;
    padding-left: 60px;
}

.col-meta {
    text-align: center;
}

.col-actions {
    text-align: center;
}

.sort-link {
    cursor: pointer;
    color: #ae9a64;
    transition: color 0.3s;
}

.sort-link:hover {
    color: #fff;
}

.user-item {
    display: grid;
    grid-template-columns: 1fr 120px 120px 120px;
    align-items: center;
    background-color: #1a1a1a;
    padding: 15px;
    border-radius: 6px;
    cursor: pointer;
    border-bottom: 1px solid #444;
    transition: background-color 0.3s;
}

.user-item:hover {
    background-color: #2f2f2f;
}

.pending-user {
    background-color: #2a3a2a;
}

.pending-user:hover {
    background-color: #354a35;
}

.deleted-user {
    background-color: #3a2a2a;
}

.deleted-user:hover {
    background-color: #4a3535;
}

.user-details {
    display: flex;
    align-items: center;
    gap: 20px;
}

.user-photo {
    width: 48px;
    height: 48px;
    object-fit: cover;
    border-radius: 50%;
    border: 2px solid #ae9a64;
}

.user-info {
    background: none !important;
}

.user-info h3 {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 5px;
    color: #fff;
}

.user-info p {
    font-size: 14px;
    color: #ddd;
}

.user-meta {
    text-align: center;
    color: #bbb;
    font-size: 14px;
}

.user-actions {
    display: flex;
    justify-content: center;
    gap: 10px;
}

.action-btn {
    padding: 8px 12px;
    background-color: #444;
    border: none;
    border-radius: 4px;
    color: #fff;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s, transform 0.1s;
}

.edit-btn {
    background-color: #0056ff;
}

.edit-btn:hover {
    background-color: #0042cc;
    transform: scale(1.05);
}

.delete-btn {
    background-color: #ff4d4d;
}

.delete-btn:hover {
    background-color: #e63939;
    transform: scale(1.05);
}

.approve-btn {
    background-color: #00cc00;
}

.approve-btn:hover {
    background-color: #00b300;
    transform: scale(1.05);
}

.reject-btn {
    background-color: #ff4d4d;
}

.reject-btn:hover {
    background-color: #e63939;
    transform: scale(1.05);
}

.restore-btn {
    background-color: #00cc00;
}

.restore-btn:hover {
    background-color: #00b300;
    transform: scale(1.05);
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background-color: #fff;
    padding: 25px;
    border-radius: 8px;
    width: 500px;
    color: #1a1a1a;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.modal-header h2 {
    font-size: 22px;
    color: #ae9a64;
    text-align: center;
    margin-left: 130px;
}

.close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
}

.close-btn:hover {
    color: #333;
}

.edit-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
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
    color: #ae9a64;
}

.form-group input,
.form-group select {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
    border-color: #ae9a64;
    outline: none;
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
    color: #666;
}

.preview-image {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #ccc;
}

.remove-preview {
    padding: 5px 10px;
    background-color: #d33;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    width: fit-content;
    transition: background-color 0.3s;
}

.remove-preview:hover {
    background-color: #b32d2d;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
}

.right-actions {
    display: flex;
    gap: 10px;
}

.right-actions button {
    padding: 10px 20px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.1s;
}

.cancel-btn {
    background-color: #ccc;
    border: none;
    color: #1a1a1a;
}

.cancel-btn:hover {
    background-color: #b3b3b3;
    transform: scale(1.05);
}

.submit-btn {
    background-color: #ae9a64;
    border: none;
    color: #fff;
}

.submit-btn:hover {
    background-color: #8e7a50;
    transform: scale(1.05);
}

.profile-details {
    text-align: center;
}

.profile-details h3 {
    font-size: 20px;
    margin-bottom: 15px;
    color: #ae9a64;
}

.profile-details .profile-photo {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 50%;
    margin-bottom: 15px;
    border: 2px solid #ae9a64;
}

.profile-details p {
    margin: 10px 0;
    font-size: 14px;
    color: #333;
}

.profile-actions {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 20px;
}

.popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.popup-content {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    width: 400px;
    text-align: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.popup-content h3 {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 15px;
    color: #ff4d4d;
}

.popup-content .success-text {
    color: #00cc00;
}

.user-info {
    background-color: #f5f5f5;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 15px;
}

.user-info p {
    margin: 5px 0;
    font-size: 14px;
    /* color: #333; */
}

.warning-text,
.success-text {
    font-size: 14px;
    margin-bottom: 20px;
}

.warning-text {
    color: #666;
}

.popup-actions {
    display: flex;
    justify-content: center;
    gap: 10px;
}

.popup-actions .cancel-btn {
    padding: 10px 20px;
    background-color: #ccc;
    border: none;
    border-radius: 4px;
    color: #1a1a1a;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.1s;
}

.popup-actions .cancel-btn:hover {
    background-color: #b3b3b3;
    transform: scale(1.05);
}

.popup-actions .confirm-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    color: #fff;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.1s;
}

.popup-actions .confirm-btn.delete {
    background-color: #ff4d4d;
}

.popup-actions .confirm-btn.delete:hover {
    background-color: #e63939;
    transform: scale(1.05);
}

.popup-actions .confirm-btn.restore {
    background-color: #00cc00;
}

.popup-actions .confirm-btn.restore:hover {
    background-color: #00b300;
    transform: scale(1.05);
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-top: 20px;
    color: #fff;
}

.pagination-btn {
    padding: 8px 12px;
    background-color: #444;
    border: none;
    border-radius: 4px;
    color: #fff;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s, transform 0.1s;
}

.pagination-btn:hover:not(:disabled) {
    background-color: #ae9a64;
    transform: scale(1.05);
}

.pagination-btn:disabled {
    background-color: #666;
    cursor: not-allowed;
    opacity: 0.6;
}

.pagination-btn.active {
    background-color: #ae9a64;
    cursor: default;
    transform: none;
}

.first-btn,
.prev-btn,
.next-btn,
.last-btn {
    padding: 8px 10px;
}

.page-numbers {
    display: flex;
    gap: 6px;
    align-items: center;
}

.page-numbers span {
    color: #fff;
    font-size: 14px;
    margin: 0 5px;
}

@media (max-width: 768px) {
    .users-management {
        padding: 15px;
        padding-top: 150px;
    }

    .table-header,
    .user-item {
        grid-template-columns: 1fr 100px 100px 80px;
    }

    .col-user {
        padding-left: 40px;
    }

    .header-actions {
        flex-direction: column;
        gap: 10px;
    }

    .filter-section {
        flex-direction: column;
        width: 100%;
    }

    .search-input,
    .role-filter {
        width: 100%;
    }

    .modal-content {
        width: 90%;
        padding: 15px;
    }

    .popup-content {
        width: 90%;
        padding: 15px;
    }

    .dashboard-header {
        height: 130px;
    }

    .pagination {
        flex-wrap: wrap;
        gap: 6px;
    }
}

@media (max-width: 480px) {

    .table-header,
    .user-item {
        grid-template-columns: 1fr 80px 80px 60px;
    }

    .col-user {
        padding-left: 20px;
    }

    .user-photo {
        width: 36px;
        height: 36px;
    }

    .user-info h3 {
        font-size: 16px;
    }

    .user-info p {
        font-size: 12px;
    }

    .user-meta {
        font-size: 12px;
    }

    .action-btn {
        padding: 6px 8px;
        font-size: 12px;
    }

    .pagination-btn {
        padding: 6px 8px;
        font-size: 12px;
    }

    .users-management {
        padding-top: 160px;
    }
}
</style>