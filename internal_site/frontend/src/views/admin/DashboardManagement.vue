<template>
    <div class="main-container">
        <Navigation @sidebar-toggle="handleSidebarToggle" />
        <section class="dashboard" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
            <!-- Header cố định -->
            <div class="dashboard-header fixed-header">
                <div class="header-top">
                    <h2>TRANG THỐNG KÊ NHÀ HÀNG</h2>
                    <span>{{ currentDateTime }}</span>
                </div>
                <div class="header-actions">
                    <div class="filter-section">
                        <select v-model="filterCategory" @change="fetchStats">
                            <option value="tong-quan">Tổng quan</option>
                            <option value="doanh-thu">Doanh thu</option>
                            <option value="mon-an">Theo món ăn</option>
                            <option value="khach-hang">Theo khách hàng</option>
                            <option value="dat-ban">Đặt bàn</option>
                        </select>
                    </div>
                    <div class="date-filter">
                        <label>Thời gian: </label>
                        <select v-model="dateFilterType" @change="resetDateFilters">
                            <option value="month">Theo tháng</option>
                            <option value="custom">Tùy chỉnh</option>
                        </select>
                        <input v-if="dateFilterType === 'month'" type="month" v-model="selectedMonthYear"
                            @change="fetchStats" />
                        <div v-else class="custom-date-range">
                            <input type="date" v-model="startDate" @change="fetchStats" />
                            <span>-</span>
                            <input type="date" v-model="endDate" @change="fetchStats" />
                        </div>
                    </div>
                    <button class="action-button refresh-button" @click="fetchStats">
                        <i class="fas fa-sync-alt"></i> Làm mới
                    </button>
                    <button class="action-button export-button" @click="exportReport">
                        <i class="fas fa-download"></i> Xuất báo cáo
                    </button>
                </div>
            </div>

            <!-- Nội dung chính với padding-top để tránh bị header che -->
            <div class="container-content">
                <div v-if="isLoading" class="loading-overlay">
                    <div class="spinner"></div>
                </div>

                <div v-if="errorMessage" class="error-message">
                    {{ errorMessage }}
                </div>

                <!-- Tổng quan -->
                <div v-if="filterCategory === 'tong-quan' && !isLoading" class="stats-grid">
                    <div class="stats-group">
                        <div class="stat-card" ref="overviewDailyRevenue">
                            <div class="card-icon revenue-icon"><i class="fas fa-dollar-sign"></i></div>
                            <div class="card-content">
                                <h3>Doanh thu trong ngày</h3>
                                <p>{{ formatCurrency(stats.current.dailyRevenue) }}</p>
                                <span class="trend"
                                    :class="getTrendClass(stats.current.dailyRevenue, stats.previous.dailyRevenue)">
                                    {{ getTrend(stats.current.dailyRevenue, stats.previous.dailyRevenue) }}
                                </span>
                            </div>
                            <button class="export-image-button"
                                @click="exportSectionImage('overviewDailyRevenue', 'DoanhThuTrongNgay')">
                                <i class="fas fa-camera"></i> Xuất ảnh
                            </button>
                        </div>
                        <div class="stat-card" ref="overviewTotalBookings">
                            <div class="card-icon booking-icon"><i class="fas fa-table"></i></div>
                            <div class="card-content">
                                <h3>Số lượt đặt bàn</h3>
                                <p>{{ stats.current.totalBookings }}</p>
                                <span class="sub-text">Tỷ lệ: {{ stats.current.bookingSuccessRate.toFixed(1) }}%</span>
                                <span class="trend"
                                    :class="getTrendClass(stats.current.totalBookings, stats.previous.totalBookings)">
                                    {{ getTrend(stats.current.totalBookings, stats.previous.totalBookings) }}
                                </span>
                            </div>
                            <button class="export-image-button"
                                @click="exportSectionImage('overviewTotalBookings', 'SoLuotDatBan')">
                                <i class="fas fa-camera"></i> Xuất ảnh
                            </button>
                        </div>
                    </div>
                    <div class="stats-group">
                        <div class="stat-card" ref="overviewDailyCustomers">
                            <div class="card-icon customer-icon"><i class="fas fa-users"></i></div>
                            <div class="card-content">
                                <h3>Lượng khách trong ngày</h3>
                                <p>{{ stats.current.dailyCustomers }}</p>
                                <span class="trend"
                                    :class="getTrendClass(stats.current.dailyCustomers, stats.previous.dailyCustomers)">
                                    {{ getTrend(stats.current.dailyCustomers, stats.previous.dailyCustomers) }}
                                </span>
                            </div>
                            <button class="export-image-button"
                                @click="exportSectionImage('overviewDailyCustomers', 'LuongKhachTrongNgay')">
                                <i class="fas fa-camera"></i> Xuất ảnh
                            </button>
                        </div>
                        <div class="stat-card" ref="overviewAvgServeTime">
                            <div class="card-icon time-icon"><i class="fas fa-clock"></i></div>
                            <div class="card-content">
                                <h3>Thời gian phục vụ TB</h3>
                                <p>{{ stats.current.avgServeTime || 0 }} phút</p>
                                <span class="trend"
                                    :class="getTrendClass(stats.current.avgServeTime || 0, stats.previous.avgServeTime || 0)">
                                    {{ getTrend(stats.current.avgServeTime || 0, stats.previous.avgServeTime || 0) }}
                                </span>
                            </div>
                            <button class="export-image-button"
                                @click="exportSectionImage('overviewAvgServeTime', 'ThoiGianPhucVuTB')">
                                <i class="fas fa-camera"></i> Xuất ảnh
                            </button>
                        </div>
                    </div>
                    <div class="stats-group">
                        <div class="stat-card" ref="overviewServingCustomers">
                            <div class="card-icon serving-icon"><i class="fas fa-user-check"></i></div>
                            <div class="card-content">
                                <h3>Khách đang phục vụ</h3>
                                <p>{{ stats.current.servingCustomers }}</p>
                                <span class="trend"
                                    :class="getTrendClass(stats.current.servingCustomers, stats.previous.servingCustomers)">
                                    {{ getTrend(stats.current.servingCustomers, stats.previous.servingCustomers) }}
                                </span>
                            </div>
                            <button class="export-image-button"
                                @click="exportSectionImage('overviewServingCustomers', 'KhachDangPhucVu')">
                                <i class="fas fa-camera"></i> Xuất ảnh
                            </button>
                        </div>
                        <div class="stat-card" ref="overviewCancelledOrders">
                            <div class="card-icon cancel-icon"><i class="fas fa-times"></i></div>
                            <div class="card-content">
                                <h3>Số lượng hủy món</h3>
                                <p>{{ stats.current.cancelledOrders }}</p>
                                <span class="trend"
                                    :class="getTrendClass(stats.current.cancelledOrders, stats.previous.cancelledOrders)">
                                    {{ getTrend(stats.current.cancelledOrders, stats.previous.cancelledOrders) }}
                                </span>
                            </div>
                            <button class="export-image-button"
                                @click="exportSectionImage('overviewCancelledOrders', 'SoLuongHuyMon')">
                                <i class="fas fa-camera"></i> Xuất ảnh
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Doanh thu -->
                <div v-if="filterCategory === 'doanh-thu' && !isLoading" class="stats-grid">
                    <div class="stats-group full-width">
                        <div class="stat-card" ref="revenueTotal">
                            <h3>Tổng doanh thu</h3>
                            <p>{{ formatCurrency(stats.current.totalRevenue) || '0 VNĐ' }}</p>
                            <apexchart
                                v-if="Array.isArray(stats.current.monthlyRevenue) && stats.current.monthlyRevenue.length"
                                type="line" height="200" :options="chartOptionsMonthly" :series="seriesMonthly"></apexchart>
                            <span class="trend"
                                :class="getTrendClass(stats.current.totalRevenue || 0, stats.previous.totalRevenue || 0)">
                                {{ getTrend(stats.current.totalRevenue || 0, stats.previous.totalRevenue || 0) }}
                            </span>
                            <button class="export-image-button" @click="exportSectionImage('revenueTotal', 'TongDoanhThu')">
                                <i class="fas fa-camera"></i> Xuất ảnh
                            </button>
                        </div>
                    </div>
                    <div class="stats-group">
                        <div class="stat-card" ref="revenueWeekly">
                            <h3>Doanh thu theo tuần</h3>
                            <apexchart
                                v-if="Array.isArray(stats.current.weeklyRevenue) && stats.current.weeklyRevenue.length"
                                type="bar" height="300" :options="chartOptionsWeekly" :series="seriesWeekly"></apexchart>
                            <p v-else class="no-data">Không có dữ liệu</p>
                            <button class="export-image-button"
                                @click="exportSectionImage('revenueWeekly', 'DoanhThuTheoTuan')">
                                <i class="fas fa-camera"></i> Xuất ảnh
                            </button>
                        </div>
                        <div class="stat-card" ref="revenueHourly">
                            <h3>Doanh thu theo giờ</h3>
                            <apexchart
                                v-if="Array.isArray(stats.current.hourlyRevenue) && stats.current.hourlyRevenue.length"
                                type="area" height="300" :options="chartOptionsHourly" :series="seriesHourly"></apexchart>
                            <p v-else class="no-data">Không có dữ liệu</p>
                            <button class="export-image-button"
                                @click="exportSectionImage('revenueHourly', 'DoanhThuTheoGio')">
                                <i class="fas fa-camera"></i> Xuất ảnh
                            </button>
                        </div>
                    </div>
                    <div class="stats-group">
                        <div class="stat-card" ref="revenueByCategory">
                            <h3>Doanh thu theo danh mục</h3>
                            <apexchart
                                v-if="Array.isArray(stats.current.revenueByCategory) && stats.current.revenueByCategory.length"
                                type="donut" height="300" :options="chartOptionsCategory" :series="seriesCategory">
                            </apexchart>
                            <p v-else class="no-data">Không có dữ liệu</p>
                            <div v-if="Array.isArray(stats.current.revenueByCategory) && stats.current.revenueByCategory.length"
                                class="category-details">
                                <div v-for="category in stats.current.revenueByCategory" :key="category.category"
                                    class="category-item">
                                    <span>{{ category.category }}: {{ formatCurrency(category.revenue) }}</span>
                                    <button class="category-details-button"
                                        @click="toggleCategoryDetails(category.category)">
                                        <i class="fas fa-eye"></i> Hiện bảng
                                    </button>
                                    <table
                                        v-if="expandedCategory === category.category && Array.isArray(categoryDishes[category.category]) && categoryDishes[category.category].length"
                                        class="category-table">
                                        <thead>
                                            <tr>
                                                <th>Món ăn</th>
                                                <th>Số lượng bán</th>
                                                <th>Doanh thu</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="dish in categoryDishes[category.category]" :key="dish.name">
                                                <td>{{ dish.name }}</td>
                                                <td>{{ dish.sold }}</td>
                                                <td>{{ formatCurrency(dish.revenue) }}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <p v-else-if="expandedCategory === category.category" class="no-data">Không có dữ liệu
                                        món ăn</p>
                                </div>
                            </div>
                            <button class="export-image-button"
                                @click="exportSectionImage('revenueByCategory', 'DoanhThuTheoDanhMuc')">
                                <i class="fas fa-camera"></i> Xuất ảnh
                            </button>
                        </div>
                        <div class="stat-card" ref="revenueForecast">
                            <h3>Dự báo doanh thu</h3>
                            <p>{{ formatCurrency(stats.current.forecastRevenue) || '0 VNĐ' }}</p>
                            <span class="trend"
                                :class="getTrendClass(stats.current.forecastRevenue || 0, stats.previous.forecastRevenue || 0)">
                                {{ getTrend(stats.current.forecastRevenue || 0, stats.previous.forecastRevenue || 0) }}
                            </span>
                            <button class="export-image-button"
                                @click="exportSectionImage('revenueForecast', 'DuBaoDoanhThu')">
                                <i class="fas fa-camera"></i> Xuất ảnh
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Theo món ăn -->
                <div v-if="filterCategory === 'mon-an' && !isLoading" class="stats-grid">
                    <div class="stats-group">
                        <div class="stat-card" ref="topDishes">
                            <h3>Top 3 món ăn bán chạy</h3>
                            <div v-if="stats.current.topDishes && stats.current.topDishes.length" class="top-dishes-list">
                                <div v-for="(dish, index) in stats.current.topDishes" :key="dish.name" class="dish-item"
                                    :class="{ 'gold': index === 0, 'silver': index === 1, 'bronze': index === 2 }">
                                    <img :src="getImageUrl(dish.image)" @error="onImageError" alt="Dish Image"
                                        class="dish-image-small" />
                                    <span>{{ dish.name }} ({{ dish.sold }} lượt, {{ formatCurrency(dish.revenue) }})</span>
                                    <button class="details-button" @click="showDishDetails(dish)">Chi tiết</button>
                                </div>
                            </div>
                            <p v-else class="no-data">Không có dữ liệu món ăn</p>
                            <span class="trend-text">
                                Trước: {{(stats.previous.topDishes || []).map(d => `${d.name}: ${d.sold}
                                (${formatCurrency(d.revenue)})`).join(', ')}}
                            </span>
                            <button class="export-image-button" @click="exportSectionImage('topDishes', 'TopMonAn')">
                                <i class="fas fa-camera"></i> Xuất ảnh
                            </button>
                        </div>
                        <div class="stat-card leastSoldDish" ref="leastSoldDish">
                            <h3>Món ăn bán ít nhất</h3>
                            <div v-if="stats.current.leastSoldDish.name" class="least-sold-content">
                                <img :src="getImageUrl(stats.current.leastSoldDish.image)" @error="onImageError"
                                    alt="Least Sold Dish Image" class="dish-image-small" />
                                <p>{{ stats.current.leastSoldDish.name }} ({{ stats.current.leastSoldDish.sold }} lượt, {{
                                    formatCurrency(stats.current.leastSoldDish.revenue) }})</p>
                            </div>
                            <p v-else class="no-data">Không có dữ liệu</p>
                            <span class="trend-text">
                                Trước: {{ stats.previous.leastSoldDish.name ? `${stats.previous.leastSoldDish.name}:
                                ${stats.previous.leastSoldDish.sold}
                                (${formatCurrency(stats.previous.leastSoldDish.revenue)})` : 'Không có dữ liệu' }}
                            </span>
                            <button class="export-image-button"
                                @click="exportSectionImage('leastSoldDish', 'MonAnBanItNhat')">
                                <i class="fas fa-camera"></i> Xuất ảnh
                            </button>
                        </div>
                    </div>
                    <div class="stats-group full-width">
                        <div class="stat-card" ref="revenueByCategory">
                            <h3>Doanh thu theo danh mục</h3>
                            <apexchart type="donut" height="300" :options="chartOptionsCategory" :series="seriesCategory">
                            </apexchart>
                            <div v-for="category in stats.current.revenueByCategory" :key="category.category"
                                class="category-item">
                                <span>{{ category.category }}: {{ formatCurrency(category.revenue) }}</span>
                                <button class="category-details-button" @click="toggleCategoryDetails(category.category)">
                                    <i class="fas fa-eye"></i> Hiện bảng
                                </button>
                                <div v-if="expandedCategory === category.category">
                                    <table
                                        v-if="Array.isArray(categoryDishes[category.category]) && categoryDishes[category.category].length"
                                        class="category-table">
                                        <thead>
                                            <tr>
                                                <th>Món ăn</th>
                                                <th>Số lượng bán</th>
                                                <th>Doanh thu</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="dish in categoryDishes[category.category]" :key="dish.name">
                                                <td>{{ dish.name }}</td>
                                                <td>{{ dish.sold }}</td>
                                                <td>{{ formatCurrency(dish.revenue) }}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <p v-else class="no-data">Không có dữ liệu món ăn</p>
                                </div>
                            </div>
                            <button class="export-image-button"
                                @click="exportSectionImage('revenueByCategory', 'DoanhThuTheoDanhMuc')">
                                <i class="fas fa-camera"></i> Xuất ảnh
                            </button>
                        </div>
                    </div>
                    <!-- Modal chi tiết món ăn -->
                    <div v-if="selectedDish" class="dish-details-modal">
                        <div class="modal-content">
                            <h3>{{ selectedDish.name || 'Không có dữ liệu' }}</h3>
                            <img :src="getImageUrl(selectedDish.image)" @error="onImageError" alt="Dish Image"
                                class="dish-image" />
                            <p>Số lượng bán: {{ selectedDish.sold || 0 }} lượt</p>
                            <p>Doanh thu: {{ formatCurrency(selectedDish.revenue || 0) }}</p>
                            <p>Danh mục: {{ selectedDish.category || 'Không xác định' }}</p>
                            <p>Mô tả: {{ selectedDish.description || 'Chưa có mô tả' }}</p>
                            <button @click="selectedDish = null">Đóng</button>
                        </div>
                    </div>
                </div>
                <!-- Theo khách hàng -->
                <div v-if="filterCategory === 'khach-hang' && !isLoading" class="stats-grid">
                    <div class="stats-group">
                        <div class="stat-card" ref="customersNew">
                            <h3>Khách hàng mới</h3>
                            <p>{{ stats.current.newCustomers }}</p>
                            <span class="trend"
                                :class="getTrendClass(stats.current.newCustomers, stats.previous.newCustomers)">
                                {{ getTrend(stats.current.newCustomers, stats.previous.newCustomers) }}
                            </span>
                            <button class="export-image-button" @click="exportSectionImage('customersNew', 'KhachHangMoi')">
                                <i class="fas fa-camera"></i> Xuất ảnh
                            </button>
                        </div>
                        <div class="stat-card" ref="customersReturning">
                            <h3>Khách hàng quay lại</h3>
                            <p>{{ stats.current.returningCustomers }}</p>
                            <span class="trend"
                                :class="getTrendClass(stats.current.returningCustomers, stats.previous.returningCustomers)">
                                {{ getTrend(stats.current.returningCustomers, stats.previous.returningCustomers) }}
                            </span>
                            <button class="export-image-button"
                                @click="exportSectionImage('customersReturning', 'KhachHangQuayLai')">
                                <i class="fas fa-camera"></i> Xuất ảnh
                            </button>
                        </div>
                    </div>
                    <div class="stats-group full-width">
                        <div class="stat-card" ref="topCustomers">
                            <h3>Top 3 khách hàng tiềm năng</h3>
                            <div v-if="stats.current.topPotentialCustomers && stats.current.topPotentialCustomers.length"
                                class="top-customers-list">
                                <div v-for="customer in stats.current.topPotentialCustomers" :key="customer.customer_id"
                                    class="customer-item"
                                    :class="{ 'gold': customer.rank === 1, 'silver': customer.rank === 2, 'bronze': customer.rank === 3 }">
                                    <span class="customer-name">{{ customer.name }}</span>
                                    <div class="customer-stats">
                                        <span class="total-bill">Tổng hóa đơn: {{ formatCurrency(customer.totalBill)
                                        }}</span>
                                        <span class="visits">| {{ customer.visits }} lượt quay lại</span>
                                    </div>
                                    <button class="details-button" @click="showCustomerDetails(customer.customer_id)">Chi
                                        tiết</button>
                                </div>
                            </div>
                            <p v-else class="no-data">Không có dữ liệu khách hàng</p>
                            <span class="trend-text">
                                Trước: {{(stats.previous.topPotentialCustomers || []).map(c => `${c.name}:
                                ${formatCurrency(c.totalBill)} (${c.visits})`).join(', ')}}
                            </span>
                            <button class="export-image-button"
                                @click="exportSectionImage('topCustomers', 'TopKhachHangTiemNang')">
                                <i class="fas fa-camera"></i> Xuất ảnh
                            </button>
                        </div>
                    </div>
                    <!-- Modal chi tiết khách hàng -->
                    <div v-if="selectedCustomer" class="customer-details-modal">
                        <div class="modal-content">
                            <h3>{{ selectedCustomer.name || 'Không có dữ liệu' }}</h3>
                            <p>Số điện thoại: {{ selectedCustomer.phone || 'Chưa có thông tin' }}</p>
                            <p>Tổng hóa đơn: {{ formatCurrency(selectedCustomer.totalBill || 0) }}</p>
                            <p>Lượt quay lại: {{ selectedCustomer.visits || 0 }} lượt</p>
                            <button @click="selectedCustomer = null">Đóng</button>
                        </div>
                    </div>
                </div>

                <!-- Đặt bàn -->
                <div v-if="filterCategory === 'dat-ban' && !isLoading" class="stats-grid">
                    <div class="stats-group">
                        <div class="stat-card" ref="reservationsTotal">
                            <h3>Số lượng đặt bàn</h3>
                            <p>Tổng: {{ stats.current.totalBookings }}</p>
                            <ul>
                                <li>Đã xác nhận: {{ stats.current.confirmedBookings }}</li>
                                <li>Đã hủy: {{ stats.current.cancelledBookings }}</li>
                            </ul>
                            <span class="trend-text">Trước: Tổng {{ stats.previous.totalBookings }} (Xác nhận: {{
                                stats.previous.confirmedBookings }}, Hủy: {{ stats.previous.cancelledBookings }})</span>
                            <button class="export-image-button"
                                @click="exportSectionImage('reservationsTotal', 'SoLuongDatBan')">
                                <i class="fas fa-camera"></i> Xuất ảnh
                            </button>
                        </div>
                        <div class="stat-card" ref="reservationsDwellTime">
                            <h3>Thời gian ở lại TB</h3>
                            <p>{{ stats.current.dwellTime || 0 }} phút</p>
                            <span class="trend"
                                :class="getTrendClass(stats.current.dwellTime || 0, stats.previous.dwellTime || 0)">
                                {{ getTrend(stats.current.dwellTime || 0, stats.previous.dwellTime || 0) }}
                            </span>
                            <button class="export-image-button"
                                @click="exportSectionImage('reservationsDwellTime', 'ThoiGianOLaiTB')">
                                <i class="fas fa-camera"></i> Xuất ảnh
                            </button>
                        </div>
                    </div>
                    <div class="stats-group">
                        <div class="stat-card" ref="reservationsServedCustomers">
                            <h3>Số khách phục vụ</h3>
                            <apexchart
                                v-if="Array.isArray(stats.current.servedCustomersData) && stats.current.servedCustomersData.length"
                                type="bar" height="300" :options="chartOptionsServed" :series="seriesServed">
                            </apexchart>
                            <p v-else class="no-data">Không có dữ liệu</p>
                            <button class="export-image-button"
                                @click="exportSectionImage('reservationsServedCustomers', 'SoKhachPhucVu')">
                                <i class="fas fa-camera"></i> Xuất ảnh
                            </button>
                        </div>
                        <div class="stat-card" ref="reservationsPopularTimes">
                            <h3>Thời gian đặt bàn phổ biến</h3>
                            <apexchart
                                v-if="Array.isArray(stats.current.popularBookingTimes) && stats.current.popularBookingTimes.length"
                                type="bar" height="300" :options="chartOptionsPopular" :series="seriesPopular">
                            </apexchart>
                            <p v-else class="no-data">Không có dữ liệu</p>
                            <button class="export-image-button"
                                @click="exportSectionImage('reservationsPopularTimes', 'ThoiGianDatBanPhoBien')">
                                <i class="fas fa-camera"></i> Xuất ảnh
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import axios from 'axios';
import Navigation from '../../components/Navigation.vue';
import VueApexCharts from 'vue3-apexcharts';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';

