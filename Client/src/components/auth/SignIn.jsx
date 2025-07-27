import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, X } from "lucide-react";
import { authAPI } from "../../services/api";
import { useDispatch } from "react-redux";
import { setAuthenticated, setIsUser } from "../../store/userSlice";
import { useToast } from "../../hooks/useToast";
import { ClipLoader } from "react-spinners";

const SignIn = ({ onClose, onSwitchToSignUp }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const { showSuccess, showError } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        setIsLoading(true);

        try {
            const response = await authAPI.login({
                username: data.username,
                password: data.password,
            });

            if (response.data.success) {
                dispatch(setAuthenticated(true));
                dispatch(setIsUser(true));
                showSuccess("Login successful!");
                onClose();
            } else {
                dispatch(setAuthenticated(false));
                dispatch(setIsUser(false));
                showError("Login failed. Please check your credentials.");
            }
        } catch (error) {
            console.error("Login error:", error);
            const msg = error.response?.data?.message || "Login failed. Please try again.";
            showError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#E8DDD4] rounded-2xl shadow-2xl w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[#6B7D6A] hover:text-[#3C4142] transition-colors"
                    aria-label="Close"
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-[#3C4142] mb-2">Sign In</h1>
                        <p className="text-[#6B7D6A]">Sign in to your account to continue.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-[#3C4142] mb-2">Username*</label>
                            <div className="relative">
                                <input
                                    {...register("username", {
                                        required: "username is required",
                                        minLength: { value: 4, message: "username must be at least 4 characters" },
                                    })}
                                    type="text"
                                    placeholder="Enter username"
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8FA68E] focus:border-transparent transition-all duration-200 bg-white ${
                                        errors.username
                                            ? "border-red-300 bg-red-50"
                                            : "border-[#8FA68E]/30 hover:border-[#8FA68E]/50"
                                    }`}
                                />
                                {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#3C4142] mb-2">Password*</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: { value: 6, message: "Minimum 6 characters" },
                                    })}
                                    placeholder="Enter your password"
                                    className={`w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8FA68E] focus:border-transparent transition-all duration-200 bg-white ${
                                        errors.password
                                            ? "border-red-300 bg-red-50"
                                            : "border-[#8FA68E]/30 hover:border-[#8FA68E]/50"
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#6B7D6A] hover:text-[#3C4142] transition-colors"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#3C4142] text-white py-3 rounded-lg font-medium hover:bg-[#8FA68E] focus:outline-none focus:ring-2 focus:ring-[#8FA68E] focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <ClipLoader color="#ffffff" size={20} />
                                    <span>Signing In...</span>
                                </div>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-[#6B7D6A] text-sm">
                            Don't have an account?{" "}
                            <button
                                onClick={onSwitchToSignUp}
                                className="text-[#8FA68E] hover:text-[#3C4142] font-medium hover:underline transition-colors"
                            >
                                Create an account
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
