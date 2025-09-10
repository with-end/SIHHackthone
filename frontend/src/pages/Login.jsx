import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api/officer/login";

export default function NagarPalikaLogin() {
  const [loginType, setLoginType] = useState(""); // "main" or "department"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [category, setCategory] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginType) return alert("Please select login type");

    try {
      const body =
        loginType === "main"
          ? { email: username, password, role: "main" }
          : { email: username, password, department, category, role: "department" };

      const res = await axios.post(API_URL, body);

      // Save token if using JWT
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      if (loginType === "main") navigate("/main-office-dashboard");
      else navigate("/department-dashboard");
    } catch (err) {
      console.error(err);
      alert("Login failed. Please check credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 p-4">
      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-md p-8">
        <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-6">
          NagarPalika Login
        </h2>

        {/* Login type selection */}
        {!loginType && (
          <div className="flex flex-col space-y-4 mb-6">
            <button
              onClick={() => setLoginType("main")}
              className="w-full bg-indigo-500 text-white py-2 rounded-xl shadow hover:bg-indigo-600 font-semibold"
            >
              Main Office
            </button>
            <button
              onClick={() => setLoginType("department")}
              className="w-full bg-purple-500 text-white py-2 rounded-xl shadow hover:bg-purple-600 font-semibold"
            >
              Department
            </button>
          </div>
        )}

        {/* Login form */}
        {loginType && (
          <form className="space-y-4" onSubmit={handleLogin}>
            {/* Department fields appear only if loginType === "department" */}
            {loginType === "department" && (
              <>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                    <option value="PublicWorks">Public Works</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Admin">Admin</option>
                    <option value="Staff">Staff</option>
                    <option value="Field">Field Officer</option>
                  </select>
                </div>
              </>
            )}

            {/* Username */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                {loginType === "main" ? "Main Office User ID / Email" : "User ID / Email"}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded-lg"
                placeholder="Enter your username"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-lg"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2 rounded-xl shadow hover:from-indigo-600 hover:to-purple-600 font-semibold"
            >
              Login
            </button>

            {/* Back button */}
            <button
              type="button"
              onClick={() => setLoginType("")}
              className="w-full mt-2 border border-gray-300 text-gray-700 py-2 rounded-xl hover:bg-gray-100 font-semibold"
            >
              Back to Selection
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
