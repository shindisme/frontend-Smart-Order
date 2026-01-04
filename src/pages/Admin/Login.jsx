import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../../services/authService';
import styles from './Login.module.css';

function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        username: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.username.trim()) {
            toast.error('Vui lòng nhập tài khoản');
            return;
        }

        if (!form.password) {
            toast.error('Vui lòng nhập mật khẩu');
            return;
        }

        try {
            const result = await authService.login(form);

            toast.success(result.message || 'Đăng nhập thành công');

            setTimeout(() => {
                navigate('/admin');
            }, 500);

        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                const message = error.response.data?.message;

                if (status === 400) {
                    toast.error(message || 'Vui lòng nhập đầy đủ thông tin');
                } else if (status === 401) {
                    toast.error(message || 'Tài khoản hoặc mật khẩu không đúng');
                } else if (status === 500) {
                    toast.error('Lỗi server, vui lòng thử lại sau');
                } else {
                    toast.error(message || 'Đăng nhập thất bại');
                }
            } else if (error.request) {
                toast.error('Không thể kết nối đến server');
            } else {
                toast.error('Có lỗi xảy ra, vui lòng thử lại');
            }
        }
    };


    return (
        <div className={styles.wrapper}>
            <div className={styles.grid}>
                {Array.from({ length: 100 }).map((_, i) => (
                    <span key={i}></span>
                ))}
            </div>

            <form className={styles.loginBox} onSubmit={handleSubmit}>
                <div className={styles.logoBox}>
                    <h2>Đăng Nhập</h2>
                    <h2>Hệ Thống Quản Lý</h2>
                </div>

                <div className={styles.inputGroup}>
                    <label>Tài khoản</label>
                    <input
                        type="text"
                        name="username"
                        placeholder="Nhập tài khoản..."
                        value={form.username}
                        onChange={handleChange}
                        autoComplete="username"
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Mật khẩu</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Nhập mật khẩu..."
                        value={form.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                    />
                </div>

                <button type="submit" className={styles.btnSubmit}>
                    Đăng nhập
                </button>
            </form>
        </div>
    );
}

export default Login;
