import { jsPDF } from 'jspdf';

export function printInvoice(orderData, restaurantInfo = {}) {
    try {
        const items = orderData.items || [];

        let totalContentHeight = 0;

        items.forEach((item) => {
            const baseName = convertVietnamese(
                String(item.name || item.product_name || 'N/A')
            );

            const tempDoc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            tempDoc.setFont('Courier', 'normal');
            tempDoc.setFontSize(7);

            const nameLines = tempDoc.splitTextToSize(baseName, 40);
            let itemHeight = nameLines.length * 3.5;

            if (item.options && item.options.length > 0) {
                tempDoc.setFontSize(6);
                item.options.forEach((opt) => {
                    const optionText = convertVietnamese(`+ ${opt.name}`);
                    const optLines = tempDoc.splitTextToSize(optionText, 40);
                    itemHeight += optLines.length * 3.2;
                });
            }

            totalContentHeight += Math.max(itemHeight, 4);
        });

        const baseHeight = 60;
        const totalSection = 16;
        const discountHeight = parseFloat(orderData.discount) > 0 ? 4 : 0;

        const pageHeight = baseHeight + totalContentHeight + totalSection + discountHeight + 10;
        const minHeight = 100;
        const finalPageHeight = Math.max(pageHeight, minHeight);

        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [80, finalPageHeight]
        });

        doc.setFont('Courier');

        // header
        doc.setFontSize(12);
        doc.setFont('Courier', 'bold');
        const name = convertVietnamese(restaurantInfo.name || 'QUAN AN');
        doc.text(name, 40, 10, { align: 'center' });

        doc.setFontSize(8);
        doc.setFont('Courier', 'normal');
        if (restaurantInfo.address) {
            const address = convertVietnamese(restaurantInfo.address);
            doc.text(address, 40, 15, { align: 'center' });
        }
        if (restaurantInfo.phone) {
            doc.text(restaurantInfo.phone, 40, 19, { align: 'center' });
        }

        doc.setDrawColor(0);
        doc.line(5, 22, 75, 22);

        // content
        doc.setFontSize(8);
        const now = new Date(orderData.created_at || Date.now());
        const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        doc.text(`Ban: ${convertVietnamese(orderData.table_name || '1')}`, 5, 27);
        doc.text(`Ma HD: ${(orderData.invoice_id || '').substring(0, 13).toUpperCase()}`, 5, 31);
        doc.text(`Ngay: ${dateStr}`, 5, 35);
        doc.text(`Gio: ${timeStr}`, 45, 35);

        doc.line(5, 38, 75, 38);

        let y = 42;
        doc.setFont('Courier', 'bold');
        doc.setFontSize(8);
        doc.text('STT', 5, y);
        doc.text('Ten mon', 12, y);
        doc.text('SL', 50, y);
        doc.text('Tien', 62, y);

        y += 2;
        doc.line(5, y, 75, y);
        y += 4;

        doc.setFont('Courier', 'normal');
        doc.setFontSize(7);

        let totalAmount = 0;

        items.forEach((item, index) => {
            const baseName = convertVietnamese(
                String(item.name || item.product_name || 'N/A')
            );

            const quantity = item.quantity || 1;
            const price = parseFloat(item.price) || 0;

            let toppingTotal = 0;
            if (item.options && item.options.length > 0) {
                item.options.forEach((opt) => {
                    toppingTotal += parseFloat(opt.plus_price) || 0;
                });
            }

            const itemTotal = (price + toppingTotal) * quantity;
            totalAmount += itemTotal;

            // STT
            doc.text(String(index + 1), 5, y);

            const nameLines = doc.splitTextToSize(baseName, 40);
            let currentY = y;
            nameLines.forEach((line, idx) => {
                doc.text(line, 12, currentY + idx * 3.5);
            });

            let nameHeight = nameLines.length * 3.5;
            currentY = y + nameHeight;

            if (item.options && item.options.length > 0) {
                doc.setFont('Courier', 'normal');
                doc.setFontSize(6);
                item.options.forEach((opt) => {
                    const optionText = convertVietnamese(`+ ${opt.name}`);
                    const optLines = doc.splitTextToSize(optionText, 40);
                    const optPrice = parseFloat(opt.plus_price) || 0;

                    optLines.forEach((optLine, idx) => {
                        doc.text(optLine, 12, currentY);

                        if (idx === 0 && optPrice > 0) {
                            doc.text(formatMoney(optPrice), 62, currentY);
                        }

                        currentY += 3.2;
                    });
                });
                doc.setFont('Courier', 'normal');
                doc.setFontSize(7);
            }

            doc.setFontSize(7);
            doc.text(String(quantity), 50, y);
            const basePrice = price * quantity;
            doc.text(formatMoney(basePrice), 62, y);

            let totalItemHeight = nameHeight;
            if (item.options && item.options.length > 0) {
                item.options.forEach((opt) => {
                    const optionText = convertVietnamese(`+ ${opt.name}`);
                    const tempDoc = new jsPDF({
                        orientation: 'portrait',
                        unit: 'mm',
                        format: 'a4'
                    });
                    tempDoc.setFont('Courier', 'normal');
                    tempDoc.setFontSize(6);
                    const optLines = tempDoc.splitTextToSize(optionText, 40);
                    totalItemHeight += optLines.length * 3.2;
                });
            }

            y += Math.max(totalItemHeight, 4) + 1;
        });

        // tính tổng
        y += 1;
        doc.line(5, y, 75, y);
        y += 4;

        doc.setFont('Courier', 'bold');
        doc.setFontSize(9);
        doc.text('Tong cong:', 5, y);
        doc.text(formatMoney(totalAmount), 62, y);

        let discount = parseFloat(orderData.discount) || 0;
        if (discount > 0) {
            y += 4;
            doc.setFont('Courier', 'normal');
            doc.setFontSize(8);
            doc.text('Giam gia:', 5, y);
            doc.text('-' + formatMoney(discount), 62, y);
        }

        // thàn tiền
        y += 4;
        doc.setFont('Courier', 'bold');
        doc.setFontSize(10);
        const finalTotal = totalAmount - discount;
        doc.text('THANH TIEN:', 5, y);
        doc.text(formatMoney(finalTotal), 62, y);

        y += 8;
        doc.setFont('Courier', 'normal');
        doc.setFontSize(8);
        doc.text('Cam on quy khach!', 40, y, { align: 'center' });
        doc.text('Hen gap lai!', 40, y + 4, { align: 'center' });

        const fileName = `HoaDon_${orderData.table_name}_${Date.now()}.pdf`;
        doc.save(fileName);

        return { success: true, message: 'In hoa don thanh cong!' };

    } catch (error) {
        return { success: false, message: error.message };
    }
}

function formatMoney(num) {
    const parsed = parseFloat(num) || 0;
    return parsed.toLocaleString('vi-VN').replace(/\./g, ',') + 'd';
}

function convertVietnamese(str) {
    if (!str) return '';

    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');

    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
    str = str.replace(/Đ/g, 'D');

    return str;
}

export default { printInvoice };
