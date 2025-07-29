import React, { useEffect, useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import api from "../../../services/api";
import { useToast } from "../../../hooks/useToast";

const AddEmployee = ({ isOpen, onClose, newEmployee, handleInputChange, handleSubmit, departmentId, isEditing }) => {
    const [formStructure, setFormStructure] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const { showError, showSuccess } = useToast();

    useEffect(() => {
        if (isOpen && departmentId) {
            const fetchFormStructure = async () => {
                try {
                    const response = await api.get(`form-structure/${departmentId}/`);
                    if (response.data) {
                        setFormStructure(response.data);
                    }
                } catch (error) {
                    console.error("Error fetching form structure:", error);
                    showError("Failed to load form structure.");
                }
            };
            fetchFormStructure();
        } else {
            setFormStructure(null);
        }
    }, [isOpen, departmentId]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleInputChange({
                    target: {
                        name: e.target.name,
                        value: {
                            name: file.name,
                            data: reader.result,
                        },
                    },
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const renderField = (field) => {
        switch (field.field_type) {
            case "text":
                return (
                    <input
                        type="text"
                        name={field.label}
                        value={newEmployee[field.label] || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-[#8FA68E]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8FA68E]"
                        required
                    />
                );
            case "number":
                return (
                    <input
                        type="number"
                        name={field.label}
                        value={newEmployee[field.label] || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-[#8FA68E]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8FA68E]"
                        required
                    />
                );
            case "date":
                return (
                    <input
                        type="date"
                        name={field.label}
                        value={newEmployee[field.label] || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-[#8FA68E]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8FA68E]"
                        required
                    />
                );
            case "email":
                return (
                    <input
                        type="email"
                        name={field.label}
                        value={newEmployee[field.label] || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-[#8FA68E]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8FA68E]"
                        required
                    />
                );
            case "password":
                return (
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name={field.label}
                            value={newEmployee[field.label] || ""}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-[#8FA68E]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8FA68E]"
                            required
                        />
                        <button
                            type="button"
                            onClick={toggleShowPassword}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                        >
                            {showPassword ? <EyeOff /> : <Eye />}
                        </button>
                    </div>
                );
            case "boolean":
                return (
                    <input
                        type="checkbox"
                        name={field.label}
                        checked={newEmployee[field.label] || false}
                        onChange={(e) => handleInputChange({ target: { name: e.target.name, value: e.target.checked } })}
                        className="h-5 w-5 text-[#8FA68E] rounded focus:ring-[#8FA68E]"
                    />
                );
            case "select":
                return (
                    <select
                        name={field.label}
                        value={newEmployee[field.label] || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-[#8FA68E]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8FA68E]"
                        required
                    >
                        <option value="">Select an option</option>
                        {(field.field_options?.choices || []).map((option, index) => (
                            <option key={index} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                );
            case "textarea":
                return (
                    <textarea
                        name={field.label}
                        value={newEmployee[field.label] || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-[#8FA68E]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8FA68E] resize-vertical min-h-[80px]"
                        rows="3"
                        required
                    />
                );
            case "file":
                return (
                    <div>
                        {newEmployee[field.label]?.name && (
                            <p className="text-sm text-gray-500 mb-1">Current file: {newEmployee[field.label].name}</p>
                        )}
                        <input
                            type="file"
                            name={field.label}
                            onChange={handleFileChange}
                            className="w-full px-3 py-2 border border-[#8FA68E]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8FA68E] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#8FA68E] file:text-white hover:file:bg-[#3C4142]"
                        />
                    </div>
                );
            default:
                return (
                    <input
                        type="text"
                        name={field.label}
                        value={newEmployee[field.label] || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-[#8FA68E]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8FA68E]"
                        required
                    />
                );
        }
    };

    if (!isOpen) return null;

    const sortedFields = formStructure?.fields ? [...formStructure.fields].sort((a, b) => a.order - b.order) : [];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md m-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-[#3C4142]">
                        {isEditing ? "Edit Employee" : "Add New Employee"}
                        {formStructure?.department_name && (
                            <span className="text-sm font-normal text-gray-600 block">
                                {formStructure.department_label || formStructure.department_name}
                            </span>
                        )}
                    </h2>
                    <button onClick={onClose} className="text-[#3C4142] hover:text-[#8FA68E] transition-colors">
                        <X className="text-xl" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {formStructure && sortedFields.length > 0 ? (
                        sortedFields.map((field) => (
                            <div key={field.id}>
                                <label className="block text-[#3C4142] font-medium mb-1">
                                    {field.label}
                                    {field.field_type === "boolean" && (
                                        <span className="text-sm font-normal text-gray-500 ml-2">(Check if yes)</span>
                                    )}
                                </label>
                                {renderField(field)}
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-4">
                            {formStructure === null ? "Loading form structure..." : "No fields available"}
                        </p>
                    )}
                    {sortedFields.length > 0 && (
                        <div className="flex justify-end gap-2 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-[#3C4142] rounded-md hover:bg-[#E8DDD4]/50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-[#8FA68E] text-white rounded-md hover:bg-[#3C4142] transition-colors"
                                disabled={!formStructure || sortedFields.length === 0}
                            >
                                {isEditing ? "Update Employee" : "Add Employee"}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AddEmployee;
