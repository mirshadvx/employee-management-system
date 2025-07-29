import React, { useState, useEffect } from "react";

const CreateDepartmentModal = ({ isOpen, onClose, onCreate, initialData }) => {
    const [name, setName] = useState("");
    const [label, setLabel] = useState("");

    useEffect(() => {
        if (initialData) {
            setName(initialData.name || "");
            setLabel(initialData.label || "");
        } else {
            setName("");
            setLabel("");
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name || !label) {
            alert("Please fill all fields.");
            return;
        }

        const departmentData = { name, label };
        onCreate(departmentData);
        setName("");
        setLabel("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-[90%] max-w-md">
                <h2 className="text-xl font-bold text-[#3C4142] mb-4">
                    {initialData ? "Edit Department" : "Create New Department"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Department Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-[#8FA68E] focus:border-[#8FA68E]"
                            placeholder="e.g., Engineering"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Department Label</label>
                        <input
                            type="text"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-[#8FA68E] focus:border-[#8FA68E]"
                            placeholder="e.g., Tech Team"
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#8FA68E] text-white rounded hover:bg-[#7A997D]"
                        >
                            {initialData ? "Update" : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateDepartmentModal;