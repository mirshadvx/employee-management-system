import React, { useState, useEffect, useCallback } from "react";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import CreateDepartmentModal from "./modals/CreateDepartmentModal";
import departmentApi from "../../services/department";
import { useToast } from "../../hooks/useToast";
import { debounce } from "lodash";

const DepartmentOverview = () => {
    const [deptSearchTerm, setDeptSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [editingDepartment, setEditingDepartment] = useState(null);
    const { showError, showSuccess } = useToast();

    const fetchDepartments = useCallback(
        debounce(async (searchTerm) => {
            try {
                const params = {};
                if (searchTerm) {
                    params.name = searchTerm;
                }
                const response = await departmentApi.getAll({ params });
                if (response.data.success) {
                    setDepartments(response.data.data);
                } else {
                    showError("Failed to load departments.");
                }
            } catch (error) {
                console.error("Error fetching departments:", error);
                showError("Failed to load departments.");
            }
        }, 500),
        []
    );

    useEffect(() => {
        fetchDepartments(deptSearchTerm);
        return () => fetchDepartments.cancel();
    }, [deptSearchTerm, fetchDepartments]);

    const getDepartmentStats = () => {
        return departments.map((dept) => ({
            id: dept.id,
            name: dept.name,
            label: dept.label,
            totalEmployees: dept.total_employees || 0,
        }));
    };

    const handleCreateDepartment = async (newDept) => {
        try {
            const response = await departmentApi.create(newDept);
            if (response.data.success) {
                setDepartments([...departments, response.data.data]);
                showSuccess("Department created successfully.");
            } else {
                showError("Failed to create department.");
            }
        } catch (error) {
            console.error("Error creating department:", error);
            showError("Failed to create department.");
        }
        setShowModal(false);
    };

    const handleEditDepartmentClick = (dept) => {
        setEditingDepartment(dept);
        setShowModal(true);
    };

    const handleUpdateDepartment = async (updatedDept) => {
        try {
            const response = await departmentApi.update(editingDepartment.id, updatedDept);
            if (response.data.success) {
                setDepartments(departments.map((dept) => (dept.id === editingDepartment.id ? response.data.data : dept)));
                showSuccess("Department updated successfully.");
            } else {
                showError("Failed to update department.");
            }
        } catch (error) {
            console.error("Error updating department:", error);
            showError("Failed to update department.");
        }
        setShowModal(false);
        setEditingDepartment(null);
    };

    const handleDeleteDepartmentClick = async (dept) => {
        if (!window.confirm(`Are you sure you want to delete ${dept.name}?`)) {
            return;
        }
        try {
            const response = await departmentApi.delete(dept.id);
            if (response.data.success) {
                setDepartments(departments.filter((d) => d.id !== dept.id));
                showSuccess("Department deleted successfully.");
            } else {
                showError(response.data.message || "Failed to delete department.");
            }
        } catch (error) {
            console.error("Error deleting department:", error);
            showError(error.response?.data?.message || "Failed to delete department.");
        }
    };

    return (
        <>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Search className="text-[#8FA68E] text-xl" />
                    <input
                        type="text"
                        placeholder="Search departments..."
                        value={deptSearchTerm}
                        onChange={(e) => setDeptSearchTerm(e.target.value)}
                        className="px-3 py-2 border border-[#8FA68E]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8FA68E] bg-white min-w-[250px]"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-[#3C4142] font-semibold">Total Departments: {getDepartmentStats().length}</div>
                    <button
                        onClick={() => {
                            setEditingDepartment(null);
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 px-6 py-2 bg-[#8FA68E] text-white rounded-full hover:bg-[#3C4142] transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg font-semibold"
                    >
                        <Plus className="text-xl" />
                        Create Department
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getDepartmentStats().map((dept) => (
                    <div
                        key={dept.id}
                        className="bg-white border border-[#8FA68E]/20 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-[#3C4142]">{dept.name}</h3>
                                <p className="text-sm text-gray-600">{dept.label}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleEditDepartmentClick(dept)}
                                    className="text-[#8FA68E] hover:text-[#3C4142] transition-colors"
                                    title="Edit"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDeleteDepartmentClick(dept)}
                                    className="text-red-500 hover:text-red-700 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[#3C4142] font-medium">Total Employees:</span>
                                <span className="text-[#8FA68E] font-bold text-lg">{dept.totalEmployees}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {getDepartmentStats().length === 0 && (
                <div className="text-center py-12">
                    <p className="text-[#8FA68E] text-lg">No departments found matching your search.</p>
                </div>
            )}
            <CreateDepartmentModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingDepartment(null);
                }}
                onCreate={editingDepartment ? handleUpdateDepartment : handleCreateDepartment}
                initialData={editingDepartment}
            />
        </>
    );
};

export default DepartmentOverview;
