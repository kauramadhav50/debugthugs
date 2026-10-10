import React, { useEffect, useState } from "react";
import { DashboardApi } from "../connections/Api";

function Segmentation() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRiskType, setSelectedRiskType] = useState("All");
  const [selectedDept, setSelectedDept] = useState("All");

  useEffect(() => {
    DashboardApi()
      .then((res) => {
        // Handle whether the API returns an object directly or inside an array
        const dataPayload = Array.isArray(res) ? res[0] : res;
        setData(dataPayload);
        setLoading(false);
      })
      .catch(() => {
        console.log("Error in getting at-risk student data");
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 px-4">
        <p className="text-[#319574] font-semibold text-base sm:text-lg animate-pulse text-center">
          Loading at-risk student profiles...
        </p>
      </div>
    );
  }

  // Extract the flagged students list from backend response
  const students = data.recentStudentsNeedingAttention || [];

  // Extract unique departments for filtering
  const departments = [
    "All",
    ...new Set(students.map((s) => s.department).filter(Boolean)),
  ];

  // Filter students based on risk level and department
  const atRiskStudents = students.filter((student) => {
    const acLevel = student.academicRisk || "Low";
    const plLevel = student.placementRisk || "Low";

    // Only show students who have Medium or High risk
    const isAtRisk =
      (acLevel !== "Low" && acLevel !== "Unknown") ||
      (plLevel !== "Low" && plLevel !== "Unknown");

    // Filter by Risk Type dropdown
    if (
      selectedRiskType === "Academic" &&
      acLevel !== "High" &&
      acLevel !== "Medium"
    )
      return false;
    if (
      selectedRiskType === "Placement" &&
      plLevel !== "High" &&
      plLevel !== "Medium"
    )
      return false;

    // Filter by Department dropdown
    if (selectedDept !== "All" && student.department !== selectedDept)
      return false;

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-10 ml-0 md:ml-[220px] transition-all">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
              At-Risk{" "}
              <span className="text-[#319574] font-medium">
                Intervention Hub
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Identify students requiring academic remediation or
              career/placement support.
            </p>
          </div>
          <span className="bg-red-50 text-red-700 border border-red-200 font-semibold px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm">
            {atRiskStudents.length} Students Flagged
          </span>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Risk Type Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Filter by Risk Type
            </label>
            <select
              value={selectedRiskType}
              onChange={(e) => setSelectedRiskType(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#319574] focus:bg-white transition-all text-gray-750 cursor-pointer"
            >
              <option value="All">All Risk Types (Academic & Placement)</option>
              <option value="Academic">Academic Risk Only</option>
              <option value="Placement">Placement Risk Only</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Filter by Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#319574] focus:bg-white transition-all text-gray-750 cursor-pointer"
            >
              {departments.map((dept, index) => (
                <option key={index} value={dept}>
                  {dept === "All" ? "All Departments" : dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* At-Risk Student Cards List */}
        <div className="space-y-4">
          {atRiskStudents.length > 0 ? (
            atRiskStudents.map((student) => (
              <div
                key={student.id}
                className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
              >
                {/* Left Column: Student Details */}
                <div className="space-y-2 w-full lg:w-1/3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#319574] bg-[#319574]/10 px-2.5 py-0.5 rounded-md">
                      ID: {student.id}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-medium">
                      {student.department}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg">
                    {student.name}
                  </h3>
                  <div className="pt-1 flex items-center gap-3">
                    <span className="text-xs text-gray-500 font-medium">
                      Success Score:
                    </span>
                    <span className="text-sm font-bold text-[#319574]">
                      {student.successScore}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 font-medium">
                      Attendance:
                    </span>
                    <span className="text-sm font-bold text-gray-700">
                      {student.attendance}%
                    </span>
                  </div>
                </div>

                {/* Middle Column: Risk Severity & Indicators */}
                <div className="w-full lg:w-1/3 space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Risk Severity & Indicators
                  </h4>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 font-medium">
                      Academic Risk:
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                        student.academicRisk === "High"
                          ? "bg-red-100 text-red-700"
                          : student.academicRisk === "Medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {student.academicRisk}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 font-medium">
                      Placement Risk:
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                        student.placementRisk === "High"
                          ? "bg-red-100 text-red-700"
                          : student.placementRisk === "Medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {student.placementRisk}
                    </span>
                  </div>
                </div>

                {/* Right Column: Flagging Reason / Next Steps */}
                <div className="w-full lg:w-1/3 space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Intervention Reason
                  </h4>
                  <div className="text-xs bg-red-50 border border-red-100 p-3 rounded-lg text-red-900 italic">
                    "{student.reason}"
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-12 rounded-xl text-center border border-gray-100">
              <p className="text-gray-500 text-sm">
                No at-risk students match your filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Segmentation;
