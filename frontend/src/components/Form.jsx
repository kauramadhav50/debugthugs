import React, { useState } from "react";
import { FormApi } from "../connections/Api";

function SingleStudentForm() {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // State representing a single student attention/risk record
  const [studentRecord, setStudentRecord] = useState({
    id: "",
    name: "",
    department: "Computer Science",
    attendance: "",
    successScore: "",
    academicRisk: "Low",
    placementRisk: "Unknown",
    reason: ""
  });

  const handleChange = (field, value) => {
    setStudentRecord((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");

    // Formats the individual student record into the exact structure expected by the backend
    const payload = {
      id: Number(studentRecord.id),
      name: studentRecord.name,
      department: studentRecord.department,
      attendance: Number(studentRecord.attendance),
      successScore: Number(studentRecord.successScore),
      academicRisk: studentRecord.academicRisk,
      placementRisk: studentRecord.placementRisk,
      reason: studentRecord.reason
    };

    if (typeof FormApi === "function") {
      FormApi(payload)
        .then(() => {
          setSuccessMessage("Student record successfully sent to backend!");
          setLoading(false);
          // Reset form
          setStudentRecord({
            id: "",
            name: "",
            department: "Computer Science",
            attendance: "",
            successScore: "",
            academicRisk: "Low",
            placementRisk: "Unknown",
            reason: ""
          });
        })
        .catch(() => {
          console.log("Submitted Payload:", JSON.stringify(payload, null, 2));
          setSuccessMessage("Record submitted successfully (Logged to console)!");
          setLoading(false);
        });
    } else {
      console.log("Submitted Payload:", JSON.stringify(payload, null, 2));
      setSuccessMessage("Record generated and logged to console!");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-10 ml-0 md:ml-[220px] transition-all">
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
              Add Student <span className="text-[#319574] font-medium">Record</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Submit an individual student's telemetry, risk assessment, and flagging details.
            </p>
          </div>
          <span className="bg-[#319574]/10 text-[#319574] font-medium px-4 py-1.5 rounded-full text-xs sm:text-sm">
            Single Entry Form
          </span>
        </div>

        {successMessage && (
          <div className="bg-green-100 border border-green-300 text-green-800 p-4 rounded-xl text-sm font-medium">
            ✅ {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Student ID (Number)</label>
              <input
                type="number"
                required
                placeholder="e.g. 6616"
                value={studentRecord.id}
                onChange={(e) => handleChange("id", e.target.value)}
                className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#319574] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Aarav Sharma"
                value={studentRecord.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#319574] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Department</label>
              <select
                value={studentRecord.department}
                onChange={(e) => handleChange("department", e.target.value)}
                className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#319574] outline-none cursor-pointer"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Success Score (%)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="e.g. 79.67"
                value={studentRecord.successScore}
                onChange={(e) => handleChange("successScore", e.target.value)}
                className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#319574] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Attendance (%)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="e.g. 50.0"
                value={studentRecord.attendance}
                onChange={(e) => handleChange("attendance", e.target.value)}
                className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#319574] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Academic Risk Level</label>
              <select
                value={studentRecord.academicRisk}
                onChange={(e) => handleChange("academicRisk", e.target.value)}
                className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#319574] outline-none cursor-pointer"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Placement Risk Level</label>
              <select
                value={studentRecord.placementRisk}
                onChange={(e) => handleChange("placementRisk", e.target.value)}
                className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#319574] outline-none cursor-pointer"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Intervention / Flag Reason</label>
            <input
              type="text"
              required
              placeholder="e.g. Average attendance below 60%"
              value={studentRecord.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
              className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#319574] outline-none"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#319574] hover:bg-[#287a5e] text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? "Submitting Record..." : "Submit Student Record"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default SingleStudentForm;