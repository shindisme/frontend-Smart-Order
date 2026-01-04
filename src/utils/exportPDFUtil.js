import { jsPDF } from 'jspdf';

export function printInvoice(orderData, restaurantInfo = {}) {
    try {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [80, 200]
        });

        doc.setFont('Courier');
        doc.setLanguage('vi');

        // !HEADER
        doc.setFontSize(14);
        doc.setFont('Courier', 'bold');
        doc.text(restaurantInfo.name || 'QUÁN ĂN KUN GA CHU', 40, 10, { align: 'center' });

        doc.setFontSize(9);
        doc.setFont('Courier', 'normal');
        if (restaurantInfo.address) {
            doc.text(restaurantInfo.address, 40, 15, { align: 'center' });
        }
        if (restaurantInfo.phone) {
            doc.text(restaurantInfo.phone, 40, 19, { align: 'center' });
        }

        // Divider
        doc.setDrawColor(0);
        doc.line(5, 22, 75, 22);

        // Thông tin đơn
        doc.setFontSize(9);
        const now = new Date();
        const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        doc.text(`Bàn: ${orderData.table || '1'}`, 5, 27);
        doc.text(`Ngày: ${dateStr}`, 5, 32);
        doc.text(`Giờ: ${timeStr}`, 5, 37);

        doc.line(5, 40, 75, 40);

        // Món
        let y = 45;
        doc.setFont('Courier', 'bold');
        doc.setFontSize(9);
        doc.text('Tên Món', 5, y);
        doc.text('SL', 50, y);
        doc.text('Giá', 60, y);

        y += 3;
        doc.line(5, y, 75, y);

        y += 5;
        doc.setFont('Courier', 'normal');
        doc.setFontSize(8);

        let totalAmount = 0;

        orderData.items.forEach(item => {
            const itemName = String(item.name || '').substring(0, 20);
            const quantity = item.quantity || 1;
            const price = item.price || 0;
            const total = quantity * price;
            totalAmount += total;

            // Tên món
            const nameLines = doc.splitTextToSize(itemName, 40);
            nameLines.forEach((line, idx) => {
                doc.text(line, 5, y + (idx * 4));
            });

            // SL
            doc.text(String(quantity), 50, y);

            // Giá
            const priceStr = new Intl.NumberFormat('vi-VN').format(total);
            doc.text(priceStr, 60, y);

            y += Math.max(nameLines.length * 4, 5);
        });

        // Tổng
        y += 2;
        doc.line(5, y, 75, y);
        y += 5;

        doc.setFont('Courier', 'bold');
        doc.setFontSize(10);
        const totalStr = new Intl.NumberFormat('vi-VN').format(totalAmount);
        doc.text('TỔNG CỘNG:', 5, y);
        doc.text(totalStr + 'đ', 60, y);

        // ! FOOTER
        y += 10;
        doc.setFont('Courier', 'normal');
        doc.setFontSize(8);
        doc.text('Cảm ơn quý khách!', 40, y, { align: 'center' });
        doc.text('Hẹn gặp lại!', 40, y + 4, { align: 'center' });

        // Lưu
        const fileName = `HoaDon_${Date.now()}.pdf`;
        doc.save(fileName);

        return { success: true, message: 'In hóa đơn thành công!' };

    } catch (error) {
        console.error('Lỗi in hóa đơn:', error);
        return { success: false, message: error.message };
    }
}
