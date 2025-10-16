<template>
    <div class="background">
        <div class="login-light"></div>
        <div class="login-box">
            <form @submit.prevent="login">
                <div class="light"></div>
                <h2>Đăng Nhập</h2>
                <div class="input-box">
                    <input type="email" v-model="user.email" placeholder="" required>
                    <label>Email</label>
                    <div class="input-line"></div>
                </div>
                <div class="input-box">
                    <input :type="passwordFieldType" v-model="user.password" placeholder="" required>
                    <label>Mật khẩu</label>
                    <div class="input-line"></div>
                    <span class="toggle-password" @click="togglePasswordVisibility">
                        <i :class="passwordIcon"></i>
                    </span>
                </div>
                <div class="remember-forgot">
                    <label><input type="checkbox"> Ghi nhớ đăng nhập</label>
                    <a href="#">Quên mật khẩu?</a>
                </div>
                <button type="submit" :disabled="loading">
                    <span v-if="loading" class="loading-spinner"></span>
                    {{ loading ? 'Đang đăng nhập...' : 'Đăng Nhập' }}
                </button>
                <div class="register-link">
                    <p>Chưa có tài khoản? <router-link to="/register">Đăng ký ngay</router-link></p>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import api from '../../src/services/api.js';

export default {
    mounted() {
        document.documentElement.style.backgroundColor = '#000';
    },
    data() {
        return {
            user: {
                email: '',
                password: ''
            },
            passwordFieldType: 'password',
            passwordIcon: 'fas fa-eye',
            loading: false
        };
    },
    methods: {
        togglePasswordVisibility() {
            this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
            this.passwordIcon = this.passwordFieldType === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
        },
        async login() {
            // Reset trạng thái
            this.loading = true;
            
            // Kiểm tra dữ liệu đầu vào
            if (!this.user.email || !this.user.password) {
                alert("Vui lòng nhập đầy đủ email và mật khẩu!");
                this.loading = false;
                return;
            }
            
            // Kiểm tra định dạng email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(this.user.email)) {
                alert("Vui lòng nhập địa chỉ email hợp lệ!");
                this.loading = false;
                return;
            }
            
            try {
                const response = await api.login(this.user);
                console.log("API Response:", response.data);

                if (response.status === 200) {
                    // Kiểm tra và chuẩn hóa dữ liệu từ server
                    if (!response.data.token) {
                        throw new Error('Không nhận được token từ server');
                    }
                    if (!response.data.user) {
                        throw new Error('Không nhận được thông tin người dùng từ server');
                    }

                    // Chuẩn hóa dữ liệu user, đảm bảo có user_id
                    const userData = response.data.user;
                    if (!userData.user_id && userData.id) {
                        userData.user_id = userData.id;
                    }
                    if (!userData.user_id) {
                        throw new Error('Dữ liệu người dùng không hợp lệ');
                    }

                    // Lưu token và thông tin user đã chuẩn hóa vào localStorage
                    localStorage.setItem("token", response.data.token);
                    localStorage.setItem("user", JSON.stringify(userData));

                    alert("Đăng nhập thành công!");

                    // Redirect dựa trên role
                    const role = userData.role;
                    if (role === 'manager') {
                        this.$router.push('/manager');
                    } else if (role === 'staff') {
                        this.$router.push('/reserve');
                    } else {
                        console.warn('Role không hợp lệ:', role);
                        this.$router.push('/'); // Default route nếu không có role hợp lệ
                    }
                }
            } catch (error) {
                console.error("Lỗi đăng nhập:", error);

                if (error.response && error.response.data) {
                    console.error("Chi tiết lỗi:", error.response.data);

                    if (Array.isArray(error.response.data.errors)) {
                        const errorMessages = error.response.data.errors.map(err => err.msg).join("\n");
                        alert(errorMessages);
                    } else if (error.response.data.message) {
                        alert(error.response.data.message);
                    } else {
                        alert("Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin đăng nhập.");
                    }
                } else if (error.request) {
                    alert("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet của bạn.");
                } else {
                    alert("Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.");
                }
            } finally {
                this.loading = false;
            }
        }
    }
};
</script>

<style scoped>
.background {
    background-color: #FFF8E7; /* Trắng kem */
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    box-sizing: border-box;
}

