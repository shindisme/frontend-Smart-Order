import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';

function ModalCRUOption({ show, mode, data, groups = [], onClose, onSubmit }) {

    const isRead = mode === "read";
    const isUpdate = mode === "update";
    const isCreate = mode === "create";

    const [form, setForm] = useState({
        name: "",
        group_id: "",
        plus_price: "",
        description: "",
    });

    const handleChange = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = () => {
        //validate
        if (!form.name.trim()) return toast.warn("Tên tùy chọn không được để trống");
        if (!String(form.plus_price).trim()) return toast.warn("Giá thêm không được để trống");
        if (Number(form.plus_price) < 0) return toast.warn("Giá không hợp lệ");
        if (!form.group_id) return toast.warn("Vui lòng nhóm tùy chọn");

        // submit data
        if (isRead) return onClose();

        const formData = new FormData();
        formData.append("name", form.name.trim());
        formData.append("group_id", form.group_id);
        formData.append("plus_price", form.plus_price);
        formData.append("description", form.description.trim());

        onSubmit(formData);
    };

    useEffect(() => {
        if (!show) return;

        if (isCreate) {
            setForm({
                name: "",
                group_id: "",
                plus_price: "",
                description: "",
            });
            return;
        }

        // update voi read
        if (data && (isRead || isUpdate)) {
            setForm({
                name: data.name,
                group_id: data.group_id,
                plus_price: data.plus_price,
                description: data.description || '',
            });
        }
    }, [show, mode, data]);


    return (
        <Modal show={show} onHide={onClose} centered size="xl" backdrop='static'>
            <Modal.Header closeButton>
                <Modal.Title>
                    {isRead && "Xem chi tiết lựa chọn"}
                    {isCreate && "Thêm lựa chọn mới"}
                    {isUpdate && "Chỉnh sửa lựa chọn"}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <form className="row g-3 fw-normal">

                    {/* name */}
                    <div className="col-12">
                        <label className="form-label">Tên lựa chọn</label>
                        <input
                            type="text"
                            className="form-control"
                            value={form.name}
                            disabled={isRead}
                            onChange={(e) => handleChange("name", e.target.value)}
                        />
                    </div>

                    {/* groupOption */}
                    <div className="col-md-6">
                        <label className="form-label">Nhóm</label>
                        <select
                            className="form-select"
                            disabled={isRead}
                            value={form.group_id}
                            onChange={(e) => handleChange("group_id", e.target.value)}
                        >
                            <option value="">-- Nhóm --</option>
                            {groups.map(group => (
                                <option key={group.group_id} value={group.group_id}>{group.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* plusPrice */}
                    <div className="col-md-6">
                        <label className="form-label">Giá</label>
                        <input
                            type="number"
                            className="form-control"
                            value={form.plus_price}
                            disabled={isRead}
                            onChange={(e) => handleChange("plus_price", e.target.value)}
                        />
                    </div>

                    {/* desc */}
                    <div className="col-12">
                        <label className="form-label">Mô tả</label>
                        <textarea
                            rows="3"
                            className="form-control"
                            style={{ resize: "none" }}
                            disabled={isRead}
                            value={form.description}
                            onChange={(e) => handleChange("description", e.target.value)}
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
    );
}

export default ModalCRUOption;
