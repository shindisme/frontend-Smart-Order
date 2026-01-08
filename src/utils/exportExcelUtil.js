import * as XLSX from 'xlsx';

function formatExportData(data, columns) {
    return data.map((item, index) => {
        const row = { 'STT': index + 1 };

        columns.forEach(col => {
            let value = item[col.field];

            if (value === null || value === undefined) {
                value = '';
            } else if (col.field.includes('price') && typeof value === 'number') {
                value = new Intl.NumberFormat('vi-VN').format(value);
            } else if (col.field === 'is_available') {
                value = value ? 'Còn' : 'Hết';
            }

            row[col.header] = value;
        });

        return row;
    });
}

export function exportToExcel(data, columns, fileName) {
    try {
        if (!data || data.length === 0) {
            return { success: false, message: 'Không có dữ liệu để xuất' };
        }

        const exportData = formatExportData(data, columns);
        const ws = XLSX.utils.json_to_sheet(exportData);

        const colWidths = [
            { wch: 5 },
            ...columns.map(col => ({
                wch: Math.max(col.header.length + 5, 15)
            }))
        ];
        ws['!cols'] = colWidths;
        ws['!rows'] = [{ hpx: 25 }];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo');

        XLSX.writeFile(wb, `${fileName}_${Date.now()}.xlsx`);

        return { success: true, message: 'Xuất Excel thành công!' };

    } catch (error) {
        console.error('Lỗi xuất Excel:', error);
        return { success: false, message: error.message };
    }
}

export function exportItemsToExcel(items) {
    const columns = [
        { header: 'Tên món', field: 'name' },
        { header: 'Loại', field: 'category_name' },
        { header: 'Giá', field: 'price' },
        { header: 'Trạng thái', field: 'is_available' }
    ];

    return exportToExcel(items, columns, 'Danh sách món');
}

export function exportStaffToExcel(staffs) {
    const columns = [
        { header: 'Tên nhân viên', field: 'name' },
        { header: 'Email', field: 'email' },
        { header: 'Số điện thoại', field: 'phone' },
        { header: 'Chức vụ', field: 'role' }
    ];

    return exportToExcel(staffs, columns, 'Danh sách nhân viên');
}

export function exportCategoryToExcel(categories) {
    const columns = [
        { header: 'Tên loại', field: 'name' },
        { header: 'Mô tả', field: 'description' }
    ];

    return exportToExcel(categories, columns, 'Danh sách danh mục');
}

export function exportOptionToExcel(options) {
    const columns = [
        { header: 'Tên tùy chọn', field: 'name' },
        { header: 'Giá', field: 'price' },
        { header: 'Nhóm', field: 'group_name' }
    ];

    return exportToExcel(options, columns, 'Danh sách topping');
}

export function exportOptionGroupToExcel(groups) {
    const columns = [
        { header: 'Tên nhóm', field: 'name' },
        { header: 'Mô tả', field: 'description' }
    ];

    return exportToExcel(groups, columns, 'Danh sách nhóm topping');
}

export function exportCouponToExcel(coupons) {
    const transformedData = coupons.map(coupon => ({
        code: coupon.code,
        description: coupon.description || '',
        type: coupon.type === 0 ? 'Giảm %' : 'Giảm tiền',
        value: coupon.type === 0 ? `${coupon.value}%` : coupon.value,
        max_discount: coupon.max_discount || '',
        min_amount: coupon.min_amount || 0,
        start_date: new Date(coupon.start_date).toLocaleDateString('vi-VN'),
        end_date: new Date(coupon.end_date).toLocaleDateString('vi-VN'),
        used_count: coupon.used_count || 0,
        usage_limit: coupon.usage_limit || 'Không giới hạn',
        state: coupon.state === 1 ? 'Hoạt động' : 'Tạm ngưng'
    }));

    const columns = [
        { header: 'Mã coupon', field: 'code' },
        { header: 'Mô tả', field: 'description' },
        { header: 'Loại', field: 'type' },
        { header: 'Giá trị', field: 'value' },
        { header: 'Giảm tối đa', field: 'max_discount' },
        { header: 'Đơn tối thiểu', field: 'min_amount' },
        { header: 'Ngày bắt đầu', field: 'start_date' },
        { header: 'Ngày kết thúc', field: 'end_date' },
        { header: 'Đã dùng', field: 'used_count' },
        { header: 'Giới hạn', field: 'usage_limit' },
        { header: 'Trạng thái', field: 'state' }
    ];

    return exportToExcel(transformedData, columns, 'Danh sách mã giảm giá');
}

export function exportInvoiceToExcel(invoices) {
    return;
}       