import { useState, useEffect } from "react";
import { Modal, Form, Button, ListGroup, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import invoiceService from "../../../../../services/invoiceService";
import tableService from "../../../../../services/tableService";
import couponService from "../../../../../services/couponService";

function ModalCreateInvoice({ show, onClose, onSuccess }) {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState('');
    const [orders, setOrders] = useState([]);
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [validatedCoupon, setValidatedCoupon] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show) {
            fetchTables();
            setSelectedTable('');
            setOrders([]);
            setCouponCode('');
            setCouponDiscount(0);
            setValidatedCoupon(null);
        }
    }, [show]);

    const fetchTables = async () => {
        try {
            const res = await tableService.getAll();
            setTables(res.data || []);
        } catch (error) {
            toast.error('Lỗi tải danh sách bàn');
        }
    };

    const handleTableChange = async (table_id) => {
        setSelectedTable(table_id);
        if (!table_id) {
            setOrders([]);
            return;
        }

        try {
            const res = await invoiceService.getPendingOrders(table_id);
            setOrders(res.data || []);
        } catch (error) {
            toast.error('Lỗi tải danh sách món');
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            toast.warn('Vui lòng nhập mã giảm giá');
            return;
        }

        const total = calculateTotal();

        try {
            const res = await couponService.validate({ code: couponCode, total_amount: total });
            setValidatedCoupon(res.data.coupon);
            setCouponDiscount(res.data.discount);
            toast.success('Áp dụng mã giảm giá thành công');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Mã giảm giá không hợp lệ');
            setCouponDiscount(0);
            setValidatedCoupon(null);
        }
    };

    const calculateTotal = () => {
        return orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    };

    const handleCreateInvoice = async () => {
        if (!selectedTable) {
            toast.warn('Vui lòng chọn bàn');
            return;
        }

        if (orders.length === 0) {
            toast.warn('Không có món nào để tạo hóa đơn');
            return;
        }

        setLoading(true);
        try {
            const total = calculateTotal();
            const final_total = total - couponDiscount;

            const data = {
                table_id: selectedTable,
                coupon_id: validatedCoupon?.coupon_id || null,
                total,
                discount: couponDiscount,
                final_total
            };

            const res = await invoiceService.insert(data);
            toast.success(res.message || 'Tạo hóa đơn thành công');
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi tạo hóa đơn');
        } finally {
            setLoading(false);
        }
    };

    const total = calculateTotal();
    const finalTotal = total - couponDiscount;

    return (
        <Modal show={show} onHide={onClose} size="lg" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Tạo hóa đơn mới</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {/* Chọn bàn */}
                <Form.Group className="mb-3">
                    <Form.Label>Chọn bàn</Form.Label>
                    <Form.Select
                        value={selectedTable}
                        onChange={(e) => handleTableChange(e.target.value)}
                    >
                        <option value="">-- Chọn bàn --</option>
                        {tables.map(table => (
                            <option key={table.table_id} value={table.table_id}>
                                {table.name}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                {/* Danh sách món */}
                {orders.length > 0 && (
                    <Card className="mb-3">
                        <Card.Header>
                            Danh sách món ({orders.length} orders)
                        </Card.Header>
                        <ListGroup variant="flush">
                            {orders.map((order, idx) => (
                                <ListGroup.Item key={idx}>
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <div>Order #{order.order_id?.slice(0, 8)}</div>
                                            <small className="text-muted">
                                                {new Date(order.created_at).toLocaleString('vi-VN')}
                                            </small>
                                        </div>
                                        <strong>
                                            {new Intl.NumberFormat('vi-VN').format(order.total_amount || 0)}đ
                                        </strong>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card>
                )}

                {/* Mã giảm giá */}
                {orders.length > 0 && (
                    <Form.Group className="mb-3">
                        <Form.Label>Mã giảm giá (không bắt buộc)</Form.Label>
                        <div className="d-flex gap-2">
                            <Form.Control
                                type="text"
                                placeholder="Nhập mã giảm giá"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                style={{ textTransform: 'uppercase' }}
                            />
                            <Button variant="outline-secondary" onClick={handleApplyCoupon}>
                                Áp dụng
                            </Button>
                        </div>
                        {validatedCoupon && (
                            <div className="mt-2 p-2 border rounded">
                                <small>Mã <strong>{validatedCoupon.code}</strong> đã được áp dụng</small>
                            </div>
                        )}
                    </Form.Group>
                )}

                {/* Tổng tiền */}
                {orders.length > 0 && (
                    <Card>
                        <Card.Body>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Tổng cộng:</span>
                                <strong>{new Intl.NumberFormat('vi-VN').format(total)}đ</strong>
                            </div>
                            {couponDiscount > 0 && (
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Giảm giá:</span>
                                    <strong>-{new Intl.NumberFormat('vi-VN').format(couponDiscount)}đ</strong>
                                </div>
                            )}
                            <hr />
                            <div className="d-flex justify-content-between">
                                <h5 className="mb-0">Thành tiền:</h5>
                                <h5 className="mb-0">
                                    {new Intl.NumberFormat('vi-VN').format(finalTotal)}đ
                                </h5>
                            </div>
                        </Card.Body>
                    </Card>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Hủy
                </Button>
                <Button
                    variant="primary"
                    onClick={handleCreateInvoice}
                    disabled={loading || orders.length === 0}
                >
                    {loading ? 'Đang xử lý...' : 'Tạo hóa đơn'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalCreateInvoice;
