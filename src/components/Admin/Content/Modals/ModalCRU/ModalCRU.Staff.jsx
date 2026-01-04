import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';

function ModalCRUStaff({ show, mode, data, onClose, onSubmit }) {
    const isRead = mode === "read";
    const isUpdate = mode === "update";
    const isCreate = mode === "create";

    const formInit = {
        username: '',
        fullname: '',
        email: '',
        role: 'staff'
    };

    const [form, setForm] = useState(formInit);

    const resetForm = () => {
        setForm(formInit);
    };

    const handleChangeFormValue = (key, value) => {
        setForm(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const setFormDataField = () => {
        if (!data) return;

        setForm({
            username: data.username,
            fullname: data.fullname,
            email: data.email || '',
            role: data.role
        });
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = () => {
        if (isRead) return onClose();

        // Validation
        if (!form.username.trim()) {
            return toast.warn("Tài khoản không được để trống");
        }

        if (!form.fullname.trim()) {
            return toast.warn("Họ tên không được để trống");
        }

        if (!form.email.trim()) {
            return toast.warn("Email không được để trống");
        }

        if (!validateEmail(form.email.trim())) {
            return toast.warn("Email không hợp lệ");
        }

        if (!form.role) {
            return toast.warn("Vui lòng chọn vai trò");
        }

        const submitData = {
            username: form.username.trim(),
            fullname: form.fullname.trim(),
            email: form.email.trim().toLowerCase(),
            role: form.role
        };

        if (isUpdate) {
            const { username, ...updateData } = submitData;
            onSubmit(updateData);
        } else {
            onSubmit(submitData);
        }
    };

    useEffect(() => {
        if (!show) return;

        if (isCreate) {
            resetForm();
            return;
        }

        if (data && (isUpdate || isRead)) {
            setFormDataField();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, mode, data]);

    return (
        <Modal show={show} onHide={onClose} centered size="lg" backdrop='static'>
            <Modal.Header closeButton>
                <Modal.Title>
                    {isRead && "Xem chi tiết nhân viên"}
                    {isCreate && "Thêm nhân viên mới"}
                    {isUpdate && "Chỉnh sửa nhân viên"}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <form className="row g-3 fw-normal">

                    {/* Username */}
                    <div className="col-md-6">
                        <label className="form-label">
                            Tài khoản
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            value={form.username}
                            disabled={isRead || isUpdate}
                            onChange={(e) => handleChangeFormValue("username", e.target.value)}
                            placeholder="Nhập tài khoản..."
                        />

                    </div>

                    {/* Role */}
                    <div className="col-md-6">
                        <label className="form-label">
                            Vai trò
                        </label>
                        <select
                            className="form-select"
                            disabled={isRead}
                            value={form.role}
                            onChange={(e) => handleChangeFormValue("role", e.target.value)}
                        >
                            <option value="staff">Nhân viên</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    {/* Password */}
                    {isCreate && (
                        <div className="col-12">
                            <div className="alert alert-warning mb-0">
                                <p className="mb-0">
                                    <i className="bi bi-warning-circle me-2"></i>
                                    <strong>Mật khẩu: </strong> sẽ được tạo tự động và hiển thị sau khi tao thành công
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Fullname */}
                    <div className="col-12">
                        <label className="form-label">
                            Họ tên
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            value={form.fullname}
                            disabled={isRead}
                            onChange={(e) => handleChangeFormValue("fullname", e.target.value)}
                            placeholder="Nhập họ tên..."
                        />
                    </div>

                    {/* Email */}
                    <div className="col-12">
                        <label className="form-label">
                            Email
                        </label>
                        <input
                            type="email"
                            className="form-control"
                            value={form.email}
                            disabled={isRead}
                            onChange={(e) => handleChangeFormValue("email", e.target.value)}
                            placeholder="example@gmail.com"
                        />
                    </div>

                    {/* Data created */}
                    {isRead && data && (
                        <div className="col-12">
                            <label className="form-label">Ngày tạo</label>
                            <input
                                type="text"
                                className="form-control"
                                value={new Date(data.created_at).toLocaleString('vi-VN')}
                                disabled
                            />
                        </div>
                    )}

                </form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    {isRead ? "Đóng" : "Hủy"}
                </Button>

                {!isRead && (
                    <Button variant="primary" onClick={handleSubmit}>
                        {isCreate && "Thêm"}
                        {isUpdate && "Lưu"}
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
}

export default ModalCRUStaff;
