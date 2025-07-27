import { toast } from "sonner";

export const useToast = () => {
    const showSuccess = (message, options = {}) => {
        toast.success(message, {
            duration: 4000,
            style: {
                background: "#8FA68E",
                color: "#E8DDD4",
                border: "1px solid #6B7D6A",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
            },
            ...options,
        });
    };

    const showError = (message, options = {}) => {
        toast.error(message, {
            duration: 6000,
            style: {
                background: "#D4756B",
                color: "#E8DDD4",
                border: "1px solid #B85C50",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
            },
            ...options,
        });
    };

    const showInfo = (message, options = {}) => {
        toast.info(message, {
            duration: 4000,
            style: {
                background: "#E8DDD4",
                color: "#3C4142",
                border: "1px solid #8FA68E",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
            },
            ...options,
        });
    };

    const showWarning = (message, options = {}) => {
        toast.warning(message, {
            duration: 5000,
            style: {
                background: "#C4A875",
                color: "#3C4142",
                border: "1px solid #A8935D",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
            },
            ...options,
        });
    };

    return {
        showSuccess,
        showError,
        showInfo,
        showWarning,
    };
};