<template>
    <div class="main-container">
        <Navigation @sidebar-toggle="handleSidebarToggle" class="sidebar-fixed" />
        <section class="dashboard" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
            <!-- Header cố định -->
            <div class="dashboard-header fixed-header" ref="dashboardHeader">
                <div class="header-right-group">
                    <div class="filter-section">
                        <input type="text" v-model="searchQuery" placeholder="Tìm kiếm..." class="search-input" ref="searchInput" />
                        <select v-model="roleFilter" class="role-filter">
                            <option value="">Tất cả vai trò</option>
                            <option value="manager">Quản lý</option>
                            <option value="staff">Nhân viên</option>
                        </select>
                    </div>
                    <div class="action-buttons">
                        <button class="action-button add-user-btn" @click="openAddUserModal">
                            <i class="fa-solid fa-plus"></i> Thêm
                        </button>
                        <button class="action-button show-deleted-btn" ref="deletedBtn" @click="toggleDeletedUsers">
                            {{ showDeletedUsers ? "Ẩn người dùng đã xóa" : "Xem người dùng đã xóa" }}
                        </button>
                        <button class="action-button refresh-button" @click="refreshUsers">
                            <i class="fas fa-sync-alt"></i> Làm mới
                        </button>
                    </div>
                </div>
            </div>

            <!-- Nội dung chính với padding-top -->
            <div class="container-user">
                <section class="users-management">
                    <div class="users-list" v-if="!showDeletedUsers && pendingUsers.length > 0">
                        <h2>Yêu cầu đăng ký ({{ pendingUsers.length }})</h2>
                        <div class="table-header">
                            <div class="col-user">Người dùng (Chờ duyệt)</div>
                            <div class="col-meta">Last active</div>
                            <div class="col-meta">Date added</div>
                            <div class="col-actions">Hành động</div>
                        </div>
                        <div class="user-item pending-user" v-for="user in pendingUsers" :key="user.user_id"
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
                        <div class="user-item" v-for="user in paginatedUsers" :key="user.user_id"
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
                        <div class="user-item deleted-user" v-for="user in paginatedDeletedUsers" :key="user.user_id">
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
                </section>
            </div>
        </section>

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
            <div class="modal-content profile-modal">
                <div class="modal-header">
                    <h2>Hồ sơ người dùng</h2>
                    <button class="close-btn" @click="showProfileModal = false">×</button>
                </div>
                <div class="profile-details">
                    <img :src="getImageUrl(selectedUser.profilePhoto)" alt="Ảnh đại diện" class="profile-photo"
                        @error="handleImageError" />
                    <div class="profile-info">
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
                    </div>
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
            totalItems: 0,
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
        syncSearchWidth() {
            this.$nextTick(() => {
                const btn = this.$refs.deletedBtn;
                const input = this.$refs.searchInput;
                if (btn && input) {
                    const rect = btn.getBoundingClientRect();
                    input.style.width = `${rect.width}px`;
                    input.style.height = `${rect.height}px`;
                }
            });
        },
        toggleDeletedUsers() {
            this.showDeletedUsers = !this.showDeletedUsers;
            this.syncSearchWidth();
        },
        handleSidebarToggle(isCollapsed) {
            this.isSidebarCollapsed = isCollapsed;
            this.adjustContentPadding();
        },
        adjustContentPadding() {
            this.$nextTick(() => {
                const header = this.$refs.dashboardHeader;
                const container = document.querySelector('.container-user');
                if (header && container) {
                    const headerHeight = header.offsetHeight;
                    container.style.paddingTop = `${headerHeight + 20}px`;
                    container.style.minHeight = `calc(100vh - ${headerHeight}px)`;
                }
            });
        },
        handleResize() {
            this.adjustContentPadding();
            this.syncSearchWidth();
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
            } catch (error) {
                console.error('Lỗi khi lấy danh sách người dùng đã xóa:', error.message);
                this.deletedUsers = [];
                Swal.fire('Lỗi!', 'Không thể lấy danh sách người dùng đã xóa.', 'error');
            }
        },
        async approveUser(user) {
            try {
                await axios.put(`http://localhost:3000/users/approve/${user.user_id}`, {}, {
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
                await axios.put(`http://localhost:3000/users/reject/${user.user_id}`, {}, {
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
                user_id: null,
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
            this.userForm = { ...user, password: '', user_id: user.user_id };
            this.previewPhoto = null;
            this.showUserModal = true;
            this.showProfileModal = false;
        },
        async openProfileModal(user) {
            try {
                const response = await axios.get(`http://localhost:3000/users/${user.user_id}`, {
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
                    response = await axios.put(`http://localhost:3000/users/${this.userForm.user_id}`, userData, {
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
                    const updatedUserResponse = await axios.get(`http://localhost:3000/users/${this.editingUser.user_id}`, {
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
                await axios.delete(`http://localhost:3000/users/${this.userToDelete.user_id}`, {
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
                await axios.post(`http://localhost:3000/users/restore/${this.userToRestore.user_id}`, {}, {
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
        changePage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
            }
        },
        changeDeletedPage(page) {
            if (page >= 1 && page <= this.deletedTotalPages) {
                this.currentDeletedPage = page;
            }
        },
        async refreshUsers() {
            this.currentPage = 1;
            this.currentDeletedPage = 1;
            await this.fetchUsers();
            await this.fetchDeletedUsers();
            Swal.fire('Thành công!', 'Danh sách người dùng đã được làm mới!', 'success');
        },
        updateDateTime() {
            this.currentDateTime = new Date().toLocaleString("vi-VN", { 
                weekday: "short", 
                day: "numeric", 
                month: "short", 
                year: "numeric", 
                hour: "numeric", 
                minute: "numeric" 
            });
        },
    },
    watch: {
        showDeletedUsers() {
            this.adjustContentPadding();
        }
    },
    created() {
        this.fetchUsers();
        this.fetchDeletedUsers();
        this.updateDateTime();
        this.updateDateTimeInterval = setInterval(this.updateDateTime, 60000);
    },
    mounted() {
        this.adjustContentPadding();
        this.syncSearchWidth();
        window.addEventListener('resize', this.handleResize);
    },
    beforeDestroy() {
        clearInterval(this.updateDateTimeInterval);
        window.removeEventListener('resize', this.handleResize);
    },
};
</script>

<style scoped>
.main-container {
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

/* Dashboard điều chỉnh theo sidebar */
.dashboard {
  flex: 1;
  padding: 0;
  background-color: #FFF8E7;
  transition: margin-left 0.3s ease;
  margin-left: 280px;
  min-height: 100vh;
  position: relative;
}

.dashboard.sidebar-collapsed {
  margin-left: 0;
}

/* Header cố định - Trong suốt */
.dashboard-header.fixed-header {
  position: fixed;
  top: 0;
  left: 280px;
  right: 0;
  background: rgba(255, 248, 231, 0.85);
  backdrop-filter: blur(10px);
  z-index: 999;
  padding: 1rem 2rem;
  margin: 0;
  border-bottom: 1px solid rgba(231, 194, 125, 0.5);
  box-shadow: 0 4px 15px rgba(107, 66, 38, 0.1);
  transition: left 0.3s ease;
}

.dashboard.sidebar-collapsed .dashboard-header.fixed-header {
  left: 0;
}

.header-right-group {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  justify-content: flex-end;
  width: 100%;
  flex-wrap: wrap;
}

.filter-section {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-input,
.role-filter {
  padding: 0.6rem 0.8rem;
  border: 1px solid rgba(139, 94, 60, 0.5);
  border-radius: 8px;
  background: rgba(255, 248, 231, 0.9);
  color: #3B2F2F;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  font-weight: 500;
  min-height: 40px;
  box-sizing: border-box;
}

.search-input {
  width: 200px;
}

.role-filter {
  width: 160px;
}

.search-input:focus,
.role-filter:focus {
  border-color: #E7C27D;
  outline: none;
  background: #FFF8E7;
  box-shadow: 0 0 0 3px rgba(231, 194, 125, 0.3);
}

.current-time {
  font-size: 1rem;
  color: #6B4226;
  font-weight: 600;
  white-space: nowrap;
  background: rgba(231, 194, 125, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(139, 94, 60, 0.2);
}

.action-buttons {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  flex-wrap: wrap;
}

.action-button {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(107, 66, 38, 0.2);
  border: 1px solid #E7C27D;
  white-space: nowrap;
  min-height: 40px;
}

.add-user-btn {
  background: #8B5E3C;
  color: #FFF8E7;
}

.add-user-btn:hover {
  background: #6B4226;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(107, 66, 38, 0.4);
}

.show-deleted-btn {
  background: rgba(255, 248, 231, 0.3);
  color: #6B4226;
}

.show-deleted-btn:hover {
  background: rgba(255, 248, 231, 0.4);
  transform: translateY(-2px);
}

.refresh-button {
  background: #E7C27D;
  color: #6B4226;
}

.refresh-button:hover {
  background: #F5E3B3;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(231, 194, 125, 0.4);
}

/* Content với padding-top */
.container-user {
  flex: 1;
  margin: 0;
  padding: 100px 0 0 0;
  background-color: #FFF8E7;
  color: #3B2F2F;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: calc(100vh - 100px);
}

.users-management {
  padding: 0px;
  color: #3B2F2F;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  z-index: 1;
}

.page-title {
  text-align: center;
  margin-bottom: 2rem;
  padding: 1rem;
}

.page-title h2 {
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
  color: #6B4226;
  text-shadow: 0 0 5px #E7C27D, 0 0 30px #E7C27D;
  margin: 0;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  background: rgba(255, 248, 231, 0.5);
  border-radius: 12px;
  padding: clamp(15px, 3vw, 20px);
  margin-bottom: 20px;
  border: 2px solid rgba(231, 194, 125, 0.3);
  box-shadow: 0 4px 15px rgba(107, 66, 38, 0.1);
}

.users-list h2 {
  font-size: clamp(1.3rem, 3vw, 1.5rem);
  font-weight: 700;
  color: #6B4226;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #E7C27D;
}

.users-list p {
  color: #D32F2F;
  font-size: clamp(0.9rem, 2vw, 1rem);
  font-weight: 600;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr minmax(100px, 120px) minmax(100px, 120px) minmax(100px, 120px);
  align-items: center;
  background: rgba(139, 94, 60, 0.3);
  padding: clamp(12px, 2vw, 15px);
  border-radius: 10px;
  font-weight: 700;
  color: #6B4226;
  border-bottom: 2px solid #E7C27D;
  gap: 10px;
}

.col-user {
  text-align: left;
  padding-left: clamp(40px, 5vw, 60px);
}

.col-meta {
  text-align: center;
}

.col-actions {
  text-align: center;
}

.sort-link {
  cursor: pointer;
  color: #6B4226;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: clamp(0.85rem, 2vw, 0.9rem);
}

.sort-link:hover {
  color: #E7C27D;
}

.user-item {
  display: grid;
  grid-template-columns: 1fr minmax(100px, 120px) minmax(100px, 120px) minmax(100px, 120px);
  align-items: center;
  background: rgba(255, 248, 231, 0.3);
  padding: clamp(12px, 2vw, 15px);
  border-radius: 10px;
  cursor: pointer;
  border-bottom: 1px solid rgba(231, 194, 125, 0.3);
  transition: all 0.3s ease;
  margin-bottom: 8px;
  gap: 10px;
}

.user-item:hover {
  background: rgba(231, 194, 125, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 66, 38, 0.1);
}

.pending-user {
  background: rgba(56, 142, 60, 0.15);
  border-left: 4px solid #388E3C;
}

.pending-user:hover {
  background: rgba(56, 142, 60, 0.25);
}

.deleted-user {
  background: rgba(211, 47, 47, 0.15);
  border-left: 4px solid #D32F2F;
}

.deleted-user:hover {
  background: rgba(211, 47, 47, 0.25);
}

.user-details {
  display: flex;
  align-items: center;
  gap: clamp(15px, 3vw, 20px);
  width: 100%;
  min-width: 0;
}

.user-photo {
  width: clamp(45px, 6vw, 50px);
  height: clamp(45px, 6vw, 50px);
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #E7C27D;
  box-shadow: 0 2px 8px rgba(107, 66, 38, 0.2);
  flex-shrink: 0;
}

.user-info {
  background: none !important;
  flex: 1;
  min-width: 0;
}

.user-info h3 {
  font-size: clamp(1rem, 2vw, 1.1rem);
  font-weight: 700;
  margin-bottom: 5px;
  color: #6B4226;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-info p {
  font-size: clamp(0.8rem, 1.8vw, 0.9rem);
  color: #3B2F2F;
  opacity: 0.8;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-meta {
  text-align: center;
  color: #3B2F2F;
  font-size: clamp(0.8rem, 1.8vw, 0.9rem);
  opacity: 0.8;
  font-weight: 500;
}

.user-actions {
  display: flex;
  justify-content: center;
  gap: clamp(6px, 1vw, 8px);
  flex-wrap: wrap;
}

.action-btn {
  padding: clamp(6px, 1.5vw, 8px) clamp(10px, 2vw, 12px);
  background: rgba(255, 248, 231, 0.6);
  border: 1px solid #8B5E3C;
  border-radius: 6px;
  color: #6B4226;
  cursor: pointer;
  font-size: clamp(0.75rem, 1.8vw, 0.8rem);
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(107, 66, 38, 0.2);
  min-height: 32px;
  min-width: 60px;
}

.edit-btn {
  background: #E7C27D;
  color: #6B4226;
  border: 1px solid #E7C27D;
}

.edit-btn:hover {
  background: #F5E3B3;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(231, 194, 125, 0.3);
}

.delete-btn {
  background: #D32F2F;
  color: #FFF8E7;
  border: 1px solid #D32F2F;
}

.delete-btn:hover {
  background: #C62828;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(211, 47, 47, 0.3);
}

.approve-btn {
  background: #388E3C;
  color: #FFF8E7;
  border: 1px solid #388E3C;
}

.approve-btn:hover {
  background: #2E7D32;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(56, 142, 60, 0.3);
}

.reject-btn {
  background: #D32F2F;
  color: #FFF8E7;
  border: 1px solid #D32F2F;
}

.reject-btn:hover {
  background: #C62828;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(211, 47, 47, 0.3);
}

.restore-btn {
  background: #388E3C;
  color: #FFF8E7;
  border: 1px solid #388E3C;
}

.restore-btn:hover {
  background: #2E7D32;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(56, 142, 60, 0.3);
}

/* Modal và Popup */
.modal, .popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(107, 66, 38, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
  padding: 20px;
}

.modal-content, .popup-content {
  background: linear-gradient(135deg, #FFF8E7, #F5E3B3);
  padding: clamp(20px, 4vw, 30px);
  border-radius: 15px;
  width: min(500px, 95vw);
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
  margin-bottom: clamp(20px, 3vw, 25px);
  padding-bottom: 15px;
  border-bottom: 2px solid #E7C27D;
}

.modal-header h2 {
  font-size: clamp(1.3rem, 3vw, 1.5rem);
  color: #6B4226;
  text-align: center;
  flex: 1;
  margin: 0;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  cursor: pointer;
  color: #6B4226;
  transition: all 0.3s ease;
  padding: 5px;
  border-radius: 4px;
  min-width: 30px;
  min-height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #E7C27D;
  background: rgba(231, 194, 125, 0.1);
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: clamp(15px, 2.5vw, 20px);
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
  font-size: clamp(0.85rem, 2vw, 0.9rem);
  font-weight: 600;
  color: #6B4226;
}

.form-group input,
.form-group select {
  padding: clamp(10px, 2vw, 12px);
  border: 1px solid #8B5E3C;
  border-radius: 8px;
  font-size: clamp(0.85rem, 2vw, 0.9rem);
  transition: all 0.3s ease;
  background: rgba(255, 248, 231, 0.8);
  color: #3B2F2F;
  font-weight: 500;
  min-height: 44px;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #E7C27D;
  outline: none;
  background: #FFF8E7;
  box-shadow: 0 0 0 3px rgba(231, 194, 125, 0.3);
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
  font-size: clamp(0.85rem, 2vw, 0.9rem);
  color: #6B4226;
  font-weight: 600;
}

.preview-image {
  width: clamp(100px, 12vw, 120px);
  height: clamp(100px, 12vw, 120px);
  object-fit: cover;
  border-radius: 10px;
  border: 2px solid #E7C27D;
  box-shadow: 0 4px 12px rgba(107, 66, 38, 0.2);
}

.remove-preview {
  padding: clamp(6px, 1.5vw, 8px) clamp(12px, 2vw, 16px);
  background: #D32F2F;
  color: #FFF8E7;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: clamp(0.75rem, 1.8vw, 0.8rem);
  width: fit-content;
  transition: all 0.3s ease;
  font-weight: 600;
  min-height: 32px;
}

.remove-preview:hover {
  background: #C62828;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(211, 47, 47, 0.3);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: clamp(20px, 3vw, 25px);
  padding-top: 15px;
  border-top: 1px solid rgba(231, 194, 125, 0.3);
}

.right-actions {
  display: flex;
  gap: clamp(10px, 2vw, 12px);
  flex-wrap: wrap;
}

.right-actions button {
  padding: clamp(10px, 2vw, 12px) clamp(20px, 3vw, 24px);
  border-radius: 8px;
  font-size: clamp(0.85rem, 2vw, 0.9rem);
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(107, 66, 38, 0.3);
  border: 1px solid;
  min-height: 44px;
  min-width: 80px;
}

.cancel-btn {
  background: rgba(139, 94, 60, 0.2);
  border-color: #8B5E3C;
  color: #6B4226;
}

.cancel-btn:hover {
  background: rgba(139, 94, 60, 0.3);
  transform: translateY(-2px);
}

.submit-btn {
  background: #8B5E3C;
  border-color: #8B5E3C;
  color: #FFF8E7;
}

.submit-btn:hover {
  background: #6B4226;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 66, 38, 0.4);
}

/* Profile Modal */
.profile-modal {
  max-width: min(500px, 95vw);
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.profile-details {
  text-align: center;
  padding: 0;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.profile-details .profile-photo {
  width: clamp(100px, 15vw, 120px);
  height: clamp(100px, 15vw, 120px);
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 20px;
  border: 3px solid #E7C27D;
  box-shadow: 0 4px 15px rgba(107, 66, 38, 0.3);
}

.profile-info {
  text-align: left;
  margin-bottom: 20px;
}

.profile-details p {
  margin: 12px 0;
  font-size: clamp(0.85rem, 2vw, 0.9rem);
  color: #3B2F2F;
  font-weight: 500;
  padding: 8px 0;
  border-bottom: 1px solid rgba(231, 194, 125, 0.3);
  word-wrap: break-word;
  line-height: 1.4;
}

.profile-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid rgba(231, 194, 125, 0.3);
}

/* Popup Content */
.popup-content h3 {
  font-size: clamp(1.2rem, 3vw, 1.3rem);
  font-weight: 700;
  margin-bottom: 20px;
  color: #D32F2F;
}

.popup-content .success-text {
  color: #388E3C;
}

.user-info {
  background: rgba(255, 248, 231, 0.6);
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  border: 1px solid rgba(231, 194, 125, 0.3);
}

.user-info p {
  margin: 8px 0;
  font-size: clamp(0.85rem, 2vw, 0.9rem);
  color: #3B2F2F;
  font-weight: 500;
}

.warning-text,
.success-text {
  font-size: clamp(0.85rem, 2vw, 0.9rem);
  margin-bottom: 25px;
  font-weight: 500;
  line-height: 1.5;
}

.warning-text {
  color: #3B2F2F;
  opacity: 0.8;
}

.popup-actions {
  display: flex;
  justify-content: center;
  gap: clamp(10px, 2vw, 12px);
  flex-wrap: wrap;
}

.popup-actions .cancel-btn {
  padding: clamp(10px, 2vw, 12px) clamp(20px, 3vw, 24px);
  background: rgba(139, 94, 60, 0.2);
  border: 1px solid #8B5E3C;
  border-radius: 8px;
  color: #6B4226;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  min-height: 44px;
  min-width: 80px;
}

.popup-actions .cancel-btn:hover {
  background: rgba(139, 94, 60, 0.3);
  transform: translateY(-2px);
}

.popup-actions .confirm-btn {
  padding: clamp(10px, 2vw, 12px) clamp(20px, 3vw, 24px);
  border: none;
  border-radius: 8px;
  color: #FFF8E7;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  border: 1px solid;
  min-height: 44px;
  min-width: 80px;
}

.popup-actions .confirm-btn {
  background: #D32F2F;
  border-color: #D32F2F;
}

.popup-actions .confirm-btn:hover {
  background: #C62828;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(211, 47, 47, 0.3);
}

.popup-actions .confirm-btn.restore {
  background: #388E3C;
  border-color: #388E3C;
}

.popup-actions .confirm-btn.restore:hover {
  background: #2E7D32;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(56, 142, 60, 0.3);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: clamp(8px, 1.5vw, 10px);
  margin-top: 25px;
  color: #3B2F2F;
  padding: clamp(12px, 2vw, 15px);
  background: rgba(255, 248, 231, 0.5);
  border-radius: 10px;
  border: 1px solid rgba(231, 194, 125, 0.3);
  flex-wrap: wrap;
}

.pagination-btn {
  padding: clamp(8px, 1.5vw, 10px) clamp(12px, 2vw, 15px);
  background: rgba(255, 248, 231, 0.8);
  border: 1px solid #8B5E3C;
  border-radius: 8px;
  color: #6B4226;
  cursor: pointer;
  font-size: clamp(0.85rem, 2vw, 0.9rem);
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(107, 66, 38, 0.2);
  min-height: 40px;
  min-width: 40px;
}

.pagination-btn:hover:not(:disabled) {
  background: #E7C27D;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(231, 194, 125, 0.3);
}

.pagination-btn:disabled {
  background: rgba(168, 155, 139, 0.3);
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
}

.pagination-btn.active {
  background: #8B5E3C;
  color: #FFF8E7;
  cursor: default;
  transform: none;
}

.first-btn,
.prev-btn,
.next-btn,
.last-btn {
  padding: clamp(8px, 1.5vw, 10px) clamp(10px, 1.8vw, 12px);
}

.page-numbers {
  display: flex;
  gap: clamp(6px, 1vw, 8px);
  align-items: center;
  flex-wrap: wrap;
}

.page-numbers span {
  color: #3B2F2F;
  font-size: clamp(0.85rem, 2vw, 0.9rem);
  margin: 0 clamp(6px, 1vw, 8px);
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .header-right-group {
    gap: 1rem;
  }
  
  .search-input {
    width: 180px;
  }
  
  .role-filter {
    width: 140px;
  }
}

@media (max-width: 1024px) {
  .dashboard {
    margin-left: 240px;
  }
  
  .dashboard-header.fixed-header {
    left: 240px;
  }
  
  .container-user {
    padding-top: 140px;
    min-height: calc(100vh - 140px);
  }
}

@media (max-width: 768px) {
  .dashboard {
    margin-left: 0 !important;
  }
  
  .dashboard-header.fixed-header {
    left: 0 !important;
    padding: 1rem;
  }
  
  .header-right-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .filter-section {
    width: 100%;
  }
  
  .search-input,
  .role-filter {
    width: 100%;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: flex-start;
  }
  
  .container-user {
    padding-top: 180px;
    min-height: calc(100vh - 180px);
  }
  
  .table-header,
  .user-item {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .col-user,
  .col-meta,
  .col-actions {
    text-align: left;
    padding: 5px 0;
  }
  
  .user-details {
    justify-content: flex-start;
  }
  
  .user-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .header-right-group {
    gap: 0.8rem;
  }
  
  .filter-section {
    flex-direction: column;
    width: 100%;
  }
  
  .action-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .action-button {
    width: 100%;
    justify-content: center;
  }
  
  .container-user {
    padding-top: 200px;
    min-height: calc(100vh - 200px);
  }
  
  .modal-content,
  .popup-content {
    padding: 15px;
  }
}
</style>