import { Modal, Button, Card, Row, Col, Table, Badge } from "react-bootstrap";
import { FaPrint, FaMoneyBillWave } from "react-icons/fa";
import { printInvoice } from "../../../../../utils/exportPDFUtil";
import { toast } from "react-toastify";

function ModalInvoiceDetail({ show, invoice, onClose, onPay, onRefresh }) {
    if (!invoice) return null;

    const handlePay = async () => {
        await onPay(invoice.invoice_id);
        onRefresh();
        onClose();
    };

    // ✅ Build allItems từ order.items, lấy đầy đủ tên + options (topping)
    const allItems = invoice.orders?.flatMap(order =>
        (order.items || []).map(item => {
            // Tính đơn giá (nếu có tổng giá đã bao gồm topping, cần chia ra)
            // Giả sử item.total là tổng với topping, item.price là giá gốc
            const basePrice = item.price || (item.total / item.quantity);

            return {
                name: item.name,
                quantity: item.quantity,
                price: basePrice,
                total: item.total,
                // Lấy options (topping) - backend trả về hoặc tính từ options_order_details
                options: item.options || item.option_details || []
            };
        })
    ) || [];

    const handlePrint = () => {
        if (!window.confirm('Xác nhận in hóa đơn?')) return;

        try {
            const result = printInvoice({
                invoice_id: invoice.invoice_id,
                table_name: invoice.table_name,
                total: invoice.total,
                discount: invoice.discount || 0,
                final_total: invoice.final_total,
                created_at: invoice.created_at,
                items: allItems // Pass items với options
            }, {
                name: 'QUAN KUN GA CHU',
                address: '180 Cao Lo, Tp. HCM',
                phone: '0123.456.789'
            });

            if (result.success) {
                toast.success('In hóa đơn thành công!');
            } else {
                toast.error('Lỗi in hóa đơn!');
            }
        } catch (error) {
            toast.error('Lỗi: ' + error.message);
        }
    };

    return (
        <Modal show={show} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title>
                    Hóa đơn #{invoice.invoice_id.slice(0, 13).toUpperCase()}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Card className="mb-3 border-0 bg-light">
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <p className="mb-1"><strong>Bàn:</strong> {invoice.table_name}</p>
                            </Col>
                            <Col md={6}>
                                <p className="mb-1">
                                    <strong>Ngày:</strong> {new Date(invoice.created_at).toLocaleString('vi-VN')}
                                </p>
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

                {/* Món ăn */}
                <h6 className="fw-bold mb-3">Chi tiết món ăn</h6>
                <Table striped bordered hover className="mb-3">
                    <thead className="table-light">
                        <tr>
                            <th style={{ width: '50px' }}>STT</th>
                            <th>Tên món</th>
                            <th style={{ width: '80px' }} className="text-center">SL</th>
                            <th style={{ width: '120px' }} className="text-end">Đơn giá</th>
                            <th style={{ width: '130px' }} className="text-end">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allItems.map((item, index) => (
                            <tr key={index}>
                                <td className="text-center">{index + 1}</td>
                                <td>
                                    <div className="fw-bold">{item.name}</div>
                                    {/* ✅ Hiển thị topping */}
                                    {item.options && item.options.length > 0 && (
                                        <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                                            {item.options.map((opt, i) => (
                                                <div key={i}>
                                                    + {opt.name}
                                                    {opt.plus_price > 0 && ` (+${new Intl.NumberFormat('vi-VN').format(opt.plus_price)}đ)`}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </td>
                                <td className="text-center">{item.quantity}</td>
                                <td className="text-end">
                                    {new Intl.NumberFormat('vi-VN').format(item.price)}đ
                                </td>
                                <td className="text-end fw-bold">
                                    {new Intl.NumberFormat('vi-VN').format(item.total)}đ
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                {/* Coupon */}
                {invoice.coupon && (
                    <Card className="mb-3 border-success">
                        <Card.Body className="bg-success bg-opacity-10">
                            <p className="mb-0">
                                🎟️ <strong>{invoice.coupon.code}</strong> - {invoice.coupon.description}
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
