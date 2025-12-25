import { Modal, Button } from "react-bootstrap";

function ModalConfirm({ show, title, message, onClose, onConfirm, loading }) {
    return (
        <Modal show={show} onHide={onClose} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{title || "Xác nhận"}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <p className="fw-normal">{message || "Bạn có chắc chắn muốn thực hiện hành động này không?"}</p>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onClose} disabled={loading}>
                    Hủy
                </Button>
                <Button variant="danger" onClick={onConfirm} disabled={loading}>
                    {loading ? "Đang xóa..." : "Xóa"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalConfirm;
