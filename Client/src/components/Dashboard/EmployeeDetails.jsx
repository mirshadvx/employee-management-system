import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
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

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

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
        if (!isCreateFormModalOpen) {
            fetchFormStructure();
        }
    }, [isCreateFormModalOpen]);

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

    const fetchEmployees = async (page = 1, search = "") => {
        if (selectedDepartment) {
            setIsLoading(true);
            try {
                let url = `employees/${selectedDepartment}/?page=${page}`;
                if (search.trim()) {
                    url += `&search=${encodeURIComponent(search.trim())}`;
                }

                const response = await api.get(url);

                if (response.data.results?.success) {
                    setEmployees(response.data.results.data);
                    setTotalCount(response.data.count);
                    setNextPage(response.data.next);
                    setPreviousPage(response.data.previous);
                    setCurrentPage(page);
                } else {
                    setEmployees([]);
                    setTotalCount(0);
                    setNextPage(null);
                    setPreviousPage(null);
                    showError("Failed to load employees.");
                }
            } catch (error) {
                console.error("Error fetching employees:", error);
                setEmployees([]);
                setTotalCount(0);
                setNextPage(null);
                setPreviousPage(null);
                showError("Failed to load employees.");
            } finally {
                setIsLoading(false);
            }
        } else {
            setEmployees([]);
            setTotalCount(0);
            setNextPage(null);
            setPreviousPage(null);
            setCurrentPage(1);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
        fetchEmployees(1, searchTerm);
    }, [selectedDepartment]);

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setCurrentPage(1);
            fetchEmployees(1, searchTerm);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, selectedDepartment]);

    const handlePageChange = (page) => {
        fetchEmployees(page, searchTerm);
    };

    const handlePreviousPage = () => {
        if (previousPage && currentPage > 1) {
            handlePageChange(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (nextPage) {
            handlePageChange(currentPage + 1);
        }
    };

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
        SetCreateEmployeeFormModalOpen(true);
        setIsAddEmployeeModalOpen(true);
    };

    const handleDeleteEmployeeClick = async (employee) => {
        const employeeName =
            Object.values(employee.field_data).find((field) => field.field_type === "text" || field.field_type === "email")
                ?.value || "this employee";

        if (!window.confirm(`Are you sure you want to delete ${employeeName}?`)) {
            return;
        }

        try {
            const response = await api.delete(`employees/detail/${employee.id}/`);
            if (response.data.success) {
                showSuccess("Employee deleted successfully.");
                // Refresh current page
                fetchEmployees(currentPage, searchTerm);
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
                response = await api.put(`employees/${editingEmployee.id}/`, {
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
            SetCreateEmployeeFormModalOpen(false);
            setNewEmployee({});
            setEditingEmployee(null);

            // Refresh current page
            fetchEmployees(currentPage, searchTerm);
        } catch (error) {
            showError(`Failed to ${editingEmployee ? "update" : "add"} employee. Please check the form data.`);
        }
    };

    const handleEditFormSuccess = () => {
        fetchFormStructure();
    };

    const columns = formStructure?.fields
        ? formStructure.fields
              .sort((a, b) => a.order - b.order)
              .map((field) => ({
                  id: field.id,
                  label: field.label,
                  field_type: field.field_type,
              }))
        : [];

    const totalPages = Math.ceil(totalCount / 10); // Assuming 10 items per page

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
                            placeholder="Search employees ..."
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

            {/* Results count */}
            {selectedDepartment && (
                <div className="mb-4 text-sm text-[#3C4142]">
                    {isLoading
                        ? "Loading..."
                        : `Showing ${employees.length} of ${totalCount} employee${totalCount !== 1 ? "s" : ""}`}
                </div>
            )}

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
                                    {columns.length === 0 && selectedDepartment && (
                                        <th className="px-6 py-3 text-left text-[#3C4142] font-semibold">Employee Data</th>
                                    )}
                                    {selectedDepartment && (
                                        <th className="px-6 py-3 text-left text-[#3C4142] font-semibold">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-[#8FA68E]">
                                            Loading employees...
                                        </td>
                                    </tr>
                                ) : employees.length > 0 ? (
                                    employees.map((employee) => (
                                        <tr
                                            key={employee.id}
                                            className="border-b border-[#8FA68E]/10 hover:bg-[#E8DDD4]/20 transition-colors"
                                        >
                                            {columns.map((column) => (
                                                <td key={column.id} className="px-6 py-4 text-[#3C4142] font-medium">
                                                    {employee.field_data[column.label]?.value?.toString() || "-"}
                                                </td>
                                            ))}
                                            {columns.length === 0 && (
                                                <td className="px-6 py-4 text-[#3C4142] font-medium">
                                                    {Object.values(employee.field_data)[0]?.value?.toString() || "No data"}
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
                                ) : selectedDepartment ? (
                                    <tr>
                                        <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-[#8FA68E]">
                                            {searchTerm
                                                ? "No employees found matching your search criteria."
                                                : "No employees found in this department."}
                                        </td>
                                    </tr>
                                ) : (
                                    <tr>
                                        <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-[#8FA68E]">
                                            Please select a department to view employees.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Pagination */}
            {selectedDepartment && totalCount > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                    <div className="text-sm text-[#3C4142]">
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePreviousPage}
                            disabled={!previousPage || isLoading}
                            className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors ${
                                previousPage && !isLoading
                                    ? "bg-[#8FA68E] text-white hover:bg-[#3C4142]"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </button>

                        <span className="px-4 py-2 text-[#3C4142]">
                            {currentPage} / {totalPages}
                        </span>

                        <button
                            onClick={handleNextPage}
                            disabled={!nextPage || isLoading}
                            className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors ${
                                nextPage && !isLoading
                                    ? "bg-[#8FA68E] text-white hover:bg-[#3C4142]"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {isCreateEmployeeFormModalOpen && (
                <AddEmployee
                    isOpen={isAddEmployeeModalOpen}
                    onClose={() => {
                        setIsAddEmployeeModalOpen(false);
                        SetCreateEmployeeFormModalOpen(false);
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
