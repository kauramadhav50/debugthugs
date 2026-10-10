import React from "react";
import axios from "axios";

const API = axios.create({
  baseURL: "",
});

const fakeapi = [
  {
    summary: {
      totalStudents: 1200,
      averageSuccessScore: 78.5,
      studentsAtAcademicRisk: 86,
      studentsAtPlacementRisk: 124,
      averageAttendance: 89.2,
    },
    successScoreDistribution: [
      { range: "0-20", count: 15 },
      { range: "21-40", count: 65 },
      { range: "41-60", count: 220 },
      { range: "61-80", count: 480 },
      { range: "81-100", count: 420 },
    ],
    departmentPerformance: [
      { department: "Computer Science", averageScore: 85 },
      { department: "IT", averageScore: 81 },
      { department: "Electronics", averageScore: 76 },
      { department: "Mechanical", averageScore: 72 },
      { department: "Civil", averageScore: 70 },
    ],
    riskComparison: [
      { category: "Low Risk", academicRisk: 780, placementRisk: 710 },
      { category: "Medium Risk", academicRisk: 334, placementRisk: 366 },
      { category: "High Risk", academicRisk: 86, placementRisk: 124 },
    ],
    recentStudentsNeedingAttention: [
      {
        id: 1,
        name: "Rahul Sharma",
        department: "Computer Science",
        attendance: 62,
        successScore: 38,
        academicRisk: "High",
        placementRisk: "Medium",
        reason: "Low attendance and declining grades",
      },
      {
        id: 2,
        name: "Priya Verma",
        department: "IT",
        attendance: 71,
        successScore: 45,
        academicRisk: "Medium",
        placementRisk: "High",
        reason: "Low placement assessment score",
      },
      {
        id: 3,
        name: "Aman Singh",
        department: "Mechanical",
        attendance: 58,
        successScore: 32,
        academicRisk: "High",
        placementRisk: "High",
        reason: "Low attendance and poor assessment results",
      },
      {
        id: 4,
        name: "Neha Gupta",
        department: "Electronics",
        attendance: 76,
        successScore: 55,
        academicRisk: "Medium",
        placementRisk: "Medium",
        reason: "Needs improvement in core subjects",
      },
      {
        id: 5,
        name: "Vikram Patel",
        department: "Civil",
        attendance: 65,
        successScore: 42,
        academicRisk: "High",
        placementRisk: "Medium",
        reason: "Irregular attendance and low test scores",
      },
    ],
  },
];

