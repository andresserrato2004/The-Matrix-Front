import ReactModal from "react-modal";
import Button from "../shared/Button";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    bgImage?: string;
    className?: string;
    children: React.ReactNode;
    blurAmount?: string;
}

export default function Modal({
    isOpen,
    onClose,
    bgImage = "/parte_cafe.png",
    className = "",
    children,
    blurAmount = "10px"
}: ModalProps) {
    if (typeof document !== "undefined") {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }

    const modalStyle = {
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            backdropFilter: `blur(${blurAmount})`,
            WebkitBackdropFilter: `blur(${blurAmount})`,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        content: {
            position: 'relative' as const,
            inset: 'auto',
            border: 'none',
            background: 'none',
            overflow: 'auto',
            borderRadius: '18px',
            outline: 'none',
            padding: '0',
            width: '100%',
            maxWidth: '30%',
            maxHeight: '80%'
        }
    };

    return (
        <ReactModal
            isOpen={isOpen}
            onRequestClose={onClose}
            style={modalStyle}
            className={`basic-modal ${className}`}
            ariaHideApp={false}
        >
            <div
                className="modal-container"
                style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                {children}

            </div>
        </ReactModal>
    );
}