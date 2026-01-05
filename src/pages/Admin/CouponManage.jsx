import { useEffect, useState } from "react";
import couponService from "../../services/couponService";
import TopBar from "../../components/Admin/Content/TopBar/TopBar";
import TableLayout from "../../components/Admin/Content/TableLayout/TableLayout";
import Pagination from "../../components/common/Pagination";
import ModalCRUCoupon from "../../components/Admin/Content/Modals/ModalCRU/ModalCRU.Coupon";
import ModalConfirm from "../../components/Admin/Content/Modals/ModalConfirmDelete/ModalConfirm";
import { toast } from "react-toastify";
import { searchMatch } from "../../utils/removeTonesUtil";
import { exportCouponToExcel } from "../../utils/exportExcelUtil";
import { useFetch } from "../../hooks/useFetch";
import { Badge } from "react-bootstrap";

function CouponManage() {
    const { data: coupons, loading, refetch } = useFetch(couponService);

    const [filteredCoupons, setFilteredCoupons] = useState([]);
    const [paginatedCoupons, setPaginatedCoupons] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [couponToDelete, setCouponToDelete] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [mode, setMode] = useState("read");

    useEffect(() => {
        let result = coupons.filter(c =>
            (!searchTerm || searchMatch(c.code, searchTerm) || searchMatch(c.description, searchTerm)) &&
            (filters.state === undefined || filters.state === '' || c.state == filters.state) &&
            (filters.type === undefined || filters.type === '' || c.type == filters.type)
        );
        setFilteredCoupons(result);
        setCurrentPage(1);
    }, [searchTerm, filters, coupons]);

    useEffect(() => {
        const start = (currentPage - 1) * itemsPerPage;
        setPaginatedCoupons(filteredCoupons.slice(start, start + itemsPerPage));
    }, [filteredCoupons, currentPage, itemsPerPage]);

    const handleRefresh = () => {
        setSearchTerm('');
        setFilters({});
        setCurrentPage(1);
        refetch();
    };

    const handleExportExcel = () => {
        const result = exportCouponToExcel(filteredCoupons);
        toast[result.success ? 'success' : 'error'](result.message);
    };

    const handleCU = async (data) => {
        try {
            const res = mode === "create"
                ? await couponService.insert(data)
                : await couponService.update(selectedCoupon.coupon_id, data);
            toast.success(res.message);
            refetch();
            setShowModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra");
        }
    };

    const handleConfirmDelete = async () => {
        try {
            const res = await couponService.delete(couponToDelete.coupon_id);
            toast.success(res.message);
            refetch();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi xóa');
        } finally {
            setShowDeleteConfirm(false);
            setCouponToDelete(null);
        }
    };

    const isExpired = (coupon) => new Date() > new Date(coupon.end_date);
    const isOutOfUsage = (coupon) => coupon.usage_limit && coupon.used_count >= coupon.usage_limit;

    const columns = [
        { name: "STT", key: "stt" },
        { name: "Mã coupon", key: "code" },
        { name: "Mô tả", key: "description" },
        { name: "Loại", key: "type" },
        { name: "Giá trị", key: "value" },
        { name: "Hiệu lực", key: "validity" },
        { name: "Sử dụng", key: "usage" },
        { name: "Trạng thái", key: "status" },
    ];

    const data = paginatedCoupons.map((coupon, index) => ({
        stt: (currentPage - 1) * itemsPerPage + index + 1,
        code: <strong className="text-danger">{coupon.code}</strong>,
        description: coupon.description || '—',
        type: <Badge bg={coupon.type === 0 ? "info" : "warning"}>
            {coupon.type === 0 ? "Giảm %" : "Giảm tiền"}
        </Badge>,
        value: coupon.type === 0
            ? `${coupon.value}%${coupon.max_discount ? ` (tối đa ${new Intl.NumberFormat('vi-VN').format(coupon.max_discount)}đ)` : ''}`
            : `${new Intl.NumberFormat('vi-VN').format(coupon.value)}đ`,
        validity: (
            <div style={{ fontSize: '13px' }}>
                <div>{new Date(coupon.start_date).toLocaleDateString('vi-VN')}</div>
                <div>đến</div>
                <div>{new Date(coupon.end_date).toLocaleDateString('vi-VN')}</div>
                {isExpired(coupon) && <Badge bg="danger" className="mt-1">Hết hạn</Badge>}
            </div>
        ),
        usage: (
            <div>
                <span className={isOutOfUsage(coupon) ? 'text-danger fw-bold' : ''}>
                    {coupon.used_count}
                </span>
                {coupon.usage_limit ? `/${coupon.usage_limit}` : '/∞'}
                {isOutOfUsage(coupon) && <Badge bg="danger" className="ms-1">Hết lượt</Badge>}
            </div>
        ),
        status: <Badge bg={coupon.state === 1 ? "success" : "secondary"}>
            {coupon.state === 1 ? "Hoạt động" : "Tạm ngưng"}
        </Badge>,
        fullData: coupon
    }));

    if (loading) return <div>Đang tải...</div>;

    return (
        <>
            <TopBar
                onAdd={() => { setMode("create"); setSelectedCoupon(null); setShowModal(true); }}
                onSearch={setSearchTerm}
                onRefresh={handleRefresh}
                onExportExcel={handleExportExcel}
                filterOptions={[
                    {
                        label: 'Trạng thái',
                        field: 'state',
                        type: 'select',
                        options: [
                            { label: 'Hoạt động', value: '1' },
                            { label: 'Tạm ngưng', value: '0' }
                        ]
                    },
                    {
                        label: 'Loại giảm giá',
                        field: 'type',
                        type: 'select',
                        options: [
                            { label: 'Giảm %', value: '0' },
                            { label: 'Giảm tiền', value: '1' }
                        ]
                    }
                ]}
                onFilter={setFilters}
            />

            <h2 className="mb-4">Danh sách mã giảm giá</h2>

            <TableLayout
                columns={columns}
                data={data}
                onRead={(row) => { setMode("read"); setSelectedCoupon(row.fullData); setShowModal(true); }}
                onUpdate={(row) => { setMode("update"); setSelectedCoupon(row.fullData); setShowModal(true); }}
                onDelete={(row) => { setCouponToDelete(row.fullData); setShowDeleteConfirm(true); }}
            />

            <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredCoupons.length / itemsPerPage)}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
            />

            <ModalCRUCoupon
                show={showModal}
                mode={mode}
                data={selectedCoupon}
                onClose={() => setShowModal(false)}
                onSubmit={handleCU}
            />

            <ModalConfirm
                show={showDeleteConfirm}
                title="Xác nhận xóa mã giảm giá"
                message={`Bạn có chắc muốn xóa mã "${couponToDelete?.code}"?`}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}

export default CouponManage;
