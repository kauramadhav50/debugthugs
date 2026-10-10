import React from "react";
import axios from "axios";

const API = axios.create({
  baseURL: "https://debugthugs.onrender.com",
});

export const DashboardApi = async () => {
  const response = await API.get("/api/v1/analytics/dashboard/", {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const FormApi = async (data) => {
  const response = await API.post("/api/v1/studentform/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response;
};
