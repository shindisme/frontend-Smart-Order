import { useEffect, useState } from "react";
import { Card, Row, Col, Badge } from "react-bootstrap";
import { FaMoneyBillWave, FaUtensils, FaUsers, FaArrowUp, FaArrowDown, FaFileInvoice } from "react-icons/fa";
import { MdCheckCircle, MdHourglassEmpty, MdRestaurant } from "react-icons/md";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import dashboardService from "../../services/dashboardService";
import styles from "./Dashboard.module.css";

function Dashboard() {
  const [stats, setStats] = useState({
    todayRevenue: 0,
    todayOrders: 0,
    tablesInUse: 0,
    totalTables: 0,
    availableTables: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    recentInvoices: [],
    recentOrders: [],
    revenueChart: [],
    previousRevenue: 0,
    previousOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
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

  const formatMoney = (num) => new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  const formatTime = (date) => new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date) => new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

  const calculateChange = (current, previous) => {
    if (previous === 0) return { percent: 0, isIncrease: false };
    const percent = ((current - previous) / previous * 100).toFixed(1);
    return { percent: Math.abs(percent), isIncrease: percent >= 0 };
  };

  const revenueChange = calculateChange(stats.todayRevenue, stats.previousRevenue);
  const ordersChange = calculateChange(stats.todayOrders, stats.previousOrders);

  const getOrderStateBadge = (state) => {
    const badges = {
      0: { bg: "warning", text: "Chờ xử lý", icon: MdHourglassEmpty },
      1: { bg: "primary", text: "Đang làm", icon: MdRestaurant },
      2: { bg: "success", text: "Hoàn thành", icon: MdCheckCircle }
    };
    const badge = badges[state] || { bg: "secondary", text: "Không xác định" };
    const Icon = badge.icon;

    return (
      <Badge bg={badge.bg} className={styles.statusBadge}>
        {Icon && <Icon size={12} />}
        {badge.text}
      </Badge>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.chartTooltip}>
          <p className={styles.tooltipLabel}>{payload[0].payload.date}</p>
          <p className={styles.tooltipValue}>{formatMoney(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Dashboard</h2>
          <p className={styles.subtitle}>Tổng quan hiệu suất cửa hàng</p>
        </div>
      </div>

      <Row className="g-3 mb-4">
        <Col lg={4} md={6}>
          <Card className={styles.statCard}>
            <Card.Body>
              <div className={styles.statIcon} style={{ background: '#dcfce7' }}>
                <FaMoneyBillWave size={22} style={{ color: '#16a34a' }} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Doanh thu hôm nay</p>
                <h3 className={styles.statValue}>{formatMoney(stats.todayRevenue)}</h3>
                {revenueChange.percent > 0 && (
                  <div className={`${styles.statChange} ${revenueChange.isIncrease ? styles.increase : styles.decrease}`}>
                    {revenueChange.isIncrease ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
                    <span>{revenueChange.percent}% so với hôm qua</span>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} md={6}>
          <Card className={styles.statCard}>
            <Card.Body>
              <div className={styles.statIcon} style={{ background: '#dbeafe' }}>
                <FaUtensils size={22} style={{ color: '#2563eb' }} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Đơn hàng hôm nay</p>
                <h3 className={styles.statValue}>{stats.todayOrders}</h3>
                {ordersChange.percent > 0 && (
                  <div className={`${styles.statChange} ${ordersChange.isIncrease ? styles.increase : styles.decrease}`}>
                    {ordersChange.isIncrease ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
                    <span>{ordersChange.percent}% so với hôm qua</span>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} md={6}>
          <Card className={styles.statCard}>
            <Card.Body>
              <div className={styles.statIcon} style={{ background: '#fef3c7' }}>
                <FaUsers size={22} style={{ color: '#f59e0b' }} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Bàn đang dùng</p>
                <h3 className={styles.statValue}>{stats.tablesInUse}/{stats.totalTables}</h3>
                <div className={styles.statChange} style={{ color: '#6b7280' }}>
                  <span>{stats.availableTables} bàn trống</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col lg={12}>
          <Card className={styles.chartCard}>
            <Card.Header>
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderIcon}>
                  <FaMoneyBillWave size={18} />
                </div>
                <h5 className={styles.cardTitle}>Doanh thu 7 ngày gần đây</h5>
              </div>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ fill: '#2563eb', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        <Col lg={6}>
          <Card className={styles.tableCard}>
            <Card.Header>
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderIcon}>
                  <MdRestaurant size={18} />
                </div>
                <h5 className={styles.cardTitle}>Đơn hàng gần đây</h5>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div className={styles.tableContainer}>
                <table className={styles.customTable}>
                  <tbody>
                    {stats.recentOrders.length > 0 ? (
                      stats.recentOrders.slice(0, 8).map((order) => (
                        <tr key={order.order_id}>
                          <td>
                            <div className={styles.orderInfo}>
                              <div className={styles.orderAvatar}>
                                <MdRestaurant size={16} />
                              </div>
                              <div>
                                <div className={styles.orderName}>{order.table_name}</div>
                                <div className={styles.orderTime}>{formatTime(order.created_at)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-end">
                            <div className={styles.orderAmount}>{formatMoney(order.total)}</div>
                            {getOrderStateBadge(order.state)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="text-center py-4 text-muted">
                          Chưa có đơn hàng nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className={styles.tableCard}>
            <Card.Header>
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderIcon} style={{ background: '#dcfce7', color: '#16a34a' }}>
                  <FaFileInvoice size={18} />
                </div>
                <h5 className={styles.cardTitle}>Hóa đơn gần đây</h5>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div className={styles.tableContainer}>
                <table className={styles.customTable}>
                  <tbody>
                    {stats.recentInvoices.length > 0 ? (
                      stats.recentInvoices.slice(0, 8).map((invoice) => (
                        <tr key={invoice.invoice_id}>
                          <td>
                            <div className={styles.orderInfo}>
                              <div className={styles.orderAvatar} style={{ background: '#dcfce7' }}>
                                <FaFileInvoice size={16} style={{ color: '#16a34a' }} />
                              </div>
                              <div>
                                <div className={styles.orderName}>{invoice.table_name}</div>
                                <div className={styles.orderTime}>{formatTime(invoice.created_at)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-end">
                            <div className={styles.orderAmount}>{formatMoney(invoice.final_total)}</div>
                            {invoice.status === 1 ? (
                              <Badge bg="success" className={styles.statusBadge}>
                                <MdCheckCircle size={12} />
                                Đã thanh toán
                              </Badge>
                            ) : (
                              <Badge bg="warning" className={styles.statusBadge}>
                                <MdHourglassEmpty size={12} />
                                Chưa thanh toán
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="text-center py-4 text-muted">
                          Chưa có hóa đơn nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
