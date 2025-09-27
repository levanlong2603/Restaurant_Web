<template>
    <div class="background">
        <div class="login-light"></div>
        <div class="login-box">
            <form @submit.prevent="registerUser">
                <div class="light"></div>
                <h2>Register</h2>

                <div class="input-box">
                    <input v-model="user.name" type="text" placeholder="" required />
                    <label>Họ tên</label>
                    <div class="input-line"></div>
                </div>

                <div class="input-box">
                    <input v-model="user.phoneNumber" type="text" placeholder="" required />
                    <label>Số điện thoại</label>
                    <div class="input-line"></div>
                </div>

                <div class="input-box">
                    <input v-model="user.email" type="email" placeholder="" required />
                    <label>Email</label>
                    <div class="input-line"></div>
                </div>

                <div class="input-box">
                    <input v-model="user.address" type="text" placeholder="" required />
                    <label>Địa chỉ</label>
                    <div class="input-line"></div>
                </div>

                <div class="input-box">
                    <input v-model="user.password" type="password" placeholder="" required />
                    <label>Password</label>
                    <div class="input-line"></div>
                </div>

                <button type="submit">Register</button>
                <div class="register-link">
                    <p>Đã có tài khoản? <router-link to="/login">Login</router-link></p>
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
/* Giữ nguyên CSS hiện tại */
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
    height: 580px;
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
    bottom: -2px;
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
    height: 1050px;
    background: linear-gradient(to bottom, rgba(255, 255, 255, .3) -50%, rgba(255, 255, 255, 0) 90%);
    clip-path: polygon(20% 0, 80% 0, 100% 100%, 0 100%);
    pointer-events: none;
    transition: .5s ease;
}

.login-box:has(.input-box input:focus) .light {
    top: -90%;
}
</style>
