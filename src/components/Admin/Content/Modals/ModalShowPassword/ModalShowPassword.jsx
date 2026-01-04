import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function ModalShowPassword({ show, data, onClose }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (data?.password) {
            navigator.clipboard.writeText(data.password);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered backdrop='static'>
            <Modal.Header closeButton style={{ backgroundColor: '#198754', color: 'white' }}>
                <Modal.Title>
                    <i className="bi bi-check-circle me-2"></i>
                    Thông tin đăng nhập
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="alert alert-warning">
                    <small>
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        <strong>Lưu ý:</strong> Hãy sao chép và gửi thông tin này cho nhân viên. Mật khẩu sẽ không hiển thị lại!
                    </small>
                </div>

                <form className="row g-3">
                    <div className="col-12">
                        <label className="form-label">Họ tên</label>
                        <input
                            type="text"
                            className="form-control"
                            value={data?.fullname || ""}
                            disabled
                        />
                    </div>

                    <div className="col-12">
                        <label className="form-label">Tài khoản</label>
                        <input
                            type="text"
                            className="form-control"
                            value={data?.username || ""}
                            disabled
                        />
                    </div>

                    <div className="col-12">
                        <label className="form-label">Mật khẩu</label>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control bg-light fw-bold text-danger"
                                value={data?.password || ""}
                                disabled
                                style={{ fontSize: '18px', letterSpacing: '2px' }}
                            />
                            <button
                                className={`btn ${copied ? 'btn-success' : 'btn-outline-secondary'}`}
                                type="button"
                                onClick={handleCopy}
                            >
                                {copied ? (
                                    <>
                                        <i className="bi bi-check-lg me-1"></i>
                                        Đã sao chép
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-clipboard me-1"></i>
                                        Sao chép
                                    </>
                                )}
                            </button>
                        </div>
                        <small className="text-muted">
                            Mật khẩu được tạo tự động, nhân viên có thể đổi sau khi đăng nhập
                        </small>
                    </div>
                </form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="primary" onClick={onClose}>
                    Đã lưu thông tin
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalShowPassword;
