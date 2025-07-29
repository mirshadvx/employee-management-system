import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import { Toaster } from "sonner";
import ProtectedRoute from "./routes/ProtectedRoute";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setAuthenticated, setUser, setIsUser, logoutReducer } from "./store/userSlice";
import { authAPI, userAPI } from "./services/api";

function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const authRes = await authAPI.isAuthenticated();
                if (authRes.data?.success) {
                    dispatch(setAuthenticated(true));
                    const userRes = await userAPI.fetchUserDetails();
                    dispatch(setUser(userRes.data));
                    dispatch(setIsUser());
                    return;
                }
            } catch (_) {}

            try {
                const refreshRes = await authAPI.refreshToken();
                if (refreshRes.data?.refreshed) {
                    const authRes = await authAPI.isAuthenticated();
                    if (authRes.data?.success) {
                        dispatch(setAuthenticated(true));
                        const userRes = await userAPI.fetchUserDetails();
                        dispatch(setUser(userRes.data));
                        dispatch(setIsUser());
                        return;
                    }
                }
            } catch (_) {}

            dispatch(logoutReducer());
        };

        checkAuth();
    }, [dispatch]);

    return (
        <BrowserRouter>
            <Toaster
                position="bottom-right"
                toastOptions={{
                    duration: 5000,
                    style: {
                        background: "#333",
                        color: "#fff",
                    },
                }}
            />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
