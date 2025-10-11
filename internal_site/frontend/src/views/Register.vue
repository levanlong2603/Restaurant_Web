<template>
    <div class="background">
        <div class="login-light"></div>
        <div class="login-box">
            <form @submit.prevent="registerUser">
                <div class="light"></div>
                <h2>Đăng Ký</h2>

                <div class="input-box">
                    <input v-model="user.name" type="text" placeholder="" required>
                    <label>Họ tên</label>
                    <div class="input-line"></div>
                </div>

                <div class="input-box">
                    <input v-model="user.phoneNumber" type="text" placeholder="" required>
                    <label>Số điện thoại</label>
                    <div class="input-line"></div>
                </div>

                <div class="input-box">
                    <input v-model="user.email" type="email" placeholder="" required>
                    <label>Email</label>
                    <div class="input-line"></div>
                </div>

                <div class="input-box">
                    <input v-model="user.address" type="text" placeholder="" required>
                    <label>Địa chỉ</label>
                    <div class="input-line"></div>
                </div>

                <div class="input-box">
                    <input :type="showPassword ? 'text' : 'password'" v-model="user.password" placeholder="" required>
                    <label>Mật khẩu</label>
                    <div class="input-line"></div>
                    <span class="toggle-password" @click="showPassword = !showPassword">
                        <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </span>
                </div>

                <div class="input-box">
                    <input :type="showConfirmPassword ? 'text' : 'password'" v-model="confirmPassword" placeholder="" required>
                    <label>Xác nhận mật khẩu</label>
                    <div class="input-line"></div>
                    <span class="toggle-password" @click="showConfirmPassword = !showConfirmPassword">
                        <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </span>
                </div>

                <div v-if="passwordMismatch" class="error-message">
                    Mật khẩu xác nhận không khớp
                </div>

                <button type="submit" :disabled="isSubmitting">
                    <span v-if="isSubmitting" class="loading-spinner"></span>
                    {{ isSubmitting ? 'Đang xử lý...' : 'Đăng Ký' }}
                </button>
                
                <div class="register-link">
                    <p>Đã có tài khoản? <router-link to="/login">Đăng nhập</router-link></p>
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
                name: "",
                phoneNumber: "",
                email: "",
                address: "",
                password: "",
            },
            confirmPassword: "",
            showPassword: false,
            showConfirmPassword: false,
            isSubmitting: false
        };
    },
    computed: {
        passwordMismatch() {
            return this.user.password && this.confirmPassword && this.user.password !== this.confirmPassword;
        }
    },
    methods: {
        async registerUser() {
            // Kiểm tra mật khẩu xác nhận
            if (this.passwordMismatch) {
                alert("Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại!");
                return;
            }

            // Kiểm tra độ mạnh mật khẩu
            if (this.user.password.length < 6) {
                alert("Mật khẩu phải có ít nhất 6 ký tự!");
                return;
            }

            this.isSubmitting = true;

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
            } finally {
                this.isSubmitting = false;
            }
        }
    }
};
</script>

<style scoped>
.background {
    background-color: #c2aa77;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    box-sizing: border-box;
    overflow-y: auto;
}

.login-box {
    position: relative;
    width: 100%;
    max-width: 380px;
    height: auto;
    min-height: 420px;
    background: linear-gradient(135deg, #c2aa77, #b29a67);
    border-radius: 18px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid rgba(251, 207, 103, 0.3);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    padding: 30px 25px;
    box-sizing: border-box;
    margin: 20px 0;
}

h2 {
    font-size: 1.8em;
    color: #2b2b2b;
    text-align: center;
    transition: .5s ease;
    font-weight: bold;
    margin-bottom: 25px;
}

.login-box:has(.input-box input:focus) h2 {
    color: #2b2b2b;
    text-shadow:
        0 0 15px #fbcf67,
        0 0 30px #fbcf67;
}

.input-box {
    position: relative;
    width: 100%;
    max-width: 300px;
    margin: 20px 0;
}

.input-box .input-line {
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2.5px;
    background: #2b2b2b;
    transition: .5s ease;
}

.login-box:has(.input-box input:focus) .input-box .input-line {
    background: #fbcf67;
    box-shadow: 0 0 10px #fbcf67;
}

.input-box label {
    position: absolute;
    top: 50%;
    left: 5px;
    transform: translateY(-50%);
    font-size: 0.95em;
    color: #2b2b2b;
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
.login-box:has(.input-box input:focus) .input-box input {
    color: #2b2b2b;
    text-shadow: 0 0 10px #fbcf67;
}

.input-box input {
    width: 100%;
    height: 42px;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid #fbcf67;
    outline: none;
    font-size: 0.95em;
    color: #2b2b2b;
    padding: 0 40px 0 15px;
    transition: .5s ease;
    border-radius: 8px;
    font-weight: 500;
    box-sizing: border-box;
}

.input-box input:focus {
    background: rgba(255, 255, 255, 0.3);
    border-color: #e5b756;
}

.toggle-password {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #2b2b2b;
    cursor: pointer;
    font-size: 0.9em;
    transition: .5s ease;
    font-weight: 500;
}

.toggle-password:hover {
    color: #fbcf67;
}

.error-message {
    color: #d32f2f;
    font-size: 0.85em;
    margin: -10px 0 15px;
    text-align: center;
    background-color: rgba(211, 47, 47, 0.1);
    padding: 8px;
    border-radius: 4px;
    border-left: 3px solid #d32f2f;
    width: 100%;
    max-width: 300px;
}

button {
    width: 100%;
    max-width: 300px;
    height: 42px;
    background: #fbcf67;
    border: none;
    outline: none;
    border-radius: 40px;
    cursor: pointer;
    font-size: 0.95em;
    color: #2b2b2b;
    font-weight: 600;
    transition: .5s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
}

button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.login-box:has(.input-box input:focus) button:not(:disabled) {
    background: #e5b756;
    box-shadow: 0 0 15px #fbcf67, 0 0 15px #fbcf67;
    transform: translateY(-2px);
}

button:not(:disabled):hover {
    background: #e5b756;
    transform: translateY(-2px);
}

.loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid #2b2b2b;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.register-link {
    color: #2b2b2b;
    font-size: .85em;
    text-align: center;
    margin: 20px 0 5px;
    transition: .5s ease;
    font-weight: 500;
    width: 100%;
    max-width: 300px;
}

.login-box:has(.input-box input:focus) .register-link {
    color: #2b2b2b;
    text-shadow: 0 0 10px #fbcf67;
}

.register-link p a {
    color: #2b2b2b;
    text-decoration: none;
    font-weight: 600;
    transition: color .5s ease;
}

.register-link p a:hover {
    text-decoration: underline;
    color: #fbcf67;
}

.login-box:has(.input-box input:focus) .register-link p a {
    color: #2b2b2b;
}

.login-light {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 400px;
    height: 8px;
    background: #fbcf67;
    border-radius: 20px;
}

.light {
    position: absolute;
    top: -200%;
    left: 0;
    width: 100%;
    height: 800px;
    background: linear-gradient(to bottom, rgba(251, 207, 103, 0.3) -50%, rgba(251, 207, 103, 0) 90%);
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
        margin: 15px 0;
        max-width: 280px;
    }
    
    button {
        max-width: 280px;
    }
    
    .register-link {
        max-width: 280px;
        font-size: 0.8em;
    }
    
    .error-message {
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
    
    button {
        max-width: 260px;
    }
    
    .register-link {
        max-width: 260px;
    }
    
    .error-message {
        max-width: 260px;
    }
}
</style>