import { useRef } from 'react';
import { MdClose, MdDownload } from 'react-icons/md';
import QRCode from 'react-qr-code';
import styles from './ModalQRCode.module.css';

function ModalQRCode({ show, table, onClose }) {
    const qrRef = useRef();

    const handleDownload = () => {
        const svg = qrRef.current.querySelector('svg');
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL('image/png');

            const downloadLink = document.createElement('a');
            downloadLink.download = `QR-${table?.name}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    if (!show || !table) return null;

    const qrUrl = `${window.location.origin}/?table=${table.table_id}`;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>{table.name}</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <MdClose size={24} />
                    </button>
                </div>

                <div className={styles.qrContainer} ref={qrRef}>
                    <QRCode
                        value={qrUrl}
                        size={280}
                        level="H"
                        style={{ margin: '20px auto', display: 'block' }}
                    />
                    <p className={styles.qrCode}>{table.name}</p>
                    <p className={styles.qrUrl}>{qrUrl}</p>
                </div>

                <button className={styles.btnDownload} onClick={handleDownload}>
                    <MdDownload size={20} />
                    Tải xuống
                </button>
            </div>
        </div>
    );
}

export default ModalQRCode;
