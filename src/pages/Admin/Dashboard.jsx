import { useEffect, useState } from "react";
import { Card, Row, Col, Table, Badge } from "react-bootstrap";
import {
  FaMoneyBillWave,
  FaFileInvoice,
  FaUtensils,
  FaChair,
  FaArrowUp,
  FaArrowDown,
  FaHourglassHalf
} from "react-icons/fa";
import {
  MdCheckCircle,
  MdHourglassEmpty,
  MdRestaurant
} from "react-icons/md";
import dashboardService from "../../services/dashboardService";

function Dashboard() {
  const [stats, setStats] = useState({
    todayRevenue: 0,
    todayInvoices: 0,
    todayOrders: 0,
    availableTables: 0,
    tablesInUse: 0,
    totalTables: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    recentInvoices: [],
    recentOrders: [],
    topItems: [],
    previousRevenue: 0,
    previousOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();

    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboard();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardService.getStats();
      setStats(res.data);
    } catch (error) {
      console.error('Lỗi tải dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateChange = (current, previous) => {
    if (previous === 0) return { percent: 0, isIncrease: false };
    const percent = ((current - previous) / previous * 100).toFixed(1);
    return {
      percent: Math.abs(percent),
      isIncrease: percent >= 0
    };
  };

  const revenueChange = calculateChange(stats.todayRevenue, stats.previousRevenue);
  const ordersChange = calculateChange(stats.todayOrders, stats.previousOrders);

  const getOrderStateBadge = (state) => {
    switch (state) {
      case 0:
        return (
          <Badge bg="warning" text="dark" className="d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
            <MdHourglassEmpty size={14} />
            Chờ xử lý
          </Badge>
        );
      case 1:
        return (
          <Badge bg="primary" className="d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
            <MdRestaurant size={14} />
            Đang làm
          </Badge>
        );
      case 2:
        return (
          <Badge bg="success" className="d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
            <MdCheckCircle size={14} />
            Hoàn thành
          </Badge>
        );
      default:
        return <Badge bg="secondary">Không xác định</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Dashboard</h2>
        <small className="text-muted">Cập nhật: {formatDateTime(new Date())}</small>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4 g-3">
        <Col lg={3} md={6}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="p-2 bg-success bg-opacity-10 rounded">
                  <FaMoneyBillWave size={24} className="text-success" />
                </div>
                {revenueChange.percent > 0 && (
                  <Badge bg={revenueChange.isIncrease ? 'success' : 'danger'} className="d-flex align-items-center gap-1">
                    {revenueChange.isIncrease ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
                    {revenueChange.percent}%
                  </Badge>
                )}
              </div>
              <h6 className="text-muted mb-1" style={{ fontSize: '14px' }}>Doanh thu hôm nay</h6>
              <h3 className="mb-0 fw-bold">{formatMoney(stats.todayRevenue)}</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="p-2 bg-primary bg-opacity-10 rounded">
                  <FaUtensils size={24} className="text-primary" />
                </div>
                {ordersChange.percent > 0 && (
                  <Badge bg={ordersChange.isIncrease ? 'success' : 'danger'} className="d-flex align-items-center gap-1">
                    {ordersChange.isIncrease ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
                    {ordersChange.percent}%
                  </Badge>
                )}
              </div>
              <h6 className="text-muted mb-1" style={{ fontSize: '14px' }}>Đơn hàng hôm nay</h6>
              <h3 className="mb-0 fw-bold">{stats.todayOrders}</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="p-2 bg-warning bg-opacity-10 rounded">
                  <FaChair size={24} className="text-warning" />
                </div>
              </div>
              <h6 className="text-muted mb-1" style={{ fontSize: '14px' }}>Bàn đang sử dụng</h6>
              <h3 className="mb-0 fw-bold">{stats.tablesInUse}/{stats.totalTables}</h3>
              <small className="text-muted">
                {stats.availableTables} bàn trống
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="p-2 bg-danger bg-opacity-10 rounded">
                  <FaHourglassHalf size={24} className="text-danger" />
                </div>
                {stats.pendingOrders > 0 && (
                  <Badge bg="danger" className="pulse">
                    Cần xử lý!
                  </Badge>
                )}
              </div>
              <h6 className="text-muted mb-1" style={{ fontSize: '14px' }}>Đơn chờ xử lý</h6>
              <h3 className="mb-0 fw-bold">{stats.pendingOrders}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Order Status Summary */}
      <Row className="mb-4 g-3">
        <Col lg={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">Tổng quan đơn hàng hôm nay</h5>
            </Card.Header>
            <Card.Body>
              <Row className="text-center">
                <Col md={4}>
                  <div className="p-3">
                    <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                      <MdCheckCircle size={24} className="text-success" />
                      <h4 className="mb-0 fw-bold text-success">{stats.completedOrders}</h4>
                    </div>
                    <p className="text-muted mb-0">Đơn hoàn thành</p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="p-3 border-start border-end">
                    <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                      <MdRestaurant size={24} className="text-primary" />
                      <h4 className="mb-0 fw-bold text-primary">{stats.processingOrders}</h4>
                    </div>
                    <p className="text-muted mb-0">Đang làm</p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="p-3">
                    <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                      <MdHourglassEmpty size={24} className="text-warning" />
                      <h4 className="mb-0 fw-bold text-warning">{stats.pendingOrders}</h4>
                    </div>
                    <p className="text-muted mb-0">Chờ xử lý</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Top Items */}
      {stats.topItems && stats.topItems.length > 0 && (
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Header className="bg-white border-bottom">
            <h5 className="mb-0">Top 5 món bán chạy hôm nay</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <Table hover responsive className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Hạng</th>
                  <th>Tên món</th>
                  <th>Số lượng bán</th>
                  <th>Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {stats.topItems.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <Badge
                        bg={index === 0 ? 'warning' : index === 1 ? 'secondary' : 'light'}
                        text={index > 1 ? 'dark' : 'white'}
                        className="fw-bold"
                      >
                        #{index + 1}
                      </Badge>
                    </td>
                    <td className="fw-bold">{item.name}</td>
                    <td>{item.quantity} món</td>
                    <td className="text-success fw-bold">{formatMoney(item.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Recent Orders */}
      {stats.recentOrders && stats.recentOrders.length > 0 && (
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Header className="bg-white border-bottom">
            <h5 className="mb-0">Đơn hàng gần nhất</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <Table hover responsive className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Mã đơn</th>
                  <th>Bàn</th>
                  <th>Số món</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.order_id}>
                    <td>
                      <code style={{
                        background: '#f1f3f5',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '13px'
                      }}>
                        #{order.order_id.slice(0, 8)}
                      </code>
                    </td>
                    <td>
                      <strong>{order.table_name}</strong>
                    </td>
                    <td>{order.item_count} món</td>
                    <td className="fw-bold text-success">
                      {formatMoney(order.total)}
                    </td>
                    <td>
                      {getOrderStateBadge(order.state)}
                    </td>
                    <td className="text-muted">
                      {formatTime(order.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Recent Invoices */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <h5 className="mb-0">Hóa đơn gần đây</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Mã HĐ</th>
                <th>Bàn</th>
                <th>Tổng tiền</th>
                <th>Giảm giá</th>
                <th>Thành tiền</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentInvoices.length > 0 ? (
                stats.recentInvoices.map((inv) => (
                  <tr key={inv.invoice_id}>
                    <td>
                      <code style={{
                        background: '#f1f3f5',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '13px'
                      }}>
                        #{inv.invoice_id.slice(0, 8)}
                      </code>
                    </td>
                    <td>
                      <strong>{inv.table_name}</strong>
                    </td>
                    <td>{formatMoney(inv.total)}</td>
                    <td className="text-danger">
                      {inv.discount > 0 ? `-${formatMoney(inv.discount)}` : '-'}
                    </td>
                    <td className="fw-bold text-success">
                      {formatMoney(inv.final_total)}
                    </td>
                    <td>
                      {inv.status === 1 ? (
                        <Badge bg="success" className="d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
                          <MdCheckCircle size={14} />
                          Đã thanh toán
                        </Badge>
                      ) : (
                        <Badge bg="warning" text="dark" className="d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
                          <MdHourglassEmpty size={14} />
                          Chưa thanh toán
                        </Badge>
                      )}
                    </td>
                    <td className="text-muted">
                      {formatDateTime(inv.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    Chưa có hóa đơn nào
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                .pulse {
                    animation: pulse 2s infinite;
                }
                .card {
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
                }
                .table tbody tr {
                    transition: background-color 0.2s ease;
                }
            `}</style>
    </div>
  );
}

export default Dashboard;
