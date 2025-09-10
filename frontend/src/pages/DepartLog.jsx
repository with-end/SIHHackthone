// DepartmentLogin.jsx
import React, { useState } from "react";

export default function DepartmentLogin() {
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const departments = [
    { value: "", label: "Select Department" },
    { value: "main-office", label: "Main Office" },
    { value: "health", label: "Health Department" },
    { value: "sanitation", label: "Sanitation Department" },
  ];

  const categories = [
    { value: "", label: "Select Category" },
    { value: "head", label: "Department Head" },
    { value: "officer", label: "Other Officers" },
  ];

  const handleLogin = () => {
    if (!selectedDept || !selectedCategory || !username || !password) {
      alert("Please fill all fields");
      return;
    }
    // Add your login logic here
    alert(
      `Logging in as ${selectedCategory} of ${selectedDept} with username: ${username}`
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "70vh",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: "#f7f9fc",
        padding: "2rem",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "2rem",
            color: "#2c3e50",
          }}
        >
          Department Login
        </h2>

        {/* Department Dropdown */}
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          style={{
            padding: "0.6rem 1rem",
            fontSize: "1rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginBottom: "1rem",
            width: "100%",
            outline: "none",
          }}
        >
          {departments.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>

        {/* Category Dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: "0.6rem 1rem",
            fontSize: "1rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginBottom: "1rem",
            width: "100%",
            outline: "none",
          }}
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        {/* Username */}
        <input
          type="text"
          placeholder="Username or Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            padding: "0.6rem 1rem",
            fontSize: "1rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginBottom: "1rem",
            width: "100%",
            outline: "none",
          }}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: "0.6rem 1rem",
            fontSize: "1rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginBottom: "2rem",
            width: "100%",
            outline: "none",
          }}
        />

        {/* Login Button */}
        <button
          onClick={handleLogin}
          style={{
            padding: "0.7rem 2rem",
            fontSize: "1.1rem",
            backgroundColor: "#3498db",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            transition: "all 0.2s",
            width: "100%",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#2980b9")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#3498db")
          }
        >
          Login
        </button>
      </div>
    </div>
  );
}
