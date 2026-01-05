import { useEffect, useState } from "react";
import invoiceService from "../../services/invoiceService";
import TopBar from "../../components/Admin/Content/TopBar/TopBar";
import TableLayout from "../../components/Admin/Content/TableLayout/TableLayout";
import Pagination from "../../components/common/Pagination";
import ModalInvoiceDetail from "../../components/Admin/Content/Modals/ModalInvoiceDetail/ModalInvoiceDetail";
import { toast } from "react-toastify";
import { searchMatch } from "../../utils/removeTonesUtil";
import { useFetch } from "../../hooks/useFetch";
import { Badge, Button } from "react-bootstrap";

function InvoiceManage() {
    const { data: invoices, loading, refetch } = useFetch(invoiceService);
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [paginatedInvoices, setPaginatedInvoices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        let result = invoices.filter(inv =>
            (!searchTerm || searchMatch(inv.invoice_id, searchTerm) || searchMatch(inv.table_name, searchTerm)) &&
            (!filters.status || inv.status == filters.status)
        );
        setFilteredInvoices(result);
        setCurrentPage(1);
    }, [searchTerm, filters, invoices]);

    useEffect(() => {
        const start = (currentPage - 1) * itemsPerPage;
        setPaginatedInvoices(filteredInvoices.slice(start, start + itemsPerPage));
    }, [filteredInvoices, currentPage, itemsPerPage]);

    const handleRefresh = () => {
        setSearchTerm('');
        setFilters({});
        setCurrentPage(1);
        refetch();
    };

    const handlePay = async (invoice_id) => {
        try {
            const res = await invoiceService.pay(invoice_id);
            toast.success(res.message);
            refetch();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi thanh toán');
        }
    };

    const handleOpenDetail = async (invoice) => {
        try {
            const response = await invoiceService.getById(invoice.invoice_id);
            if (response.data) {
                setSelectedInvoice(response.data);
                setShowDetailModal(true);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Lỗi tải dữ liệu hóa đơn');
        }
    };

    const columns = [
        { name: "STT", key: "stt" },
        { name: "Mã HD", key: "invoice_code" },
        { name: "Bàn", key: "table" },
        { name: "Tổng tiền", key: "total" },
        { name: "Giảm giá", key: "discount" },
        { name: "Thành tiền", key: "final_total" },
        { name: "Trạng thái", key: "status" },
        { name: "Ngày tạo", key: "created_at" },
        { name: "Thao tác", key: "actions" },
    ];

    const data = paginatedInvoices.map((invoice, index) => ({
        stt: (currentPage - 1) * itemsPerPage + index + 1,
        invoice_code: <strong className="text-primary">#{invoice.invoice_id.slice(0, 13).toUpperCase()}</strong>,
        table: <strong>{invoice.table_name}</strong>,
        total: `${new Intl.NumberFormat('vi-VN').format(invoice.total)}đ`,
        discount: invoice.discount > 0 ? (
            <span className="text-danger">-{new Intl.NumberFormat('vi-VN').format(invoice.discount)}đ</span>
        ) : '—',
        final_total: <strong className="text-success">{new Intl.NumberFormat('vi-VN').format(invoice.final_total)}đ</strong>,
        status: invoice.status === 1 ? (
            <Badge bg="success">Đã thanh toán</Badge>
        ) : (
            <Badge bg="warning" text="dark">Chưa thanh toán</Badge>
        ),
        created_at: new Date(invoice.created_at).toLocaleString('vi-VN'),
        actions: invoice.status === 0 ? (
            <Button
                size="sm"
                variant="success"
                onClick={() => handlePay(invoice.invoice_id)}
            >
                Thanh toán
            </Button>
        ) : null,
        fullData: invoice
    }));

    if (loading) return <div>Đang tải...</div>;

    return (
        <>
            <TopBar
                onAdd={null}
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

            <h2 className="mb-4">Danh sách hóa đơn</h2>

            <TableLayout
                columns={columns}
                data={data}
                onRead={(row) => handleOpenDetail(row.fullData)}
            />

            <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredInvoices.length / itemsPerPage)}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
            />

            <ModalInvoiceDetail
                show={showDetailModal}
                invoice={selectedInvoice}
                onClose={() => setShowDetailModal(false)}
                onPay={handlePay}
                onRefresh={refetch}
            />
        </>
    );
}

export default InvoiceManage;
