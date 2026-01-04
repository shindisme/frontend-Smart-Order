import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';

function ModalCRUCategory({ show, mode, data, onClose, onSubmit }) {
    const isRead = mode === 'read';
    const isCreate = mode === 'create';
    const isUpdate = mode === 'update';

    const [name, setName] = useState('');

    const handleSubmit = () => {
        if (!name.trim()) return toast.warn("Tên danh mục không được để trống!");
        onSubmit({ name });
        setName("");
    };

    useEffect(() => {
        if (!show) return;

        if (isCreate) {
            setName("");
        }
        if (data && (isRead || isUpdate)) {
            setName(data.name || "");
        }
    }, [mode, show, data]);

    return (
        <>
            <Modal show={show} onHide={onClose}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isRead && 'Xem chi tiết danh mục'}
                        {isCreate && 'Thêm danh mục mới'}
                        {isUpdate && 'Chỉnh sửa danh mục'}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body >
                    <form className="row g-3 fw-normal">
                        <div className="col-12">
                            <label className="form-label">Tên sản phẩm</label>
                            <input
                                type="text"
                                className="form-control"
                                value={name}
                                disabled={isRead}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                            />
                        </div>

                    </form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>Đóng</Button>

                    {!isRead && (
                        <Button variant="primary" onClick={handleSubmit}>
                            {isCreate && "Thêm"}
                            {isUpdate && "Lưu thay đổi"}
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default ModalCRUCategory