import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';

function ModalCRUTable({ show, mode, data, tables, onClose, onSubmit }) {
    const isRead = mode === "read";
    const isUpdate = mode === "update";
    const isCreate = mode === "create";

    const formInit = {
        name: '',
        state: 0
    };

    const [form, setForm] = useState(formInit);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            name: data.name || '',
            state: data.state ?? 0
        });
    };

    const validateForm = () => {
        const nameTrim = form.name.trim();

        if (!nameTrim) {
            toast.error('Tên bàn không được để trống');
            return false;
        }

        const isDuplicate = tables.some(t =>
            t.name.toLowerCase() === nameTrim.toLowerCase() &&
            (!data || t.table_id !== data.table_id)
        );

        if (isDuplicate) {
            toast.error('Tên bàn đã tồn tại');
            return false;
        }

        return true;
    };


    const handleSubmit = async () => {
        if (isRead) return onClose();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            await onSubmit({
                name: form.name.trim(),
                state: parseInt(form.state)
            });
        } catch (error) {
            console.error(error);
            toast.error('Đã có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
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
    }, [show, mode, data]);

    return (
        <Modal show={show} onHide={onClose} centered size="sm" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    {isRead && "Xem chi tiết bàn"}
                    {isCreate && "Thêm bàn mới"}
                    {isUpdate && "Chỉnh sửa bàn"}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <form className="row g-3">
                    <div className="col-12">
                        <label className="form-label fw-semibold">
                            Tên bàn <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Nhập tên bàn"
                            value={form.name}
                            disabled={isRead || isSubmitting}
                            onChange={(e) => handleChangeFormValue("name", e.target.value)}
                            maxLength={50}
                        />
                    </div>

                    <div className="col-12">
                        <label className="form-label fw-semibold">Trạng thái</label>
                        {isRead ? (
                            <div className="form-control bg-light">
                                <span className={`badge ${form.state === 0 ? 'bg-success' : 'bg-warning text-dark'}`}>
                                    {form.state === 0 ? 'Trống' : 'Đang dùng'}
                                </span>
                            </div>
                        ) : (
                            <select
                                className="form-select"
                                value={form.state}
                                disabled={isSubmitting}
                                onChange={(e) => handleChangeFormValue("state", e.target.value)}
                            >
                                <option value="0">Trống</option>
                                <option value="1">Đang dùng</option>
                            </select>
                        )}
                    </div>
                </form>
            </Modal.Body>

            <Modal.Footer>
                <Button
                    variant="secondary"
                    onClick={onClose}
                    disabled={isSubmitting}
                >
                    {isRead ? 'Đóng' : 'Hủy'}
                </Button>

                {!isRead && (
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                {isCreate && "Tạo bàn"}
                                {isUpdate && "Lưu thay đổi"}
                            </>
                        )}
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
}

export default ModalCRUTable;
