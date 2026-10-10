import React, { useEffect, useState } from "react";
import { ProfileApi } from "../connections/Api";

function At_risk_student() {
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRiskType, setSelectedRiskType] = useState("All");
  const [selectedDept, setSelectedDept] = useState("All");

  useEffect(() => {
    ProfileApi()
      .then((res) => {
        const list = Array.isArray(res) ? res : res.students || [res];
        setStudentsData(list);
        setLoading(false);
      })
      .catch(() => {
        console.log("Error in getting at-risk student data");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 px-4">
        <p className="text-[#319574] font-semibold text-base sm:text-lg animate-pulse text-center">
          Loading at-risk student profiles...
        </p>
      </div>
    );
  }

  // Extract unique departments for filtering
  const departments = [
    "All",
    ...new Set(studentsData.map((s) => s.student?.department).filter(Boolean)),
  ];

  // Filter students who have at least Medium or High risk in either Academic or Placement
  const atRiskStudents = studentsData.filter((item) => {
    const success = item.successMetrics || {};
    const acLevel = success.academicRisk?.level || "Low";
    const plLevel = success.placementRisk?.level || "Low";

    const isAtRisk = acLevel !== "Low" || plLevel !== "Low";
    if (!isAtRisk) return false;

    // Filter by Risk Type dropdown
    if (selectedRiskType === "Academic" && acLevel === "Low") return false;
    if (selectedRiskType === "Placement" && plLevel === "Low") return false;

    // Filter by Department dropdown
    const dept = item.student?.department;
    if (selectedDept !== "All" && dept !== selectedDept) return false;

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
            atRiskStudents.map((item, index) => {
              const student = item.student || {};
              const success = item.successMetrics || {};
              const recommendations = item.insights?.recommendations || [];

              return (
                <div
                  key={student.studentId || index}
                  className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
                >
                  {/* Left Column: Student Details */}
                  <div className="space-y-2 w-full lg:w-1/3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#319574] bg-[#319574]/10 px-2.5 py-0.5 rounded-md">
                        {student.studentId}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-medium">
                        {student.department}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg">
                      {student.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {student.course} • Year {student.yearOfStudy} (Sem{" "}
                      {student.semester})
                    </p>
                    <div className="pt-1 flex items-center gap-3">
                      <span className="text-xs text-gray-500 font-medium">
                        Success Score:
                      </span>
                      <span className="text-sm font-bold text-[#319574]">
                        {success.successScore}%
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
                          success.academicRisk?.level === "High"
                            ? "bg-red-100 text-red-700"
                            : success.academicRisk?.level === "Medium"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {success.academicRisk?.level} (
                        {success.academicRisk?.score} pts)
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 font-medium">
                        Placement Risk:
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                          success.placementRisk?.level === "High"
                            ? "bg-red-100 text-red-700"
                            : success.placementRisk?.level === "Medium"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {success.placementRisk?.level} (
                        {success.placementRisk?.score} pts)
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Recommended Next Steps */}
                  <div className="w-full lg:w-1/3 space-y-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Recommended Next Steps
                    </h4>
                    <div className="space-y-1.5">
                      {recommendations.length > 0 ? (
                        recommendations.slice(0, 2).map((rec, i) => (
                          <div
                            key={i}
                            className="text-xs bg-[#319574]/5 border border-[#319574]/20 p-2.5 rounded-lg"
                          >
                            <span className="font-bold text-[#319574] block">
                              {rec.title}
                            </span>
                            <span className="text-gray-600 text-[11px]">
                              {rec.description}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400 italic">
                          No specific recommendations logged.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
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

export default At_risk_student;
