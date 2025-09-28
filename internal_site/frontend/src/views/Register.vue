<template>
    <div class="background">
        <div class="register-container">
            <div class="register-header">
                <div class="restaurant-logo">
                    <div class="logo-icon">🍽️</div>
                    <h1>Restaurant Name</h1>
                </div>
                <h2>Create Account</h2>
                <p>Join us for an exceptional dining experience</p>
            </div>
            
            <form @submit.prevent="registerUser" class="register-form">
                <div class="input-group">
                    <input v-model="user.name" type="text" required>
                    <label>Full Name</label>
                    <span class="input-icon">👤</span>
                </div>
                
                <div class="input-group">
                    <input v-model="user.phoneNumber" type="text" required>
                    <label>Phone Number</label>
                    <span class="input-icon">📱</span>
                </div>
                
                <div class="input-group">
                    <input v-model="user.email" type="email" required>
                    <label>Email Address</label>
                    <span class="input-icon">✉️</span>
                </div>
                
                <div class="input-group">
                    <input v-model="user.address" type="text" required>
                    <label>Address</label>
                    <span class="input-icon">🏠</span>
                </div>
                
                <div class="input-group">
                    <input v-model="user.password" type="password" required>
                    <label>Password</label>
                    <span class="input-icon">🔒</span>
                </div>
                
                <button type="submit" class="register-btn">Create Account</button>
                
                <div class="login-link">
                    <p>Already have an account? <router-link to="/login">Sign In</router-link></p>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import api from '../../src/services/api.js';

export default {
    mounted() {
        document.documentElement.style.backgroundColor = '#f9f4f0';
    },
    data() {
        return {
            user: {
                name: "",
                phoneNumber: "",
                email: "",
                address: "",
                password: "",
            },
        };
    },
    methods: {
        async registerUser() {
            try {
                const response = await api.registerUser(this.user);
                console.log("API Response:", response.data);
                alert(response.data.message || "Đăng ký thành công! Yêu cầu đang chờ duyệt.");
                this.$router.push('/login');
            } catch (error) {
                console.error("Lỗi đăng ký:", error);
                if (error.response) {
                    console.error("Chi tiết lỗi từ server:", error.response.data);
                    if (Array.isArray(error.response.data.errors)) {
                        const errorMessages = error.response.data.errors.map(err => err.msg).join("\n");
                        alert(errorMessages);
                    } else if (error.response.data.message) {
                        alert(error.response.data.message);
                    } else {
                        alert("Lỗi từ server: " + error.response.statusText);
                    }
                } else if (error.request) {
                    console.error("Không nhận được phản hồi từ server:", error.request);
                    alert("Không thể kết nối đến server. Vui lòng kiểm tra lại!");
                } else {
                    console.error("Lỗi khi gửi yêu cầu:", error.message);
                    alert("Đăng ký thất bại! Kiểm tra lại dữ liệu hoặc liên hệ quản trị viên.");
                }
            }
        }
    }
};
</script>

<style scoped>
.background {
    background-color: #f9f4f0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    padding: 20px;
}

.register-container {
    background: white;
    width: 450px;
    max-height: 90vh;
    overflow-y: auto;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    position: relative;
}

.register-container::-webkit-scrollbar {
    width: 6px;
}

.register-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.register-container::-webkit-scrollbar-thumb {
    background: #c62828;
    border-radius: 10px;
}

.register-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #c62828, #e53935);
}

.register-header {
    padding: 30px 30px 20px;
    text-align: center;
    background: linear-gradient(to bottom, white 80%, #f9f4f0 100%);
    position: sticky;
    top: 0;
    z-index: 10;
}

.restaurant-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 15px;
}

.logo-icon {
    font-size: 28px;
    margin-right: 10px;
}

.register-header h1 {
    color: #c62828;
    font-size: 24px;
    font-weight: 600;
    margin: 0;
}

.register-header h2 {
    color: #333;
    font-size: 22px;
    margin: 10px 0 5px;
}

.register-header p {
    color: #666;
    font-size: 14px;
    margin: 0;
}

.register-form {
    padding: 0 30px 30px;
}

.input-group {
    position: relative;
    margin-bottom: 20px;
}

.input-group input {
    width: 100%;
    padding: 14px 40px 14px 14px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    transition: all 0.3s;
    background-color: #fafafa;
}

.input-group input:focus {
    outline: none;
    border-color: #c62828;
    background-color: white;
    box-shadow: 0 0 0 2px rgba(198, 40, 40, 0.1);
}

.input-group label {
    position: absolute;
    top: 14px;
    left: 14px;
    color: #999;
    font-size: 16px;
    pointer-events: none;
    transition: all 0.3s;
}

.input-group input:focus + label,
.input-group input:not(:placeholder-shown) + label {
    top: -10px;
    left: 10px;
    font-size: 12px;
    background: white;
    padding: 0 8px;
    color: #c62828;
    font-weight: 500;
}

.input-icon {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 18px;
    color: #999;
}

.input-group input:focus ~ .input-icon {
    color: #c62828;
}

.register-btn {
    width: 100%;
    padding: 14px;
    background: linear-gradient(to right, #c62828, #e53935);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    margin-top: 10px;
    margin-bottom: 20px;
}

.register-btn:hover {
    background: linear-gradient(to right, #a11c1c, #c62828);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(198, 40, 40, 0.3);
}

.register-btn:active {
    transform: translateY(0);
}

.login-link {
    text-align: center;
    font-size: 14px;
    color: #666;
    border-top: 1px solid #eee;
    padding-top: 20px;
}

.login-link a {
    color: #c62828;
    text-decoration: none;
    font-weight: 600;
}

.login-link a:hover {
    text-decoration: underline;
}

/* Password strength indicator */
.password-strength {
    margin-top: 5px;
    font-size: 12px;
    display: flex;
    align-items: center;
}

.strength-bar {
    height: 4px;
    flex-grow: 1;
    margin-left: 10px;
    background: #eee;
    border-radius: 2px;
    overflow: hidden;
}

.strength-fill {
    height: 100%;
    width: 0%;
    transition: all 0.3s;
}

.strength-weak {
    background: #ff5252;
    width: 33%;
}

.strength-medium {
    background: #ffb74d;
    width: 66%;
}

.strength-strong {
    background: #4caf50;
    width: 100%;
}

/* Form validation styles */
.input-group input:invalid:not(:focus):not(:placeholder-shown) {
    border-color: #ff5252;
}

.input-group input:valid:not(:focus):not(:placeholder-shown) {
    border-color: #4caf50;
}

/* Responsive design */
@media (max-width: 480px) {
    .register-container {
        width: 100%;
        margin: 0 auto;
    }
    
    .register-header, .register-form {
        padding-left: 20px;
        padding-right: 20px;
    }
    
    .background {
        padding: 10px;
    }
}

/* Animation for form elements */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.input-group {
    animation: fadeIn 0.5s ease-out forwards;
}

.input-group:nth-child(1) { animation-delay: 0.1s; }
.input-group:nth-child(2) { animation-delay: 0.2s; }
.input-group:nth-child(3) { animation-delay: 0.3s; }
.input-group:nth-child(4) { animation-delay: 0.4s; }
.input-group:nth-child(5) { animation-delay: 0.5s; }
</style>