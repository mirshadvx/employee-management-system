import React, { useState, useEffect } from "react";
import { Camera, User, X, Eye, EyeOff } from "lucide-react";
import api, { userAPI } from "../services/api";
import Navbar from "../components/Navbar/Navbar";

const Profile = () => {
    const [userData, setUserData] = useState({
        username: "",
        email: "",
        profilePicture: null,
    });

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isProfilePicModalOpen, setIsProfilePicModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await userAPI.fetchUserDetails();
                setUserData({
                    username: response.data.username,
                    email: response.data.email,
                    profilePicture: response.data.profile_picture,
                });
            } catch (error) {
                console.error("Failed to fetch user details:", error);
            }
        };

        fetchUserDetails();
    }, []);

    const handleProfilePictureUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append("profile_picture", file);

            try {
                const response = await userAPI.updateProfilePicture(formData);
                setUserData((prev) => ({
                    ...prev,
                    profilePicture: response.data.profile_picture,
                }));
                setIsProfilePicModalOpen(false);
            } catch (error) {
                console.error("Failed to update profile picture:", error);
            }
        }
    };

    const removeProfilePicture = async () => {
        try {
            const response = await userAPI.updateProfilePicture({ profile_picture: null });
            setUserData((prev) => ({ ...prev, profilePicture: null }));
            setIsProfilePicModalOpen(false);
        } catch (error) {
            console.error("Failed to remove profile picture:", error);
        }
    };

    const handlePasswordChange = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("New passwords do not match!");
            return;
        }

        try {
            await userAPI.changePassword({
                current_password: passwordData.currentPassword,
                new_password: passwordData.newPassword,
            });
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setIsPasswordModalOpen(false);
        } catch (error) {
            console.error("Failed to change password:", error);
        }
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#f5f0e8" }}>
            <Navbar />
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-8">
                        <div className="flex flex-col items-center mb-8">
                            <div className="relative">
                                <div
                                    className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shadow-lg"
                                    style={{ backgroundColor: "#8fa68e" }}
                                >
                                    {userData.profilePicture ? (
                                        <img
                                            src={userData.profilePicture}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User size={48} className="text-white" />
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsProfilePicModalOpen(true)}
                                    className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
                                    style={{ backgroundColor: "#3a3a3a" }}
                                >
                                    <Camera size={20} className="text-white" />
                                </button>
                            </div>
                            <h2 className="text-2xl font-bold mt-4" style={{ color: "#3a3a3a" }}>
                                {userData.username}
                            </h2>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-gray-50 rounded-lg p-6">
                                <label className="block text-sm font-medium mb-2" style={{ color: "#5a5a5a" }}>
                                    Username
                                </label>
                                <div className="flex items-center justify-between">
                                    <span className="text-lg" style={{ color: "#3a3a3a" }}>
                                        {userData.username}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-6">
                                <label className="block text-sm font-medium mb-2" style={{ color: "#5a5a5a" }}>
                                    Email Address
                                </label>
                                <div className="flex items-center justify-between">
                                    <span className="text-lg" style={{ color: "#3a3a3a" }}>
                                        {userData.email}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-6">
                                <label className="block text-sm font-medium mb-2" style={{ color: "#5a5a5a" }}>
                                    Password
                                </label>
                                <div className="flex items-center justify-between">
                                    <span className="text-lg" style={{ color: "#3a3a3a" }}>
                                        ••••••••••••
                                    </span>
                                    <button
                                        onClick={() => setIsPasswordModalOpen(true)}
                                        className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                                        style={{ backgroundColor: "#8fa68e" }}
                                    >
                                        Change Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isPasswordModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold" style={{ color: "#3a3a3a" }}>
                                Change Password
                            </h3>
                            <button
                                onClick={() => setIsPasswordModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: "#5a5a5a" }}>
                                    Current Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.current ? "text" : "password"}
                                        value={passwordData.currentPassword}
                                        onChange={(e) =>
                                            setPasswordData((prev) => ({
                                                ...prev,
                                                currentPassword: e.target.value,
                                            }))
                                        }
                                        className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50"
                                        style={{ focusRingColor: "#8fa68e" }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPasswords((prev) => ({
                                                ...prev,
                                                current: !prev.current,
                                            }))
                                        }
                                        className="absolute right-3 top-2.5 text-gray-500"
                                    >
                                        {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: "#5a5a5a" }}>
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.new ? "text" : "password"}
                                        value={passwordData.newPassword}
                                        onChange={(e) =>
                                            setPasswordData((prev) => ({
                                                ...prev,
                                                newPassword: e.target.value,
                                            }))
                                        }
                                        className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50"
                                        style={{ focusRingColor: "#8fa68e" }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPasswords((prev) => ({
                                                ...prev,
                                                new: !prev.new,
                                            }))
                                        }
                                        className="absolute right-3 top-2.5 text-gray-500"
                                    >
                                        {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: "#5a5a5a" }}>
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.confirm ? "text" : "password"}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) =>
                                            setPasswordData((prev) => ({
                                                ...prev,
                                                confirmPassword: e.target.value,
                                            }))
                                        }
                                        className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50"
                                        style={{ focusRingColor: "#8fa68e" }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPasswords((prev) => ({
                                                ...prev,
                                                confirm: !prev.confirm,
                                            }))
                                        }
                                        className="absolute right-3 top-2.5 text-gray-500"
                                    >
                                        {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-4 mt-8">
                            <button
                                onClick={() => setIsPasswordModalOpen(false)}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePasswordChange}
                                className="flex-1 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: "#8fa68e" }}
                            >
                                Update Password
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isProfilePicModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold" style={{ color: "#3a3a3a" }}>
                                Update Profile Picture
                            </h3>
                            <button
                                onClick={() => setIsProfilePicModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <label className="block">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfilePictureUpload}
                                    className="hidden"
                                />
                                <div className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-gray-400 transition-colors">
                                    <Camera size={32} className="mx-auto mb-2 text-gray-500" />
                                    <p className="text-gray-600">Click to upload new picture</p>
                                    <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                                </div>
                            </label>
                            {userData.profilePicture && (
                                <button
                                    onClick={removeProfilePicture}
                                    className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    Remove Current Picture
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setIsProfilePicModalOpen(false)}
                            className="w-full mt-6 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
