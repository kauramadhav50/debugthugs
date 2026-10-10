import React, { useEffect, useState } from "react";
import { ProfileApi } from "../connections/Api";

function StudentDirectory() {
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedRisk, setSelectedRisk] = useState("All");
  const [activeStudent, setActiveStudent] = useState(null); 

  useEffect(() => {
    ProfileApi()
      .then((res) => {
        const list = Array.isArray(res) ? res : res.students || [res];
        setStudentsData(list);
        setLoading(false);
      })
      .catch(() => {
        console.log("Error in getting profile data");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 px-4">
        <p className="text-[#319574] font-semibold text-base sm:text-lg animate-pulse text-center">
          Loading student database...
        </p>
      </div>
    );
  }

  const departments = ["All", ...new Set(studentsData.map((s) => s.student?.department).filter(Boolean))];

  const filteredStudents = studentsData.filter((item) => {
    const student = item.student || {};
    const success = item.successMetrics || {};

    const matchesSearch =
      (student.name && student.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (student.studentId && student.studentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (student.department && student.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDept = selectedDept === "All" || student.department === selectedDept;

    const matchesRisk =
      selectedRisk === "All" ||
      (selectedRisk === "Academic High" && success.academicRisk?.level === "High") ||
      (selectedRisk === "Placement High" && success.placementRisk?.level === "High") ||
      (selectedRisk === "Any Risk" && (success.academicRisk?.level === "High" || success.placementRisk?.level === "High" || success.academicRisk?.level === "Medium" || success.placementRisk?.level === "Medium"));

    return matchesSearch && matchesDept && matchesRisk;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-10 ml-0 md:ml-[220px] transition-all">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
              Student Analytics & <span className="text-[#319574] font-medium">Profiles</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Monitor multi-indicator success scores, risk metrics, and actionable student insights.
            </p>
          </div>
          <span className="bg-[#319574]/10 text-[#319574] font-medium px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm">
            Showing {filteredStudents.length} of {studentsData.length} Students
          </span>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Search Input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by name, ID, or dept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#319574] focus:bg-white transition-all text-gray-800 placeholder-gray-400"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#319574] focus:bg-white transition-all text-gray-700 cursor-pointer"
            >
              {departments.map((dept, index) => (
                <option key={index} value={dept}>
                  {dept === "All" ? "All Departments" : dept}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#319574] focus:bg-white transition-all text-gray-700 cursor-pointer"
            >
              <option value="All">All Risk Profiles</option>
              <option value="Academic High">Academic Risk: High</option>
              <option value="Placement High">Placement Risk: High</option>
              <option value="Any Risk">Any Medium/High Risk</option>
            </select>
          </div>

        </div>

        {/* Student Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((item, index) => {
              const student = item.student || {};
              const success = item.successMetrics || {};
              const attendance = item.attendance || {};

              return (
                <div
                  key={student.studentId || index}
                  className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  {/* Top: Info & Success Score */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-semibold text-[#319574] bg-[#319574]/10 px-2 py-0.5 rounded-md">
                        {student.studentId}
                      </span>
                      <h3 className="font-bold text-gray-800 text-lg mt-1">
                        {student.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {student.department} • Year {student.yearOfStudy} (Sem {student.semester})
                      </p>
                    </div>

                    <div className="text-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                      <span className="block text-[10px] text-gray-400 font-bold uppercase">Success</span>
                      <span className="text-base font-bold text-[#319574]">{success.successScore}%</span>
                    </div>
                  </div>

                  {/* Quick Metrics Bar */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded-lg">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Attendance</span>
                      <span className="font-semibold text-gray-700">{attendance.attendancePercentage}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Score Label</span>
                      <span className="font-semibold text-[#319574]">{success.scoreLabel}</span>
                    </div>
                  </div>

                  {/* Risk Badges */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-100">
                    <div className="flex justify-between items-center bg-gray-50 px-2.5 py-1.5 rounded-md">
                      <span className="text-gray-500 text-[11px]">Academic:</span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                          success.academicRisk?.level === "High"
                            ? "bg-red-100 text-red-700"
                            : success.academicRisk?.level === "Medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {success.academicRisk?.level}
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-gray-50 px-2.5 py-1.5 rounded-md">
                      <span className="text-gray-500 text-[11px]">Placement:</span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                          success.placementRisk?.level === "High"
                            ? "bg-red-100 text-red-700"
                            : success.placementRisk?.level === "Medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {success.placementRisk?.level}
                      </span>
                    </div>
                  </div>

                  {/* Action Button to Open Full Deep-Dive Modal */}
                  <button
                    onClick={() => setActiveStudent(item)}
                    className="w-full text-center bg-[#319574] hover:bg-[#287a5e] text-white text-xs font-semibold py-2.5 rounded-lg transition-colors shadow-2xs cursor-pointer"
                  >
                    View Profile & Insights
                  </button>
                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-white p-10 rounded-xl text-center border border-gray-100">
              <p className="text-gray-500 text-sm">No students match your search or filter criteria.</p>
            </div>
          )}
        </div>

      </div>

      {/* Detailed Student Modal View */}
      {activeStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl space-y-6">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-gray-200 pb-4">
              <div>
                <span className="text-xs bg-[#319574]/10 text-[#319574] font-bold px-2.5 py-1 rounded-md">
                  {activeStudent.student?.studentId}
                </span>
                <h2 className="text-2xl font-bold text-gray-800 mt-1">{activeStudent.student?.name}</h2>
                <p className="text-sm text-gray-500">
                  {activeStudent.student?.department} • {activeStudent.student?.course} Year {activeStudent.student?.yearOfStudy} (Sem {activeStudent.student?.semester}, Sec {activeStudent.student?.section})
                </p>
              </div>
              <button
                onClick={() => setActiveStudent(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Metrics Overview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                <span className="text-xs text-gray-400 font-bold block">Success Score</span>
                <span className="text-xl font-bold text-[#319574]">{activeStudent.successMetrics?.successScore}%</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                <span className="text-xs text-gray-400 font-bold block">Attendance</span>
                <span className="text-xl font-bold text-gray-700">{activeStudent.attendance?.attendancePercentage}%</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                <span className="text-xs text-gray-400 font-bold block">Coding Score</span>
                <span className="text-xl font-bold text-gray-700">{activeStudent.placementReadiness?.codingScore}%</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                <span className="text-xs text-gray-400 font-bold block">LMS Logins</span>
                <span className="text-xl font-bold text-gray-700">{activeStudent.engagement?.lmsLogins}</span>
              </div>
            </div>

            {/* Skills Breakdown */}
            <div>
              <h3 className="text-base font-semibold text-gray-700 mb-3">Core Skills</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeStudent.skills?.map((skill, i) => (
                  <div key={i} className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                    <div>
                      <span className="text-sm font-bold text-gray-800">{skill.name}</span>
                      <span className="block text-xs text-gray-400">{skill.level}</span>
                    </div>
                    <span className="text-sm font-bold text-[#319574]">{skill.score}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendations & Insights */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h3 className="text-base font-semibold text-gray-700">AI Recommendations & Action Plan</h3>
              <div className="space-y-2">
                {activeStudent.insights?.recommendations?.map((rec, i) => (
                  <div key={i} className="bg-white p-3 rounded-lg border border-gray-200 flex justify-between items-start gap-3">
                    <div>
                      <span className="text-xs font-bold text-[#319574] uppercase">{rec.category} • Priority: {rec.priority}</span>
                      <h4 className="font-bold text-sm text-gray-800 mt-0.5">{rec.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{rec.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Close Modal Button */}
            <div className="text-right">
              <button
                onClick={() => setActiveStudent(null)}
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

export default StudentDirectory;