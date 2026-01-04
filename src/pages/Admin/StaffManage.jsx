import { useEffect, useState } from "react";
import staffService from '../../services/staffService';
import TopBar from "../../components/Admin/Content/TopBar/TopBar";
import TableLayout from "../../components/Admin/Content/TableLayout/TableLayout";
import Pagination from "../../components/common/Pagination";
import ModalCRUStaff from "../../components/Admin/Content/Modals/ModalCRU/ModalCRU.Staff";
import ModalConfirm from "../../components/Admin/Content/Modals/ModalConfirmDelete/ModalConfirm";
import ModalShowPassword from "../../components/Admin/Content/Modals/ModalShowPassword/ModalShowPassword";
import { toast } from "react-toastify";
import { searchMatch } from "../../utils/removeTonesUtil";
import { exportStaffToExcel } from "../../utils/exportExcelUtil";
import { useFetch } from "../../hooks/useFetch";

function StaffManage() {
    const { data: staffs, loading, refetch } = useFetch(staffService);

    // State
    const [filteredStaffs, setFilteredStaffs] = useState([]);
    const [paginatedStaffs, setPaginatedStaffs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [selectedStaff, setSelectedStaff] = useState(null);
    const [staffToDelete, setStaffToDelete] = useState(null);
    const [staffToReset, setStaffToReset] = useState(null);
    const [passwordData, setPasswordData] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [mode, setMode] = useState("read");

    // Filter
    useEffect(() => {
        let result = staffs;

        if (searchTerm) {
            result = result.filter(staff =>
                searchMatch(staff.fullname, searchTerm) ||
                searchMatch(staff.username, searchTerm) ||
                searchMatch(staff.email, searchTerm)
            );
        }

        if (filters.role) {
            result = result.filter(staff => staff.role === filters.role);
        }

        setFilteredStaffs(result);
        setCurrentPage(1);
    }, [searchTerm, filters, staffs]);

    // paginate
    useEffect(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setPaginatedStaffs(filteredStaffs.slice(startIndex, endIndex));
    }, [filteredStaffs, currentPage, itemsPerPage]);

    const handleSearch = (value) => setSearchTerm(value);
    const handleFilter = (filterValues) => setFilters(filterValues);

    const handleRefresh = () => {
        setSearchTerm('');
        setFilters({});
        setCurrentPage(1);
        refetch();
    };

    const handleExportExcel = () => {
        const result = exportStaffToExcel(filteredStaffs);
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    };

    const filterOptions = [
        {
            label: 'Vai trò',
            field: 'role',
            type: 'select',
            options: [
                { label: 'Admin', value: 'admin' },
                { label: 'Nhân viên', value: 'staff' }
            ]
        }
    ];

    const handleSetCreate = () => {
        setMode("create");
        setSelectedStaff(null);
        setShowModal(true);
    };

    const handleSetRead = (row) => {
        setMode("read");
        setSelectedStaff(row.fullData);
        setShowModal(true);
    };

    const handleSetUpdate = (row) => {
        setMode("update");
        setSelectedStaff(row.fullData);
        setShowModal(true);
    };

    const handleOpenDeleteModal = (row) => {
        setStaffToDelete(row.fullData);
        setShowDeleteModal(true);
    };

    const handleOpenResetPasswordModal = (row) => {
        if (!row.fullData.email) {
            toast.error("Nhân viên chưa có email. Vui lòng cập nhật email trước.");
            return;
        }
        setStaffToReset(row.fullData);
        setShowResetPasswordModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!staffToDelete) return;

        try {
            const res = await staffService.delete(staffToDelete.user_id);
            toast.success(res.message);
            refetch();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Lỗi khi xóa");
        } finally {
            setShowDeleteModal(false);
            setStaffToDelete(null);
        }
    };

    const handleConfirmResetPassword = async () => {
        if (!staffToReset) return;

        try {
            const res = await staffService.resetPassword(staffToReset.user_id);
            toast.success(res.message);
            toast.info(`Mật khẩu mới đã được gửi đến email: ${staffToReset.email}`, {
                autoClose: 5000
            });
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Lỗi khi reset mật khẩu");
        } finally {
            setShowResetPasswordModal(false);
            setStaffToReset(null);
        }
    };

    const handleCU = async (formData) => {
        try {
            if (mode === "create") {
                const res = await staffService.insert(formData);
                toast.success(res.message);

                setPasswordData({
                    username: res.data.username,
                    password: res.data.password,
                    fullname: res.data.fullname
                });
                setShowPasswordModal(true);
            } else if (mode === "update") {
                const res = await staffService.update(selectedStaff.user_id, formData);
                toast.success(res.message);
            }

            refetch();
            setShowModal(false);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Có lỗi xảy ra");
        }
    };

    // Table
    const columns = [
        { name: "STT", key: "stt" },
        { name: "Tài khoản", key: "username" },
        { name: "Họ tên", key: "fullname" },
        { name: "Email", key: "email" },
        { name: "Vai trò", key: "role" },
        { name: "Ngày tạo", key: "created_at" },
    ];

    const staffData = paginatedStaffs.map((staff, index) => ({
        stt: (currentPage - 1) * itemsPerPage + index + 1,
        username: staff.username,
        fullname: staff.fullname,
        email: staff.email ? (
            <span className="text-success">{staff.email}</span>
        ) : (
            <span className="text-danger">Chưa có email</span>
        ),
        role: (
            <span className={`badge ${staff.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                {staff.role === 'admin' ? 'Admin' : 'Nhân viên'}
            </span>
        ),
        created_at: new Date(staff.created_at).toLocaleDateString('vi-VN'),
        fullData: staff
    }));

    const totalPages = Math.ceil(filteredStaffs.length / itemsPerPage);

    if (loading) return <div>Đang tải...</div>;

    return (
        <>
            <TopBar
                onAdd={handleSetCreate}
                onSearch={handleSearch}
                onRefresh={handleRefresh}
                onExportExcel={handleExportExcel}
                filterOptions={filterOptions}
                onFilter={handleFilter}
            />

            <TableLayout
                columns={columns}
                data={staffData}
                onRead={handleSetRead}
                onUpdate={handleSetUpdate}
                onDelete={handleOpenDeleteModal}
                onResetPassword={handleOpenResetPasswordModal}
            />

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredStaffs.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
            />

            <ModalCRUStaff
                show={showModal}
                mode={mode}
                data={selectedStaff}
                onClose={() => setShowModal(false)}
                onSubmit={handleCU}
            />

            <ModalConfirm
                show={showDeleteModal}
                title="Xác nhận xóa nhân viên"
                message={`Bạn có chắc muốn xóa "${staffToDelete?.fullname}"?`}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
            />

            <ModalConfirm
                show={showResetPasswordModal}
                title="Xác nhận cấp lại mật khẩu"
                message={
                    <div>
                        Bạn có chắc muốn cấp lại mật khẩu cho <strong>"{staffToReset?.fullname}"</strong>?
                        <br />
                        <p className="text-muted mt-2">
                            Mật khẩu mới sẽ được gửi đến: <strong className="text-primary">{staffToReset?.email}</strong>
                        </p>
                    </div>
                }
                onClose={() => setShowResetPasswordModal(false)}
                onConfirm={handleConfirmResetPassword}
            />

            <ModalShowPassword
                show={showPasswordModal}
                data={passwordData}
                onClose={() => setShowPasswordModal(false)}
            />
        </>
    );
}

export default StaffManage;