export default defineComponent({
    name: "DashboardManagement",
    components: { Navigation, apexchart: VueApexCharts },
    data() {
        return {
            stats: {
                current: {
                    dailyRevenue: 0, totalBookings: 0, bookingSuccessRate: 0, dailyCustomers: 0,
                    avgServeTime: 0, servingCustomers: 0, cancelledOrders: 0, totalRevenue: 0,
                    monthlyRevenue: [], weeklyRevenue: [], hourlyRevenue: [], revenueByCategory: [], forecastRevenue: 0,
                    topDishes: [], leastSoldDish: { name: "", sold: 0, revenue: 0, image: "" },
                    newCustomers: 0, returningCustomers: 0, topPotentialCustomers: [],
                    confirmedBookings: 0, cancelledBookings: 0, dwellTime: 0,
                    servedCustomersData: [], popularBookingTimes: [],
                },
                previous: {
                    dailyRevenue: 0, totalBookings: 0, bookingSuccessRate: 0, dailyCustomers: 0,
                    avgServeTime: 0, servingCustomers: 0, cancelledOrders: 0, totalRevenue: 0,
                    monthlyRevenue: [], weeklyRevenue: [], hourlyRevenue: [], revenueByCategory: [], forecastRevenue: 0,
                    topDishes: [], leastSoldDish: { name: "", sold: 0, revenue: 0, image: "" },
                    newCustomers: 0, returningCustomers: 0, topPotentialCustomers: [],
                    confirmedBookings: 0, cancelledBookings: 0, dwellTime: 0,
                    servedCustomersData: [], popularBookingTimes: [],
                },
            },
            categoryDishes: {},
            expandedCategory: null,
            selectedCustomer: null,
            selectedDish: null,
            uploadMessage: '',
            isSidebarCollapsed: false,
            filterCategory: "tong-quan",
            currentDateTime: "",
            dateFilterType: "month",
            selectedMonthYear: "",
            startDate: "",
            endDate: "",
            isLoading: false,
            errorMessage: "",
            updateDateTimeInterval: null,
            defaultImage: 'https://res.cloudinary.com/drem0ihib/image/upload/v1746546155/Logo_uujqeu.png',
            cloudinaryUploadPreset: 'Upload',
            cloudinaryCloudName: 'drem0ihib',
            chartOptionsMonthly: {
                chart: { type: 'line', height: 200, toolbar: { show: false } },
                xaxis: { categories: [] },
                yaxis: { labels: { formatter: val => `${(val / 1000000).toFixed(1)}M` } },
                colors: ['#d4af37'],
                tooltip: { y: { formatter: val => `${val.toLocaleString('vi-VN')} VNĐ` } }
            },
            chartOptionsWeekly: {
                chart: { type: 'bar', height: 300, toolbar: { show: false } },
                xaxis: { categories: [] },
                yaxis: { labels: { formatter: val => `${(val / 1000000).toFixed(1)}M` } },
                colors: ['#4a90e2'],
                tooltip: { y: { formatter: val => `${val.toLocaleString('vi-VN')} VNĐ` } }
            },
            chartOptionsHourly: {
                chart: { type: 'area', height: 300, toolbar: { show: false } },
                xaxis: { categories: [] },
                yaxis: { labels: { formatter: val => `${(val / 1000000).toFixed(1)}M` } },
                colors: ['#f7d794'],
                stroke: { curve: 'smooth' },
                tooltip: { y: { formatter: val => `${val.toLocaleString('vi-VN')} VNĐ` } }
            },
            chartOptionsCategory: {
                chart: { type: 'donut', height: 300, toolbar: { show: false } },
                labels: [],
                colors: ['#d4af37', '#4a90e2', '#f7d794'],
                tooltip: { y: { formatter: val => `${val.toLocaleString('vi-VN')} VNĐ` } }
            },
            chartOptionsServed: {
                chart: { type: 'bar', height: 300, toolbar: { show: false } },
                xaxis: { categories: [] },
                colors: ['#2ecc71']
            },
            chartOptionsPopular: {
                chart: { type: 'bar', height: 300, toolbar: { show: false } },
                xaxis: { categories: [] },
                colors: ['#e67e22']
            },
            seriesMonthly: [{ name: 'Doanh thu', data: [] }],
            seriesWeekly: [{ name: 'Doanh thu', data: [] }],
            seriesHourly: [{ name: 'Doanh thu', data: [] }],
            seriesCategory: [],
            seriesServed: [{ name: 'Số khách', data: [] }],
            seriesPopular: [{ name: 'Số lần', data: [] }],
        };
    },
    methods: {
        async fetchStats() {
            console.log('Bắt đầu fetchStats, filterCategory:', this.filterCategory);
            this.isLoading = true;
            this.errorMessage = "";
            try {
                const params = {};
                if (this.dateFilterType === 'month' && this.selectedMonthYear) {
                    const [year, month] = this.selectedMonthYear.split('-');
                    params.month = month;
                    params.year = year;
                } else if (this.dateFilterType === 'custom' && this.startDate && this.endDate) {
                    params.startDate = this.startDate;
                    params.endDate = this.endDate;
                }
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
                }
                const endpoint = {
                    'tong-quan': 'overview', 'doanh-thu': 'revenue', 'mon-an': 'dishes',
                    'khach-hang': 'customers', 'dat-ban': 'reservations',
                }[this.filterCategory];
                const response = await axios.get(`http://localhost:3000/dashboard/${endpoint}`, {
                    params,
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(error => {
                    throw error.response?.data?.details || error.message;
                });

                const defaultStats = {
                    current: {
                        dailyRevenue: 0, totalBookings: 0, bookingSuccessRate: 0, dailyCustomers: 0,
                        avgServeTime: 0, servingCustomers: 0, cancelledOrders: 0, totalRevenue: 0,
                        monthlyRevenue: [], weeklyRevenue: [], hourlyRevenue: [], revenueByCategory: [], forecastRevenue: 0,
                        topDishes: [], leastSoldDish: { name: "", sold: 0, revenue: 0, image: "" },
                        newCustomers: 0, returningCustomers: 0, topPotentialCustomers: [],
                        confirmedBookings: 0, cancelledBookings: 0, dwellTime: 0,
                        servedCustomersData: [], popularBookingTimes: [],
                    },
                    previous: {
                        dailyRevenue: 0, totalBookings: 0, bookingSuccessRate: 0, dailyCustomers: 0,
                        avgServeTime: 0, servingCustomers: 0, cancelledOrders: 0, totalRevenue: 0,
                        monthlyRevenue: [], weeklyRevenue: [], hourlyRevenue: [], revenueByCategory: [], forecastRevenue: 0,
                        topDishes: [], leastSoldDish: { name: "", sold: 0, revenue: 0, image: "" },
                        newCustomers: 0, returningCustomers: 0, topPotentialCustomers: [],
                        confirmedBookings: 0, cancelledBookings: 0, dwellTime: 0,
                        servedCustomersData: [], popularBookingTimes: [],
                    },
                };

                // Đảm bảo dữ liệu từ API được gán đúng
                this.stats = {
                    current: {
                        ...defaultStats.current,
                        ...(response.data?.current || {}),
                        // Đảm bảo các giá trị không bị undefined
                        newCustomers: response.data?.current?.newCustomers ?? 0,
                        returningCustomers: response.data?.current?.returningCustomers ?? 0,
                        topPotentialCustomers: response.data?.current?.topPotentialCustomers || [],
                    },
                    previous: {
                        ...defaultStats.previous,
                        ...(response.data?.previous || {}),
                        newCustomers: response.data?.previous?.newCustomers ?? 0,
                        returningCustomers: response.data?.previous?.returningCustomers ?? 0,
                        topPotentialCustomers: response.data?.previous?.topPotentialCustomers || [],
                    },
                };

                if (this.filterCategory === 'khach-hang' && this.stats.current.topPotentialCustomers) {
                    this.stats.current.topPotentialCustomers.sort((a, b) => {
                        if (b.totalBill !== a.totalBill) return b.totalBill - a.totalBill;
                        return b.visits - a.visits;
                    });
                    this.stats.current.topPotentialCustomers = this.stats.current.topPotentialCustomers.slice(0, 3);
                    this.stats.current.topPotentialCustomers.forEach((customer, index) => {
                        customer.rank = index + 1;
                    });
                }

                console.log('Dữ liệu stats sau khi fetch:', this.stats);

                if (['doanh-thu', 'mon-an'].includes(this.filterCategory)) {
                    await this.fetchCategoryDetails(params);
                }
                this.updateCharts();
            } catch (error) {
                console.error('Lỗi fetchStats:', error);
                this.errorMessage = error.response?.status === 401 || error.response?.status === 403
                    ? "Phiên làm việc hết hạn hoặc bị từ chối truy cập."
                    : `Lỗi server: ${error.message || 'Không thể tải dữ liệu'}`;
                if (error.response?.status === 401 || error.response?.status === 403) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                    this.$router.push('/login');
                }
            } finally {
                this.isLoading = false;
                console.log('Kết thúc fetchStats, isLoading:', this.isLoading);
            }
        },
        async fetchCategoryDetails(params) {
            console.log('Bắt đầu fetchCategoryDetails');
            this.categoryDishes = {};
            try {
                const token = localStorage.getItem('token');
                for (const category of this.stats.current.revenueByCategory || []) {
                    const response = await axios.get(`http://localhost:3000/dashboard/category-dishes`, {
                        params: { ...params, category: category.category },
                        headers: { Authorization: `Bearer ${token}` }
                    }).catch(error => {
                        throw error.response?.data?.details || error.message;
                    });
                    this.categoryDishes[category.category] = response.data.dishes || [];
                }
                console.log('Dữ liệu categoryDishes:', this.categoryDishes);
            } catch (error) {
                console.error('Error fetching category details:', error);
                this.errorMessage = `Không thể tải chi tiết danh mục món ăn: ${error.message || 'Lỗi không xác định'}`;
            }
        },
        async exportSectionImage(refName, fileName) {
            try {
                this.isLoading = true;
                const element = this.$refs[refName];

                if (!element) {
                    throw new Error(`Element with ref ${refName} not found`);
                }

                // Tạo một phần tử tạm thời để chứa dữ liệu chi tiết
                const tempContainer = document.createElement('div');
                tempContainer.style.padding = '20px';
                tempContainer.style.backgroundColor = '#2a2a2a';
                tempContainer.style.color = '#e0e0e0';
                tempContainer.style.fontFamily = 'Arial, sans-serif';
                tempContainer.style.width = '800px';
                tempContainer.style.border = '1px solid #444';
                tempContainer.style.borderRadius = '10px';
                tempContainer.style.position = 'relative'; // Để định vị logo

                // Thêm logo
                const title = fileName.replace(/([A-Z])/g, ' $1').trim();
                const dateRange = this.dateFilterType === 'month'
                    ? `Tháng ${this.selectedMonthYear.split('-')[1]}/${this.selectedMonthYear.split('-')[0]}`
                    : `${this.startDate} - ${this.endDate}`;
                const currentDate = new Date().toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                });

                let content = `
          <div style="position: relative; margin-bottom: 20px;">
            <img src="${this.defaultImage}" alt="Logo" style="position: absolute; top: 0; left: 0; width: 50px; height: 50px; object-fit: contain;" />
            <h2 style="color: #d4af37; text-align: center; font-size: 1.5rem; margin: 0 0 10px 0;">${title}</h2>
            <p style="margin-bottom: 15px; font-size: 1rem; color: #b0b0b0; text-align: center;">
              Ngày thống kê: ${dateRange} | Ngày xuất: ${currentDate}
            </p>
          </div>
          <hr style="border: 0; border-top: 1px solid #444; margin: 15px 0;">
        `;

                // Thêm nội dung chi tiết dựa trên refName
                if (refName === 'topCustomers') {
                    content += '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">';
                    content += '<thead><tr style="background-color: #333; color: #d4af37;"><th style="padding: 10px; text-align: left;">Tên khách hàng</th><th style="padding: 10px; text-align: left;">Tổng hóa đơn</th><th style="padding: 10px; text-align: left;">Số lượt quay lại</th><th style="padding: 10px; text-align: left;">Số điện thoại</th></tr></thead>';
                    content += '<tbody>';
                    (this.stats.current.topPotentialCustomers || []).forEach(customer => {
                        content += `<tr style="border-bottom: 1px solid #444;">
              <td style="padding: 10px;">${customer.name}</td>
              <td style="padding: 10px;">${this.formatCurrency(customer.totalBill)}</td>
              <td style="padding: 10px;">${customer.visits} lượt</td>
              <td style="padding: 10px;">${customer.phone || 'Chưa có thông tin'}</td>
            </tr>`;
                    });
                    content += '</tbody></table>';
                } else if (refName === 'customersNew' || refName === 'customersReturning') {
                    const metric = refName === 'customersNew' ? 'Khách hàng mới' : 'Khách hàng quay lại';
                    content += `<p style="font-size: 1.2rem; margin-bottom: 10px;">${metric}: ${this.stats.current[refName.replace('customers', '').toLowerCase()]}</p>`;
                    content += `<p style="font-size: 1rem; color: #b0b0b0;">Trước: ${this.stats.previous[refName.replace('customers', '').toLowerCase()]}</p>`;
                } else {
                    content += element.innerHTML;
                }

                tempContainer.innerHTML = content;
                document.body.appendChild(tempContainer);

                const canvas = await html2canvas(tempContainer, {
                    backgroundColor: '#2a2a2a',
                    scale: 2,
                    useCORS: true,
                });

                document.body.removeChild(tempContainer);

                const imageData = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = imageData;
                link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.png`;
                link.click();

                this.errorMessage = `Ảnh đã được xuất thành công: ${link.download}`;
            } catch (error) {
                console.error('Error exporting image:', error);
                this.errorMessage = `Lỗi khi xuất ảnh: ${error.message}`;
            } finally {
                this.isLoading = false;
            }
        },
        async handleImageUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            this.uploadMessage = 'Đang upload ảnh...';
            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', this.cloudinaryUploadPreset);
                formData.append('folder', 'restaurant_menu');

                const response = await axios.post(
                    `https://api.cloudinary.com/v1_1/${this.cloudinaryCloudName}/image/upload`,
                    formData
                );

                if (response.data.secure_url) {
                    this.uploadMessage = 'Upload ảnh thành công!';
                    const newImageUrl = response.data.secure_url;
                    const publicId = response.data.public_id;

                    await this.updateDishImage(this.selectedDish, newImageUrl, publicId);

                    this.selectedDish.image = newImageUrl;
                    this.stats.current.topDishes = this.stats.current.topDishes.map(dish =>
                        dish.name === this.selectedDish.name ? { ...dish, image: newImageUrl } : dish
                    );
                    if (this.stats.current.leastSoldDish.name === this.selectedDish.name) {
                        this.stats.current.leastSoldDish.image = newImageUrl;
                    }
                } else {
                    throw new Error('Failed to upload image to Cloudinary');
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                this.uploadMessage = `Lỗi khi upload ảnh: ${error.message}`;
            }
        },
        async updateDishImage(dish, newImageUrl, publicId) {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:3000/menu', {
                    params: { search: dish.name },
                    headers: { Authorization: `Bearer ${token}` }
                });

                const menuItem = response.data.menuItems.find(item => item.name === dish.name);
                if (!menuItem) {
                    throw new Error('Không tìm thấy món ăn trong menu');
                }

                await axios.patch(`http://localhost:3000/menu/${menuItem.menu_id}`, {
                    image: newImageUrl,
                    imagePublicId: publicId
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log('Cập nhật ảnh món ăn thành công');
            } catch (error) {
                console.error('Error updating dish image:', error);
                this.uploadMessage = `Lỗi khi cập nhật ảnh món ăn: ${error.message}`;
            }
        },
        toggleCategoryDetails(category) {
            console.log('Toggling category:', category);
            this.expandedCategory = this.expandedCategory === category ? null : category;
        },
        exportReport() {
            const csvContent = this.generateCsvContent();
            const bom = new Uint8Array([0xEF, 0xBB, 0xBF]); // Thêm BOM cho UTF-8
            const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, `report_${this.filterCategory}_${new Date().toISOString().split('T')[0]}.csv`);
        },

        generateCsvContent() {
            let headers = [];
            let rows = [];
            let content = '';

            // Thêm tiêu đề báo cáo
            content += `BÁO CÁO ${this.filterCategory.replace(/-/g, ' ').toUpperCase()} - ${new Date().toLocaleDateString('vi-VN')}\n`;
            content += '\n';

            if (this.filterCategory === 'tong-quan') {
                headers = ['Metric', 'Current', 'Previous', 'Trend'];
                rows = [
                    ['Daily Revenue', this.formatCurrency(this.stats.current.dailyRevenue), this.formatCurrency(this.stats.previous.dailyRevenue), this.getTrend(this.stats.current.dailyRevenue, this.stats.previous.dailyRevenue)],
                    ['Total Bookings', this.stats.current.totalBookings, this.stats.previous.totalBookings, this.getTrend(this.stats.current.totalBookings, this.stats.previous.totalBookings)],
                    ['Daily Customers', this.stats.current.dailyCustomers, this.stats.previous.dailyCustomers, this.getTrend(this.stats.current.dailyCustomers, this.stats.previous.dailyCustomers)],
                    ['Avg Serve Time', `${this.stats.current.avgServeTime} min`, `${this.stats.previous.avgServeTime} min`, this.getTrend(this.stats.current.avgServeTime, this.stats.previous.avgServeTime)],
                    ['Serving Customers', this.stats.current.servingCustomers, this.stats.previous.servingCustomers, this.getTrend(this.stats.current.servingCustomers, this.stats.previous.servingCustomers)],
                    ['Cancelled Orders', this.stats.current.cancelledOrders, this.stats.previous.cancelledOrders, this.getTrend(this.stats.current.cancelledOrders, this.stats.previous.cancelledOrders)],
                ];
            } else if (this.filterCategory === 'doanh-thu') {
                // Tổng doanh thu và dự báo
                headers = ['Metric', 'Value'];
                rows = [
                    ['Total Revenue', this.formatCurrency(this.stats.current.totalRevenue)],
                    ['Forecast Revenue', this.formatCurrency(this.stats.current.forecastRevenue)],
                ];
                content += headers.join(',') + '\n';
                rows.forEach(row => content += row.join(',') + '\n');
                content += '\n';

                // Doanh thu hàng tháng
                content += 'Monthly Revenue\n';
                headers = ['Month', 'Revenue'];
                rows = (this.stats.current.monthlyRevenue || []).map(r => [r.month, this.formatCurrency(r.revenue)]);
                content += headers.join(',') + '\n';
                rows.forEach(row => content += row.join(',') + '\n');
                content += '\n';

                // Doanh thu hàng tuần
                content += 'Weekly Revenue\n';
                headers = ['Day', 'Revenue'];
                rows = (this.stats.current.weeklyRevenue || []).map(r => [r.day, this.formatCurrency(r.revenue)]);
                content += headers.join(',') + '\n';
                rows.forEach(row => content += row.join(',') + '\n');
                content += '\n';

                // Doanh thu theo giờ
                content += 'Hourly Revenue\n';
                headers = ['Hour', 'Revenue'];
                rows = (this.stats.current.hourlyRevenue || []).map(r => [r.hour, this.formatCurrency(r.revenue)]);
                content += headers.join(',') + '\n';
                rows.forEach(row => content += row.join(',') + '\n');
                content += '\n';

                // Doanh thu theo danh mục
                content += 'Revenue by Category\n';
                headers = ['Category', 'Revenue'];
                rows = (this.stats.current.revenueByCategory || []).map(c => [c.category, this.formatCurrency(c.revenue)]);
                content += headers.join(',') + '\n';
                rows.forEach(row => content += row.join(',') + '\n');

                return content; // Trả về ngay để tránh thêm lặp lại
            } else if (this.filterCategory === 'mon-an') {
                // Top món ăn
                headers = ['Metric', 'Name', 'Sold', 'Revenue'];
                rows = (this.stats.current.topDishes || []).map(d => ['Top Dish', d.name, d.sold, this.formatCurrency(d.revenue)]);
                rows.push(['Least Sold Dish', this.stats.current.leastSoldDish.name, this.stats.current.leastSoldDish.sold, this.formatCurrency(this.stats.current.leastSoldDish.revenue)]);
                content += headers.join(',') + '\n';
                rows.forEach(row => content += row.join(',') + '\n');
                content += '\n';

                // Doanh thu theo danh mục
                content += 'Revenue by Category\n';
                headers = ['Category', 'Revenue'];
                rows = (this.stats.current.revenueByCategory || []).map(c => [c.category, this.formatCurrency(c.revenue)]);
                content += headers.join(',') + '\n';
                rows.forEach(row => content += row.join(',') + '\n');

                return content; // Trả về ngay để tránh thêm lặp lại
            } else if (this.filterCategory === 'khach-hang') {
                headers = ['Name', 'Total Bill', 'Visits', 'Phone'];
                rows = (this.stats.current.topPotentialCustomers || []).map(c => [
                    c.name,
                    this.formatCurrency(c.totalBill),
                    `${c.visits} lượt`,
                    c.phone || 'Chưa có thông tin'
                ]);
            } else if (this.filterCategory === 'dat-ban') {
                headers = ['Metric', 'Current', 'Previous', 'Trend'];
                rows = [
                    ['Total Bookings', this.stats.current.totalBookings, this.stats.previous.totalBookings, this.getTrend(this.stats.current.totalBookings, this.stats.previous.totalBookings)],
                    ['Confirmed Bookings', this.stats.current.confirmedBookings, this.stats.previous.confirmedBookings, this.getTrend(this.stats.current.confirmedBookings, this.stats.previous.confirmedBookings)],
                    ['Cancelled Bookings', this.stats.current.cancelledBookings, this.stats.previous.cancelledBookings, this.getTrend(this.stats.current.cancelledBookings, this.stats.previous.cancelledBookings)],
                    ['Dwell Time', `${this.stats.current.dwellTime} min`, `${this.stats.previous.dwellTime} min`, this.getTrend(this.stats.current.dwellTime, this.stats.previous.dwellTime)],
                ];
            }

            // Thêm headers và rows vào content nếu không phải các trường hợp đặc biệt
            content += headers.join(',') + '\n';
            rows.forEach(row => content += row.join(',') + '\n');

            return content;
        },
        updateCharts() {
            this.chartOptionsWeekly.xaxis.categories = (this.stats.current.weeklyRevenue || []).map(r => r.day) || [];
            this.seriesWeekly[0].data = (this.stats.current.weeklyRevenue || []).map(r => r.revenue || 0) || [];

            this.chartOptionsHourly.xaxis.categories = (this.stats.current.hourlyRevenue || []).map(r => r.hour) || [];
            this.seriesHourly[0].data = (this.stats.current.hourlyRevenue || []).map(r => r.revenue || 0) || [];

            this.chartOptionsCategory.labels = (this.stats.current.revenueByCategory || []).map(c => c.category) || [];
            this.seriesCategory = (this.stats.current.revenueByCategory || []).map(c => c.revenue || 0) || [];

            this.chartOptionsServed.xaxis.categories = (this.stats.current.servedCustomersData || []).map(c => c.timeSlot) || [];
            this.seriesServed[0].data = (this.stats.current.servedCustomersData || []).map(c => c.count || 0) || [];

            this.chartOptionsPopular.xaxis.categories = (this.stats.current.popularBookingTimes || []).map(t => t.time) || [];
            this.seriesPopular[0].data = (this.stats.current.popularBookingTimes || []).map(t => t.count || 0) || [];

            this.chartOptionsMonthly.xaxis.categories = (this.stats.current.monthlyRevenue || []).map(m => m.month) || [];
            this.seriesMonthly[0].data = (this.stats.current.monthlyRevenue || []).map(m => m.revenue || 0) || [];
        },
        formatCurrency(value) {
            return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);
        },
        getTrend(current, previous) {
            if (previous === 0) return current > 0 ? 'Tăng mới' : 'Không đổi';
            const change = ((current - previous) / previous * 100).toFixed(1);
            return change > 0 ? `Tăng ${change}%` : change < 0 ? `Giảm ${Math.abs(change)}%` : 'Không đổi';
        },
        getTrendClass(current, previous) {
            if (previous === 0) return current > 0 ? 'trend-up' : 'trend-neutral';
            return (current - previous) / previous > 0 ? 'trend-up' : (current - previous) / previous < 0 ? 'trend-down' : 'trend-neutral';
        },
        updateDateTime() {
            this.currentDateTime = new Date().toLocaleString("vi-VN", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "numeric" });
        },
        handleSidebarToggle(isCollapsed) {
            this.isSidebarCollapsed = isCollapsed;
            this.updateCharts();
        },
        resetDateFilters() {
            this.selectedMonthYear = '';
            this.startDate = '';
            this.endDate = '';
            if (this.dateFilterType === 'month') {
                this.selectedMonthYear = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
            }
            this.fetchStats();
        },
        getImageUrl(image) {
            console.log('URL ảnh:', image);
            if (image && typeof image === 'string' && image.trim() !== '') {
                return image;
            }
            return this.defaultImage;
        },
        onImageError(event) {
            console.log('Lỗi tải ảnh, sử dụng ảnh mặc định');
            event.target.src = this.defaultImage;
        },
        async showCustomerDetails(customerId) {
            console.log('Mở modal chi tiết khách hàng:', customerId);
            const customer = this.stats.current.topPotentialCustomers.find(
                (c) => c.customer_id === customerId
            );
            if (customer) {
                this.selectedCustomer = { ...customer };
            }
        },
        showDishDetails(dish) {
            console.log('Mở modal chi tiết món ăn:', dish);
            this.uploadMessage = '';
            this.selectedDish = {
                ...dish,
                revenue: dish.sold * (dish.price || 0),
                category: dish.category || 'Không xác định'
            };
        },
    },
    created() {
        this.selectedMonthYear = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
        this.fetchStats();
        this.updateDateTime();
        this.updateDateTimeInterval = setInterval(this.updateDateTime, 60000);
    },
    beforeDestroy() {
        clearInterval(this.updateDateTimeInterval);
    },
});
</script>

