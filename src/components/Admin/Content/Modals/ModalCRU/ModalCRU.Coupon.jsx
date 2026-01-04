import { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col, InputGroup } from "react-bootstrap";
import { toast } from "react-toastify";

const INITIAL_FORM = {
    code: '', description: '', type: 0, value: '', min_amount: 0,
    max_discount: '', start_date: '', end_date: '', usage_limit: '', state: 1
};

function ModalCRUCoupon({ show, mode, data, onClose, onSubmit }) {
    const [formData, setFormData] = useState(INITIAL_FORM);
    const isReadOnly = mode === "read";

    useEffect(() => {
        if (data && (mode === "read" || mode === "update")) {
            setFormData({
                ...data,
                max_discount: data.max_discount || '',
                usage_limit: data.usage_limit || '',
                start_date: data.start_date?.split('T')[0] || '',
                end_date: data.end_date?.split('T')[0] || ''
            });
        } else if (mode === "create") {
            setFormData({ ...INITIAL_FORM, start_date: new Date().toISOString().split('T')[0] });
        }
    }, [data, mode, show]);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const validateForm = () => {
        const { code, value, type, max_discount, min_amount, usage_limit, start_date, end_date } = formData;

        if (!code.trim()) return toast.warn('Vui lòng nhập mã coupon'), false;
        if (!value) return toast.warn('Vui lòng nhập giá trị giảm giá'), false;
        if (!start_date) return toast.warn('Vui lòng chọn ngày bắt đầu'), false;
        if (!end_date) return toast.warn('Vui lòng chọn ngày kết thúc'), false;

        const val = parseInt(value);
        if (type == 0) {
            if (val <= 0 || val > 100) return toast.warn('Giá trị % phải từ 1-100'), false;
            if (max_discount && (parseInt(max_discount) <= 0 || parseInt(max_discount) > 10000000)) {
                return toast.warn('Giảm tối đa từ 1-10.000.000đ'), false;
            }
        } else {
            if (val <= 0 || val > 10000000) return toast.warn('Giá trị giảm từ 1-10.000.000đ'), false;
        }

        if (min_amount && (parseInt(min_amount) < 0 || parseInt(min_amount) > 10000000)) {
            return toast.warn('Đơn tối thiểu từ 0-10.000.000đ'), false;
        }

        if (usage_limit && (parseInt(usage_limit) <= 0 || parseInt(usage_limit) > 1000000)) {
            return toast.warn('Giới hạn sử dụng từ 1-1.000.000 lần'), false;
        }

        const today = new Date().setHours(0, 0, 0, 0);
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        if (mode === "create" && startDate < today) {
            return toast.warn('Ngày bắt đầu phải là ngày hiện tại'), false;
        }

        if (endDate <= startDate) {
            return toast.warn('Ngày kết thúc phải sau ngày bắt đầu'), false;
        }

        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        onSubmit({
            ...formData,
            code: formData.code.toUpperCase().trim(),
            type: parseInt(formData.type),
            value: parseInt(formData.value),
            min_amount: parseInt(formData.min_amount) || 0,
            max_discount: formData.max_discount ? parseInt(formData.max_discount) : null,
            usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
            state: parseInt(formData.state)
        });
    };

    return (
        <Modal show={show} onHide={onClose} size="lg" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    {mode === "create" ? "Thêm mã giảm giá" : mode === "update" ? "Cập nhật mã giảm giá" : "Chi tiết mã giảm giá"}
                </Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Mã coupon</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    readOnly={isReadOnly}
                                    placeholder="VD: SUMMER50"
                                    style={{ textTransform: 'uppercase' }}
                                    maxLength={20}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Trạng thái</Form.Label>
                                <Form.Select name="state" value={formData.state} onChange={handleChange} disabled={isReadOnly}>
                                    <option value={1}>Hoạt động</option>
                                    <option value={0}>Tạm ngưng</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Mô tả</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            readOnly={isReadOnly}
                            placeholder="Mô tả chương trình khuyến mãi"
                            maxLength={255}
                        />
                    </Form.Group>

                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Loại giảm giá</Form.Label>
                                <Form.Select name="type" value={formData.type} onChange={handleChange} disabled={isReadOnly}>
                                    <option value={0}>Phần trăm %</option>
                                    <option value={1}>Giá tiền vnđ</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Giá trị</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type="number"
                                        name="value"
                                        value={formData.value}
                                        onChange={handleChange}
                                        readOnly={isReadOnly}
                                        placeholder={formData.type == 0 ? '1-100' : 'VD: 50000'}
                                    />
                                    <InputGroup.Text>{formData.type == 0 ? '%' : 'đ'}</InputGroup.Text>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Giảm tối đa</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type="number"
                                        name="max_discount"
                                        value={formData.max_discount}
                                        onChange={handleChange}
                                        readOnly={isReadOnly || formData.type == 1}
                                        disabled={formData.type == 1}
                                        placeholder="VD: 100000"
                                    />
                                    <InputGroup.Text>đ</InputGroup.Text>
                                </InputGroup>
                                {formData.type == 1 && <Form.Text className="text-muted">Không áp dụng</Form.Text>}
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Đơn tối thiểu</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type="number"
                                        name="min_amount"
                                        value={formData.min_amount}
                                        onChange={handleChange}
                                        readOnly={isReadOnly}
                                        placeholder="VD: 100000"
                                    />
                                    <InputGroup.Text>đ</InputGroup.Text>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Giới hạn lần sử dụng</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="usage_limit"
                                    value={formData.usage_limit}
                                    onChange={handleChange}
                                    readOnly={isReadOnly}
                                    placeholder="0 = không giới hạn"
                                />
                                {mode === "read" && data && (
                                    <Form.Text className="text-muted">Đã dùng: {data.used_count} lần</Form.Text>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Ngày bắt đầu</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    readOnly={isReadOnly}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Ngày kết thúc</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    readOnly={isReadOnly}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>
                        {isReadOnly ? 'Đóng' : 'Hủy'}
                    </Button>
                    {!isReadOnly && (
                        <Button variant="primary" type="submit">
                            {mode === "create" ? 'Thêm mới' : 'Cập nhật'}
                        </Button>
                    )}
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default ModalCRUCoupon;