const fakeprofileapi = [{
  "student": {
    "studentId": "STU2026001",
    "name": "Aarav Sharma",
    "department": "Computer Science",
    "course": "BTech",
    "yearOfStudy": 3,
    "semester": 6,
    "section": "A",
    "email": "aarav.sharma@example.com"
  },
  "successMetrics": {
    "successScore": 78,
    "scoreLabel": "Good",
    "academicRisk": {
      "level": "Low",
      "score": 22
    },
    "placementRisk": {
      "level": "Medium",
      "score": 48
    },
    "dataCoverage": 75
  },
  "academics": {
    "averageMarks": 82.5,
    "previousSemesterMarks": 79.0,
    "currentSemesterMarks": 84.0,
    "trend": "Improving",
    "records": [
      {
        "semester": 4,
        "marksPercentage": 76.5,
        "assessmentDate": "2025-05-15"
      },
      {
        "semester": 5,
        "marksPercentage": 79.0,
        "assessmentDate": "2025-11-20"
      },
      {
        "semester": 6,
        "marksPercentage": 84.0,
        "assessmentDate": "2026-05-18"
      }
    ]
  },
  "attendance": {
    "attendancePercentage": 86.5,
    "status": "Good",
    "trend": "Stable",
    "minimumRequiredPercentage": 75
  },
  "skills": [
    {
      "name": "Python",
      "score": 88,
      "level": "Advanced"
    },
    {
      "name": "SQL",
      "score": 78,
      "level": "Intermediate"
    },
    {
      "name": "Data Structures",
      "score": 82,
      "level": "Advanced"
    },
    {
      "name": "Machine Learning",
      "score": 68,
      "level": "Intermediate"
    }
  ],
  "placementReadiness": {
    "status": "Needs Improvement",
    "codingScore": 76,
    "aptitudeScore": 64,
    "communicationScore": 72,
    "mockInterviewScore": 60
  },
  "engagement": {
    "lmsLogins": 42,
    "resourcesAccessed": 28,
    "assignmentsCompleted": 9,
    "assignmentsTotal": 10,
    "participationScore": 80
  },
  "insights": {
    "strengths": [
      "Improving academic performance",
      "Strong Python and Data Structures skills",
      "Attendance is above the required threshold"
    ],
    "areasToImprove": [
      "Aptitude test performance",
      "Mock interview preparation",
      "Machine Learning fundamentals"
    ],
    "recommendations": [
      {
        "title": "Practice aptitude questions",
        "priority": "High",
        "category": "Placement",
        "description": "Complete 3 aptitude practice sessions per week."
      },
      {
        "title": "Prepare for mock interviews",
        "priority": "High",
        "category": "Career",
        "description": "Complete at least 2 mock interviews this month."
      },
      {
        "title": "Strengthen Machine Learning",
        "priority": "Medium",
        "category": "Skills",
        "description": "Build a small classification project and revise model evaluation."
      }
    ]
  },
  "metadata": {
    "isDemoData": true,
    "lastUpdated": "2026-10-10",
    "scoreMethod": "Illustrative demo only"
  }
},{
  "student": {
    "studentId": "STU2026001",
    "name": "Aarav Sharma",
    "department": "Computer Science",
    "course": "BTech",
    "yearOfStudy": 3,
    "semester": 6,
    "section": "A",
    "email": "aarav.sharma@example.com"
  },
  "successMetrics": {
    "successScore": 78,
    "scoreLabel": "Good",
    "academicRisk": {
      "level": "Low",
      "score": 22
    },
    "placementRisk": {
      "level": "Medium",
      "score": 48
    },
    "dataCoverage": 75
  },
  "academics": {
    "averageMarks": 82.5,
    "previousSemesterMarks": 79.0,
    "currentSemesterMarks": 84.0,
    "trend": "Improving",
    "records": [
      {
        "semester": 4,
        "marksPercentage": 76.5,
        "assessmentDate": "2025-05-15"
      },
      {
        "semester": 5,
        "marksPercentage": 79.0,
        "assessmentDate": "2025-11-20"
      },
      {
        "semester": 6,
        "marksPercentage": 84.0,
        "assessmentDate": "2026-05-18"
      }
    ]
  },
  "attendance": {
    "attendancePercentage": 86.5,
    "status": "Good",
    "trend": "Stable",
    "minimumRequiredPercentage": 75
  },
  "skills": [
    {
      "name": "Python",
      "score": 88,
      "level": "Advanced"
    },
    {
      "name": "SQL",
      "score": 78,
      "level": "Intermediate"
    },
    {
      "name": "Data Structures",
      "score": 82,
      "level": "Advanced"
    },
    {
      "name": "Machine Learning",
      "score": 68,
      "level": "Intermediate"
    }
  ],
  "placementReadiness": {
    "status": "Needs Improvement",
    "codingScore": 76,
    "aptitudeScore": 64,
    "communicationScore": 72,
    "mockInterviewScore": 60
  },
  "engagement": {
    "lmsLogins": 42,
    "resourcesAccessed": 28,
    "assignmentsCompleted": 9,
    "assignmentsTotal": 10,
    "participationScore": 80
  },
  "insights": {
    "strengths": [
      "Improving academic performance",
      "Strong Python and Data Structures skills",
      "Attendance is above the required threshold"
    ],
    "areasToImprove": [
      "Aptitude test performance",
      "Mock interview preparation",
      "Machine Learning fundamentals"
    ],
    "recommendations": [
      {
        "title": "Practice aptitude questions",
        "priority": "High",
        "category": "Placement",
        "description": "Complete 3 aptitude practice sessions per week."
      },
      {
        "title": "Prepare for mock interviews",
        "priority": "High",
        "category": "Career",
        "description": "Complete at least 2 mock interviews this month."
      },
      {
        "title": "Strengthen Machine Learning",
        "priority": "Medium",
        "category": "Skills",
        "description": "Build a small classification project and revise model evaluation."
      }
    ]
  },
  "metadata": {
    "isDemoData": true,
    "lastUpdated": "2026-10-10",
    "scoreMethod": "Illustrative demo only"
  }
},{
  "student": {
    "studentId": "STU2026001",
    "name": "Aarav Sharma",
    "department": "Computer Science",
    "course": "BTech",
    "yearOfStudy": 3,
    "semester": 6,
    "section": "A",
    "email": "aarav.sharma@example.com"
  },
  "successMetrics": {
    "successScore": 78,
    "scoreLabel": "Good",
    "academicRisk": {
      "level": "Low",
      "score": 22
    },
    "placementRisk": {
      "level": "Medium",
      "score": 48
    },
    "dataCoverage": 75
  },
  "academics": {
    "averageMarks": 82.5,
    "previousSemesterMarks": 79.0,
    "currentSemesterMarks": 84.0,
    "trend": "Improving",
    "records": [
      {
        "semester": 4,
        "marksPercentage": 76.5,
        "assessmentDate": "2025-05-15"
      },
      {
        "semester": 5,
        "marksPercentage": 79.0,
        "assessmentDate": "2025-11-20"
      },
      {
        "semester": 6,
        "marksPercentage": 84.0,
        "assessmentDate": "2026-05-18"
      }
    ]
  },
  "attendance": {
    "attendancePercentage": 86.5,
    "status": "Good",
    "trend": "Stable",
    "minimumRequiredPercentage": 75
  },
  "skills": [
    {
      "name": "Python",
      "score": 88,
      "level": "Advanced"
    },
    {
      "name": "SQL",
      "score": 78,
      "level": "Intermediate"
    },
    {
      "name": "Data Structures",
      "score": 82,
      "level": "Advanced"
    },
    {
      "name": "Machine Learning",
      "score": 68,
      "level": "Intermediate"
    }
  ],
  "placementReadiness": {
    "status": "Needs Improvement",
    "codingScore": 76,
    "aptitudeScore": 64,
    "communicationScore": 72,
    "mockInterviewScore": 60
  },
  "engagement": {
    "lmsLogins": 42,
    "resourcesAccessed": 28,
    "assignmentsCompleted": 9,
    "assignmentsTotal": 10,
    "participationScore": 80
  },
  "insights": {
    "strengths": [
      "Improving academic performance",
      "Strong Python and Data Structures skills",
      "Attendance is above the required threshold"
    ],
    "areasToImprove": [
      "Aptitude test performance",
      "Mock interview preparation",
      "Machine Learning fundamentals"
    ],
    "recommendations": [
      {
        "title": "Practice aptitude questions",
        "priority": "High",
        "category": "Placement",
        "description": "Complete 3 aptitude practice sessions per week."
      },
      {
        "title": "Prepare for mock interviews",
        "priority": "High",
        "category": "Career",
        "description": "Complete at least 2 mock interviews this month."
      },
      {
        "title": "Strengthen Machine Learning",
        "priority": "Medium",
        "category": "Skills",
        "description": "Build a small classification project and revise model evaluation."
      }
    ]
  },
  "metadata": {
    "isDemoData": true,
    "lastUpdated": "2026-10-10",
    "scoreMethod": "Illustrative demo only"
  }
},{
  "student": {
    "studentId": "STU2026001",
    "name": "Aarav Sharma",
    "department": "Computer Science",
    "course": "BTech",
    "yearOfStudy": 3,
    "semester": 6,
    "section": "A",
    "email": "aarav.sharma@example.com"
  },
  "successMetrics": {
    "successScore": 78,
    "scoreLabel": "Good",
    "academicRisk": {
      "level": "Low",
      "score": 22
    },
    "placementRisk": {
      "level": "Medium",
      "score": 48
    },
    "dataCoverage": 75
  },
  "academics": {
    "averageMarks": 82.5,
    "previousSemesterMarks": 79.0,
    "currentSemesterMarks": 84.0,
    "trend": "Improving",
    "records": [
      {
        "semester": 4,
        "marksPercentage": 76.5,
        "assessmentDate": "2025-05-15"
      },
      {
        "semester": 5,
        "marksPercentage": 79.0,
        "assessmentDate": "2025-11-20"
      },
      {
        "semester": 6,
        "marksPercentage": 84.0,
        "assessmentDate": "2026-05-18"
      }
    ]
  },
  "attendance": {
    "attendancePercentage": 86.5,
    "status": "Good",
    "trend": "Stable",
    "minimumRequiredPercentage": 75
  },
  "skills": [
    {
      "name": "Python",
      "score": 88,
      "level": "Advanced"
    },
    {
      "name": "SQL",
      "score": 78,
      "level": "Intermediate"
    },
    {
      "name": "Data Structures",
      "score": 82,
      "level": "Advanced"
    },
    {
      "name": "Machine Learning",
      "score": 68,
      "level": "Intermediate"
    }
  ],
  "placementReadiness": {
    "status": "Needs Improvement",
    "codingScore": 76,
    "aptitudeScore": 64,
    "communicationScore": 72,
    "mockInterviewScore": 60
  },
  "engagement": {
    "lmsLogins": 42,
    "resourcesAccessed": 28,
    "assignmentsCompleted": 9,
    "assignmentsTotal": 10,
    "participationScore": 80
  },
  "insights": {
    "strengths": [
      "Improving academic performance",
      "Strong Python and Data Structures skills",
      "Attendance is above the required threshold"
    ],
    "areasToImprove": [
      "Aptitude test performance",
      "Mock interview preparation",
      "Machine Learning fundamentals"
    ],
    "recommendations": [
      {
        "title": "Practice aptitude questions",
        "priority": "High",
        "category": "Placement",
        "description": "Complete 3 aptitude practice sessions per week."
      },
      {
        "title": "Prepare for mock interviews",
        "priority": "High",
        "category": "Career",
        "description": "Complete at least 2 mock interviews this month."
      },
      {
        "title": "Strengthen Machine Learning",
        "priority": "Medium",
        "category": "Skills",
        "description": "Build a small classification project and revise model evaluation."
      }
    ]
  },
  "metadata": {
    "isDemoData": true,
    "lastUpdated": "2026-10-10",
    "scoreMethod": "Illustrative demo only"
  }
},{
  "student": {
    "studentId": "STU2026001",
    "name": "Aarav Sharma",
    "department": "Computer Science",
    "course": "BTech",
    "yearOfStudy": 3,
    "semester": 6,
    "section": "A",
    "email": "aarav.sharma@example.com"
  },
  "successMetrics": {
    "successScore": 78,
    "scoreLabel": "Good",
    "academicRisk": {
      "level": "Low",
      "score": 22
    },
    "placementRisk": {
      "level": "Medium",
      "score": 48
    },
    "dataCoverage": 75
  },
  "academics": {
    "averageMarks": 82.5,
    "previousSemesterMarks": 79.0,
    "currentSemesterMarks": 84.0,
    "trend": "Improving",
    "records": [
      {
        "semester": 4,
        "marksPercentage": 76.5,
        "assessmentDate": "2025-05-15"
      },
      {
        "semester": 5,
        "marksPercentage": 79.0,
        "assessmentDate": "2025-11-20"
      },
      {
        "semester": 6,
        "marksPercentage": 84.0,
        "assessmentDate": "2026-05-18"
      }
    ]
  },
  "attendance": {
    "attendancePercentage": 86.5,
    "status": "Good",
    "trend": "Stable",
    "minimumRequiredPercentage": 75
  },
  "skills": [
    {
      "name": "Python",
      "score": 88,
      "level": "Advanced"
    },
    {
      "name": "SQL",
      "score": 78,
      "level": "Intermediate"
    },
    {
      "name": "Data Structures",
      "score": 82,
      "level": "Advanced"
    },
    {
      "name": "Machine Learning",
      "score": 68,
      "level": "Intermediate"
    }
  ],
  "placementReadiness": {
    "status": "Needs Improvement",
    "codingScore": 76,
    "aptitudeScore": 64,
    "communicationScore": 72,
    "mockInterviewScore": 60
  },
  "engagement": {
    "lmsLogins": 42,
    "resourcesAccessed": 28,
    "assignmentsCompleted": 9,
    "assignmentsTotal": 10,
    "participationScore": 80
  },
  "insights": {
    "strengths": [
      "Improving academic performance",
      "Strong Python and Data Structures skills",
      "Attendance is above the required threshold"
    ],
    "areasToImprove": [
      "Aptitude test performance",
      "Mock interview preparation",
      "Machine Learning fundamentals"
    ],
    "recommendations": [
      {
        "title": "Practice aptitude questions",
        "priority": "High",
        "category": "Placement",
        "description": "Complete 3 aptitude practice sessions per week."
      },
      {
        "title": "Prepare for mock interviews",
        "priority": "High",
        "category": "Career",
        "description": "Complete at least 2 mock interviews this month."
      },
      {
        "title": "Strengthen Machine Learning",
        "priority": "Medium",
        "category": "Skills",
        "description": "Build a small classification project and revise model evaluation."
      }
    ]
  },
  "metadata": {
    "isDemoData": true,
    "lastUpdated": "2026-10-10",
    "scoreMethod": "Illustrative demo only"
  }
},{
  "student": {
    "studentId": "STU2026001",
    "name": "Aarav Sharma",
    "department": "Computer Science",
    "course": "BTech",
    "yearOfStudy": 3,
    "semester": 6,
    "section": "A",
    "email": "aarav.sharma@example.com"
  },
  "successMetrics": {
    "successScore": 78,
    "scoreLabel": "Good",
    "academicRisk": {
      "level": "Low",
      "score": 22
    },
    "placementRisk": {
      "level": "Medium",
      "score": 48
    },
    "dataCoverage": 75
  },
  "academics": {
    "averageMarks": 82.5,
    "previousSemesterMarks": 79.0,
    "currentSemesterMarks": 84.0,
    "trend": "Improving",
    "records": [
      {
        "semester": 4,
        "marksPercentage": 76.5,
        "assessmentDate": "2025-05-15"
      },
      {
        "semester": 5,
        "marksPercentage": 79.0,
        "assessmentDate": "2025-11-20"
      },
      {
        "semester": 6,
        "marksPercentage": 84.0,
        "assessmentDate": "2026-05-18"
      }
    ]
  },
  "attendance": {
    "attendancePercentage": 86.5,
    "status": "Good",
    "trend": "Stable",
    "minimumRequiredPercentage": 75
  },
  "skills": [
    {
      "name": "Python",
      "score": 88,
      "level": "Advanced"
    },
    {
      "name": "SQL",
      "score": 78,
      "level": "Intermediate"
    },
    {
      "name": "Data Structures",
      "score": 82,
      "level": "Advanced"
    },
    {
      "name": "Machine Learning",
      "score": 68,
      "level": "Intermediate"
    }
  ],
  "placementReadiness": {
    "status": "Needs Improvement",
    "codingScore": 76,
    "aptitudeScore": 64,
    "communicationScore": 72,
    "mockInterviewScore": 60
  },
  "engagement": {
    "lmsLogins": 42,
    "resourcesAccessed": 28,
    "assignmentsCompleted": 9,
    "assignmentsTotal": 10,
    "participationScore": 80
  },
  "insights": {
    "strengths": [
      "Improving academic performance",
      "Strong Python and Data Structures skills",
      "Attendance is above the required threshold"
    ],
    "areasToImprove": [
      "Aptitude test performance",
      "Mock interview preparation",
      "Machine Learning fundamentals"
    ],
    "recommendations": [
      {
        "title": "Practice aptitude questions",
        "priority": "High",
        "category": "Placement",
        "description": "Complete 3 aptitude practice sessions per week."
      },
      {
        "title": "Prepare for mock interviews",
        "priority": "High",
        "category": "Career",
        "description": "Complete at least 2 mock interviews this month."
      },
      {
        "title": "Strengthen Machine Learning",
        "priority": "Medium",
        "category": "Skills",
        "description": "Build a small classification project and revise model evaluation."
      }
    ]
  },
  "metadata": {
    "isDemoData": true,
    "lastUpdated": "2026-10-10",
    "scoreMethod": "Illustrative demo only"
  }
},{
  "student": {
    "studentId": "STU2026001",
    "name": "Aarav Sharma",
    "department": "Computer Science",
    "course": "BTech",
    "yearOfStudy": 3,
    "semester": 6,
    "section": "A",
    "email": "aarav.sharma@example.com"
  },
  "successMetrics": {
    "successScore": 78,
    "scoreLabel": "Good",
    "academicRisk": {
      "level": "Low",
      "score": 22
    },
    "placementRisk": {
      "level": "Medium",
      "score": 48
    },
    "dataCoverage": 75
  },
  "academics": {
    "averageMarks": 82.5,
    "previousSemesterMarks": 79.0,
    "currentSemesterMarks": 84.0,
    "trend": "Improving",
    "records": [
      {
        "semester": 4,
        "marksPercentage": 76.5,
        "assessmentDate": "2025-05-15"
      },
      {
        "semester": 5,
        "marksPercentage": 79.0,
        "assessmentDate": "2025-11-20"
      },
      {
        "semester": 6,
        "marksPercentage": 84.0,
        "assessmentDate": "2026-05-18"
      }
    ]
  },
  "attendance": {
    "attendancePercentage": 86.5,
    "status": "Good",
    "trend": "Stable",
    "minimumRequiredPercentage": 75
  },
  "skills": [
    {
      "name": "Python",
      "score": 88,
      "level": "Advanced"
    },
    {
      "name": "SQL",
      "score": 78,
      "level": "Intermediate"
    },
    {
      "name": "Data Structures",
      "score": 82,
      "level": "Advanced"
    },
    {
      "name": "Machine Learning",
      "score": 68,
      "level": "Intermediate"
    }
  ],
  "placementReadiness": {
    "status": "Needs Improvement",
    "codingScore": 76,
    "aptitudeScore": 64,
    "communicationScore": 72,
    "mockInterviewScore": 60
  },
  "engagement": {
    "lmsLogins": 42,
    "resourcesAccessed": 28,
    "assignmentsCompleted": 9,
    "assignmentsTotal": 10,
    "participationScore": 80
  },
  "insights": {
    "strengths": [
      "Improving academic performance",
      "Strong Python and Data Structures skills",
      "Attendance is above the required threshold"
    ],
    "areasToImprove": [
      "Aptitude test performance",
      "Mock interview preparation",
      "Machine Learning fundamentals"
    ],
    "recommendations": [
      {
        "title": "Practice aptitude questions",
        "priority": "High",
        "category": "Placement",
        "description": "Complete 3 aptitude practice sessions per week."
      },
      {
        "title": "Prepare for mock interviews",
        "priority": "High",
        "category": "Career",
        "description": "Complete at least 2 mock interviews this month."
      },
      {
        "title": "Strengthen Machine Learning",
        "priority": "Medium",
        "category": "Skills",
        "description": "Build a small classification project and revise model evaluation."
      }
    ]
  },
  "metadata": {
    "isDemoData": true,
    "lastUpdated": "2026-10-10",
    "scoreMethod": "Illustrative demo only"
  }
},{
  "student": {
    "studentId": "STU2026001",
    "name": "Aarav Sharma",
    "department": "Computer Science",
    "course": "BTech",
    "yearOfStudy": 3,
    "semester": 6,
    "section": "A",
    "email": "aarav.sharma@example.com"
  },
  "successMetrics": {
    "successScore": 78,
    "scoreLabel": "Good",
    "academicRisk": {
      "level": "Low",
      "score": 22
    },
    "placementRisk": {
      "level": "Medium",
      "score": 48
    },
    "dataCoverage": 75
  },
  "academics": {
    "averageMarks": 82.5,
    "previousSemesterMarks": 79.0,
    "currentSemesterMarks": 84.0,
    "trend": "Improving",
    "records": [
      {
        "semester": 4,
        "marksPercentage": 76.5,
        "assessmentDate": "2025-05-15"
      },
      {
        "semester": 5,
        "marksPercentage": 79.0,
        "assessmentDate": "2025-11-20"
      },
      {
        "semester": 6,
        "marksPercentage": 84.0,
        "assessmentDate": "2026-05-18"
      }
    ]
  },
  "attendance": {
    "attendancePercentage": 86.5,
    "status": "Good",
    "trend": "Stable",
    "minimumRequiredPercentage": 75
  },
  "skills": [
    {
      "name": "Python",
      "score": 88,
      "level": "Advanced"
    },
    {
      "name": "SQL",
      "score": 78,
      "level": "Intermediate"
    },
    {
      "name": "Data Structures",
      "score": 82,
      "level": "Advanced"
    },
    {
      "name": "Machine Learning",
      "score": 68,
      "level": "Intermediate"
    }
  ],
  "placementReadiness": {
    "status": "Needs Improvement",
    "codingScore": 76,
    "aptitudeScore": 64,
    "communicationScore": 72,
    "mockInterviewScore": 60
  },
  "engagement": {
    "lmsLogins": 42,
    "resourcesAccessed": 28,
    "assignmentsCompleted": 9,
    "assignmentsTotal": 10,
    "participationScore": 80
  },
  "insights": {
    "strengths": [
      "Improving academic performance",
      "Strong Python and Data Structures skills",
      "Attendance is above the required threshold"
    ],
    "areasToImprove": [
      "Aptitude test performance",
      "Mock interview preparation",
      "Machine Learning fundamentals"
    ],
    "recommendations": [
      {
        "title": "Practice aptitude questions",
        "priority": "High",
        "category": "Placement",
        "description": "Complete 3 aptitude practice sessions per week."
      },
      {
        "title": "Prepare for mock interviews",
        "priority": "High",
        "category": "Career",
        "description": "Complete at least 2 mock interviews this month."
      },
      {
        "title": "Strengthen Machine Learning",
        "priority": "Medium",
        "category": "Skills",
        "description": "Build a small classification project and revise model evaluation."
      }
    ]
  },
  "metadata": {
    "isDemoData": true,
    "lastUpdated": "2026-10-10",
    "scoreMethod": "Illustrative demo only"
  }
},{
  "student": {
    "studentId": "STU2026001",
    "name": "Aarav Sharma",
    "department": "Computer Science",
    "course": "BTech",
    "yearOfStudy": 3,
    "semester": 6,
    "section": "A",
    "email": "aarav.sharma@example.com"
  },
  "successMetrics": {
    "successScore": 78,
    "scoreLabel": "Good",
    "academicRisk": {
      "level": "Low",
      "score": 22
    },
    "placementRisk": {
      "level": "Medium",
      "score": 48
    },
    "dataCoverage": 75
  },
  "academics": {
    "averageMarks": 82.5,
    "previousSemesterMarks": 79.0,
    "currentSemesterMarks": 84.0,
    "trend": "Improving",
    "records": [
      {
        "semester": 4,
        "marksPercentage": 76.5,
        "assessmentDate": "2025-05-15"
      },
      {
        "semester": 5,
        "marksPercentage": 79.0,
        "assessmentDate": "2025-11-20"
      },
      {
        "semester": 6,
        "marksPercentage": 84.0,
        "assessmentDate": "2026-05-18"
      }
    ]
  },
  "attendance": {
    "attendancePercentage": 86.5,
    "status": "Good",
    "trend": "Stable",
    "minimumRequiredPercentage": 75
  },
  "skills": [
    {
      "name": "Python",
      "score": 88,
      "level": "Advanced"
    },
    {
      "name": "SQL",
      "score": 78,
      "level": "Intermediate"
    },
    {
      "name": "Data Structures",
      "score": 82,
      "level": "Advanced"
    },
    {
      "name": "Machine Learning",
      "score": 68,
      "level": "Intermediate"
    }
  ],
  "placementReadiness": {
    "status": "Needs Improvement",
    "codingScore": 76,
    "aptitudeScore": 64,
    "communicationScore": 72,
    "mockInterviewScore": 60
  },
  "engagement": {
    "lmsLogins": 42,
    "resourcesAccessed": 28,
    "assignmentsCompleted": 9,
    "assignmentsTotal": 10,
    "participationScore": 80
  },
  "insights": {
    "strengths": [
      "Improving academic performance",
      "Strong Python and Data Structures skills",
      "Attendance is above the required threshold"
    ],
    "areasToImprove": [
      "Aptitude test performance",
      "Mock interview preparation",
      "Machine Learning fundamentals"
    ],
    "recommendations": [
      {
        "title": "Practice aptitude questions",
        "priority": "High",
        "category": "Placement",
        "description": "Complete 3 aptitude practice sessions per week."
      },
      {
        "title": "Prepare for mock interviews",
        "priority": "High",
        "category": "Career",
        "description": "Complete at least 2 mock interviews this month."
      },
      {
        "title": "Strengthen Machine Learning",
        "priority": "Medium",
        "category": "Skills",
        "description": "Build a small classification project and revise model evaluation."
      }
    ]
  },
  "metadata": {
    "isDemoData": true,
    "lastUpdated": "2026-10-10",
    "scoreMethod": "Illustrative demo only"
  }
}
];

export const DashboardApi = async () => {
  //   const response = await API.get("/");
  return fakeapi;
};

export const ProfileApi = async () => {
  return fakeprofileapi;
};

export const FormApi = async ()=>{
    return 0
}