<style scoped>
.main-container {
    display: flex;
    min-height: 100vh;
    background-color: #FFF8E7;
    font-family: 'Arial', sans-serif;
}

.dashboard {
    flex: 1;
    padding: 0;
    background-color: #FFF8E7;
    transition: all 0.3s ease;
    position: relative;
    margin-left: 280px; /* Khoảng cách cho sidebar */
}

/* Header cố định */
.dashboard-header.fixed-header {
    position: fixed;
    top: 0;
    left: 280px; /* Căn chỉnh theo sidebar */
    right: 0;
    z-index: 1000;
    background: linear-gradient(135deg, #8B5E3C, #6B4226);
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #E7C27D;
    box-shadow: 0 4px 15px rgba(107, 66, 38, 0.3);
    margin: 0;
    transition: left 0.3s ease; /* Hiệu ứng chuyển động khi sidebar toggle */
}

/* Khi sidebar collapsed */
.dashboard.sidebar-collapsed .dashboard-header.fixed-header {
    left: 0;
}

.dashboard.sidebar-collapsed {
    margin-left: 0;
}

/* Nội dung chính với padding-top để tránh bị header che */
.container-content {
    flex: 1;
    margin: 0;
    padding: 180px 0 0 0; /* Thêm padding-top để tránh bị header che */
    background-color: #FFF8E7;
    color: #3B2F2F;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: calc(100vh - 180px);
}

.header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}

