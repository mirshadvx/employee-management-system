import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { authAPI } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import { ClipLoader } from "react-spinners";

const SignUp = ({ onClose, onSwitchToSignIn }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { showSuccess, showError } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm();

    const password = watch("password");

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const registrationData = {
                username: data.username,
                email: data.email,
                password: data.password,
                password2: data.password2,
            };
            const response = await authAPI.register(registrationData);
            console.log(response);
            showSuccess("Account created successfully!");
            onClose();
        } catch (error) {
            console.error(error);
            const errorMsg =
                error.response?.data?.message || error.response?.data?.error || "Registration failed. Please try again.";
            showError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-5 p-4">
            <div className="bg-[#E8DDD4] rounded-2xl shadow-2xl w-full max-w-md relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[#6B7D6A] hover:text-[#3C4142] transition-colors z-10"
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="p-8">
                    <div className="mb-5">
                        <h1 className="text-2xl font-bold text-[#3C4142] mb-2">Create an Account</h1>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-[#3C4142] mb-1">Username*</label>
                            <input
                                {...register("username", {
                                    required: "username is required",
                                    minLength: { value: 4, message: "username must be at least 4 characters" },
                                })}
                                type="text"
                                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8FA68E] focus:border-transparent transition-all duration-200 bg-white ${
                                    errors.username
                                        ? "border-red-300 bg-red-50"
                                        : "border-[#8FA68E]/30 hover:border-[#8FA68E]/50"
                                }`}
                            />
                            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#3C4142] mb-1">Email</label>
                            <input
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^\S+@\S+$/i,
                                        message: "Please enter a valid email",
                                    },
                                })}
                                type="email"
                                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8FA68E] focus:border-transparent transition-all duration-200 bg-white ${
                                    errors.email
                                        ? "border-red-300 bg-red-50"
                                        : "border-[#8FA68E]/30 hover:border-[#8FA68E]/50"
                                }`}
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#3C4142] mb-1">Password</label>
                            <div className="relative">
                                <input
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: { value: 8, message: "Password must be at least 8 characters" },
                                        pattern: {
                                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                            message:
                                                "Password must contain at least one uppercase letter, one lowercase letter, and one number",
                                        },
                                    })}
                                    type={showPassword ? "text" : "password"}
                                    className={`w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8FA68E] focus:border-transparent transition-all duration-200 bg-white ${
                                        errors.password
                                            ? "border-red-300 bg-red-50"
                                            : "border-[#8FA68E]/30 hover:border-[#8FA68E]/50"
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#6B7D6A] hover:text-[#3C4142] transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                        </div>

                        <div className="">
                            <label className="block text-sm font-medium text-[#3C4142] mb-1">Confirm Password</label>
                            <div className="relative">
                                <input
                                    {...register("password2", {
                                        required: "Please confirm your password",
                                        validate: (value) => value === password || "Passwords do not match",
                                    })}
                                    type={showConfirmPassword ? "text" : "password"}
                                    className={`w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8FA68E] focus:border-transparent transition-all duration-200 bg-white ${
                                        errors.confirmPassword
                                            ? "border-red-300 bg-red-50"
                                            : "border-[#8FA68E]/30 hover:border-[#8FA68E]/50"
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#6B7D6A] hover:text-[#3C4142] transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#3C4142] text-white py-3 rounded-lg font-medium
                             hover:bg-[#8FA68E] focus:outline-none focus:ring-2 focus:ring-[#8FA68E] focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <ClipLoader color="#ffffff" size={20} />
                                    Creating Account...
                                </div>
                            ) : (
                                "Sign Up"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-[#6B7D6A] text-sm">
                            Already have an account?{" "}
                            <button
                                onClick={onSwitchToSignIn}
                                className="text-[#8FA68E] hover:text-[#3C4142] font-medium hover:underline transition-colors"
                            >
                                Sign in
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
