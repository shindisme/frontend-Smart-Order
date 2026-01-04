import styles from './ConfirmModal.module.css';

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText }) {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h3>{title}</h3>
                <p>{message}</p>
                <div className={styles.actions}>
                    <button className={styles.btnCancel} onClick={onClose}>
                        {cancelText || 'Hủy'}
                    </button>
                    <button className={styles.btnConfirm} onClick={onConfirm}>
                        {confirmText || 'Xác nhận'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
