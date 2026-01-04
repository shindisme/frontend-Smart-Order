import { Modal, Button, Badge, Table } from 'react-bootstrap';
import { MdClose, MdAccessTime, MdTableBar } from 'react-icons/md';
import { useEffect, useState } from 'react';
import orderService from '../../../../../services/orderService';
import { toast } from 'react-toastify';

function ModalOrderDetail({ show, order, onClose, onUpdateStatus, onRefresh }) {
    const [orderDetail, setOrderDetail] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show && order) {
            fetchOrderDetail();
        }
    }, [show, order]);

    const fetchOrderDetail = async () => {
        setLoading(true);
        try {
            const res = await orderService.getById(order.order_id);
            console.log('Order detail response:', res.data);
            setOrderDetail(res.data);
        } catch (error) {
            console.error('Error fetching order detail:', error);
            toast.error('Lỗi tải chi tiết đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (newState) => {
        try {
            await onUpdateStatus(order.order_id, newState);
            await fetchOrderDetail();
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const getStatusBadge = (state) => {
        const configs = {
            0: { label: 'Chờ xác nhận', bg: 'warning' },
            1: { label: 'Đang làm', bg: 'info' },
            2: { label: 'Hoàn thành', bg: 'success' }
        };
        const config = configs[state] || configs[0];
        return <Badge bg={config.bg}>{config.label}</Badge>;
    };

    const formatMoney = (value) => {
        const num = Number(value);
        if (isNaN(num)) return '0đ';
        return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
    };

    const calculateTotal = () => {
        if (!orderDetail?.items) return 0;
        return orderDetail.items.reduce((sum, item) => sum + Number(item.total || 0), 0);
    };

    if (loading) {
        return (
            <Modal show={show} onHide={onClose} centered>
                <Modal.Body className="text-center py-5">
                    <div className="spinner-border text-primary" />
                </Modal.Body>
            </Modal>
        );
    }

    if (!orderDetail) return null;

    return (
        <Modal show={show} onHide={onClose} centered size="lg">
            <Modal.Header className="bg-primary text-white">
                <div>
                    <Modal.Title>Chi tiết đơn hàng</Modal.Title>
                    <small>#{orderDetail.order_id.slice(0, 8).toUpperCase()}</small>
                </div>
                <Button variant="light" size="sm" onClick={onClose}>
                    <MdClose />
                </Button>
            </Modal.Header>

            <Modal.Body>
                <div className="mb-3 p-3 bg-light rounded">
                    <div className="row">
                        <div className="col-6">
                            <MdTableBar size={18} className="text-muted me-2" />
                            <strong style={{ fontSize: '18px', fontWeight: '700' }}>
                                {orderDetail.table_name || 'N/A'}
                            </strong>
                        </div>
                        <div className="col-6 text-end">
                            <MdAccessTime size={18} className="text-muted me-2" />
                            <span>{new Date(orderDetail.created_at).toLocaleString('vi-VN')}</span>
                        </div>
                        <div className="col-12 mt-2">
                            <hr className="my-2" />
                            <strong>Trạng thái: </strong>
                            {getStatusBadge(orderDetail.state)}
                        </div>
                    </div>
                </div>

                <h6 className="mb-2">Danh sách món</h6>

                <Table bordered hover>
                    <thead className="table-light">
                        <tr>
                            <th>Tên món</th>
                            <th width="80" className="text-center">SL</th>
                            <th width="120" className="text-end">Đơn giá</th>
                            <th width="120" className="text-end">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orderDetail.items?.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    <strong>{item.name || 'N/A'}</strong>
                                    {item.options?.length > 0 && (
                                        <div className="mt-1">
                                            {item.options.map((opt, i) => (
                                                <Badge key={i} bg="secondary" className="me-1">
                                                    {opt.name} (+{formatMoney(opt.plus_price)})
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                    {item.note && (
                                        <small className="text-muted d-block mt-1">
                                            Ghi chú: {item.note}
                                        </small>
                                    )}
                                </td>
                                <td className="text-center">
                                    <Badge bg="primary" pill>{item.quantity}</Badge>
                                </td>
                                <td className="text-end">{formatMoney(item.price)}</td>
                                <td className="text-end">
                                    <strong>{formatMoney(item.total)}</strong>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="table-primary">
                        <tr>
                            <td colSpan="3" className="text-end"><strong>Tổng cộng:</strong></td>
                            <td className="text-end">
                                <strong style={{ fontSize: '20px' }}>
                                    {formatMoney(calculateTotal())}
                                </strong>
                            </td>
                        </tr>
                    </tfoot>
                </Table>

                {orderDetail.note && (
                    <div className="alert alert-info mb-0">
                        <strong>Ghi chú:</strong> {orderDetail.note}
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer>
                {orderDetail.state === 0 && (
                    <Button variant="warning" onClick={() => handleUpdateStatus(1)}>
                        Xác nhận đơn
                    </Button>
                )}
                {orderDetail.state === 1 && (
                    <Button variant="success" onClick={() => handleUpdateStatus(2)}>
                        Hoàn thành
                    </Button>
                )}
                <Button variant="secondary" onClick={onClose}>
                    Đóng
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalOrderDetail;