.header-top h2 {
    font-size: clamp(1.5rem, 4vw, 1.8rem);
    font-weight: 600;
    color: #FFF8E7;
    text-shadow: 0 0 5px #E7C27D, 0 0 30px #E7C27D;
    margin: 0;
    flex: 1;
    min-width: 200px;
    margin-left: 1cm;
}

.header-top span {
    font-size: clamp(0.9rem, 2vw, 1rem);
    color: #F5E3B3;
    opacity: 0.8;
    white-space: nowrap;
}

.header-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-end;
    flex: 2;
    min-width: 300px;
}

.filter-section {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
}

.filter-section select,
.date-filter select,
.date-filter input {
    padding: 0.5rem;
    border: 1px solid #8B5E3C;
    border-radius: 8px;
    background: rgba(255, 248, 231, 0.8);
    color: #3B2F2F;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    font-weight: 500;
    min-width: 120px;
}

.filter-section select:focus,
.date-filter select:focus,
.date-filter input:focus {
    border-color: #E7C27D;
    outline: none;
    background: #FFF8E7;
    box-shadow: 0 0 0 3px rgba(231, 194, 125, 0.3);
}

.date-filter {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.date-filter label {
    font-size: 0.9rem;
    color: #FFF8E7;
    font-weight: 500;
    white-space: nowrap;
}

.custom-date-range {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.custom-date-range span {
    color: #F5E3B3;
    opacity: 0.8;
    white-space: nowrap;
}

.action-button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 8px;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(107, 66, 38, 0.3);
    border: 1px solid #E7C27D;
    white-space: nowrap;
}

.refresh-button {
    background: #8B5E3C;
    color: #FFF8E7;
}

.refresh-button:hover {
    background: #6B4226;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(107, 66, 38, 0.4);
}

.export-button {
    background: #E7C27D;
    color: #6B4226;
}

.export-button:hover {
    background: #F5E3B3;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(231, 194, 125, 0.4);
}

/* Phần còn lại của CSS giữ nguyên */
.stats-grid {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 0 20px;
}

.stats-group {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.stats-group.full-width {
    grid-template-columns: 1fr;
}

.stat-card {
    background: rgba(255, 248, 231, 0.5);
    padding: 1.5rem;
    border-radius: 12px;
    position: relative;
    transition: all 0.3s ease;
    border: 1px solid rgba(231, 194, 125, 0.3);
    box-shadow: 0 4px 15px rgba(107, 66, 38, 0.2);
}

.stat-card:hover {
    transform: scale(1.03);
    box-shadow: 0 8px 25px rgba(107, 66, 38, 0.3);
    background: rgba(255, 248, 231, 0.6);
}

.stat-card h3 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    color: #6B4226;
    font-weight: bold;
}

.stat-card p {
    font-size: 1.5rem;
    font-weight: 600;
    color: #3B2F2F;
    margin: 0.5rem 0;
}

.card-icon {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    font-size: 1.5rem;
    opacity: 0.7;
    z-index: 1;
    color: #8B5E3C;
}

.revenue-icon {
    color: #388E3C;
}

.booking-icon {
    color: #1976D2;
}

.customer-icon {
    color: #7B1FA2;
}

.time-icon {
    color: #F57C00;
}

.serving-icon {
    color: #D32F2F;
}

.cancel-icon {
    color: #6B4226;
}

.sub-text {
    font-size: 0.9rem;
    color: #3B2F2F;
    opacity: 0.8;
    margin-top: 0.3rem;
    display: block;
    font-weight: 500;
}

.trend {
    font-size: 0.9rem;
    margin-top: 0.5rem;
    display: inline-block;
    font-weight: 500;
}

.trend-up {
    color: #388E3C;
}

.trend-down {
    color: #D32F2F;
}

.trend-neutral {
    color: #3B2F2F;
    opacity: 0.6;
}

.trend-text {
    font-size: 0.9rem;
    color: #3B2F2F;
    opacity: 0.8;
    margin-top: 1rem;
    display: block;
    font-weight: 500;
}

.top-dishes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.dish-item {
    text-align: center;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.3s ease;
    background: rgba(255, 248, 231, 0.3);
    border: 1px solid rgba(231, 194, 125, 0.3);
}

.dish-image,
.dish-image-small {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 0.5rem;
    border: 2px solid #E7C27D;
}

.dish-image-small {
    width: 80px;
    height: 80px;
}

.dish-item span {
    font-size: 1rem;
    color: #3B2F2F;
    display: block;
    margin-bottom: 0.3rem;
    font-weight: 500;
}

.dish-item.gold {
    background: rgba(231, 194, 125, 0.4);
}

.dish-item.silver {
    background: rgba(189, 195, 199, 0.3);
}

.dish-item.bronze {
    background: rgba(205, 127, 50, 0.3);
}

.dish-item:hover {
    background: rgba(231, 194, 125, 0.5);
    transform: translateY(-2px);
}

.avg-revenue,
.sold-count {
    font-size: 0.9rem;
    color: #3B2F2F;
    opacity: 0.8;
    font-weight: 500;
}

.category-details {
    margin-top: 1rem;
}

.category-item {
    margin-bottom: 1rem;
}

.category-item span {
    font-size: 1rem;
    color: #3B2F2F;
    font-weight: 500;
}

.category-item button {
    background: rgba(255, 248, 231, 0.8);
    border: 1px solid #8B5E3C;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    color: #3B2F2F;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
}

.category-item button:hover {
    background: #FFF8E7;
    border-color: #E7C27D;
}

.category-table {
    width: 100%;
    margin-top: 0.5rem;
    border-collapse: collapse;
    display: block;
    max-height: 300px;
    overflow-y: auto;
    color: #3B2F2F;
    background: rgba(255, 248, 231, 0.5);
    border-radius: 8px;
}

.category-table th,
.category-table td {
    padding: 0.5rem;
    text-align: left;
    border-bottom: 1px solid rgba(231, 194, 125, 0.3);
    word-wrap: break-word;
    min-width: 100px;
    font-weight: 500;
}

.category-table th {
    background: rgba(139, 94, 60, 0.3);
    color: #6B4226;
    position: sticky;
    top: 0;
    z-index: 1;
    font-weight: bold;
}

.leastSoldDish img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
    margin: 0.5rem auto;
    display: block;
    border: 2px solid #E7C27D;
}

