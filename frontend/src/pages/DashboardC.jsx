import React, { useEffect, useState } from "react";
import { ProfileApi } from "../connections/Api";

function DashboardC() {
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    ProfileApi()
      .then((res) => {
        // Expecting an array of student objects from the backend
        const list = Array.isArray(res) ? res : res.students || [res];
        setStudentsData(list);
        setLoading(false);
      })
      .catch(() => {
        console.log("Unable to load student data array");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 px-4">
        <p className="text-[#319574] font-semibold text-base sm:text-lg animate-pulse text-center">
          Loading campus intelligence array...
        </p>
      </div>
    );
  }

  // Aggregate campus metrics from the student array
  const totalStudents = studentsData.length;
  const avgSuccessScore =
    totalStudents > 0
      ? Math.round(
          studentsData.reduce(
            (acc, curr) => acc + (curr.successMetrics?.successScore || 0),
            0,
          ) / totalStudents,
        )
      : 0;

  const avgAttendance =
    totalStudents > 0
      ? Math.round(
          studentsData.reduce(
            (acc, curr) => acc + (curr.attendance?.attendancePercentage || 0),
            0,
          ) / totalStudents,
        )
      : 0;

  const academicRiskCount = studentsData.filter(
    (s) =>
      s.successMetrics?.academicRisk?.level === "High" ||
      s.successMetrics?.academicRisk?.level === "Medium",
  ).length;
  const placementRiskCount = studentsData.filter(
    (s) =>
      s.successMetrics?.placementRisk?.level === "High" ||
      s.successMetrics?.placementRisk?.level === "Medium",
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-10 ml-0 md:ml-[220px] transition-all">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
              Campus{" "}
              <span className="text-[#319574] font-medium">
                Intelligence Dashboard
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Aggregated telemetry across {totalStudents} student profile
              records.
            </p>
          </div>
          <span className="bg-[#319574]/10 text-[#319574] font-medium px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm">
            Array Stream Active
          </span>
        </div>

        {/* Executive Summary Cards */}
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4">
            Campus Summary Statistics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-[#319574]">
              <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                Total Students Loaded
              </h4>
              <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-2">
                {totalStudents}
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-[#319574]">
              <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                Avg Success Score
              </h4>
              <p className="text-xl sm:text-2xl font-bold text-[#319574] mt-2">
                {avgSuccessScore}%
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-amber-500">
              <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                Academic Risk Flags
              </h4>
              <p className="text-xl sm:text-2xl font-bold text-amber-600 mt-2">
                {academicRiskCount}
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-red-500">
              <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                Placement Risk Flags
              </h4>
              <p className="text-xl sm:text-2xl font-bold text-red-600 mt-2">
                {placementRiskCount}
              </p>
            </div>
          </div>
        </div>

        {/* Student Records List Table/Cards */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="text-lg font-semibold text-gray-800">
              Student Directory & Profiles
            </h3>
            <span className="text-xs text-gray-400">
              Click a record to inspect deep metrics
            </span>
          </div>

          <div className="space-y-3">
            {studentsData.map((item, index) => {
              const student = item.student || {};
              const metrics = item.successMetrics || {};
              const attendance = item.attendance || {};

              return (
                <div
                  key={student.studentId || index}
                  onClick={() => setSelectedStudent(item)}
                  className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#319574] bg-[#319574]/10 px-2.5 py-0.5 rounded-md">
                        {student.studentId}
                      </span>
                      <h4 className="font-bold text-gray-800 text-base">
                        {student.name}
                      </h4>
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md font-medium">
                        {student.department}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {student.email} • Year {student.yearOfStudy} (Sem{" "}
                      {student.semester})
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-center px-3 py-1 bg-white rounded-lg border border-gray-100">
                      <span className="block text-[10px] text-gray-400 uppercase font-bold">
                        Success
                      </span>
                      <span className="text-sm font-bold text-[#319574]">
                        {metrics.successScore}%
                      </span>
                    </div>

                    <div className="text-center px-3 py-1 bg-white rounded-lg border border-gray-100">
                      <span className="block text-[10px] text-gray-400 uppercase font-bold">
                        Attendance
                      </span>
                      <span className="text-sm font-bold text-gray-700">
                        {attendance.attendancePercentage}%
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md text-center ${
                          metrics.academicRisk?.level === "High"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        Academic: {metrics.academicRisk?.level}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md text-center ${
                          metrics.placementRisk?.level === "High"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        Placement: {metrics.placementRisk?.level}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Student Deep-Dive Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl space-y-6">
            <div className="flex justify-between items-start border-b border-gray-200 pb-4">
              <div>
                <span className="text-xs bg-[#319574]/10 text-[#319574] font-bold px-2.5 py-1 rounded-md">
                  {selectedStudent.student?.studentId}
                </span>
                <h2 className="text-2xl font-bold text-gray-800 mt-1">
                  {selectedStudent.student?.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedStudent.student?.department} • Sem{" "}
                  {selectedStudent.student?.semester} (
                  {selectedStudent.student?.email})
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                <span className="text-xs text-gray-400 font-bold block">
                  Success Score
                </span>
                <span className="text-xl font-bold text-[#319574]">
                  {selectedStudent.successMetrics?.successScore}%
                </span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                <span className="text-xs text-gray-400 font-bold block">
                  Attendance
                </span>
                <span className="text-xl font-bold text-gray-700">
                  {selectedStudent.attendance?.attendancePercentage}%
                </span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                <span className="text-xs text-gray-400 font-bold block">
                  Coding Score
                </span>
                <span className="text-xl font-bold text-gray-700">
                  {selectedStudent.placementReadiness?.codingScore}%
                </span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                <span className="text-xs text-gray-400 font-bold block">
                  LMS Logins
                </span>
                <span className="text-xl font-bold text-gray-700">
                  {selectedStudent.engagement?.lmsLogins}
                </span>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-base font-semibold text-gray-700 mb-3">
                Core Skills
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedStudent.skills?.map((skill, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center"
                  >
                    <div>
                      <span className="text-sm font-bold text-gray-800">
                        {skill.name}
                      </span>
                      <span className="block text-xs text-gray-400">
                        {skill.level}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-[#319574]">
                      {skill.score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h3 className="text-base font-semibold text-gray-700">
                AI Recommendations
              </h3>
              <div className="space-y-2">
                {selectedStudent.insights?.recommendations?.map((rec, i) => (
                  <div
                    key={i}
                    className="bg-white p-3 rounded-lg border border-gray-200"
                  >
                    <span className="text-xs font-bold text-[#319574] uppercase">
                      {rec.category} • Priority: {rec.priority}
                    </span>
                    <h4 className="font-bold text-sm text-gray-800 mt-0.5">
                      {rec.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {rec.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-right">
              <button
                onClick={() => setSelectedStudent(null)}
                className="bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardC;
