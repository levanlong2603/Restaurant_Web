<template>
    <div class="background">
        <div class="login-container">
            <div class="login-header">
                <div class="restaurant-logo">
                    <div class="logo-icon">🍽️</div>
                    <h1>Restaurant Name</h1>
                </div>
                <h2>Welcome Back</h2>
                <p>Please sign in to your account</p>
            </div>
            
            <form @submit.prevent="login" class="login-form">
                <div class="input-group">
                    <input type="email" v-model="user.email" required>
                    <label>Email Address</label>
                    <span class="input-icon">✉️</span>
                </div>
                
                <div class="input-group">
                    <input type="password" v-model="user.password" required>
                    <label>Password</label>
                    <span class="input-icon">🔒</span>
                </div>
                
                <div class="form-options">
                    <div class="remember-me">
                        <input type="checkbox" id="remember">
                        <label for="remember">Remember me</label>
                    </div>
                    <a href="#" class="forgot-password">Forgot Password?</a>
                </div>
                
                <button type="submit" class="login-btn">Sign In</button>
                
                <div class="register-link">
                    <p>Don't have an account? <router-link to="/register">Create one</router-link></p>
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
                email: '',
                password: ''
            }
        };
    },
    methods: {
        async login() {
            try {
                const response = await api.login(this.user);
                console.log("API Response:", response.data);

                if (response.status === 200) {
                    alert("Đăng nhập thành công!");
                    // Lưu token và thông tin user vào localStorage
                    localStorage.setItem("token", response.data.token);
                    localStorage.setItem("user", JSON.stringify(response.data.user));

                    // Redirect dựa trên role
                    const role = response.data.user.role;
                    if (role === 'manager') {
                        this.$router.push('/manager');
                    } else if (role === 'staff') {
                        this.$router.push('/reserve');
                    } else {
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
                    }
                } else {
                    alert("Đăng nhập thất bại! Kiểm tra lại dữ liệu.");
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
}

.login-container {
    background: white;
    width: 420px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    position: relative;
}

.login-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #c62828, #e53935);
}

.login-header {
    padding: 30px 30px 20px;
    text-align: center;
    background: linear-gradient(to bottom, white 80%, #f9f4f0 100%);
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

.login-header h1 {
    color: #c62828;
    font-size: 24px;
    font-weight: 600;
    margin: 0;
}

.login-header h2 {
    color: #333;
    font-size: 22px;
    margin: 10px 0 5px;
}

.login-header p {
    color: #666;
    font-size: 14px;
    margin: 0;
}

.login-form {
    padding: 0 30px 30px;
}

.input-group {
    position: relative;
    margin-bottom: 25px;
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

.form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    font-size: 14px;
}

.remember-me {
    display: flex;
    align-items: center;
}

.remember-me input {
    margin-right: 8px;
    accent-color: #c62828;
}

.remember-me label {
    color: #666;
    cursor: pointer;
}

.forgot-password {
    color: #c62828;
    text-decoration: none;
    transition: color 0.2s;
}

.forgot-password:hover {
    text-decoration: underline;
    color: #a11c1c;
}

.login-btn {
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
    margin-bottom: 20px;
}

.login-btn:hover {
    background: linear-gradient(to right, #a11c1c, #c62828);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(198, 40, 40, 0.3);
}

.login-btn:active {
    transform: translateY(0);
}

.register-link {
    text-align: center;
    font-size: 14px;
    color: #666;
}

.register-link a {
    color: #c62828;
    text-decoration: none;
    font-weight: 600;
}

.register-link a:hover {
    text-decoration: underline;
}

/* Responsive design */
@media (max-width: 480px) {
    .login-container {
        width: 90%;
        margin: 0 auto;
    }
    
    .login-header, .login-form {
        padding-left: 20px;
        padding-right: 20px;
    }
}
</style>