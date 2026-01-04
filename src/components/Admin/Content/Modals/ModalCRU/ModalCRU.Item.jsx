import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { FcPlus } from "react-icons/fc";
import { toast } from 'react-toastify';
import MultiSelectGroup from '../../../../common/MultiSelectGroup';

function ModalCRUItem({ show, mode, data, categories = [], groups = [], onClose, onSubmit }) {

    const isRead = mode === "read";
    const isUpdate = mode === "update";
    const isCreate = mode === "create";

    const formInit = {
        name: '',
        price: '',
        description: '',
        is_available: 1,
        img: '',

        category_id: '',
        group_ids: []
    };
    const [form, setForm] = useState(formInit);
    const [previewImg, setPreviewImg] = useState('');

    const resetForm = () => {
        setForm(formInit);
        setPreviewImg('');
    }

    const handleChangeFormValue = (key, value) => {
        setForm(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // set form data
    const setFormDataField = () => {
        if (!data) return;

        setForm({
            name: data.name,
            price: data.price,
            description: data.description || "",
            is_available: data.is_available ? 1 : 0,
            img: data.img || "",

            category_id: data.category_id,
            group_ids: data.group_ids || []
        });

        setPreviewImg(
            data.img ? `${import.meta.env.VITE_IMG_URL}${data.img}` : ""
        );

    };

    // hàm up hình
    const handleUploadImg = (e) => {
        if (isRead) return;

        const file = e.target.files?.[0];
        if (!file) return;

        setPreviewImg(URL.createObjectURL(file));
        handleChangeFormValue("img", file);
    };

    const handleSubmit = () => {
        if (isRead) return onClose();

        //validate
        const price = Number(form.price);
        if (!form.name.trim()) return toast.warn("Tên sản phẩm không được để trống");
        if (isNaN(price) || !form.price) return toast.warn("Giá không được để trống");
        if (price < 0) return toast.warn("Giá phải lớn hơn 0đ");
        if (!form.category_id) return toast.warn("Vui lòng chọn loại sản phẩm");

        //gửi data 
        const formData = new FormData();
        formData.append("name", form.name.trim());
        formData.append("price", form.price);
        formData.append("category_id", form.category_id);
        formData.append("description", form.description.trim());
        formData.append("is_available", form.is_available);

        if (form.img instanceof File) {
            formData.append("img", form.img);
        }

        form.group_ids.forEach(id => {
            formData.append("group_ids", id);
        });

        onSubmit(formData);
    };

    useEffect(() => {
        if (!show) return;

        // tọa mới
        if (isCreate) {
            resetForm();
            return;
        }

        // đọc với update
        if (data && (isUpdate || isRead)) {
            setFormDataField();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, mode, data]);

    return (
        <Modal show={show} onHide={onClose} centered size="lg" backdrop='static'>
            <Modal.Header closeButton>
                <Modal.Title>
                    {isRead && "Xem chi tiết món"}
                    {isCreate && "Thêm món mới"}
                    {isUpdate && "Chỉnh sửa món"}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <form className="row g-3 fw-normal">

                    {/* name */}
                    <div className="col-12">
                        <label className="form-label">Tên sản phẩm</label>
                        <input
                            type="text"
                            className="form-control"
                            value={form.name}
                            disabled={isRead}
                            onChange={(e) => handleChangeFormValue("name", e.target.value)}
                        />
                    </div>

                    {/* price */}
                    <div className="col-md-4">
                        <label className="form-label">Giá</label>
                        <input
                            type="number"
                            className="form-control"
                            value={form.price}
                            disabled={isRead}
                            onChange={(e) => handleChangeFormValue("price", e.target.value)}
                        />
                    </div>

                    {/* status */}
                    <div className="col-md-4">
                        <label className="form-label">Trạng thái</label>
                        <select
                            className="form-select"
                            disabled={isRead}
                            value={form.is_available}
                            onChange={(e) => handleChangeFormValue("is_available", Number(e.target.value))}
                        >
                            <option value={1}>Còn</option>
                            <option value={0}>Hết</option>
                        </select>
                    </div>

                    <div className="col-md-4"></div>

                    {/* category */}
                    <div className="col-md-4">
                        <label className="form-label">Loại</label>
                        <select
                            className="form-select"
                            disabled={isRead}
                            value={form.category_id}
                            onChange={(e) => handleChangeFormValue("category_id", e.target.value)}
                        >
                            <option value=''>-- Loại --</option>
                            {categories.map(c => (
                                <option key={c.category_id} value={c.category_id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* option group */}
                    <div className="col-4">
                        <label className="form-label">Nhóm tùy chọn</label>

                        <MultiSelectGroup
                            isRead={isRead}
                            groups={groups}
                            value={form.group_ids}
                            onChange={(values) => handleChangeFormValue("group_ids", values)}
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
                            onChange={(e) => handleChangeFormValue("description", e.target.value)}
                        />
                    </div>


                    {/* image upload */}
                    <div className="col-md-12">
                        <label></label>
                        {!isRead && (
                            <>
                                <label
                                    className="form-label d-flex gap-2 border p-3 bg-success text-white rounded"
                                    htmlFor="inputFile"
                                    style={{ width: 'fit-content', cursor: 'pointer' }}
                                >
                                    <FcPlus size={24} /> Thêm ảnh
                                </label>
                                <input
                                    id="inputFile"
                                    type="file"
                                    hidden
                                    onChange={handleUploadImg}
                                />
                            </>
                        )}
                    </div>

                    {/* preview */}
                    {previewImg ? (
                        <div className="col-md-12 text-center">
                            <img src={previewImg} width="250" />
                        </div>
                    )
                        : <span className="col-md-12 text-center border border-2 p-5 m-2">Chưa có hình ảnh</span>
                    }

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

export default ModalCRUItem;
