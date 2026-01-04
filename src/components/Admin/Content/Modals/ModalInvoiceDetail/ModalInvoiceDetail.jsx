import { Modal, Button, Card, ListGroup, Badge, Row, Col } from "react-bootstrap";
import { FaPrint, FaMoneyBillWave } from "react-icons/fa";

function ModalInvoiceDetail({ show, invoice, onClose, onPay, onRefresh }) {
    if (!invoice) return null;

    const handlePay = async () => {
        await onPay(invoice.invoice_id);
        onRefresh();
        onClose();
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <Modal show={show} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title>
                    🧾 Hóa đơn #{invoice.invoice_id.slice(0, 8).toUpperCase()}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {/* Thông tin chung */}
                <Card className="mb-3 border-0 bg-light">
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <p className="mb-1"><strong>Bàn:</strong> {invoice.table_name}</p>
                                <p className="mb-1"><strong>Nhân viên:</strong> {invoice.user_fullname}</p>
                            </Col>
                            <Col md={6}>
                                <p className="mb-1"><strong>Ngày tạo:</strong> {new Date(invoice.created_at).toLocaleString('vi-VN')}</p>
                                <p className="mb-1">
                                    <strong>Trạng thái:</strong>{' '}
                                    <Badge bg={invoice.status === 1 ? "success" : "warning"}>
                                        {invoice.status === 1 ? "Đã thanh toán" : "Chưa thanh toán"}
                                    </Badge>
                                </p>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Danh sách món */}
                <h6 className="fw-bold mb-3">Chi tiết món ăn</h6>
                <ListGroup className="mb-3">
                    {invoice.orders?.map((order, idx) => (
                        <ListGroup.Item key={idx}>
                            <div className="mb-2">
                                <Badge bg="secondary">Order #{order.order_id.slice(0, 8)}</Badge>
                                <small className="text-muted ms-2">
                                    {new Date(order.created_at).toLocaleString('vi-VN')}
                                </small>
                            </div>
                            {order.items.map((item, i) => (
                                <div key={i} className="d-flex justify-content-between ms-3 mb-1">
                                    <span>{item.quantity}x {item.item_name}</span>
                                    <span>{new Intl.NumberFormat('vi-VN').format(item.total)}đ</span>
                                </div>
                            ))}
                        </ListGroup.Item>
                    ))}
                </ListGroup>

                {/* Coupon */}
                {invoice.coupon && (
                    <Card className="mb-3 border-success">
                        <Card.Body className="bg-success bg-opacity-10">
                            <p className="mb-0">
                                🎟️ Mã giảm giá: <strong>{invoice.coupon.code}</strong>
                                <br />
                                <small className="text-muted">{invoice.coupon.description}</small>
                            </p>
                        </Card.Body>
                    </Card>
                )}

                {/* Tổng tiền */}
                <Card className="border-primary">
                    <Card.Body>
                        <div className="d-flex justify-content-between mb-2">
                            <span>Tổng cộng:</span>
                            <strong>{new Intl.NumberFormat('vi-VN').format(invoice.total)}đ</strong>
                        </div>
                        {invoice.discount > 0 && (
                            <div className="d-flex justify-content-between mb-2 text-danger">
                                <span>Giảm giá:</span>
                                <strong>-{new Intl.NumberFormat('vi-VN').format(invoice.discount)}đ</strong>
                            </div>
                        )}
                        <hr />
                        <div className="d-flex justify-content-between">
                            <h5 className="mb-0">THÀNH TIỀN:</h5>
                            <h4 className="mb-0 text-success">
                                {new Intl.NumberFormat('vi-VN').format(invoice.final_total)}đ
                            </h4>
                        </div>
                    </Card.Body>
                </Card>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="outline-primary" onClick={handlePrint}>
                    <FaPrint className="me-2" />
                    In hóa đơn
                </Button>
                {invoice.status === 0 && (
                    <Button variant="success" onClick={handlePay}>
                        <FaMoneyBillWave className="me-2" />
                        Thanh toán
                    </Button>
                )}
                <Button variant="secondary" onClick={onClose}>
                    Đóng
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalInvoiceDetail;
