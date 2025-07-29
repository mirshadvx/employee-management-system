import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import api from "../../../services/api";
import { useToast } from "../../../hooks/useToast";

const EditForm = ({ departmentId, onClose }) => {
    const [formData, setFormData] = useState({ department: departmentId });
    const [dynamicFields, setDynamicFields] = useState([]);
    const [isAddingField, setIsAddingField] = useState(false);
    const [newField, setNewField] = useState({
        label: "",
        field_type: "text",
        field_options: [],
        order: 0,
    });
    const [loading, setLoading] = useState(false);
    const { showSuccess, showError, showWarning, showInfo } = useToast();

    const fieldTypes = [
        { value: "text", label: "Text" },
        { value: "number", label: "Number" },
        { value: "date", label: "Date" },
        { value: "email", label: "Email" },
        { value: "password", label: "Password" },
        { value: "boolean", label: "True/False" },
        { value: "select", label: "Dropdown" },
        { value: "textarea", label: "Multiline" },
    ];

    useEffect(() => {
        const fetchFormStructure = async () => {
            setLoading(true);
            try {
                const response = await api.get(`form-structure/${departmentId}/`);
                if (response.data && response.data.fields) {
                    const fields = response.data.fields.map((field) => ({
                        ...field,
                        field_options:
                            field.field_type === "select" && field.field_options?.choices
                                ? field.field_options.choices
                                : [],
                    }));
                    setDynamicFields(fields);
                }
            } catch (error) {
                console.error("Error fetching form structure:", error);
                showError("Failed to load form structure.");
            } finally {
                setLoading(false);
            }
        };
        if (departmentId) {
            fetchFormStructure();
        }
    }, [departmentId]);

    const handleNewFieldChange = (e) => {
        const { name, value } = e.target;
        setNewField((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddOption = () => {
        setNewField((prev) => ({ ...prev, field_options: [...prev.field_options, ""] }));
    };

    const handleOptionChange = (index, value) => {
        setNewField((prev) => ({
            ...prev,
            field_options: prev.field_options.map((option, i) => (i === index ? value : option)),
        }));
    };

    const handleRemoveOption = (index) => {
        setNewField((prev) => ({
            ...prev,
            field_options: prev.field_options.filter((_, i) => i !== index),
        }));
    };

    const handleAddField = () => {
        if (!newField.label) {
            showWarning("Please provide a field label");
            return;
        }
        if (newField.field_type === "select" && newField.field_options.length === 0) {
            showWarning("Please add at least one option for dropdown field");
            return;
        }
        const fieldToAdd = {
            ...newField,
            order: dynamicFields.length,
            isNew: true,
        };
        if (newField.field_type !== "select") {
            fieldToAdd.field_options = [];
        }
        setDynamicFields((prev) => [...prev, fieldToAdd]);
        setNewField({ label: "", field_type: "text", field_options: [], order: 0 });
        setIsAddingField(false);
        showSuccess("Field added successfully");
    };

    const handleRemoveField = (index) => {
        setDynamicFields((prev) => prev.filter((_, i) => i !== index));
        showInfo("Field removed");
    };

    const moveField = (index, direction) => {
        const newFields = [...dynamicFields];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex >= 0 && targetIndex < newFields.length) {
            [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
            newFields.forEach((field, i) => (field.order = i));
            setDynamicFields(newFields);
            showInfo(`Field moved ${direction}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.department) {
            showWarning("Department ID is missing");
            return;
        }
        if (dynamicFields.length === 0) {
            showWarning("Please add at least one field");
            return;
        }
        try {
            setLoading(true);
            const customFormData = {
                department: formData.department,
                fields: dynamicFields.map((field, index) => ({
                    id: field.isNew ? undefined : field.id,
                    label: field.label,
                    field_type: field.field_type,
                    order: index + 1,
                    ...(field.field_type === "select" && {
                        field_options: { choices: field.field_options.filter((opt) => opt.trim()) },
                    }),
                })),
            };
            const response = await api.put(`form-update/${departmentId}/`, customFormData);
            if (response.status === 200) {
                showSuccess("Form updated successfully");
                onClose();
            } else {
                throw new Error("Form update failed");
            }
        } catch (error) {
            console.error("Error updating form:", error);
            showError("Failed to update form. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-[#3C4142]">Edit Department Form</h2>
                    <button onClick={onClose} className="text-[#3C4142] hover:text-[#8FA68E] transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium text-[#3C4142]">Employee Fields</h3>
                            <button
                                type="button"
                                onClick={() => setIsAddingField(true)}
                                className="flex items-center gap-2 px-3 py-2 bg-[#8FA68E] text-white rounded-md hover:bg-[#3C4142] transition-colors"
                                disabled={loading}
                            >
                                <Plus className="w-4 h-4" />
                                Add Field
                            </button>
                        </div>
                        {dynamicFields.length > 0 && (
                            <div className="space-y-2">
                                {dynamicFields.map((field, index) => (
                                    <div
                                        key={field.id || `new_${index}`}
                                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-md"
                                    >
                                        <div className="flex flex-col gap-1">
                                            <button
                                                type="button"
                                                onClick={() => moveField(index, "up")}
                                                disabled={index === 0 || loading}
                                                className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                            >
                                                ▲
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => moveField(index, "down")}
                                                disabled={index === dynamicFields.length - 1 || loading}
                                                className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                            >
                                                ▼
                                            </button>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-[#3C4142]">{field.label}</div>
                                            <div className="text-sm text-gray-600">
                                                Type: {fieldTypes.find((t) => t.value === field.field_type)?.label}
                                                {field.field_options && field.field_options.length > 0 && (
                                                    <span> | Options: {field.field_options.join(", ")}</span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveField(index)}
                                            className="text-red-500 hover:text-red-700"
                                            disabled={loading}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {isAddingField && (
                            <div className="border border-[#8FA68E]/30 rounded-md p-4 space-y-3">
                                <h4 className="font-medium text-[#3C4142]">Add New Field</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-[#3C4142] mb-1">Field Label</label>
                                        <input
                                            type="text"
                                            name="label"
                                            value={newField.label}
                                            onChange={handleNewFieldChange}
                                            className="w-full px-3 py-2 border border-[#8FA68E]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8FA68E]"
                                            placeholder="e.g., Full Name, Employee ID"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#3C4142] mb-1">Field Type</label>
                                        <select
                                            name="field_type"
                                            value={newField.field_type}
                                            onChange={handleNewFieldChange}
                                            className="w-full px-3 py-2 border border-[#8FA68E]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8FA68E]"
                                            disabled={loading}
                                        >
                                            {fieldTypes.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {newField.field_type === "select" && (
                                    <div>
                                        <label className="block text-sm font-medium text-[#3C4142] mb-1">Options</label>
                                        <div className="space-y-2">
                                            {newField.field_options.map((option, optIndex) => (
                                                <div key={optIndex} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={option}
                                                        onChange={(e) => handleOptionChange(optIndex, e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-[#8FA68E]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8FA68E]"
                                                        placeholder={`Option ${optIndex + 1}`}
                                                        disabled={loading}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveOption(optIndex)}
                                                        className="text-red-500 hover:text-red-700"
                                                        disabled={loading}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={handleAddOption}
                                                className="text-[#8FA68E] hover:text-[#3C4142] text-sm"
                                                disabled={loading}
                                            >
                                                + Add Option
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingField(false)}
                                        className="px-3 py-2 text-[#3C4142] rounded-md hover:bg-[#E8DDD4]/50 transition-colors"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleAddField}
                                        className="px-3 py-2 bg-[#8FA68E] text-white rounded-md hover:bg-[#3C4142] transition-colors"
                                        disabled={loading}
                                    >
                                        Add Field
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-[#3C4142] rounded-md hover:bg-[#E8DDD4]/50 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-[#8FA68E] text-white rounded-md hover:bg-[#3C4142] transition-colors"
                            disabled={loading}
                        >
                            {loading ? "Updating..." : "Update Form"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditForm;
