import React, { useEffect, useState } from "react";
import { DashboardApi } from "../connections/Api";

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    DashboardApi()
      .then(setData)
      .catch(() => {
        console.log("Unable to load data");
      });
  }, []);

  if (!data || !data[0]) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 px-4">
        <p className="text-[#319574] font-semibold text-base sm:text-lg animate-pulse text-center">
          Loading dashboard...
        </p>
      </div>
    );
  }

  const summary = data[0].summary;
  const departments = data[0].departmentPerformance;
  const risks = data[0].riskComparison;
  const recentStudents = data[0].recentStudentsNeedingAttention;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-10 ml-0 md:ml-[220px] transition-all">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-200 pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
            Dashboard{" "}
            <span className="text-[#319574] text-base sm:text-lg font-medium">Overview</span>
          </h1>
          <span className="bg-[#319574]/10 text-[#319574] font-medium px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm">
            Live Campus Data
          </span>
        </div>

        {/* Summary Section */}
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4">
            Summary Statistics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-[#319574]">
              <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                Total Students
              </h4>
              <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-2">
                {summary.totalStudents}
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-[#319574]">
              <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                Avg Success Score
              </h4>
              <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-2">
                {summary.averageSuccessScore}
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-[#319574]">
              <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                Academic Risk
              </h4>
              <p className="text-xl sm:text-2xl font-bold text-red-600 mt-2">
                {summary.studentsAtAcademicRisk}
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-[#319574]">
              <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                Placement Risk
              </h4>
              <p className="text-xl sm:text-2xl font-bold text-amber-600 mt-2">
                {summary.studentsAtPlacementRisk}
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-[#319574] sm:col-span-2 lg:col-span-1">
              <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                Avg Attendance
              </h4>
              <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-2">
                {summary.averageAttendance}%
              </p>
            </div>
          </div>
        </div>

        {/* Department Performance Section (Mapped) */}
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4">
            Department Performance
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {departments.map((dept, index) => (
              <div
                key={index}
                className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between"
              >
                <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">
                  {dept.departmentName || `Department ${index + 1}`}
                </h4>
                <div className="text-lg sm:text-xl font-bold text-[#319574]">
                  {dept.averageScore}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risks Comparison Section (Mapped) */}
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4">
            Risk Level Distribution
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {risks.map((risk, index) => {
              const riskLevels = ["Low", "Medium", "High"];
              const badgeColors = [
                "bg-green-100 text-green-800",
                "bg-yellow-100 text-yellow-800",
                "bg-red-100 text-red-800",
              ];

              return (
                <div
                  key={index}
                  className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-base sm:text-lg font-bold text-gray-800">
                      Risk Tier
                    </h4>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeColors[index] || "bg-gray-100 text-gray-800"}`}
                    >
                      {riskLevels[index] || `Tier ${index + 1}`}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs sm:text-sm text-gray-600">
                        Academic Risk
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-gray-800">
                        {risk.academicRisk}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs sm:text-sm text-gray-600">
                        Placement Risk
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-gray-800">
                        {risk.placementRisk}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Attention Needed Students Section (Mapped safely) */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700">
              Students Needing Attention
            </h3>
            <span className="text-xs bg-[#319574]/10 text-[#319574] font-semibold px-3 py-1 rounded-full">
              {Array.isArray(recentStudents) ? recentStudents.length : 0}{" "}
              Flagged
            </span>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {Array.isArray(recentStudents) && recentStudents.length > 0 ? (
              recentStudents.map((student, index) => (
                <div
                  key={student.id || index}
                  className="p-3 sm:p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
                >
                  {/* Student Info & Reason */}
                  <div className="space-y-1 w-full lg:w-auto">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-gray-800 text-sm sm:text-base">
                        {student.name}
                      </h4>
                      <span className="text-[11px] sm:text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md font-medium">
                        {student.department}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 italic">
                      "{student.reason}"
                    </p>
                  </div>

                  {/* Metrics & Risk Badges */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto justify-between lg:justify-end">
                    {/* Success Score Badge */}
                    <div className="text-center px-2.5 sm:px-3 py-1 bg-white rounded-lg border border-gray-100 shadow-2xs">
                      <span className="block text-[9px] sm:text-[10px] text-gray-400 uppercase font-bold">
                        Success
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#319574]">
                        {student.successScore}%
                      </span>
                    </div>

                    {/* Attendance Badge */}
                    <div className="text-center px-2.5 sm:px-3 py-1 bg-white rounded-lg border border-gray-100 shadow-2xs">
                      <span className="block text-[9px] sm:text-[10px] text-gray-400 uppercase font-bold">
                        Attendance
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-gray-700">
                        {student.attendance}%
                      </span>
                    </div>

                    {/* Risk Indicators */}
                    <div className="flex flex-col gap-1">
                      <span
                        className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md text-center ${
                          student.academicRisk === "High"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        Academic: {student.academicRisk}
                      </span>
                      <span
                        className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md text-center ${
                          student.placementRisk === "High"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        Placement: {student.placementRisk}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 py-4 text-center">
                No urgent attention records found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;