.leastSoldDish .no-data {
    text-align: center;
    color: #3B2F2F;
    opacity: 0.6;
    font-style: italic;
    padding: 1rem;
    font-weight: 500;
}

.top-customers-list {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.customer-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.8rem;
    margin-bottom: 0.5rem;
    border-radius: 8px;
    background: rgba(255, 248, 231, 0.3);
    transition: all 0.3s ease;
    border: 1px solid rgba(231, 194, 125, 0.3);
}

.customer-item.gold {
    background: rgba(231, 194, 125, 0.4);
}

.customer-item.silver {
    background: rgba(189, 195, 199, 0.3);
}

.customer-item.bronze {
    background: rgba(205, 127, 50, 0.3);
}

.customer-item:hover {
    background: rgba(231, 194, 125, 0.5);
    transform: translateY(-2px);
}

.customer-name {
    font-size: 1.1rem;
    font-weight: 500;
    color: #3B2F2F;
    flex: 1 1 40%;
}

.customer-stats {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1 1 40%;
}

.total-bill {
    font-size: 1rem;
    color: #3B2F2F;
    font-weight: 600;
}

.visits {
    font-size: 1rem;
    color: #3B2F2F;
    opacity: 0.8;
    font-weight: 400;
}

.details-button {
    padding: 0.3rem 0.8rem;
    background: #8B5E3C;
    border: none;
    border-radius: 6px;
    color: #FFF8E7;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
    border: 1px solid #E7C27D;
}

