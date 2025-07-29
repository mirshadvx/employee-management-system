import { useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useSelector((state) => state.user);

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }
    return children;
};

export default ProtectedRoute;
