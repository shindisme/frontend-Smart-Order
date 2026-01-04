import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MdPerson, MdEmail, MdLock } from 'react-icons/md';
import authService from '../../services/authService';
import styles from './Profile.module.css';

function Profile() {
    const user = authService.getCurrentUser();

    const [passwordForm, setPasswordForm] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!passwordForm.old_password || !passwordForm.new_password || !passwordForm.confirm_password) {
            toast.error('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        if (passwordForm.new_password !== passwordForm.confirm_password) {
            toast.error('Mật khẩu mới không khớp');
            return;
        }

        if (passwordForm.new_password.length < 6) {
            toast.error('Mật khẩu mới phải ít nhất 6 ký tự');
            return;
        }

        try {
            await authService.changePassword({
                old_password: passwordForm.old_password,
                new_password: passwordForm.new_password
            });

            toast.success('Đổi mật khẩu thành công');
            setPasswordForm({
                old_password: '',
                new_password: '',
                confirm_password: ''
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
        }
    };

    return (
        <div className={styles.profilePage}>
            <div className={styles.header}>
                <h2>Thông tin cá nhân</h2>
            </div>

            <div className={styles.content}>
                <div className={styles.infoCard}>
                    <h3>Thông tin tài khoản</h3>

                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <MdPerson className={styles.icon} />
                            <div className={styles.infoText}>
                                <label>Họ và tên</label>
                                <p>{user?.fullname || 'Chưa cập nhật'}</p>
                            </div>
                        </div>

                        <div className={styles.infoItem}>
                            <MdPerson className={styles.icon} />
                            <div className={styles.infoText}>
                                <label>Tên đăng nhập</label>
                                <p>{user?.username}</p>
                            </div>
                        </div>

                        <div className={styles.infoItem}>
                            <MdEmail className={styles.icon} />
                            <div className={styles.infoText}>
                                <label>Email</label>
                                <p>{user?.email || 'Chưa cập nhật'}</p>
                            </div>
                        </div>

                        <div className={styles.infoItem}>
                            <MdLock className={styles.icon} />
                            <div className={styles.infoText}>
                                <label>Vai trò</label>
                                <p className={styles.roleBadge}>
                                    {user?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.passwordCard}>
                    <h3>Đổi mật khẩu</h3>

                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label>Mật khẩu cũ</label>
                            <input
                                type="password"
                                name="old_password"
                                value={passwordForm.old_password}
                                onChange={handleChange}
                                placeholder="Nhập mật khẩu cũ"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Mật khẩu mới</label>
                            <input
                                type="password"
                                name="new_password"
                                value={passwordForm.new_password}
                                onChange={handleChange}
                                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Xác nhận mật khẩu mới</label>
                            <input
                                type="password"
                                name="confirm_password"
                                value={passwordForm.confirm_password}
                                onChange={handleChange}
                                placeholder="Nhập lại mật khẩu mới"
                            />
                        </div>

                        <button type="submit" className={styles.btnSubmit}>
                            Đổi mật khẩu
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Profile;