.details-button:hover {
    background: #6B4226;
    transform: scale(1.05);
}

.no-data {
    text-align: center;
    color: #3B2F2F;
    opacity: 0.6;
    font-style: italic;
    padding: 1rem;
    font-weight: 500;
}

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(107, 66, 38, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.spinner {
    border: 4px solid #E7C27D;
    border-top: 4px solid transparent;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.error-message {
    background: #D32F2F;
    color: #FFF8E7;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    text-align: center;
    font-weight: 500;
}

.export-image-button {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: rgba(255, 248, 231, 0.8);
    border: 1px solid #8B5E3C;
    border-radius: 6px;
    padding: 0.3rem 0.6rem;
    color: #3B2F2F;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.8rem;
    z-index: 2;
    transition: all 0.3s ease;
    font-weight: 500;
}

.export-image-button:hover {
    background: #FFF8E7;
    border-color: #E7C27D;
    transform: translateY(-1px);
}

.customer-details-modal,
.dish-details-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(107, 66, 38, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1001;
}

.modal-content {
    background: linear-gradient(135deg, #FFF8E7, #F5E3B3);
    padding: 2rem;
    border-radius: 12px;
    color: #3B2F2F;
    text-align: center;
    width: 90%;
    max-width: 400px;
    max-height: 80vh;
    overflow-y: auto;
    border: 2px solid #E7C27D;
    box-shadow: 0 10px 30px rgba(107, 66, 38, 0.4);
}

.modal-content h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #6B4226;
    font-weight: bold;
}

.modal-content p {
    font-size: 1rem;
    margin: 0.5rem 0;
    color: #3B2F2F;
    font-weight: 500;
}

.modal-content img {
    width: 150px;
    height: 150px;
    object-fit: cover;
    border-radius: 8px;
    margin: 1rem auto;
    display: block;
    border: 2px solid #E7C27D;
}

.modal-content input[type="file"] {
    margin: 1rem auto;
    display: block;
    color: #3B2F2F;
}

.modal-content button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: #8B5E3C;
    border: none;
    border-radius: 8px;
    color: #FFF8E7;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    border: 1px solid #E7C27D;
}

.modal-content button:hover {
    background: #6B4226;
}

.customer-details-modal .modal-content {
    width: 90%;
    max-width: 500px;
    padding: 2rem;
    background: linear-gradient(135deg, #FFF8E7, #F5E3B3);
    border-radius: 12px;
    color: #3B2F2F;
    text-align: left;
    overflow-y: auto;
    border: 2px solid #E7C27D;
}

.customer-details-modal .modal-content p {
    margin: 0.8rem 0;
    font-size: 1.1rem;
    font-weight: 500;
}

.customer-details-modal .modal-content button {
    margin-top: 1.5rem;
    padding: 0.6rem 1.2rem;
    background: #8B5E3C;
    border: none;
    border-radius: 8px;
    color: #FFF8E7;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    border: 1px solid #E7C27D;
}

.customer-details-modal .modal-content button:hover {
    background: #6B4226;
}

.dish-details-modal .modal-content,
.customer-details-modal .modal-content {
    position: relative;
    z-index: 1002;
}

/* Custom scrollbar */
.category-table::-webkit-scrollbar {
    width: 6px;
}

.category-table::-webkit-scrollbar-track {
    background: rgba(231, 194, 125, 0.1);
    border-radius: 3px;
}

.category-table::-webkit-scrollbar-thumb {
    background: #E7C27D;
    border-radius: 3px;
}

.category-table::-webkit-scrollbar-thumb:hover {
    background: #8B5E3C;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
    .dashboard-header.fixed-header {
        padding: 1.5rem;
    }
    
    .header-top {
        gap: 0.8rem;
    }
    
    .header-actions {
        min-width: 250px;
    }
    
    .container-content {
        padding-top: 200px; /* Tăng padding-top cho tablet */
    }
}

@media (max-width: 768px) {
    .dashboard {
        padding: 0;
        margin-left: 0 !important;
    }
    
    .dashboard-header.fixed-header {
        left: 0 !important;
        padding: 1rem;
    }
    
    .header-top {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
    
    .header-top h2 {
        min-width: auto;
        text-align: center;
        width: 100%;
    }
    
    .header-actions {
        min-width: auto;
        width: 100%;
        justify-content: center;
    }
    
    .filter-section {
        justify-content: center;
        width: 100%;
    }
    
    .action-buttons {
        justify-content: center;
        width: 100%;
    }
    
    .customer-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .customer-item span {
        flex: 1 1 100%;
    }

    .customer-item span:nth-child(2) {
        flex: 1 1 100%;
    }

    .stat-card {
        padding: 1rem;
    }

    .modal-content {
        width: 95%;
        padding: 1.5rem;
    }

    .category-table {
        max-height: 200px;
    }

    .leastSoldDish img {
        width: 60px;
        height: 60px;
    }

    .customer-details-modal .modal-content {
        width: 95%;
        max-width: 400px;
        padding: 1.5rem;
    }
    
    .container-content {
        padding-top: 220px; /* Tăng padding-top cho mobile */
    }
}

@media (max-width: 480px) {
    .dashboard-header.fixed-header {
        padding: 0.8rem;
    }
    
    .header-actions {
        flex-direction: column;
        gap: 0.8rem;
    }
    
    .filter-section {
        flex-direction: column;
        width: 100%;
    }
    
    .date-filter {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .action-buttons {
        flex-direction: column;
        width: 100%;
    }
    
    .action-button {
        width: 100%;
        justify-content: center;
    }
    
    .container-content {
        padding-top: 240px; /* Tăng padding-top cho mobile nhỏ */
    }
}
</style>