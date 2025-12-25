import { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import styles from './PaymentMethod.module.css';
import { IoArrowUndo, IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { FaMoneyBillWave, FaCreditCard, FaWallet } from 'react-icons/fa';

const PAYMENT_METHODS = [
    {
        id: 'cash',
        name: 'Tiền mặt (COD)',
        icon: <FaMoneyBillWave size={24} />,
        description: 'Thanh toán khi bằng tiền mặt',
        type: 'single'
    },
    {
        id: 'bank',
        name: 'Ngân hàng',
        icon: <FaCreditCard size={24} />,
        description: 'Chuyển khoản qua ngân hàng',
        type: 'single'
    },
    {
        id: 'ewallet',
        name: 'Ví điện tử',
        icon: <FaWallet size={24} />,
        description: 'Thanh toán qua ví điện tử',
        type: 'group',
        children: [
            {
                id: 'momo',
                name: 'Ví Momo',
                icon: <FaWallet size={20} />,
                description: 'Thanh toán qua ví Momo'
            },
            {
                id: 'vnpay',
                name: 'VNPay',
                icon: <FaWallet size={20} />,
                description: 'Thanh toán qua VNPay'
            },
        ]
    }
];

function PaymentMethod() {
    const navigate = useNavigate();
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [expandedGroup, setExpandedGroup] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem('selectedPaymentMethod');
        if (saved) {
            const parsedMethod = JSON.parse(saved);
            setSelectedMethod(parsedMethod);

            if (parsedMethod.parentId === 'ewallet') {
                setExpandedGroup('ewallet');
            }
        }
    }, []);

    const handleSelectSingle = (method) => {
        setSelectedMethod(method);
        setExpandedGroup(null);
    };

    const handleToggleGroup = (groupId) => {
        setExpandedGroup(expandedGroup === groupId ? null : groupId);
    };

    const handleSelectChild = (parent, child) => {
        setSelectedMethod({
            ...child,
            parentId: parent.id,
            parentName: parent.name
        });
    };

    const handleConfirm = () => {
        if (!selectedMethod) {
            alert('Vui lòng chọn phương thức thanh toán!');
            return;
        }

        localStorage.setItem('selectedPaymentMethod', JSON.stringify(selectedMethod));

        navigate('/order-confirm');
    };

    return (
        <>
            {/* Header */}
            <header className={styles.header}>
                <NavLink to='/order-confirm' className={styles.backButton}>
                    <IoArrowUndo size={24} />
                </NavLink>
                <h2 className={styles.title}>Phương thức thanh toán</h2>
            </header>

            {/* Main */}
            <main className={styles.main}>
                {PAYMENT_METHODS.map(method => (
                    <div key={method.id}>

                        <div
                            className={`${styles.methodCard} ${method.type === 'single' && selectedMethod?.id === method.id ? styles.selected : ''
                                } ${method.type === 'group' && expandedGroup === method.id
                                    ? styles.expanded
                                    : ''
                                }`}
                            onClick={() => {
                                if (method.type === 'single') {
                                    handleSelectSingle(method);
                                } else {
                                    handleToggleGroup(method.id);
                                }
                            }}
                        >
                            {/* Icon */}
                            <div className={styles.methodIcon}>
                                {method.icon}
                            </div>

                            {/* Info */}
                            <div className={styles.methodInfo}>
                                <h4>{method.name}</h4>
                                <p>{method.description}</p>
                            </div>

                            {/* Radio or Chevron */}
                            {method.type === 'single' ? (
                                <input
                                    type="radio"
                                    checked={selectedMethod?.id === method.id}
                                    onChange={() => { }}
                                    aria-label={method.name}
                                />
                            ) : (
                                <div className={styles.chevronIcon}>
                                    {expandedGroup === method.id ? (
                                        <IoChevronUp size={20} />
                                    ) : (
                                        <IoChevronDown size={20} />
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Children (Dropdown) */}
                        {method.type === 'group' && expandedGroup === method.id && (
                            <div className={styles.childrenContainer}>
                                {method.children.map(child => (
                                    <div
                                        key={child.id}
                                        className={`${styles.childCard} ${selectedMethod?.id === child.id
                                            ? styles.selected
                                            : ''
                                            }`}
                                        onClick={() => handleSelectChild(method, child)}
                                    >
                                        {/* Child Icon */}
                                        <div className={styles.childIcon}>
                                            {child.icon}
                                        </div>

                                        {/* Child Info */}
                                        <div className={styles.childInfo}>
                                            <h5>{child.name}</h5>
                                            <p>{child.description}</p>
                                        </div>

                                        {/* Radio */}
                                        <input
                                            type="radio"
                                            checked={selectedMethod?.id === child.id}
                                            onChange={() => { }}
                                            aria-label={child.name}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </main>

            {/* Footer */}
            <footer className={styles.footer}>
                <button
                    className={styles.confirmButton}
                    onClick={handleConfirm}
                    disabled={!selectedMethod}
                >
                    Xác nhận
                </button>
            </footer>
        </>
    );
}

export default PaymentMethod;
