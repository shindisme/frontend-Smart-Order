import { useEffect, useState } from "react";
import invoiceService from "../../services/invoiceService";
import TopBar from "../../components/Admin/Content/TopBar/TopBar";
import TableLayout from "../../components/Admin/Content/TableLayout/TableLayout";
import Pagination from "../../components/common/Pagination";
import ModalInvoiceDetail from "../../components/Admin/Content/Modals/ModalInvoiceDetail/ModalInvoiceDetail";
import ModalCreateInvoice from "../../components/Admin/Content/Modals/ModalCreateInvoice/ModalCreateInvoice";
import { toast } from "react-toastify";
import { searchMatch } from "../../utils/removeTonesUtil";
import { useFetch } from "../../hooks/useFetch";
import { Badge, Button } from "react-bootstrap";
import { FaFileInvoiceDollar } from "react-icons/fa";

function InvoiceManage() {
    // Lấy data từ API
    const { data: invoices, loading, refetch } = useFetch(invoiceService);

    // State cơ bản
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [paginatedInvoices, setPaginatedInvoices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Lọc data khi search hoặc filter
    useEffect(() => {
        let result = invoices.filter(inv =>
            (!searchTerm || searchMatch(inv.invoice_id, searchTerm) || searchMatch(inv.table_name, searchTerm)) &&
            (filters.status === undefined || filters.status === '' || inv.status == filters.status)
        );
        setFilteredInvoices(result);
        setCurrentPage(1);
    }, [searchTerm, filters, invoices]);

    // Phân trang
    useEffect(() => {
        const start = (currentPage - 1) * itemsPerPage;
        setPaginatedInvoices(filteredInvoices.slice(start, start + itemsPerPage));
    }, [filteredInvoices, currentPage, itemsPerPage]);

    // Làm mới
    const handleRefresh = () => {
        setSearchTerm('');
        setFilters({});
        setCurrentPage(1);
        refetch();
    };

    // Thanh toán
    const handlePay = async (invoice_id) => {
        try {
            const res = await invoiceService.pay(invoice_id);
            toast.success(res.message);
            refetch();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi');
        }
    };

    // Cột của bảng
    const columns = [
        { name: "STT", key: "stt" },
        { name: "Mã HĐ", key: "invoice_code" },
        { name: "Bàn", key: "table" },
        { name: "Tổng tiền", key: "total" },
        { name: "Giảm giá", key: "discount" },
        { name: "Thành tiền", key: "final_total" },
        { name: "Trạng thái", key: "status" },
        { name: "Ngày tạo", key: "created_at" },
        { name: "Thao tác", key: "actions" },
    ];

    // Dữ liệu hiển thị
    const data = paginatedInvoices.map((invoice, index) => ({
        stt: (currentPage - 1) * itemsPerPage + index + 1,
        invoice_code: <strong className="text-primary">#{invoice.invoice_id.slice(0, 8).toUpperCase()}</strong>,
        table: <Badge bg="info">{invoice.table_name}</Badge>,
        total: `${new Intl.NumberFormat('vi-VN').format(invoice.total)}đ`,
        discount: invoice.discount > 0 ? (
            <span className="text-danger">-{new Intl.NumberFormat('vi-VN').format(invoice.discount)}đ</span>
        ) : '—',
        final_total: <strong className="text-success">{new Intl.NumberFormat('vi-VN').format(invoice.final_total)}đ</strong>,
        status: <Badge bg={invoice.status === 1 ? "success" : "warning"}>{invoice.status === 1 ? "Đã thanh toán" : "Chưa thanh toán"}</Badge>,
        created_at: new Date(invoice.created_at).toLocaleString('vi-VN'),
        actions: invoice.status === 0 && (
            <Button size="sm" variant="success" onClick={() => handlePay(invoice.invoice_id)}>
                💳 Thanh toán
            </Button>
        ),
        fullData: invoice
    }));

    if (loading) return <div>Đang tải...</div>;

    return (
        <>
            {/* Thanh tìm kiếm + filter */}
            <TopBar
                onAdd={() => setShowCreateModal(true)}
                onSearch={setSearchTerm}
                onRefresh={handleRefresh}
                filterOptions={[
                    {
                        label: 'Trạng thái',
                        field: 'status',
                        type: 'select',
                        options: [
                            { label: 'Chưa thanh toán', value: '0' },
                            { label: 'Đã thanh toán', value: '1' }
                        ]
                    }
                ]}
                onFilter={setFilters}
            />

            {/* Tiêu đề + nút tạo */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>
                    <FaFileInvoiceDollar className="me-2" />
                    Danh sách hóa đơn
                </h2>
                <Button variant="primary" size="lg" onClick={() => setShowCreateModal(true)}>
                    + Tạo hóa đơn mới
                </Button>
            </div>

            {/* Bảng data */}
            <TableLayout
                columns={columns}
                data={data}
                onRead={(row) => { setSelectedInvoice(row.fullData); setShowDetailModal(true); }}
                onUpdate={null}
                onDelete={null}
            />

            {/* Phân trang */}
            <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredInvoices.length / itemsPerPage)}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
            />

            {/* Modal xem chi tiết */}
            <ModalInvoiceDetail
                show={showDetailModal}
                invoice={selectedInvoice}
                onClose={() => setShowDetailModal(false)}
                onPay={handlePay}
                onRefresh={refetch}
            />

            {/* Modal tạo mới */}
            <ModalCreateInvoice
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => { setShowCreateModal(false); refetch(); }}
            />
        </>
    );
}

export default InvoiceManage;
