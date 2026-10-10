import React, { useEffect, useState } from "react";
import { DashboardApi } from "../connections/Api";

function Studentprofile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedRisk, setSelectedRisk] = useState("All");
  const [activeStudent, setActiveStudent] = useState(null);

  useEffect(() => {
    DashboardApi()
      .then((res) => {
        // Handle whether the API returns an object directly or wrapped in an array
        const dataPayload = Array.isArray(res) ? res[0] : res;
        setData(dataPayload);
        setLoading(false);
      })
      .catch(() => {
        console.log("Unable to load data");
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 px-4">
        <p className="text-[#319574] font-semibold text-base sm:text-lg animate-pulse text-center">
          Loading student dashboard...
        </p>
      </div>
    );
  }

  const students = data.recentStudentsNeedingAttention || [];
  const departments = ["All", ...new Set(students.map((s) => s.department).filter(Boolean))];

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      (student.name && student.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (student.id && student.id.toString().includes(searchQuery)) ||
      (student.department && student.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDept = selectedDept === "All" || student.department === selectedDept;

    const matchesRisk =
      selectedRisk === "All" ||
      (selectedRisk === "Academic High" && student.academicRisk === "High") ||
      (selectedRisk === "Academic Medium" && student.academicRisk === "Medium") ||
      (selectedRisk === "Any Risk" && (student.academicRisk === "High" || student.academicRisk === "Medium"));

    return matchesSearch && matchesDept && matchesRisk;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-10 ml-0 md:ml-[220px] transition-all">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
              Student Analytics & <span className="text-[#319574] font-medium">Flagged Profiles</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Review institutional performance, filter students needing targeted intervention, and check specific risk causes.
            </p>
          </div>
          <span className="bg-[#319574]/10 text-[#319574] font-medium px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm">
            Showing {filteredStudents.length} of {students.length} Flagged Students
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
              <option value="Academic Medium">Academic Risk: Medium</option>
              <option value="Any Risk">Any Medium/High Risk</option>
            </select>
          </div>

        </div>

        {/* Student Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <div
                key={student.id}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                {/* Top: Info & Success Score */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold text-[#319574] bg-[#319574]/10 px-2 py-0.5 rounded-md">
                      ID: {student.id}
                    </span>
                    <h3 className="font-bold text-gray-800 text-lg mt-1">
                      {student.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {student.department}
                    </p>
                  </div>

                  <div className="text-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <span className="block text-[10px] text-gray-400 font-bold uppercase">Success</span>
                    <span className="text-base font-bold text-[#319574]">{student.successScore}%</span>
                  </div>
                </div>

                {/* Quick Metrics Bar */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded-lg">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Attendance</span>
                    <span className="font-semibold text-gray-700">{student.attendance}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Academic Risk</span>
                    <span className={`font-bold ${student.academicRisk === "High" ? "text-red-600" : "text-amber-600"}`}>
                      {student.academicRisk}
                    </span>
                  </div>
                </div>

                {/* Reason Tag */}
                <div className="bg-amber-50/50 border border-amber-100 p-2.5 rounded-lg text-xs text-amber-900 italic">
                  "{student.reason}"
                </div>

                {/* Action Button to Open Full Deep-Dive Modal */}
                <button
                  onClick={() => setActiveStudent(student)}
                  className="w-full text-center bg-[#319574] hover:bg-[#287a5e] text-white text-xs font-semibold py-2.5 rounded-lg transition-colors shadow-2xs cursor-pointer"
                >
                  View Full Profile Details
                </button>
              </div>
            ))
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
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl space-y-6">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-gray-200 pb-4">
              <div>
                <span className="text-xs bg-[#319574]/10 text-[#319574] font-bold px-2.5 py-1 rounded-md">
                  Student ID: {activeStudent.id}
                </span>
                <h2 className="text-2xl font-bold text-gray-800 mt-1">{activeStudent.name}</h2>
                <p className="text-sm text-gray-500">{activeStudent.department}</p>
              </div>
              <button
                onClick={() => setActiveStudent(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Metrics Overview Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                <span className="text-xs text-gray-400 font-bold block">Success Score</span>
                <span className="text-xl font-bold text-[#319574]">{activeStudent.successScore}%</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                <span className="text-xs text-gray-400 font-bold block">Attendance</span>
                <span className="text-xl font-bold text-gray-700">{activeStudent.attendance}%</span>
              </div>
            </div>

            {/* Risk Summary */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h3 className="text-base font-semibold text-gray-700">Risk Assessment</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between bg-white p-2.5 rounded-lg border border-gray-200">
                  <span className="text-gray-600">Academic Risk Level:</span>
                  <span className={`font-bold ${activeStudent.academicRisk === "High" ? "text-red-600" : "text-amber-600"}`}>
                    {activeStudent.academicRisk}
                  </span>
                </div>
                <div className="flex justify-between bg-white p-2.5 rounded-lg border border-gray-200">
                  <span className="text-gray-600">Placement Risk Level:</span>
                  <span className="font-bold text-gray-700">{activeStudent.placementRisk}</span>
                </div>
              </div>
            </div>

            {/* Flagging Reason */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-700">Flag Reason</h3>
              <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-sm text-red-800">
                {activeStudent.reason}
              </div>
            </div>

            {/* Close Modal Button */}
            <div className="text-right pt-2">
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

export default Studentprofile;