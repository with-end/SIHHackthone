// src/pages/Login.jsx
import React, { useState } from "react";

export default function Login({ mode }) {
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
    department: "",
    category: "",
  });

  const departments = [
    { value: "health", label: "Health Department" },
    { value: "sanitation", label: "Sanitation Department" },
    { value: "education", label: "Education Department" },
  ];

  const categories = [
    { value: "head", label: "Head Officer" },
    { value: "officer", label: "Other Officer" },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login Data:", formData, "Mode:", mode);
    alert(`Login successful for ${mode}`);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-indigo-700">
          {mode === "office" ? "🏢 Office Login" : "🏬 Department Login"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              User ID
            </label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              required
              className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
              placeholder="Enter your user ID"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
              placeholder="Enter your password"
            />
          </div>

          {/* Extra Fields only for Department */}
          {mode === "department" && (
            <>
              {/* Department Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Officer Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
