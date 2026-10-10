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

export const DashboardApi = async () => {
//   const response = await API.get("/");
  return fakeapi;
};
