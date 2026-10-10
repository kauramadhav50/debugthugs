import React, { useEffect, useState } from "react";
import { ProfileApi } from "../connections/Api";

function Student_segmentation() {
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState("All");

  useEffect(() => {
    ProfileApi()
      .then((res) => {
        const list = Array.isArray(res) ? res : res.students || [res];
        setStudentsData(list);
        setLoading(false);
      })
      .catch(() => {
        console.log("Error in getting student segmentation data");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 px-4">
        <p className="text-[#319574] font-semibold text-base sm:text-lg animate-pulse text-center">
          Loading student segments...
        </p>
      </div>
    );
  }

  // Categorize students into segments based on your metrics
  const segments = {
    strongOverall: [],
    academicallyAtRisk: [],
    placementSupportNeeded: [],
    insufficientData: []
  };

  studentsData.forEach((item) => {
    const success = item.successMetrics || {};
    
    // Check for Insufficient Data
    if (success.dataCoverage && success.dataCoverage < 50) {
      segments.insufficientData.push(item);
      return;
    }

    const isAcademicHighRisk = success.academicRisk?.level === "High";
    const isPlacementRisk = success.placementRisk?.level === "High" || success.placementRisk?.level === "Medium";
    const successScore = success.successScore || 0;

    if (isAcademicHighRisk) {
      segments.academicallyAtRisk.push(item);
    } else if (isPlacementRisk || successScore < 70) {
      segments.placementSupportNeeded.push(item);
    } else {
      segments.strongOverall.push(item);
    }
  });

  // Segment config cards for summary display
  const segmentCards = [
    {
      key: "Strong Overall",
      title: "Strong Overall",
      description: "Thriving academically and high placement readiness.",
      count: segments.strongOverall.length,
      color: "border-l-4 border-l-green-500 bg-green-50/20",
      textColor: "text-green-700",
      badgeBg: "bg-green-100 text-green-800"
    },
    {
      key: "Academically At Risk",
      title: "Academically At Risk",
      description: "Students requiring immediate academic interventions & tutoring.",
      count: segments.academicallyAtRisk.length,
      color: "border-l-4 border-l-red-500 bg-red-50/20",
      textColor: "text-red-700",
      badgeBg: "bg-red-100 text-red-800"
    },
    {
      key: "Placement Support Needed",
      title: "Placement Support Needed",
      description: "Good academics or skills, but need aptitude & interview coaching.",
      count: segments.placementSupportNeeded.length,
      color: "border-l-4 border-l-amber-500 bg-amber-50/20",
      textColor: "text-amber-700",
      badgeBg: "bg-amber-100 text-amber-800"
    },
    {
      key: "Insufficient Data",
      title: "Insufficient Data",
      description: "Low system telemetry or missing assessment records.",
      count: segments.insufficientData.length,
      color: "border-l-4 border-l-gray-400 bg-gray-50/50",
      textColor: "text-gray-700",
      badgeBg: "bg-gray-100 text-gray-800"
    }
  ];

  const getFilteredStudents = () => {
    if (selectedSegment === "Strong Overall") return segments.strongOverall;
    if (selectedSegment === "Academically At Risk") return segments.academicallyAtRisk;
    if (selectedSegment === "Placement Support Needed") return segments.placementSupportNeeded;
    if (selectedSegment === "Insufficient Data") return segments.insufficientData;
    return studentsData; // "All"
  };

  const displayedStudents = getFilteredStudents();

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-10 ml-0 md:ml-[220px] transition-all">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
              Student <span className="text-[#319574] font-medium">Segmentation</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Group students into tactical cohorts for targeted institutional interventions.
            </p>
          </div>
          <button
            onClick={() => setSelectedSegment("All")}
            className="bg-[#319574]/10 hover:bg-[#319574]/20 text-[#319574] font-semibold px-4 py-1.5 rounded-full text-xs sm:text-sm transition-all cursor-pointer"
          >
            View All Cohorts ({studentsData.length})
          </button>
        </div>

        {/* Segment Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {segmentCards.map((seg) => (
            <div
              key={seg.key}
              onClick={() => setSelectedSegment(selectedSegment === seg.key ? "All" : seg.key)}
              className={`bg-white p-5 rounded-xl shadow-sm border border-gray-100 cursor-pointer transition-all hover:shadow-md ${seg.color} ${
                selectedSegment === seg.key ? "ring-2 ring-[#319574]" : ""
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${seg.badgeBg}`}>
                  {seg.count} Students
                </span>
                <span className="text-xs text-gray-400">Click to filter</span>
              </div>
              <h3 className="font-bold text-gray-800 text-base mt-2">{seg.title}</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{seg.description}</p>
            </div>
          ))}
        </div>

        {/* Dynamic Student List Based on Selected Segment */}
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="text-lg font-semibold text-gray-800">
              Cohort Members: <span className="text-[#319574]">{selectedSegment}</span>
            </h3>
            <span className="text-xs text-gray-400 font-medium">{displayedStudents.length} records shown</span>
          </div>

          <div className="space-y-3">
            {displayedStudents.length > 0 ? (
              displayedStudents.map((item, index) => {
                const student = item.student || {};
                const success = item.successMetrics || {};

                return (
                  <div
                    key={student.studentId || index}
                    className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#319574] bg-[#319574]/10 px-2 py-0.5 rounded-md">
                          {student.studentId}
                        </span>
                        <h4 className="font-bold text-gray-800 text-base">{student.name}</h4>
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md font-medium">
                          {student.department}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Course: {student.course} • Year {student.yearOfStudy} (Sem {student.semester})
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-center px-3 py-1 bg-white rounded-lg border border-gray-100">
                        <span className="block text-[10px] text-gray-400 uppercase font-bold">Success</span>
                        <span className="text-sm font-bold text-[#319574]">{success.successScore}%</span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                          Academic Risk: {success.academicRisk?.level}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                          Placement Risk: {success.placementRisk?.level}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 py-6 text-center">
                No students found in this segment.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Student_segmentation;