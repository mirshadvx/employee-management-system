import React, { useState } from "react";
import { Users, Building } from "lucide-react";
import Navbar from "../components/Navbar/Navbar";
import EmployeeDetails from "../components/Dashboard/EmployeeDetails";
import DepartmentOverview from "../components/Dashboard/DepartmentOverview";

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState("employees");

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#E8DDD4] to-white">
            <Navbar />
            <div className="container mx-auto px-4 py-5">
                <div className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
                    <div className="flex border-b border-[#8FA68E]/20">
                        <button
                            onClick={() => setActiveTab("employees")}
                            className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                                activeTab === "employees"
                                    ? "bg-[#8FA68E] text-white"
                                    : "text-[#3C4142] hover:bg-[#E8DDD4]/50"
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Users className="text-xl" />
                                Employee Details
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab("departments")}
                            className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                                activeTab === "departments"
                                    ? "bg-[#8FA68E] text-white"
                                    : "text-[#3C4142] hover:bg-[#E8DDD4]/50"
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Building className="text-xl" />
                                Department Overview
                            </div>
                        </button>
                    </div>
                    <div className="p-6">{activeTab === "employees" ? <EmployeeDetails /> : <DepartmentOverview />}</div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
