import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import CreateForm from "./modals/CreateForm";
import AddEmployee from "./modals/AddEmployee";
import EditForm from "./modals/EditForm";
import api from "../../services/api";
import { useToast } from "../../hooks/useToast";

const EmployeeDetails = () => {
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
    const [isCreateFormModalOpen, setIsCreateFormModalOpen] = useState(false);
    const [isCreateEmployeeFormModalOpen, SetCreateEmployeeFormModalOpen] = useState(false);
    const [newEmployee, setNewEmployee] = useState({});
    const [departments, setDepartments] = useState([]);
    const [formStructure, setFormStructure] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [isEditFormModalOpen, setIsEditFormModalOpen] = useState(false);
    const { showError, showSuccess } = useToast();

    const fetchFormStructure = async () => {
        if (selectedDepartment) {
            try {
                const response = await api.get(`form-structure/${selectedDepartment}/`);
                if (response.data) {
                    setFormStructure(response.data);
                }
            } catch (error) {
                console.error("Error fetching form structure:", error);
                showError("Failed to load form structure.");
            }
        } else {
            setFormStructure(null);
        }
    };

    useEffect(() => {
        fetchFormStructure();
    }, [selectedDepartment]);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await api.get("departments/");
                if (response.data.success) {
                    setDepartments(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching departments:", error);
                showError("Failed to load departments.");
            }
        };
        fetchDepartments();
    }, []);

    useEffect(() => {
        const fetchEmployees = async () => {
            if (selectedDepartment) {
                try {
                    const response = await api.get(`employees/${selectedDepartment}/`);
                    if (response.data.success) {
                        setEmployees(response.data.data);
                    } else {
                        setEmployees([]);
                        showError("Failed to load employees.");
                    }
                } catch (error) {
                    console.error("Error fetching employees:", error);
                    setEmployees([]);
                    showError("Failed to load employees.");
                }
            } else {
                setEmployees([]);
            }
        };
        fetchEmployees();
    }, [selectedDepartment]);

    const handleAddEmployeeClick = () => {
        if (!selectedDepartment) {
            showError("Please select a department before adding an employee.");
            return;
        }
        SetCreateEmployeeFormModalOpen(true);
        setNewEmployee({});
        setEditingEmployee(null);
        setIsAddEmployeeModalOpen(true);
    };

    const handleEditEmployeeClick = (employee) => {
        const prefilledData = Object.keys(employee.field_data).reduce(
            (acc, label) => ({
                ...acc,
                [label]: employee.field_data[label].value,
            }),
            {}
        );
        setNewEmployee(prefilledData);
        setEditingEmployee(employee);
        setIsAddEmployeeModalOpen(true);
    };

    const handleDeleteEmployeeClick = async (employee) => {
        if (
            !window.confirm(
                `Are you sure you want to delete ${employee.field_data["Full Name"]?.value || "this employee"}?`
            )
        ) {
            return;
        }
        try {
            const response = await api.delete(`employees/detail/${employee.id}/`);
            if (response.data.success) {
                showSuccess("Employee deleted successfully.");
                const employeesResponse = await api.get(`employees/${selectedDepartment}/`);
                if (employeesResponse.data.success) {
                    setEmployees(employeesResponse.data.data);
                }
            } else {
                showError("Failed to delete employee.");
            }
        } catch (error) {
            console.error("Error deleting employee:", error);
            showError("Failed to delete employee.");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEmployee((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formStructure) {
            showError("Form structure not loaded. Please try again.");
            return;
        }
        try {
            const fieldData = Object.keys(newEmployee).map((label) => {
                const field = formStructure.fields.find((f) => f.label === label);
                if (!field) {
                    throw new Error(`Field ${label} not found in form structure`);
                }
                return {
                    field: field.id,
                    value: newEmployee[label],
                };
            });
            let response;
            if (editingEmployee) {
                response = await api.put(`employees/detail/${editingEmployee.id}/`, {
                    department: parseInt(selectedDepartment),
                    field_data: fieldData,
                });
                showSuccess("Employee updated successfully.");
            } else {
                response = await api.post("employees-create/", {
                    department: parseInt(selectedDepartment),
                    field_data: fieldData,
                });
                showSuccess("Employee added successfully.");
            }
            setIsAddEmployeeModalOpen(false);
            setNewEmployee({});
            setEditingEmployee(null);
            const employeesResponse = await api.get(`employees/${selectedDepartment}/`);
            if (employeesResponse.data.success) {
                setEmployees(employeesResponse.data.data);
            }
        } catch (error) {
            console.error(editingEmployee ? "Error updating employee:" : "Error adding employee:", error);
            showError(`Failed to ${editingEmployee ? "update" : "add"} employee. Please check the form data.`);
        }
    };

    const handleEditFormSuccess = () => {
        fetchFormStructure();
    };

    const filteredEmployees = employees.filter((employee) => {
        const fullName = employee.field_data["Full Name"]?.value || "";
        return fullName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const columns = formStructure?.fields
        ? formStructure.fields
              .sort((a, b) => a.order - b.order)
              .map((field) => ({
                  id: field.id,
                  label: field.label,
                  field_type: field.field_type,
              }))
        : [];

    return (
        <>
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <label className="text-[#3C4142] font-semibold">Department:</label>
                        <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="px-3 py-2 border border-[#8FA68E]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8FA68E] bg-white min-w-[180px]"
                        >
                            <option value="">Select Department</option>
                            {departments.map((department) => (
                                <option key={department.id} value={department.id}>
                                    {department.name} - {department.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Search employees by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-3 py-2 border border-[#8FA68E]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8FA68E] bg-white min-w-[250px]"
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsCreateFormModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#8FA68E] text-white rounded-full hover:bg-[#3C4142] transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg font-semibold"
                    >
                        <Plus className="text-xl" />
                        Create Form
                    </button>
                    {selectedDepartment && (
                        <button
                            onClick={() => setIsEditFormModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#8FA68E] text-white rounded-full hover:bg-[#3C4142] transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg font-semibold"
                        >
                            Edit Form
                        </button>
                    )}
                    <button
                        onClick={handleAddEmployeeClick}
                        className="flex items-center gap-2 px-4 py-2 bg-[#8FA68E] text-white rounded-full hover:bg-[#3C4142] transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg font-semibold"
                    >
                        <Plus className="text-xl" />
                        Add Employee
                    </button>
                </div>
            </div>
            <div className="bg-[#8FA68E]/5 rounded-lg p-1">
                <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#E8DDD4]">
                                <tr>
                                    {columns.map((column) => (
                                        <th key={column.id} className="px-6 py-3 text-left text-[#3C4142] font-semibold">
                                            {column.label}
                                        </th>
                                    ))}
                                    {columns.length === 0 && (
                                        <th className="px-6 py-3 text-left text-[#3C4142] font-semibold"></th>
                                    )}
                                    <th className="px-6 py-3 text-left text-[#3C4142] font-semibold"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.length > 0 ? (
                                    filteredEmployees.map((employee) => (
                                        <tr
                                            key={employee.id}
                                            className="border-b border-[#8FA68E]/10 hover:bg-[#E8DDD4]/20 transition-colors"
                                        >
                                            {columns.map((column) => (
                                                <td key={column.id} className="px-6 py-4 text-[#3C4142] font-medium">
                                                    {employee.field_data[column.label]?.value || "-"}
                                                </td>
                                            ))}
                                            {columns.length === 0 && (
                                                <td className="px-6 py-4 text-[#3C4142] font-medium">
                                                    {employee.field_data["Full Name"]?.value || "Unknown"}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 flex gap-2">
                                                <button
                                                    onClick={() => handleEditEmployeeClick(employee)}
                                                    className="text-[#8FA68E] hover:text-[#3C4142] transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteEmployeeClick(employee)}
                                                    className="text-red-500 hover:text-red-700 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-[#8FA68E]">
                                            No employees found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {isCreateEmployeeFormModalOpen && (
                <AddEmployee
                    isOpen={isAddEmployeeModalOpen}
                    onClose={() => {
                        setIsAddEmployeeModalOpen(false);
                        setEditingEmployee(null);
                        setNewEmployee({});
                    }}
                    newEmployee={newEmployee}
                    handleInputChange={handleInputChange}
                    handleSubmit={handleSubmit}
                    departmentId={selectedDepartment}
                    isEditing={!!editingEmployee}
                />
            )}
            {isCreateFormModalOpen && <CreateForm onClose={() => setIsCreateFormModalOpen(false)} />}
            {isEditFormModalOpen && (
                <EditForm
                    departmentId={selectedDepartment}
                    onClose={() => {
                        setIsEditFormModalOpen(false);
                        handleEditFormSuccess();
                    }}
                />
            )}
        </>
    );
};

export default EmployeeDetails;
