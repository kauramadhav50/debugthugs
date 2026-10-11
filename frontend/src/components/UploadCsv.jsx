import React, { useState } from "react";
import { csvApi } from "../connections/Api";

function UploadCsv() {
  const [data, setData] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.name && !selectedFile.name.endsWith(".csv")) {
        setError("Please upload a valid .csv file.");
        setFile(null);
        return;
      }
      setError(null);
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("dataset_type", "students");

    try {
      const response = await csvApi(formData);
      setData(response);
      setLoading(false);
      alert("File uploaded successfully!");
    } catch (err) {
      console.error("Failed to upload the file", err);
      const backendError = err.response?.data
        ? JSON.stringify(err.response.data)
        : "Failed to upload the file.";
      setError(backendError);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-emerald-100 mt-10">
      <h2 className="text-2xl font-bold text-emerald-900 mb-6 flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-[#2E8B57]"></span>
        Upload CSV File
      </h2>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="space-y-6">
        <div className="border-2 border-dashed border-emerald-200 rounded-xl p-8 text-center bg-emerald-50/30 hover:bg-emerald-50/60 hover:border-[#2E8B57] transition-all">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="csv-file-input"
          />
          <label
            htmlFor="csv-file-input"
            className="cursor-pointer flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-[#2E8B57] mb-3">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <span className="text-emerald-900 font-semibold">
              {file
                ? file.name
                : "Click to browse or drag & drop your CSV file here"}
            </span>
            <span className="text-sm text-emerald-600/70 mt-1">
              Supports .CSV files only
            </span>
          </label>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!file || loading}
          className={`w-full py-3.5 px-4 rounded-xl text-white font-medium transition-all shadow-md ${
            !file || loading
              ? "bg-gray-300 cursor-not-allowed shadow-none"
              : "bg-[#2E8B57] hover:bg-[#257047] active:scale-[0.99]"
          }`}
        >
          {loading ? "Uploading..." : "Upload and Process"}
        </button>
      </form>

      {/* Data Preview Section */}
      {data && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-emerald-900 mb-4">
            Data Preview
          </h3>
          <div className="overflow-x-auto border border-emerald-100 rounded-xl shadow-sm">
            <table className="min-w-full divide-y divide-emerald-100">
              <thead className="bg-emerald-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                    Response Data
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-emerald-50">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadCsv;
