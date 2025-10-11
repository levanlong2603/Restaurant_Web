<template>
    <div class="background">
        <div class="login-light"></div>
        <div class="login-box">
            <form @submit.prevent="login">
                <div class="light"></div>
                <h2>Login</h2>
                <div class="input-box">
                    <input type="email" v-model="user.email" placeholder="" required>
                    <label>Email</label>
                    <div class="input-line"></div>
                </div>
                <div class="input-box">
                    <input type="password" v-model="user.password" placeholder="" required>
                    <label>Password</label>
                    <div class="input-line"></div>
                </div>
                <div class="remember-forgot">
                    <label><input type="checkbox"> Remember me</label>
                    <a href="#">Forgot Password?</a>
                </div>
                <button type="submit">Login</button>
                <div class="register-link">
                    <p>Don't have an account? <router-link to="/register">Register</router-link></p>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import api from '../../src/services/api.js' ; // Import api.js

export default {
    mounted() {
        document.documentElement.style.backgroundColor = '#000';
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
    background-color: #c2aa77;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

.login-box {
    position: relative;
    width: 400px;
    height: 450px;
    background: linear-gradient(135deg, #c2aa77, #b29a67);
    border-radius: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid rgba(251, 207, 103, 0.3);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

h2 {
    font-size: 2em;
    color: #2b2b2b;
    text-align: center;
    transition: .5s ease;
    font-weight: bold;
}

.login-box:has(.input-box input:focus) h2 {
    color: #2b2b2b;
    text-shadow:
        0 0 15px #fbcf67,
        0 0 30px #fbcf67;
}

.input-box {
    position: relative;
    width: 310px;
    margin: 30px 0;
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
    font-size: 1em;
    color: #2b2b2b;
    pointer-events: none;
    transition: .5s ease;
    font-weight: 500;
}

.input-box input:focus~label,
.input-box input:not(:placeholder-shown)~label {
    top: -5px;
}

.login-box:has(.input-box input:focus) label,
.login-box:has(.input-box input:focus) .input-box input,
.login-box:has(.input-box input:focus) .remember-forgot {
    color: #2b2b2b;
    text-shadow: 0 0 10px #fbcf67;
}

.input-box input {
    width: 100%;
    height: 40px;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid #fbcf67;
    outline: none;
    font-size: 1em;
    color: #2b2b2b;
    padding: 0 35px 0 15px;
    transition: .5s ease;
    border-radius: 8px;
    font-weight: 500;
}

.input-box input:focus {
    background: rgba(255, 255, 255, 0.3);
    border-color: #e5b756;
}

.input-box .icon {
    position: absolute;
    right: 15px;
    color: #2b2b2b;
    font-size: 1.2em;
    line-height: 57px;
    transition: .5s ease;
}

.login-box:has(.input-box input:valid) .input-box .icon,
.login-box:has(.input-box input:focus) .input-box .icon {
    color: #2b2b2b;
    filter: drop-shadow(0 0 5px #fbcf67);
}

.remember-forgot {
    color: #2b2b2b;
    font-size: .9em;
    margin: -15px 0 15px;
    display: flex;
    justify-content: space-between;
    transition: .5s ease;
    font-weight: 500;
}

.remember-forgot label input {
    accent-color: #fbcf67;
    margin-right: 3px;
    transition: .5s ease;
}

.login-box:has(.input-box input:focus) .remember-forgot label input {
    accent-color: #fbcf67;
}

.remember-forgot a {
    color: #2b2b2b;
    text-decoration: none;
    transition: color .5s ease;
    font-weight: 500;
}

.remember-forgot a:hover {
    text-decoration: underline;
    color: #fbcf67;
}

.login-box:has(.input-box input:focus) .remember-forgot a {
    color: #2b2b2b;
}

button {
    width: 100%;
    height: 40px;
    background: #fbcf67;
    border: none;
    outline: none;
    border-radius: 40px;
    cursor: pointer;
    font-size: 1em;
    color: #2b2b2b;
    font-weight: 600;
    transition: .5s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.login-box:has(.input-box input:focus) button {
    background: #e5b756;
    box-shadow: 0 0 15px #fbcf67, 0 0 15px #fbcf67;
    transform: translateY(-2px);
}

button:hover {
    background: #e5b756;
    transform: translateY(-2px);
}

.register-link {
    color: #2b2b2b;
    font-size: .9em;
    text-align: center;
    margin: 25px 0 10px;
    transition: .5s ease;
    font-weight: 500;
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
    width: 500px;
    height: 10px;
    background: #fbcf67;
    border-radius: 20px;
}

.light {
    position: absolute;
    top: -200%;
    left: 0;
    width: 100%;
    height: 950px;
    background: linear-gradient(to bottom, rgba(251, 207, 103, 0.3) -50%, rgba(251, 207, 103, 0) 90%);
    clip-path: polygon(20% 0, 80% 0, 100% 100%, 0 100%);
    pointer-events: none;
    transition: .5s ease;
}

.login-box:has(.input-box input:focus) .light {
    top: -90%;
}
</style>