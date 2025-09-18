import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, FileText, Bell, LogOut, User } from "lucide-react";
import { useTranslation } from "react-i18next"; 

export default function Navbar({isLoggedIn , mode , onLogout , variable }) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  

  const handleChange = (e) => {
    const department = e.target.value;
    if (department) {
      navigate(`/department/${department}`);
    }
  };

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <nav className="bg-white shadow-md border-b-4 border-blue-600 px-6 py-4 flex justify-between items-center">
      {/* Logo + Title */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">🏛️</span>
        <h1 className="text-xl font-bold text-blue-800">
          {mode === "office" ? "Admin Dashboard" : "Department Dashboard" }
        </h1>
      </div>

      {/* Right Side Menu */}
      <div>
        {isLoggedIn ? (
          <div className="flex gap-4">
            <Link
              to={`/${mode=="office" ? "office" : "department/x"}/login`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Login
            </Link>
            <Link
              to="/"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              ComeOut
            </Link>
          </div>
        ) : (
          <ul className="flex items-center gap-6 text-gray-700 font-medium">
            <Link
              to="/"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              ComeOut
            </Link>
            <li>
              <Link
                to={mode=="office" ? `/${mode}` : `/${mode}/${variable}` }
                className="flex items-center gap-1 hover:text-blue-700"
              >
                <Home size={18} /> Home
              </Link>
            </li>

            {/* ✅ Show Department Dropdown only in OFFICE mode */}
            {mode === "office" && (
              <li>
                <select
                  name="department"
                  defaultValue=""
                  onChange={handleChange}
                  className="w-full p-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Department</option>
                  <option value="electricity">⚡ Electricity</option>
                  <option value="roads">🛣️ Roads</option>
                  <option value="water">💧 Water Supply</option>
                  <option value="sanitation">🧹 Sanitation</option>
                  <option value="others">📌 Others</option>
                </select>
              </li>
            )}

            <li>
              <Link
                to={mode=="office" ? `/${mode}/map` :  `/${mode}/${variable}/map`}
                className="flex items-center gap-1 hover:text-blue-700"
              >
                <FileText size={18} /> Map
              </Link>
            </li>
            <li>
              <Link
                to={mode=="office" ? `/${mode}/notices` : `/${mode}/${variable}/notices`}
                className="flex items-center gap-1 hover:text-blue-700"
              >
                <Bell size={18} /> Notice
              </Link>
            </li>
            <li>
              <Link
                to={mode=="office" ? `/${mode}/officers` : `/${mode}/${variable}/officers`}
                className="flex items-center gap-1 hover:text-blue-700"
              >
                <User size={18} /> Officer Info
              </Link>
            </li>
            <li>
              <button
                onClick={onLogout}
                className="flex items-center gap-1 text-red-600 hover:text-red-700"
              >
                <LogOut size={18} /> Logout
              </button>
              <select
                onChange={changeLanguage}
                defaultValue="en"
                className="mt-2 w-full border px-2 py-1 rounded bg-white text-indigo-600 font-medium"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="ta">தமிழ்</option>
                <option value="bn">বাংলা</option>
              </select>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
}