.login-box {
    position: relative;
    width: 100%;
    max-width: 380px;
    height: auto;
    min-height: 420px;
    background: linear-gradient(135deg, #8B5E3C, #6B4226); /* Gradient nâu */
    border-radius: 18px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #E7C27D; /* Viền vàng */
    box-shadow: 0 10px 30px rgba(107, 66, 38, 0.3); /* Bóng nâu */
    padding: 30px 25px;
    box-sizing: border-box;
}

h2 {
    font-size: 1.8em;
    color: #FFF8E7; /* Trắng kem */
    text-align: center;
    transition: .5s ease;
    font-weight: bold;
    margin-bottom: 25px;
}

.login-box:has(.input-box input:focus) h2 {
    color: #FFF8E7;
    text-shadow:
        0 0 15px #E7C27D,
        0 0 30px #E7C27D;
}

.input-box {
    position: relative;
    width: 100%;
    max-width: 300px;
    margin: 25px 0;
}

.input-box .input-line {
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2.5px;
    background: #FFF8E7; /* Trắng kem */
    transition: .5s ease;
}

.login-box:has(.input-box input:focus) .input-box .input-line {
    background: #E7C27D; /* Vàng nhạt */
    box-shadow: 0 0 10px #E7C27D;
}

.input-box label {
    position: absolute;
    top: 50%;
    left: 5px;
    transform: translateY(-50%);
    font-size: 0.95em;
    color: #FFF8E7; /* Trắng kem */
    pointer-events: none;
    transition: .5s ease;
    font-weight: 500;
    background-color: transparent;
    padding: 0 5px;
}

.input-box input:focus~label,
.input-box input:not(:placeholder-shown)~label {
    top: -8px;
    font-size: 0.85em;
}

.login-box:has(.input-box input:focus) label,
.login-box:has(.input-box input:focus) .input-box input,
.login-box:has(.input-box input:focus) .remember-forgot {
    color: #FFF8E7;
    text-shadow: 0 0 10px #E7C27D;
}

.input-box input {
    width: 100%;
    height: 42px;
    background: rgba(255, 248, 231, 0.2); /* Trắng kem trong suốt */
    border: 1px solid #E7C27D; /* Vàng nhạt */
    outline: none;
    font-size: 0.95em;
    color: #FFF8E7; /* Trắng kem */
    padding: 0 40px 0 15px;
    transition: .5s ease;
    border-radius: 8px;
    font-weight: 500;
    box-sizing: border-box;
}

.input-box input:focus {
    background: rgba(255, 248, 231, 0.3);
    border-color: #F5E3B3; /* Be nhạt */
}

.toggle-password {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #FFF8E7; /* Trắng kem */
    cursor: pointer;
    font-size: 0.9em;
    transition: .5s ease;
    font-weight: 500;
}

.toggle-password:hover {
    color: #E7C27D; /* Vàng nhạt */
}

.remember-forgot {
    color: #FFF8E7; /* Trắng kem */
    font-size: .85em;
    margin: -10px 0 20px;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    transition: .5s ease;
    font-weight: 500;
    gap: 8px;
    width: 100%;
    max-width: 300px;
}

.remember-forgot label {
    display: flex;
    align-items: center;
    white-space: nowrap;
    position: relative;
    top: 0;
    transform: none;
    font-size: 0.85em;
}

.remember-forgot label input {
    accent-color: #E7C27D; /* Vàng nhạt */
    margin-right: 6px;
    transition: .5s ease;
}

.login-box:has(.input-box input:focus) .remember-forgot label input {
    accent-color: #E7C27D;
}

.remember-forgot a {
    color: #FFF8E7; /* Trắng kem */
    text-decoration: none;
    transition: color .5s ease;
    font-weight: 500;
}

.remember-forgot a:hover {
    text-decoration: underline;
    color: #E7C27D; /* Vàng nhạt */
}

.login-box:has(.input-box input:focus) .remember-forgot a {
    color: #FFF8E7;
}

button {
    width: 100%;
    max-width: 300px;
    height: 42px;
    background: #E7C27D; /* Vàng nhạt */
    border: none;
    outline: none;
    border-radius: 40px;
    cursor: pointer;
    font-size: 0.95em;
    color: #6B4226; /* Nâu đất */
    font-weight: 600;
    transition: .5s ease;
    box-shadow: 0 4px 15px rgba(107, 66, 38, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    border: 2px solid #FFF8E7; /* Viền trắng */
}

button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.login-box:has(.input-box input:focus) button:not(:disabled) {
    background: #F5E3B3; /* Be nhạt */
    box-shadow: 0 0 15px #E7C27D, 0 0 15px #E7C27D;
    transform: translateY(-2px);
}

button:not(:disabled):hover {
    background: #F5E3B3; /* Be nhạt */
    transform: translateY(-2px);
}

.loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid #6B4226; /* Nâu đất */
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.register-link {
    color: #FFF8E7; /* Trắng kem */
    font-size: .85em;
    text-align: center;
    margin: 20px 0 5px;
    transition: .5s ease;
    font-weight: 500;
    width: 100%;
    max-width: 300px;
}

.login-box:has(.input-box input:focus) .register-link {
    color: #FFF8E7;
    text-shadow: 0 0 10px #E7C27D;
}

.register-link p a {
    color: #FFF8E7; /* Trắng kem */
    text-decoration: none;
    font-weight: 600;
    transition: color .5s ease;
}

.register-link p a:hover {
    text-decoration: underline;
    color: #E7C27D; /* Vàng nhạt */
}

.login-box:has(.input-box input:focus) .register-link p a {
    color: #FFF8E7;
}

.login-light {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 400px;
    height: 8px;
    background: #E7C27D; /* Vàng nhạt */
    border-radius: 20px;
}

.light {
    position: absolute;
    top: -200%;
    left: 0;
    width: 100%;
    height: 800px;
    background: linear-gradient(to bottom, rgba(231, 194, 125, 0.3) -50%, rgba(231, 194, 125, 0) 90%);
    clip-path: polygon(20% 0, 80% 0, 100% 100%, 0 100%);
    pointer-events: none;
    transition: .5s ease;
}

.login-box:has(.input-box input:focus) .light {
    top: -90%;
}

/* Responsive design */
@media (max-width: 480px) {
    .login-box {
        padding: 25px 20px;
        border-radius: 16px;
        max-width: 340px;
        min-height: 380px;
    }
    
    h2 {
        font-size: 1.6em;
        margin-bottom: 20px;
    }
    
    .input-box {
        margin: 20px 0;
        max-width: 280px;
    }
    
    .remember-forgot {
        max-width: 280px;
        font-size: 0.8em;
    }
    
    button {
        max-width: 280px;
    }
    
    .register-link {
        max-width: 280px;
        font-size: 0.8em;
    }
}

@media (max-width: 360px) {
    .login-box {
        max-width: 320px;
        padding: 20px 15px;
    }
    
    .input-box {
        max-width: 260px;
    }
    
    .remember-forgot {
        max-width: 260px;
    }
    
    button {
        max-width: 260px;
    }
    
    .register-link {
        max-width: 260px;
    }
}
</style>