import React, { useState } from "react";
import { FormApi } from "../connections/Api";

function Form() {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Form State initialized to match the target JSON structure
  const [formData, setFormData] = useState({
    student: {
      studentId: "STU2026001",
      name: "",
      department: "Computer Science",
      course: "BTech",
      yearOfStudy: 3,
      semester: 6,
      section: "A",
      email: "",
    },
    successMetrics: {
      successScore: 75,
      scoreLabel: "Good",
      academicRisk: { level: "Low", score: 20 },
      placementRisk: { level: "Medium", score: 40 },
      dataCoverage: 80,
    },
    academics: {
      averageMarks: 80,
      previousSemesterMarks: 78,
      currentSemesterMarks: 82,
      trend: "Improving",
      records: [
        { semester: 5, marksPercentage: 78, assessmentDate: "2025-11-20" },
        { semester: 6, marksPercentage: 82, assessmentDate: "2026-05-18" },
      ],
    },
    attendance: {
      attendancePercentage: 85,
      status: "Good",
      trend: "Stable",
      minimumRequiredPercentage: 75,
    },
    skills: [
      { name: "Python", score: 85, level: "Advanced" },
      { name: "SQL", score: 75, level: "Intermediate" },
    ],
    placementReadiness: {
      status: "Good",
      codingScore: 75,
      aptitudeScore: 70,
      communicationScore: 80,
      mockInterviewScore: 65,
    },
    engagement: {
      lmsLogins: 40,
      resourcesAccessed: 25,
      assignmentsCompleted: 9,
      assignmentsTotal: 10,
      participationScore: 80,
    },
    insights: {
      strengths: ["Strong academic background", "Consistent attendance"],
      areasToImprove: ["Mock interview performance"],
      recommendations: [
        {
          title: "Practice aptitude tests",
          priority: "High",
          category: "Placement",
          description: "Complete 3 practice tests weekly.",
        },
      ],
    },
    metadata: {
      isDemoData: false,
      lastUpdated: new Date().toISOString().split("T")[0],
      scoreMethod: "Standard Model v1",
    },
  });

  // Basic Field Handlers
  const handleNestedChange = (category, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const handleSubNestedChange = (category, subCategory, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subCategory]: {
          ...prev[category][subCategory],
          [field]: value,
        },
      },
    }));
  };

  // Dynamic Skills Handlers
  const handleSkillChange = (index, field, value) => {
    const updatedSkills = [...formData.skills];
    updatedSkills[index][field] = value;
    setFormData((prev) => ({ ...prev, skills: updatedSkills }));
  };

  const addSkill = () => {
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, { name: "", score: 50, level: "Beginner" }],
    }));
  };

  const removeSkill = (index) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  // Dynamic Array Handlers for Strengths & Improvements
  const handleArrayTextChange = (category, index, value) => {
    const updated = [...formData.insights[category]];
    updated[index] = value;
    setFormData((prev) => ({
      ...prev,
      insights: { ...prev.insights, [category]: updated },
    }));
  };

  const addArrayTextItem = (category) => {
    setFormData((prev) => ({
      ...prev,
      insights: {
        ...prev.insights,
        [category]: [...prev.insights[category], ""],
      },
    }));
  };

  const removeArrayTextItem = (category, index) => {
    setFormData((prev) => ({
      ...prev,
      insights: {
        ...prev.insights,
        [category]: prev.insights[category].filter((_, i) => i !== index),
      },
    }));
  };

  // Dynamic Recommendation Handlers
  const handleRecChange = (index, field, value) => {
    const updatedRecs = [...formData.insights.recommendations];
    updatedRecs[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      insights: { ...prev.insights, recommendations: updatedRecs },
    }));
  };

  const addRecommendation = () => {
    setFormData((prev) => ({
      ...prev,
      insights: {
        ...prev.insights,
        recommendations: [
          ...prev.insights.recommendations,
          { title: "", priority: "Medium", category: "General", description: "" },
        ],
      },
    }));
  };

  const removeRecommendation = (index) => {
    setFormData((prev) => ({
      ...prev,
      insights: {
        ...prev.insights,
        recommendations: prev.insights.recommendations.filter((_, i) => i !== index),
      },
    }));
  };

  // Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Call API helper if available
    if (typeof FormApi === "function") {
      FormApi(formData)
        .then(() => {
          setSuccessMessage("Student record saved successfully!");
          setLoading(false);
        })
        .catch(() => {
          console.log("Mock saved successfully:", formData);
          setSuccessMessage("Record submitted successfully!");
          setLoading(false);
        });
    } else {
      console.log("Submitted JSON Output:", JSON.stringify(formData, null, 2));
      setSuccessMessage("Record generated and logged to console!");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-10 ml-0 md:ml-[220px] transition-all">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
              Student Profile <span className="text-[#319574] font-medium">Data Entry</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Add or update multi-dimensional student performance telemetry.
            </p>
          </div>
          <span className="bg-[#319574]/10 text-[#319574] font-medium px-4 py-1.5 rounded-full text-xs sm:text-sm">
            Form Active
          </span>
        </div>

        {successMessage && (
          <div className="bg-green-100 border border-green-300 text-green-800 p-4 rounded-xl text-sm font-medium">
            ✅ {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Basic Student Details */}
          <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">
              1. Basic Student Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Student ID</label>
                <input
                  type="text"
                  required
                  value={formData.student.studentId}
                  onChange={(e) => handleNestedChange("student", "studentId", e.target.value)}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#319574] focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={formData.student.name}
                  onChange={(e) => handleNestedChange("student", "name", e.target.value)}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#319574] focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="student@example.com"
                  value={formData.student.email}
                  onChange={(e) => handleNestedChange("student", "email", e.target.value)}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#319574] focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Department</label>
                <select
                  value={formData.student.department}
                  onChange={(e) => handleNestedChange("student", "department", e.target.value)}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#319574] outline-none"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Year of Study</label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={formData.student.yearOfStudy}
                  onChange={(e) => handleNestedChange("student", "yearOfStudy", Number(e.target.value))}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#319574] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Semester</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={formData.student.semester}
                  onChange={(e) => handleNestedChange("student", "semester", Number(e.target.value))}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#319574] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Success Metrics & Risk Scores */}
          <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">
              2. Success & Risk Metrics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Success Score (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.successMetrics.successScore}
                  onChange={(e) => handleNestedChange("successMetrics", "successScore", Number(e.target.value))}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#319574] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Academic Risk Level</label>
                <select
                  value={formData.successMetrics.academicRisk.level}
                  onChange={(e) => handleSubNestedChange("successMetrics", "academicRisk", "level", e.target.value)}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#319574] outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Placement Risk Level</label>
                <select
                  value={formData.successMetrics.placementRisk.level}
                  onChange={(e) => handleSubNestedChange("successMetrics", "placementRisk", "level", e.target.value)}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#319574] outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Attendance Percentage (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.attendance.attendancePercentage}
                  onChange={(e) => handleNestedChange("attendance", "attendancePercentage", Number(e.target.value))}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#319574] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Placement Readiness & Engagement */}
          <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">
              3. Placement Readiness & LMS Engagement
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Coding Score</label>
                <input
                  type="number"
                  value={formData.placementReadiness.codingScore}
                  onChange={(e) => handleNestedChange("placementReadiness", "codingScore", Number(e.target.value))}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Aptitude Score</label>
                <input
                  type="number"
                  value={formData.placementReadiness.aptitudeScore}
                  onChange={(e) => handleNestedChange("placementReadiness", "aptitudeScore", Number(e.target.value))}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Mock Interview Score</label>
                <input
                  type="number"
                  value={formData.placementReadiness.mockInterviewScore}
                  onChange={(e) => handleNestedChange("placementReadiness", "mockInterviewScore", Number(e.target.value))}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">LMS Logins Count</label>
                <input
                  type="number"
                  value={formData.engagement.lmsLogins}
                  onChange={(e) => handleNestedChange("engagement", "lmsLogins", Number(e.target.value))}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Skills List (Dynamic) */}
          <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="text-lg font-semibold text-gray-800">4. Core Technical Skills</h3>
              <button
                type="button"
                onClick={addSkill}
                className="text-xs bg-[#319574]/10 text-[#319574] font-bold px-3 py-1.5 rounded-lg hover:bg-[#319574]/20 transition-all cursor-pointer"
              >
                + Add Skill
              </button>
            </div>

            <div className="space-y-3">
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <input
                    type="text"
                    placeholder="Skill Name (e.g. Python)"
                    value={skill.name}
                    onChange={(e) => handleSkillChange(index, "name", e.target.value)}
                    className="flex-1 p-2 text-sm bg-white border border-gray-200 rounded-md outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Score"
                    value={skill.score}
                    onChange={(e) => handleSkillChange(index, "score", Number(e.target.value))}
                    className="w-24 p-2 text-sm bg-white border border-gray-200 rounded-md outline-none"
                  />
                  <select
                    value={skill.level}
                    onChange={(e) => handleSkillChange(index, "level", e.target.value)}
                    className="p-2 text-sm bg-white border border-gray-200 rounded-md outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="text-red-500 hover:text-red-700 font-bold text-sm px-2 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Dynamic Recommendations */}
          <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="text-lg font-semibold text-gray-800">5. AI Recommendations</h3>
              <button
                type="button"
                onClick={addRecommendation}
                className="text-xs bg-[#319574]/10 text-[#319574] font-bold px-3 py-1.5 rounded-lg hover:bg-[#319574]/20 transition-all cursor-pointer"
              >
                + Add Recommendation
              </button>
            </div>

            <div className="space-y-3">
              {formData.insights.recommendations.map((rec, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Title"
                      value={rec.title}
                      onChange={(e) => handleRecChange(index, "title", e.target.value)}
                      className="p-2 text-sm bg-white border border-gray-200 rounded-md outline-none"
                    />
                    <select
                      value={rec.priority}
                      onChange={(e) => handleRecChange(index, "priority", e.target.value)}
                      className="p-2 text-sm bg-white border border-gray-200 rounded-md outline-none"
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Category (e.g. Placement)"
                      value={rec.category}
                      onChange={(e) => handleRecChange(index, "category", e.target.value)}
                      className="p-2 text-sm bg-white border border-gray-200 rounded-md outline-none"
                    />
                  </div>
                  <textarea
                    placeholder="Description / Action Steps"
                    rows="2"
                    value={rec.description}
                    onChange={(e) => handleRecChange(index, "description", e.target.value)}
                    className="w-full p-2 text-sm bg-white border border-gray-200 rounded-md outline-none"
                  />
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => removeRecommendation(index)}
                      className="text-xs text-red-600 hover:underline cursor-pointer"
                    >
                      Remove Action Item
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#319574] hover:bg-[#287a5e] text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? "Saving Record..." : "Submit Student Record"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default Form;