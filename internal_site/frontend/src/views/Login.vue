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
    background-color: #000;
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
    background: #191919;
    border-radius: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
}

h2 {
    font-size: 2em;
    color: #fff;
    text-align: center;
    transition: .5s ease;
}

.login-box:has(.input-box input:focus) h2 {
    color: #ae9a64;
    text-shadow:
        0 0 15px #ae9a64,
        0 0 30px #ae9a64;
}

.input-box {
    position: relative;
    width: 310px;
    margin: 30px 0;
}

.input-box .input-line {
    position: absolute;
    left: 0;
    width: 100%;
    height: 2.5px;
    background: #fff;
    transition: .5s ease;
}

.login-box:has(.input-box input:focus) .input-box .input-line {
    background: #ae9a64;
    box-shadow: 0 0 10px #ae9a64;
}

.input-box label {
    position: absolute;
    top: 50%;
    left: 5px;
    transform: translateY(-50%);
    font-size: 1em;
    color: #fff;
    pointer-events: none;
    transition: .5s ease;
}

.input-box input:focus~label,
.input-box input:not(:placeholder-shown)~label {
    top: -5px;
}

.login-box:has(.input-box input:focus) label,
.login-box:has(.input-box input:focus) .input-box input,
.login-box:has(.input-box input:focus) .remember-forgot {
    color: #ae9a64;
    text-shadow: 0 0 10px #ae9a64;
}

.input-box input {
    width: 100%;
    height: 40px;
    background: transparent;
    border: none;
    outline: none;
    font-size: 1em;
    color: #fff;
    padding: 0 35px 0 5px;
    transition: .5s ease;
}

.input-box .icon {
    position: absolute;
    right: 8px;
    color: #fff;
    font-size: 1.2em;
    line-height: 57px;
    transition: .5s ease;
}

.login-box:has(.input-box input:valid) .input-box .icon,
.login-box:has(.input-box input:focus) .input-box .icon {
    color: #ae9a64;
    filter: drop-shadow(0 0 5px #ae9a64);
}

.remember-forgot {
    color: #fff;
    font-size: .9em;
    margin: -15px 0 15px;
    display: flex;
    justify-content: space-between;
    transition: .5s ease;
}

.remember-forgot label input {
    accent-color: #fff;
    margin-right: 3px;
    transition: .5s ease;
}

.login-box:has(.input-box input:focus) .remember-forgot label input {
    accent-color: #ae9a64;
}

.remember-forgot a {
    color: #fff;
    text-decoration: none;
    transition: color .5s ease;
}

.remember-forgot a:hover {
    text-decoration: underline;
}

.login-box:has(.input-box input:focus) .remember-forgot a {
    color: #ae9a64;
}

button {
    width: 100%;
    height: 40px;
    background: #fff;
    border: none;
    outline: none;
    border-radius: 40px;
    cursor: pointer;
    font-size: 1em;
    color: #191919;
    font-weight: 500;
    transition: .5s ease;
}

.login-box:has(.input-box input:focus) button {
    background: #ae9a64;
    box-shadow: 0 0 15px #ae9a64, 0 0 15px #ae9a64;
}

.register-link {
    color: #fff;
    font-size: .9em;
    text-align: center;
    margin: 25px 0 10px;
    transition: .5s ease;
}

.login-box:has(.input-box input:focus) .register-link {
    color: #ae9a64;
    text-shadow: 0 0 10px #ae9a64;
}

.register-link p a {
    color: #fff;
    text-decoration: none;
    font-weight: 600;
    transition: color .5s ease;
}

.register-link p a:hover {
    text-decoration: underline;
}

.login-box:has(.input-box input:focus) .register-link p a {
    color: #ae9a64;
}

.login-light {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 500px;
    height: 10px;
    background: #ae9a64;
    border-radius: 20px;
}

.light {
    position: absolute;
    top: -200%;
    left: 0;
    width: 100%;
    height: 950px;
    background: linear-gradient(to bottom, rgba(255, 255, 255, .3) -50%, rgba(255, 255, 255, 0) 90%);
    clip-path: polygon(20% 0, 80% 0, 100% 100%, 0 100%);
    pointer-events: none;
    transition: .5s ease;
}

.login-box:has(.input-box input:focus) .light {
    top: -90%;
}
</style>